package nomad

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/hashicorp/nomad/api"
	nstructs "github.com/hashicorp/nomad/nomad/structs"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	waitTime = 1 * time.Minute
)

// RegionClients ...
type RegionClients map[string]*Region

// Region keeps track of the Region state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the Region server.
type Region struct {
	Client  *api.Client
	Config  *config.Config
	regions []string
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
func NewRegion(c *config.Config, client *api.Client) (*Region, error) {
	return &Region{
		Client:  client,
		Config:  c,
		regions: make([]string, 0),
	}, nil
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
	nodes, _, err := n.Client.Nodes().List(nil)
	if err != nil {
		logger.Warningf("Could not fetch nodes: %s", err)
	}

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

	// n.clusterStatistics = aggResult
	// n.broadcastChannels.clusterStatistics.Update(&structs.Action{Type: fetchedClusterStatistics, Payload: aggResult})
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
