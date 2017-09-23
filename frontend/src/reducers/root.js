import { combineReducers } from "redux"

import {
  AppDrawer,
  AppErrorReducer,
  ClusterStatisticsReducer,
  ErrorNotificationReducer,
  SuccessNotificationReducer
} from "./app"
import { MemberInfoReducer, MemberListReducer } from "./member"
import {
  JobInfoReducer,
  JobListReducer,
  JobDeploymentsReducer,
  jobAllocationsReducer,
  JobVersionsReducer,
  JobDialogReducer,
  FilteredJobsReducer
} from "./job"
import { AllocInfoReducer, AllocListReducer, AllocHealthReducer } from "./allocation"
import { EvalInfoReducer, EvalListReducer } from "./evaluation"
import { DeploymentListReducer, DeploymentInfoReducer, DeploymentAllocsReducer } from "./deployment"
import { NodeInfoReducer, NodeStatsReducer, NodeListReducer } from "./node"
import { DirectoryReducer, FileReducer } from "./filesystem"
import { ChangeNomadRegionReducer, NomadRegionsReducer } from "./nomad"
import {
  ConsulServiceList,
  ConsulService,
  ConsulRegionsReducer,
  ConsulNodes,
  ConsulNode,
  ConsulKVPath,
  ConsulKVPair,
  ChangeConsulRegionReducer
} from "./consul"

const rootReducer = combineReducers({
  allocation: AllocInfoReducer,
  allocationHealth: AllocHealthReducer,
  allocations: AllocListReducer,
  appDrawer: AppDrawer,
  appError: AppErrorReducer,
  changeConsulRegion: ChangeConsulRegionReducer,
  changeNomadRegion: ChangeNomadRegionReducer,
  clusterStatistics: ClusterStatisticsReducer,
  consulKVPair: ConsulKVPair,
  consulKVPaths: ConsulKVPath,
  consulNode: ConsulNode,
  consulNodes: ConsulNodes,
  consulRegions: ConsulRegionsReducer,
  consulService: ConsulService,
  consulServices: ConsulServiceList,
  deployment: DeploymentInfoReducer,
  deploymentAllocations: DeploymentAllocsReducer,
  deployments: DeploymentListReducer,
  directory: DirectoryReducer,
  errorNotification: ErrorNotificationReducer,
  evaluation: EvalInfoReducer,
  evaluations: EvalListReducer,
  file: FileReducer,
  filteredJobs: FilteredJobsReducer,
  job: JobInfoReducer,
  jobAllocations: jobAllocationsReducer,
  jobDeployments: JobDeploymentsReducer,
  jobDialog: JobDialogReducer,
  jobs: JobListReducer,
  jobVersions: JobVersionsReducer,
  member: MemberInfoReducer,
  members: MemberListReducer,
  node: NodeInfoReducer,
  nodes: NodeListReducer,
  nodeStats: NodeStatsReducer,
  nomadRegions: NomadRegionsReducer,
  successNotification: SuccessNotificationReducer
})

export default rootReducer
