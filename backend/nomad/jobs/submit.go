package jobs

import (
	"encoding/json"
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Submit = "NOMAD_SUBMIT_JOB"
)

type submit struct {
	action structs.Action
	client *api.Client
	cfg    *config.Config
}

func NewSubmit(action structs.Action, client *api.Client, cfg *config.Config) *submit {
	return &submit{
		action: action,
		client: client,
		cfg:    cfg,
	}
}

func (w *submit) Do() (*structs.Action, error) {
	if w.cfg.NomadHideEnvData {
		return nil, fmt.Errorf("Can't update job, the hashi-ui setting 'nomad-hide-env-data' will delete all your env{} clauses")
	}

	jobjson := w.action.Payload.(string)
	runjob := api.Job{}
	json.Unmarshal([]byte(jobjson), &runjob)

	_, _, err := w.client.Jobs().Register(&runjob, nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "The job has successfully been submitted.",
	}, nil
}

func (w *submit) Key() string {
	return "/job/submit"
}

func (w *submit) IsMutable() bool {
	return true
}
