package main

import (
	"fmt"
	"log"
	"time"

	"gopkg.in/fatih/set.v0"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
)

// Connection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Nomad state changes. It
// maintains a set to keep track of the running watches.
type Connection struct {
	socket *websocket.Conn

	hub *Hub

	receive chan *Action
	send    chan *Action

	destroyCh chan struct{}

	watches *set.Set
}

// NewConnection creates a new connection.
func NewConnection(hub *Hub, socket *websocket.Conn) *Connection {
	return &Connection{
		watches:   set.New(),
		hub:       hub,
		socket:    socket,
		receive:   make(chan *Action),
		send:      make(chan *Action),
		destroyCh: make(chan struct{}),
	}
}

func (c *Connection) writePump() {
	defer func() {
		c.socket.Close()
	}()
	for {
		action, ok := <-c.send
		if !ok {
			c.socket.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}
		if err := c.socket.WriteJSON(action); err != nil {
			return
		}
	}
}

func (c *Connection) readPump() {
	defer func() {
		c.watches.Clear()
		c.hub.unregister <- c
		c.socket.Close()
	}()

	// Register this connection with the hub for broadcast updates
	c.hub.register <- c

	// Flush all current state to the websocket
	c.hub.nomad.FlushAll(c)

	var action Action
	for {
		err := c.socket.ReadJSON(&action)
		if err != nil {
			break
		}
		c.process(action)
	}
}

func (c *Connection) process(action Action) {
	switch action.Type {
	case fetchNode:
		c.fetchNode(action)
	case fetchDir:
		c.fetchDir(action)
	case watchJob:
		go c.watchJob(action)
	case watchAlloc:
		go c.watchAlloc(action)
	case watchEval:
		go c.watchEval(action)
	case watchNode:
		go c.watchNode(action)
	case watchFile:
		go c.watchFile(action)
	case unwatchEval:
		fallthrough
	case unwatchNode:
		fallthrough
	case unwatchJob:
		fallthrough
	case unwatchAlloc:
		c.watches.Remove(action.Payload.(string))
	case unwatchFile:
		c.watches.Remove(action.Payload.(string))
	}
}

// Handle monitors the websocket connection for incoming actions. It sends
// out actions on state changes.
func (c *Connection) Handle() {
	go c.writePump()
	c.readPump()

	// Kill any remaining watcher routines
	close(c.destroyCh)
}

func (c *Connection) watchAlloc(action Action) {
	allocID := action.Payload.(string)

	defer func() {
		c.watches.Remove(allocID)
		log.Println("Stopped watching alloc with id:", allocID)
	}()
	c.watches.Add(allocID)

	log.Println("Started watching alloc with id:", allocID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			alloc, meta, err := c.hub.nomad.Client.Allocations().Info(allocID, q)
			if err != nil {
				log.Printf("connection: unable to fetch alloc info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(allocID) {
				return
			}
			c.send <- &Action{Type: fetchedAlloc, Payload: alloc}

			waitIndex := meta.LastIndex
			if q.WaitIndex > meta.LastIndex {
				waitIndex = q.WaitIndex
			}
			q = &api.QueryOptions{WaitIndex: waitIndex, WaitTime: 10 * time.Second}
		}
	}
}

func (c *Connection) watchEval(action Action) {
	evalID := action.Payload.(string)

	defer func() {
		c.watches.Remove(evalID)
		log.Println("Stopped watching eval with id:", evalID)
	}()
	c.watches.Add(evalID)

	log.Println("Started watching eval with id:", evalID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			eval, meta, err := c.hub.nomad.Client.Evaluations().Info(evalID, q)
			if err != nil {
				log.Printf("connection: unable to fetch eval info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(evalID) {
				return
			}
			c.send <- &Action{Type: fetchedEval, Payload: eval}

			waitIndex := meta.LastIndex
			if q.WaitIndex > meta.LastIndex {
				waitIndex = q.WaitIndex
			}
			q = &api.QueryOptions{WaitIndex: waitIndex, WaitTime: 10 * time.Second}
		}
	}
}

func (c *Connection) fetchNode(action Action) {
	nodeID := action.Payload.(string)
	node, _, err := c.hub.nomad.Client.Nodes().Info(nodeID, nil)
	if err != nil {
		log.Printf("websocket: unable to fetch node %q: %s", nodeID, err)
	}
	c.send <- &Action{Type: fetchedNode, Payload: node}
}

