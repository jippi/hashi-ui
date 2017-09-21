package nodes

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Drain = "NOMAD_DRAIN_CLIENT"
)

type drain struct {
	action     structs.Action
	client     *api.Client
	id         string
	actionType string
}

func NewDrain(action structs.Action, client *api.Client) *drain {
	return &drain{
		action: action,
		client: client,
	}
}

func (w *drain) Do() (*structs.Action, error) {
	var err error

	if w.id == "" {
		return nil, fmt.Errorf("Missing client id")
	}

	if w.actionType == "" {
		return nil, fmt.Errorf("Missing action type")
	}

	switch w.actionType {
	case "enable":
		_, err = w.client.Nodes().ToggleDrain(w.id, true, nil)
	case "disable":
		_, err = w.client.Nodes().ToggleDrain(w.id, false, nil)
	default:
		return nil, fmt.Errorf("Invalid action: %s", w.actionType)
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to change client drain mode: %s", err)
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Successfully updated client drain mode.",
	}, nil
}

func (w *drain) Key() string {
	w.parse()
	return "/node/" + w.id + "/drain/" + w.actionType
}

func (w *drain) IsMutable() bool {
	return true
}

func (w *drain) parse() {
	payload := w.action.Payload.(map[string]interface{})

	if x, ok := payload["id"]; ok {
		w.id = x.(string)
	}

	if x, ok := payload["action"]; ok {
		w.actionType = x.(string)
	}

}
