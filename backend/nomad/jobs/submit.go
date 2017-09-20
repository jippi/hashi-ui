package jobs

import (
	"encoding/json"
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Submit = "NOMAD_SUBMIT_JOB"
)

type submit struct {
	action structs.Action
}

func NewSubmit(action structs.Action) *submit {
	return &submit{
		action: action,
	}
}

func (w *submit) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	// if c.region.Config.NomadReadOnly {
	// if c.region.Config.NomadHideEnvData {

	jobjson := w.action.Payload.(string)
	runjob := api.Job{}
	json.Unmarshal([]byte(jobjson), &runjob)

	_, _, err := client.Jobs().Register(&runjob, nil)
	if err != nil {
		return nil, fmt.Errorf("connection: unable to submit job '%s' : %s", *runjob.ID, err)
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "The job has been successfully updated.",
	}, nil
}

func (w *submit) Key() string {
	return "/job/submit"
}

func (w *submit) IsMutable() bool {
	return true
}
