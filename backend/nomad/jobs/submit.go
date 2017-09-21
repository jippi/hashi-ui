package jobs

import (
	"encoding/json"

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

func (w *submit) Do() (*structs.Response, error) {
	if w.cfg.NomadHideEnvData {
		return structs.NewErrorResponse("Can't update job, the hashi-ui setting 'nomad-hide-env-data' will delete all your env{} clauses")
	}

	jobjson := w.action.Payload.(string)
	runjob := api.Job{}
	json.Unmarshal([]byte(jobjson), &runjob)

	_, _, err := w.client.Jobs().Register(&runjob, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("The job has successfully been submitted.")
}

func (w *submit) Key() string {
	return "/job/submit"
}

func (w *submit) IsMutable() bool {
	return true
}
