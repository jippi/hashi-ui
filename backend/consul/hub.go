package consul

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/jippi/hashi-ui/backend/structs"
)

// ConsulHub keeps track of all the websocket connections and sends state updates
// from Nomad to all connections.
type ConsulHub struct {
	connections map[*ConsulConnection]bool
	cluster     *ConsulCluster
	channels    *ConsulRegionChannels
	clients     *ConsulRegionClients
	regions     []string
	register    chan *ConsulConnection
	unregister  chan *ConsulConnection
}

var upgrader = websocket.Upgrader{
	// Allow all requests
	CheckOrigin: func(r *http.Request) bool { return true },
}

// NewConsulHub initializes a new hub.
func NewConsulHub(cluster *ConsulCluster) *ConsulHub {
	regions := make([]string, 0)

	for region := range *cluster.RegionChannels {
		regions = append(regions, region)
	}

	return &ConsulHub{
		cluster:     cluster,
		clients:     cluster.RegionClients,
		channels:    cluster.RegionChannels,
		regions:     regions,
		connections: make(map[*ConsulConnection]bool),
		register:    make(chan *ConsulConnection),
		unregister:  make(chan *ConsulConnection),
	}
}

// Run (un)registers websocket connections and broadcasts Nomad state updates
// to all connections.
func (h *ConsulHub) Run() {
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
func (h *ConsulHub) Handler(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Errorf("transport: websocket upgrade failed: %s", err)
		return
	}

	params := mux.Vars(r)

	region, ok := params["region"]
	if !ok {
		logger.Errorf("No region provided")
		h.requireConsulRegion(socket)
		return
	}

	if _, ok := (*h.channels)[region]; !ok {
		logger.Errorf("region was not found: %s", region)
		h.sendAction(socket, &structs.Action{Type: unknownConsulRegion, Payload: ""})
		return
	}

	c := NewConsulConnection(h, socket, (*h.clients)[region], (*h.channels)[region])
	c.Handle()
}

func (h *ConsulHub) requireConsulRegion(socket *websocket.Conn) {
	var action structs.Action

	if len(h.regions) == 1 {
		action = structs.Action{
			Type:    "CONSUL_SET_REGION",
			Payload: h.regions[0],
		}
	} else {
		action = structs.Action{
			Type:    "CONSUL_FETCHED_REGIONS",
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

func (h *ConsulHub) sendAction(socket *websocket.Conn, action *structs.Action) {
	if err := socket.WriteJSON(action); err != nil {
		logger.Errorf(" %s", err)
	}
}
