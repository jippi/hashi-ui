package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"time"

	"gopkg.in/fatih/set.v0"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/hashicorp/nomad/command"
	"github.com/imkira/go-observer"

	uuid "github.com/satori/go.uuid"
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

// NomadConnection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Nomad state changes. It
// maintains a set to keep track of the running watches.
type NomadConnection struct {
	ID                uuid.UUID
	shortID           string
	socket            *websocket.Conn
	receive           chan *Action
	send              chan *Action
	destroyCh         chan struct{}
	watches           *set.Set
	hub               *NomadHub
	region            *NomadRegion
	broadcastChannels *NomadRegionBroadcastChannels
}

// NewNomadConnection creates a new connection.
func NewNomadConnection(hub *NomadHub, socket *websocket.Conn, nomadRegion *NomadRegion, channels *NomadRegionBroadcastChannels) *NomadConnection {
	connectionID := uuid.NewV4()

	return &NomadConnection{
		ID:                connectionID,
		shortID:           fmt.Sprintf("%s", connectionID)[0:8],
		watches:           set.New(),
		hub:               hub,
		socket:            socket,
		receive:           make(chan *Action),
		send:              make(chan *Action),
		destroyCh:         make(chan struct{}),
		region:            nomadRegion,
		broadcastChannels: channels,
	}
}

// Warningf is a stupid wrapper for logger.Warningf
func (c *NomadConnection) Warningf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Warningf(message, args...)
}

// Errorf is a stupid wrapper for logger.Errorf
func (c *NomadConnection) Errorf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Errorf(message, args...)
}

// Infof is a stupid wrapper for logger.Infof
func (c *NomadConnection) Infof(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Infof(message, args...)
}

// Debugf is a stupid wrapper for logger.Debugf
func (c *NomadConnection) Debugf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Debugf(message, args...)
}

