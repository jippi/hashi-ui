package cluster

import (
	"sync"
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedClusterStatistics = "NOMAD_FETCHED_CLUSTER_STATISTICS"
	WatchClusterStatistics   = "NOMAD_WATCH_CLUSTER_STATISTICS"
	UnwatchClusterStatistics = "NOMAD_UNWATCH_CLUSTER_STATISTICS"
)

type stats struct {
	action structs.Action
}

func NewStats(action structs.Action) *stats {
	return &stats{
		action: action,
	}
}

func (w *stats) Do(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan struct{}) (*structs.Action, error) {
	ticker := time.NewTicker(5 * time.Second) // fetch stats once in a while
	timer := time.NewTimer(0 * time.Second)   // fetch stats right away

	for {
		select {
		case <-destroyCh:
			return nil, nil

		case <-subscribeCh:
			return nil, nil

		case <-timer.C:
			w.work(client, send, subscribeCh)

		case <-ticker.C:
			w.work(client, send, subscribeCh)
		}

	}
}

func (w *stats) work(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}) {
	c, err := collect(client, subscribeCh)
	if err != nil {
		return
	}

	send <- &structs.Action{Type: fetchedClusterStatistics, Payload: c}
}

func (w *stats) Key() string {
	return "/cluster/stats"
}

func (w *stats) IsMutable() bool {
	return false
}

// task is meta data about a client when passed into the cluster statistics worker
type task struct {
	NodeID   string
	NodeName string
}

// result is struct for the result of a finished client statistics task
type result struct {
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

// workerPayload is the payload for processing a single collection of client statistics
type workerPayload struct {
	quitCh   <-chan interface{}
	taskCh   <-chan *task
	resultCh chan *result
	client   *api.Client
	wg       *sync.WaitGroup
}

// aggrResult is the final aggregated result for all clients collected resources
type aggrResult struct {
	Clients     int
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

func worker(payload *workerPayload) {
	for {
		select {
		case task, ok := <-payload.taskCh:
			if !ok {
				return // channel closed
			}

			stats, err := payload.client.Nodes().Stats(task.NodeID, nil)
			if err != nil {
				payload.wg.Done()
				continue
			}

			taksResult := &result{}
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

			payload.resultCh <- taksResult
			payload.wg.Done()

		case <-payload.quitCh:
			return
		}
	}
}

func collect(client *api.Client, quitCh chan interface{}) (*aggrResult, error) {
	nodes, _, err := client.Nodes().List(nil)
	if err != nil {
		return nil, err
	}

	taskCh := make(chan *task, len(nodes))
	resultCh := make(chan *result, len(nodes))

	var wg sync.WaitGroup

	payload := &workerPayload{
		client:   client,
		quitCh:   quitCh,
		resultCh: resultCh,
		taskCh:   taskCh,
		wg:       &wg,
	}

	for i := 0; i <= len(nodes); i++ {
		go worker(payload)
	}

	for _, node := range nodes {
		if node.Status != "ready" {
			continue
		}

		wg.Add(1)
		taskCh <- &task{NodeID: node.ID, NodeName: node.Name}
	}

	wg.Wait()

	close(taskCh)
	close(resultCh)

	aggResult := &aggrResult{}
	for elem := range resultCh {
		aggResult.Clients++

		aggResult.CPUIdleTime += elem.CPUIdleTime
		aggResult.CPUCores += elem.CPUCores
		aggResult.MemoryUsed += elem.MemoryUsed
		aggResult.MemoryTotal += elem.MemoryTotal
	}

	return aggResult, nil
}
