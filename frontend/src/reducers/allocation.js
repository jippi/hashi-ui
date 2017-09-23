import {
  NOMAD_FETCHED_ALLOC,
  NOMAD_FETCHED_ALLOCATION_HEALTH,
  NOMAD_FETCHED_ALLOCS,
  NOMAD_UNWATCH_ALLOC,
  NOMAD_UNWATCH_ALLOCATION_HEALTH
} from "../sagas/event"

export function AllocInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_UNWATCH_ALLOC:
      return {}
    case NOMAD_FETCHED_ALLOC: {
      const allocation = action.payload
      allocation.TaskGroupId = `${allocation.JobID}.${allocation.TaskGroup}`
      return allocation
    }
    default:
  }

  return state
}

export function AllocListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_ALLOCS: {
      const allocations = action.payload.map(allocation =>
        Object.assign({}, allocation, {
          TaskGroupId: `${allocation.JobID}.${allocation.TaskGroup}`
        })
      )

      return allocations
    }
    default:
  }

  return state
}
export function AllocHealthReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_ALLOCATION_HEALTH: {
      state[action.payload.ID] = action.payload
      return state
    }

    case NOMAD_UNWATCH_ALLOCATION_HEALTH: {
      delete state[action.payload.id]
      return state
    }

    default:
  }

  return state
}