func (c *NomadConnection) writePump() {
	defer func() {
		c.socket.Close()
	}()

	for {
		select {
		case <-c.destroyCh:
			c.Warningf("Stopping writePump")
			return
		case action, ok := <-c.send:
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
}

func (c *NomadConnection) readPump() {
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

func (c *NomadConnection) process(action Action) {
	c.Debugf("Processing event %s (index %d)", action.Type, action.Index)

	switch action.Type {
	//
	// Actions for a list of members (aka servers in the UI)
	//
	case watchMembers:
		go c.watchGenericBroadcast("members", fetchedMembers, c.region.broadcastChannels.members, c.hub.cluster.members)
	case unwatchMembers:
		c.unwatchGenericBroadcast("members")

	//
	// Actions for a list of jobs
	//
	case watchJobs:
		go c.watchGenericBroadcast("jobs", fetchedJobs, c.region.broadcastChannels.jobs, c.region.jobs)
	case unwatchJobs:
		c.unwatchGenericBroadcast("jobs")

	//
	// Actions for a list of allocations
	//
	case watchAllocs:
		go c.watchGenericBroadcast("allocs", fetchedAllocs, c.region.broadcastChannels.allocations, c.region.allocations)
	case watchAllocsShallow:
		go c.watchGenericBroadcast("allocsShallow", fetchedAllocs, c.region.broadcastChannels.allocationsShallow, c.region.allocationsShallow)
	case unwatchAllocs:
		c.unwatchGenericBroadcast("allocs")
	case unwatchAllocsShallow:
		c.unwatchGenericBroadcast("allocsShallow")

	//
	// Actions for a list of nodes (aka clients in the UI)
	//
	case watchNodes:
		go c.watchGenericBroadcast("nodes", fetchedNodes, c.region.broadcastChannels.nodes, c.region.nodes)
	case unwatchNodes:
		c.unwatchGenericBroadcast("nodes")

	//
	// Actions for a list of evaluations
	//
	case watchClusterStatistics:
		go c.watchGenericBroadcast("ClusterStatistics", fetchedClusterStatistics, c.region.broadcastChannels.clusterStatistics, c.region.clusterStatistics)
	case unwatchClusterStatistics:
		c.unwatchGenericBroadcast("ClusterStatistics")

	//
	// Actions for a list of evaluations
	//
	case watchEvals:
		go c.watchGenericBroadcast("evaluations", fetchedEvals, c.region.broadcastChannels.evaluations, c.region.evaluations)
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

	//
	// Actions for allocation FS
	//
	case fetchDir: // for file browsing in an allocation
		go c.fetchDir(action)
	case watchFile: // for following (tail -f) a file in an allocation
		go c.watchFile(action)
	case unwatchFile: // for stopping a follow of a file (tail -f)
		c.watches.Remove(action.Payload.(string))

	case fetchClientStats:
		go c.fetchClientStats(action)
	case watchClientStats:
		go c.watchClientStats(action)
	case unwatchClientStats:
		c.watches.Remove("node-stats-" + action.Payload.(string))

	//
	// Actions for a single member (aka server in the UI)
	//
	case watchMember:
		go c.watchMember(action)
	case fetchMember:
		go c.fetchMember(action)
	case unwatchMember:
		c.watches.Remove(action.Payload.(string))

	// Actions for a single evaluation
	case watchEval:
		go c.watchEval(action)
	case unwatchEval:
		c.watches.Remove(action.Payload.(string))

	// Change task group count
	case changeTaskGroupCount:
		go c.changeTaskGroupCount(action)

	// Submit (create or update) a job
	case submitJob:
		go c.submitJob(action)

	// Stop a job
	case stopJob:
		go c.stopJob(action)

	case fetchNomadRegions:
		go c.fetchRegions()

	case evaluateJob:
		go c.evaluateJob(action)

	// Nice in debug
	default:
		logger.Errorf("Unknown action: %s", action.Type)
	}
}

// Handle monitors the websocket connection for incoming actions. It sends
// out actions on state changes.
func (c *NomadConnection) Handle() {
	go c.keepAlive()
	go c.writePump()
	c.readPump()

	c.Debugf("Connection closing down")

	c.destroyCh <- struct{}{}

	// Kill any remaining watcher routines
	close(c.destroyCh)
}

func (c *NomadConnection) keepAlive() {
	logger.Debugf("Starting keep-alive packer sender")
	ticker := time.NewTicker(10 * time.Second)

	for {
		select {
		case <-c.destroyCh:
			return
		case <-ticker.C:
			logger.Debugf("Sending keep-alive packet")
			c.send <- &Action{Type: keepAlive, Payload: "hello-world", Index: 0}
		}
	}
}

func (c *NomadConnection) watchAlloc(action Action) {
	allocID := action.Payload.(string)

	defer func() {
		c.watches.Remove(allocID)
		c.Infof("Stopped watching alloc with id: %s", allocID)
	}()
	c.watches.Add(allocID)

	c.Infof("Started watching alloc with id: %s", allocID)

	q := &api.QueryOptions{WaitIndex: 1}

	for {
		select {
		case <-c.destroyCh:
			return

		default:
			alloc, meta, err := c.region.Client.Allocations().Info(allocID, q)
			if err != nil {
				c.Errorf("connection: unable to fetch alloc info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			if !c.watches.Has(allocID) {
				return
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &Action{Type: fetchedAlloc, Payload: alloc, Index: remoteWaitIndex}
				q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: 10 * time.Second}
			}
		}
	}
}

func (c *NomadConnection) watchEval(action Action) {
	evalID := action.Payload.(string)

	defer func() {
		c.watches.Remove(evalID)
		c.Infof("Stopped watching eval with id: %s", evalID)
	}()
	c.watches.Add(evalID)

	c.Infof("Started watching eval with id: %s", evalID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return
		default:
			eval, meta, err := c.region.Client.Evaluations().Info(evalID, q)
			if err != nil {
				c.Errorf("connection: unable to fetch eval info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			if !c.watches.Has(evalID) {
				return
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &Action{Type: fetchedEval, Payload: eval, Index: remoteWaitIndex}
				q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: 10 * time.Second}
			}
		}
	}
}

func (c *NomadConnection) fetchMember(action Action) {
	memberID := action.Payload.(string)
	member, err := c.hub.cluster.MemberWithID(memberID)
	if err != nil {
		c.Errorf("websocket: unable to fetch member %q: %s", memberID, err)
		return
	}

	c.send <- &Action{Type: fetchedMember, Payload: member}
}

func (c *NomadConnection) watchMember(action Action) {
	memberID := action.Payload.(string)

	defer func() {
		c.watches.Remove(memberID)
		c.Infof("Stopped watching member with id: %s", memberID)
	}()
	c.watches.Add(memberID)

	c.Infof("Started watching member with id: %s", memberID)

	for {
		select {
		case <-c.destroyCh:
			return

		default:
			member, err := c.hub.cluster.MemberWithID(memberID)
			if err != nil {
				c.Errorf("connection: unable to fetch member info: %s", err)
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

func (c *NomadConnection) fetchNode(action Action) {
	nodeID := action.Payload.(string)
	node, _, err := c.region.Client.Nodes().Info(nodeID, nil)
	if err != nil {
		c.Errorf("websocket: unable to fetch node %q: %s", nodeID, err)
	}

	c.send <- &Action{Type: fetchedNode, Payload: node}
}

func (c *NomadConnection) watchNode(action Action) {
	nodeID := action.Payload.(string)

	defer func() {
		c.watches.Remove(nodeID)
		c.Infof("Stopped watching node with id: %s", nodeID)
	}()
	c.watches.Add(nodeID)

	c.Infof("Started watching node with id: %s", nodeID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return

		default:
			node, meta, err := c.region.Client.Nodes().Info(nodeID, q)
			if err != nil {
				c.Errorf("connection: unable to fetch node info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			if !c.watches.Has(nodeID) {
				return
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &Action{Type: fetchedNode, Payload: node, Index: remoteWaitIndex}
				q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: 10 * time.Second}
			}
		}
	}
}

func (c *NomadConnection) watchGenericBroadcast(watchKey string, actionEvent string, prop observer.Property, initialPayload interface{}) {
	defer func() {
		c.watches.Remove(watchKey)
		c.Infof("Stopped watching %s", watchKey)

		// recovering from panic caused by writing to a closed channel
		if r := recover(); r != nil {
			c.Warningf("Recover from panic: %s", r)
		}
	}()

	c.watches.Add(watchKey)

	c.Debugf("Sending our current %s list", watchKey)
	c.send <- &Action{Type: actionEvent, Payload: initialPayload, Index: 0}

	stream := prop.Observe()

	c.Debugf("Started watching %s", watchKey)
	for {
		select {
		case <-c.destroyCh:
			return

		case <-stream.Changes():
			// advance to next value
			stream.Next()

			channelAction := stream.Value().(*Action)
			c.Debugf("got new data for %s (WaitIndex: %d)", watchKey, channelAction.Index)

			if !c.watches.Has(watchKey) {
				c.Infof("Connection is no longer subscribed to %s", watchKey)
				return
			}

			if channelAction.Type != actionEvent {
				c.Debugf("Type mismatch: %s <> %s", channelAction.Type, actionEvent)
				continue
			}

			c.Debugf("Publishing change %s %s", channelAction.Type, watchKey)
			c.send <- channelAction
		}
	}
}

func (c *NomadConnection) unwatchGenericBroadcast(watchKey string) {
	c.Debugf("Removing subscription for %s", watchKey)
	c.watches.Remove(watchKey)
}

func (c *NomadConnection) watchJob(action Action) {
	jobID := action.Payload.(string)

	defer func() {
		c.watches.Remove(jobID)
		c.Infof("Stopped watching job with id: %s", jobID)
	}()
	c.watches.Add(jobID)

	c.Infof("Started watching job with id: %s", jobID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-c.destroyCh:
			return

		default:
			job, meta, err := c.region.Client.Jobs().Info(jobID, q)

			if defaultConfig.HideEnvData {
				for _, taskGroup := range job.TaskGroups {
					for _, task := range taskGroup.Tasks {
						for k := range task.Env {
							task.Env[k] = ""
						}
					}
				}
			}

			if err != nil {
				c.Errorf("connection: unable to fetch job info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			if !c.watches.Has(jobID) {
				return
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &Action{Type: fetchedJob, Payload: job, Index: remoteWaitIndex}
				q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: 10 * time.Second}
			}
		}
	}
}

func (c *NomadConnection) fetchClientStats(action Action) {
	nodeID, ok := action.Payload.(string)
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}

	stats, err := c.region.Client.Nodes().Stats(nodeID, nil)
	if err != nil {
		c.Errorf("Unable to fetch node stats: %s", err)
		return
	}

	c.send <- &Action{Type: fetchedClientStats, Payload: stats, Index: 0}
}

func (c *NomadConnection) watchClientStats(action Action) {
	nodeID, ok := action.Payload.(string)
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}

	defer func() {
		c.watches.Remove("node-stats-" + nodeID)
		c.Infof("Stopped watching client stats with id: %s", nodeID)
	}()
	c.watches.Add("node-stats-" + nodeID)

	for {
		select {
		case <-c.destroyCh:
			return

		default:
			stats, err := c.region.Client.Nodes().Stats(nodeID, nil)
			if err != nil {
				logger.Errorf("watch: unable to fetch client stats: %s", err)
				time.Sleep(3 * time.Second)
				return
			}

			if !c.watches.Has("node-stats-" + nodeID) {
				c.Infof("Connection is no longer subscribed to node stats with id %s", nodeID)
				return
			}

			c.Debugf("Sending Client Stats")
			c.send <- &Action{Type: fetchedClientStats, Payload: stats, Index: 0}
			time.Sleep(5 * time.Second)
		}
	}
}

func (c *NomadConnection) fetchDir(action Action) {
	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.Errorf("Could not decode payload")
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
		c.Errorf("Unable to fetch alloc: %s", err)
		return
	}

	dir, _, err := client.AllocFS().List(alloc, path, nil)
	if err != nil {
		c.Errorf("Unable to fetch directory: %s", err)
	}

	c.send <- &Action{Type: fetchedDir, Payload: dir, Index: 0}
}

func (c *NomadConnection) watchFile(action Action) {
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
		c.Errorf("Could not create client: %s", err)
		return
	}

	alloc, _, err := client.Allocations().Info(allocID, nil)
	if err != nil {
		c.Errorf("Unable to fetch alloc: %s", err)
		return
	}

	// Get file stat info
	file, _, err := client.AllocFS().Stat(alloc, path, nil)
	if err != nil {
		c.Errorf("Unable to stat file: %s", err)
		return
	}

	var origin = api.OriginStart
	var offset int64
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

		c.Errorf("Unable to stream file: %s", err)
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

			if !c.watches.Has(path) {
				return
			}

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
		c.Infof("Stopped watching file with path: %s", path)
		c.watches.Remove(path)
		r.Close()
	}()

	c.Infof("Started watching file with path: %s", path)
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

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

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

