package nomad

import (
	"io"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

const (
	fetchNomadRegions   = "NOMAD_FETCH_REGIONS"
	fetchedNomadRegions = "NOMAD_FETCHED_REGIONS"
	unknownNomadRegion  = "NOMAD_UNKNOWN_REGION"
)

var websocketUpgrader = websocket.Upgrader{
	// Allow all requests
	CheckOrigin: func(r *http.Request) bool { return true },
}

// newRegionClient derp
func newRegionClient(c *config.Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.NomadAddress
	config.WaitTime = 1 * time.Minute
	config.Region = region
	config.TLSConfig = &api.TLSConfig{
		CACert:     c.NomadCACert,
		ClientCert: c.NomadClientCert,
		ClientKey:  c.NomadClientKey,
		Insecure:   c.NomadSkipVerify,
	}

	return api.NewClient(config)
}

// Handler establishes the websocket connection and calls the connection handler.
func Handler(cfg *config.Config) func(w http.ResponseWriter, r *http.Request) {
	defaultClient, _ := newRegionClient(cfg, "")

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
			requireNomadRegion(socket, defaultClient, logger)
			return
		}

		defer socket.Close()

		client, _ := newRegionClient(cfg, region)
		c := NewConnection(socket, client, logger, connectionID, cfg)
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

func sendAction(socket *websocket.Conn, action *structs.Action, logger *log.Entry) {
	if err := socket.WriteJSON(action); err != nil {
		logger.Errorf(" %s", err)
	}
}

// DownloadFile ...
func DownloadFile(cfg *config.Config) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		connectionID := uuid.NewV4()
		logger := log.WithField("connection_id", connectionID.String()[:8])

		params := mux.Vars(r)
		region := params["region"]

		regionClient, _ := newRegionClient(cfg, region)

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
