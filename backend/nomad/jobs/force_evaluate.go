package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ForceEvaluate = "NOMAD_EVALUATE_JOB"
)

type forceEvaluate struct {
	action structs.Action
	client *api.Client
}

func NewForceEvaluate(action structs.Action, client *api.Client) *forceEvaluate {
	return &forceEvaluate{
		action: action,
		client: client,
	}
}

func (w *forceEvaluate) Do() (*structs.Response, error) {
	_, _, err := w.client.Jobs().ForceEvaluate(w.action.Payload.(string), nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("The job has been successfully re-evaluated")
}

func (w *forceEvaluate) Key() string {
	return fmt.Sprintf("/job/%s/evaluate", w.action.Payload.(string))
}

func (w *forceEvaluate) IsMutable() bool {
	return true
}

func (w *forceEvaluate) BackendType() string {
	return "nomad"
}
