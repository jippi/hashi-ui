package nomad

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/allocations"
	"github.com/jippi/hashi-ui/backend/nomad/deployments"
	"github.com/jippi/hashi-ui/backend/nomad/evaluations"
	"github.com/jippi/hashi-ui/backend/nomad/jobs"
	"github.com/jippi/hashi-ui/backend/nomad/nodes"
	"github.com/jippi/hashi-ui/backend/structs"
	"github.com/jippi/hashi-ui/backend/subscriber"

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

// Connection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Nomad state changes. It
// maintains a set to keep track of the running watches.
type Connection struct {
	ID        uuid.UUID
	shortID   string
	socket    *websocket.Conn
	receive   chan *structs.Action
	send      chan *structs.Action
	destroyCh chan struct{}
	watches   *subscriber.Manager
	hub       *Hub
	region    *Region
}

// NewConnection creates a new connection.
func NewConnection(hub *Hub, socket *websocket.Conn, nomadRegion *Region) *Connection {
	connectionID := uuid.NewV4()

	return &Connection{
		ID:        connectionID,
		shortID:   fmt.Sprintf("%s", connectionID)[0:8],
		watches:   &subscriber.Manager{},
		hub:       hub,
		socket:    socket,
		receive:   make(chan *structs.Action),
		send:      make(chan *structs.Action),
		destroyCh: make(chan struct{}),
		region:    nomadRegion,
	}
}

// Warningf is a stupid wrapper for logger.Warningf
func (c *Connection) Warningf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Warningf(message, args...)
}

// Errorf is a stupid wrapper for logger.Errorf
func (c *Connection) Errorf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Errorf(message, args...)
}

// Infof is a stupid wrapper for logger.Infof
func (c *Connection) Infof(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Infof(message, args...)
}

// Debugf is a stupid wrapper for logger.Debugf
func (c *Connection) Debugf(format string, args ...interface{}) {
	message := fmt.Sprintf("[%s] ", c.shortID) + format
	logger.Debugf(message, args...)
}

func (c *Connection) writePump() {
	defer c.socket.Close()

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
				return
			}
		}
	}
}

func (c *Connection) readPump() {
	for {
		var action structs.Action
		err := c.socket.ReadJSON(&action)
		if err != nil {
			logger.Errorf("Could not read payload: %s", err)
			break
		}

		c.process(action)
	}
}

