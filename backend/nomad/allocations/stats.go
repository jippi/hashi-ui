package allocations

import (
"time"

"github.com/hashicorp/nomad/api"
"github.com/jippi/hashi-ui/backend/structs"
	"fmt"
)

const (
	fetchedStats       = "NOMAD_FETCHED_ALLOC_STATS"
	WatchStats         = "NOMAD_WATCH_ALLOC_STATS"
	UnwatchStats       = "NOMAD_UNWATCH_ALLOC_STATS"
)

type stats struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions
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
	ticker := time.NewTicker(5 * time.Second) // fetch stats once in a while
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
	allocation, _, err := w.client.Allocations().Info(w.action.Payload.(string), w.query)
	if err != nil {
		return
	}

	stats, err := w.client.Allocations().Stats(allocation, w.query)
	if err != nil {
		return
	}

	send <- &structs.Action{Type: fetchedStats, Payload: &stats}
}

func (w *stats) Key() string {
	return fmt.Sprintf("/allocation/%s/stats", w.action.Payload.(string))
}

func (w *stats) IsMutable() bool {
	return false
}
