package allocations

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedAlloc = "NOMAD_FETCHED_ALLOC"
	WatchInfo    = "NOMAD_WATCH_ALLOC"
	UnwatchInfo  = "NOMAD_UNWATCH_ALLOC"
)

type info struct {
	action structs.Action
}

func NewInfo(action structs.Action) *info {
	return &info{
		action: action,
	}
}

// Do will watch the /job/:id endpoint for changes
func (w *info) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	allocation, meta, err := client.Allocations().Info(w.action.Payload.(string), q)

	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: allocation,
		Type:    fetchedAlloc,
	}, nil
}

// Key will return the subscription key for the action
func (w *info) Key() string {
	return fmt.Sprintf("/allocation/%s/info", w.action.Payload.(string))
}

func (w *info) IsMutable() bool {
	return false
}
