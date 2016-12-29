package main

import (
	"time"

	"github.com/hashicorp/nomad/api"
	observer "github.com/imkira/go-observer"
)

const (
	waitTime = 1 * time.Minute
)

// NomadRegionChannels ...
type NomadRegionChannels map[string]*NomadRegionBroadcastChannels

// NomadRegionClients ...
type NomadRegionClients map[string]*NomadRegion

// NomadRegionBroadcastChannels contains all the channels for resources hashi-ui automatically maintain active lists of
type NomadRegionBroadcastChannels struct {
	allocations        observer.Property
	allocationsShallow observer.Property
	evaluations        observer.Property
	jobs               observer.Property
	members            observer.Property
	nodes              observer.Property
	clusterStatistics  observer.Property
}

// NomadRegion keeps track of the NomadRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the NomadRegion server.
type NomadRegion struct {
	Client             *api.Client
	broadcastChannels  *NomadRegionBroadcastChannels
	regions            []string
	allocations        []*api.AllocationListStub
	allocationsShallow []*api.AllocationListStub // with TaskStates removed
	clusterStatistics  *NomadRegionStatisticsAggregatedResult
	evaluations        []*api.Evaluation
	jobs               []*api.JobListStub
	members            []*AgentMemberWithID
	nodes              []*api.NodeListStub
}

// CreateNomadRegionClient derp
func CreateNomadRegionClient(c *Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.Address
	config.WaitTime = waitTime
	config.Region = region
	config.TLSConfig = &api.TLSConfig{
		CACert:     c.CACert,
		ClientCert: c.ClientCert,
		ClientKey:  c.ClientKey,
	}

	return api.NewClient(config)
}

// NewNomadRegion configures the Nomad API client and initializes the internal state.
func NewNomadRegion(c *Config, client *api.Client, channels *NomadRegionBroadcastChannels) (*NomadRegion, error) {
	return &NomadRegion{
		Client:             client,
		broadcastChannels:  channels,
		regions:            make([]string, 0),
		allocations:        make([]*api.AllocationListStub, 0),
		allocationsShallow: make([]*api.AllocationListStub, 0),
		clusterStatistics:  &NomadRegionStatisticsAggregatedResult{},
		evaluations:        make([]*api.Evaluation, 0),
		jobs:               make([]*api.JobListStub, 0),
		members:            make([]*AgentMemberWithID, 0),
		nodes:              make([]*api.NodeListStub, 0),
	}, nil
}

// StartWatchers derp
func (n *NomadRegion) StartWatchers() {
	go n.watchAllocs()
	go n.watchAllocsShallow()
	go n.watchEvals()
	go n.watchJobs()
	go n.watchNodes()
	go n.watchAggregateClusterStatistics()
}
