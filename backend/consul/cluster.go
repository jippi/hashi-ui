package consul

import (
	"github.com/hashicorp/consul/api"
	observer "github.com/imkira/go-observer"
)

// Cluster derp
type Cluster struct {
	ClusterClient  *api.Client
	RegionChannels *RegionChannels
	RegionClients  *RegionClients
}

// ClusterBroadcastChannels ...
type ClusterBroadcastChannels struct {
	members observer.Property
}

// NewCluster ...
func NewCluster(clusterClient *api.Client, clients *RegionClients, channels *RegionChannels) *Cluster {
	return &Cluster{
		ClusterClient:  clusterClient,
		RegionClients:  clients,
		RegionChannels: channels,
	}
}

// StartWatchers ...
func (c *Cluster) StartWatchers() {

}
