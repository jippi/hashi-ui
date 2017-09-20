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
}

func NewScale(action structs.Action) *scale {
	return &scale{
		action: action,
	}
}

func (w *scale) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	params := w.action.Payload.(map[string]interface{})

	jobID := params["job"].(string)
	taskGroupID := params["taskGroup"].(string)
	scaleAction := params["scaleAction"].(string)

	job, _, err := client.Jobs().Info(jobID, nil)
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
		if err := updateJob(client, job); err != nil {
			return nil, err
		}

		setTaskGroupCount(job, taskGroupID, originalCount)
		if err := updateJob(client, job); err != nil {
			return nil, err
		}

		return &structs.Action{
			Type:    structs.SuccessNotification,
			Payload: fmt.Sprintf("Successfully restarted task group"),
		}, nil
	default:
		return nil, fmt.Errorf("Invalid action: %s", scaleAction)
	}

	if err := updateJob(client, job); err != nil {
		return nil, err
	}

	newCount, _ := getTaskGroupCount(job, taskGroupID)

	switch scaleAction {
	case "set":
		return &structs.Action{
			Type:    structs.SuccessNotification,
			Payload: fmt.Sprintf("Successfully changed task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, newCount),
		}, nil
	case "increase":
		return &structs.Action{
			Type:    structs.SuccessNotification,
			Payload: fmt.Sprintf("Successfully increased task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, newCount),
		}, nil
	case "decrease":
		return &structs.Action{
			Type:    structs.SuccessNotification,
			Payload: fmt.Sprintf("Successfully decreased task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, newCount),
		}, nil
	case "stop":
		return &structs.Action{
			Type:    structs.SuccessNotification,
			Payload: fmt.Sprintf("Successfully stopped task group %s:%s", jobID, taskGroupID),
		}, nil
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

// IntToPtr returns the pointer to an int
func IntToPtr(i int) *int {
	return &i
}

// PtrToInt returns the value of an *int
func PtrToInt(i *int) int {
	return *i
}
