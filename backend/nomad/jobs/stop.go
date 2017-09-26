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

func (w *stop) Do() (*structs.Response, error) {
	_, _, err := w.client.Jobs().Deregister(w.action.Payload.(string), false, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully stopped job")
}

func (w *stop) Key() string {
	return fmt.Sprintf("/job/%s/stop", w.action.Payload.(string))
}

func (w *stop) IsMutable() bool {
	return true
}

func (w *stop) BackendType() string {
	return "nomad"
}
