package nomad

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/imkira/go-observer"
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
	ID                uuid.UUID
	shortID           string
	socket            *websocket.Conn
	receive           chan *structs.Action
	send              chan *structs.Action
	destroyCh         chan struct{}
	watches           *subscriber.Manager
	hub               *Hub
	region            *Region
	broadcastChannels *RegionBroadcastChannels
}

// NewConnection creates a new connection.
func NewConnection(hub *Hub, socket *websocket.Conn, nomadRegion *Region, channels *RegionBroadcastChannels) *Connection {
	connectionID := uuid.NewV4()

	return &Connection{
		ID:                connectionID,
		shortID:           fmt.Sprintf("%s", connectionID)[0:8],
		watches:           &subscriber.Manager{},
		hub:               hub,
		socket:            socket,
		receive:           make(chan *structs.Action),
		send:              make(chan *structs.Action),
		destroyCh:         make(chan struct{}),
		region:            nomadRegion,
		broadcastChannels: channels,
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
	var action structs.Action

	for {
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
	// Actions for a list of members (aka servers in the UI)
	//
	case watchMembers:
		go c.watchGenericBroadcast("/members", fetchedMembers, c.region.broadcastChannels.members, c.hub.cluster.members)
	case unwatchMembers:
		c.unwatchGenericBroadcast("/members")

	//
	// Actions for a list of deployments
	//
	case watchDeployments:
		go c.watchGenericBroadcast("/deployments", fetchedDeployments, c.region.broadcastChannels.deployments, c.region.deployments)
	case unwatchDeployments:
		c.unwatchGenericBroadcast("/deployments")

	//
	// Actions for a list of jobs
	//
	case watchJobs:
		go c.watchGenericBroadcast("/jobs", fetchedJobs, c.region.broadcastChannels.jobs, c.region.jobs)
	case unwatchJobs:
		c.unwatchGenericBroadcast("/jobs")

	//
	// Actions for filtered job lists
	//
	case watchJobsFiltered:
		go c.watchJobsFiltered(action)
	case unwatchJobsFiltered:
		c.unwatchJobsFiltered(action)

	//
	// Actions for a list of allocations
	//
	case watchAllocs:
		go c.watchGenericBroadcast("/allocations", fetchedAllocs, c.region.broadcastChannels.allocations, c.region.allocations)
	case watchAllocsShallow:
		go c.watchGenericBroadcast("/allocations-shallow", fetchedAllocs, c.region.broadcastChannels.allocationsShallow, c.region.allocationsShallow)
	case unwatchAllocs:
		c.unwatchGenericBroadcast("/allocations")
	case unwatchAllocsShallow:
		c.unwatchGenericBroadcast("/allocations-shallow")

	//
	// Actions for a list of nodes (aka clients in the UI)
	//
	case watchNodes:
		go c.watchGenericBroadcast("/nodes", fetchedNodes, c.region.broadcastChannels.nodes, c.region.nodes)
	case unwatchNodes:
		c.unwatchGenericBroadcast("/nodes")

	//
	// Actions for a list of evaluations
	//
	case watchClusterStatistics:
		go c.watchGenericBroadcast("/cluster/statistics", fetchedClusterStatistics, c.region.broadcastChannels.clusterStatistics, c.region.clusterStatistics)
	case unwatchClusterStatistics:
		c.unwatchGenericBroadcast("/cluster/statistics")

	//
	// Actions for a list of evaluations
	//
	case watchEvals:
		go c.watchGenericBroadcast("/evaluations", fetchedEvals, c.region.broadcastChannels.evaluations, c.region.evaluations)
	case unwatchEvals:
		c.unwatchGenericBroadcast("/evaluations")

	//
	// Actions for a single node (aka client in the UI)
	//
	case watchNode:
		go c.watchNode(action)
	case unwatchNode:
		watchKey := fmt.Sprintf("/node/%s", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)
	case fetchNode:
		go c.fetchNode(action)

	//
	// Actions for a single job
	//
	case watchJob:
		go c.watchJob(action)
	case unwatchJob:
		c.unwatchJob(action)

	// Deployments for a specific job
	case watchJobDeployments:
		go c.watchJobDeployments(action)
	case unwatchJobDeployments:
		watchKey := fmt.Sprintf("/job/%s/deployments", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	// Versions for a specific job
	case watchJobVersions:
		go c.watchJobVersions(action)
	case unwatchJobVersions:
		watchKey := fmt.Sprintf("/job/%s/versions", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	//
	// Actions for a single allocation
	//
	case watchAlloc:
		go c.watchAlloc(action)
	case unwatchAlloc:
		watchKey := fmt.Sprintf("/allocation/%s", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	//
	// Actions for a single deployment
	//
	case watchDeployment:
		go c.watchDeployment(action)
	case unwatchDeployment:
		watchKey := fmt.Sprintf("/deployment/%s", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	//
	// Allocations for a single deployment
	//
	case watchDeploymentAllocs:
		go c.watchDeploymentAllocs(action)
	case unwatchDeploymentAllocs:
		watchKey := fmt.Sprintf("/deployment/%s/allocations", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	//
	// Actions for allocation FS
	//
	case fetchDir:
		go c.fetchDir(action)
	case watchFile:
		go c.watchFile(action)
	case unwatchFile:
		c.unwatchFile(action)

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

	// Actions for a single evaluation
	case watchEval:
		go c.watchEval(action)
	case unwatchEval:
		watchKey := fmt.Sprintf("/evaluation/%s", action.Payload.(string))
		c.watches.Unsubscribe(watchKey)
		c.Infof("Unwatching %s", watchKey)

	// Change task group count
	case changeTaskGroupCount:
		go c.changeTaskGroupCount(action)

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

	case evaluateJob:
		go c.evaluateJob(action)

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

	case watchJobAllocs:
		go c.watchJobAllocations(action)
	case unwatchJobAllocs:
		c.unwatchJobAllocations(action)

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

	// Clear subscribers
	c.watches.Clear()

	// Close the socket
	c.socket.Close()

	// Kill any remaining watcher routines
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

func (c *Connection) unwatchJobsFiltered(action structs.Action) {
	payload := action.Payload.(map[string]interface{})
	watchKey := "/jobs?prefix="

	if prefix, ok := payload["prefix"]; ok {
		watchKey = watchKey + prefix.(string)
	}

	c.watches.Unsubscribe(watchKey)
	c.Infof("Stopped watching %s", watchKey)
}

func (c *Connection) watchJobsFiltered(action structs.Action) {
	payload := action.Payload.(map[string]interface{})

	q := &api.QueryOptions{
		WaitIndex:  1,
		WaitTime:   10 * time.Second,
		AllowStale: c.region.Config.NomadAllowStale,
	}

	if prefix, ok := payload["prefix"]; ok {
		q.Prefix = prefix.(string)
	}

	watchKey := fmt.Sprintf("/jobs?prefix=%s", q.Prefix)

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
			alloc, meta, err := c.region.Client.Jobs().List(q)

			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch filtered jobs (%s): %s", q.Prefix, err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedJobsFiltered, Payload: alloc, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) watchAlloc(action structs.Action) {
	allocID := action.Payload.(string)
	watchKey := fmt.Sprintf("/allocation/%s", allocID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			alloc, meta, err := c.region.Client.Allocations().Info(allocID, q)

			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch alloc info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedAlloc, Payload: alloc, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) watchDeployment(action structs.Action) {
	deploymentID := action.Payload.(string)
	watchKey := fmt.Sprintf("/deployment/%s", deploymentID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			deployment, meta, err := c.region.Client.Deployments().Info(deploymentID, q)
			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch deployment info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedDeployment, Payload: deployment, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) watchDeploymentAllocs(action structs.Action) {
	deploymentID := action.Payload.(string)
	watchKey := fmt.Sprintf("/deployment/%s/allocations", deploymentID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			allocs, meta, err := c.region.Client.Deployments().Allocations(deploymentID, q)
			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch deployment info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedDeploymentAllocs, Payload: allocs, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) watchJobDeployments(action structs.Action) {
	jobID := action.Payload.(string)
	watchKey := fmt.Sprintf("/job/%s/deployments", jobID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			deployments, meta, err := c.region.Client.Jobs().Deployments(jobID, q)
			// Check if we are still subscribed
			if !c.watches.Subscribed(watchKey) {
				return
			}

			// Check for errors
			if err != nil {
				c.Errorf("connection: unable to fetch job deployments: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedJobDeployments, Payload: deployments, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) watchEval(action structs.Action) {
	evalID := action.Payload.(string)
	watchKey := fmt.Sprintf("/evaluation/%s", evalID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}
	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			eval, meta, err := c.region.Client.Evaluations().Info(evalID, q)
			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch eval info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedEval, Payload: eval, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
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

func (c *Connection) fetchNode(action structs.Action) {
	nodeID := action.Payload.(string)
	node, _, err := c.region.Client.Nodes().Info(nodeID, nil)
	if err != nil {
		c.Errorf("websocket: unable to fetch node %q: %s", nodeID, err)
	}

	c.send <- &structs.Action{Type: fetchedNode, Payload: node}
}

func (c *Connection) watchNode(action structs.Action) {
	nodeID := action.Payload.(string)
	watchKey := fmt.Sprintf("/node/%s", nodeID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}
	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			node, meta, err := c.region.Client.Nodes().Info(nodeID, q)
			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch node info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedNode, Payload: node, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) watchGenericBroadcast(watchKey string, actionEvent string, prop observer.Property, initialPayload interface{}) {
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

	c.Debugf("Sending our current %s list", watchKey)
	c.send <- &structs.Action{Type: actionEvent, Payload: initialPayload, Index: 0}

	stream := prop.Observe()
	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		case <-stream.Changes():
			// advance to next value
			stream.Next()

			channelAction := stream.Value().(*structs.Action)
			c.Debugf("got new data for %s (WaitIndex: %d)", watchKey, channelAction.Index)

			if !c.watches.Subscribed(watchKey) {
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

func (c *Connection) unwatchGenericBroadcast(watchKey string) {
	c.Infof("Unwatching %s", watchKey)
	c.watches.Unsubscribe(watchKey)
}

func (c *Connection) watchJobVersions(action structs.Action) {
	jobID := action.Payload.(string)
	watchKey := "/job/" + jobID + "/versions"

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}
	for {
		select {
		case <-c.destroyCh:
			return

		case <-subscribeCh:
			return

		default:
			jobs, _, meta, err := c.region.Client.Jobs().Versions(jobID, false, q)

			// Check if we are still subscribed
			if !c.watches.Subscribed(watchKey) {
				return
			}

			// Check for errors
			if err != nil {
				c.Errorf("connection: unable to fetch job versions: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			// Convert to a list of job versions
			response := make([]*uint64, 0)
			for _, version := range jobs {
				response = append(response, version.Version)
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedJobVersions, Payload: response, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) parseJobAction(action structs.Action) (string, int) {
	payload := action.Payload.(map[string]interface{})
	jobID := payload["id"].(string)

	// optional job version
	jobVersion := int(-1)
	var v interface{}
	var getJobVersion bool

	if v, getJobVersion = payload["version"]; getJobVersion {
		jobVersion, _ = strconv.Atoi(v.(string))
	}

	return jobID, jobVersion
}

func (c *Connection) watchJob(action structs.Action) {
	ID, version := c.parseJobAction(action)
	watchKey := fmt.Sprintf("/job/%s@%d", ID, version)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}
	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			var job *api.Job
			var jobs []*api.Job
			var meta *api.QueryMeta
			var err error

			if version == -1 {
				job, meta, err = c.region.Client.Jobs().Info(ID, q)
			} else {
				jobs, _, meta, err = c.region.Client.Jobs().Versions(ID, false, q)

				for _, jobVersion := range jobs {
					if string(*jobVersion.Version) == string(version) {
						job = jobVersion
						break
					}
				}
			}

			// Check if we are still subscribed
			if !c.watches.Subscribed(watchKey) {
				return
			}

			// Check for errors in the response
			if err != nil {
				c.Errorf("connection: unable to fetch job info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			// Optionally hide all environment keys
			if c.region.Config.NomadHideEnvData {
				for _, taskGroup := range job.TaskGroups {
					for _, task := range taskGroup.Tasks {
						for k := range task.Env {
							task.Env[k] = ""
						}
					}
				}
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedJob, Payload: job, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) unwatchJob(action structs.Action) {
	ID, version := c.parseJobAction(action)
	watchKey := fmt.Sprintf("/job/%s@%d", ID, version)

	c.watches.Unsubscribe(watchKey)
	c.Infof("Stopped subscribing to %s", watchKey)
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

func (c *Connection) changeTaskGroupCount(action structs.Action) {
	params := action.Payload.(map[string]interface{})

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	jobID := params["job"].(string)
	taskGroupID := params["taskGroup"].(string)
	scaleAction := params["scaleAction"].(string)

	job, _, err := c.region.Client.Jobs().Info(jobID, &api.QueryOptions{AllowStale: c.region.Config.NomadAllowStale})
	if err != nil {
		c.Errorf("connection: unable to fetch job info: %s", err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Could not find job: %s", jobID), Index: index}
		return
	}

	var foundTaskGroup *api.TaskGroup
	for _, taskGroup := range job.TaskGroups {
		if *taskGroup.Name == taskGroupID {
			foundTaskGroup = taskGroup
			break
		}
	}

	if *foundTaskGroup.Name == "" {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Could not find Task Group: %s", taskGroupID), Index: index}
		return
	}

	originalCount := foundTaskGroup.Count

	switch scaleAction {
	case "set":
		foundTaskGroup.Count = params["count"].(*int)
	case "increase":
		foundTaskGroup.Count = IntToPtr(PtrToInt(foundTaskGroup.Count) + 1)
	case "decrease":
		foundTaskGroup.Count = IntToPtr(PtrToInt(foundTaskGroup.Count) - 1)
	case "stop":
		foundTaskGroup.Count = IntToPtr(0)
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

		c.changeTaskGroupCount(structs.Action{Payload: stopPayload})
		c.changeTaskGroupCount(structs.Action{Payload: restartPayload})
		return
	default:
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Invalid action: %s", scaleAction), Index: index}
		return
	}

	job.Canonicalize()

	updateAction, updateErr := c.region.updateJob(job)
	updateAction.Index = index

	if updateErr != nil {
		logger.Error(updateErr)
		c.send <- updateAction
		return
	}

	switch scaleAction {
	case "increase":
		updateAction.Payload = fmt.Sprintf("Successfully increased task group count for %s:%s from %d to %d", jobID, taskGroupID, *originalCount, *foundTaskGroup.Count)
	case "decrease":
		updateAction.Payload = fmt.Sprintf("Successfully decreased task group count for %s:%s from %d to %d", jobID, taskGroupID, *originalCount, *foundTaskGroup.Count)
	case "stop":
		updateAction.Payload = fmt.Sprintf("Successfully stopped task group %s:%s", jobID, taskGroupID)
	}

	logger.Info(updateAction.Payload)
	c.send <- updateAction
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

func (c *Connection) evaluateJob(action structs.Action) {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	index := uint64(r.Int())

	if c.region.Config.NomadReadOnly {
		logger.Errorf("Unable to evaluate job: NomadReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "The backend server is in read-only mode", Index: index}
		return
	}

	jobID := action.Payload.(string)

	logger.Infof("Begin evaluate of job with id: %s", jobID)

	_, _, err := c.region.Client.Jobs().ForceEvaluate(jobID, nil)
	if err != nil {
		logger.Errorf("connection: unable to evaluate job '%s' : %s", jobID, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to evaluate job : %s", err), Index: index}
		return
	}

	logger.Infof("connection: successfully re-evaluated job '%s'", jobID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "The job has been successfully re-evaluated.", Index: index}
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

	for _, job := range c.region.jobs {
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

func (c *Connection) watchJobAllocations(action structs.Action) {
	ID := action.Payload.(string)
	watchKey := fmt.Sprintf("/job/%s/allocations", ID)

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

	q := &api.QueryOptions{WaitIndex: 1, AllowStale: c.region.Config.NomadAllowStale}
	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			allocations, meta, err := c.region.Client.Jobs().Allocations(ID, true, q)

			if !c.watches.Subscribed(watchKey) {
				return
			}

			if err != nil {
				logger.Errorf("watch: unable to fetch job allocations: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				// Don't need task state at the moment
				for i := range allocations {
					allocations[i].TaskStates = make(map[string]*api.TaskState)
				}

				c.send <- &structs.Action{Type: fetchedJobAllocs, Payload: allocations, Index: remoteWaitIndex}
				q.WaitIndex = remoteWaitIndex
			}
		}
	}
}

func (c *Connection) unwatchJobAllocations(action structs.Action) {
	watchKey := fmt.Sprintf("/job/%s/allocations", action.Payload.(string))
	c.watches.Unsubscribe(watchKey)
	c.Infof("Unwatching %s", watchKey)
}

func (c *Connection) fetchRegions() {
	c.send <- &structs.Action{Type: fetchedNomadRegions, Payload: c.hub.regions}
}
