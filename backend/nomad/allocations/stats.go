package allocations

import (
	"time"

	"fmt"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedStats       = "NOMAD_FETCHED_ALLOC_STATS"
	fetchedStatsSimple = "NOMAD_FETCHED_ALLOC_STATS_SIMPLE"
	WatchStats         = "NOMAD_WATCH_ALLOC_STATS"
	UnwatchStats       = "NOMAD_UNWATCH_ALLOC_STATS"
)

type stats struct {
	action structs.Action
	client *api.Client
	query  *api.QueryOptions

	id         string
	simple     bool
	interval   *time.Duration
	allocation *api.Allocation
}

func NewStats(action structs.Action, client *api.Client, query *api.QueryOptions) *stats {
	return &stats{
		action: action,
		client: client,
		query:  query,
	}
}

func (w *stats) Do(send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan interface{}) (structs.Response, error) {
	ticker := time.NewTicker(*w.interval)   // fetch stats once in a while
	timer := time.NewTimer(0 * time.Second) // fetch stats right away

	for {
		select {
		case <-destroyCh:
			return structs.NewNoopResponse()

		case <-subscribeCh:
			return structs.NewNoopResponse()

		case <-timer.C:
			if err := w.work(w.client, send, subscribeCh); err != nil {
				return structs.NewErrorResponse(err)
			}

		case <-ticker.C:
			if err := w.work(w.client, send, subscribeCh); err != nil {
				return structs.NewErrorResponse(err)
			}
		}
	}
}

func (w *stats) work(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}) error {
	// cache the allocation object since it doesn't change between calls
	if w.allocation == nil {
		allocation, _, err := w.client.Allocations().Info(w.id, w.query)
		if err != nil {
			return err
		}
		w.allocation = allocation
	}

	stats, err := w.client.Allocations().Stats(w.allocation, w.query)
	if err != nil {
		return err
	}

	response := struct {
		Stats         *api.AllocResourceUsage
		Resources     *api.Resources
		TaskResources map[string]*api.Resources
		ID            string
	}{
		Stats:         stats,
		Resources:     w.allocation.Resources,
		TaskResources: w.allocation.TaskResources,
		ID:            w.allocation.ID,
	}

	eventType := fetchedStats
	if w.simple {
		eventType = fetchedStatsSimple
	}

	send <- &structs.Action{
		Type:    eventType,
		Payload: response,
	}

	return nil
}

func (w *stats) Key() string {
	w.parse()

	return fmt.Sprintf("/allocation/%s/stats?simple=%v&interval=%v", w.id, w.simple, w.interval)
}

func (w *stats) parse() {
	params := w.action.Payload.(map[string]interface{})
	w.id = params["ID"].(string)
	if simple, ok := params["simple"]; ok {
		w.simple = simple.(bool)
	}
	if interval, ok := params["interval"]; ok {
		interval, err := time.ParseDuration(interval.(string))
		if err == nil {
			w.interval = &interval
		}
	}

	if w.interval == nil {
		v := 1 * time.Second
		w.interval = &v
	}
}

func (w *stats) IsMutable() bool {
	return false
}

func (w *stats) BackendType() string {
	return "nomad"
}
