package main

import (
	"crypto/md5"
	"crypto/sha1"
	"encoding/binary"
	"errors"
	"fmt"
	"github.com/cnf/structhash"
	"github.com/gorilla/mux"
	"github.com/hashicorp/nomad/api"
	"io"
	"net/http"
	"path/filepath"
	"sort"
	"strings"
	"sync"
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

type ClusterStatisticsTask struct {
	NodeID   string
	NodeName string
}

type ClusterStatisticsResult struct {
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

type ClusterStatisticsWorkerPayload struct {
	quit    <-chan bool
	tasks   <-chan *ClusterStatisticsTask
	results chan *ClusterStatisticsResult
	n       *Nomad
	wg      *sync.WaitGroup
}

type ClusterStatisticsAggregatedResult struct {
	Clients     int
	CPUCores    int
	CPUIdleTime float64
	MemoryUsed  uint64
	MemoryTotal uint64
}

func worker(payload *ClusterStatisticsWorkerPayload) {
	defer payload.wg.Done()

	for {
		select {
		case task, ok := <-payload.tasks:
			if !ok {
				return
			}

			logger.Debugf("[ClusterStatistics] Fetching statistics for %s (ID: %s)", task.NodeName, task.NodeID[0:8])
			stats, err := payload.n.Client.Nodes().Stats(task.NodeID, nil)
			if err != nil {
				logger.Errorf("[ClusterStatistics] Unable to fetch node stats for %s (%s)", task.NodeName, err)
				return
			}

			taksResult := &ClusterStatisticsResult{}
			taksResult.CPUCores = len(stats.CPU)
			taksResult.CPUIdleTime = 0

			for _, core := range stats.CPU {
				taksResult.CPUIdleTime = taksResult.CPUIdleTime + core.Idle
			}

			taksResult.MemoryUsed = stats.Memory.Used
			taksResult.MemoryTotal = stats.Memory.Total

			payload.results <- taksResult

		case <-payload.quit:
			return
		}
	}
}

func (n *Nomad) collectAggregateClusterStatistics() {
	ticker := time.NewTicker(5 * time.Second)
	quit := make(chan struct{})

	go func() {
		defer close(quit)

		for {
			select {
			case <-ticker.C:
				nodes, _, err := n.Client.Nodes().List(&api.QueryOptions{WaitIndex: 1})
				if err != nil {
					logger.Errorf("[ClusterStatistics] watch: unable to fetch nodes: %s", err)
					return
				}

				quit := make(chan bool)
				tasks := make(chan *ClusterStatisticsTask, len(nodes))
				results := make(chan *ClusterStatisticsResult, len(nodes))

				var wg sync.WaitGroup

				payload := &ClusterStatisticsWorkerPayload{
					tasks:   tasks,
					quit:    quit,
					results: results,
					n:       n,
					wg:      &wg,
				}

				// spawn 10 workers
				for i := 0; i < 10; i++ {
					wg.Add(1)
					go worker(payload)
				}

				// put the workers to... work
				for _, node := range nodes {
					tasks <- &ClusterStatisticsTask{NodeID: node.ID, NodeName: node.Name}
				}

				// end of tasks. the workers should quit afterwards
				// use "close(quit)", if you do not want to wait for the remaining tasks
				close(tasks)

				// wait for all workers to shut down properly
				logger.Debugf("[ClusterStatistics] waiting for tasks to finish")
				wg.Wait()

				// Make sure the result channel range will finish at end
				close(results)

				aggResult := &ClusterStatisticsAggregatedResult{}

				logger.Debugf("[ClusterStatistics] consuming results channel")
				for elem := range results {
					aggResult.Clients++

					aggResult.CPUIdleTime += elem.CPUIdleTime
					aggResult.CPUCores += elem.CPUCores
					aggResult.MemoryUsed += elem.MemoryUsed
					aggResult.MemoryTotal += elem.MemoryTotal
				}

				logger.Infof("[ClusterStatistics] Servers: %d, Total Cores: %d Total Idle CPU: %f Total Used RAM: %d Total RAM: %d",
					aggResult.Clients,
					aggResult.CPUCores,
					aggResult.CPUIdleTime,
					aggResult.MemoryUsed,
					aggResult.MemoryTotal,
				)

				n.clusterStatistics = aggResult
				n.BroadcastChannels.clusterStatistics.Update(&Action{Type: fetchedAllocs, Payload: aggResult})

			case <-quit:
				ticker.Stop()
				return
			}
		}
	}()
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

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Allocations index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Allocations index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		n.allocations = allocations
		n.BroadcastChannels.allocations.Update(&Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}

func (n *Nomad) watchAllocsShallow() {
	q := &api.QueryOptions{WaitIndex: 1}

	for {
		allocations, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Allocations (shallow) index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Allocations (shallow) index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		for i, _ := range allocations {
			allocations[i].TaskStates = make(map[string]*api.TaskState)
		}

		n.allocationsShallow = allocations
		n.BroadcastChannels.allocationsShallow.Update(&Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})

		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
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

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Evaluations wait-index is unchanged (%d <> %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		n.evaluations = evaluations
		n.BroadcastChannels.evaluations.Update(&Action{Type: fetchedEvals, Payload: evaluations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
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

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Jobs wait-index is unchanged (%d <> %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		n.jobs = jobs
		n.BroadcastChannels.jobs.Update(&Action{Type: fetchedJobs, Payload: jobs, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
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

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Nodes wait-index is unchanged (%d <> %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		n.nodes = nodes
		n.BroadcastChannels.nodes.Update(&Action{Type: fetchedNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}

// NameSorter sorts planets by name.
type MembersNameSorter []*AgentMemberWithID

func (a MembersNameSorter) Len() int           { return len(a) }
func (a MembersNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a MembersNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }

func (n *Nomad) watchMembers() {
	currentChecksum := ""

	for {
		members, err := n.MembersWithID()
		if err != nil {
			logger.Errorf("watch: unable to fetch members: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		// http://stackoverflow.com/a/28999886
		sort.Sort(MembersNameSorter(members))

		newChecksum := fmt.Sprintf("%x", sha1.Sum(structhash.Dump(members, 1)))
		newChecksum = newChecksum[0:8]

		if newChecksum == currentChecksum {
			logger.Debugf("Members checksum is unchanged (%s == %s)", currentChecksum, newChecksum)
			time.Sleep(10 * time.Second)
			continue
		}

		logger.Debugf("Members checksum is changed (%s != %s)", currentChecksum, newChecksum)
		currentChecksum = newChecksum

		n.members = members
		n.BroadcastChannels.members.Update(&Action{Type: fetchedMembers, Payload: members, Index: 0})

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
