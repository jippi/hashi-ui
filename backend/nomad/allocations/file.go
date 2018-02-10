package allocations

import (
	"fmt"
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

const (
	WatchFile   = "NOMAD_WATCH_FILE"
	UnwatchFile = "NOMAD_UNWATCH_FILE"
	fetchedFile = "NOMAD_FETCHED_FILE"

	// bytesToLines is an estimation of how many bytes are in each log line.
	// This is used to set the offset to read from when a user specifies how
	// many lines to tail from.
	bytesToLines int64 = 120

	// defaultTailLines is the number of lines to tail by default.
	defaultTailLines int64 = 250

	// If a file exceeds an estimate of 250 loglines we start tailing it
	// from the end, otherwise the whole file is retrieved and followed.
	maxFileSize int64 = defaultTailLines * bytesToLines
)

type file struct {
	action structs.Action
	client *api.Client
	id     string
	path   string
}

func NewFile(action structs.Action, client *api.Client) *file {
	return &file{
		action: action,
		client: client,
	}
}

// Do will watch the /job/:id endpoint for changes
func (w *file) Do(send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan interface{}) (*structs.Response, error) {
	alloc, _, err := w.client.Allocations().Info(w.id, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	allocClient, err := w.client.GetNodeClient(alloc.NodeID, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	file, _, err := allocClient.AllocFS().Stat(alloc, w.path, nil)
	if err != nil {
		return structs.NewErrorResponse(err)
	}

	var origin = api.OriginStart
	var offset int64
	var oversized bool

	if file.Size > maxFileSize {
		origin = api.OriginEnd
		offset = maxFileSize
		oversized = true
	}

	cancel := make(chan struct{})
	frames, errCh := allocClient.AllocFS().Stream(alloc, w.path, origin, offset, cancel, nil)

	frameReader := api.NewFrameReader(frames, errCh, cancel)
	frameReader.SetUnblockTime(500 * time.Millisecond)
	r := NewLineLimitReader(frameReader, int(defaultTailLines), int(defaultTailLines*bytesToLines), 1*time.Second)
	defer r.Close()

	// Turn the reader into a channel
	lines := make(chan []byte)

	b := make([]byte, defaultTailLines*bytesToLines)
	go func() {
		for {
			select {
			case <-errCh:
				return

			case <-cancel:
				return

			case <-destroyCh:
				return

			case <-subscribeCh:
				return

			default:
				n, err := r.Read(b[:cap(b)])

				if err != nil {
					return
				}

				if n > 0 {
					lines <- b[0:n]
				}
			}
		}
	}()

	send <- &structs.Action{
		Type: fetchedFile,
		Payload: struct {
			File      string
			Data      string
			Oversized bool
		}{
			File:      w.path,
			Data:      "",
			Oversized: oversized,
		},
		Index: 0,
	}

	for {
		select {
		case <-cancel:
			return nil, nil

		case <-destroyCh:
			return nil, nil

		case <-subscribeCh:
			return nil, nil

		case line := <-lines:
			send <- &structs.Action{
				Type: fetchedFile,
				Payload: struct {
					File      string
					Data      string
					Oversized bool
				}{
					File:      w.path,
					Data:      string(line),
					Oversized: oversized,
				},
				Index: 0,
			}
		}
	}
}

func (w *file) Key() string {
	w.parse()

	return fmt.Sprintf("/allocation/%s/stream?file=%s", w.id, w.path)
}

func (w *file) IsMutable() bool {
	return false
}

func (w *file) parse() {
	params := w.action.Payload.(map[string]interface{})
	w.id = params["allocID"].(string)
	w.path = params["path"].(string)
}

func (w *file) BackendType() string {
	return "nomad"
}
