package nodes

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList = "CONSUL_FETCHED_NODES"
	UnwatchList = "CONSUL_UNWATCH_NODES"
	WatchList   = "CONSUL_WATCH_NODES"
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

func (w *list) Do() (*structs.Action, error) {
	var nodes internalNodes
	meta, err := w.client.Raw().Query("/v1/internal/ui/nodes", &nodes, w.query)
	if err != nil {
		return nil, err
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: nodes,
		Type:    fetchedList,
	}, nil
}

func (w *list) Key() string {
	return "/consul/nodes/list"
}

func (w *list) IsMutable() bool {
	return false
}
