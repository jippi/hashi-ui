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
	client *api.Client
	query  *api.QueryOptions
}

func NewInfo(action structs.Action, client *api.Client, query *api.QueryOptions) *info {
	return &info{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *info) Do() (*structs.Action, error) {
	deployment, meta, err := w.client.Deployments().Info(w.action.Payload.(string), w.query)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !helper.QueryChanged(w.query, meta) {
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
