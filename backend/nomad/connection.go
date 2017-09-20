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

	c.logger.Infof("Done, closing send channel")
	close(c.sendCh)
}

func (c *Connection) writePump() {
	defer c.socket.Close()

	for {
		select {

		case <-c.destroyCh:
			c.logger.Warningf("Stopping writePump")
			return

		case action, ok := <-c.sendCh:
			c.ensureIndex(action)

			if !ok {
				if err := c.socket.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
					c.logger.Errorf("Could not write close message to websocket: %s", err)
				}
				return
			}

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
		c.watch(deployments.NewList(action))
	case deployments.UnwatchList:
		c.unwatch(deployments.NewList(action))
	case deployments.WatchInfo:
		c.watch(deployments.NewInfo(action))
	case deployments.UnwatchInfo:
		c.unwatch(deployments.NewInfo(action))
	case deployments.WatchAllocations:
		c.watch(deployments.NewAllocations(action))
	case deployments.UnwatchAllocations:
		c.unwatch(deployments.NewAllocations(action))
	case deployments.ChangeStatus:
		c.once(deployments.NewCHangeStatus(action))

	//
	// Jobs
	//
	case jobs.WatchList:
		fallthrough // same as filtered
	case jobs.WatchListFiltered:
		c.watch(jobs.NewList(action))
	case jobs.UnwatchListFiltered:
		fallthrough // same as filtered
	case jobs.UnwatchList:
		c.unwatch(jobs.NewList(action))
	case jobs.WatchInfo:
		c.watch(jobs.NewInfo(action))
	case jobs.UnwatchInfo:
		c.unwatch(jobs.NewInfo(action))
	case jobs.WatchVersions:
		c.watch(jobs.NewVersions(action))
	case jobs.UnwatchVersions:
		c.unwatch(jobs.NewVersions(action))
	case jobs.WatchDeployments:
		c.watch(jobs.NewDeployments(action))
	case jobs.UnwatchDeployments:
		c.unwatch(jobs.NewDeployments(action))
	case jobs.Scale:
		c.once(jobs.NewScale(action))
	case jobs.ForceEvaluate:
		c.once(jobs.NewForceEvaluate(action))
	case jobs.WatchAllocations:
		c.watch(jobs.NewAllocations(action))
	case jobs.UnwatchAllocations:
		c.unwatch(jobs.NewAllocations(action))
	case jobs.Stop:
		c.once(jobs.NewStop(action))
	case jobs.PeriodicForce:
		c.once(jobs.NewPeriodicForce(action))
	case jobs.Submit:
		c.once(jobs.NewSubmit(action, c.cfg))

	//
	// Allocations
	//
	case allocations.WatchList:
		c.watch(allocations.NewList(action, false))
	case allocations.WatchListShallow:
		c.watch(allocations.NewList(action, true))
	case allocations.UnwatchList:
		c.unwatch(allocations.NewList(action, false))
	case allocations.UnwatchListShallow:
		c.unwatch(allocations.NewList(action, true))
	case allocations.WatchInfo:
		c.watch(allocations.NewInfo(action))
	case allocations.UnwatchInfo:
		c.unwatch(allocations.NewInfo(action))
	case allocations.WatchFile:
		c.stream(allocations.NewFile(action))
	case allocations.UnwatchFile:
		c.unwatch(allocations.NewFile(action))
	case allocations.FetchDir:
		c.once(allocations.NewDir(action))

	//
	// Nodes
	//
	case nodes.WatchList:
		c.watch(nodes.NewList(action))
	case nodes.UnwatchList:
		c.unwatch(nodes.NewList(action))
	case nodes.WatchInfo:
		c.watch(nodes.NewInfo(action))
	case nodes.UnwatchInfo:
		c.unwatch(nodes.NewInfo(action))
	case nodes.FetchInfo:
		c.once(nodes.NewInfo(action))
	case nodes.Drain:
		c.once(nodes.NewDrain(action))
	case nodes.Remove:
		c.once(nodes.NewRemove(action))
	case nodes.FetchClientStats:
		c.once(nodes.NewStats(action))
	case nodes.WatchStats:
		c.watch(nodes.NewStats(action))
	case nodes.UnwatchStats:
		c.unwatch(nodes.NewStats(action))

	//
	// Members
	//
	case members.WatchList:
		c.stream(members.NewList(action, c.cfg))
	case members.UnwatchList:
		c.unwatch(members.NewList(action, c.cfg))
	case members.WatchInfo:
		c.watch(members.NewInfo(action, c.cfg))
	case members.UnwatchInfo:
		c.unwatch(members.NewInfo(action, c.cfg))
	case members.FetchInfo:
		c.once(members.NewInfo(action, c.cfg))

	//
	// Evaluations
	//
	case evaluations.WatchList:
		c.watch(evaluations.NewList(action))
	case evaluations.UnwatchList:
		c.unwatch(evaluations.NewList(action))
	case evaluations.WatchInfo:
		c.watch(evaluations.NewInfo(action))
	case evaluations.UnwatchInfo:
		c.unwatch(evaluations.NewInfo(action))

	//
	// Cluster
	//
	case cluster.EvaluateAllJobs:
		c.once(cluster.NewEvaluateAllJobs(action))
	case cluster.ReconsileSummaries:
		c.once(cluster.NewReconsileSummaries(action))
	case cluster.ForceGC:
		c.once(cluster.NewForceGC(action))
	case cluster.WatchStats:
		c.stream(cluster.NewStats(action))
	case cluster.UnwatchStats:
		c.unwatch(cluster.NewStats(action))

	case fetchNomadRegions:
		// go c.fetchRegions()

	// Nice in debug
	default:
		c.logger.Errorf("Unknown action: %s", action.Type)
	}
}

func (c *Connection) watch(w Watcher) {
	if c.cfg.NomadReadOnly && w.IsMutable() {
		c.readOnlyError(w.Key())
		return
	}

	go Watch(w, c.subscriptions, c.logger, c.client, c.sendCh, c.destroyCh)
}

func (c *Connection) unwatch(w Keyer) {
	go Unwatch(w, c.subscriptions, c.logger)
}

func (c *Connection) once(w Watcher) {
	if c.cfg.NomadReadOnly && w.IsMutable() {
		c.readOnlyError(w.Key())
		return
	}
	go Once(w, c.subscriptions, c.logger, c.client, c.sendCh, c.destroyCh)
}

func (c *Connection) stream(s Streamer) {
	if c.cfg.NomadReadOnly && s.IsMutable() {
		c.readOnlyError(s.Key())
		return
	}

	go Stream(s, c.subscriptions, c.logger, c.client, c.sendCh, c.destroyCh)
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
