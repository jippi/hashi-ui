package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	// Allow all requests
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Hub keeps track of all the websocket connections and sends state updates
// from Nomad to all connections.
type Hub struct {
	nomad       *Nomad
	connections map[*Connection]bool

	register   chan *Connection
	unregister chan *Connection

	broadcast chan *Action
}

// NewHub initializes a new hub.
func NewHub(nomad *Nomad, broadcast chan *Action) *Hub {
	return &Hub{
		nomad:       nomad,
		broadcast:   broadcast,
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
		case action := <-h.broadcast:
			for c := range h.connections {
				c.send <- action
			}
		}
	}
}

// Handler establishes the websocket connection and calls the connection handler.
func (h *Hub) Handler(w http.ResponseWriter, r *http.Request) {
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("transport: websocket upgrade failed: %s", err)
		return
	}
	c := NewConnection(h, socket)
	c.Handle()
}
