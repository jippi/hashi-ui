package main

import (
	"sort"
	"time"

	api "github.com/hashicorp/nomad/api"
)

// ClientNameSorter sorts planets by name
type ClientNameSorter []*api.NodeListStub

func (a ClientNameSorter) Len() int           { return len(a) }
func (a ClientNameSorter) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ClientNameSorter) Less(i, j int) bool { return a[i].Name < a[j].Name }

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

		// http://stackoverflow.com/a/28999886
		sort.Sort(ClientNameSorter(nodes))

		n.nodes = nodes
		n.broadcastChannels.nodes.Update(&Action{Type: fetchedNodes, Payload: nodes, Index: remoteWaitIndex})
		q = &api.QueryOptions{WaitIndex: remoteWaitIndex}
	}
}
