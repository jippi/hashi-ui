package cluster

import (
	"sync"
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedStats = "NOMAD_FETCHED_CLUSTER_STATISTICS"
	WatchStats   = "NOMAD_WATCH_CLUSTER_STATISTICS"
	UnwatchStats = "NOMAD_UNWATCH_CLUSTER_STATISTICS"
)

type stats struct {
	action structs.Action
	client *api.Client
}

func NewStats(action structs.Action, client *api.Client) *stats {
	return &stats{
		action: action,
		client: client,
	}
}

func (w *stats) Do(send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan interface{}) (structs.Response, error) {
	ticker := time.NewTicker(2 * time.Second) // fetch stats once in a while
	timer := time.NewTimer(0 * time.Second)   // fetch stats right away

	for {
		select {
		case <-destroyCh:
			return structs.NewNoopResponse()

		case <-subscribeCh:
			return structs.NewNoopResponse()

		case <-timer.C:
			w.work(w.client, send, subscribeCh)

		case <-ticker.C:
			w.work(w.client, send, subscribeCh)
		}
	}
}

func (w *stats) work(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}) {
	c, err := collect(client, subscribeCh)
	if err != nil {
		return
	}

	send <- &structs.Action{Type: fetchedStats, Payload: c}
}

func (w *stats) Key() string {
	return "/cluster/stats"
}

func (w *stats) IsMutable() bool {
	return false
}

func (w *stats) BackendType() string {
	return "nomad"
}

// task is meta data about a client when passed into the cluster statistics worker
type task struct {
	NodeID   string
	NodeName string
}

// result is struct for the result of a finished client statistics task
type result struct {
	CPUCores        int
	CPUAllocatedMHz int64
	CPUTotalMHz     int64
	CPUIdleTime     float64
	MemoryUsed      uint64
	MemoryTotal     uint64
	MemoryAllocated int64
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
	Clients         int
	CPUAllocatedMHz int64
	CPUTotalMHz     int64
	CPUCores        int
	CPUIdleTime     float64
	MemoryUsed      uint64
	MemoryTotal     uint64
	MemoryAllocated int64
}

func worker(payload *workerPayload) {
	for {
		select {
		case task, ok := <-payload.taskCh:
			if !ok {
				return // channel closed
			}

			node, _, err := payload.client.Nodes().Info(task.NodeID, nil)
			if err != nil {
				payload.wg.Done()
				continue
			}

			if node.Drain || node.Status != "ready" {
				payload.wg.Done()
				continue // skip drained nodes
			}

			stats, err := payload.client.Nodes().Stats(task.NodeID, nil)
			if err != nil {
				payload.wg.Done()
				continue
			}

			// We do this per node, as this _does_ return the stats, /v1/allocations does _not_
			allocations, _, err := payload.client.Nodes().Allocations(task.NodeID, nil)
			if err != nil {
				payload.wg.Done()
				continue
			}

			// fetch reservations for each allocation

			taskResult := &result{}
			taskResult.CPUCores = len(stats.CPU)
			taskResult.CPUIdleTime = 0
			taskResult.CPUAllocatedMHz = 0
			taskResult.CPUTotalMHz = 0
			taskResult.MemoryUsed = 0
			taskResult.MemoryTotal = 0
			taskResult.MemoryAllocated = 0

			for _, allocation := range allocations {
				if allocation.DesiredStatus != "run" || allocation.ClientStatus != "running" {
					continue
				}

				for _, resources := range allocation.TaskResources {
					taskResult.MemoryAllocated += int64(*resources.MemoryMB)
					taskResult.CPUAllocatedMHz += int64(*resources.CPU)
				}
			}
			for _, core := range stats.CPU {
				taskResult.CPUIdleTime = taskResult.CPUIdleTime + core.Idle
			}

			taskResult.CPUTotalMHz += int64(*node.Resources.CPU)

			if stats.Memory != nil {
				taskResult.MemoryUsed = stats.Memory.Used
				taskResult.MemoryTotal = stats.Memory.Total
			}

			payload.resultCh <- taskResult
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
		aggResult.CPUAllocatedMHz += elem.CPUAllocatedMHz
		aggResult.CPUTotalMHz += elem.CPUTotalMHz
		aggResult.CPUCores += elem.CPUCores
		aggResult.MemoryUsed += elem.MemoryUsed
		aggResult.MemoryTotal += elem.MemoryTotal
		aggResult.MemoryAllocated += elem.MemoryAllocated
	}

	return aggResult, nil
}
