package nodes

import (
	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedClientStats = "NOMAD_FETCHED_CLIENT_STATS"
	FetchClientStats   = "NOMAD_FETCH_CLIENT_STATS"
	WatchStats         = "NOMAD_WATCH_CLIENT_STATS"
	UnwatchStats       = "NOMAD_UNWATCH_CLIENT_STATS"
)

type stats struct {
	action structs.Action
}

func NewStats(action structs.Action) *stats {
	return &stats{
		action: action,
	}
}

func (w *stats) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	ID := w.action.Payload.(string)

	stats, err := client.Nodes().Stats(ID, nil)
	if err != nil {
		return nil, fmt.Errorf("Failed to force leave the client: %s", err)
	}

	return &structs.Action{Type: fetchedClientStats, Payload: stats}, nil
}

func (w *stats) Key() string {
	return "/node/" + w.action.Payload.(string) + "/stats"
}

func (w *stats) IsMutable() bool {
	return false
}
