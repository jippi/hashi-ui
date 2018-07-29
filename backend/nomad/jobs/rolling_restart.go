package jobs

import (
	"fmt"
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	RollingRestart = "NOMAD_ROLLING_RESTART_JOB"
)

type rollingRestart struct {
	action structs.Action
	client *api.Client
}

func NewRollingRestart(action structs.Action, client *api.Client) *rollingRestart {
	return &rollingRestart{
		action: action,
		client: client,
	}
}

func (w *rollingRestart) Do() (structs.Response, error) {
	origJob, _, err := w.client.Jobs().Info(w.action.Payload.(string), nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	timestamp := time.Now()
	if origJob.Meta == nil {
		origJob.Meta = make(map[string]string)
	}
	origJob.Meta["hashi-ui.restarted"] = timestamp.String()
	origJob.Stop = boolToPtr(false) // force start

	_, _, err = w.client.Jobs().Register(origJob, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully rolling restarted job")
}

func (w *rollingRestart) Key() string {
	return fmt.Sprintf("/job/%s/rolling-restart", w.action.Payload.(string))
}

func (w *rollingRestart) IsMutable() bool {
	return true
}

func (w *rollingRestart) BackendType() string {
	return "nomad"
}
