import {
  APP_CLEAR_ERROR_NOTIFICATION,
  APP_CLEAR_SUCCESS_NOTIFICATION,
  APP_DRAWER_CLOSE,
  APP_DRAWER_OPEN,
  APP_ERROR_NOTIFICATION,
  APP_ERROR,
  APP_SUCCESS_NOTIFICATION,
  NOMAD_FETCHED_CLUSTER_STATISTICS
} from "../sagas/event"

export function ClusterStatisticsReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_CLUSTER_STATISTICS:
      return action.payload
    default:
  }
  return state
}

export function ErrorNotificationReducer(state = {}, action) {
  switch (action.type) {
    case APP_CLEAR_ERROR_NOTIFICATION:
      return {}
    case APP_ERROR_NOTIFICATION:
      return {
        message: action.payload,
        index: action.index
      }
  }
  return state
}

export function SuccessNotificationReducer(state = {}, action) {
  switch (action.type) {
    case APP_CLEAR_SUCCESS_NOTIFICATION:
      return {}
    case APP_SUCCESS_NOTIFICATION:
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
