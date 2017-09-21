package nodes

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "NOMAD_FETCHED_NODE"
	FetchInfo   = "NOMAD_FETCH_NODE"
	UnwatchInfo = "NOMAD_UNWATCH_NODE"
	WatchInfo   = "NOMAD_WATCH_NODE"
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
	node, meta, err := w.client.Nodes().Info(w.id(), w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewResultWithIndex(fetchedInfo, node, meta.LastIndex), nil
}

func (w *info) Key() string {
	return "/node/" + w.id() + "/info"
}

func (w *info) IsMutable() bool {
	return false
}

func (w *info) id() string {
	return w.action.Payload.(string)
}
