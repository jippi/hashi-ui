package cluster

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ReconsileSummaries = "NOMAD_RECONCILE_SYSTEM"
)

type reconsileSummaries struct {
	action structs.Action
}

func NewReconsileSummaries(action structs.Action) *reconsileSummaries {
	return &reconsileSummaries{
		action: action,
	}
}

func (w *reconsileSummaries) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	err := client.System().ReconcileSummaries()
	if err != nil {
		return nil, fmt.Errorf("Failed to reconsile summaries: %s", err)
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully reconsiled summaries."}, nil
}

func (w *reconsileSummaries) Key() string {
	return "/system/reconsile_summaries"
}

func (w *reconsileSummaries) IsMutable() bool {
	return true
}
