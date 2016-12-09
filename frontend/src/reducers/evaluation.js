import { FETCHED_EVALS, FETCHED_EVAL } from '../sagas/event'

export function EvalInfoReducer (state = {}, action) {
  switch (action.type) {
  case FETCHED_EVAL:
    return action.payload
  default:
  }
  return state
}

export function EvalListReducer (state = [], action) {
  switch (action.type) {
  case FETCHED_EVALS:
    return action.payload
  default:
  }
  return state
}
