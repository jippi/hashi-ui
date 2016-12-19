package main

const (
	watchAllocs          = "WATCH_ALLOCS"
	watchAllocsShallow   = "WATCH_ALLOCS_SHALLOW"
	unwatchAllocs        = "UNWATCH_ALLOCS"
	unwatchAllocsShallow = "UNWATCH_ALLOCS_SHALLOW"
	fetchedAllocs        = "FETCHED_ALLOCS"

	fetchClientStats   = "FETCH_CLIENT_STATS"
	fetchedClientStats = "FETCHED_CLIENT_STATS"
	watchClientStats   = "WATCH_CLIENT_STATS"
	unwatchClientStats = "UNWATCH_CLIENT_STATS"

	fetchedAlloc = "FETCHED_ALLOC"
	watchAlloc   = "WATCH_ALLOC"
	unwatchAlloc = "UNWATCH_ALLOC"

	watchEvals   = "WATCH_EVALS"
	unwatchEvals = "UNWATCH_EVALS"
	fetchedEvals = "FETCHED_EVALS"

	fetchedEval = "FETCHED_EVAL"
	watchEval   = "WATCH_EVAL"
	unwatchEval = "UNWATCH_EVAL"

	watchJobs   = "WATCH_JOBS"
	unwatchJobs = "UNWATCH_JOBS"
	fetchedJobs = "FETCHED_JOBS"

	fetchedJob = "FETCHED_JOB"
	watchJob   = "WATCH_JOB"
	unwatchJob = "UNWATCH_JOB"

	watchNodes   = "WATCH_NODES"
	unwatchNodes = "UNWATCH_NODES"
	fetchedNodes = "FETCHED_NODES"

	fetchedNode = "FETCHED_NODE"
	fetchNode   = "FETCH_NODE"
	watchNode   = "WATCH_NODE"
	unwatchNode = "UNWATCH_NODE"

	watchMembers   = "WATCH_MEMBERS"
	unwatchMembers = "UNWATCH_MEMBERS"
	fetchedMembers = "FETCHED_MEMBERS"

	fetchedMember = "FETCHED_MEMBER"
	fetchMember   = "FETCH_MEMBER"
	watchMember   = "WATCH_MEMBER"
	unwatchMember = "UNWATCH_MEMBER"

	fetchDir         = "FETCH_DIR"
	fetchedDir       = "FETCHED_DIR"
	watchFile        = "WATCH_FILE"
	unwatchFile      = "UNWATCH_FILE"
	fetchedFile      = "FETCHED_FILE"
	fileStreamFailed = "FILE_STREAM_FAILED"

	watchClusterStatistics   = "WATCH_CLUSTER_STATISTICS"
	fetchedClusterStatistics = "FETCHED_CLUSTER_STATISTICS"
	unwatchClusterStatistics = "UNWATCH_CLUSTER_STATISTICS"

	changeTaskGroupCount = "CHANGE_TASK_GROUP_COUNT"
	submitJob            = "SUBMIT_JOB"
	stopJob              = "STOP_JOB"

	errorNotification   = "ERROR_NOTIFICATION"
	successNotification = "SUCCESS_NOTIFICATION"
)

// Action represents a Redux action that is dispatched or received from the store
// via a websocket connection.
type Action struct {
	Type    string
	Index   uint64
	Payload interface{}
}
