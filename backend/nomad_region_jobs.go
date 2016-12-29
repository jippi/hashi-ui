package main

import (
	"errors"
	"fmt"
	"time"

	"github.com/hashicorp/nomad/api"
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

func (n *Nomad) updateJob(job *api.Job) (*Action, error) {
	if *flagReadOnly {
		logger.Errorf("Unable to run jon: READONLY is set to true")
		return &Action{Type: errorNotification, Payload: "The backend server is set to read-only"}, errors.New("Nomad is in read-only mode")
	}

	logger.Infof("Started run job with id: %s", job.ID)

	_, _, err := n.Client.Jobs().Register(job, nil)
	if err != nil {
		logger.Errorf("connection: unable to register job : %s", err)
		return &Action{Type: errorNotification, Payload: fmt.Sprintf("Connection: unable to register job : %s", err)}, err
	}

	return &Action{Type: successNotification, Payload: "The job has been successfully updated."}, nil
}
