package main

import (
	"crypto/md5"
	"encoding/binary"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/hashicorp/nomad/api"
	"io"
	"net/http"
	"path/filepath"
	"time"

	uuid "github.com/satori/go.uuid"
)

const (
	waitTime = 1 * time.Minute
)

// Wrapper around AgentMember that provides ID field. This is made to keep everything
// consistent i.e. other types have ID field.
type AgentMemberWithID struct {
	api.AgentMember
	ID     string
	Leader bool
}

func NewAgentMemberWithID(member *api.AgentMember) (*AgentMemberWithID, error) {
	h := md5.New() // we use md5 as it also has 16 bytes and it maps nicely to uuid

	_, err := io.WriteString(h, member.Name)
	if err != nil {
		return nil, err
	}

	_, err = io.WriteString(h, member.Addr)
	if err != nil {
		return nil, err
	}

	err = binary.Write(h, binary.LittleEndian, member.Port)
	if err != nil {
		return nil, err
	}

	sum := h.Sum(nil)
	ID, err := uuid.FromBytes(sum)
	if err != nil {
		return nil, err
	}

	return &AgentMemberWithID{
		AgentMember: *member,
		ID:          ID.String(),
		Leader:      false,
	}, nil
}

// Nomad keeps track of the Nomad state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exposes an API client for the Nomad server.
type Nomad struct {
	Client             *api.Client
	BroadcastChannels  *BroadcastChannels
	allocations        []*api.AllocationListStub
	allocationsShallow []*api.AllocationListStub // with TaskStates removed
	clusterStatistics  *ClusterStatisticsAggregatedResult
	evaluations        []*api.Evaluation
	jobs               []*api.JobListStub
	members            []*AgentMemberWithID
	nodes              []*api.NodeListStub
	updateCh           chan *Action
}

// NewNomad configures the Nomad API client and initializes the internal state.
func NewNomad(url string, updateCh chan *Action, channels *BroadcastChannels) (*Nomad, error) {
	config := api.DefaultConfig()
	config.Address = url
	config.WaitTime = waitTime

	client, err := api.NewClient(config)
	if err != nil {
		return nil, err
	}

	return &Nomad{
		Client:             client,
		updateCh:           updateCh,
		BroadcastChannels:  channels,
		allocations:        make([]*api.AllocationListStub, 0),
		allocationsShallow: make([]*api.AllocationListStub, 0),
		clusterStatistics:  &ClusterStatisticsAggregatedResult{},
		evaluations:        make([]*api.Evaluation, 0),
		jobs:               make([]*api.JobListStub, 0),
		members:            make([]*AgentMemberWithID, 0),
		nodes:              make([]*api.NodeListStub, 0),
	}, nil
}

func (n *Nomad) downloadFile(w http.ResponseWriter, r *http.Request) {
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
