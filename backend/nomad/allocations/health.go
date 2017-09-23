package allocations

import (
	"fmt"
	"strings"

	consul "github.com/hashicorp/consul/api"
	nomad "github.com/hashicorp/nomad/api"
	consul_helper "github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedHealth = "NOMAD_FETCHED_ALLOCATION_HEALTH"
	UnwatchHealth = "NOMAD_UNWATCH_ALLOCATION_HEALTH"
	WatchHealth   = "NOMAD_WATCH_ALLOCATION_HEALTH"
)

type health struct {
	action       structs.Action
	nomad        *nomad.Client
	consul       *consul.Client
	consulQuery  *consul.QueryOptions
	clientID     string
	allocationID string
	clientName   string
}

func NewHealth(action structs.Action, nomad *nomad.Client, consul *consul.Client, consulQuery *consul.QueryOptions) *health {
	return &health{
		action:      action,
		nomad:       nomad,
		consul:      consul,
		consulQuery: consulQuery,
	}
}

func (w *health) Do() (*structs.Response, error) {
	// find the client name (we assume it matches the consul name)
	if w.clientName == "" {
		info, _, err := w.nomad.Nodes().Info(w.clientID, nil)
		if err != nil {
			return structs.NewErrorResponse(err)
		}
		w.clientName = info.Name
	}

	// lookup health for the consul client
	checks, meta, err := w.consul.Health().Node(w.clientName, w.consulQuery)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !consul_helper.QueryChanged(w.consulQuery, meta) {
		return nil, nil
	}

	result := make(map[string]string)
	status := make(map[string]int)
	var healthy *bool
	total := 0

	for _, check := range checks {
		// nomad managed service ids got the following format
		// "_nomad-executor-${ALLOC_ID}-*",
		if !strings.Contains(check.ServiceID, "_nomad-executor-"+w.allocationID) {
			continue
		}

		total = total + 1

		result[check.Name] = check.Status

		if _, ok := status[check.Status]; !ok {
			status[check.Status] = 1
		} else {
			status[check.Status] = status[check.Status] + 1
		}

		if healthy != nil && *healthy == false {
			continue
		}

		if check.Status == "passing" {
			healthy = boolToPtr(true)
		} else {
			healthy = boolToPtr(false)
		}
	}

	response := struct {
		ID      string
		Checks  map[string]string
		Count   map[string]int
		Total   int
		Healthy *bool
	}{
		ID:      w.allocationID,
		Checks:  result,
		Count:   status,
		Total:   total,
		Healthy: healthy,
	}

	return structs.NewResponseWithIndex(fetchedHealth, response, meta.LastIndex)
}

func (w *health) Key() string {
	w.parse()

	return fmt.Sprintf("/allocation/%s/health?client=%s", w.allocationID, w.clientID)
}

func (w *health) IsMutable() bool {
	return false
}

func (w *health) parse() {
	params := w.action.Payload.(map[string]interface{})
	w.allocationID = params["id"].(string)
	w.clientID = params["client"].(string)
}

func boolToPtr(b bool) *bool {
	return &b
}
