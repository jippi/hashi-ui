import { APP_ERROR, ERROR_NOTIFICATION, SUCCESS_NOTIFICATION, FETCHED_CLUSTER_STATISTICS } from '../sagas/event'

export function ClusterStatisticsReducer (state = {}, action) {
  switch (action.type) {
  case FETCHED_CLUSTER_STATISTICS:
    return action.payload
  default:
  }
  return state
}

export function ErrorNotificationReducer (state = {}, action) {
  switch (action.type) {
  case ERROR_NOTIFICATION:
    return { message: action.payload, index: action.index }
  }
  return state
}

export function SuccessNotificationReducer (state = {}, action) {
  switch (action.type) {
  case SUCCESS_NOTIFICATION:
    return { message: action.payload, index: action.index }
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
