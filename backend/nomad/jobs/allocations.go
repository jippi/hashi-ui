package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchAllocations   = "NOMAD_WATCH_JOB_ALLOCATIONS"
	UnwatchAllocations = "NOMAD_UNWATCH_JOB_ALLOCATIONS"
	fetchedAllocations = "NOMAD_FETCHED_JOB_ALLOCATIONS"
)

type allocations struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
}

func NewAllocations(action structs.Action, client *api.Client, query *api.QueryOptions) *allocations {
	return &allocations{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *allocations) Do() (*structs.Response, error) {
	allocations, meta, err := w.client.Jobs().Allocations(w.action.Payload.(string), true, w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewSuccessResponse(fetchedAllocations, allocations, meta.LastIndex)
}

func (w *allocations) Key() string {
	return fmt.Sprintf("/job/%s/allocations", w.action.Payload.(string))
}

func (w *allocations) IsMutable() bool {
	return false
}
