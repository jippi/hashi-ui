package consul

import (
	"time"

	api "github.com/hashicorp/consul/api"
	observer "github.com/imkira/go-observer"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	waitTime = 1 * time.Minute
)

// RegionChannels ...
type RegionChannels map[string]*RegionBroadcastChannels

// RegionClients ...
type RegionClients map[string]*Region

// Service ...
type Service struct {
	Name  string
	Nodes []string
	Tags  []string
}

// Services ...
type Services map[string]*Service

// RegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type RegionBroadcastChannels struct {
	services observer.Property
	nodes    observer.Property
}

// Region keeps track of the Region state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the Region server.
type Region struct {
	Config            *config.Config
	Client            *api.Client
	broadcastChannels *RegionBroadcastChannels
	regions           []string
	services          *InternalServices
	nodes             *InternalNodes
}

// InternalService ...
type InternalService struct {
	Name           string
	Nodes          []string
	ChecksPassing  int64
	ChecksWarning  int64
	ChecksCritical int64
}

// InternalServices ...
type InternalServices []*InternalService

// InternalNode ...
type InternalNode struct {
	Node            string
	Address         string
	TaggedAddresses map[string]string
	Services        []*api.AgentService
	Checks          []*api.AgentCheck
}

// InternalNodes ...
type InternalNodes []*InternalNode

// CreateRegionClient ...
func CreateRegionClient(c *config.Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.ConsulAddress
	config.WaitTime = waitTime
	config.Datacenter = region
	config.Token = c.ConsulACLToken

	return api.NewClient(config)
}

// NewRegion configures the Consul API client and initializes the internal state.
func NewRegion(c *config.Config, client *api.Client, channels *RegionBroadcastChannels) (*Region, error) {
	return &Region{
		Config:            c,
		Client:            client,
		broadcastChannels: channels,
		regions:           make([]string, 0),
		services:          &InternalServices{},
		nodes:             &InternalNodes{},
	}, nil
}

// StartWatchers derp
func (c *Region) StartWatchers() {
	go c.watchServices()
	go c.watchNodes()
}

// watchServices ...
func (c *Region) watchServices() {
	q := &api.QueryOptions{WaitIndex: 0}
	q.Token = c.Config.ConsulACLToken

	raw := c.Client.Raw()

	for {
		var services InternalServices

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

		c.broadcastChannels.services.Update(&structs.Action{Type: fetchedConsulServices, Payload: services, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}

// watchNodes ...
func (c *Region) watchNodes() {
	q := &api.QueryOptions{WaitIndex: 0}
	q.Token = c.Config.ConsulACLToken

	raw := c.Client.Raw()

	for {
		var nodes InternalNodes

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

		c.broadcastChannels.nodes.Update(&structs.Action{Type: fetchedConsulNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
