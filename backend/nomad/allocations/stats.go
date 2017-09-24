package allocations

import (
	"time"

	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedStats = "NOMAD_FETCHED_ALLOC_STATS"
	WatchStats   = "NOMAD_WATCH_ALLOC_STATS"
	UnwatchStats = "NOMAD_UNWATCH_ALLOC_STATS"
)

type stats struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions

	id         string
	allocation *api.Allocation
}

func NewStats(action structs.Action, client *api.Client, query *api.QueryOptions) *stats {
	return &stats{
		action: action,
		client: client,
		query:  query,
	}
}

//func (w *stats) Do() (*structs.Response, error) {
func (w *stats) Do(send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan struct{}) (*structs.Response, error) {
	ticker := time.NewTicker(3 * time.Second) // fetch stats once in a while
	timer := time.NewTimer(0 * time.Second)   // fetch stats right away

	for {
		select {
		case <-destroyCh:
			return nil, nil

		case <-subscribeCh:
			return nil, nil

		case <-timer.C:
			w.work(w.client, send, subscribeCh)

		case <-ticker.C:
			w.work(w.client, send, subscribeCh)
		}
	}
}

func (w *stats) work(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}) {
	// cache the allocation object since it doesn't change between calls
	if w.allocation == nil {
		allocation, _, err := w.client.Allocations().Info(w.id, w.query)
		if err != nil {
			return
		}
		w.allocation = allocation
	}

	stats, err := w.client.Allocations().Stats(w.allocation, w.query)
	if err != nil {
		return
	}

	response := struct {
		Stats *api.AllocResourceUsage
		ID    string
	}{
		Stats: stats,
		ID:    w.allocation.ID,
	}

	send <- &structs.Action{
		Type:    fetchedStats,
		Payload: response,
	}
}

func (w *stats) Key() string {
	w.parse()

	return fmt.Sprintf("/allocation/%s/stats", w.id)
}

func (w *stats) parse() {
	params := w.action.Payload.(map[string]interface{})
	w.id = params["ID"].(string)
}

func (w *stats) IsMutable() bool {
	return false
}
