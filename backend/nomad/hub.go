package nomad

import (
	"io"
	"net/http"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/jippi/hashi-ui/backend/structs"
)

var upgrader = websocket.Upgrader{
	// Allow all requests
	CheckOrigin: func(r *http.Request) bool { return true },
}

// NomadHub keeps track of all the websocket connections and sends state updates
// from Nomad to all connections.
type NomadHub struct {
	connections map[*NomadConnection]bool
	cluster     *NomadCluster
	channels    *NomadRegionChannels
	clients     *NomadRegionClients
	regions     []string
	register    chan *NomadConnection
	unregister  chan *NomadConnection
}

// NewNomadHub initializes a new hub.
func NewNomadHub(cluster *NomadCluster) *NomadHub {
	regions := make([]string, 0)

	for region := range *cluster.RegionChannels {
		regions = append(regions, region)
	}

	return &NomadHub{
		cluster:     cluster,
		clients:     cluster.RegionClients,
		channels:    cluster.RegionChannels,
		regions:     regions,
		connections: make(map[*NomadConnection]bool),
		register:    make(chan *NomadConnection),
		unregister:  make(chan *NomadConnection),
	}
}

// Run (un)registers websocket connections and broadcasts Nomad state updates
// to all connections.
func (h *NomadHub) Run() {
	for {
		select {
		case c := <-h.register:
			h.connections[c] = true

		case c := <-h.unregister:
			if _, ok := h.connections[c]; ok {
				delete(h.connections, c)
				close(c.send)
			}
		}
	}
}

// Handler establishes the websocket connection and calls the connection handler.
func (h *NomadHub) Handler(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Errorf("transport: websocket upgrade failed: %s", err)
		return
	}

	params := mux.Vars(r)

	region, ok := params["region"]
	if !ok {
		logger.Errorf("No region provided")
		h.requireNomadRegion(socket)
		return
	}

	if _, ok := (*h.channels)[region]; !ok {
		logger.Errorf("region was not found: %s", region)
		h.sendAction(socket, &structs.Action{Type: unknownNomadRegion, Payload: ""})
		return
	}

	c := NewNomadConnection(h, socket, (*h.clients)[region], (*h.channels)[region])
	c.Handle()
}

func (h *NomadHub) requireNomadRegion(socket *websocket.Conn) {
	var action structs.Action

	if len(h.regions) == 1 {
		action = structs.Action{
			Type:    "NOMAD_SET_REGION",
			Payload: h.regions[0],
		}
	} else {
		action = structs.Action{
			Type:    "NOMAD_FETCHED_REGIONS",
			Payload: h.regions,
		}
	}

	h.sendAction(socket, &action)

	var readAction structs.Action
	for {
		err := socket.ReadJSON(&readAction)
		if err != nil {
			break
		}

		logger.Warningf("Ignoring unhandled message: %s (missing region)", readAction.Type)

		logger.Debugf("Sending request for user to select a region in the UI again")
		if err = socket.WriteJSON(action); err != nil {
			logger.Errorf(" %s", err)
		}
	}
}

func (h *NomadHub) sendAction(socket *websocket.Conn, action *structs.Action) {
	if err := socket.WriteJSON(action); err != nil {
		logger.Errorf(" %s", err)
	}
}

func (h *NomadHub) DownloadFile(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	region := params["region"]

	regionClient, ok := (*h.clients)[region]
	if !ok {
		logger.Errorf("region was not found: %s", region)
	}

	c := r.URL.Query().Get("client")
	allocID := r.URL.Query().Get("allocID")
	if c == "" || allocID == "" {
		http.Error(w, "client or allocID should be passed.", http.StatusBadRequest)
		return
	}

	alloc, _, err := regionClient.Client.Allocations().Info(allocID, nil)
	if err != nil {
		logger.Errorf("Unable to fetch alloc: %s", err)
		http.Error(w, "Could not fetch the allocation.", http.StatusInternalServerError)
		return
	}

	path := params["path"]
	file, err := regionClient.Client.AllocFS().Cat(alloc, path, nil)
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
