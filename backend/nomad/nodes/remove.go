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

func (w *remove) Do() (*structs.Action, error) {
	ID := w.action.Payload.(string)

	err := w.client.Agent().ForceLeave(ID)
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Successfully force leaved the client.",
	}, nil
}

func (w *remove) Key() string {
	return "/node/" + w.action.Payload.(string) + "/remove"
}

func (w *remove) IsMutable() bool {
	return true
}
