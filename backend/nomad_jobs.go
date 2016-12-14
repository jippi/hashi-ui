package main

import (
	"github.com/hashicorp/nomad/api"
	"time"
)

func (n *Nomad) watchJobs() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		jobs, meta, err := n.Client.Jobs().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch jobs: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Jobs wait-index is unchanged (%d <> %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		n.jobs = jobs
		n.BroadcastChannels.jobs.Update(&Action{Type: fetchedJobs, Payload: jobs, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
