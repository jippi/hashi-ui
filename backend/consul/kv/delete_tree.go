package kv

import (
	"fmt"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	DeleteTree = "CONSUL_DELETE_KV_FOLDER"
)

type deleteTree struct {
	action structs.Action
	client *api.Client
}

func NewDeleteTree(action structs.Action, client *api.Client) *deleteTree {
	return &deleteTree{
		action: action,
		client: client,
	}
}

func (w *deleteTree) Do() (*structs.Action, error) {
	key := w.action.Payload.(string)

	_, err := w.client.KV().DeleteTree(key, &api.WriteOptions{})
	if err != nil {
		return nil, fmt.Errorf("unable to deleteTree consul kv '%s': %s", key, err)
	}

	// c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: fmt.Sprintf("Successfully deleteTreed %s", key)}
	return &structs.Action{
		Type:    structs.SuccessNotification,
		Payload: fmt.Sprintf("The tree was successfully deleted: %s.", key),
	}, nil
}

func (w *deleteTree) Key() string {
	return "/consul/kv/delete_tree?key=" + w.action.Payload.(string)
}

func (w *deleteTree) IsMutable() bool {
	return false
}
