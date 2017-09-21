package nomad

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/nomad/allocations"
	"github.com/jippi/hashi-ui/backend/nomad/cluster"
	"github.com/jippi/hashi-ui/backend/nomad/deployments"
	"github.com/jippi/hashi-ui/backend/nomad/evaluations"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/nomad/jobs"
	"github.com/jippi/hashi-ui/backend/nomad/members"
	"github.com/jippi/hashi-ui/backend/nomad/nodes"
	"github.com/jippi/hashi-ui/backend/structs"
	"github.com/jippi/hashi-ui/backend/subscriber"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

var random = rand.New(rand.NewSource(time.Now().UnixNano()))

// Connection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Nomad state changes. It
// maintains a set to keep track of the running watches.
type Connection struct {
	cfg           *config.Config
	client        *api.Client
	destroyCh     chan struct{}
	id            uuid.UUID
	logger        *log.Entry
	sendCh        chan *structs.Action
	socket        *websocket.Conn
	subscriptions *subscriber.Manager
}

// NewConnection creates a new connection.
func NewConnection(socket *websocket.Conn, client *api.Client, logger *log.Entry, connectionID uuid.UUID, cfg *config.Config) *Connection {
	return &Connection{
		cfg:           cfg,
		client:        client,
		destroyCh:     make(chan struct{}),
		id:            connectionID,
		logger:        logger,
		sendCh:        make(chan *structs.Action),
		socket:        socket,
		subscriptions: &subscriber.Manager{},
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

	c.logger.Debugf("Connection closing down")
	c.socket.Close()

	close(c.destroyCh)

	c.logger.Infof("Waiting for subscriptions to finish up")
	c.subscriptions.Wait()
}

func (c *Connection) writePump() {
	defer c.socket.Close()

	for {
		select {

		case <-c.destroyCh:
			c.logger.Warningf("Stopping writePump")
			return

		case action, ok := <-c.sendCh:
			if !ok {
				if err := c.socket.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
					c.logger.Errorf("Could not write close message to websocket: %s", err)
				}
				return
			}

			if action == nil {
				c.logger.Warnf("Got empty action from sendCh")
				continue
			}

			c.ensureIndex(action)

			if err := c.socket.WriteJSON(action); err != nil {
				c.logger.Errorf("Could not write action to websocket: %s", err)
				return
			}
		}
	}
}

func (c *Connection) ensureIndex(action *structs.Action) {
	if action.Index == 0 {
		action.Index = uint64(random.Int())
	}
}

func (c *Connection) readPump() {
	for {
		var action structs.Action
		err := c.socket.ReadJSON(&action)
		if err != nil {
			c.logger.Errorf("Could not read payload: %s", err)
			break
		}

		c.process(action)
	}
}

