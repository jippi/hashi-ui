package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	nomad "github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	FetchHealth   = "NOMAD_FETCH_JOB_HEALTH"
	WatchHealth   = "NOMAD_WATCH_JOB_HEALTH"
	UnwatchHealth = "NOMAD_UNWATCH_JOB_HEALTH"
	fetchedhealth = "NOMAD_FETCHED_JOB_HEALTH"
)

type health struct {
	action     structs.Action
	client     *api.Client
	jobQuery   *api.QueryOptions
	allocQuery *api.QueryOptions
	job        *api.Job

	id string
}

type jobHealth struct {
	Job     string
	Running int
	Missing int
}

func NewHealth(action structs.Action, client *api.Client, jobQuery *api.QueryOptions, allocQuery *api.QueryOptions) *health {
	return &health{
		action:     action,
		client:     client,
		jobQuery:   jobQuery,
		allocQuery: allocQuery,
	}
}

func (w *health) Do() (*structs.Response, error) {
	// read the job
	job, jobMeta, err := w.client.Jobs().Info(w.id, w.jobQuery)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	// read the allocations
	allocations, allocMeta, err := w.client.Jobs().Allocations(w.id, false, w.allocQuery)
	if err != nil {
		return nil, err
	}

	// if any changed, update status
	jobChanged := helper.QueryChanged(w.jobQuery, jobMeta)
	allocChanged := helper.QueryChanged(w.allocQuery, allocMeta)
	if !jobChanged && !allocChanged {
		return nil, nil
	}

	// calculate stats
	allocationStats := w.allocationStats(allocations)
	expectedCount := w.expectedCount(job)

	// find number of running allocs
	running, ok := allocationStats["running"]
	if !ok {
		running = 0
	}

	// construct result
	result := jobHealth{
		Job:     w.id,
		Running: running,
		Missing: expectedCount - running,
	}

	return structs.NewResponse(fetchedhealth, result), nil
}

func (w *health) expectedCount(job *nomad.Job) int {
	res := 0

	for _, group := range job.TaskGroups {
		res = res + *group.Count
	}

	return res
}

func (w *health) allocationStats(allocations []*api.AllocationListStub) map[string]int {

	res := make(map[string]int)
	for _, alloc := range allocations {
		if _, ok := res[alloc.ClientStatus]; !ok {
			res[alloc.ClientStatus] = 0
		}

		res[alloc.ClientStatus] = res[alloc.ClientStatus] + 1
	}

	return res
}

func (w *health) Key() string {
	w.parse()

	return fmt.Sprintf("/job/%s/health", w.id)
}

func (w *health) parse() {
	payload := w.action.Payload.(map[string]interface{})
	w.id = payload["id"].(string)
}

func (w *health) IsMutable() bool {
	return false
}

func (w *health) BackendType() string {
	return "nomad"
}
