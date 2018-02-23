package jobs

import (
	"fmt"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
	"time"
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

	timestamp := time.Now()
	if origJob.Meta == nil {
		origJob.Meta = make(map[string]string)
	}
	origJob.Meta["restarted"] = timestamp.String()
	origJob.Stop = boolToPtr(false) // force start

	_, _, err = w.client.Jobs().Register(origJob, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully restarted job")
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