func (c *Connection) watchNode(action Action) {
	nodeID := action.Payload.(string)

	defer func() {
		c.watches.Remove(nodeID)
		log.Println("Stopped watching node with id:", nodeID)
	}()
	c.watches.Add(nodeID)

	log.Println("Started watching node with id:", nodeID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			node, meta, err := c.hub.nomad.Client.Nodes().Info(nodeID, q)
			if err != nil {
				log.Printf("connection: unable to fetch node info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(nodeID) {
				return
			}
			c.send <- &Action{Type: fetchedNode, Payload: node}

			waitIndex := meta.LastIndex
			if q.WaitIndex > meta.LastIndex {
				waitIndex = q.WaitIndex
			}
			q = &api.QueryOptions{WaitIndex: waitIndex, WaitTime: 10 * time.Second}
		}
	}
}

func (c *Connection) watchJob(action Action) {
	jobID := action.Payload.(string)

	defer func() {
		c.watches.Remove(jobID)
		log.Println("Stopped watching job with id:", jobID)
	}()
	c.watches.Add(jobID)

	log.Println("Started watching job with id:", jobID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			job, meta, err := c.hub.nomad.Client.Jobs().Info(jobID, q)
			if err != nil {
				log.Printf("connection: unable to fetch job info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(jobID) {
				return
			}
			c.send <- &Action{Type: fetchedJob, Payload: job}

			waitIndex := meta.LastIndex
			if q.WaitIndex > meta.LastIndex {
				waitIndex = q.WaitIndex
			}
			q = &api.QueryOptions{WaitIndex: waitIndex, WaitTime: 10 * time.Second}
		}
	}
}

func (c *Connection) fetchDir(action Action) {
	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		log.Println("Could not decode payload")
		return
	}
	addr := params["addr"].(string)
	path := params["path"].(string)
	allocID := params["allocID"].(string)

	config := api.DefaultConfig()
	config.Address = fmt.Sprintf("http://%s", addr)

	client, err := api.NewClient(config)
	if err != nil {
		log.Fatalf("Could not create client: %s", err)
		return
	}
	alloc, _, err := client.Allocations().Info(allocID, nil)
	if err != nil {
		log.Printf("Unable to fetch alloc: %s", err)
		return
	}
	dir, _, err := client.AllocFS().List(alloc, path, nil)
	if err != nil {
		log.Printf("Unable to fetch directory: %s", err)
	}

	c.send <- &Action{Type: fetchedDir, Payload: dir}
}

type Frame struct {
	Data   string
	File   string
	Offset int64
}

func (c *Connection) watchFile(action Action) {
	//params, ok := action.Payload.(map[string]interface{})
	//if !ok {
	//	log.Println("Could not decode payload")
	//	return
	//}
	//addr := params["addr"].(string)
	//path := params["path"].(string)
	//allocID := params["allocID"].(string)
	//
	//config := api.DefaultConfig()
	//config.Address = fmt.Sprintf("http://%s", addr)
	//
	//client, err := api.NewClient(config)
	//if err != nil {
	//	log.Printf("Could not create client: %s", err)
	//	return
	//}
	//alloc, _, err := client.Allocations().Info(allocID, nil)
	//if err != nil {
	//	log.Printf("Unable to fetch alloc: %s", err)
	//	return
	//}
	//
	//cancel := make(chan struct{})
	//frames, err := client.AllocFS().Stream(alloc, path, api.OriginStart, 0, cancel, nil)
	//if err != nil {
	//	log.Printf("Unable to stream file: %s", err)
	//	return
	//}
	//
	//c.watches.Add(path)
	//defer func() {
	//	log.Println("Stopped watching file with path:", path)
	//	c.watches.Remove(path)
	//	close(cancel)
	//}()
	//
	//log.Println("Started watching file with path:", path)
	//ticker := time.NewTicker(10 * time.Second)
	//for {
	//	select {
	//	case <-c.destroyCh:
	//		return
	//	case frame := <-frames:
	//		if !c.watches.Has(path) {
	//			return
	//		}
	//		c.send <- &Action{
	//			Type: fetchedFile,
	//			Payload: Frame{
	//				File:   frame.File,
	//				Data:   string(frame.Data),
	//				Offset: frame.Offset,
	//			},
	//		}
	//	case <-ticker.C:
	//		if !c.watches.Has(path) {
	//			return
	//		}
	//	}
	//}
}
