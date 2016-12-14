package main

import (
	"sync"
	"time"
)

type ClusterStatisticsTask struct {
	NodeID   string
	NodeName string
}

type ClusterStatisticsResult struct {
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

type ClusterStatisticsWorkerPayload struct {
	quit    <-chan bool
	tasks   <-chan *ClusterStatisticsTask
	results chan *ClusterStatisticsResult
	n       *Nomad
	wg      *sync.WaitGroup
}

type ClusterStatisticsAggregatedResult struct {
	Clients     int
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

func worker(payload *ClusterStatisticsWorkerPayload) {
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

			taksResult := &ClusterStatisticsResult{}
			taksResult.CPUCores = len(stats.CPU)
			taksResult.CPUIdleTime = 0

			for _, core := range stats.CPU {
				taksResult.CPUIdleTime = taksResult.CPUIdleTime + core.Idle
			}

			taksResult.MemoryUsed = stats.Memory.Used
			taksResult.MemoryTotal = stats.Memory.Total

			payload.results <- taksResult

		case <-payload.quit:
			return
		}
	}
}

func (n *Nomad) collectAggregateClusterStatistics() {
	nodes := n.nodes

	quit := make(chan bool)
	tasks := make(chan *ClusterStatisticsTask, len(nodes))
	results := make(chan *ClusterStatisticsResult, len(nodes))

	var wg sync.WaitGroup

	payload := &ClusterStatisticsWorkerPayload{
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
		tasks <- &ClusterStatisticsTask{NodeID: node.ID, NodeName: node.Name}
	}

	// end of tasks. the workers should quit afterwards
	// use "close(quit)", if you do not want to wait for the remaining tasks
	close(tasks)

	// wait for all workers to shut down properly
	logger.Debugf("[ClusterStatistics] waiting for tasks to finish")
	wg.Wait()

	// Make sure the result channel range will finish at end
	close(results)

	aggResult := &ClusterStatisticsAggregatedResult{}

	logger.Debugf("[ClusterStatistics] consuming results channel")
	for elem := range results {
		aggResult.Clients++

		aggResult.CPUIdleTime += elem.CPUIdleTime
		aggResult.CPUCores += elem.CPUCores
		aggResult.MemoryUsed += elem.MemoryUsed
		aggResult.MemoryTotal += elem.MemoryTotal
	}

	logger.Infof("[ClusterStatistics] Servers: %d, Total Cores: %d Total Idle CPU: %f Total Used RAM: %d Total RAM: %d",
		aggResult.Clients,
		aggResult.CPUCores,
		aggResult.CPUIdleTime,
		aggResult.MemoryUsed,
		aggResult.MemoryTotal,
	)

	n.clusterStatistics = aggResult
	n.BroadcastChannels.clusterStatistics.Update(&Action{Type: fetchedClusterStatistics, Payload: aggResult})
}

func (n *Nomad) watchAggregateClusterStatistics() {
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
