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
	client     *api.Client
	id         string
	actionType string
	group      string
}

func NewCHangeStatus(action structs.Action, client *api.Client) *changeStatus {
	return &changeStatus{
		action: action,
		client: client,
	}
}

func (w *changeStatus) Do() (*structs.Response, error) {
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
			_, _, err = w.client.Deployments().PromoteGroups(w.id, []string{w.group}, nil)
		} else {
			_, _, err = w.client.Deployments().PromoteAll(w.id, nil)
		}
	case "fail":
		_, _, err = w.client.Deployments().Fail(w.id, nil)
	case "pause":
		_, _, err = w.client.Deployments().Pause(w.id, true, nil)
	case "resume":
		_, _, err = w.client.Deployments().Pause(w.id, false, nil)
	}

	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully updated deployment")
}

func (w *changeStatus) Key() string {
	w.parse()

	return fmt.Sprintf("/deployment/%s/change/%s/group/%s", w.id, w.actionType, w.group)
}

func (w *changeStatus) IsMutable() bool {
	return true
}

func (w *changeStatus) BackendType() string {
	return "nomad"
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
