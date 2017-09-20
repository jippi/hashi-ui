package evaluations

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "NOMAD_FETCHED_EVAL"
	UnwatchInfo = "NOMAD_UNWATCH_EVAL"
	WatchInfo   = "NOMAD_WATCH_EVAL"
)

type info struct {
	action structs.Action
}

func NewInfo(action structs.Action) *info {
	return &info{
		action: action,
	}
}

func (w *info) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	job, meta, err := client.Evaluations().Info(w.action.Payload.(string), q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: job,
		Type:    fetchedInfo,
	}, nil
}

func (w *info) Key() string {
	return fmt.Sprintf("/evaluation/%s/info", w.action.Payload.(string))
}
