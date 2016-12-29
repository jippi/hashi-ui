package main

import observer "github.com/imkira/go-observer"

func InitializeNomad(cfg *Config) (*NomadHub, bool) {

	nomadClient, err := CreateNomadRegionClient(cfg, "")
	if err != nil {
		logger.Errorf("Could not create Nomad API Client: %s", err)
		return nil, false
	}

	regions, err := nomadClient.Regions().List()
	if err != nil {
		logger.Errorf("Could not fetch nomad regions from API: %s", err)
		return nil, false
	}

	regionChannels := NomadRegionChannels{}
	regionClients := NomadRegionClients{}

	for _, region := range regions {
		logger.Infof("Starting handlers for region: %s", region)

		channels := &NomadRegionBroadcastChannels{}
		channels.allocations = observer.NewProperty(&Action{})
		channels.allocationsShallow = observer.NewProperty(&Action{})
		channels.evaluations = observer.NewProperty(&Action{})
		channels.jobs = observer.NewProperty(&Action{})
		channels.members = observer.NewProperty(&Action{})
		channels.nodes = observer.NewProperty(&Action{})
		channels.clusterStatistics = observer.NewProperty(&Action{})

		regionChannels[region] = channels

		regionClient, clientErr := CreateNomadRegionClient(cfg, region)
		if clientErr != nil {
			logger.Errorf("  -> Could not create client: %s", clientErr)
			return nil, false
		}

		logger.Infof("  -> Connecting to nomad")
		nomad, nomadErr := NewNomadRegion(cfg, regionClient, channels)
		if nomadErr != nil {
			logger.Errorf("    -> Could not create client: %s", nomadErr)
			return nil, false
		}

		regionClients[region] = nomad

		logger.Info("  -> Starting resource watchers")
		nomad.StartWatchers()
	}

	cluster := NewNomadCluster(nomadClient, &regionClients, &regionChannels)
	cluster.StartWatchers()

	hub := NewNomadHub(cluster)
	go hub.Run()

	return hub, true
}
