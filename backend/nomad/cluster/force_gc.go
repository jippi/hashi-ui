package cluster

import (
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	ForceGC = "NOMAD_FORCE_GC"
)

type forceGC struct {
	action structs.Action
	client *api.Client
}

func NewForceGC(action structs.Action, client *api.Client) *forceGC {
	return &forceGC{
		action: action,
		client: client,
	}
}

func (w *forceGC) Do() (*structs.Action, error) {
	err := w.client.System().GarbageCollect()
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: "Successfully forced a gc",
	}, nil
}

func (w *forceGC) Key() string {
	return "/system/force_gc"
}

func (w *forceGC) IsMutable() bool {
	return true
}
