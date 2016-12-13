import { APP_ERROR, FETCHED_CLUSTER_STATISTICS } from '../sagas/event'

export function ClusterStatisticsReducer (state = {}, action) {
  switch (action.type) {
  case FETCHED_CLUSTER_STATISTICS:
    return action.payload
  default:
  }
  return state
}

export function AppErrorReducer (state = {}, action) {
  switch (action.type) {
  case APP_ERROR:
    return action.payload
  default:
  }
  return state
}
