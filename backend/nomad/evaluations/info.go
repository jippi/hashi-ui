package evaluations

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "NOMAD_FETCHED_EVAL"
	UnwatchInfo = "NOMAD_UNWATCH_EVAL"
	WatchInfo   = "NOMAD_WATCH_EVAL"
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

func (w *info) Do() (*structs.Response, error) {
	job, meta, err := w.client.Evaluations().Info(w.action.Payload.(string), w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewResponseWithIndex(fetchedInfo, job, meta.LastIndex)
}

func (w *info) Key() string {
	return fmt.Sprintf("/evaluation/%s/info", w.action.Payload.(string))
}

func (w *info) IsMutable() bool {
	return false
}
