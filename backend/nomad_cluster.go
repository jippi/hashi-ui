package main

import (
	"github.com/hashicorp/nomad/api"
	observer "github.com/imkira/go-observer"
)

// NomadCluster derp
type NomadCluster struct {
	ClusterClient  *api.Client
	RegionChannels *NomadRegionChannels
	RegionClients  *NomadRegionClients
	members        []*AgentMemberWithID
}

// NomadClusterChannels ...
type NomadClusterChannels map[string]*NomadClusterBroadcastChannels

// NomadClusterBroadcastChannels ...
type NomadClusterBroadcastChannels struct {
	members observer.Property
}

// NewNomadCluster ...
func NewNomadCluster(clusterClient *api.Client, clients *NomadRegionClients, channels *NomadRegionChannels) *NomadCluster {
	return &NomadCluster{
		ClusterClient:  clusterClient,
		RegionClients:  clients,
		RegionChannels: channels,
	}
}

// StartWatchers ...
func (c *NomadCluster) StartWatchers() {
	go c.watchMembers()
}
