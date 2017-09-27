import { NOMAD_FETCHED_NODES, NOMAD_FETCHED_NODE, NOMAD_FETCHED_CLIENT_STATS, NOMAD_UNWATCH_NODE } from "../sagas/event"
import { calculateNodeStats } from "./utils"

export function NodeStatsReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_CLIENT_STATS:
      state = calculateNodeStats(state, action.payload, 60)

      state.Uptime = action.payload.Uptime
      state.HostDiskStats = action.payload.HostDiskStats

      return Object.assign({}, state)
    default:
  }
  return state
}

export function NodeInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_NODE:
      return action.payload
    case NOMAD_UNWATCH_NODE:
      return {}
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
