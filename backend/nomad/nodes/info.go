package nodes

import (
	"fmt"

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
}

func NewInfo(action structs.Action) *info {
	return &info{
		action: action,
	}
}

func (w *info) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	node, meta, err := client.Nodes().Info(w.id(), q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch node info: %s", err)
	}

	if !helper.QueryChanged(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Type:    fetchedInfo,
		Payload: node,
		Index:   meta.LastIndex,
	}, nil
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
