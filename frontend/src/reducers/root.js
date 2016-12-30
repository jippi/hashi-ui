import { combineReducers } from 'redux'

import {
  AppDrawer,
  AppErrorReducer,
  ClusterStatisticsReducer,
  ErrorNotificationReducer,
  SuccessNotificationReducer
} from './app'
import { MemberInfoReducer, MemberListReducer } from './member'
import { JobInfoReducer, JobListReducer, JobDialogReducer } from './job'
import { AllocInfoReducer, AllocListReducer } from './allocation'
import { EvalInfoReducer, EvalListReducer } from './evaluation'
import { NodeInfoReducer, NodeStatsReducer, NodeListReducer } from './node'
import { DirectoryReducer, FileReducer } from './filesystem'
import { ChangeNomadRegionReducer , NomadRegionsReducer } from './nomad'
import { ChangeConsulRegionReducer , ConsulRegionsReducer, ConsulServiceList, ConsulService } from './consul'

const rootReducer = combineReducers({
  appDrawer: AppDrawer,
  allocation: AllocInfoReducer,
  allocations: AllocListReducer,
  appError: AppErrorReducer,
  changeConsulRegion: ChangeConsulRegionReducer,
  changeNomadRegion: ChangeNomadRegionReducer,
  clusterStatistics: ClusterStatisticsReducer,
  consulRegions: ConsulRegionsReducer,
  consulServices: ConsulServiceList,
  consulService: ConsulService,
  directory: DirectoryReducer,
  errorNotification: ErrorNotificationReducer,
  evaluation: EvalInfoReducer,
  evaluations: EvalListReducer,
  file: FileReducer,
  job: JobInfoReducer,
  jobDialog: JobDialogReducer,
  jobs: JobListReducer,
  member: MemberInfoReducer,
  members: MemberListReducer,
  node: NodeInfoReducer,
  nodes: NodeListReducer,
  nodeStats: NodeStatsReducer,
  nomadRegions: NomadRegionsReducer,
  successNotification: SuccessNotificationReducer,
})

export default rootReducer
