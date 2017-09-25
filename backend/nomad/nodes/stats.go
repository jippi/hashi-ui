package nodes

import (
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedClientStats = "NOMAD_FETCHED_CLIENT_STATS"
	WatchStats         = "NOMAD_WATCH_CLIENT_STATS"
	UnwatchStats       = "NOMAD_UNWATCH_CLIENT_STATS"
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

//func (w *stats) Do() (*structs.Response, error) {
func (w *stats) Do(send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan struct{}) (*structs.Response, error) {
	ticker := time.NewTicker(5 * time.Second) // fetch stats once in a while
	timer := time.NewTimer(0 * time.Second)   // fetch stats right away
	NodeID := w.action.Payload.(string)

	for {
		select {
		case <-destroyCh:
			return nil, nil

		case <-subscribeCh:
			return nil, nil

		case <-timer.C:
			w.work(w.client, send, subscribeCh, NodeID)

		case <-ticker.C:
			w.work(w.client, send, subscribeCh, NodeID)
		}
	}
}

func (w *stats) work(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}, NodeID string) {
	stats, err := client.Nodes().Stats(NodeID, nil)
	if err != nil {
		return
	}

	node, _, err := client.Nodes().Info(NodeID, nil)
	if err != nil {
		return
	}

	allocations, _, err := client.Nodes().Allocations(NodeID, nil)
	if err != nil {
		return
	}

	taksResult := &result{}
	taksResult.CPUCores = len(stats.CPU)
	taksResult.CPUIdleTime = 0
	taksResult.CPUAllocatedMHz = 0
	taksResult.CPUTotalMHz = 0
	taksResult.MemoryUsed = 0
	taksResult.MemoryTotal = 0
	taksResult.MemoryAllocated = 0

	for _, allocation := range allocations {
		if allocation.DesiredStatus != "run" {
			continue
		}

		for _, resources := range allocation.TaskResources {
			taksResult.MemoryAllocated += int64(*resources.MemoryMB)
			taksResult.CPUAllocatedMHz += int64(*resources.CPU)
		}
	}

	for _, core := range stats.CPU {
		taksResult.CPUIdleTime = taksResult.CPUIdleTime + core.Idle
	}

	taksResult.CPUTotalMHz += int64(*node.Resources.CPU)

	if stats.Memory != nil {
		taksResult.MemoryUsed = stats.Memory.Used
		taksResult.MemoryTotal = stats.Memory.Total
	}

	taksResult.Uptime = stats.Uptime
	taksResult.HostDiskStats = stats.DiskStats
	taksResult.nodeStats = *stats

	send <- &structs.Action{Type: fetchedClientStats, Payload: &taksResult}
}

func (w *stats) Key() string {
	return "/node/" + w.action.Payload.(string) + "/stats"
}

func (w *stats) IsMutable() bool {
	return false
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
	nodeStats       api.HostStats
	Uptime          uint64
	HostDiskStats   []*api.HostDiskStats
}
