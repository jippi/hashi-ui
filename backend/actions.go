package main

const (
	fetchedAllocs = "FETCHED_ALLOCS"
	fetchedAlloc  = "FETCHED_ALLOC"
	watchAlloc    = "WATCH_ALLOC"
	unwatchAlloc  = "UNWATCH_ALLOC"

	fetchedEvals = "FETCHED_EVALS"
	fetchedEval  = "FETCHED_EVAL"
	watchEval    = "WATCH_EVAL"
	unwatchEval  = "UNWATCH_EVAL"

	fetchedJobs = "FETCHED_JOBS"
	fetchedJob  = "FETCHED_JOB"
	watchJob    = "WATCH_JOB"
	unwatchJob  = "UNWATCH_JOB"

	fetchedNodes = "FETCHED_NODES"
	fetchedNode  = "FETCHED_NODE"
	fetchNode    = "FETCH_NODE"
	watchNode    = "WATCH_NODE"
	unwatchNode  = "UNWATCH_NODE"

	fetchedMembers = "FETCHED_MEMBERS"
	fetchedMember  = "FETCHED_MEMBER"
	fetchMember    = "FETCH_MEMBER"
	watchMember    = "WATCH_MEMBER"
	unwatchMember  = "UNWATCH_MEMBER"

	fetchDir    = "FETCH_DIR"
	fetchedDir  = "FETCHED_DIR"
	watchFile   = "WATCH_FILE"
	unwatchFile = "UNWATCH_FILE"
	fetchedFile = "FETCHED_FILE"
)

// Action represents a Redux action that is dispatched or received from the store
// via a websocket connection.
type Action struct {
	Type    string
	Payload interface{}
}
