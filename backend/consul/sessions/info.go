package sessions

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	FetchInfo   = "CONSUL_GET_SESSION"
	fetchedInfo = "CONSUL_FETCHED_SESSION"
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
	session, meta, err := w.client.Session().Info(w.action.Payload.(string), w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}
	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}
	return structs.NewResponseWithIndex(fetchedInfo, session, meta.LastIndex)
}

func (w *info) Key() string {
	return "/consul/session/info/" + w.action.Payload.(string)
}

func (info) IsMutable() bool {
	return false
}

func (info) BackendType() string {
	return "consul"
}
