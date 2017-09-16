package query

import "github.com/hashicorp/nomad/api"

// queryChanged will return wether the query changed, comparing the WaitIndex vs LastIndex
// If the query has changed, the QueryMeta is updated with the new WaitIndex value of LastIndex,
// in preparation for the new usage in the long polling API
func Changed(q *api.QueryOptions, meta *api.QueryMeta) bool {
	if meta.LastIndex <= q.WaitIndex {
		return false
	}

	q.WaitIndex = meta.LastIndex
	return true
}

func Default(allowStale bool) *api.QueryOptions {
	return &api.QueryOptions{WaitIndex: 1, AllowStale: allowStale}
}
