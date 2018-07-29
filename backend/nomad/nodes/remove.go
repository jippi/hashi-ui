package nodes

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Remove = "NOMAD_REMOVE_CLIENT"
)

type remove struct {
	action structs.Action
	client *api.Client
}

func NewRemove(action structs.Action, client *api.Client) *remove {
	return &remove{
		action: action,
		client: client,
	}
}

func (w *remove) Do() (structs.Response, error) {
	ID := w.action.Payload.(string)

	err := w.client.Agent().ForceLeave(ID)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully force leaved the client")
}

func (w *remove) Key() string {
	return "/node/" + w.action.Payload.(string) + "/remove"
}

func (w *remove) IsMutable() bool {
	return true
}

func (w *remove) BackendType() string {
	return "nomad"
}
