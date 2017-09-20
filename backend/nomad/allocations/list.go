package allocations

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
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
	action  structs.Action
}

func NewList(action structs.Action, shallow bool) *list {
	return &list{
		action:  action,
		shallow: shallow,
	}
}

// Do will watch the /jobs endpoint for changes
func (w *list) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	allocations, meta, err := client.Allocations().List(q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	if w.shallow {
		for i := range allocations {
			allocations[i].TaskStates = make(map[string]*api.TaskState)
		}
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: allocations,
		Type:    fetchedList,
	}, nil
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
