package cluster

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ReconsileSummaries = "NOMAD_RECONCILE_SYSTEM"
)

type reconsileSummaries struct {
	action structs.Action
	client *api.Client
}

func NewReconsileSummaries(action structs.Action, client *api.Client) *reconsileSummaries {
	return &reconsileSummaries{
		action: action,
		client: client,
	}
}

func (w *reconsileSummaries) Do() (*structs.Response, error) {
	err := w.client.System().ReconcileSummaries()
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully reconsiled summaries")
}

func (w *reconsileSummaries) Key() string {
	return "/system/reconsile_summaries"
}

func (w *reconsileSummaries) IsMutable() bool {
	return true
}

func (w *reconsileSummaries) BackendType() string {
	return "nomad"
}
