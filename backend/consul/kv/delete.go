package kv

import (
	"fmt"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Delete = "CONSUL_DELETE_KV_PAIR"
	clear  = "CONSUL_CLEAR_KV_PAIR"
)

type delete struct {
	action structs.Action
	client *api.Client
}

func NewDelete(action structs.Action, client *api.Client) *delete {
	return &delete{
		action: action,
		client: client,
	}
}

func (w *delete) Do() (*structs.Action, error) {
	params, ok := w.action.Payload.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Could not decode payload")
	}

	key := params["path"].(string)
	index := uint64(0)

	if val, ok := params["index"]; ok {
		index = uint64(val.(float64))
	}
	keyPair := &api.KVPair{Key: key, ModifyIndex: index}

	success, _, err := w.client.KV().DeleteCAS(keyPair, &api.WriteOptions{})
	if err != nil {
		return nil, fmt.Errorf("unable to delete consul kv '%s': %s", key, err)
	}

	if !success {
		return nil, fmt.Errorf("unable to delete consul kv '%s'", key)
	}

	// c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: fmt.Sprintf("Successfully deleted %s", key)}
	return &structs.Action{Type: clear}, nil
}

func (w *delete) Key() string {
	params := w.action.Payload.(map[string]interface{})

	return "/consul/kv/delete?key=" + params["path"].(string)
}

func (w *delete) IsMutable() bool {
	return false
}
