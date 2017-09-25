package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	consul "github.com/hashicorp/consul/api"
	nomad "github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	consul_helper "github.com/jippi/hashi-ui/backend/consul/helper"
	"github.com/jippi/hashi-ui/backend/structs"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

func ConsulHandler(cfg *config.Config, nomadClient *nomad.Client, consulClient *consul.Client) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		connectionID := uuid.NewV4()
		logger := log.WithField("connection_id", connectionID.String()[:8])

		socket, err := websocketUpgrader.Upgrade(w, r, nil)
		if err != nil {
			logger.Errorf("transport: websocket upgrade failed: %s", err)
			return
		}

		params := mux.Vars(r)

		dc, ok := params["region"]
		if !ok {
			logger.Errorf("No region provided")
			requireConsulDC(socket, consulClient, logger)
			return
		}

		defer socket.Close()

		client, _ := consul_helper.NewDatacenterClient(cfg, dc)
		c := NewConnection(socket, nomadClient, client, logger, connectionID, cfg)
		c.Handle()
	}
}

func requireConsulDC(socket *websocket.Conn, client *consul.Client, logger *log.Entry) {
	var action structs.Action

	dcs, _ := client.Catalog().Datacenters()

	if len(dcs) == 1 {
		action = structs.Action{
			Type:    "CONSUL_SET_REGION",
			Payload: dcs[0],
		}
	} else {
		action = structs.Action{
			Type:    "CONSUL_FETCHED_REGIONS",
			Payload: dcs,
		}
	}

	sendAction(socket, &action, logger)

	var readAction structs.Action
	for {
		err := socket.ReadJSON(&readAction)
		if err != nil {
			break
		}

		logger.Debugf("Sending request for user to select a region in the UI again")
		sendAction(socket, &action, logger)
	}
}
