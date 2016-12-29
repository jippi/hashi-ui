package main

import (
	"fmt"

	"github.com/gorilla/websocket"
	uuid "github.com/satori/go.uuid"
	"gopkg.in/fatih/set.v0"
)

// ConsulConnection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Consul state changes. It
// maintains a set to keep track of the running watches.
type ConsulConnection struct {
	ID                uuid.UUID
	shortID           string
	socket            *websocket.Conn
	receive           chan *Action
	send              chan *Action
	destroyCh         chan struct{}
	watches           *set.Set
	hub               *ConsulHub
	region            *ConsulRegion
	broadcastChannels *ConsulRegionBroadcastChannels
}

// NewConsulConnection creates a new connection.
func NewConsulConnection(hub *ConsulHub, socket *websocket.Conn, consulRegion *ConsulRegion, channels *ConsulRegionBroadcastChannels) *ConsulConnection {
	connectionID := uuid.NewV4()

	return &ConsulConnection{
		ID:                connectionID,
		shortID:           fmt.Sprintf("%s", connectionID)[0:8],
		watches:           set.New(),
		hub:               hub,
		socket:            socket,
		receive:           make(chan *Action),
		send:              make(chan *Action),
		destroyCh:         make(chan struct{}),
		region:            consulRegion,
		broadcastChannels: channels,
	}
}

// Warningf is a stupid wrapper for logger.Warningf
func (c *ConsulConnection) Warningf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Warningf(message, args...)
}

// Errorf is a stupid wrapper for logger.Errorf
func (c *ConsulConnection) Errorf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Errorf(message, args...)
}

// Infof is a stupid wrapper for logger.Infof
func (c *ConsulConnection) Infof(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Infof(message, args...)
}

// Debugf is a stupid wrapper for logger.Debugf
func (c *ConsulConnection) Debugf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Debugf(message, args...)
}

func (c *ConsulConnection) writePump() {
	defer func() {
		c.socket.Close()
	}()

	for {
		action, ok := <-c.send

		if !ok {
			if err := c.socket.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
				c.Errorf("Could not write close message to websocket: %s", err)
			}
			return
		}

		if err := c.socket.WriteJSON(action); err != nil {
			c.Errorf("Could not write action to websocket: %s", err)
		}
	}
}

func (c *ConsulConnection) readPump() {
	defer func() {
		c.watches.Clear()
		c.hub.unregister <- c
		c.socket.Close()
	}()

	// Register this connection with the hub for broadcast updates
	c.hub.register <- c

	var action Action
	for {
		err := c.socket.ReadJSON(&action)
		if err != nil {
			break
		}

		c.process(action)
	}
}

func (c *ConsulConnection) process(action Action) {
	c.Debugf("Processing event %s (index %d)", action.Type, action.Index)

	switch action.Type {

	case fetchConsulRegions:
		go c.fetchRegions()

	// Nice in debug
	default:
		logger.Warningf("Unknown action: %s", action.Type)
	}
}

// Handle monitors the websocket connection for incoming actions. It sends
// out actions on state changes.
func (c *ConsulConnection) Handle() {
	go c.writePump()
	c.readPump()

	c.Debugf("Connection closing down")

	c.destroyCh <- struct{}{}

	// Kill any remaining watcher routines
	close(c.destroyCh)
}

func (c *ConsulConnection) fetchRegions() {
	c.send <- &Action{Type: fetchedConsulRegions, Payload: c.hub.regions}
}
