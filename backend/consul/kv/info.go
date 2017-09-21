package kv

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "CONSUL_FETCHED_KV_PAIR"
	FetchInfo   = "CONSUL_GET_KV_PAIR"
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
	pair, meta, err := w.client.KV().Get(w.action.Payload.(string), w.query)
	if err != nil {
		return nil, err
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: pair,
		Type:    fetchedInfo,
	}, nil
}

func (w *info) Key() string {
	return "/consul/kv/info?key=" + w.action.Payload.(string)
}

func (w *info) IsMutable() bool {
	return false
}
