package subscriber

import (
	"sync"
	"sync/atomic"

	"golang.org/x/sync/syncmap"
)

// Manager ...
type Manager struct {
	s syncmap.Map
	sync.Mutex
	sync.WaitGroup
	count int64
}

// Subscribe ...
func (m *Manager) Subscribe(key string) chan interface{} {
	m.Lock()
	defer m.Unlock()

	// WaitGroup
	m.Add(1)

	// Counter
	atomic.AddInt64(&m.count, 1)

	r, _ := m.s.LoadOrStore(key, make(chan interface{}, 0))
	return r.(chan interface{})
}

// Subscribed ...
func (m *Manager) Subscribed(key string) bool {
	_, ok := m.s.Load(key)
	return ok
}

// Unsubscribe ...
func (m *Manager) Unsubscribe(key string) {
	m.Lock()
	defer m.Unlock()

	chInterface, ok := m.s.Load(key)
	if !ok {
		return
	}

	// WaitGroup
	defer m.Done()

	// Counter
	atomic.AddInt64(&m.count, -1)

	ch := chInterface.(chan interface{})
	close(ch)
	m.s.Delete(key)
}

// Clear the list
func (m *Manager) Clear() {
	m.s.Range(func(k, v interface{}) bool {
		m.Unsubscribe(k.(string))
		return true
	})
}

// Subscriptions ...
func (m *Manager) Subscriptions() []string {
	m.Lock()
	defer m.Unlock()

	r := make([]string, 0)

	m.s.Range(func(k, v interface{}) bool {
		r = append(r, k.(string))
		return true
	})

	return r
}

func (m *Manager) Count() int64 {
	return m.count
}
