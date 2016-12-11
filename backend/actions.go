package main

const (
	watchAllocs          = "WATCH_ALLOCS"
	watchAllocsShallow   = "WATCH_ALLOCS_SHALLOW"
	unwatchAllocs        = "UNWATCH_ALLOCS"
	unwatchAllocsShallow = "UNWATCH_ALLOCS_SHALLOW"
	fetchedAllocs        = "FETCHED_ALLOCS"

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
	unwatchedFile    = "UNWATCHED_FILE"
	fetchedFile      = "FETCHED_FILE"
	fileStreamFailed = "FILE_STREAM_FAILED"
)

// Action represents a Redux action that is dispatched or received from the store
// via a websocket connection.
type Action struct {
	Type    string
	Index   uint64
	Payload interface{}
}
