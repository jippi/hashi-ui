package helper

import (
	"time"

	"github.com/hashicorp/consul/api"
	"github.com/jippi/hashi-ui/backend/config"
)

// NewDatacenterClient ...
func NewDatacenterClient(c *config.Config, dc string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.ConsulAddress
	config.WaitTime = 2 * time.Minute
	config.Datacenter = dc
	config.Token = c.ConsulACLToken

	return api.NewClient(config)
}

// QueryChanged will return wether the query changed, comparing the WaitIndex vs LastIndex
// If the query has changed, the QueryMeta is updated with the new WaitIndex value of LastIndex,
// in preparation for the new usage in the long polling API
func QueryChanged(q *api.QueryOptions, meta *api.QueryMeta) bool {
	if meta.LastIndex <= q.WaitIndex {
		return false
	}

	q.WaitIndex = meta.LastIndex
	return true
}

func DefaultQuery(allowStale bool) *api.QueryOptions {
	return &api.QueryOptions{
		AllowStale: allowStale,
		WaitTime:   2 * time.Minute,
	}
}
