package allocations

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList        = "NOMAD_FETCHED_ALLOCS"
	UnwatchList        = "NOMAD_UNWATCH_ALLOCS"
	UnwatchListShallow = "NOMAD_UNWATCH_ALLOCS_SHALLOW"
	WatchList          = "NOMAD_WATCH_ALLOCS"
	WatchListShallow   = "NOMAD_WATCH_ALLOCS_SHALLOW"
)

type list struct {
	shallow bool
	client  *api.Client
	query   *api.QueryOptions
	action  structs.Action
}

func NewList(action structs.Action, shallow bool, client *api.Client, query *api.QueryOptions) *list {
	return &list{
		action:  action,
		shallow: shallow,
		client:  client,
		query:   query,
	}
}

func (w *list) Do() (*structs.Response, error) {
	allocations, meta, err := w.client.Allocations().List(w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	if w.shallow {
		for i := range allocations {
			allocations[i].TaskStates = make(map[string]*api.TaskState)
		}
	}

	return structs.NewResponseWithIndex(fetchedList, allocations, meta.LastIndex)
}

func (w *list) Key() string {
	key := "/allocations/list"

	if w.shallow {
		key = key + "?shallow"
	}

	return key
}

func (w *list) IsMutable() bool {
	return false
}

func (w *list) BackendType() string {
	return "nomad"
}
