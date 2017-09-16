package nomad

import (
	"github.com/jippi/hashi-ui/backend/config"
	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("hashi-ui")

// Initialize ...
func Initialize(cfg *config.Config) (*Hub, bool) {

	client, err := CreateRegionClient(cfg, "")
	if err != nil {
		logger.Errorf("Could not create Nomad API Client: %s", err)
		return nil, false
	}

	regions, err := client.Regions().List()
	if err != nil {
		logger.Errorf("Could not fetch nomad regions from API: %s", err)
		return nil, false
	}

	regionClients := RegionClients{}

	for _, region := range regions {
		logger.Infof("Starting handlers for region: %s", region)

		regionClient, clientErr := CreateRegionClient(cfg, region)
		if clientErr != nil {
			logger.Errorf("  -> Could not create client: %s", clientErr)
			return nil, false
		}

		logger.Infof("  -> Connecting to nomad")
		nomad, nomadErr := NewRegion(cfg, regionClient)
		if nomadErr != nil {
			logger.Errorf("    -> Could not create client: %s", nomadErr)
			return nil, false
		}

		regionClients[region] = nomad
	}

	hub := NewHub(NewCluster(client, &regionClients))

	return hub, true
}
