package jobs

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchVersions   = "NOMAD_WATCH_JOB_VERSIONS"
	UnwatchVersions = "NOMAD_UNWATCH_JOB_VERSIONS"
	fetchedVersions = "NOMAD_FETCHED_JOB_VERSIONS"
)

type versions struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
}

func NewVersions(action structs.Action, client *api.Client, query *api.QueryOptions) *versions {
	return &versions{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *versions) Do() (structs.Response, error) {
	versions, _, meta, err := w.client.Jobs().Versions(w.action.Payload.(string), false, w.query)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !helper.QueryChanged(w.query, meta) {
		return structs.NewNoopResponse()
	}

	response := make([]*uint64, 0)
	for _, version := range versions {
		response = append(response, version.Version)
	}

	return structs.NewResponseWithIndex(fetchedVersions, response, meta.LastIndex)
}

func (w *versions) Key() string {
	return fmt.Sprintf("/job/%s/versions", w.action.Payload.(string))
}

func (w *versions) IsMutable() bool {
	return false
}

func (w *versions) BackendType() string {
	return "nomad"
}
