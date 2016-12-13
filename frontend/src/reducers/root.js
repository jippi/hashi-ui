import { combineReducers } from 'redux'

import { AppErrorReducer, ClusterStatisticsReducer } from './app'
import { MemberInfoReducer, MemberListReducer } from './member'
import { JobInfoReducer, JobListReducer } from './job'
import { AllocInfoReducer, AllocListReducer } from './allocation'
import { EvalInfoReducer, EvalListReducer } from './evaluation'
import { NodeInfoReducer, NodeStatsReducer, NodeListReducer } from './node'
import { DirectoryReducer, FileReducer } from './filesystem'

const rootReducer = combineReducers({
  appError: AppErrorReducer,
  clusterStatistics: ClusterStatisticsReducer,
  member: MemberInfoReducer,
  members: MemberListReducer,
  job: JobInfoReducer,
  jobs: JobListReducer,
  node: NodeInfoReducer,
  nodeStats: NodeStatsReducer,
  nodes: NodeListReducer,
  allocation: AllocInfoReducer,
  allocations: AllocListReducer,
  evaluation: EvalInfoReducer,
  evaluations: EvalListReducer,
  directory: DirectoryReducer,
  file: FileReducer
})

export default rootReducer
