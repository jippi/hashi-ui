package main

import (
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/hashicorp/nomad/api"
	observer "github.com/imkira/go-observer"
)

const (
	waitTime = 1 * time.Minute
)

// NomadRegionChannels ...
type NomadRegionChannels map[string]*NomadRegionBroadcastChannels

// NomadRegionClients ...
type NomadRegionClients map[string]*NomadRegion

// NomadRegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type NomadRegionBroadcastChannels struct {
	allocations        observer.Property
	allocationsShallow observer.Property
	evaluations        observer.Property
	jobs               observer.Property
	members            observer.Property
	nodes              observer.Property
	clusterStatistics  observer.Property
}

// NomadRegion keeps track of the NomadRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the NomadRegion server.
type NomadRegion struct {
	Client             *api.Client
	Config             *Config
	broadcastChannels  *NomadRegionBroadcastChannels
	regions            []string
	allocations        []*api.AllocationListStub
	allocationsShallow []*api.AllocationListStub // with TaskStates removed
	clusterStatistics  *NomadRegionStatisticsAggregatedResult
	evaluations        []*api.Evaluation
	jobs               []*api.JobListStub
	members            []*AgentMemberWithID
	nodes              []*api.NodeListStub
}

// CreateNomadRegionClient derp
func CreateNomadRegionClient(c *Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.NomadAddress
	config.WaitTime = waitTime
	config.Region = region
	config.TLSConfig = &api.TLSConfig{
		CACert:     c.NomadCACert,
		ClientCert: c.NomadClientCert,
		ClientKey:  c.NomadClientKey,
		Insecure:   c.NomadSkipVerify,
	}

	return api.NewClient(config)
}

// NewNomadRegion configures the Nomad API client and initializes the internal state.
func NewNomadRegion(c *Config, client *api.Client, channels *NomadRegionBroadcastChannels) (*NomadRegion, error) {
	return &NomadRegion{
		Client:             client,
		Config:             c,
		broadcastChannels:  channels,
		regions:            make([]string, 0),
		allocations:        make([]*api.AllocationListStub, 0),
		allocationsShallow: make([]*api.AllocationListStub, 0),
		clusterStatistics:  &NomadRegionStatisticsAggregatedResult{},
		evaluations:        make([]*api.Evaluation, 0),
		jobs:               make([]*api.JobListStub, 0),
		members:            make([]*AgentMemberWithID, 0),
		nodes:              make([]*api.NodeListStub, 0),
	}, nil
}

// StartWatchers derp
func (n *NomadRegion) StartWatchers() {
	go n.watchAllocs()
	go n.watchAllocsShallow()
	go n.watchEvals()
	go n.watchJobs()
	go n.watchNodes()
	go n.watchAggregateClusterStatistics()
}

func (n *NomadRegion) watchAllocs() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: true}

	for {
		allocations, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex <= localWaitIndex {
			logger.Debugf("Allocations index is unchanged (%d <= %d)", remoteWaitIndex, localWaitIndex)
			continue
		}

		logger.Debugf("Allocations index is changed (%d <> %d)", remoteWaitIndex, localWaitIndex)

		n.allocations = allocations
		n.broadcastChannels.allocations.Update(&Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: true}
	}
}

func (n *NomadRegion) watchAllocsShallow() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: true}

	for {
		allocations, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex <= localWaitIndex {
			logger.Debugf("Allocations (shallow) index is unchanged (%d <= %d)", remoteWaitIndex, localWaitIndex)
			continue
		}

		logger.Debugf("Allocations (shallow) index is changed (%d <> %d)", remoteWaitIndex, localWaitIndex)

		for i := range allocations {
			allocations[i].TaskStates = make(map[string]*api.TaskState)
		}

		n.allocationsShallow = allocations
		n.broadcastChannels.allocationsShallow.Update(&Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})

		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: true}
	}
}

// ClientNameSorter sorts planets by name
type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }

func (n *NomadRegion) watchNodes() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: true}
	for {
		nodes, meta, err := n.Client.Nodes().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch nodes: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex <= localWaitIndex {
			logger.Debugf("Nodes wait-index is unchanged (%d <= %d)", remoteWaitIndex, localWaitIndex)
			continue
		}

		logger.Debugf("Nodes index is changed (%d <> %d)", remoteWaitIndex, localWaitIndex)

		// http://stackoverflow.com/a/28999886
		sort.Sort(ClientNameSorter(nodes))

		n.nodes = nodes
		n.broadcastChannels.nodes.Update(&Action{Type: fetchedNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: true}
	}
}

func (n *NomadRegion) watchEvals() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: true}
	for {
		evaluations, meta, err := n.Client.Evaluations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch evaluations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex <= localWaitIndex {
			logger.Debugf("Evaluations wait-index is unchanged (%d <= %d)", remoteWaitIndex, localWaitIndex)
			continue
		}

		logger.Debugf("Evaluations index is changed (%d <> %d)", remoteWaitIndex, localWaitIndex)

		n.evaluations = evaluations
		n.broadcastChannels.evaluations.Update(&Action{Type: fetchedEvals, Payload: evaluations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: true}
	}
}