func (c *NomadConnection) changeTaskGroupCount(action Action) {
	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	jobID := params["job"].(string)
	taskGroupID := params["taskGroup"].(string)
	scaleAction := params["scaleAction"].(string)

	job, _, err := c.region.Client.Jobs().Info(jobID, &api.QueryOptions{})
	if err != nil {
		c.Errorf("connection: unable to fetch job info: %s", err)
		c.send <- &Action{Type: errorNotification, Payload: fmt.Sprintf("Could not find job: %s", jobID), Index: index}
		return
	}

	var foundTaskGroup *api.TaskGroup
	for _, taskGroup := range job.TaskGroups {
		if taskGroup.Name == taskGroupID {
			foundTaskGroup = taskGroup
			break
		}
	}

	if foundTaskGroup.Name == "" {
		c.send <- &Action{Type: errorNotification, Payload: fmt.Sprintf("Could not find Task Group: %s", taskGroupID), Index: index}
		return
	}

	originalCount := foundTaskGroup.Count

	switch scaleAction {
	case "set":
		foundTaskGroup.Count = params["count"].(int)
	case "increase":
		foundTaskGroup.Count++
	case "decrease":
		foundTaskGroup.Count--
	case "stop":
		foundTaskGroup.Count = 0
	case "restart":
		stopPayload := make(map[string]interface{})
		for k, v := range params {
			stopPayload[k] = v
		}
		stopPayload["scaleAction"] = "stop"

		restartPayload := make(map[string]interface{})
		for k, v := range params {
			restartPayload[k] = v
		}
		restartPayload["scaleAction"] = "set"
		restartPayload["count"] = foundTaskGroup.Count

		c.changeTaskGroupCount(Action{Payload: stopPayload})
		c.changeTaskGroupCount(Action{Payload: restartPayload})
		return
	default:
		c.send <- &Action{Type: errorNotification, Payload: fmt.Sprintf("Invalid action: %s", scaleAction), Index: index}
		return
	}

	updateAction, updateErr := c.region.updateJob(job)
	updateAction.Index = index

	if updateErr != nil {
		logger.Error(updateErr)
		c.send <- updateAction
		return
	}

	switch scaleAction {
	case "increase":
		updateAction.Payload = fmt.Sprintf("Successfully increased task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, foundTaskGroup.Count)
	case "decrease":
		updateAction.Payload = fmt.Sprintf("Successfully decreased task group count for %s:%s from %d to %d", jobID, taskGroupID, originalCount, foundTaskGroup.Count)
	case "stop":
		updateAction.Payload = fmt.Sprintf("Successfully stopped task group %s:%s", jobID, taskGroupID)
	}

	logger.Info(updateAction.Payload)
	c.send <- updateAction
}

func (c *NomadConnection) submitJob(action Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to submit job: NomadReadOnly is set to true")
		c.send <- &Action{Type: errorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	if defaultConfig.HideEnvData {
		logger.Errorf("Unable to submit job: HideEnvData is set to true")
		c.send <- &Action{Type: errorNotification, Payload: "HideEnvData must be false to submit job", Index: index}
		return
	}

	jobjson := action.Payload.(string)
	runjob := api.Job{}
	json.Unmarshal([]byte(jobjson), &runjob)

	logger.Infof("Started submission of job with id: %s", runjob.ID)

	_, _, err := c.region.Client.Jobs().Register(&runjob, nil)
	if err != nil {
		logger.Errorf("connection: unable to submit job '%s' : %s", runjob.ID, err)
		c.send <- &Action{Type: errorNotification, Payload: fmt.Sprintf("Unable to submit job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully submit job '%s'", runjob.ID)
	c.send <- &Action{Type: successNotification, Payload: "The job has been successfully updated.", Index: index}
}

func (c *NomadConnection) stopJob(action Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to stop job: NomadReadOnly is set to true")
		c.send <- &Action{Type: errorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	jobID := action.Payload.(string)

	logger.Infof("Begin stop of job with id: %s", jobID)

	_, _, err := c.region.Client.Jobs().Deregister(jobID, nil)
	if err != nil {
		logger.Errorf("connection: unable to stop job '%s' : %s", jobID, err)
		c.send <- &Action{Type: errorNotification, Payload: fmt.Sprintf("Unable to stop job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully stopped job '%s'", jobID)
	c.send <- &Action{Type: successNotification, Payload: "The job has been successfully stopped.", Index: index}
}

func (c *NomadConnection) evaluateJob(action Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to evaluate job: NomadReadOnly is set to true")
		c.send <- &Action{Type: errorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	jobID := action.Payload.(string)

	logger.Infof("Begin evaluate of job with id: %s", jobID)

	_, _, err := c.region.Client.Jobs().ForceEvaluate(jobID, nil)
	if err != nil {
		logger.Errorf("connection: unable to evaluate job '%s' : %s", jobID, err)
		c.send <- &Action{Type: errorNotification, Payload: fmt.Sprintf("Unable to evaluate job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully re-evaluated job '%s'", jobID)
	c.send <- &Action{Type: successNotification, Payload: "The job has been successfully re-evaluated.", Index: index}
}

func (c *NomadConnection) fetchRegions() {
	c.send <- &Action{Type: fetchedNomadRegions, Payload: c.hub.regions}
}
