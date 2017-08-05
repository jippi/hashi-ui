import { NOMAD_FETCHED_EVALS, NOMAD_FETCHED_EVAL } from "../sagas/event"

export function EvalInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_EVAL:
      return action.payload
    default:
  }
  return state
}

export function EvalListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_EVALS:
      return action.payload
    default:
  }
  return state
}
