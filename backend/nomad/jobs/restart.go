package jobs

import (
	"fmt"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Restart = "NOMAD_RESTART_JOB"
)

type restart struct {
	action structs.Action
	client *api.Client
}

func NewRestart(action structs.Action, client *api.Client) *restart {
	return &restart{
		action: action,
		client: client,
	}
}

// boolToPtr returns the pointer to a bool
func boolToPtr(b bool) *bool {
	return &b
}

func (w *restart) Do() (*structs.Response, error) {
	origJob, _, err := w.client.Jobs().Info(w.action.Payload.(string), nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	// stop
	_, _, err = w.client.Jobs().Deregister(w.action.Payload.(string), false, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	// start
	origJob.Stop = boolToPtr(false) // enforce starting the job, even if it was stopped originally

	_, _, err = w.client.Jobs().Register(origJob, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully restarted origJob")
}

func (w *restart) Key() string {
	return fmt.Sprintf("/job/%s/restart", w.action.Payload.(string))
}

func (w *restart) IsMutable() bool {
	return true
}

func (w *restart) BackendType() string {
	return "nomad"
}
