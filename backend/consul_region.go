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
}

// ConsulRegion keeps track of the ConsulRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the ConsulRegion server.
type ConsulRegion struct {
	Client            *api.Client
	broadcastChannels *ConsulRegionBroadcastChannels
	regions           []string
	services          *ConsulInternalServices
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

// CreateConsulRegionClient ...
func CreateConsulRegionClient(c *Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.ConsulAddress
	config.WaitTime = waitTime
	// config.Datacenter = region
	// config.TLSConfig = &api.TLSConfig{
	// 	CACert:     c.CACert,
	// 	ClientCert: c.ClientCert,
	// 	ClientKey:  c.ClientKey,
	// }

	return api.NewClient(config)
}

// NewConsulRegion configures the Consul API client and initializes the internal state.
func NewConsulRegion(c *Config, client *api.Client, channels *ConsulRegionBroadcastChannels) (*ConsulRegion, error) {
	return &ConsulRegion{
		Client:            client,
		broadcastChannels: channels,
		regions:           make([]string, 0),
		services:          &ConsulInternalServices{},
	}, nil
}

// StartWatchers derp
func (c *ConsulRegion) StartWatchers() {
	go c.watchServices()
}

// watchServices ...
func (c *ConsulRegion) watchServices() {
	q := &api.QueryOptions{WaitIndex: 0}
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

		// don't refresh data more frequent than every 5s, since busy clusters update every second or faster
		time.Sleep(5 * time.Second)
	}
}
