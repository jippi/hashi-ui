package main

import (
	"github.com/hashicorp/nomad/api"
	"time"
)

func (n *Nomad) watchEvals() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		evaluations, meta, err := n.Client.Evaluations().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch evaluations: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Evaluations wait-index is unchanged (%d <> %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		n.evaluations = evaluations
		n.BroadcastChannels.evaluations.Update(&Action{Type: fetchedEvals, Payload: evaluations, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
