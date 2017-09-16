package nodes

import (
	"fmt"
	"sort"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchList   = "NOMAD_WATCH_NODES"
	UnwatchList = "NOMAD_UNWATCH_NODES"
	fetchedList = "NOMAD_FETCHED_NODES"
)

type list struct {
	action structs.Action
}

func NewList(action structs.Action) *list {
	return &list{
		action: action,
	}
}

// Do will watch the /jobs endpoint for changes
func (w *list) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	nodes, meta, err := client.Nodes().List(q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	// http://stackoverflow.com/a/28999886
	// TODO: refactor to Go 1.9 sorting !
	sort.Sort(ClientNameSorter(nodes))

	return &structs.Action{
		Type:    fetchedList,
		Payload: nodes,
		Index:   meta.LastIndex,
	}, nil
}

func (w *list) Key() string {
	return "/nodes"
}

// ClientNameSorter sorts planets by name
type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }
