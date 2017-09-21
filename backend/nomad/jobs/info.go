package jobs

import (
	"fmt"
	"strconv"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "NOMAD_FETCHED_JOB"
	WatchInfo   = "NOMAD_WATCH_JOB"
	UnwatchInfo = "NOMAD_UNWATCH_JOB"
)

type info struct {
	action  structs.Action
	client  *api.Client
	query   *api.QueryOptions
	id      string
	version *uint64
}

func NewInfo(action structs.Action, client *api.Client, query *api.QueryOptions) *info {
	return &info{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *info) Do() (*structs.Response, error) {
	var job *api.Job
	var err error
	var meta *api.QueryMeta

	if w.version == nil {
		job, meta, err = w.client.Jobs().Info(w.id, w.query)
	} else {
		var jobs []*api.Job
		jobs, _, meta, err = w.client.Jobs().Versions(w.id, false, w.query)

		for _, jobVersion := range jobs {
			if *jobVersion.Version == *w.version {
				job = jobVersion
				break
			}
		}
	}

	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return nil, nil
	}

	return structs.NewResultWithIndex(fetchedInfo, job, meta.LastIndex), nil
}

func (w *info) Key() string {
	w.parse()

	version := "latest"

	if w.version != nil {
		version = fmt.Sprintf("%d", *w.version)
	}

	return fmt.Sprintf("/job/%s/version/%s", w.id, version)
}

func (w *info) IsMutable() bool {
	return false
}

func (w *info) parse() {
	payload := w.action.Payload.(map[string]interface{})
	w.id = payload["id"].(string)

	if v, ok := payload["version"]; ok {
		jobVersion, _ := strconv.ParseUint(v.(string), 10, 64)
		w.version = &jobVersion
	}
}
