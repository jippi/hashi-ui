package services

import (
	"fmt"
	"net"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	DeregisterCheck = "CONSUL_DEREGISTER_SERVICE_CHECK"
)

type deregisterCheck struct {
	action structs.Action
	client *api.Client
	cfg    *config.Config

	nodeAddr string
	checkID  string
}

func NewDeregisterCheck(action structs.Action, cfg *config.Config, client *api.Client) *deregisterCheck {
	return &deregisterCheck{
		action: action,
		cfg:    cfg,
		client: client,
	}
}

func (w *deregisterCheck) Do() (structs.Response, error) {
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

	err = client.Agent().CheckDeregister(w.checkID)
	if err != nil {
		return structs.NewErrorResponse("unable to deregister check '%s': %s", w.checkID, err)
	}

	return structs.NewSuccessResponse("The service check has been successfully deregistered")
}

func (w *deregisterCheck) Key() string {
	params, _ := w.action.Payload.(map[string]interface{})

	w.nodeAddr = params["nodeAddress"].(string)
	w.checkID = params["checkID"].(string)

	return fmt.Sprintf("/consul/service/deregister_check?node=%s&check_id=%s", w.nodeAddr, w.checkID)
}

func (w *deregisterCheck) IsMutable() bool {
	return true
}

func (w *deregisterCheck) BackendType() string {
	return "consul"
}