func (c *Connection) process(action structs.Action) {
	c.logger.Debugf("Processing event %s (index %d)", action.Type, action.Index)

	switch action.Type {
	//
	// Deployments
	//
	case deployments.WatchList:
		c.watch(deployments.NewList(action, c.client, c.queryOptions()))
	case deployments.UnwatchList:
		c.unwatch(deployments.NewList(action, nil, nil))
	case deployments.WatchInfo:
		c.watch(deployments.NewInfo(action, c.client, c.queryOptions()))
	case deployments.UnwatchInfo:
		c.unwatch(deployments.NewInfo(action, nil, nil))
	case deployments.WatchAllocations:
		c.watch(deployments.NewAllocations(action, c.client, c.queryOptions()))
	case deployments.UnwatchAllocations:
		c.unwatch(deployments.NewAllocations(action, nil, nil))
	case deployments.ChangeStatus:
		c.once(deployments.NewCHangeStatus(action, c.client))

	//
	// Jobs
	//
	case jobs.WatchList:
		fallthrough // same as filtered
	case jobs.WatchListFiltered:
		c.watch(jobs.NewList(action, c.client, c.queryOptions()))
	case jobs.UnwatchListFiltered:
		fallthrough // same as filtered
	case jobs.UnwatchList:
		c.unwatch(jobs.NewList(action, c.client, c.queryOptions()))
	case jobs.WatchInfo:
		c.watch(jobs.NewInfo(action, c.client, c.queryOptions()))
	case jobs.UnwatchInfo:
		c.unwatch(jobs.NewInfo(action, nil, nil))
	case jobs.WatchVersions:
		c.watch(jobs.NewVersions(action, c.client, c.queryOptions()))
	case jobs.UnwatchVersions:
		c.unwatch(jobs.NewVersions(action, nil, nil))
	case jobs.WatchDeployments:
		c.watch(jobs.NewDeployments(action, c.client, c.queryOptions()))
	case jobs.UnwatchDeployments:
		c.unwatch(jobs.NewDeployments(action, nil, nil))
	case jobs.Scale:
		c.once(jobs.NewScale(action, c.client))
	case jobs.ForceEvaluate:
		c.once(jobs.NewForceEvaluate(action, c.client))
	case jobs.WatchAllocations:
		c.watch(jobs.NewAllocations(action, c.client, c.queryOptions()))
	case jobs.UnwatchAllocations:
		c.unwatch(jobs.NewAllocations(action, nil, nil))
	case jobs.Stop:
		c.once(jobs.NewStop(action, c.client))
	case jobs.PeriodicForce:
		c.once(jobs.NewPeriodicForce(action, c.client))
	case jobs.Submit:
		c.once(jobs.NewSubmit(action, c.client, c.cfg))

	//
	// Allocations
	//
	case allocations.WatchList:
		c.watch(allocations.NewList(action, false, c.client, c.queryOptions()))
	case allocations.UnwatchList:
		c.unwatch(allocations.NewList(action, false, nil, nil))
	case allocations.WatchListShallow:
		c.watch(allocations.NewList(action, true, c.client, c.queryOptions()))
	case allocations.UnwatchListShallow:
		c.unwatch(allocations.NewList(action, true, nil, nil))
	case allocations.WatchInfo:
		c.watch(allocations.NewInfo(action, c.client, c.queryOptions()))
	case allocations.UnwatchInfo:
		c.unwatch(allocations.NewInfo(action, nil, nil))
	case allocations.WatchFile:
		c.stream(allocations.NewFile(action, c.client))
	case allocations.UnwatchFile:
		c.unwatch(allocations.NewFile(action, nil))
	case allocations.FetchDir:
		c.once(allocations.NewDir(action, c.client))

	//
	// Nodes
	//
	case nodes.WatchList:
		c.watch(nodes.NewList(action, c.client, c.queryOptions()))
	case nodes.UnwatchList:
		c.unwatch(nodes.NewList(action, nil, nil))
	case nodes.WatchInfo:
		c.watch(nodes.NewInfo(action, c.client, c.queryOptions()))
	case nodes.UnwatchInfo:
		c.unwatch(nodes.NewInfo(action, nil, nil))
	case nodes.FetchInfo:
		c.once(nodes.NewInfo(action, c.client, c.queryOptions()))
	case nodes.Drain:
		c.once(nodes.NewDrain(action, c.client))
	case nodes.Remove:
		c.once(nodes.NewRemove(action, c.client))
	case nodes.FetchClientStats:
		c.once(nodes.NewStats(action, c.client))
	case nodes.WatchStats:
		c.watch(nodes.NewStats(action, c.client))
	case nodes.UnwatchStats:
		c.unwatch(nodes.NewStats(action, nil))

	//
	// Members
	//
	case members.WatchList:
		c.stream(members.NewList(action, c.cfg, c.client))
	case members.UnwatchList:
		c.unwatch(members.NewList(action, c.cfg, nil))
	case members.WatchInfo:
		c.watch(members.NewInfo(action, c.cfg, c.client))
	case members.UnwatchInfo:
		c.unwatch(members.NewInfo(action, c.cfg, nil))
	case members.FetchInfo:
		c.once(members.NewInfo(action, c.cfg, c.client))

	//
	// Evaluations
	//
	case evaluations.WatchList:
		c.watch(evaluations.NewList(action, c.client, c.queryOptions()))
	case evaluations.UnwatchList:
		c.unwatch(evaluations.NewList(action, nil, nil))
	case evaluations.WatchInfo:
		c.watch(evaluations.NewInfo(action, c.client, c.queryOptions()))
	case evaluations.UnwatchInfo:
		c.unwatch(evaluations.NewInfo(action, nil, nil))

	//
	// Cluster
	//
	case cluster.EvaluateAllJobs:
		c.once(cluster.NewEvaluateAllJobs(action, c.client))
	case cluster.ReconsileSummaries:
		c.once(cluster.NewReconsileSummaries(action, c.client))
	case cluster.ForceGC:
		c.once(cluster.NewForceGC(action, c.client))
	case cluster.WatchStats:
		c.stream(cluster.NewStats(action, c.client))
	case cluster.UnwatchStats:
		c.unwatch(cluster.NewStats(action, c.client))

	case fetchNomadRegions:
		// go c.fetchRegions()

	// Nice in debug
	default:
		c.logger.Errorf("Unknown action: %s", action.Type)
	}
}

func (c *Connection) queryOptions() *api.QueryOptions {
	return helper.DefaultQuery(c.cfg.NomadAllowStale)
}

func (c *Connection) watch(w subscriber.Watcher) {
	if c.cfg.NomadReadOnly && w.IsMutable() {
		c.readOnlyError(w.Key())
		return
	}

	go subscriber.Watch(w, c.subscriptions, c.logger, c.sendCh, c.destroyCh)
}

func (c *Connection) unwatch(w subscriber.Keyer) {
	go subscriber.Unwatch(w, c.subscriptions, c.logger)
}

func (c *Connection) once(w subscriber.Watcher) {
	if c.cfg.NomadReadOnly && w.IsMutable() {
		c.readOnlyError(w.Key())
		return
	}
	go subscriber.Once(w, c.subscriptions, c.logger, c.sendCh, c.destroyCh)
}

func (c *Connection) stream(s subscriber.Streamer) {
	if c.cfg.NomadReadOnly && s.IsMutable() {
		c.readOnlyError(s.Key())
		return
	}

	go subscriber.Stream(s, c.subscriptions, c.logger, c.sendCh, c.destroyCh)
}

func (c *Connection) readOnlyError(key string) {
	msg := fmt.Sprintf("Can not execute %s: hashi-ui is in read-only mode", key)
	c.logger.Error(msg)

	c.sendCh <- &structs.Action{
		Type:    structs.ErrorNotification,
		Payload: msg,
	}
}

func (c *Connection) subscriptionPublisher() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.destroyCh:
			return

		case <-ticker.C:
			c.logger.Infof("WaitGroups: %d | Subscriptions: %s", c.subscriptions.Count(), strings.Join(c.subscriptions.Subscriptions(), ", "))
		}
	}
}

func (c *Connection) keepAlive() {
	c.logger.Debugf("Starting keep-alive packer sender")
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	c.subscriptions.Subscribe("/internal/keep-alive")
	defer c.subscriptions.Unsubscribe("/internal/keep-alive")

	for {
		select {
		case <-c.destroyCh:
			return

		case <-ticker.C:
			c.logger.Debugf("Sending keep-alive packet")
			c.sendCh <- &structs.Action{Type: structs.KeepAlive, Payload: "hello-world", Index: 0}
		}
	}
}
