package main

import (
	"fmt"
	"io"
	"time"

	"gopkg.in/fatih/set.v0"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/hashicorp/nomad/command"
)

const (
	// bytesToLines is an estimation of how many bytes are in each log line.
	// This is used to set the offset to read from when a user specifies how
	// many lines to tail from.
	bytesToLines int64 = 120

	// defaultTailLines is the number of lines to tail by default.
	defaultTailLines int64 = 250

	// If a file exceeds an estimate of 250 loglines we start tailing it
	// from the end, otherwise the whole file is retrieved and followed.
	maxFileSize int64 = defaultTailLines * bytesToLines
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
			if err := c.socket.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
				logger.Errorf("Could not write close message to websocket: %s", err)
			}
			return
		}
		if err := c.socket.WriteJSON(action); err != nil {
			logger.Errorf("Could not write action to websocket: %s", err)
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
	logger.Infof("Processing event %s (index %d)", action.Type, action.Index)

	switch action.Type {
	//
	// Actions for a list of members (aka servers in the UI)
	//
	case watchMembers:
		go c.watchGenericBroadcast("members", fetchedMembers, c.hub.nomad.members)
	case unwatchMembers:
		c.unwatchGenericBroadcast("members")

	//
	// Actions for a list of jobs
	//
	case watchJobs:
		go c.watchGenericBroadcast("jobs", fetchedJobs, c.hub.nomad.jobs)
	case unwatchJobs:
		c.unwatchGenericBroadcast("jobs")

	//
	// Actions for a list of allocations
	//
	case watchAllocs:
		go c.watchGenericBroadcast("allocs", fetchedAllocs, c.hub.nomad.allocs)
	case unwatchAllocs:
		c.unwatchGenericBroadcast("allocs")

	//
	// Actions for a list of nodes (aka clients in the UI)
	//
	case watchNodes:
		go c.watchGenericBroadcast("nodes", fetchedNodes, c.hub.nomad.nodes)
	case unwatchNodes:
		c.unwatchGenericBroadcast("nodes")

	//
	// Actions for a list of evaluations
	//
	case watchEvals:
		go c.watchGenericBroadcast("evaluations", fetchedEvals, c.hub.nomad.evals)
	case unwatchEvals:
		c.unwatchGenericBroadcast("evaluations")

	//
	// Actions for a single node (aka client in the UI)
	//
	case watchNode:
		go c.watchNode(action)
	case unwatchNode:
		c.watches.Remove(action.Payload.(string))
	case fetchNode:
		go c.fetchNode(action)

	//
	// Actions for a single job
	//
	case watchJob:
		go c.watchJob(action)
	case unwatchJob:
		c.watches.Remove(action.Payload.(string))

	//
	// Actions for a single allocation
	//
	case watchAlloc:
		go c.watchAlloc(action)
	case unwatchAlloc:
		c.watches.Remove(action.Payload.(string))
	case fetchDir: // for file browsing in an allocation
		go c.fetchDir(action)
	case watchFile: // for following (tail -f) a file in an allocation
		go c.watchFile(action)
	case unwatchFile: // for stopping a follow of a file (tail -f)
		c.watches.Remove(action.Payload.(string))

	//
	// Actions for a single member (aka server in the UI)
	//
	case watchMember:
		go c.watchMember(action)
	case unwatchMember:
		c.watches.Remove(action.Payload.(string))
	case fetchMember:
		go c.fetchMember(action)

	// Actions for a single evaluation
	case watchEval:
		go c.watchEval(action)
	case unwatchEval:
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
		logger.Infof("Stopped watching alloc with id: %s", allocID)
	}()
	c.watches.Add(allocID)

	logger.Infof("Started watching alloc with id: %s", allocID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			alloc, meta, err := c.hub.nomad.Client.Allocations().Info(allocID, q)
			if err != nil {
				logger.Errorf("connection: unable to fetch alloc info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(allocID) {
				return
			}
			c.send <- &Action{Type: fetchedAlloc, Payload: alloc, Index: meta.LastIndex}

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
		logger.Infof("Stopped watching eval with id: %s", evalID)
	}()
	c.watches.Add(evalID)

	logger.Infof("Started watching eval with id: %s", evalID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			eval, meta, err := c.hub.nomad.Client.Evaluations().Info(evalID, q)
			if err != nil {
				logger.Errorf("connection: unable to fetch eval info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(evalID) {
				return
			}
			c.send <- &Action{Type: fetchedEval, Payload: eval, Index: meta.LastIndex}

			waitIndex := meta.LastIndex
			if q.WaitIndex > meta.LastIndex {
				waitIndex = q.WaitIndex
			}
			q = &api.QueryOptions{WaitIndex: waitIndex, WaitTime: 10 * time.Second}
		}
	}
}

func (c *Connection) fetchMember(action Action) {
	memberID := action.Payload.(string)
	member, err := c.hub.nomad.MemberWithID(memberID)
	if err != nil {
		logger.Errorf("websocket: unable to fetch member %q: %s", memberID, err)
		return
	}

	c.send <- &Action{Type: fetchedMember, Payload: member}
}

func (c *Connection) watchMember(action Action) {
	memberID := action.Payload.(string)

	defer func() {
		c.watches.Remove(memberID)
		logger.Infof("Stopped watching member with id: %s", memberID)
	}()
	c.watches.Add(memberID)

	logger.Infof("Started watching member with id: %s", memberID)

	for {
		select {
		case <-c.destroyCh:
			return
		default:
			member, err := c.hub.nomad.MemberWithID(memberID)
			if err != nil {
				logger.Errorf("connection: unable to fetch member info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(memberID) {
				return
			}
			c.send <- &Action{Type: fetchedMember, Payload: member}

			time.Sleep(10 * time.Second)
		}
	}
}

func (c *Connection) fetchNode(action Action) {
	nodeID := action.Payload.(string)
	node, _, err := c.hub.nomad.Client.Nodes().Info(nodeID, nil)
	if err != nil {
		logger.Errorf("websocket: unable to fetch node %q: %s", nodeID, err)
	}
	c.send <- &Action{Type: fetchedNode, Payload: node}
}

func (c *Connection) watchNode(action Action) {
	nodeID := action.Payload.(string)

	defer func() {
		c.watches.Remove(nodeID)
		logger.Infof("Stopped watching node with id: %s", nodeID)
	}()
	c.watches.Add(nodeID)

	logger.Infof("Started watching node with id: %s", nodeID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			node, meta, err := c.hub.nomad.Client.Nodes().Info(nodeID, q)
			if err != nil {
				logger.Errorf("connection: unable to fetch node info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(nodeID) {
				return
			}
			c.send <- &Action{Type: fetchedNode, Payload: node, Index: meta.LastIndex}

			waitIndex := meta.LastIndex
			if q.WaitIndex > meta.LastIndex {
				waitIndex = q.WaitIndex
			}
			q = &api.QueryOptions{WaitIndex: waitIndex, WaitTime: 10 * time.Second}
		}
	}
}

func (c *Connection) watchGenericBroadcast(watchKey string, actionEvent string, initialPayload interface{}) {
	defer func() {
		c.watches.Remove(watchKey)
		logger.Infof("Stopped watching %s", watchKey)
	}()
	c.watches.Add(watchKey)

	logger.Infof("Sending our current %s list", watchKey)
	c.send <- &Action{Type: actionEvent, Payload: initialPayload, Index: 0}

	logger.Infof("Started watching %s", watchKey)
	for {
		if !c.watches.Has(watchKey) {
			logger.Infof("Connection is no longer subscribed to %s", watchKey)
			return
		}

		logger.Infof("Waiting on %s pipe", watchKey)
		channelAction := <-c.hub.nomad.updateCh

		if channelAction.Type != actionEvent {
			logger.Infof("Type mismatch: %s <> %s", channelAction.Type, actionEvent)
			continue
		}

		c.send <- channelAction
	}
}

func (c *Connection) unwatchGenericBroadcast(watchKey string) {
	logger.Infof("Removing subscription for %s", watchKey)
	c.watches.Remove(watchKey)
}

func (c *Connection) watchJob(action Action) {
	jobID := action.Payload.(string)

	defer func() {
		c.watches.Remove(jobID)
		logger.Infof("Stopped watching job with id: %s", jobID)
	}()
	c.watches.Add(jobID)

	logger.Infof("Started watching job with id: %s", jobID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			job, meta, err := c.hub.nomad.Client.Jobs().Info(jobID, q)
			if err != nil {
				logger.Errorf("connection: unable to fetch job info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}
			if !c.watches.Has(jobID) {
				return
			}
			c.send <- &Action{Type: fetchedJob, Payload: job, Index: meta.LastIndex}

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
		logger.Errorf("Could not decode payload")
		return
	}
	addr := params["addr"].(string)
	path := params["path"].(string)
	allocID := params["allocID"].(string)

	config := api.DefaultConfig()
	config.Address = fmt.Sprintf("http://%s", addr)

	client, err := api.NewClient(config)
	if err != nil {
		logger.Fatalf("Could not create client: %s", err)
		return
	}
	alloc, _, err := client.Allocations().Info(allocID, nil)
	if err != nil {
		logger.Errorf("Unable to fetch alloc: %s", err)
		return
	}
	dir, _, err := client.AllocFS().List(alloc, path, nil)
	if err != nil {
		logger.Errorf("Unable to fetch directory: %s", err)
	}

	c.send <- &Action{Type: fetchedDir, Payload: dir, Index: 0}
}

type Line struct {
	Data string
	File string
}

func (c *Connection) watchFile(action Action) {
	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		logger.Error("Could not decode payload")
		return
	}
	addr := params["addr"].(string)
	path := params["path"].(string)
	allocID := params["allocID"].(string)

	config := api.DefaultConfig()
	config.Address = fmt.Sprintf("http://%s", addr)

	client, err := api.NewClient(config)
	if err != nil {
		logger.Errorf("Could not create client: %s", err)
		return
	}
	alloc, _, err := client.Allocations().Info(allocID, nil)
	if err != nil {
		logger.Errorf("Unable to fetch alloc: %s", err)
		return
	}

	// Get file stat info
	file, _, err := client.AllocFS().Stat(alloc, path, nil)
	if err != nil {
		logger.Errorf("Unable to stat file: %s", err)
		return
	}

	var origin string = api.OriginStart
	var offset int64 = 0
	var oversized bool
	if file.Size > maxFileSize {
		origin = api.OriginEnd
		offset = maxFileSize
		oversized = true
	}

	cancel := make(chan struct{})
	frames, err := client.AllocFS().Stream(alloc, path, origin, offset, cancel, nil)
	if err != nil {
		c.send <- &Action{
			Type: fileStreamFailed,
			Payload: struct {
				path string
			}{
				path: path,
			},
			Index: 0,
		}

		logger.Errorf("Unable to stream file: %s", err)
		return
	}

	var r io.ReadCloser
	frameReader := api.NewFrameReader(frames, cancel)
	frameReader.SetUnblockTime(500 * time.Millisecond)
	r = command.NewLineLimitReader(frameReader, int(defaultTailLines), int(defaultTailLines*bytesToLines), 1*time.Second)

	// Turn the reader into a channel
	lines := make(chan []byte)
	b := make([]byte, defaultTailLines*bytesToLines)
	go func() {
		for {
			n, err := r.Read(b[:cap(b)])
			if err != nil {
				return
			}
			if n > 0 {
				lines <- b[0:n]
			}
		}
	}()

	c.watches.Add(path)
	defer func() {
		logger.Infof("Stopped watching file with path: %s", path)
		c.watches.Remove(path)
		r.Close()
	}()

	logger.Infof("Started watching file with path: %s", path)
	c.send <- &Action{
		Type: fetchedFile,
		Payload: struct {
			File      string
			Data      string
			Oversized bool
		}{
			File:      path,
			Data:      "",
			Oversized: oversized,
		},
		Index: 0,
	}

	ticker := time.NewTicker(10 * time.Second)
	for {
		select {
		case <-c.destroyCh:
			return
		case line := <-lines:
			if !c.watches.Has(path) {
				return
			}
			c.send <- &Action{
				Type: fetchedFile,
				Payload: struct {
					File      string
					Data      string
					Oversized bool
				}{
					File:      path,
					Data:      string(line),
					Oversized: oversized,
				},
				Index: 0,
			}
		case <-ticker.C:
			if !c.watches.Has(path) {
				return
			}
		}
	}
}
