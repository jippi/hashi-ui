package main

import (
	"net/http"

	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	// Allow all requests
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Hub keeps track of all the websocket connections and sends state updates
// from Nomad to all connections.
type Hub struct {
	connections map[*Connection]bool
	channels    RegionChannels
	clients     RegionClients
	regions     []string
	register    chan *Connection
	unregister  chan *Connection
}

// NewHub initializes a new hub.
func NewHub(clients RegionClients, channels RegionChannels) *Hub {
	regions := make([]string, 0)

	for region := range channels {
		regions = append(regions, region)
	}

	return &Hub{
		clients:     clients,
		channels:    channels,
		regions:     regions,
		connections: make(map[*Connection]bool),
		register:    make(chan *Connection),
		unregister:  make(chan *Connection),
	}
}

// Run (un)registers websocket connections and broadcasts Nomad state updates
// to all connections.
func (h *Hub) Run() {
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
func (h *Hub) Handler(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Errorf("transport: websocket upgrade failed: %s", err)
		return
	}

	region := ""
	if strings.HasPrefix(r.URL.Path, "/ws/nomad/") {
		region = strings.Replace(r.URL.Path, "/ws/nomad/", "", 1)
	}

	if region == "" {
		logger.Errorf("No region provided")
		h.requireNomadRegion(socket)
		return
	}

	if _, ok := h.channels[region]; !ok {
		logger.Errorf("region was not found: %s", region)
		h.sendAction(socket, &Action{Type: unknownNomadRegion, Payload: ""})
		return
	}

	c := NewConnection(h, socket, h.clients[region], h.channels[region])
	c.Handle()
}

func (h *Hub) requireNomadRegion(socket *websocket.Conn) {
	regions := make([]string, 0)

	for region := range h.channels {
		regions = append(regions, region)
	}

	var action Action

	if len(regions) == 1 {
		action = Action{
			Type:    "SET_NOMAD_REGION",
			Payload: regions[0],
		}
	} else {
		action = Action{
			Type:    "FETCHED_NOMAD_REGIONS",
			Payload: regions,
		}
	}

	h.sendAction(socket, &action)

	var readAction Action
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

func (h *Hub) sendAction(socket *websocket.Conn, action *Action) {
	if err := socket.WriteJSON(action); err != nil {
		logger.Errorf(" %s", err)
	}
}
