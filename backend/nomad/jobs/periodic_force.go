package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	PeriodicForce = "NOMAD_FORCE_PERIODIC_RUN"
)

type periodicForce struct {
	action structs.Action
	client *api.Client
}

func NewPeriodicForce(action structs.Action, client *api.Client) *periodicForce {
	return &periodicForce{
		action: action,
		client: client,
	}
}

func (w *periodicForce) Do() (*structs.Action, error) {
	_, _, err := w.client.Jobs().PeriodicForce(w.action.Payload.(string), nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Successfully force ran the job",
	}, nil
}

func (w *periodicForce) Key() string {
	return fmt.Sprintf("/job/%s/periodic-force", w.action.Payload.(string))
}

func (w *periodicForce) IsMutable() bool {
	return true
}
