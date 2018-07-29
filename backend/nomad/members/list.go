package members

import (
	"crypto/sha1"
	"fmt"
	"net"
	"sort"
	"time"

	"github.com/cnf/structhash"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/nomad/helper"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchList   = "NOMAD_WATCH_MEMBERS"
	UnwatchList = "NOMAD_UNWATCH_MEMBERS"
	fetchedList = "NOMAD_FETCHED_MEMBERS"
)

type list struct {
	action   structs.Action
	client   *api.Client
	checksum string
	cfg      *config.Config
}

func NewList(action structs.Action, cfg *config.Config, client *api.Client) *list {
	return &list{
		action: action,
		client: client,
		cfg:    cfg,
	}
}

func (w *list) Do(send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan interface{}) (structs.Response, error) {
	ticker := time.NewTicker(5 * time.Second)
	timer := time.NewTimer(0 * time.Second)

	for {
		select {
		case <-subscribeCh:
			return structs.NewNoopResponse()
		case <-destroyCh:
			return structs.NewNoopResponse()
		case <-timer.C:
			w.update(w.client, send)
		case <-ticker.C:
			w.update(w.client, send)
		}
	}
}

func (w *list) update(client *api.Client, send chan *structs.Action) error {
	checksum, members, err := membersWithID(client, w.cfg)
	if err != nil {
		return err
	}

	if checksum == w.checksum {
		return nil
	}

	w.checksum = checksum

	send <- &structs.Action{
		Type:    fetchedList,
		Payload: members,
	}

	return nil
}

func (w *list) Key() string {
	return "/members/list"
}

func (w *list) IsMutable() bool {
	return false
}

func (w *list) BackendType() string {
	return "nomad"
}

func membersWithID(client *api.Client, cfg *config.Config) (string, []*AgentMemberWithID, error) {
	members, err := client.Agent().Members()
	if err != nil {
		return "", nil, err
	}

	ms := make([]*AgentMemberWithID, 0, len(members.Members))
	for _, m := range members.Members {
		x, memberErr := NewAgentMemberWithID(m)
		if memberErr != nil {
			return "", nil, fmt.Errorf("Failed to create AgentMemberWithID %s: %#v", memberErr, m)
		}

		ms = append(ms, x)
	}

	regions, _ := client.Regions().List()

	for _, region := range regions {
		regionClient, _ := helper.NewRegionClient(cfg, region)

		leader, err := regionClient.Status().Leader()
		if err != nil {
			return "", nil, err
		}

		addr, port, err := net.SplitHostPort(leader)
		if err != nil {
			return "", nil, fmt.Errorf("Failed to parse leader: %s", leader)
		}

		for _, m := range ms {
			mPort, ok := m.Tags["port"]
			if ok && (mPort == port) && (m.Addr == addr) {
				m.Leader = true
			}
		}
	}

	sort.Sort(MembersNameSorter(ms))

	checksum := fmt.Sprintf("%x", sha1.Sum(structhash.Dump(ms, 1)))
	checksum = checksum[0:8]

	return checksum, ms, nil
}

// NewAgentMemberWithID will create a new Agent with a pseudo ID
func NewAgentMemberWithID(member *api.AgentMember) (*AgentMemberWithID, error) {
	return &AgentMemberWithID{
		AgentMember: *member,
		Leader:      false,
	}, nil
}

// MembersNameSorter sorts planets by name
type MembersNameSorter []*AgentMemberWithID

func (a MembersNameSorter) Len() int           { return len(a) }
func (a MembersNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a MembersNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }

// AgentMemberWithID is a Wrapper around AgentMember that provides ID field. This is made to keep everything
// consistent i.e. other types have ID field.
type AgentMemberWithID struct {
	Leader bool
	api.AgentMember
}

// ClientNameSorter sorts planets by name
type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }
