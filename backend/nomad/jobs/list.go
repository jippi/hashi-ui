package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList         = "NOMAD_FETCHED_JOBS"
	fetchedListFiltered = "NOMAD_FETCHED_JOBS_FILTERED"
	UnwatchList         = "NOMAD_UNWATCH_JOBS"
	UnwatchListFiltered = "NOMAD_UNWATCH_JOBS_FILTERED"
	WatchList           = "NOMAD_WATCH_JOBS"
	WatchListFiltered   = "NOMAD_WATCH_JOBS_FILTERED"
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
	w.filter(w.query)

	jobs, meta, err := w.client.Jobs().List(w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	actionType := fetchedList

	if w.query.Prefix != "" {
		actionType = fetchedListFiltered
	}

	return structs.NewResponseWithIndex(actionType, jobs, meta.LastIndex)
}

func (w *list) Key() string {
	path := "/jobs/list"

	if payload, ok := w.action.Payload.(map[string]interface{}); ok {
		if prefix, ok := payload["prefix"]; ok {
			path = fmt.Sprintf("%s?prefix=%s", path, prefix)
		}
	}

	return path
}

func (w *list) IsMutable() bool {
	return false
}

func (w *list) filter(q *api.QueryOptions) {
	if payload, ok := w.action.Payload.(map[string]interface{}); ok {
		if prefix, ok := payload["prefix"]; ok {
			q.Prefix = prefix.(string)
		}
	}
}
