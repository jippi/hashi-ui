package allocations

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	FetchDir   = "NOMAD_FETCH_DIR"
	fetchedDir = "NOMAD_FETCHED_DIR"
)

type dir struct {
	action     structs.Action
	id         string
	path       string
	alloc      *api.Allocation
	client     *api.Client
	nodeClient *api.Client
}

func NewDir(action structs.Action, client *api.Client) *dir {
	return &dir{
		action: action,
		client: client,
	}
}

func (w *dir) Do() (*structs.Action, error) {
	if w.alloc == nil {
		alloc, _, err := w.client.Allocations().Info(w.id, nil)
		if err != nil {
			return nil, err
		}
		w.alloc = alloc
	}

	if w.client == nil {
		w.nodeClient, _ = w.client.GetNodeClient(w.alloc.NodeID, nil)
	}

	dir, _, err := w.nodeClient.AllocFS().List(w.alloc, w.path, nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    fetchedDir,
		Payload: dir,
	}, nil
}

func (w *dir) Key() string {
	w.parse()

	return fmt.Sprintf("/allocation/%s/dir?path=%s", w.id, w.path)
}

func (w *dir) IsMutable() bool {
	return false
}

func (w *dir) parse() {
	params := w.action.Payload.(map[string]interface{})
	w.id = params["allocID"].(string)
	w.path = params["path"].(string)
}
