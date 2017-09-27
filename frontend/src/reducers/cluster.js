import { NOMAD_FETCHED_CLUSTER_STATISTICS } from "../sagas/event"
import { calculateNodeStats } from "./utils"

export function ClusterStatisticsReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_CLUSTER_STATISTICS:
      state = calculateNodeStats(state, action.payload, 60)
      return Object.assign({}, state)
    default:
  }
  return state
}
