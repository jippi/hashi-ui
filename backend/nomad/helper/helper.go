package helper

import (
	"time"

	"github.com/hashicorp/nomad/api"
	"github.com/jippi/hashi-ui/backend/config"
)

// NewRegionClient ...
func NewRegionClient(c *config.Config, region string) (*api.Client, error) {
	config := api.DefaultConfig()
	config.Address = c.NomadAddress
	config.SecretID = c.NomadACLToken
	config.Namespace = c.NomadNamespace
	config.WaitTime = 1 * time.Minute
	config.Region = region
	config.TLSConfig = &api.TLSConfig{
		CACert:     c.NomadCACert,
		ClientCert: c.NomadClientCert,
		ClientKey:  c.NomadClientKey,
		Insecure:   c.NomadSkipVerify,
	}

	return api.NewClient(config)
}

// QueryChanged will return wether the query changed, comparing the WaitIndex vs LastIndex
// If the query has changed, the QueryMeta is updated with the new WaitIndex value of LastIndex,
// in preparation for the new usage in the long polling API
func QueryChanged(q *api.QueryOptions, meta *api.QueryMeta) bool {
	// hack for a cluster with 0 state changes
	// this will cause hashi-ui to not enter blocking wait against the API, possible
	// due to how nomad handles "0" as empty state rather than a real wait index
	if meta.LastIndex == 0 {
		q.WaitIndex = 1
	}

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
