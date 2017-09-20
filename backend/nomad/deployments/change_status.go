package deployments

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ChangeStatus = "NOMAD_CHANGE_DEPLOYMENT_STATUS"
)

type changeStatus struct {
	action     structs.Action
	id         string
	actionType string
	group      string
}

func NewCHangeStatus(action structs.Action) *changeStatus {
	return &changeStatus{
		action: action,
	}
}

func (w *changeStatus) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	if w.id == "" {
		return nil, fmt.Errorf("Missing deployment id")
	}

	if w.actionType == "" {
		return nil, fmt.Errorf("Missing action type")
	}

	var err error
	switch w.actionType {
	case "promote":
		if w.group != "" {
			_, _, err = client.Deployments().PromoteGroups(w.id, []string{w.group}, nil)
		} else {
			_, _, err = client.Deployments().PromoteAll(w.id, nil)
		}
	case "fail":
		_, _, err = client.Deployments().Fail(w.id, nil)
	case "pause":
		_, _, err = client.Deployments().Pause(w.id, true, nil)
	case "resume":
		_, _, err = client.Deployments().Pause(w.id, false, nil)
	}

	if err != nil {
		return nil, fmt.Errorf("Failed to update deployment: %s", err)
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully updated deployment."}, nil
}

func (w *changeStatus) Key() string {
	w.parse()

	return fmt.Sprintf("/deployment/%s/change/%s/group/%s", w.id, w.actionType, w.group)
}

func (w *changeStatus) IsMutable() bool {
	return true
}

func (w *changeStatus) parse() {
	payload := w.action.Payload.(map[string]interface{})

	if x, ok := payload["id"]; ok {
		w.id = x.(string)
	}

	if x, ok := payload["action"]; ok {
		w.actionType = x.(string)
	}

	if x, ok := payload["group"]; ok {
		w.group = x.(string)
	}
}
