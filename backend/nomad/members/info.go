package members

import (
	"fmt"
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedMember = "NOMAD_FETCHED_MEMBER"
	FetchInfo     = "NOMAD_FETCH_MEMBER"
	WatchInfo     = "NOMAD_WATCH_MEMBER"
	UnwatchInfo   = "NOMAD_UNWATCH_MEMBER"
)

type info struct {
	action   structs.Action
	checksum string
}

func NewInfo(action structs.Action) *info {
	return &info{
		action: action,
	}
}

func (w *info) Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error) {
	id := w.action.Payload.(string)

	checksum, members, err := membersWithID(client)
	if err != nil {
		return nil, err
	}

	if checksum == w.checksum {
		time.Sleep(5 * time.Second)
		return nil, nil
	}

	w.checksum = checksum

	for _, m := range members {
		if m.Name == id {
			return &structs.Action{Type: fetchedMember, Payload: m}, nil
		}
	}

	return nil, fmt.Errorf("Unable to find member with ID: %s", id)
}

func (w *info) Key() string {
	return "/members/" + w.id()
}

func (w *info) IsMutable() bool {
	return false
}

func (w *info) id() string {
	return w.action.Payload.(string)
}
