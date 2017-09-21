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

func (w *reconsileSummaries) Do() (*structs.Action, error) {
	err := w.client.System().ReconcileSummaries()
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Successfully reconsiled summaries",
	}, nil
}

func (w *reconsileSummaries) Key() string {
	return "/system/reconsile_summaries"
}

func (w *reconsileSummaries) IsMutable() bool {
	return true
}
