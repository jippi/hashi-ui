package cluster

import (
	"sync"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	EvaluateAllJobs = "NOMAD_EVALUATE_ALL_JOBS"
)

type evaluateAllJobs struct {
	action structs.Action
	client *api.Client
}

func NewEvaluateAllJobs(action structs.Action, client *api.Client) *evaluateAllJobs {
	return &evaluateAllJobs{
		action: action,
		client: client,
	}
}

func (w *evaluateAllJobs) Do() (*structs.Action, error) {
	jobs, _, err := w.client.Jobs().List(nil)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup
	for _, job := range jobs {
		wg.Add(1)

		go func(job *api.JobListStub) {
			w.client.Jobs().ForceEvaluate(job.ID, nil)
			wg.Done()
		}(job)
	}

	wg.Wait()

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Evaluating all jobs in the background.",
	}, nil
}

func (w *evaluateAllJobs) Key() string {
	return "/system/evaluate_all_jobs"
}

func (w *evaluateAllJobs) IsMutable() bool {
	return false
}
