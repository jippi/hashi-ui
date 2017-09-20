package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	EvaluateJob = "NOMAD_EVALUATE_JOB"
)

type evaluate struct {
	action structs.Action
}

func NewEvaluate(action structs.Action) *evaluate {
	return &evaluate{
		action: action,
	}
}

func (w *evaluate) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	_, _, err := client.Jobs().ForceEvaluate(w.action.Payload.(string), nil)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to evaluate %s: %s", w.Key(), err)
	}

	return &structs.Action{
		Payload: "The job has been successfully re-evaluated.",
		Type:    structs.SuccessNotification,
	}, nil
}

func (w *evaluate) Key() string {
	return fmt.Sprintf("/job/%s/evaluate", w.action.Payload.(string))
}

func (w *evaluate) IsMutable() bool {
	return true
}
