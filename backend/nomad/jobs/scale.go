package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Scale = "NOMAD_CHANGE_TASK_GROUP_COUNT"
)

type scale struct {
	action structs.Action
	client *api.Client
}

func NewScale(action structs.Action, client *api.Client) *scale {
	return &scale{
		action: action,
		client: client,
	}
}

func (w *scale) Do() (*structs.Response, error) {
	params := w.action.Payload.(map[string]interface{})

	jobID := params["job"].(string)
	taskGroupID := params["taskGroup"].(string)
	scaleAction := params["scaleAction"].(string)

	job, _, err := w.client.Jobs().Info(jobID, nil)
	if err != nil {
		return nil, fmt.Errorf("Could not find job: %s", err)
	}
	job.Canonicalize()

	originalCount, err := getTaskGroupCount(job, taskGroupID)
	if err != nil {
		return nil, err
	}

	switch scaleAction {
	case "set":
		setTaskGroupCount(job, taskGroupID, params["count"].(int))
	case "increase":
		increaseTaskGroupCount(job, taskGroupID)
	case "decrease":
		decreaseTaskGroupCount(job, taskGroupID)
	case "stop":
		setTaskGroupCount(job, taskGroupID, 0)
	case "restart": // special case, as its a two step process
		setTaskGroupCount(job, taskGroupID, 0)
		if err := updateJob(w.client, job); err != nil {
			return nil, err
		}

		setTaskGroupCount(job, taskGroupID, originalCount)
		if err := updateJob(w.client, job); err != nil {
			return nil, err
		}

		return structs.NewSuccessResponse("Successfully restarted task group")
	default:
		return nil, fmt.Errorf("Invalid action: %s", scaleAction)
	}

	if err := updateJob(w.client, job); err != nil {
		return nil, err
	}

	newCount, _ := getTaskGroupCount(job, taskGroupID)

	switch scaleAction {
	case "set":
		return structs.NewSuccessResponse("Successfully changed task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, newCount)
	case "increase":
		return structs.NewSuccessResponse("Successfully increased task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, newCount)
	case "decrease":
		return structs.NewSuccessResponse("Successfully decreased task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, newCount)
	case "stop":
		return structs.NewSuccessResponse("Successfully stopped task group %s:%s", jobID, taskGroupID)
	}

	return nil, nil
}

func (w *scale) Key() string {
	params := w.action.Payload.(map[string]interface{})

	jobID := params["job"].(string)
	taskGroupID := params["taskGroup"].(string)
	scaleAction := params["scaleAction"].(string)

	return fmt.Sprintf("/job/%s/scale/%s?group=%s", jobID, scaleAction, taskGroupID)
}

func (w *scale) IsMutable() bool {
	return true
}

func (w *scale) BackendType() string {
	return "nomad"
}

// IntToPtr returns the pointer to an int
func IntToPtr(i int) *int {
	return &i
}

// PtrToInt returns the value of an *int
func PtrToInt(i *int) int {
	return *i
}
