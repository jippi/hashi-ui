package deployments

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchAllocations   = "NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS"
	UnwatchAllocations = "NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS"
	fetchedAllocations = "NOMAD_FETCHED_DEPLOYMENT_ALLOCATIONS"
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

func (w *allocations) Do() (structs.Response, error) {
	allocations, meta, err := w.client.Deployments().Allocations(w.action.Payload.(string), w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return structs.NewNoopResponse()
	}

	return structs.NewResponseWithIndex(fetchedAllocations, allocations, meta.LastIndex)
}

func (w *allocations) Key() string {
	return fmt.Sprintf("/deployment/%s/allocations", w.action.Payload.(string))
}

func (w *allocations) IsMutable() bool {
	return false
}

func (w *allocations) BackendType() string {
	return "nomad"
}
