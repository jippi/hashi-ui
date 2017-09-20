package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchVersions   = "NOMAD_WATCH_JOB_VERSIONS"
	UnwatchVersions = "NOMAD_UNWATCH_JOB_VERSIONS"
	fetchedVersions = "NOMAD_FETCHED_JOB_VERSIONS"
)

type versions struct {
	action structs.Action
}

func NewVersions(action structs.Action) *versions {
	return &versions{
		action: action,
	}
}

func (w *versions) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	versions, _, meta, err := client.Jobs().Versions(w.action.Payload.(string), false, q)
	if err != nil {
		return nil, fmt.Errorf("watch: unable to fetch %s: %s", w.Key(), err)
	}

	if !query.Changed(q, meta) {
		return nil, nil
	}

	response := make([]*uint64, 0)
	for _, version := range versions {
		response = append(response, version.Version)
	}

	return &structs.Action{
		Index:   meta.LastIndex,
		Payload: response,
		Type:    fetchedVersions,
	}, nil
}

func (w *versions) Key() string {
	return fmt.Sprintf("/job/%s/versions", w.action.Payload.(string))
}

func (w *versions) IsMutable() bool {
	return false
}
