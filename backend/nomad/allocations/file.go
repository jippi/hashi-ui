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
	id     string
	path   string
}

func NewFile(action structs.Action) *file {
	return &file{
		action: action,
	}
}

// Do will watch the /job/:id endpoint for changes
func (w *file) Do(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan struct{}) (*structs.Action, error) {
	alloc, _, err := client.Allocations().Info(w.id, nil)
	if err != nil {
		return nil, err
	}

	allocClient, err := client.GetNodeClient(alloc.NodeID, nil)
	if err != nil {
		return nil, err
	}

	file, _, err := allocClient.AllocFS().Stat(alloc, w.path, nil)
	if err != nil {
		return nil, err
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
	frames, err := allocClient.AllocFS().Stream(alloc, w.path, origin, offset, cancel, nil)
	if err != nil {
		return nil, fmt.Errorf("Unable to stream file: %s", err)
	}

	frameReader := api.NewFrameReader(frames, cancel)
	frameReader.SetUnblockTime(500 * time.Millisecond)
	r := NewLineLimitReader(frameReader, int(defaultTailLines), int(defaultTailLines*bytesToLines), 1*time.Second)
	defer r.Close()

	// Turn the reader into a channel
	lines := make(chan []byte)
	defer close(lines)

	b := make([]byte, defaultTailLines*bytesToLines)
	go func() {
		for {
			select {
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
