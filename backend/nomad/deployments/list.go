package deployments

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchList   = "NOMAD_WATCH_DEPLOYMENTS"
	UnwatchList = "NOMAD_UNWATCH_DEPLOYMENTS"
	fetchedList = "NOMAD_FETCHED_DEPLOYMENTS"
)

type list struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
}

func NewList(action structs.Action, client *api.Client, query *api.QueryOptions) *list {
	return &list{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *list) Do() (*structs.Response, error) {
	deployments, meta, err := w.client.Deployments().List(w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewResponseWithIndex(fetchedList, deployments, meta.LastIndex)
}

func (w *list) Key() string {
	return "/deployments/list"
}

func (w *list) IsMutable() bool {
	return false
}

func (w *list) BackendType() string {
	return "nomad"
}
