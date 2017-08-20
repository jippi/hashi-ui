import {
  NOMAD_FETCHED_DEPLOYMENTS,
  NOMAD_FETCHED_DEPLOYMENT,
  NOMAD_UNWATCH_DEPLOYMENTS,
  NOMAD_WATCH_DEPLOYMENT,
  NOMAD_UNWATCH_DEPLOYMENT
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
