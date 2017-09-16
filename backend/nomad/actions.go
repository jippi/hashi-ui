package nomad

const (
	watchMembers   = "NOMAD_WATCH_MEMBERS"
	unwatchMembers = "NOMAD_UNWATCH_MEMBERS"
	fetchedMembers = "NOMAD_FETCHED_MEMBERS"

	fetchClientStats   = "NOMAD_FETCH_CLIENT_STATS"
	fetchedClientStats = "NOMAD_FETCHED_CLIENT_STATS"
	watchClientStats   = "NOMAD_WATCH_CLIENT_STATS"
	unwatchClientStats = "NOMAD_UNWATCH_CLIENT_STATS"

	fetchNomadRegions   = "NOMAD_FETCH_REGIONS"
	fetchedNomadRegions = "NOMAD_FETCHED_REGIONS"
	unknownNomadRegion  = "NOMAD_UNKNOWN_REGION"

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

	submitJob = "NOMAD_SUBMIT_JOB"
	stopJob   = "NOMAD_STOP_JOB"

	forcePeriodicRun = "NOMAD_FORCE_PERIODIC_RUN"

	changeDeploymentStatus = "NOMAD_CHANGE_DEPLOYMENT_STATUS"

	drainClient  = "NOMAD_DRAIN_CLIENT"
	removeClient = "NOMAD_REMOVE_CLIENT"

	forceGC         = "NOMAD_FORCE_GC"
	reconcileSystem = "NOMAD_RECONCILE_SYSTEM"

	evaluateAllJobs = "NOMAD_EVALUATE_ALL_JOBS"
)
