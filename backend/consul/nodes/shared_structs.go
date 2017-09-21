package nodes

import "github.com/hashicorp/consul/api"

type internalNode struct {
	Node            string
	Address         string
	TaggedAddresses map[string]string
	Services        []*api.AgentService
	Checks          []*api.AgentCheck
}

type internalNodes []*internalNode
