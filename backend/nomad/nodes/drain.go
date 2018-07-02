package nodes

import (
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Drain = "NOMAD_DRAIN_CLIENT"
)

type drain struct {
	action           structs.Action
	client           *api.Client
	id               string
	actionType       string
	markEligible     bool
	drain            bool
	ignoreSystemJobs bool
}

func NewDrain(action structs.Action, client *api.Client) *drain {
	return &drain{
		action: action,
		client: client,
	}
}

func (w *drain) Do() (*structs.Response, error) {
	if w.id == "" {
		return structs.NewErrorResponse("Missing client id")
	}

	if w.actionType == "" {
		return structs.NewErrorResponse("Missing action type")
	}

	var err error

	switch w.actionType {
	case "set_eligibility":
		_, err = w.client.Nodes().ToggleEligibility(w.id, w.markEligible, nil)
	case "set_drain":
		var drain *api.DrainSpec
		if w.drain {
			drain = &api.DrainSpec{Deadline: 1 * time.Hour, IgnoreSystemJobs: w.ignoreSystemJobs}
		}
		_, err = w.client.Nodes().UpdateDrain(w.id, drain, true, nil)
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
	return "/node/" + w.id + "/drain/"
}

func (w *drain) IsMutable() bool {
	return true
}

func (w *drain) BackendType() string {
	return "nomad"
}

func (w *drain) parse() {
	payload := w.action.Payload.(map[string]interface{})

	if x, ok := payload["id"]; ok {
		w.id = x.(string)
	}

	if x, ok := payload["action_type"]; ok {
		w.actionType = x.(string)
	}

	if x, ok := payload["eligible"]; ok {
		w.markEligible = ("on" == x.(string))
	}

	if x, ok := payload["drain"]; ok {
		w.drain = ("on" == x.(string))
	}

	if x, ok := payload["ignore_system_jobs"]; ok {
		w.markEligible = ("yes" == x.(string))
	}
}
