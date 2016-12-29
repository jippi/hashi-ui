package main

import (
	"github.com/hashicorp/consul/api"
	observer "github.com/imkira/go-observer"
)

// ConsulCluster derp
type ConsulCluster struct {
	ClusterClient  *api.Client
	RegionChannels *ConsulRegionChannels
	RegionClients  *ConsulRegionClients
	members        []*AgentMemberWithID
}

// ConsulClusterBroadcastChannels ...
type ConsulClusterBroadcastChannels struct {
	members observer.Property
}

// NewConsulCluster ...
func NewConsulCluster(clusterClient *api.Client, clients *ConsulRegionClients, channels *ConsulRegionChannels) *ConsulCluster {
	return &ConsulCluster{
		ClusterClient:  clusterClient,
		RegionClients:  clients,
		RegionChannels: channels,
	}
}

// StartWatchers ...
func (c *ConsulCluster) StartWatchers() {

}
