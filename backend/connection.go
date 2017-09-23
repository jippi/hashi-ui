package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	consul "github.com/hashicorp/consul/api"
	nomad "github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	consul_catalog "github.com/jippi/hashi-ui/backend/consul/catalog"
	consul_helper "github.com/jippi/hashi-ui/backend/consul/helper"
	consul_kv "github.com/jippi/hashi-ui/backend/consul/kv"
	consul_nodes "github.com/jippi/hashi-ui/backend/consul/nodes"
	consul_services "github.com/jippi/hashi-ui/backend/consul/services"
	nomad_allocations "github.com/jippi/hashi-ui/backend/nomad/allocations"
	nomad_cluster "github.com/jippi/hashi-ui/backend/nomad/cluster"
	nomad_deployments "github.com/jippi/hashi-ui/backend/nomad/deployments"
	nomad_evaluations "github.com/jippi/hashi-ui/backend/nomad/evaluations"
	nomad_helper "github.com/jippi/hashi-ui/backend/nomad/helper"
	nomad_jobs "github.com/jippi/hashi-ui/backend/nomad/jobs"
	nomad_members "github.com/jippi/hashi-ui/backend/nomad/members"
	nomad_nodes "github.com/jippi/hashi-ui/backend/nomad/nodes"
	"github.com/jippi/hashi-ui/backend/structs"
	"github.com/jippi/hashi-ui/backend/subscriber"
	uuid "github.com/satori/go.uuid"
	log "github.com/sirupsen/logrus"
)

// used to keep random `Index` in writePump when sending back actions over the wire
// this will ensure that redux will process events as they are unique / different from each other
var random = rand.New(rand.NewSource(time.Now().UnixNano()))

// connection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Nomad state changes. It
// maintains a set to keep track of the running watches.
type connection struct {
	nomadClient   *nomad.Client
	consulClient  *consul.Client
	config        *config.Config
	connectionID  uuid.UUID
	destroyCh     chan struct{}
	logger        *log.Entry
	sendCh        chan *structs.Action
	socket        *websocket.Conn
	subscriptions *subscriber.Manager
}

// NewConnection creates a new connection.
func NewConnection(socket *websocket.Conn, nomadClient *nomad.Client, consulClient *consul.Client, logger *log.Entry, connectionID uuid.UUID, cfg *config.Config) *connection {
	return &connection{
		config:        cfg,
		nomadClient:   nomadClient,
		consulClient:  consulClient,
		destroyCh:     make(chan struct{}),
		connectionID:  connectionID,
		logger:        logger,
		sendCh:        make(chan *structs.Action, 10),
		socket:        socket,
		subscriptions: &subscriber.Manager{},
	}
}

// Handle monitors the websocket connection for incoming actions. It sends
// out actions on state changes.
func (c *connection) Handle() {
	go c.keepAlive()
	go c.writePump()
	go c.subscriptionPublisher()

	c.readPump()

	c.logger.Debugf("Connection closing down")
	c.socket.Close()

	close(c.destroyCh)

	c.logger.Infof("Waiting for subscriptions to finish up")
	c.subscriptions.Wait()
}

