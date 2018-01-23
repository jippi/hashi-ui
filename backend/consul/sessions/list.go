package sessions

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList = "CONSUL_FETCHED_SESSIONS"
	WatchList   = "CONSUL_WATCH_SESSIONS"
	UnwatchList = "CONSUL_UNWATCH_SESSIONS"
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
	sessions, meta, err := w.client.Session().List(w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}
	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}
	return structs.NewResponseWithIndex(fetchedList, sessions, meta.LastIndex)
}

func (list) Key() string {
	return "/consul/sessions/list"
}

func (list) IsMutable() bool {
	return false
}

func (list) BackendType() string {
	return "consul"
}
