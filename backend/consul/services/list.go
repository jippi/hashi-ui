package services

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList = "CONSUL_FETCHED_SERVICES"
	UnwatchList = "CONSUL_UNWATCH_SERVICES"
	WatchList   = "CONSUL_WATCH_SERVICES"
)

type list struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
}

// InternalService ...
type InternalService struct {
	Name           string
	Nodes          []string
	ChecksPassing  int64
	ChecksWarning  int64
	ChecksCritical int64
}

// InternalServices ...
type InternalServices []*InternalService

func NewList(action structs.Action, client *api.Client, query *api.QueryOptions) *list {
	return &list{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *list) Do() (*structs.Action, error) {
	var services InternalServices
	meta, err := w.client.Raw().Query("/v1/internal/ui/services", &services, w.query)
	if err != nil {
		return nil, err
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: services,
		Type:    fetchedList,
	}, nil
}

func (w *list) Key() string {
	return "/consul/services/list"
}

func (w *list) IsMutable() bool {
	return false
}
