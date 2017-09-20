package deployments

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchInfo   = "NOMAD_WATCH_DEPLOYMENT"
	UnwatchInfo = "NOMAD_UNWATCH_DEPLOYMENT"
	fetchedInfo = "NOMAD_FETCHED_DEPLOYMENT"
)

type info struct {
	action structs.Action
}

func NewInfo(action structs.Action) *info {
	return &info{
		action: action,
	}
}

func (w *info) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	deployment, meta, err := client.Deployments().Info(w.action.Payload.(string), q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !helper.QueryChanged(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: deployment,
		Type:    fetchedInfo,
	}, nil
}

func (w *info) Key() string {
	return fmt.Sprintf("/deployment/%s/info", w.action.Payload.(string))
}

func (w *info) IsMutable() bool {
	return false
}
