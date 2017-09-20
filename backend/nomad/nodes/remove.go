package nodes

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Remove = "NOMAD_REMOVE_CLIENT"
)

type remove struct {
	action structs.Action
}

func NewRemove(action structs.Action) *remove {
	return &remove{
		action: action,
	}
}

func (w *remove) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	ID := w.action.Payload.(string)

	err := client.Agent().ForceLeave(ID)
	if err != nil {
		return nil, fmt.Errorf("Failed to force leave the client: %s", err)
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully force leaved the client."}, nil
}

func (w *remove) Key() string {
	return "/node/" + w.action.Payload.(string) + "/remove"
}
