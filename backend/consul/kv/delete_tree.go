package kv

import (
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

func (w *deleteTree) Do() (structs.Response, error) {
	key := w.action.Payload.(string)

	_, err := w.client.KV().DeleteTree(key, &api.WriteOptions{})
	if err != nil {
		return structs.NewErrorResponse("unable to deleteTree consul kv '%s': %s", key, err)
	}

	return structs.NewSuccessResponse("The tree was successfully deleted: %s", key)
}

func (w *deleteTree) Key() string {
	return "/consul/kv/delete_tree?key=" + w.action.Payload.(string)
}

func (w *deleteTree) IsMutable() bool {
	return true
}

func (w *deleteTree) BackendType() string {
	return "consul"
}
