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

func (w *forceGC) Do() (*structs.Response, error) {
	err := w.client.System().GarbageCollect()
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewSuccessResponse("Successfully forced a gc")
}

func (w *forceGC) Key() string {
	return "/system/force_gc"
}

func (w *forceGC) IsMutable() bool {
	return true
}
