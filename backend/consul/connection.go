package consul

import (
	"fmt"
	"net"
	"time"

	"github.com/gorilla/websocket"
	api "github.com/hashicorp/consul/api"
	observer "github.com/imkira/go-observer"
	"github.com/jippi/hashi-ui/backend/structs"
	"github.com/jippi/hashi-ui/backend/subscriber"
	uuid "github.com/satori/go.uuid"
	"sync"
)

// Connection monitors the websocket connection. It processes any action
// received on the websocket and sends out actions on Consul state changes. It
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
func NewConnection(hub *Hub, socket *websocket.Conn, consulRegion *Region, channels *RegionBroadcastChannels) *Connection {
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
		region:            consulRegion,
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
	logger.Debugf("Starting keep-alive packer sender")
	ticker := time.NewTicker(10 * time.Second)
	defer func() {
		ticker.Stop()
		c.socket.Close()
	}()

	for {
		select {
		case action, ok := <-c.send:
			if !ok {
				// Exiting...
				if err := c.socket.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
					c.Errorf("Could not write close message to websocket: %s", err)
				}
				return
			}

			if err := c.socket.WriteJSON(action); err != nil {
				c.Errorf("Could not write action to websocket: %s", err)
			}

		case <-ticker.C:
			logger.Debugf("Sending keep-alive packet")
			c.socket.WriteMessage(websocket.PingMessage, []byte("keepalive"))
		}
	}
}

func (c *Connection) readPump() {
	// Register this connection with the hub for broadcast updates
	c.hub.register <- c

	var waitg sync.WaitGroup
	var action structs.Action

	for {
		if err := c.socket.ReadJSON(&action); err != nil {
			break
		}

		// Unwatch events are processed synchronously
		unwatchProcessed := c.processUnwatch(action)
		if !unwatchProcessed {
			// Watch events are processed asynchronously
			go func() {
				defer waitg.Done()
				waitg.Add(1)
				watchProcessed := c.processWatch(action)
				if !watchProcessed {
					logger.Warningf("Unknown action: %s", action.Type)
				}
			}()
		}
	}

	c.Debugf("Connection closing down")

	// Kill any remaining watcher routines
	close(c.destroyCh)

	// This ensure all processing is done and the 'send' channel can be closed safely
	waitg.Wait()
	c.watches.Clear()

	// Unregister this connection and close the 'send' channel (causing writePump to exit)
	c.hub.unregister <- c
}

func (c *Connection) processUnwatch(action structs.Action) bool {
	c.Debugf("Processing unwatch event %s (index %d)", action.Type, action.Index)

	switch action.Type {

	//
	// Consul services
	//
	case unwatchConsulServices:
		c.unwatchGenericBroadcast("services")

		//
		// Consul service (single)
		//
	case unwatchConsulService:
		c.watches.Unsubscribe(action.Payload.(string))

		//
		// Consul nodes
		//
	case unwatchConsulNodes:
		c.unwatchGenericBroadcast("nodes")

		//
		// Consul node (single)
		//
	case unwatchConsulNode:
		c.watches.Unsubscribe("consul/node/" + action.Payload.(string))

		//
		// KV path
		//
	case unwatchConsulKVPath:
		c.watches.Unsubscribe("consul/kv/path?" + action.Payload.(string))

		//
		// No match
		//
	default:
		return false
	}

	return true
}

func (c *Connection) processWatch(action structs.Action) bool {
	c.Debugf("Processing watch event %s (index %d)", action.Type, action.Index)

	switch action.Type {

	//
	// Consul regions
	//
	case fetchConsulRegions:
		c.fetchRegions()

	//
	// Consul services
	//
	case watchConsulServices:
		c.watchGenericBroadcast("services", fetchedConsulServices, c.region.broadcastChannels.services, c.region.services)

	//
	// Consul service (single)
	//
	case watchConsulService:
		c.watchConsulService(action)
	case dereigsterConsulService:
		c.dereigsterConsulService(action)
	case dereigsterConsulServiceCheck:
		c.dereigsterConsulServiceCheck(action)

	//
	// Consul nodes
	//
	case watchConsulNodes:
		c.watchGenericBroadcast("nodes", fetchedConsulNodes, c.region.broadcastChannels.nodes, c.region.nodes)

	//
	// Consul node (single)
	//
	case watchConsulNode:
		c.watchConsulNode(action)

	//
	// KV path
	//
	case watchConsulKVPath:
		c.watchConsulKVPath(action)
	case setConsulKVPair:
		c.writeConsulKV(action)
	case deleteConsulKvFolder:
		c.deleteConsulKV(action)
	case getConsulKVPair:
		c.getConsulKVPair(action)
	case deleteConsulKvPair:
		c.deleteConsulKvPair(action)

	//
	// No match
	//
	default:
		return false
	}

	return true
}

// Handle monitors the websocket connection for incoming actions. It sends
// out actions on state changes.
func (c *Connection) Handle() {
	go c.writePump()
	c.readPump()
}

func (c *Connection) fetchRegions() {
	c.send <- &structs.Action{Type: fetchedConsulRegions, Payload: c.hub.regions}
}

func (c *Connection) watchGenericBroadcast(watchKey string, actionEvent string, prop observer.Property, initialPayload interface{}) {
	if c.watches.Subscribed(watchKey) {
		c.Warningf("Connection is already subscribed to %s", actionEvent)
		return
	}

	defer func() {
		c.watches.Unsubscribe(watchKey)
		c.Infof("Stopped watching %s", watchKey)

		// recovering from panic caused by writing to a closed channel
		if r := recover(); r != nil {
			c.Warningf("Recover from panic: %s", r)
		}
	}()

	subscribeCh := c.watches.Subscribe(watchKey)

	c.Debugf("Sending our current %s list", watchKey)
	c.send <- &structs.Action{Type: actionEvent, Payload: initialPayload, Index: 0}

	stream := prop.Observe()

	c.Debugf("Started watching %s", watchKey)
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
	c.Debugf("Removing subscription for %s", watchKey)
	c.watches.Unsubscribe(watchKey)
}

func (c *Connection) watchConsulService(action structs.Action) {
	serviceID := action.Payload.(string)

	if c.watches.Subscribed(serviceID) {
		c.Warningf("Connection is already subscribed to service %s", serviceID)
		return
	}

	defer func() {
		c.watches.Unsubscribe(serviceID)
		c.Infof("Stopped watching service with id: %s", serviceID)
	}()
	subscribeCh := c.watches.Subscribe(serviceID)

	c.Infof("Started watching service with id: %s", serviceID)

	q := &api.QueryOptions{WaitIndex: 1}
	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			service, meta, err := c.region.Client.Health().Service(serviceID, "", false, q)
			if !c.watches.Subscribed(serviceID) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch consul service info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex > localWaitIndex {
				c.send <- &structs.Action{Type: fetchedConsulService, Payload: service, Index: remoteWaitIndex}
				q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: 120 * time.Second}

				// don't refresh data more frequent than every 5s, since busy clusters update every second or faster
				time.Sleep(5 * time.Second)
			}
		}
	}
}

func (c *Connection) watchConsulNode(action structs.Action) {
	nodeID := action.Payload.(string)
	key := "consul/node/" + nodeID

	if c.watches.Subscribed(key) {
		c.Warningf("Connection is already subscribed to %s", key)
		return
	}

	defer func() {
		c.watches.Unsubscribe(key)
		c.Infof("Stopped watching %s", key)
	}()
	subscribeCh := c.watches.Subscribe(key)

	c.Infof("Started watching %s", key)

	raw := c.region.Client.Raw()
	q := &api.QueryOptions{WaitIndex: 0}

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			var node InternalNode

			meta, err := raw.Query(fmt.Sprintf("/v1/internal/ui/node/%s", nodeID), &node, q)
			if !c.watches.Subscribed(key) {
				c.Warningf("Connection is not subscribed to %s", key)
				return
			}

			if err != nil {
				logger.Errorf("watch: unable to fetch node/%s: %s", nodeID, err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only work if the WaitIndex have changed
			if remoteWaitIndex == localWaitIndex {
				logger.Debugf("Node/%s index is unchanged (%d == %d)", nodeID, localWaitIndex, remoteWaitIndex)
				continue
			}

			logger.Debugf("Node/%s index is changed (%d <> %d)", nodeID, localWaitIndex, remoteWaitIndex)

			c.send <- &structs.Action{Type: fetchedConsulNode, Payload: node, Index: remoteWaitIndex}
			q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
		}
	}
}

func (c *Connection) watchConsulKVPath(action structs.Action) {
	path := action.Payload.(string)
	key := "consul/kv/path?" + path

	if c.watches.Subscribed(key) {
		c.Warningf("Connection is already subscribed to %s", key)
		return
	}

	defer func() {
		c.watches.Unsubscribe(key)
		c.Infof("Stopped watching %s", key)
	}()
	subscribeCh := c.watches.Subscribe(key)

	c.Infof("Started watching %s", key)

	q := &api.QueryOptions{WaitIndex: 1}

	for {
		select {
		case <-subscribeCh:
			return

		case <-c.destroyCh:
			return

		default:
			keys, meta, err := c.region.Client.KV().Keys(path, "/", q)
			if !c.watches.Subscribed(key) {
				return
			}

			if err != nil {
				c.Errorf("connection: unable to fetch consul node info: %s", err)
				time.Sleep(10 * time.Second)
				continue
			}

			remoteWaitIndex := meta.LastIndex
			localWaitIndex := q.WaitIndex

			// only broadcast if the LastIndex has changed
			if remoteWaitIndex == localWaitIndex {
				time.Sleep(5 * time.Second)
				continue
			}

			c.send <- &structs.Action{Type: fetchedConsulKVPath, Payload: keys, Index: remoteWaitIndex}
			q = &api.QueryOptions{WaitIndex: remoteWaitIndex, WaitTime: 120 * time.Second}
		}
	}
}

func (c *Connection) writeConsulKV(action structs.Action) {
	if c.region.Config.ConsulReadOnly {
		logger.Warningf("Unable to write Consul KV: ConsulReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to write Consul KV - the Consul backend is set to read-only"}
		return
	}

	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}

	key := params["path"].(string)
	value := params["value"].(string)
	index := uint64(0)

	if val, ok := params["index"]; ok {
		index = uint64(val.(float64))
	}

	keyPair := &api.KVPair{Key: key, Value: []byte(value), ModifyIndex: index}

	res, _, err := c.region.Client.KV().CAS(keyPair, &api.WriteOptions{})
	if err != nil {
		logger.Errorf("connection: unable to write consul kv '%s': %s", key, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to write key %s: %s", key, err)}
		return
	}

	if !res {
		logger.Errorf("connection: unable to write consul kv '%s': %s", key, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to write key %s: maybe the key was modified since you loaded it?", key)}
		return
	}

	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: fmt.Sprintf("The key was successfully written: %s.", key)}

	if key[len(key)-1:] != "/" {
		// refresh data post-save
		c.getConsulKVPair(structs.Action{Payload: key})
	}
}

func (c *Connection) deleteConsulKV(action structs.Action) {
	if c.region.Config.ConsulReadOnly {
		logger.Warningf("Unable to delete Consul KV: ConsulReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to delete Consul KV - the Consul backend is set to read-only"}
		return
	}

	key := action.Payload.(string)

	_, err := c.region.Client.KV().DeleteTree(key, &api.WriteOptions{})
	if err != nil {
		logger.Errorf("connection: unable to delete consul kv '%s': %s", key, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to write key : %s", key)}
		return
	}

	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: fmt.Sprintf("The key was successfully deleted: %s.", key)}
}

func (c *Connection) getConsulKVPair(action structs.Action) {
	key := action.Payload.(string)

	pair, _, err := c.region.Client.KV().Get(key, &api.QueryOptions{})
	if err != nil {
		logger.Errorf("connection: unable to get consul kv '%s': %s", key, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to read key : %s", key)}
		return
	}

	if pair == nil {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to read key : %s", key)}
		return
	}

	c.send <- &structs.Action{Type: fetchedConsulKVPair, Payload: pair, Index: pair.ModifyIndex}
}

func (c *Connection) deleteConsulKvPair(action structs.Action) {
	if c.region.Config.ConsulReadOnly {
		logger.Warningf("Unable to delete Consul KV: ConsulReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to delete Consul KV - the Consul backend is set to read-only"}
		return
	}

	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}

	key := params["path"].(string)
	index := uint64(0)

	if val, ok := params["index"]; ok {
		index = uint64(val.(float64))
	}

	keyPair := &api.KVPair{Key: key, ModifyIndex: index}

	success, _, err := c.region.Client.KV().DeleteCAS(keyPair, &api.WriteOptions{})
	if err != nil {
		logger.Errorf("connection: unable to get consul kv '%s': %s", key, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to delete key %s: %s", key, err)}
		return
	}

	if !success {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to delete key %s", key)}
		return
	}

	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: fmt.Sprintf("Successfully deleted %s", key)}
	c.send <- &structs.Action{Type: clearConsulKvPair}
}

func (c *Connection) dereigsterConsulService(action structs.Action) {
	if c.region.Config.ConsulReadOnly {
		logger.Warningf("Unable to deregister Consul Service: ConsulReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to deresiger Consul Service - the Consul backend is set to read-only"}
		return
	}

	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.Errorf("Could not decode payload")
		return
	}

	nodeAddress := params["nodeAddress"].(string)
	serviceID := params["serviceID"].(string)

	_, port, _ := net.SplitHostPort(c.region.Config.ConsulAddress)
	if port == "" {
		port = "80"
	}

	config := api.DefaultConfig()
	config.Address = nodeAddress + ":" + port
	config.Token = c.region.Config.ConsulACLToken

	client, err := api.NewClient(config)
	if err != nil {
		logger.Errorf("connection: unable to create consul client : %s", err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to create Consul client : %s", err)}
		return
	}

	err = client.Agent().ServiceDeregister(serviceID)
	if err != nil {
		logger.Errorf("connection: unable to deregister consul service '%s': %s", serviceID, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to deregister service : %s", err)}
		return
	}

	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "The service has been successfully deregistered."}
}

func (c *Connection) dereigsterConsulServiceCheck(action structs.Action) {
	if c.region.Config.ConsulReadOnly {
		logger.Warningf("Unable to deregister Consul Service Check: ConsulReadOnly is set to true")
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to deresiger Consul Service Check - the Consul backend is set to read-only"}
		return
	}

	params, ok := action.Payload.(map[string]interface{})
	if !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to deresiger Consul Service Check - missing node address"}
		c.Errorf("Could not decode payload")
		return
	}

	nodeAddress, ok := params["nodeAddress"].(string)
	if !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to deresiger Consul Service Check - missing node address"}
		c.Errorf("Missing node address")
		return
	}

	checkID, ok := params["checkID"].(string)
	if !ok {
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: "Unable to deresiger Consul Service Check - missing check id"}
		c.Errorf("Missing check id")
		return
	}

	_, port, _ := net.SplitHostPort(c.region.Config.ConsulAddress)
	if port == "" {
		port = "80"
	}

	config := api.DefaultConfig()
	config.Address = nodeAddress + ":" + port
	config.Token = c.region.Config.ConsulACLToken

	client, err := api.NewClient(config)
	if err != nil {
		logger.Errorf("connection: unable to create consul client : %s", err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to create Consul client : %s", err)}
		return
	}

	err = client.Agent().CheckDeregister(checkID)
	if err != nil {
		logger.Errorf("connection: unable to deregister consul check '%s': %s", checkID, err)
		c.send <- &structs.Action{Type: structs.ErrorNotification, Payload: fmt.Sprintf("Unable to deregister check : %s", err)}
		return
	}

	logger.Infof("dereigsterConsulServiceCheck: %s / %s", nodeAddress, checkID)
	c.send <- &structs.Action{Type: structs.SuccessNotification, Payload: "The check has been successfully deregistered."}
}
