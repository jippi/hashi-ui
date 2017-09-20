package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchDeployments      = "NOMAD_WATCH_JOB_DEPLOYMENTS"
	UnwatchDeployments    = "NOMAD_UNWATCH_JOB_DEPLOYMENTS"
	fetchedJobDeployments = "NOMAD_FETCHED_JOB_DEPLOYMENTS"
)

type deployments struct {
	action structs.Action
}

func NewDeployments(action structs.Action) *deployments {
	return &deployments{
		action: action,
	}
}

func (w *deployments) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	deployments, meta, err := client.Jobs().Deployments(w.action.Payload.(string), q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: deployments,
		Type:    fetchedJobDeployments,
	}, nil
}

func (w *deployments) Key() string {
	return fmt.Sprintf("/job/%s/deployments", w.action.Payload.(string))
}

func (w *deployments) IsMutable() bool {
	return false
}
