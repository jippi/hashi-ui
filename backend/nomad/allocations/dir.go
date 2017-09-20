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
	action structs.Action
	id     string
	path   string
	alloc  *api.Allocation
	client *api.Client
}

func NewDir(action structs.Action) *dir {
	return &dir{
		action: action,
	}
}

// Do will watch the /job/:id endpoint for changes
func (w *dir) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	if w.alloc == nil {
		alloc, _, err := client.Allocations().Info(w.id, nil)
		if err != nil {
			return nil, err
		}
		w.alloc = alloc
	}

	if w.client == nil {
		w.client, _ = client.GetNodeClient(w.alloc.NodeID, nil)
	}

	dir, _, err := w.client.AllocFS().List(w.alloc, w.path, nil)
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Type:    fetchedDir,
		Payload: dir,
	}, nil
}

// Key will return the subscription key for the action
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
