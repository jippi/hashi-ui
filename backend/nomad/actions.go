package nomad

const (
	watchAllocs          = "NOMAD_WATCH_ALLOCS"
	watchAllocsShallow   = "NOMAD_WATCH_ALLOCS_SHALLOW"
	unwatchAllocs        = "NOMAD_UNWATCH_ALLOCS"
	unwatchAllocsShallow = "NOMAD_UNWATCH_ALLOCS_SHALLOW"
	fetchedAllocs        = "NOMAD_FETCHED_ALLOCS"

	watchDeployments   = "NOMAD_WATCH_DEPLOYMENTS"
	unwatchDeployments = "NOMAD_UNWATCH_DEPLOYMENTS"
	fetchedDeployments = "NOMAD_FETCHED_DEPLOYMENTS"

	watchJobDeployments   = "NOMAD_WATCH_JOB_DEPLOYMENTS"
	unwatchJobDeployments = "NOMAD_UNWATCH_JOB_DEPLOYMENTS"
	fetchedJobDeployments = "NOMAD_FETCHED_JOB_DEPLOYMENTS"

	watchJobVersions   = "NOMAD_WATCH_JOB_VERSIONS"
	unwatchJobVersions = "NOMAD_UNWATCH_JOB_VERSIONS"
	fetchedJobVersions = "NOMAD_FETCHED_JOB_VERSIONS"

	watchDeployment   = "NOMAD_WATCH_DEPLOYMENT"
	unwatchDeployment = "NOMAD_UNWATCH_DEPLOYMENT"
	fetchedDeployment = "NOMAD_FETCHED_DEPLOYMENT"

	watchDeploymentAllocs   = "NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS"
	unwatchDeploymentAllocs = "NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS"
	fetchedDeploymentAllocs = "NOMAD_FETCHED_DEPLOYMENT_ALLOCATIONS"

	fetchClientStats   = "NOMAD_FETCH_CLIENT_STATS"
	fetchedClientStats = "NOMAD_FETCHED_CLIENT_STATS"
	watchClientStats   = "NOMAD_WATCH_CLIENT_STATS"
	unwatchClientStats = "NOMAD_UNWATCH_CLIENT_STATS"

	fetchedAlloc = "NOMAD_FETCHED_ALLOC"
	watchAlloc   = "NOMAD_WATCH_ALLOC"
	unwatchAlloc = "NOMAD_UNWATCH_ALLOC"

	watchEvals   = "NOMAD_WATCH_EVALS"
	unwatchEvals = "NOMAD_UNWATCH_EVALS"
	fetchedEvals = "NOMAD_FETCHED_EVALS"

	fetchedEval = "NOMAD_FETCHED_EVAL"
	watchEval   = "NOMAD_WATCH_EVAL"
	unwatchEval = "NOMAD_UNWATCH_EVAL"

	watchJobs   = "NOMAD_WATCH_JOBS"
	unwatchJobs = "NOMAD_UNWATCH_JOBS"
	fetchedJobs = "NOMAD_FETCHED_JOBS"

	watchJobsFiltered   = "NOMAD_WATCH_JOBS_FILTERED"
	unwatchJobsFiltered = "NOMAD_UNWATCH_JOBS_FILTERED"
	fetchedJobsFiltered = "NOMAD_FETCHED_JOBS_FILTERED"

	fetchedJob = "NOMAD_FETCHED_JOB"
	watchJob   = "NOMAD_WATCH_JOB"
	unwatchJob = "NOMAD_UNWATCH_JOB"

	watchNodes   = "NOMAD_WATCH_NODES"
	unwatchNodes = "NOMAD_UNWATCH_NODES"
	fetchedNodes = "NOMAD_FETCHED_NODES"

	fetchedNode = "NOMAD_FETCHED_NODE"
	fetchNode   = "NOMAD_FETCH_NODE"
	watchNode   = "NOMAD_WATCH_NODE"
	unwatchNode = "NOMAD_UNWATCH_NODE"

	fetchNomadRegions   = "NOMAD_FETCH_REGIONS"
	fetchedNomadRegions = "NOMAD_FETCHED_REGIONS"
	unknownNomadRegion  = "NOMAD_UNKNOWN_REGION"

	watchMembers   = "NOMAD_WATCH_MEMBERS"
	unwatchMembers = "NOMAD_UNWATCH_MEMBERS"
	fetchedMembers = "NOMAD_FETCHED_MEMBERS"

	fetchedMember = "NOMAD_FETCHED_MEMBER"
	fetchMember   = "NOMAD_FETCH_MEMBER"
	watchMember   = "NOMAD_WATCH_MEMBER"
	unwatchMember = "NOMAD_UNWATCH_MEMBER"

	fetchDir         = "NOMAD_FETCH_DIR"
	fetchedDir       = "NOMAD_FETCHED_DIR"
	watchFile        = "NOMAD_WATCH_FILE"
	unwatchFile      = "NOMAD_UNWATCH_FILE"
	fetchedFile      = "NOMAD_FETCHED_FILE"
	fileStreamFailed = "NOMAD_FILE_STREAM_FAILED"

	watchClusterStatistics   = "NOMAD_WATCH_CLUSTER_STATISTICS"
	fetchedClusterStatistics = "NOMAD_FETCHED_CLUSTER_STATISTICS"
	unwatchClusterStatistics = "NOMAD_UNWATCH_CLUSTER_STATISTICS"

	changeTaskGroupCount = "NOMAD_CHANGE_TASK_GROUP_COUNT"
	submitJob            = "NOMAD_SUBMIT_JOB"
	stopJob              = "NOMAD_STOP_JOB"

	evaluateJob      = "NOMAD_EVALUATE_JOB"
	forcePeriodicRun = "NOMAD_FORCE_PERIODIC_RUN"

	changeDeploymentStatus = "NOMAD_CHANGE_DEPLOYMENT_STATUS"

	drainClient  = "NOMAD_DRAIN_CLIENT"
	removeClient = "NOMAD_REMOVE_CLIENT"

	forceGC         = "NOMAD_FORCE_GC"
	reconcileSystem = "NOMAD_RECONCILE_SYSTEM"
)
