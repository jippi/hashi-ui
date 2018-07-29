package services

import (
	"fmt"
	"net"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	Deregister = "CONSUL_DEREGISTER_SERVICE"
)

type deregister struct {
	action structs.Action
	client *api.Client
	cfg    *config.Config

	nodeAddr  string
	serviceID string
}

func NewDeregister(action structs.Action, cfg *config.Config, client *api.Client) *deregister {
	return &deregister{
		action: action,
		cfg:    cfg,
		client: client,
	}
}

func (w *deregister) Do() (structs.Response, error) {
	_, port, _ := net.SplitHostPort(w.cfg.ConsulAddress)
	if port == "" {
		port = "80"
	}

	config := api.DefaultConfig()
	config.Address = w.nodeAddr + ":" + port
	config.Token = w.cfg.ConsulACLToken

	client, err := api.NewClient(config)
	if err != nil {
		return structs.NewErrorResponse("unable to create consul client : %s", err)
	}

	err = client.Agent().ServiceDeregister(w.serviceID)
	if err != nil {
		return structs.NewErrorResponse("unable to deregister consul service '%s': %s", w.serviceID, err)
	}

	return structs.NewSuccessResponse("The service has been successfully deregistered")
}

func (w *deregister) Key() string {
	params, _ := w.action.Payload.(map[string]interface{})

	w.nodeAddr = params["nodeAddress"].(string)
	w.serviceID = params["serviceID"].(string)

	return fmt.Sprintf("/consul/service/deregister?node=%s&service=%s", w.nodeAddr, w.serviceID)
}

func (w *deregister) IsMutable() bool {
	return true
}

func (w *deregister) BackendType() string {
	return "consul"
}
