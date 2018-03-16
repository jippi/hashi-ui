package nodes

import (
	"sort"
	"sync"
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchList   = "NOMAD_WATCH_NODES"
	UnwatchList = "NOMAD_UNWATCH_NODES"
	fetchedList = "NOMAD_FETCHED_NODES"
)

type customClient struct {
	*api.NodeListStub
	Stats map[string]interface{}
}

type list struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
	last   []*api.NodeListStub
}

func NewList(action structs.Action, client *api.Client, query *api.QueryOptions) *list {
	if query != nil {
		query.WaitTime = 10 * time.Second
	}

	return &list{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *list) Do() (*structs.Response, error) {
	nodes, meta, err := w.client.Nodes().List(w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		structs.NewResponseWithIndex(fetchedList, nodeStats(w.client, w.last), meta.LastIndex)
	}

	// http://stackoverflow.com/a/28999886
	// TODO: refactor to Go 1.9 sorting !
	sort.Sort(ClientNameSorter(nodes))

	w.last = nodes

	return structs.NewResponseWithIndex(fetchedList, nodeStats(w.client, nodes), meta.LastIndex)
}

func (w *list) Key() string {
	return "/nodes/list"
}

func (w *list) IsMutable() bool {
	return false
}

func (w *list) BackendType() string {
	return "nomad"
}

func nodeStats(client *api.Client, nodes []*api.NodeListStub) []*customClient {
	var wg sync.WaitGroup
	res := make([]*customClient, len(nodes))

	for i, node := range nodes {
		wg.Add(1)
		go func(i int, node *api.NodeListStub) {
			defer wg.Done()

			res[i] = &customClient{node, make(map[string]interface{})}

			if node.Status != "ready" {
				return
			}

			stats, err := client.Nodes().Stats(node.ID, nil)
			if err != nil {
				return
			}

			allocations, _, err := client.Nodes().Allocations(node.ID, nil)
			if err != nil {
				return
			}

			var allocs []*api.Allocation
			for _, alloc := range allocations {
				if alloc.DesiredStatus == "run" {allocs = append(allocs, alloc)}
			}


			info, _, err := client.Nodes().Info(node.ID, nil)
			if err != nil {
				return
			}

			res[i].NodeClass = info.NodeClass
			res[i].Drain = info.Drain

			comp := make(map[string]interface{})
			comp["cpu"] = cpu(stats.CPU)
			comp["cpuAllocated"] = cpuAllocated(allocs, *info.Resources.CPU)
			comp["memAllocated"] = memAllocated(allocs, *info.Resources.MemoryMB)
			comp["diskAllocated"] = diskAllocated(allocs, *info.Resources.DiskMB)
			comp["allocations"] = len(allocs)

			res[i].Stats = comp
		}(i, node)
	}

	wg.Wait()

	return res
}

func cpuAllocated(allocs []*api.Allocation, total int) int {
	var sum int

	for _, alloc := range allocs {
		sum = sum + *alloc.Resources.CPU
	}

	return 100 * sum / total
}

func memAllocated(allocs []*api.Allocation, total int) int {
	var sum int

	for _, alloc := range allocs {
		sum = sum + *alloc.Resources.MemoryMB
	}

	return 100 * sum / total
}

func diskAllocated(allocs []*api.Allocation, total int) int {
	var sum int

	for _, alloc := range allocs {
		sum = sum + *alloc.Resources.DiskMB
	}

	return 100 * sum / total
}

func cpu(cpus []*api.HostCPUStats) int {
	var sum float64

	for _, cpu := range cpus {
		sum = sum + (100 - cpu.Idle)
	}

	return int(sum / float64(len(cpus)))
}

type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }
