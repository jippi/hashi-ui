package nomad

import (
	"github.com/hashicorp/nomad/api"
	observer "github.com/imkira/go-observer"
)

// Cluster derp
type Cluster struct {
	ClusterClient *api.Client
	RegionClients *RegionClients
	members       []*AgentMemberWithID
}

// ClusterBroadcastChannels ...
type ClusterBroadcastChannels struct {
	members observer.Property
}

// NewCluster ...
func NewCluster(clusterClient *api.Client, clients *RegionClients) *Cluster {
	return &Cluster{
		ClusterClient: clusterClient,
		RegionClients: clients,
	}
}
