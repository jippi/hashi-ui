package evaluations

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList = "NOMAD_FETCHED_EVALS"
	UnwatchList = "NOMAD_UNWATCH_EVALS"
	WatchList   = "NOMAD_WATCH_EVALS"
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

func (w *list) Do() (structs.Response, error) {
	evaluations, meta, err := w.client.Evaluations().List(w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return structs.NewNoopResponse()
	}

	return structs.NewResponseWithIndex(fetchedList, evaluations, meta.LastIndex)
}

func (w *list) Key() string {
	return "/evaluations/list"
}

func (w *list) IsMutable() bool {
	return false
}

func (w *list) BackendType() string {
	return "nomad"
}
