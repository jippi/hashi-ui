package nodes

import (
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

func (w *drain) Do() (*structs.Response, error) {
	var err error

	if w.id == "" {
		return structs.NewErrorResponse("Missing client id")
	}

	if w.actionType == "" {
		return structs.NewErrorResponse("Missing action type")
	}

	switch w.actionType {
	case "enable":
		_, err = w.client.Nodes().ToggleDrain(w.id, true, nil)
	case "disable":
		_, err = w.client.Nodes().ToggleDrain(w.id, false, nil)
	default:
		return structs.NewErrorResponse("Invalid action: %s", w.actionType)
	}

	if err != nil {
		return structs.NewErrorResponse("Failed to change client drain mode: %s", err)
	}

	return structs.NewSuccessResponse("Successfully updated client drain mode")
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
