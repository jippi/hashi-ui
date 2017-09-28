package jobs

import (
	"encoding/json"
	"fmt"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
	"log"
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
	// do some json-dancing to modify the structure to make sure the job is in to-be-started-state
	jobJson, err := json.Marshal(origJob)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	var job_struct map[string]interface{}
	err = json.Unmarshal(jobJson, &job_struct)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	job_struct["Stop"] = false

	// dance backwards
	startJob := api.Job{}
	start_json, _ := json.Marshal(job_struct)
	log.Println(string(start_json))
	json.Unmarshal(start_json, &startJob)

	_, _, err = w.client.Jobs().Register(&startJob, nil)
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
