package main

import (
	"io"
	"net/http"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	consul_helper "github.com/jippi/hashi-ui/backend/consul/helper"
	nomad_helper "github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

const (
	fetchNomadRegions   = "NOMAD_FETCH_REGIONS"
	fetchedNomadRegions = "NOMAD_FETCHED_REGIONS"
	unknownNomadRegion  = "NOMAD_UNKNOWN_REGION"
)

// NomadHandler establishes the websocket connection and calls the connection handler.
func NomadHandler(cfg *config.Config) func(w http.ResponseWriter, r *http.Request) {
	nomadClient, _ := nomad_helper.NewRegionClient(cfg, "")
	consulClient, _ := consul_helper.NewDatacenterClient(cfg, "")

	return func(w http.ResponseWriter, r *http.Request) {
		connectionID := uuid.NewV4()
		logger := log.WithField("connection_id", connectionID.String()[:8])

		socket, err := websocketUpgrader.Upgrade(w, r, nil)
		if err != nil {
			logger.Errorf("transport: websocket upgrade failed: %s", err)
			return
		}

		params := mux.Vars(r)

		region, ok := params["region"]
		if !ok {
			logger.Errorf("No region provided")
			requireNomadRegion(socket, nomadClient, logger)
			return
		}

		defer socket.Close()

		client, _ := nomad_helper.NewRegionClient(cfg, region)
		c := NewConnection(socket, client, consulClient, logger, connectionID, cfg)
		c.Handle()
	}
}

func requireNomadRegion(socket *websocket.Conn, client *api.Client, logger *log.Entry) {
	var action structs.Action

	regions, _ := client.Regions().List()

	if len(regions) == 1 {
		action = structs.Action{
			Type:    "NOMAD_SET_REGION",
			Payload: regions[0],
		}
	} else {
		action = structs.Action{
			Type:    "NOMAD_FETCHED_REGIONS",
			Payload: regions,
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

// DownloadFile ...
func NomadDownloadFile(cfg *config.Config) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		connectionID := uuid.NewV4()
		logger := log.WithField("connection_id", connectionID.String()[:8])

		params := mux.Vars(r)
		region := params["region"]

		regionClient, _ := nomad_helper.NewRegionClient(cfg, region)

		c := r.URL.Query().Get("client")
		allocID := r.URL.Query().Get("allocID")
		if c == "" || allocID == "" {
			http.Error(w, "client or allocID should be passed.", http.StatusBadRequest)
			return
		}

		alloc, _, err := regionClient.Allocations().Info(allocID, nil)
		if err != nil {
			logger.Errorf("Unable to fetch alloc: %s", err)
			http.Error(w, "Could not fetch the allocation.", http.StatusInternalServerError)
			return
		}

		path := params["path"]
		file, err := regionClient.AllocFS().Cat(alloc, path, nil)
		if err != nil {
			logger.Errorf("Unable to cat file: %s", err)
			http.Error(w, "Could not fetch the file.", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(path))
		w.Header().Set("Content-Type", "application/octet-stream")

		logger.Infof("download: streaming %q to client", path)

		io.Copy(w, file)
	}
}
