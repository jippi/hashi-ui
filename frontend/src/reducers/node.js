import { NOMAD_FETCHED_NODES, NOMAD_FETCHED_NODE, NOMAD_FETCHED_CLIENT_STATS } from "../sagas/event"

export function NodeStatsReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_CLIENT_STATS:
      return action.payload
    default:
  }

  return state
}

export function NodeInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_NODE:
      return action.payload
    default:
  }
  return state
}

export function NodeListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_NODES:
      return action.payload
    default:
  }
  return state
}
