package main

import (
	"crypto/md5"
	"crypto/sha1"
	"encoding/binary"
	"errors"
	"fmt"
	"github.com/cnf/structhash"
	"github.com/hashicorp/nomad/api"
	"io"
	"sort"
	"strings"
	"time"

	uuid "github.com/satori/go.uuid"
)

// NameSorter sorts planets by name.
type MembersNameSorter []*AgentMemberWithID

func (a MembersNameSorter) Len() int           { return len(a) }
func (a MembersNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a MembersNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }

// Wrapper around AgentMember that provides ID field. This is made to keep everything
// consistent i.e. other types have ID field.
type AgentMemberWithID struct {
	api.AgentMember
	ID     string
	Leader bool
}

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
