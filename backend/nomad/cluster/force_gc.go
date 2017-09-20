package cluster

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ForceGC = "NOMAD_FORCE_GC"
)

type forceGC struct {
	action structs.Action
}

func NewForceGC(action structs.Action) *forceGC {
	return &forceGC{
		action: action,
	}
}

func (w *forceGC) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	err := client.System().GarbageCollect()
	if err != nil {
		return nil, fmt.Errorf("Failed to force a gc: %s", err)
	}

	return &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully forced a gc."}, nil
}

func (w *forceGC) Key() string {
	return "/system/force_gc"
}

func (w *forceGC) IsMutable() bool {
	return true
}
