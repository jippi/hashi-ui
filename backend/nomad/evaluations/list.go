package evaluations

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedList = "NOMAD_FETCHED_EVALS"
	UnwatchList = "NOMAD_UNWATCH_EVALS"
	WatchList   = "NOMAD_WATCH_EVALS"
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
	evaluations, meta, err := client.Evaluations().List(q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Type:    fetchedList,
		Payload: evaluations,
		Index:   meta.LastIndex,
	}, nil
}

func (w *list) Key() string {
	return "/evaluations/list"
}

func (w *list) IsMutable() bool {
	return false
}
