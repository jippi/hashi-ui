package nomad

import (
	"errors"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/hashicorp/nomad/api"
	nstructs "github.com/hashicorp/nomad/nomad/structs"
	observer "github.com/imkira/go-observer"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	waitTime = 1 * time.Minute
)

// RegionChannels ...
type RegionChannels map[string]*RegionBroadcastChannels

// RegionClients ...
type RegionClients map[string]*Region

// RegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type RegionBroadcastChannels struct {
	allocations        observer.Property
	allocationsShallow observer.Property
	clusterStatistics  observer.Property
	deployments        observer.Property
	evaluations        observer.Property
	jobs               observer.Property
	members            observer.Property
	nodes              observer.Property
}

// Region keeps track of the Region state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the Region server.
type Region struct {
	allocations        []*api.AllocationListStub
	allocationsShallow []*api.AllocationListStub // with TaskStates removed
	broadcastChannels  *RegionBroadcastChannels
	Client             *api.Client
	clusterStatistics  *NomadRegionStatisticsAggregatedResult
	deployments        []*api.Deployment
	Config             *config.Config
	evaluations        []*api.Evaluation
	jobs               []*api.JobListStub
	members            []*AgentMemberWithID
	nodes              []*api.NodeListStub
	regions            []string
}

// CreateRegionClient derp
func CreateRegionClient(c *config.Config, region string) (*api.Client, error) {
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

// NewRegion configures the Nomad API client and initializes the internal state.
func NewRegion(c *config.Config, client *api.Client, channels *RegionBroadcastChannels) (*Region, error) {
	return &Region{
		allocations:        make([]*api.AllocationListStub, 0),
		allocationsShallow: make([]*api.AllocationListStub, 0),
		broadcastChannels:  channels,
		Client:             client,
		clusterStatistics:  &NomadRegionStatisticsAggregatedResult{},
		Config:             c,
		deployments:        make([]*api.Deployment, 0),
		evaluations:        make([]*api.Evaluation, 0),
		jobs:               make([]*api.JobListStub, 0),
		members:            make([]*AgentMemberWithID, 0),
		nodes:              make([]*api.NodeListStub, 0),
		regions:            make([]string, 0),
	}, nil
}

// StartWatchers derp
func (n *Region) StartWatchers() {
	go n.watchAggregateClusterStatistics()
	go n.watchAllocs()
	go n.watchAllocsShallow()
	go n.watchDeployments()
	go n.watchEvals()
	go n.watchJobs()
	go n.watchNodes()
}

func (n *Region) watchDeployments() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: n.Config.NomadAllowStale}

	for {
		deployments, meta, err := n.Client.Deployments().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch deployments: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex <= localWaitIndex {
			logger.Debugf("deployments index is unchanged (%d <= %d)", remoteWaitIndex, localWaitIndex)
			continue
		}

		logger.Debugf("deployments index is changed (%d <> %d)", remoteWaitIndex, localWaitIndex)

		n.deployments = deployments
		n.broadcastChannels.deployments.Update(&structs.Action{Type: fetchedDeployments, Payload: deployments, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: n.Config.NomadAllowStale}
	}
}

func (n *Region) watchAllocs() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: n.Config.NomadAllowStale}

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
		n.broadcastChannels.allocations.Update(&structs.Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: n.Config.NomadAllowStale}
	}
}

func (n *Region) watchAllocsShallow() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: n.Config.NomadAllowStale}

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
		n.broadcastChannels.allocationsShallow.Update(&structs.Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})

		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: n.Config.NomadAllowStale}
	}
}

// ClientNameSorter sorts planets by name
type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }

func (n *Region) watchNodes() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: n.Config.NomadAllowStale}
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
		n.broadcastChannels.nodes.Update(&structs.Action{Type: fetchedNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: n.Config.NomadAllowStale}
	}
}

func (n *Region) watchEvals() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: n.Config.NomadAllowStale}
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
		n.broadcastChannels.evaluations.Update(&structs.Action{Type: fetchedEvals, Payload: evaluations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: n.Config.NomadAllowStale}
	}
}

func (n *Region) watchJobs() {
	q := &api.QueryOptions{WaitIndex: 1, AllowStale: n.Config.NomadAllowStale}
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
		n.broadcastChannels.jobs.Update(&structs.Action{Type: fetchedJobs, Payload: jobs, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex, AllowStale: n.Config.NomadAllowStale}
	}
}

func (n *Region) updateJob(job *api.Job) (*structs.Action, error) {
	if n.Config.NomadReadOnly {
		logger.Errorf("Unable to run job: NomadReadOnly is set to true")
		return &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is set to read-only"}, errors.New("Nomad is in read-only mode")
	}

	logger.Infof("Started run job with id: %s", *job.ID)

	_, _, err := n.Client.Jobs().Register(job, nil)
	if err != nil {
		logger.Errorf("connection: unable to register job : %s", err)
		return &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Connection: unable to register job : %s", err)}, err
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "The job has been successfully updated."}, nil
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
	n       *Region
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

func (n *Region) collectAggregateClusterStatistics() {
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

	// spawn a worker per node
	for i := 0; i <= len(nodes); i++ {
		wg.Add(1)
		go worker(payload)
	}

	// put the workers to... work
	for _, node := range nodes {
		// Only monitor stats on "ready" nodes
		if node.Status != nstructs.NodeStatusReady {
			continue
		}

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
	n.broadcastChannels.clusterStatistics.Update(&structs.Action{Type: fetchedClusterStatistics, Payload: aggResult})
}

func (n *Region) watchAggregateClusterStatistics() {
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
