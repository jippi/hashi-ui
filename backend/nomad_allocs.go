package main

import (
	"github.com/hashicorp/nomad/api"
	"time"
)

func (n *Nomad) watchAllocs() {
	q := &api.QueryOptions{WaitIndex: 1}

	for {
		allocations, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Allocations index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Allocations index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		n.allocations = allocations
		n.BroadcastChannels.allocations.Update(&Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}

func (n *Nomad) watchAllocsShallow() {
	q := &api.QueryOptions{WaitIndex: 1}

	for {
		allocations, meta, err := n.Client.Allocations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch allocations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Allocations (shallow) index is unchanged (%d == %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		logger.Debugf("Allocations (shallow) index is changed (%d <> %d)", localWaitIndex, remoteWaitIndex)

		for i, _ := range allocations {
			allocations[i].TaskStates = make(map[string]*api.TaskState)
		}

		n.allocationsShallow = allocations
		n.BroadcastChannels.allocationsShallow.Update(&Action{Type: fetchedAllocs, Payload: allocations, Index: remoteWaitIndex})

		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