func (c *Connection) process(action structs.Action) {
	c.Debugf("Processing event %s (index %d)", action.Type, action.Index)

	switch action.Type {
	//
	// Members
	//
	case watchMembers:
		// go c.watchGenericBroadcast("/members", fetchedMembers, c.region.broadcastChannels.members, c.hub.cluster.members)
	case unwatchMembers:
		// c.unwatchGenericBroadcast("/members")

	//
	// Deployments
	//
	case deployments.WatchList:
		go Watch(deployments.NewList(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case deployments.UnwatchList:
		go Unwatch(deployments.NewList(action), c.watches)
	case deployments.WatchInfo:
		go Watch(deployments.NewInfo(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case deployments.UnwatchInfo:
		go Unwatch(deployments.NewInfo(action), c.watches)
	case deployments.WatchAllocations:
		go Watch(deployments.NewAllocations(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case deployments.UnwatchAllocations:
		go Unwatch(deployments.NewAllocations(action), c.watches)

	//
	// Jobs
	//
	case jobs.WatchList:
		fallthrough // same as filtered
	case jobs.WatchListFiltered:
		go Watch(jobs.NewList(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.UnwatchListFiltered:
		fallthrough // same as filtered
	case jobs.UnwatchList:
		go Unwatch(jobs.NewList(action), c.watches)
	case jobs.WatchInfo:
		go Watch(jobs.NewInfo(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.UnwatchInfo:
		go Unwatch(jobs.NewInfo(action), c.watches)
	case jobs.WatchVersions:
		go Watch(jobs.NewVersions(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.UnwatchVersions:
		go Unwatch(jobs.NewVersions(action), c.watches)
	case jobs.WatchDeployments:
		go Watch(jobs.NewDeployments(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.UnwatchDeployments:
		go Unwatch(jobs.NewDeployments(action), c.watches)
	case jobs.ChangeTaskGroupCount:
		go Once(jobs.NewScale(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.EvaluateJob:
		go Once(jobs.NewEvaluate(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.WatchAllocations:
		go Watch(jobs.NewAllocations(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case jobs.UnwatchAllocations:
		go Unwatch(jobs.NewAllocations(action), c.watches)

	//
	// Allocations
	//
	case allocations.WatchList:
		go Watch(allocations.NewList(action, false), c.watches, c.region.Client, c.send, c.destroyCh)
	case allocations.WatchListShallow:
		go Watch(allocations.NewList(action, true), c.watches, c.region.Client, c.send, c.destroyCh)
	case allocations.UnwatchList:
		go Unwatch(allocations.NewList(action, false), c.watches)
	case allocations.UnwatchListShallow:
		go Unwatch(allocations.NewList(action, true), c.watches)
	case allocations.WatchInfo:
		go Watch(allocations.NewInfo(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case allocations.UnwatchInfo:
		go Unwatch(allocations.NewInfo(action), c.watches)

	//
	// Nodes
	//
	case nodes.WatchList:
		go Watch(nodes.NewList(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case nodes.UnwatchList:
		go Unwatch(nodes.NewList(action), c.watches)
	case nodes.WatchInfo:
		go Watch(nodes.NewInfo(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case nodes.UnwatchInfo:
		go Unwatch(nodes.NewInfo(action), c.watches)
	case nodes.FetchInfo:
		go Once(nodes.NewInfo(action), c.watches, c.region.Client, c.send, c.destroyCh)

	//
	// Evaluations
	//
	case evaluations.WatchList:
		go Watch(evaluations.NewList(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case evaluations.UnwatchList:
		go Unwatch(evaluations.NewList(action), c.watches)
	case evaluations.WatchInfo:
		go Watch(evaluations.NewInfo(action), c.watches, c.region.Client, c.send, c.destroyCh)
	case evaluations.UnwatchInfo:
		go Unwatch(evaluations.NewInfo(action), c.watches)

	//
	// FS
	//
	case fetchDir:
		go c.fetchDir(action)
	case watchFile:
		go c.watchFile(action)
	case unwatchFile:
		c.unwatchFile(action)

	//
	// Cluster
	//
	case watchClusterStatistics:
		// go c.watchGenericBroadcast("/cluster/statistics", fetchedClusterStatistics, c.region.broadcastChannels.clusterStatistics, c.region.clusterStatistics)
	case unwatchClusterStatistics:
	// c.unwatchGenericBroadcast("/cluster/statistics")
	case fetchClientStats:
		go c.fetchClientStats(action)
	case watchClientStats:
		go c.watchClientStats(action)
	case unwatchClientStats:
		watchKey := fmt.Sprintf("/node/%s/statistics", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	//
	// Actions for a single member (aka server in the UI)
	//
	case watchMember:
		go c.watchMember(action)
	case unwatchMember:
		watchKey := fmt.Sprintf("/member/%s", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)
	case fetchMember:
		go c.fetchMember(action)

	// Submit (create or update) a job
	case submitJob:
		go c.submitJob(action)

	// Force a periodic run of a job
	case forcePeriodicRun:
		go c.forcePeriodicRun(action)

	// Stop a job
	case stopJob:
		go c.stopJob(action)

	case fetchNomadRegions:
		go c.fetchRegions()

	case changeDeploymentStatus:
		go c.changeDeploymentStatus(action)

	case drainClient:
		go c.drainClient(action)

	case removeClient:
		go c.removeClient(action)

	case forceGC:
		go c.forceGC(action)

	case reconcileSystem:
		go c.reconcileSystem(action)

	case evaluateAllJobs:
		go c.evaluateAllJobs(action)

	// Nice in debug
	default:
		logger.Errorf("Unknown action: %s", action.Type)
	}
}

// Handle monitors the websocket connection for incoming actions. It sends
// out actions on state changes.
func (c *Connection) Handle() {
	go c.keepAlive()
	go c.writePump()
	go c.subscriptionPublisher()

	// Read from ws, will only return once connection has an error
	c.readPump()

	c.Debugf("Connection closing down")
	c.socket.Close()

	close(c.destroyCh)

	c.Infof("Waiting for subscriptions to finish up")
	c.watches.Wait()

	c.Infof("Done, closing send channel")
	close(c.send)
}

func (c *Connection) subscriptionPublisher() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.destroyCh:
			return

		case <-ticker.C:
			c.Infof("WaitGroups: %d | Subscriptions: %s", c.watches.Count(), strings.Join(c.watches.Subscriptions(), ", "))
		}
	}
}

func (c *Connection) keepAlive() {
	logger.Debugf("Starting keep-alive packer sender")
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	c.watches.Subscribe("/internal/keep-alive")
	defer c.watches.Unsubscribe("/internal/keep-alive")

	for {
		select {
		case <-c.destroyCh:
			return

		case <-ticker.C:
			logger.Debugf("Sending keep-alive packet")
			c.send <- &structs.Action{Type: structs.KeepAlive, Payload: "hello-world", Index: 0}
		}
	}
}

func (c *Connection) fetchMember(action structs.Action) {
	memberID := action.Payload.(string)
	member, err := c.hub.cluster.MemberWithID(memberID)
	if err != nil {
		c.Errorf("websocket: unable to fetch member %q: %s", memberID, err)
		return
	}

	c.send <- &structs.Action{Type: fetchedMember, Payload: member}
}

func (c *Connection) watchMember(action structs.Action) {
	memberID := action.Payload.(string)
	watchKey := fmt.Sprintf("/member/%s", memberID)

	// Check if we are already subscribed
	if c.watches.Subscribed(watchKey) {
		c.Infof("Already watching %s", watchKey)
		return
	}

	// Create subscription
	subscribeCh := c.watches.Subscribe(watchKey)
	defer func() {
		c.watches.Unsubscribe(watchKey)
		c.Infof("Stopped watching %s", watchKey)
	}()
	c.Infof("Started watching %s", watchKey)

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			member, err := c.hub.cluster.MemberWithID(memberID)
			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch member info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			c.send <- &structs.Action{Type: fetchedMember, Payload: member}

			time.Sleep(10 * time.Second)
		}
	}
}

func (c *Connection) fetchClientStats(action structs.Action) {
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

	c.send <- &structs.Action{Type: fetchedClientStats, Payload: stats, Index: 0}
}

func (c *Connection) watchClientStats(action structs.Action) {
	ID := action.Payload.(string)
	watchKey := "/node/" + ID + "/statistics"

	// Check if we are already subscribed
	if c.watches.Subscribed(watchKey) {
		c.Infof("Already watching %s", watchKey)
		return
	}

	// Create subscription
	subscribeCh := c.watches.Subscribe(watchKey)
	defer func() {
		c.watches.Unsubscribe(watchKey)
		c.Infof("Stopped watching %s", watchKey)
	}()
	c.Infof("Started watching %s", watchKey)

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			stats, err := c.region.Client.Nodes().Stats(ID, nil)

			// Check if we are still subscribed
			if !c.watches.Subscribed(watchKey) {
				return
			}

			// Check for errors
			if err != nil {
				logger.Errorf("watch: unable to fetch client stats: %s", err)
				time.Sleep(3 * time.Second)
				return
			}

			c.send <- &structs.Action{Type: fetchedClientStats, Payload: stats, Index: 0}
			time.Sleep(5 * time.Second)
		}
	}
}

func nodeURL(params map[string]interface{}) string {
	addr := params["addr"].(string)
	if params["secure"].(bool) {
		return fmt.Sprintf("https://%s", addr)
	}
	return fmt.Sprintf("http://%s", addr)
}

func (c *Connection) fetchDir(action structs.Action) {
	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}
	path := params["path"].(string)
	allocID := params["allocID"].(string)

	config := api.DefaultConfig()
	config.Address = nodeURL(params)

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

	c.send <- &structs.Action{Type: fetchedDir, Payload: dir, Index: 0}
}

func (c *Connection) parseWatchFileAction(action structs.Action) (string, string) {
	params := action.Payload.(map[string]interface{})
	ID := params["allocID"].(string)
	path := params["path"].(string)

	return ID, path
}

func (c *Connection) unwatchFile(action structs.Action) {
	allocID, path := c.parseWatchFileAction(action)
	watchKey := "/allocation/" + allocID + "/file" + path

	c.watches.Unsubscribe(watchKey)
	c.Infof("Stopped subscribing to %s", watchKey)
}

func (c *Connection) watchFile(action structs.Action) {
	allocID, path := c.parseWatchFileAction(action)
	watchKey := "/allocation/" + allocID + "/file" + path

	// Check if we are already subscribed
	if c.watches.Subscribed(watchKey) {
		c.Infof("Already watching %s", watchKey)
		return
	}

	// Create subscription
	subscribeCh := c.watches.Subscribe(watchKey)
	defer func() {
		c.watches.Unsubscribe(watchKey)
		c.Infof("Stopped watching %s", watchKey)
	}()
	c.Infof("Started watching %s", watchKey)

	config := api.DefaultConfig()
	config.Address = nodeURL(action.Payload.(map[string]interface{}))

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
		c.send <- &structs.Action{
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
	r = NewLineLimitReader(frameReader, int(defaultTailLines), int(defaultTailLines*bytesToLines), 1*time.Second)

	// Cleanup
	// defer r.Close()

	// Turn the reader into a channel
	lines := make(chan []byte)
	b := make([]byte, defaultTailLines*bytesToLines)
	go func() {
		for {
			select {
			case <-subscribeCh:
				return

			case <-c.destroyCh:
				return

			default:
				n, err := r.Read(b[:cap(b)])

				if err != nil {
					return
				}

				if n > 0 {
					lines <- b[0:n]
				}
			}
		}
	}()

	c.send <- &structs.Action{
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

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		case line := <-lines:
			if !c.watches.Subscribed(watchKey) {
				return
			}

			c.send <- &structs.Action{
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
		}
	}
}

func (c *Connection) submitJob(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to submit job: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	if c.region.Config.NomadHideEnvData {
		logger.Errorf("Unable to submit job: HideEnvData is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "HideEnvData must be false to submit job", Index: index}
		return
	}

	jobjson := action.Payload.(string)
	runjob := api.Job{}
	json.Unmarshal([]byte(jobjson), &runjob)

	logger.Infof("Started submission of job with id: %s", runjob.ID)

	_, _, err := c.region.Client.Jobs().Register(&runjob, nil)
	if err != nil {
		logger.Errorf("connection: unable to submit job '%s' : %s", *runjob.ID, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to submit job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully submit job '%s'", runjob.ID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "The job has been successfully updated.", Index: index}
}

func (c *Connection) stopJob(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to stop job: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	jobID := action.Payload.(string)

	logger.Infof("Begin stop of job with id: %s", jobID)

	_, _, err := c.region.Client.Jobs().Deregister(jobID, false, nil)
	if err != nil {
		logger.Errorf("connection: unable to stop job '%s' : %s", jobID, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to stop job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully stopped job '%s'", jobID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "The job has been successfully stopped.", Index: index}
}

func (c *Connection) forcePeriodicRun(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to evaluate job: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	jobID := action.Payload.(string)

	logger.Infof("Begin force-run of job with id: %s", jobID)

	allocID, _, err := c.region.Client.Jobs().PeriodicForce(jobID, nil)
	if err != nil {
		logger.Errorf("connection: unable to periodic force run job '%s' : %s", jobID, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to periodic force run job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully forced periodic job to run '%s' as allocation %s", jobID, allocID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: fmt.Sprintf("The job has been successfully re-run as allocation id %s.", allocID), Index: index}
}

func (c *Connection) changeDeploymentStatus(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to update deployment: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	payload := action.Payload.(map[string]interface{})

	var ID, actionType string
	var x interface{}
	var ok bool
	var err error

	if x, ok = payload["id"]; !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Missing deployment id", Index: index}
		return
	}
	ID = x.(string)

	if x, ok = payload["action"]; !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Missing action", Index: index}
		return
	}
	actionType = x.(string)

	switch actionType {
	case "promote":
		if x, ok = payload["group"]; ok {
			_, _, err = c.region.Client.Deployments().PromoteGroups(ID, []string{x.(string)}, nil)
		} else {
			_, _, err = c.region.Client.Deployments().PromoteAll(ID, nil)
		}
	case "fail":
		_, _, err = c.region.Client.Deployments().Fail(ID, nil)
	case "pause":
		_, _, err = c.region.Client.Deployments().Pause(ID, true, nil)
	case "resume":
		_, _, err = c.region.Client.Deployments().Pause(ID, false, nil)
	}

	if err != nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Failed to update deployment: %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully updated deployment '%s'", ID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully updated deployment.", Index: index}
}

func (c *Connection) drainClient(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to drain client: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	var ID, actionType string
	var ok bool
	var x interface{}
	var err error

	payload := action.Payload.(map[string]interface{})

	if x, ok = payload["id"]; !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Missing client id", Index: index}
		return
	}
	ID = x.(string)

	if x, ok = payload["action"]; !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Missing action key", Index: index}
		return
	}
	actionType = x.(string)

	switch actionType {
	case "enable":
		_, err = c.region.Client.Nodes().ToggleDrain(ID, true, nil)
	case "disable":
		_, err = c.region.Client.Nodes().ToggleDrain(ID, false, nil)
	default:
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Invalid action", Index: index}
	}

	if err != nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Failed to change client drain mode: %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully updated client drain mode '%s'", ID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully updated client drain mode.", Index: index}
}

func (c *Connection) removeClient(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to remove client: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	ID := action.Payload.(string)

	err := c.region.Client.Agent().ForceLeave(ID)
	if err != nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Failed to force leave the client: %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully force leaved client '%s'", ID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully force leaved the client.", Index: index}
}

func (c *Connection) forceGC(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	err := c.region.Client.System().GarbageCollect()
	if err != nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Failed to force gc: %s", err), Index: index}
		return
	}

	logger.Info("connection: successfully forced gc")
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully forced gc.", Index: index}
}

func (c *Connection) reconcileSystem(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	err := c.region.Client.System().ReconcileSummaries()
	if err != nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Failed to reconsile summaries: %s", err), Index: index}
		return
	}

	logger.Info("connection: successfully reconsiled summaries")
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "Successfully reconsiled summaries.", Index: index}
}

func (c *Connection) evaluateAllJobs(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	jobs, _, err := c.region.Client.Jobs().List(nil)
	if err != nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: err, Index: index}
	}

	for _, job := range jobs {
		go func(job *api.JobListStub) {
			c.Infof("Evaluating job %s", job.ID)
			if _, _, err := c.region.Client.Jobs().ForceEvaluate(job.ID, nil); err != nil {
				c.Infof("Falied to evaluate job %s: %s", job.ID, err)
			}
		}(job)
	}

	logger.Info("connection: evaluating all jobs in the background")
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "Evaluating all jobs in the background.", Index: index}
}

func (c *Connection) fetchRegions() {
	c.send <- &structs.Action{Type: fetchedNomadRegions, Payload: c.hub.regions}
}
