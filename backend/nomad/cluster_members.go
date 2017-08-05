package nomad

import (
	"crypto/sha1"
	"fmt"
	"net"
	"sort"
	"time"

	"github.com/cnf/structhash"
	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

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

func (c *NomadCluster) watchMembers() {
	currentChecksum := ""

	for {
		members, err := c.MembersWithID()
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

		c.members = members

		for _, regionChannels := range *c.RegionChannels {
			regionChannels.members.Update(&structs.Action{Type: fetchedMembers, Payload: members, Index: 0})
		}

		time.Sleep(10 * time.Second)
	}
}

// MembersWithID is used to query all of the known server members.
func (c *NomadCluster) MembersWithID() ([]*AgentMemberWithID, error) {
	members, err := c.ClusterClient.Agent().Members()
	if err != nil {
		return nil, err
	}

	ms := make([]*AgentMemberWithID, 0, len(members.Members))
	for _, m := range members.Members {
		x, memberErr := NewAgentMemberWithID(m)
		if memberErr != nil {
			return nil, fmt.Errorf("Failed to create AgentMemberWithID %s: %#v", memberErr, m)
		}
		ms = append(ms, x)
	}

	for region, regionClient := range *c.RegionClients {
		logger.Debugf("Finding region leader for %s", region)

		leader, err := regionClient.Client.Status().Leader()
		if err != nil {
			logger.Errorf("%s: %s", region, err)
			continue
		}

		addr, port, err := net.SplitHostPort(leader)
		if err != nil {
			return nil, fmt.Errorf("Failed to parse leader: %s", leader)
		}

		for _, m := range ms {
			mPort, ok := m.Tags["port"]
			if ok && (mPort == port) && (m.Addr == addr) {
				logger.Debugf("  Found leader: %s", leader)
				m.Leader = true
			}
		}
	}

	return ms, nil
}

// MemberWithID is used to query a server member by its ID.
func (c *NomadCluster) MemberWithID(ID string) (*AgentMemberWithID, error) {
	members, err := c.MembersWithID()
	if err != nil {
		return nil, err
	}

	for _, m := range members {
		if m.Name == ID {
			return m, nil
		}
	}

	return nil, fmt.Errorf("Unable to find member with ID: %s", ID)
}

// NewAgentMemberWithID will create a new Agent with a pseudo ID
func NewAgentMemberWithID(member *api.AgentMember) (*AgentMemberWithID, error) {
	return &AgentMemberWithID{
		AgentMember: *member,
		Leader:      false,
	}, nil
}
