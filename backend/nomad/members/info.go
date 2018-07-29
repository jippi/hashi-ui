package members

import (
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	fetchedInfo = "NOMAD_FETCHED_MEMBER"
	FetchInfo   = "NOMAD_FETCH_MEMBER"
	WatchInfo   = "NOMAD_WATCH_MEMBER"
	UnwatchInfo = "NOMAD_UNWATCH_MEMBER"
)

type info struct {
	action   structs.Action
	client   *api.Client
	checksum string
	cfg      *config.Config
}

func NewInfo(action structs.Action, cfg *config.Config, client *api.Client) *info {
	return &info{
		action: action,
		cfg:    cfg,
		client: client,
	}
}

func (w *info) Do() (structs.Response, error) {
	id := w.action.Payload.(string)

	checksum, members, err := membersWithID(w.client, w.cfg)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	if checksum == w.checksum {
		time.Sleep(5 * time.Second)
		return structs.NewNoopResponse()
	}

	w.checksum = checksum

	for _, m := range members {
		if m.Name == id {
			return structs.NewResponse(fetchedInfo, m), nil
		}
	}

	return structs.NewErrorResponse("Unable to find member with ID: %s", id)
}

func (w *info) Key() string {
	return "/members/" + w.id()
}

func (w *info) IsMutable() bool {
	return false
}

func (w *info) BackendType() string {
	return "nomad"
}

func (w *info) id() string {
	return w.action.Payload.(string)
}
