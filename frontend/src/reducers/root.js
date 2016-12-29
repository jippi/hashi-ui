import { combineReducers } from 'redux'

import { AppErrorReducer, ClusterStatisticsReducer, ErrorNotificationReducer, SuccessNotificationReducer } from './app'
import { MemberInfoReducer, MemberListReducer } from './member'
import { JobInfoReducer, JobListReducer, JobDialogReducer } from './job'
import { AllocInfoReducer, AllocListReducer } from './allocation'
import { EvalInfoReducer, EvalListReducer } from './evaluation'
import { NodeInfoReducer, NodeStatsReducer, NodeListReducer } from './node'
import { DirectoryReducer, FileReducer } from './filesystem'
import { ChangeNomadRegionReducer , NomadRegionsReducer } from './nomad'

const rootReducer = combineReducers({
  allocation: AllocInfoReducer,
  allocations: AllocListReducer,
  appError: AppErrorReducer,
  clusterStatistics: ClusterStatisticsReducer,
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
  nodeStats: NodeStatsReducer,
  nodes: NodeListReducer,
  successNotification: SuccessNotificationReducer,
  changeNomadRegion: ChangeNomadRegionReducer,
  nomadRegions: NomadRegionsReducer,
})

export default rootReducer
