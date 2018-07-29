package sessions

import (
	"fmt"
	"net"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	DestroySession   = "CONSUL_DESTROY_SESSION"
	destroyedSession = "CONSUL_DESTROYED_SESSION"
)

type destroy struct {
	action structs.Action
	client *api.Client
	cfg    *config.Config
	opt    *api.WriteOptions

	nodeAddr  string
	sessionID string
}

func NewDestroy(action structs.Action, cfg *config.Config, client *api.Client, opt *api.WriteOptions) *destroy {
	return &destroy{
		action: action,
		cfg:    cfg,
		client: client,
		opt:    opt,
	}
}

func (w *destroy) Do() (structs.Response, error) {
	_, port, _ := net.SplitHostPort(w.cfg.ConsulAddress)
	if port == "" {
		port = "80"
	}

	cfg := api.DefaultConfig()
	cfg.Address = fmt.Sprintf("%s:%s", w.nodeAddr, port)
	cfg.Token = w.cfg.ConsulACLToken

	client, err := api.NewClient(cfg)
	if err != nil {
		return structs.NewErrorResponse("unable to create consul client: %s", err)
	}

	_, err = client.Session().Destroy(w.sessionID, w.opt)
	if err != nil {
		return structs.NewErrorResponse("unable to destroy consul session")
	}

	return structs.NewResponse(destroyedSession, map[string]string{"ID": w.sessionID}), nil
}

func (w *destroy) Key() string {
	params, _ := w.action.Payload.(map[string]interface{})
	w.nodeAddr = params["nodeAddress"].(string)
	w.sessionID = params["sessionID"].(string)
	return fmt.Sprintf("/consul/session/destroy/%s", w.sessionID)
}

func (destroy) IsMutable() bool {
	return true
}

func (destroy) BackendType() string {
	return "consul"
}
