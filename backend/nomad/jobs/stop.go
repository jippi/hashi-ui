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
	client *api.Client
}

func NewStop(action structs.Action, client *api.Client) *stop {
	return &stop{
		action: action,
		client: client,
	}
}

func (w *stop) Do() (*structs.Action, error) {
	_, _, err := w.client.Jobs().Deregister(w.action.Payload.(string), false, nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Successfully stopped job",
	}, nil
}

func (w *stop) Key() string {
	return fmt.Sprintf("/job/%s/stop", w.action.Payload.(string))
}

func (w *stop) IsMutable() bool {
	return true
}
