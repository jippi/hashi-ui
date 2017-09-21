package kv

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	UnwatchList = "CONSUL_UNWATCH_KV_PATH"
	WatchList   = "CONSUL_WATCH_KV_PATH"
	fetchedList = "CONSUL_FETCHED_KV_PATH"
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
	keys, meta, err := w.client.KV().Keys(w.action.Payload.(string), "/", w.query)
	if err != nil {
		return nil, err
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: keys,
		Type:    fetchedList,
	}, nil
}

func (w *list) Key() string {
	return "/consul/kv/path?path=" + w.action.Payload.(string)
}

func (w *list) IsMutable() bool {
	return false
}