func (n *NomadRegion) watchJobs() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: true}
	for {
		jobs, meta, err := n.Client.Jobs().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch jobs: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex <= localWaitIndex {
			logger.Debugf("Jobs wait-index is unchanged (%d <= %d)", remoteWaitIndex, localWaitIndex)
			continue
		}

		logger.Debugf("Jobs index is changed (%d <> %d)", remoteWaitIndex, localWaitIndex)

		n.jobs = jobs
		n.broadcastChannels.jobs.Update(&Action{Type: fetchedJobs, Payload: jobs, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: true}
	}
}

func (n *NomadRegion) updateJob(job *api.Job) (*Action, error) {
	if n.Config.NomadReadOnly {
		logger.Errorf("Unable to run job: NomadReadOnly is set to true")
		return &Action{Type: errorNotification, Payload: "The backend server is set to read-only"}, errors.New("Nomad is in read-only mode")
	}

	logger.Infof("Started run job with id: %s", job.ID)

	_, _, err := n.Client.Jobs().Register(job, nil)
	if err != nil {
		logger.Errorf("connection: unable to register job : %s", err)
		return &Action{Type: errorNotification, Payload: fmt.Sprintf("Connection: unable to register job : %s", err)}, err
	}

	return &Action{Type: successNotification, Payload: "The job has been successfully updated."}, nil
}

// NomadRegionStatisticsTask is meta data about a client when passed into the cluster statistics worker
type NomadRegionStatisticsTask struct {
	NodeID   string
	NodeName string
}

// NomadRegionStatisticsResult is struct for the result of a finished client statistics task
type NomadRegionStatisticsResult struct {
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

// NomadRegionStatisticsWorkerPayload is the payload for processing a single collection of client statistics
type NomadRegionStatisticsWorkerPayload struct {
	quit    <-chan bool
	tasks   <-chan *NomadRegionStatisticsTask
	results chan *NomadRegionStatisticsResult
	n       *NomadRegion
	wg      *sync.WaitGroup
}

// NomadRegionStatisticsAggregatedResult is the final aggregated result for all clients collected resources
type NomadRegionStatisticsAggregatedResult struct {
	Clients     int
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

func worker(payload *NomadRegionStatisticsWorkerPayload) {
	defer payload.wg.Done()

	for {
		select {
		case task, ok := <-payload.tasks:
			if !ok {
				return
			}

			logger.Debugf("[ClusterStatistics] Fetching statistics for %s (ID: %s)", task.NodeName, task.NodeID[0:8])
			stats, err := payload.n.Client.Nodes().Stats(task.NodeID, nil)
			if err != nil {
				logger.Errorf("[ClusterStatistics] Unable to fetch node stats for %s (%s)", task.NodeName, err)
				return
			}

			taksResult := &NomadRegionStatisticsResult{}
			taksResult.CPUCores = len(stats.CPU)
			taksResult.CPUIdleTime = 0
			taksResult.MemoryUsed = 0
			taksResult.MemoryTotal = 0

			for _, core := range stats.CPU {
				taksResult.CPUIdleTime = taksResult.CPUIdleTime + core.Idle
			}

			if stats.Memory != nil {
				taksResult.MemoryUsed = stats.Memory.Used
				taksResult.MemoryTotal = stats.Memory.Total
			}

			payload.results <- taksResult

		case <-payload.quit:
			return
		}
	}
}

func (n *NomadRegion) collectAggregateClusterStatistics() {
	nodes := n.nodes

	quit := make(chan bool)
	tasks := make(chan *NomadRegionStatisticsTask, len(nodes))
	results := make(chan *NomadRegionStatisticsResult, len(nodes))

	var wg sync.WaitGroup

	payload := &NomadRegionStatisticsWorkerPayload{
		tasks:   tasks,
		quit:    quit,
		results: results,
		n:       n,
		wg:      &wg,
	}

	// spawn 10 workers
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go worker(payload)
	}

	// put the workers to... work
	for _, node := range nodes {
		tasks <- &NomadRegionStatisticsTask{NodeID: node.ID, NodeName: node.Name}
	}

	// end of tasks. the workers should quit afterwards
	// use "close(quit)", if you do not want to wait for the remaining tasks
	close(tasks)

	// wait for all workers to shut down properly
	logger.Debugf("[ClusterStatistics] waiting for tasks to finish")
	wg.Wait()

	// Make sure the result channel range will finish at end
	close(results)

	aggResult := &NomadRegionStatisticsAggregatedResult{}

	logger.Debugf("[ClusterStatistics] consuming results channel")
	for elem := range results {
		aggResult.Clients++

		aggResult.CPUIdleTime += elem.CPUIdleTime
		aggResult.CPUCores += elem.CPUCores
		aggResult.MemoryUsed += elem.MemoryUsed
		aggResult.MemoryTotal += elem.MemoryTotal
	}

	logger.Debugf("[ClusterStatistics] Servers: %d, Total Cores: %d Total Idle CPU: %f Total Used RAM: %d Total RAM: %d",
		aggResult.Clients,
		aggResult.CPUCores,
		aggResult.CPUIdleTime,
		aggResult.MemoryUsed,
		aggResult.MemoryTotal,
	)

	n.clusterStatistics = aggResult
	n.broadcastChannels.clusterStatistics.Update(&Action{Type: fetchedClusterStatistics, Payload: aggResult})
}

func (n *NomadRegion) watchAggregateClusterStatistics() {
	ticker := time.NewTicker(5 * time.Second)
	quit := make(chan struct{})

	n.collectAggregateClusterStatistics()

	go func() {
		defer close(quit)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				n.collectAggregateClusterStatistics()

			case <-quit:
				return
			}
		}
	}()
}
