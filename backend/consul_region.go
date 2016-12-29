package main

import "github.com/hashicorp/consul/api"

// ConsulRegionChannels ...
type ConsulRegionChannels map[string]*ConsulRegionBroadcastChannels

// ConsulRegionClients ...
type ConsulRegionClients map[string]*ConsulRegion

// ConsulRegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type ConsulRegionBroadcastChannels struct {
}

// ConsulRegion keeps track of the ConsulRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the ConsulRegion server.
type ConsulRegion struct {
	Client            *api.Client
	broadcastChannels *ConsulRegionBroadcastChannels
	regions           []string
}

// CreateConsulRegionClient derp
func CreateConsulRegionClient(c *Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.ConsulAddress
	config.WaitTime = waitTime
	config.Datacenter = region
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
	}, nil
}

// StartWatchers derp
func (n *ConsulRegion) StartWatchers() {

}
