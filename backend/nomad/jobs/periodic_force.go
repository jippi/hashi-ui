package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ForcePeriodicRun = "NOMAD_FORCE_PERIODIC_RUN"
)

type periodicForce struct {
	action structs.Action
}

func NewForcePeriodicRun(action structs.Action) *periodicForce {
	return &periodicForce{
		action: action,
	}
}

func (w *periodicForce) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	_, _, err := client.Jobs().PeriodicForce(w.action.Payload.(string), nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully force ran the job"}, nil
}

func (w *periodicForce) Key() string {
	return fmt.Sprintf("/job/%s/force-run", w.action.Payload.(string))
}
