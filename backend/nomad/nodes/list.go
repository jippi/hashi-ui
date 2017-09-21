package nodes

import (
	"sort"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchList   = "NOMAD_WATCH_NODES"
	UnwatchList = "NOMAD_UNWATCH_NODES"
	fetchedList = "NOMAD_FETCHED_NODES"
)

type list struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
}

func NewList(action structs.Action, client *api.Client, query *api.QueryOptions) *list {
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
		return nil, nil
	}

	// http://stackoverflow.com/a/28999886
	// TODO: refactor to Go 1.9 sorting !
	sort.Sort(ClientNameSorter(nodes))

	return structs.NewResultWithIndex(fetchedList, nodes, meta.LastIndex), nil
}

func (w *list) Key() string {
	return "/nodes/list"
}

func (w *list) IsMutable() bool {
	return false
}

type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }
