package main

import (
	"time"

	api "github.com/hashicorp/consul/api"
	observer "github.com/imkira/go-observer"
)

// ConsulRegionChannels ...
type ConsulRegionChannels map[string]*ConsulRegionBroadcastChannels

// ConsulRegionClients ...
type ConsulRegionClients map[string]*ConsulRegion

// ConsulService ...
type ConsulService struct {
	Name  string
	Nodes []string
	Tags  []string
}

// ConsulServices ...
type ConsulServices map[string]*ConsulService

// ConsulRegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type ConsulRegionBroadcastChannels struct {
	services observer.Property
	nodes    observer.Property
}

// ConsulRegion keeps track of the ConsulRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the ConsulRegion server.
type ConsulRegion struct {
	Config            *Config
	Client            *api.Client
	broadcastChannels *ConsulRegionBroadcastChannels
	regions           []string
	services          *ConsulInternalServices
	nodes             *ConsulInternalNodes
}

// ConsulInternalService ...
type ConsulInternalService struct {
	Name           string
	Nodes          []string
	ChecksPassing  int64
	ChecksWarning  int64
	ChecksCritical int64
}

// ConsulInternalServices ...
type ConsulInternalServices []*ConsulInternalService

// ConsulInternalNode ...
type ConsulInternalNode struct {
	Node            string
	Address         string
	TaggedAddresses map[string]string
	Services        []*api.AgentService
	Checks          []*api.AgentCheck
}

// ConsulInternalNodes ...
type ConsulInternalNodes []*ConsulInternalNode

// CreateConsulRegionClient ...
func CreateConsulRegionClient(c *Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.ConsulAddress
	config.WaitTime = waitTime
	config.Datacenter = region
	config.Token = c.ConsulACLToken

	return api.NewClient(config)
}

// NewConsulRegion configures the Consul API client and initializes the internal state.
func NewConsulRegion(c *Config, client *api.Client, channels *ConsulRegionBroadcastChannels) (*ConsulRegion, error) {
	return &ConsulRegion{
		Config:            c,
		Client:            client,
		broadcastChannels: channels,
		regions:           make([]string, 0),
		services:          &ConsulInternalServices{},
		nodes:             &ConsulInternalNodes{},
	}, nil
}

// StartWatchers derp
func (c *ConsulRegion) StartWatchers() {
	go c.watchServices()
	go c.watchNodes()
}

// watchServices ...
func (c *ConsulRegion) watchServices() {
	q := &api.QueryOptions{WaitIndex: 0}
	q.Token = c.Config.ConsulACLToken

	raw := c.Client.Raw()

	for {
		var services ConsulInternalServices

		meta, err := raw.Query("/v1/internal/ui/services", &services, q)
		if err != nil {
			logger.Errorf("watch: unable to fetch services: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Services index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Services index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		c.services = &services

		c.broadcastChannels.services.Update(&Action{Type: fetchedConsulServices, Payload: services, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}

// watchNodes ...
func (c *ConsulRegion) watchNodes() {
	q := &api.QueryOptions{WaitIndex: 0}
	q.Token = c.Config.ConsulACLToken

	raw := c.Client.Raw()

	for {
		var nodes ConsulInternalNodes

		meta, err := raw.Query("/v1/internal/ui/nodes", &nodes, q)
		if err != nil {
			logger.Errorf("watch: unable to fetch nodes: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Nodes index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Nodes index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		c.nodes = &nodes

		c.broadcastChannels.nodes.Update(&Action{Type: fetchedConsulNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
