package nomad

import (
	"github.com/jippi/hashi-ui/backend/nomad/query"
	"github.com/jippi/hashi-ui/backend/subscriber"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/structs"
)

// Watcher interface
type Watcher interface {
	Do(client *api.Client, q *api.QueryOptions) (*structs.Action, error)
	Key() string
}

// Watch is a generic watcher for Nomad
func Watch(w Watcher, s subscriber.Subscription, client *api.Client, send chan *structs.Action, destroyCh chan struct{}) {
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
func Unwatch(w Watcher, s subscriber.Subscription) error {
	key := w.Key()

	s.Unsubscribe(key)
	logger.Infof("Unwatching %s", key)

	return nil
}

// Once is a generic one-off query for Nomad
func Once(w Watcher, s subscriber.Subscription, client *api.Client, send chan *structs.Action, destroyCh chan struct{}) {
	watchKey := "/once" + w.Key()

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
					Payload: err,
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
