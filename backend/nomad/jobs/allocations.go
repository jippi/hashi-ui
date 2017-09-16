package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchAllocations   = "NOMAD_WATCH_JOB_ALLOCATIONS"
	UnwatchAllocations = "NOMAD_UNWATCH_JOB_ALLOCATIONS"
	fetchedAllocations = "NOMAD_FETCHED_JOB_ALLOCATIONS"
)

type allocations struct {
	action structs.Action
}

func NewAllocations(action structs.Action) *allocations {
	return &allocations{
		action: action,
	}
}

func (w *allocations) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	allocations, meta, err := client.Jobs().Allocations(w.action.Payload.(string), true, q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: allocations,
		Type:    fetchedAllocations,
	}, nil
}

func (w *allocations) Key() string {
	return fmt.Sprintf("/job/%s/allocations", w.action.Payload.(string))
}
