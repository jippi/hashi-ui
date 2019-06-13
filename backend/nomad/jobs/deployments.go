package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchDeployments      = "NOMAD_WATCH_JOB_DEPLOYMENTS"
	UnwatchDeployments    = "NOMAD_UNWATCH_JOB_DEPLOYMENTS"
	fetchedJobDeployments = "NOMAD_FETCHED_JOB_DEPLOYMENTS"
)

type deployments struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
}

func NewDeployments(action structs.Action, client *api.Client, query *api.QueryOptions) *deployments {
	return &deployments{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *deployments) Do() (structs.Response, error) {
	deployments, meta, err := w.client.Jobs().Deployments(w.action.Payload.(string), true, w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return structs.NewNoopResponse()
	}

	return structs.NewResponseWithIndex(fetchedJobDeployments, deployments, meta.LastIndex)
}

func (w *deployments) Key() string {
	return fmt.Sprintf("/job/%s/deployments", w.action.Payload.(string))
}

func (w *deployments) IsMutable() bool {
	return false
}

func (w *deployments) BackendType() string {
	return "nomad"
}