// keepAlive will send a NOOP package over the websocket every 10s to ensure
// the connection does not time out through proxies
func (c *connection) keepAlive() {
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

// writePump will send actions to the browser throug the ws to the browser
func (c *connection) writePump() {
	defer c.socket.Close()

	for {
		select {

		case <-c.destroyCh:
			c.logger.Infof("Stopping writePump")
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

			c.ensureActionIndex(action)

			if err := c.socket.WriteJSON(action); err != nil {
				c.logger.Errorf("Could not write action to websocket: %s", err)
				return
			}
		}
	}
}

// subscriptionPublisher will output the connection subscriptions every 10s
func (c *connection) subscriptionPublisher() {
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

// readPump consume messages from the browser, and turns it into actions for the Go server to take
func (c *connection) readPump() {
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

// process will take actions from the browser and run the code for the action
// all actions will be started in a new Go routine, so all these are non-blocking
func (c *connection) process(action structs.Action) {
	c.logger.Debugf("Processing event %s (index %d)", action.Type, action.Index)

	switch action.Type {
	//
	// Consul Services
	//
	case consul_services.WatchList:
		c.watch(consul_services.NewList(action, c.consulClient, c.newConsulQueryOptions()))
	case consul_services.UnwatchList:
		c.unwatch(consul_services.NewList(action, nil, nil))
	case consul_services.WatchInfo:
		c.watch(consul_services.NewInfo(action, c.consulClient, c.newConsulQueryOptions()))
	case consul_services.UnwatchInfo:
		c.unwatch(consul_services.NewInfo(action, nil, nil))
	case consul_services.Dereigster:
		c.once(consul_services.NewDeregister(action, c.config, c.consulClient))
	case consul_services.DeregisterCheck:
		c.once(consul_services.NewDeregisterCheck(action, c.config, c.consulClient))

	//
	// Consul Nodes
	//
	case consul_nodes.WatchList:
		c.watch(consul_nodes.NewList(action, c.consulClient, c.newConsulQueryOptions()))
	case consul_nodes.UnwatchList:
		c.unwatch(consul_nodes.NewList(action, nil, nil))
	case consul_nodes.WatchInfo:
		c.watch(consul_nodes.NewInfo(action, c.consulClient, c.newConsulQueryOptions()))
	case consul_nodes.UnwatchInfo:
		c.unwatch(consul_nodes.NewInfo(action, nil, nil))

	//
	// Consul KV
	//
	case consul_kv.WatchList:
		c.watch(consul_kv.NewList(action, c.consulClient, c.newConsulQueryOptions()))
	case consul_kv.UnwatchList:
		c.unwatch(consul_kv.NewList(action, nil, nil))
	case consul_kv.FetchInfo:
		c.once(consul_kv.NewInfo(action, c.consulClient, c.newConsulQueryOptions()))
	case consul_kv.Set:
		c.once(consul_kv.NewSet(action, c.consulClient))
	case consul_kv.Delete:
		c.once(consul_kv.NewDelete(action, c.consulClient))
	case consul_kv.DeleteTree:
		c.once(consul_kv.NewDeleteTree(action, c.consulClient))

	//
	// Consul Catalog
	//
	case consul_catalog.Datacenters:
		c.once(consul_catalog.NewDatacenters(action, c.consulClient))

	//
	// Nomad Deployments
	//
	case nomad_deployments.WatchList:
		c.watch(nomad_deployments.NewList(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_deployments.UnwatchList:
		c.unwatch(nomad_deployments.NewList(action, nil, nil))
	case nomad_deployments.WatchInfo:
		c.watch(nomad_deployments.NewInfo(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_deployments.UnwatchInfo:
		c.unwatch(nomad_deployments.NewInfo(action, nil, nil))
	case nomad_deployments.WatchAllocations:
		c.watch(nomad_deployments.NewAllocations(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_deployments.UnwatchAllocations:
		c.unwatch(nomad_deployments.NewAllocations(action, nil, nil))
	case nomad_deployments.ChangeStatus:
		c.once(nomad_deployments.NewCHangeStatus(action, c.nomadClient))

	//
	// Nomad Jobs
	//
	case nomad_jobs.WatchList:
		fallthrough // same as filtered
	case nomad_jobs.WatchListFiltered:
		c.watch(nomad_jobs.NewList(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_jobs.UnwatchListFiltered:
		fallthrough // same as filtered
	case nomad_jobs.UnwatchList:
		c.unwatch(nomad_jobs.NewList(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_jobs.WatchInfo:
		c.watch(nomad_jobs.NewInfo(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_jobs.UnwatchInfo:
		c.unwatch(nomad_jobs.NewInfo(action, nil, nil))
	case nomad_jobs.WatchVersions:
		c.watch(nomad_jobs.NewVersions(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_jobs.UnwatchVersions:
		c.unwatch(nomad_jobs.NewVersions(action, nil, nil))
	case nomad_jobs.WatchDeployments:
		c.watch(nomad_jobs.NewDeployments(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_jobs.UnwatchDeployments:
		c.unwatch(nomad_jobs.NewDeployments(action, nil, nil))
	case nomad_jobs.Scale:
		c.once(nomad_jobs.NewScale(action, c.nomadClient))
	case nomad_jobs.ForceEvaluate:
		c.once(nomad_jobs.NewForceEvaluate(action, c.nomadClient))
	case nomad_jobs.WatchAllocations:
		c.watch(nomad_jobs.NewAllocations(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_jobs.UnwatchAllocations:
		c.unwatch(nomad_jobs.NewAllocations(action, nil, nil))
	case nomad_jobs.Stop:
		c.once(nomad_jobs.NewStop(action, c.nomadClient))
	case nomad_jobs.PeriodicForce:
		c.once(nomad_jobs.NewPeriodicForce(action, c.nomadClient))
	case nomad_jobs.Submit:
		c.once(nomad_jobs.NewSubmit(action, c.nomadClient, c.config))

	//
	// Nomad Allocations
	//
	case nomad_allocations.WatchList:
		c.watch(nomad_allocations.NewList(action, false, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_allocations.UnwatchList:
		c.unwatch(nomad_allocations.NewList(action, false, nil, nil))
	case nomad_allocations.WatchListShallow:
		c.watch(nomad_allocations.NewList(action, true, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_allocations.UnwatchListShallow:
		c.unwatch(nomad_allocations.NewList(action, true, nil, nil))
	case nomad_allocations.WatchInfo:
		c.watch(nomad_allocations.NewInfo(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_allocations.UnwatchInfo:
		c.unwatch(nomad_allocations.NewInfo(action, nil, nil))
	case nomad_allocations.WatchFile:
		c.stream(nomad_allocations.NewFile(action, c.nomadClient))
	case nomad_allocations.UnwatchFile:
		c.unwatch(nomad_allocations.NewFile(action, nil))
	case nomad_allocations.FetchDir:
		c.once(nomad_allocations.NewDir(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_allocations.WatchHealth:
		c.watch(nomad_allocations.NewHealth(action, c.nomadClient, c.consulClient, c.newConsulQueryOptions()))
	case nomad_allocations.UnwatchHealth:
		c.unwatch(nomad_allocations.NewHealth(action, nil, nil, nil))

	//
	// Nomad Nodes
	//
	case nomad_nodes.WatchList:
		c.watch(nomad_nodes.NewList(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_nodes.UnwatchList:
		c.unwatch(nomad_nodes.NewList(action, nil, nil))
	case nomad_nodes.WatchInfo:
		c.watch(nomad_nodes.NewInfo(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_nodes.UnwatchInfo:
		c.unwatch(nomad_nodes.NewInfo(action, nil, nil))
	case nomad_nodes.FetchInfo:
		c.once(nomad_nodes.NewInfo(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_nodes.Drain:
		c.once(nomad_nodes.NewDrain(action, c.nomadClient))
	case nomad_nodes.Remove:
		c.once(nomad_nodes.NewRemove(action, c.nomadClient))
	case nomad_nodes.WatchStats:
		c.stream(nomad_nodes.NewStats(action, c.nomadClient))
	case nomad_nodes.UnwatchStats:
		c.unwatch(nomad_nodes.NewStats(action, nil))

	//
	// Nomad Members
	//
	case nomad_members.WatchList:
		c.stream(nomad_members.NewList(action, c.config, c.nomadClient))
	case nomad_members.UnwatchList:
		c.unwatch(nomad_members.NewList(action, c.config, nil))
	case nomad_members.WatchInfo:
		c.watch(nomad_members.NewInfo(action, c.config, c.nomadClient))
	case nomad_members.UnwatchInfo:
		c.unwatch(nomad_members.NewInfo(action, c.config, nil))
	case nomad_members.FetchInfo:
		c.once(nomad_members.NewInfo(action, c.config, c.nomadClient))

	//
	// Nomad Evaluations
	//
	case nomad_evaluations.WatchList:
		c.watch(nomad_evaluations.NewList(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_evaluations.UnwatchList:
		c.unwatch(nomad_evaluations.NewList(action, nil, nil))
	case nomad_evaluations.WatchInfo:
		c.watch(nomad_evaluations.NewInfo(action, c.nomadClient, c.newNomadQueryOptions()))
	case nomad_evaluations.UnwatchInfo:
		c.unwatch(nomad_evaluations.NewInfo(action, nil, nil))

	//
	// Nomad Cluster
	//
	case nomad_cluster.EvaluateAllJobs:
		c.once(nomad_cluster.NewEvaluateAllJobs(action, c.nomadClient))
	case nomad_cluster.ReconsileSummaries:
		c.once(nomad_cluster.NewReconsileSummaries(action, c.nomadClient))
	case nomad_cluster.ForceGC:
		c.once(nomad_cluster.NewForceGC(action, c.nomadClient))
	case nomad_cluster.WatchStats:
		c.stream(nomad_cluster.NewStats(action, c.nomadClient))
	case nomad_cluster.UnwatchStats:
		c.unwatch(nomad_cluster.NewStats(action, c.nomadClient))

	case fetchNomadRegions:
		// go c.fetchRegions()

	default:
		c.logger.Errorf("Unknown action: %s", action.Type)
	}
}

// ensureActionIndex will ensure the `Index` key is set if it wasn't provided by the action handler
func (c *connection) ensureActionIndex(action *structs.Action) {
	if action.Index == 0 {
		action.Index = uint64(random.Int())
	}
}

// newNomadQueryOptions returns a query options struct with the `stale` parameter set based
// on hashi-ui configuration
func (c *connection) newNomadQueryOptions() *nomad.QueryOptions {
	return nomad_helper.DefaultQuery(c.config.NomadAllowStale)
}

// newConsulQueryOptions returns a query options struct with the `stale` parameter set based
// on hashi-ui configuration
func (c *connection) newConsulQueryOptions() *consul.QueryOptions {
	return consul_helper.DefaultQuery(true)
}

// watch will start a subscription watcher in a new Go routine
func (c *connection) watch(w subscriber.Watcher) {
	if c.config.NomadReadOnly && w.IsMutable() {
		c.readOnlyError(w.Key())
		return
	}

	go subscriber.Watch(w, c.subscriptions, c.logger, c.sendCh, c.destroyCh)
}

// once will start a one-off execution of a watcher in a new Go routine
func (c *connection) once(w subscriber.Watcher) {
	if c.config.NomadReadOnly && w.IsMutable() {
		c.readOnlyError(w.Key())
		return
	}

	go subscriber.Once(w, c.subscriptions, c.logger, c.sendCh, c.destroyCh)
}

// stream will start a subscription streamer, delegating all handling to the stream routine
func (c *connection) stream(s subscriber.Streamer) {
	if c.config.NomadReadOnly && s.IsMutable() {
		c.readOnlyError(s.Key())
		return
	}

	go subscriber.Stream(s, c.subscriptions, c.logger, c.sendCh, c.destroyCh)
}

// unwatch will remove a subscription from the channel, and make sure any Go routines running
// for the subscription will be stopped
func (c *connection) unwatch(w subscriber.Keyer) {
	go subscriber.Unwatch(w, c.subscriptions, c.logger)
}

// readOnlyError emits and logs an error when hashi-ui is in read-only mode and an action
// that would mutate state is called
func (c *connection) readOnlyError(key string) {
	msg := fmt.Sprintf("Can not execute %s: hashi-ui is in read-only mode", key)
	c.logger.Error(msg)

	c.sendCh <- &structs.Action{
		Type:    structs.ErrorNotification,
		Payload: msg,
	}
}
