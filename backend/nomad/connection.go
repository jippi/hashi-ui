package nomad

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/nomad/allocations"
	"github.com/jippi/hashi-ui/backend/nomad/cluster"
	"github.com/jippi/hashi-ui/backend/nomad/deployments"
	"github.com/jippi/hashi-ui/backend/nomad/evaluations"
	"github.com/jippi/hashi-ui/backend/nomad/jobs"
	"github.com/jippi/hashi-ui/backend/nomad/members"
	"github.com/jippi/hashi-ui/backend/nomad/nodes"
	"github.com/jippi/hashi-ui/backend/structs"
	"github.com/jippi/hashi-ui/backend/subscriber"
	logging "github.com/op/go-logging"
	uuid "github.com/satori/go.uuid"
)

var random = rand.New(rand.NewSource(time.Now().UnixNano()))
var logger = logging.MustGetLogger("hashi-ui")

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
	client    *api.Client
}

// NewConnection creates a new connection.
func NewConnection(socket *websocket.Conn, client *api.Client) *Connection {
	connectionID := uuid.NewV4()

	return &Connection{
		ID:        connectionID,
		shortID:   fmt.Sprintf("%s", connectionID)[0:8],
		watches:   &subscriber.Manager{},
		socket:    socket,
		receive:   make(chan *structs.Action),
		send:      make(chan *structs.Action),
		destroyCh: make(chan struct{}),
		client:    client,
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
			ensureIndex(action)

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

func ensureIndex(action *structs.Action) {
	if action.Index == 0 {
		action.Index = uint64(random.Int())
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
	// Deployments
	//
	case deployments.WatchList:
		go Watch(deployments.NewList(action), c.watches, c.client, c.send, c.destroyCh)
	case deployments.UnwatchList:
		go Unwatch(deployments.NewList(action), c.watches)
	case deployments.WatchInfo:
		go Watch(deployments.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case deployments.UnwatchInfo:
		go Unwatch(deployments.NewInfo(action), c.watches)
	case deployments.WatchAllocations:
		go Watch(deployments.NewAllocations(action), c.watches, c.client, c.send, c.destroyCh)
	case deployments.UnwatchAllocations:
		go Unwatch(deployments.NewAllocations(action), c.watches)
	case deployments.ChangeStatus:
		go Once(deployments.NewCHangeStatus(action), c.watches, c.client, c.send, c.destroyCh)

	//
	// Jobs
	//
	case jobs.WatchList:
		fallthrough // same as filtered
	case jobs.WatchListFiltered:
		go Watch(jobs.NewList(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.UnwatchListFiltered:
		fallthrough // same as filtered
	case jobs.UnwatchList:
		go Unwatch(jobs.NewList(action), c.watches)
	case jobs.WatchInfo:
		go Watch(jobs.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.UnwatchInfo:
		go Unwatch(jobs.NewInfo(action), c.watches)
	case jobs.WatchVersions:
		go Watch(jobs.NewVersions(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.UnwatchVersions:
		go Unwatch(jobs.NewVersions(action), c.watches)
	case jobs.WatchDeployments:
		go Watch(jobs.NewDeployments(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.UnwatchDeployments:
		go Unwatch(jobs.NewDeployments(action), c.watches)
	case jobs.ChangeTaskGroupCount:
		go Once(jobs.NewScale(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.EvaluateJob:
		go Once(jobs.NewEvaluate(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.WatchAllocations:
		go Watch(jobs.NewAllocations(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.UnwatchAllocations:
		go Unwatch(jobs.NewAllocations(action), c.watches)
	case jobs.Stop:
		go Once(jobs.NewStop(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.ForcePeriodicRun:
		go Once(jobs.NewForcePeriodicRun(action), c.watches, c.client, c.send, c.destroyCh)
	case jobs.Submit:
		go Once(jobs.NewSubmit(action), c.watches, c.client, c.send, c.destroyCh)

	//
	// Allocations
	//
	case allocations.WatchList:
		go Watch(allocations.NewList(action, false), c.watches, c.client, c.send, c.destroyCh)
	case allocations.WatchListShallow:
		go Watch(allocations.NewList(action, true), c.watches, c.client, c.send, c.destroyCh)
	case allocations.UnwatchList:
		go Unwatch(allocations.NewList(action, false), c.watches)
	case allocations.UnwatchListShallow:
		go Unwatch(allocations.NewList(action, true), c.watches)
	case allocations.WatchInfo:
		go Watch(allocations.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case allocations.UnwatchInfo:
		go Unwatch(allocations.NewInfo(action), c.watches)
	case allocations.WatchFile:
		go Stream(allocations.NewStreamFile(action), c.watches, c.client, c.send, c.destroyCh)
	case allocations.UnwatchFile:
		go Unwatch(allocations.NewStreamFile(action), c.watches)
	case allocations.FetchDir:
		go Once(allocations.NewDir(action), c.watches, c.client, c.send, c.destroyCh)

	//
	// Nodes
	//
	case nodes.WatchList:
		go Watch(nodes.NewList(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.UnwatchList:
		go Unwatch(nodes.NewList(action), c.watches)
	case nodes.WatchInfo:
		go Watch(nodes.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.UnwatchInfo:
		go Unwatch(nodes.NewInfo(action), c.watches)
	case nodes.FetchInfo:
		go Once(nodes.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.Drain:
		go Once(nodes.NewDrain(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.Remove:
		go Once(nodes.NewRemove(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.FetchClientStats:
		go Once(nodes.NewStats(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.WatchStats:
		go Watch(nodes.NewStats(action), c.watches, c.client, c.send, c.destroyCh)
	case nodes.UnwatchStats:
		go Unwatch(nodes.NewStats(action), c.watches)

	//
	// Members
	//
	case members.WatchMembers:
		go Stream(members.NewList(action), c.watches, c.client, c.send, c.destroyCh)
	case members.UnwatchMembers:
		go Unwatch(members.NewList(action), c.watches)
	case members.WatchInfo:
		go Watch(members.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case members.UnwatchInfo:
		go Unwatch(members.NewInfo(action), c.watches)
	case members.FetchInfo:
		go Once(members.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)

	//
	// Evaluations
	//
	case evaluations.WatchList:
		go Watch(evaluations.NewList(action), c.watches, c.client, c.send, c.destroyCh)
	case evaluations.UnwatchList:
		go Unwatch(evaluations.NewList(action), c.watches)
	case evaluations.WatchInfo:
		go Watch(evaluations.NewInfo(action), c.watches, c.client, c.send, c.destroyCh)
	case evaluations.UnwatchInfo:
		go Unwatch(evaluations.NewInfo(action), c.watches)

	//
	// Cluster
	//
	case cluster.EvaluateAllJobs:
		go Once(cluster.NewEvaluateAllJobs(action), c.watches, c.client, c.send, c.destroyCh)
	case cluster.ReconsileSummaries:
		go Once(cluster.NewReconsileSummaries(action), c.watches, c.client, c.send, c.destroyCh)
	case cluster.ForceGC:
		go Once(cluster.NewForceGC(action), c.watches, c.client, c.send, c.destroyCh)
	case cluster.WatchClusterStatistics:
		go Stream(cluster.NewStats(action), c.watches, c.client, c.send, c.destroyCh)
	case cluster.UnwatchClusterStatistics:
		go Unwatch(cluster.NewStats(action), c.watches)

	case fetchNomadRegions:
		// go c.fetchRegions()

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
