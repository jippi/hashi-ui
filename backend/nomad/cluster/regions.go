package cluster

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Regions             = "NOMAD_FETCH_REGIONS"
	fetchedNomadRegions = "NOMAD_FETCHED_REGIONS"
)

type regions struct {
	action structs.Action
	client *api.Client
}

func NewRegions(action structs.Action, client *api.Client) *regions {
	return &regions{
		action: action,
		client: client,
	}
}

func (w *regions) Do() (structs.Response, error) {
	keys, err := w.client.Regions().List()
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewResponse(fetchedNomadRegions, keys), nil
}

func (w *regions) Key() string {
	return "/regions"
}

func (w *regions) IsMutable() bool {
	return false
}

func (w *regions) BackendType() string {
	return "nomad"
}
