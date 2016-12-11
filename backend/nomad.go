package main

import (
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"crypto/md5"
	"encoding/binary"
	"errors"
	"fmt"
	"io"

	"github.com/gorilla/mux"
	"github.com/hashicorp/nomad/api"
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
	Client            *api.Client
	BroadcastChannels *BroadcastChannels
	allocations       []*api.AllocationListStub
	evaluations       []*api.Evaluation
	jobs              []*api.JobListStub
	members           []*AgentMemberWithID
	nodes             []*api.NodeListStub
	updateCh          chan *Action
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
		Client:            client,
		updateCh:          updateCh,
		BroadcastChannels: channels,
		allocations:       make([]*api.AllocationListStub, 0),
		evaluations:       make([]*api.Evaluation, 0),
		jobs:              make([]*api.JobListStub, 0),
		members:           make([]*AgentMemberWithID, 0),
		nodes:             make([]*api.NodeListStub, 0),
	}, nil
}

// MembersWithID is used to query all of the known server members.
func (n *Nomad) MembersWithID() ([]*AgentMemberWithID, error) {
	members, err := n.Client.Agent().Members()
	if err != nil {
		return nil, err
	}

	ms := make([]*AgentMemberWithID, 0, len(members.Members))
	for _, m := range members.Members {
		x, err := NewAgentMemberWithID(m)
		if err != nil {
			return nil, errors.New(fmt.Sprintf("Failed to create AgentMemberWithID %s: %#v", err, m))
		}
		ms = append(ms, x)
	}

	leader, err := n.Client.Status().Leader()
	if err != nil {
		logger.Error("Failed to fetch leader.")
		return nil, err
	}

	if leader != "" {
		parts := strings.Split(leader, ":")
		if len(parts) != 2 {
			return nil, errors.New(fmt.Sprintf("Failed to parse leader: %s", leader))
		}
		addr, port := parts[0], parts[1]

		for _, m := range ms {
			mPort, ok := m.Tags["port"]
			if ok && (mPort == port) && (m.Addr == addr) {
				m.Leader = true
			}
		}
	}
	return ms, nil
}

// MemberWithID is used to query a server member by its ID.
func (n *Nomad) MemberWithID(ID string) (*AgentMemberWithID, error) {
	members, err := n.MembersWithID()
	if err != nil {
		return nil, err
	}
	for _, m := range members {
		if m.ID == ID {
			return m, nil
		}
	}
	return nil, errors.New(fmt.Sprintf("Unable to find member with ID: %s", ID))
}

func (n *Nomad) watchAllocs() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		allocations, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		for i, _ := range allocations {
			allocations[i].TaskStates = make(map[string]*api.TaskState)
		}

		n.allocations = allocations
		n.BroadcastChannels.allocations <- &Action{Type: fetchedAllocs, Payload: allocations, Index: meta.LastIndex}

		// Guard for zero LastIndex in case of timeout
		waitIndex := meta.LastIndex
		if q.WaitIndex > meta.LastIndex {
			waitIndex = q.WaitIndex
		}

		q = &api.QueryOptions{WaitIndex: waitIndex}
	}
}

func (n *Nomad) watchEvals() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		evaluations, meta, err := n.Client.Evaluations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch evaluations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.evaluations = evaluations
		n.BroadcastChannels.evaluations <- &Action{Type: fetchedEvals, Payload: evaluations, Index: meta.LastIndex}

		// Guard for zero LastIndex in case of timeout
		waitIndex := meta.LastIndex
		if q.WaitIndex > meta.LastIndex {
			waitIndex = q.WaitIndex
		}
		q = &api.QueryOptions{WaitIndex: waitIndex}
	}
}

func (n *Nomad) watchJobs() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		jobs, meta, err := n.Client.Jobs().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch jobs: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.jobs = jobs
		n.BroadcastChannels.jobs <- &Action{Type: fetchedJobs, Payload: jobs, Index: meta.LastIndex}

		// Guard for zero LastIndex in case of timeout
		waitIndex := meta.LastIndex
		if q.WaitIndex > meta.LastIndex {
			waitIndex = q.WaitIndex
		}
		q = &api.QueryOptions{WaitIndex: waitIndex}
	}
}

func (n *Nomad) watchNodes() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		nodes, meta, err := n.Client.Nodes().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch nodes: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.nodes = nodes
		n.BroadcastChannels.nodes <- &Action{Type: fetchedNodes, Payload: nodes, Index: meta.LastIndex}

		// Guard for zero LastIndex in case of timeout
		waitIndex := meta.LastIndex
		if q.WaitIndex > meta.LastIndex {
			waitIndex = q.WaitIndex
		}
		q = &api.QueryOptions{WaitIndex: waitIndex}
	}
}

func (n *Nomad) watchMembers() {
	for {
		members, err := n.MembersWithID()
		if err != nil {
			logger.Errorf("watch: unable to fetch members: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		n.members = members
		n.BroadcastChannels.members <- &Action{Type: fetchedMembers, Payload: members, Index: 0}

		time.Sleep(10 * time.Second)
	}
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
