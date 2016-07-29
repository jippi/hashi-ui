package main

import (
	"log"
	"time"

	"github.com/hashicorp/nomad/api"
)

const (
	waitTime = 1 * time.Minute
)

// Nomad keeps track of the Nomad state. It monitors changes to allocations,
// evaluations, jobs and nodes and broadcasts them to all connected websockets.
// It also exoses an API client for the Nomad server.
type Nomad struct {
	Client *api.Client

	allocs []*api.AllocationListStub
	evals  []*api.Evaluation
	jobs   []*api.JobListStub
	nodes  []*api.NodeListStub

	updateCh chan *Action
}

// NewNomad configures the Nomad API client and initializes the internal state.
func NewNomad(url string, updateCh chan *Action) *Nomad {
	config := api.DefaultConfig()
	config.Address = url
	config.WaitTime = waitTime

	client, err := api.NewClient(config)
	if err != nil {
		log.Fatalf("Could not create client: %s", err)
	}

	return &Nomad{
		Client:   client,
		updateCh: updateCh,
		allocs:   make([]*api.AllocationListStub, 0),
		evals:    make([]*api.Evaluation, 0),
		nodes:    make([]*api.NodeListStub, 0),
		jobs:     make([]*api.JobListStub, 0),
	}
}

// FlushAll sends the current Nomad state to the connection. This is used to pass
// all known state to the client connection.
func (n *Nomad) FlushAll(c *Connection) {
	c.send <- &Action{Type: fetchedAllocs, Payload: n.allocs}
	c.send <- &Action{Type: fetchedEvals, Payload: n.evals}
	c.send <- &Action{Type: fetchedJobs, Payload: n.jobs}
	c.send <- &Action{Type: fetchedNodes, Payload: n.nodes}
}

func (n *Nomad) watchAllocs() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		allocs, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			log.Printf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.allocs = allocs
		n.updateCh <- &Action{Type: fetchedAllocs, Payload: allocs}

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
		evals, meta, err := n.Client.Evaluations().List(q)
		if err != nil {
			log.Printf("watch: unable to fetch evaluations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.evals = evals
		n.updateCh <- &Action{Type: fetchedEvals, Payload: evals}

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
			log.Printf("watch: unable to fetch jobs: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.jobs = jobs
		n.updateCh <- &Action{Type: fetchedJobs, Payload: jobs}

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
			log.Printf("watch: unable to fetch nodes: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}
		n.nodes = nodes
		n.updateCh <- &Action{Type: fetchedNodes, Payload: nodes}

		// Guard for zero LastIndex in case of timeout
		waitIndex := meta.LastIndex
		if q.WaitIndex > meta.LastIndex {
			waitIndex = q.WaitIndex
		}
		q = &api.QueryOptions{WaitIndex: waitIndex}
	}
}
