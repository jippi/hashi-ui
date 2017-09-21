package datacenters

import (
	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Datacenters        = "CONSUL_FETCH_REGIONS"
	fetchedDatacenters = "CONSUL_FETCHED_REGIONS"
)

type datacenters struct {
	action structs.Action
	client *api.Client
}

func NewDatacenters(action structs.Action, client *api.Client) *datacenters {
	return &datacenters{
		action: action,
		client: client,
	}
}

func (w *datacenters) Do() (*structs.Action, error) {
	keys, err := w.client.Catalog().Datacenters()
	if err != nil {
		return nil, err
	}

	return &structs.Action{
		Payload: keys,
		Type:    fetchedDatacenters,
	}, nil
}

func (w *datacenters) Key() string {
	return "/consul/catalog/datacenters"
}

func (w *datacenters) IsMutable() bool {
	return false
}
