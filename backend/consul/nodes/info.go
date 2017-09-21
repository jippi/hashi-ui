package nodes

import (
	"fmt"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "CONSUL_FETCHED_NODE"
	UnwatchInfo = "CONSUL_UNWATCH_NODE"
	WatchInfo   = "CONSUL_WATCH_NODE"
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
	var node internalNode
	meta, err := w.client.Raw().Query(fmt.Sprintf("/v1/internal/ui/node/%s", w.action.Payload.(string)), &node, w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewResultWithIndex(fetchedInfo, node, meta.LastIndex), nil
}

func (w *info) Key() string {
	return "/consul/node/" + w.action.Payload.(string)
}

func (w *info) IsMutable() bool {
	return false
}
