package main

import (
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
	"github.com/hashicorp/nomad/api"
)

const (
	waitTime = 1 * time.Minute
)

// NomadRegion keeps track of the NomadRegion state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the NomadRegion server.
type NomadRegion struct {
	Client             *api.Client
	BroadcastChannels  *BroadcastChannels
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

// NewNomad configures the Nomad API client and initializes the internal state.
func NewNomad(c *Config, client *api.Client, channels *BroadcastChannels) (*NomadRegion, error) {
	return &NomadRegion{
		Client:             client,
		BroadcastChannels:  channels,
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
	go n.watchMembers()
	go n.watchAggregateClusterStatistics()
}

func (n *NomadRegion) downloadFile(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	path := params["path"]

	c := r.URL.Query().Get("client")
	allocID := r.URL.Query().Get("allocID")
	if c == "" || allocID == "" {
		http.Error(w, "client or allocID should be passed.", http.StatusBadRequest)
		return
	}

	config := api.DefaultConfig()
	config.Address = fmt.Sprintf("http://%s", c)

	client, err := api.NewClient(config)
	if err != nil {
		logger.Errorf("Could not create client: %s", err)
		http.Error(w, "Could not connect to Nomad client.", http.StatusInternalServerError)
		return
	}

	alloc, _, err := client.Allocations().Info(allocID, nil)
	if err != nil {
		logger.Errorf("Unable to fetch alloc: %s", err)
		http.Error(w, "Could not fetch the allocation.", http.StatusInternalServerError)
		return
	}

	file, err := client.AllocFS().Cat(alloc, path, nil)
	if err != nil {
		logger.Errorf("Unable to cat file: %s", err)
		http.Error(w, "Could not fetch the file.", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(path))
	w.Header().Set("Content-Type", "application/octet-stream")

	logger.Infof("download: streaming %q to client", path)

	io.Copy(w, file)
}
