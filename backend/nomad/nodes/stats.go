package nodes

import (
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
	client *api.Client
}

func NewStats(action structs.Action, client *api.Client) *stats {
	return &stats{
		action: action,
		client: client,
	}
}

func (w *stats) Do() (*structs.Response, error) {
	ID := w.action.Payload.(string)

	stats, err := w.client.Nodes().Stats(ID, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	return structs.NewResponse(fetchedClientStats, stats), nil
}

func (w *stats) Key() string {
	return "/node/" + w.action.Payload.(string) + "/stats"
}

func (w *stats) IsMutable() bool {
	return false
}
