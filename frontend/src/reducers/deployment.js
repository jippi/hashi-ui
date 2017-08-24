import {
  NOMAD_FETCHED_DEPLOYMENT,
  NOMAD_FETCHED_DEPLOYMENTS,
  NOMAD_FETCHED_DEPLOYMENT_ALLOCATIONS,
  NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS,
  NOMAD_UNWATCH_DEPLOYMENT,
  NOMAD_UNWATCH_DEPLOYMENTS,
  NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS,
  NOMAD_WATCH_DEPLOYMENT
} from "../sagas/event"

export function DeploymentInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_UNWATCH_DEPLOYMENT:
      return {}
    case NOMAD_FETCHED_DEPLOYMENT: {
      return action.payload
    }
    default:
  }

  return state
}

export function DeploymentListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_DEPLOYMENTS:
      return action.payload
    default:
  }
  return state
}

export function DeploymentAllocsReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS:
      return []
    case NOMAD_FETCHED_DEPLOYMENT_ALLOCATIONS:
      return action.payload
    default:
  }
  return state
}
