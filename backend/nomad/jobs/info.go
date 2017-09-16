package jobs

import (
	"fmt"
	"strconv"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "NOMAD_FETCHED_JOB"
	WatchInfo   = "NOMAD_WATCH_JOB"
	UnwatchInfo = "NOMAD_UNWATCH_JOB"
)

type info struct {
	action  structs.Action
	id      string
	version *uint64
}

func NewInfo(action structs.Action) *info {
	return &info{
		action: action,
	}
}

func (w *info) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	var job *api.Job
	var err error
	var meta *api.QueryMeta

	if w.version == nil {
		job, meta, err = client.Jobs().Info(w.id, q)
	} else {
		var jobs []*api.Job
		jobs, _, meta, err = client.Jobs().Versions(w.id, false, q)

		for _, jobVersion := range jobs {
			if *jobVersion.Version == *w.version {
				job = jobVersion
				break
			}
		}
	}

	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: job,
		Type:    fetchedInfo,
	}, nil
}

func (w *info) Key() string {
	w.parse()

	version := "latest"

	if w.version != nil {
		version = fmt.Sprintf("%d", *w.version)
	}

	return fmt.Sprintf("/job/%s/version/%s", w.id, version)
}

func (w *info) parse() {
	payload := w.action.Payload.(map[string]interface{})
	w.id = payload["id"].(string)

	if v, ok := payload["version"]; ok {
		jobVersion, _ := strconv.ParseUint(v.(string), 10, 64)
		w.version = &jobVersion
	}
}
