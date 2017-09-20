package nomad

import (
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/subscriber"
	log "github.com/sirupsen/logrus"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

// Watcher interface
type Watcher interface {
	Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error)
	Key() string
	IsMutable() bool
}

// Stream interface
type Streamer interface {
	Do(client *api.Client, send chan *structs.Action, subscribeCh chan interface{}, destroyCh chan struct{}) (*structs.Action, error)
	Key() string
	IsMutable() bool
}

type Keyer interface {
	Key() string
}

// Watch is a generic watcher for Nomad
func Watch(w Watcher, s subscriber.Subscription, logger *log.Entry, client *api.Client, send chan *structs.Action, destroyCh chan struct{}) {
	watchKey := w.Key()

	// Check if we are already subscribed
	if s.Subscribed(watchKey) {
		logger.Errorf("Already watching %s", watchKey)
	}

	// Create subscription
	subscribeCh := s.Subscribe(watchKey)
	defer func() {
		s.Unsubscribe(watchKey)
		logger.Infof("Stopped watching %s", watchKey)
	}()
	logger.Infof("Started watching %s", watchKey)

	q := query.Default(true)

	for {
		select {
		case <-subscribeCh:
			logger.Errorf("[%s] Shutting down due to closed subscribeCh", watchKey)
			return

		case <-destroyCh:
			logger.Errorf("[%s] Shutting down due to closed destroyCh", watchKey)
			return

		default:
			action, err := w.Do(client, q)
			if err != nil {
				logger.Errorf("connection: unable to fetch %s: %s", watchKey, err)
				send <- &structs.Action{Type: structs.ErrorNotification, Payload: err.Error()}
				return
			}

			if !s.Subscribed(watchKey) {
				logger.Errorf("No longer subscribed to %s", watchKey)
				return
			}

			if action != nil {
				send <- action
			}
		}
	}
}

// Unwatch is a generic watcher for Nomad
func Unwatch(w Keyer, s subscriber.Subscription, logger *log.Entry) error {
	key := w.Key()

	if s.Unsubscribe(key) {
		logger.Infof("Unwatching %s", key)
	} else {
		logger.Infof("Was not subscribed to %s", key)
	}

	return nil
}

// Once is a generic one-off query for Nomad
func Once(w Watcher, s subscriber.Subscription, logger *log.Entry, client *api.Client, send chan *structs.Action, destroyCh chan struct{}) {
	watchKey := w.Key()

	// Check if we are already subscribed
	if s.Subscribed(watchKey) {
		logger.Errorf("Already watching %s", watchKey)
	}

	// Create subscription
	subscribeCh := s.Subscribe(watchKey)
	defer func() {
		s.Unsubscribe(watchKey)
		logger.Infof("Stopped watching %s", watchKey)
	}()
	logger.Infof("Started watching %s", watchKey)

	q := query.Default(true)

	for {
		select {
		case <-subscribeCh:
			logger.Errorf("[%s] Shutting down due to closed subscribeCh", watchKey)
			return

		case <-destroyCh:
			logger.Errorf("[%s] Shutting down due to closed destroyCh", watchKey)
			return

		default:
			action, err := w.Do(client, q)
			if err != nil {
				logger.Errorf("connection: unable to fetch %s: %s", watchKey, err)
				send <- &structs.Action{
					Payload: err.Error(),
					Type:    structs.ErrorNotification,
				}
				return
			}

			if !s.Subscribed(watchKey) {
				logger.Errorf("No longer subscribed to %s", watchKey)
				return
			}

			if action != nil {
				send <- action
				return
			}
		}
	}
}

// Stream is a generic one-off query for Nomad
func Stream(w Streamer, s subscriber.Subscription, logger *log.Entry, client *api.Client, send chan *structs.Action, destroyCh chan struct{}) {
	watchKey := w.Key()

	// Check if we are already subscribed
	if s.Subscribed(watchKey) {
		logger.Errorf("Already watching %s", watchKey)
	}

	// Create subscription
	subscribeCh := s.Subscribe(watchKey)
	defer func() {
		s.Unsubscribe(watchKey)
		logger.Infof("Stopped watching %s", watchKey)
	}()
	logger.Infof("Started watching %s", watchKey)

	action, err := w.Do(client, send, subscribeCh, destroyCh)
	if err != nil {
		logger.Errorf("connection: unable to stream %s: %s", watchKey, err)
		send <- &structs.Action{
			Payload: err.Error(),
			Type:    structs.ErrorNotification,
		}
		return
	}

	if !s.Subscribed(watchKey) {
		logger.Errorf("No longer subscribed to %s", watchKey)
		return
	}

	if action != nil {
		send <- action
		return
	}
}
