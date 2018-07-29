package sessions

import (
	"fmt"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "CONSUL_FETCHED_SESSION"
	WatchInfo   = "CONSUL_WATCH_SESSION"
	UnwatchInfo = "CONSUL_UNWATCH_SESSION"
)

type info struct {
	action structs.Action
	client *api.Client
	opt    *api.QueryOptions
}

func NewInfo(action structs.Action, client *api.Client, opt *api.QueryOptions) *info {
	return &info{
		action: action,
		client: client,
		opt:    opt,
	}
}

func (w *info) Do() (structs.Response, error) {
	session, meta, err := w.client.Session().Info(w.action.Payload.(string), w.opt)
	if err != nil {
		return structs.NewErrorResponse(err)
	}
	if !helper.QueryChanged(w.opt, meta) {
		return structs.NewNoopResponse()
	}
	return structs.NewResponseWithIndex(fetchedInfo, session, meta.LastIndex)
}

func (w *info) Key() string {
	return fmt.Sprintf("/consul/session/info/%s", w.action.Payload)
}

func (info) IsMutable() bool {
	return false
}

func (info) BackendType() string {
	return "consul"
}
