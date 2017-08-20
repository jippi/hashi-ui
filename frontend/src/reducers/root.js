import { combineReducers } from "redux"

import {
  AppDrawer,
  AppErrorReducer,
  ClusterStatisticsReducer,
  ErrorNotificationReducer,
  SuccessNotificationReducer
} from "./app"
import { MemberInfoReducer, MemberListReducer } from "./member"
import { JobInfoReducer, JobListReducer, JobDeploymentsReducer, JobDialogReducer } from "./job"
import { AllocInfoReducer, AllocListReducer } from "./allocation"
import { EvalInfoReducer, EvalListReducer } from "./evaluation"
import { DeploymentListReducer, DeploymentInfoReducer } from "./deployment"
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
  deployments: DeploymentListReducer,
  deployment: DeploymentInfoReducer,
  directory: DirectoryReducer,
  errorNotification: ErrorNotificationReducer,
  evaluation: EvalInfoReducer,
  evaluations: EvalListReducer,
  file: FileReducer,
  job: JobInfoReducer,
  jobDeployments: JobDeploymentsReducer,
  jobDialog: JobDialogReducer,
  jobs: JobListReducer,
  member: MemberInfoReducer,
  members: MemberListReducer,
  node: NodeInfoReducer,
  nodes: NodeListReducer,
  nodeStats: NodeStatsReducer,
  nomadRegions: NomadRegionsReducer,
  successNotification: SuccessNotificationReducer
})

export default rootReducer
