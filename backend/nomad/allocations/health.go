package allocations

import (
	"crypto/sha1"
	"encoding/base32"
	"fmt"
	"io"
	"sort"
	"strings"

	consul "github.com/hashicorp/consul/api"
	lru "github.com/hashicorp/golang-lru"
	nomad "github.com/hashicorp/nomad/api"
	consul_helper "github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedHealth = "NOMAD_FETCHED_ALLOCATION_HEALTH"
	UnwatchHealth = "NOMAD_UNWATCH_ALLOCATION_HEALTH"
	WatchHealth   = "NOMAD_WATCH_ALLOCATION_HEALTH"
)

type allocationHealthResponse struct {
	ID      string
	Checks  map[string]string
	Count   map[string]int
	Total   int
	Healthy *bool
}

type health struct {
	action       structs.Action
	nomad        *nomad.Client
	consul       *consul.Client
	consulQuery  *consul.QueryOptions
	clientID     string
	allocationID string
	fetched      bool
	clientName   string
	hashes       []string
}

var (
	clientConsulDatacenterMap, _ = lru.New(128)
	clientNameMap, _             = lru.New(128)
	allocationHashes, _          = lru.New(512)
	b32                          = base32.NewEncoding(strings.ToLower("abcdefghijklmnopqrstuvwxyz234567"))
)

func NewHealth(action structs.Action, nomad *nomad.Client, consul *consul.Client, consulQuery *consul.QueryOptions) *health {
	return &health{
		action:      action,
		nomad:       nomad,
		consul:      consul,
		consulQuery: consulQuery,
		hashes:      make([]string, 0),
	}
}

func (w *health) Do() (*structs.Response, error) {
	if w.consul == nil {
		return structs.NewErrorResponse("")
	}

	// find the client name (we assume it matches the consul name)
	if w.clientName == "" {
		if !clientNameMap.Contains(w.clientID) {
			node, _, err := w.nomad.Nodes().Info(w.clientID, nil)
			if err != nil {
				return structs.NewErrorResponse(err)
			}

			// make sure to query the right Consul DC
			datacenter, ok := node.Attributes["consul.datacenter"]
			if !ok || datacenter == "" {
				return structs.NewErrorResponse("Node is not linked to a Consul DC")
			}

			clientNameMap.Add(w.clientID, node.Name)
			clientConsulDatacenterMap.Add(w.clientID, datacenter)
		}

		if clientName, ok := clientNameMap.Get(w.clientID); ok {
			w.clientName = clientName.(string)
		}

		if dc, ok := clientConsulDatacenterMap.Get(w.clientID); ok {
			w.consulQuery.Datacenter = dc.(string)
		}
	}

	if w.clientName == "" {
		return structs.NewErrorResponse("w.clientName missing")
	}

	// lookup health for the consul client
	consulChecks, meta, err := w.consul.Health().Node(w.clientName, w.consulQuery)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if !consul_helper.QueryChanged(w.consulQuery, meta) {
		return nil, nil
	}

	if !w.fetched {
		w.fetched = true

		if !allocationHashes.Contains(w.allocationID) {
			allocation, _, err := w.nomad.Allocations().Info(w.allocationID, nil)
			if err != nil {
				return structs.NewErrorResponse(err)
			}

			for _, taskGroup := range allocation.Job.TaskGroups {
				if *taskGroup.Name != allocation.TaskGroup {
					continue
				}

				for _, task := range taskGroup.Tasks {
					for _, service := range task.Services {
						sHash := serviceHash(w.allocationID, task.Name, service)
						for _, serviceCheck := range service.Checks {
							for _, consulCheck := range consulChecks {
								if !strings.Contains(consulCheck.ServiceID, sHash) {
									continue
								}

								role := strings.Split(consulCheck.ServiceID, "-")[1]
								w.hashes = append(w.hashes, checkHash(fmt.Sprintf("_nomad-%s-%s", role, sHash), serviceCheck))
							}
						}
					}
				}
			}

			allocationHashes.Add(w.allocationID, w.hashes)
		}

		if hashes, ok := allocationHashes.Get(w.allocationID); ok {
			w.hashes = hashes.([]string)
		}
	}

	result := make(map[string]string)
	status := make(map[string]int)
	var healthy *bool
	total := 0

	for _, check := range consulChecks {
		found := false

		for _, hash := range w.hashes {
			if check.CheckID == hash {
				found = true
			}
		}

		if !found {
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

	response := &allocationHealthResponse{
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

func (w *health) BackendType() string {
	return "nomad"
}

func (w *health) parse() {
	params := w.action.Payload.(map[string]interface{})
	w.allocationID = params["id"].(string)
	w.clientID = params["client"].(string)
}

func boolToPtr(b bool) *bool {
	return &b
}

func checkHash(serviceID string, sc nomad.ServiceCheck) string {
	h := sha1.New()
	io.WriteString(h, serviceID)
	io.WriteString(h, sc.Name)
	io.WriteString(h, sc.Type)
	io.WriteString(h, sc.Command)
	io.WriteString(h, strings.Join(sc.Args, ""))
	io.WriteString(h, sc.Path)
	io.WriteString(h, sc.Protocol)
	io.WriteString(h, sc.PortLabel)
	io.WriteString(h, sc.Interval.String())
	io.WriteString(h, sc.Timeout.String())
	io.WriteString(h, sc.Method)

	// Only include TLSSkipVerify if set to maintain ID stability with Nomad <0.6
	if sc.TLSSkipVerify {
		io.WriteString(h, "true")
	}

	// Since map iteration order isn't stable we need to write k/v pairs to
	// a slice and sort it before hashing.
	if len(sc.Header) > 0 {
		headers := make([]string, 0, len(sc.Header))
		for k, v := range sc.Header {
			headers = append(headers, k+strings.Join(v, ""))
		}
		sort.Strings(headers)
		io.WriteString(h, strings.Join(headers, ""))
	}

	// Only include AddressMode if set to maintain ID stability with Nomad <0.7.1
	if len(sc.AddressMode) > 0 {
		io.WriteString(h, sc.AddressMode)
	}

	return fmt.Sprintf("%x", h.Sum(nil))
}

func serviceHash(allocID, taskName string, s *nomad.Service) string {
	h := sha1.New()
	io.WriteString(h, allocID)
	io.WriteString(h, taskName)
	io.WriteString(h, s.Name)
	io.WriteString(h, s.PortLabel)
	io.WriteString(h, s.AddressMode)
	for _, tag := range s.Tags {
		io.WriteString(h, tag)
	}

	// Base32 is used for encoding the hash as sha1 hashes can always be
	// encoded without padding, only 4 bytes larger than base64, and saves
	// 8 bytes vs hex. Since these hashes are used in Consul URLs it's nice
	// to have a reasonably compact URL-safe representation.
	return b32.EncodeToString(h.Sum(nil))
}
