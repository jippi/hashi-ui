package kv

import (
	"fmt"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Set = "CONSUL_SET_KV_PAIR"
)

type set struct {
	action structs.Action
	client *api.Client
}

func NewSet(action structs.Action, client *api.Client) *set {
	return &set{
		action: action,
		client: client,
	}
}

func (w *set) Do() (*structs.Response, error) {
	params, ok := w.action.Payload.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Could not decode payload")
	}

	key := params["path"].(string)
	value := params["value"].(string)
	index := uint64(0)

	if val, ok := params["index"]; ok {
		index = uint64(val.(float64))
	}

	keyPair := &api.KVPair{Key: key, Value: []byte(value), ModifyIndex: index}

	res, _, err := w.client.KV().CAS(keyPair, nil)
	if err != nil {
		return structs.NewErrorResponse("unable to write consul kv '%s': %s", key, err)
	}

	if !res {
		return structs.NewErrorResponse("unable to write consul kv '%s': %s", key, err)
	}

	// TODO: make it so a method can return multiple results if needed
	if key[len(key)-1:] != "/" {
		c := NewInfo(structs.Action{Type: FetchInfo, Payload: key}, w.client, &api.QueryOptions{})
		return c.Do()
	}

	return structs.NewSuccessResponse("Successfully wrote key value")
}

func (w *set) Key() string {
	params := w.action.Payload.(map[string]interface{})

	return "/consul/kv/set?key=" + params["path"].(string)
}

func (w *set) IsMutable() bool {
	return false
}

func (w *set) BackendType() string {
	return "consul"
}
