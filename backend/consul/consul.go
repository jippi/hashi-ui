package consul

import (
	observer "github.com/imkira/go-observer"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("hashi-ui")

// Initialize ...
func Initialize(cfg *config.Config) (*Hub, bool) {

	client, err := CreateRegionClient(cfg, "")
	if err != nil {
		logger.Errorf("Could not create Consul API Client: %s", err)
		return nil, false
	}

	regions, err := client.Catalog().Datacenters()
	if err != nil {
		logger.Errorf("Could not fetch Consul datacenters from API: %s", err)
		return nil, false
	}

	regionChannels := RegionChannels{}
	regionClients := RegionClients{}

	for _, region := range regions {
		logger.Infof("Starting handlers for Consul DC: %s", region)

		channels := &RegionBroadcastChannels{}
		channels.services = observer.NewProperty(&structs.Action{})
		channels.nodes = observer.NewProperty(&structs.Action{})

		regionChannels[region] = channels

		regionClient, clientErr := CreateRegionClient(cfg, region)
		if clientErr != nil {
			logger.Errorf("  -> Could not create Consul client: %s", clientErr)
			return nil, false
		}

		logger.Infof("  -> Connecting to Consul")
		consul, nomadErr := NewRegion(cfg, regionClient, channels)
		if nomadErr != nil {
			logger.Errorf("    -> Could not create Consul client: %s", nomadErr)
			return nil, false
		}

		regionClients[region] = consul

		logger.Info("  -> Starting resource watchers")
		consul.StartWatchers()
	}

	cluster := NewCluster(client, &regionClients, &regionChannels)
	cluster.StartWatchers()

	hub := NewHub(cluster)
	go hub.Run()

	return hub, true
}
