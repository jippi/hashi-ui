package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ForceEvaluate = "NOMAD_EVALUATE_JOB"
)

type forceEvaluate struct {
	action structs.Action
	client *api.Client
}

func NewForceEvaluate(action structs.Action, client *api.Client) *forceEvaluate {
	return &forceEvaluate{
		action: action,
		client: client,
	}
}

func (w *forceEvaluate) Do() (*structs.Action, error) {
	_, _, err := w.client.Jobs().ForceEvaluate(w.action.Payload.(string), nil)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to evaluate %s: %s", w.Key(), err)
	}

	return &structs.Action{
		Payload: "The job has been successfully re-evaluated.",
		Type:    structs.SuccessNotification,
	}, nil
}

func (w *forceEvaluate) Key() string {
	return fmt.Sprintf("/job/%s/evaluate", w.action.Payload.(string))
}

func (w *forceEvaluate) IsMutable() bool {
	return true
}
