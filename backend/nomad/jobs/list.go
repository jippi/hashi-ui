package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
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
}

func NewList(action structs.Action) *list {
	return &list{
		action: action,
	}
}

func (w *list) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	w.filter(q)

	jobs, meta, err := client.Jobs().List(q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch jobs: %s", err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	actionType := fetchedList

	if q.Prefix != "" {
		actionType = fetchedListFiltered
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: jobs,
		Type:    actionType,
	}, nil
}

func (w *list) Key() string {
	path := "/jobs"

	if payload, ok := w.action.Payload.(map[string]interface{}); ok {
		if prefix, ok := payload["prefix"]; ok {
			path = fmt.Sprintf("%s?prefix=%s", path, prefix)
		}
	}

	return path
}

func (w *list) filter(q *api.QueryOptions) {
	if payload, ok := w.action.Payload.(map[string]interface{}); ok {
		if prefix, ok := payload["prefix"]; ok {
			q.Prefix = prefix.(string)
		}
	}
}
