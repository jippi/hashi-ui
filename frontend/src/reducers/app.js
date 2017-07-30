import {
  APP_ERROR,
  ERROR_NOTIFICATION,
  CLEAR_ERROR_NOTIFICATION,
  SUCCESS_NOTIFICATION,
  CLEAR_SUCCESS_NOTIFICATION,
  FETCHED_CLUSTER_STATISTICS,
  APP_DRAWER_OPEN,
  APP_DRAWER_CLOSE
} from "../sagas/event"

export function ClusterStatisticsReducer(state = {}, action) {
  switch (action.type) {
    case FETCHED_CLUSTER_STATISTICS:
      return action.payload
    default:
  }
  return state
}

export function ErrorNotificationReducer(state = {}, action) {
  switch (action.type) {
    case CLEAR_ERROR_NOTIFICATION:
      return {}
    case ERROR_NOTIFICATION:
      return {
        message: action.payload,
        index: action.index
      }
  }
  return state
}

export function SuccessNotificationReducer(state = {}, action) {
  switch (action.type) {
    case CLEAR_SUCCESS_NOTIFICATION:
      return ""
    case SUCCESS_NOTIFICATION:
      return {
        message: action.payload,
        index: action.index
      }
  }
  return state
}

export function AppErrorReducer(state = {}, action) {
  switch (action.type) {
    case APP_ERROR:
      return action.payload
    default:
  }
  return state
}

export function AppDrawer(state = false, action) {
  switch (action.type) {
    case APP_DRAWER_OPEN:
      return true
    case APP_DRAWER_CLOSE:
      return false
    default:
      return state
  }
}
