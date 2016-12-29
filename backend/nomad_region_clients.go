package main

import (
	"time"

	"github.com/hashicorp/nomad/api"
)

func (n *NomadRegion) watchNodes() {
	q := &api.QueryOptions{WaitIndex: 1}
	for {
		nodes, meta, err := n.Client.Nodes().List(q)
		if err != nil {
			logger.Errorf("watch: unable to fetch nodes: %s", err)
			time.Sleep(10 * time.Second)
			continue
		}

		remoteWaitIndex := meta.LastIndex
		localWaitIndex := q.WaitIndex

		// only work if the WaitIndex have changed
		if remoteWaitIndex == localWaitIndex {
			logger.Debugf("Nodes wait-index is unchanged (%d <> %d)", localWaitIndex, remoteWaitIndex)
			continue
		}

		n.nodes = nodes
		n.broadcastChannels.nodes.Update(&Action{Type: fetchedNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
