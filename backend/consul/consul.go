package consul

import (
	observer "github.com/imkira/go-observer"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("hashi-ui")

// InitializeConsul ...
func InitializeConsul(cfg *config.Config) (*ConsulHub, bool) {

	consulClient, err := CreateConsulRegionClient(cfg, "")
	if err != nil {
		logger.Errorf("Could not create Consul API Client: %s", err)
		return nil, false
	}

	regions, err := consulClient.Catalog().Datacenters()
	if err != nil {
		logger.Errorf("Could not fetch Consul datacenters from API: %s", err)
		return nil, false
	}

	regionChannels := ConsulRegionChannels{}
	regionClients := ConsulRegionClients{}

	for _, region := range regions {
		logger.Infof("Starting handlers for Consul DC: %s", region)

		channels := &ConsulRegionBroadcastChannels{}
		channels.services = observer.NewProperty(&structs.Action{})
		channels.nodes = observer.NewProperty(&structs.Action{})

		regionChannels[region] = channels

		regionClient, clientErr := CreateConsulRegionClient(cfg, region)
		if clientErr != nil {
			logger.Errorf("  -> Could not create Consul client: %s", clientErr)
			return nil, false
		}

		logger.Infof("  -> Connecting to Consul")
		nomad, nomadErr := NewConsulRegion(cfg, regionClient, channels)
		if nomadErr != nil {
			logger.Errorf("    -> Could not create Consul client: %s", nomadErr)
			return nil, false
		}

		regionClients[region] = nomad

		logger.Info("  -> Starting resource watchers")
		nomad.StartWatchers()
	}

	cluster := NewConsulCluster(consulClient, &regionClients, &regionChannels)
	cluster.StartWatchers()

	hub := NewConsulHub(cluster)
	go hub.Run()

	return hub, true
}
