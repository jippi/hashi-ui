package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Stop = "NOMAD_STOP_JOB"
)

type stop struct {
	action structs.Action
}

func NewStop(action structs.Action) *stop {
	return &stop{
		action: action,
	}
}

func (w *stop) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	_, _, err := client.Jobs().Deregister(w.action.Payload.(string), false, nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully stopped job"}, nil
}

func (w *stop) Key() string {
	return fmt.Sprintf("/job/%s/stop", w.action.Payload.(string))
}
