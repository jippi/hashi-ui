package services

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "CONSUL_FETCHED_SERVICE"
	UnwatchInfo = "CONSUL_UNWATCH_SERVICE"
	WatchInfo   = "CONSUL_WATCH_SERVICE"
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

func (w *info) Do() (*structs.Response, error) {
	service, meta, err := w.client.Health().Service(w.action.Payload.(string), "", false, w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewResponseWithIndex(fetchedInfo, service, meta.LastIndex)
}

func (w *info) Key() string {
	return "/consul/service/" + w.action.Payload.(string)
}

func (w *info) IsMutable() bool {
	return false
}
