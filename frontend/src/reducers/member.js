import { NOMAD_FETCHED_MEMBERS, NOMAD_FETCHED_MEMBER } from "../sagas/event"

export function MemberInfoReducer(state = { Tags: {} }, action) {
  switch (action.type) {
    case NOMAD_FETCHED_MEMBER:
      return action.payload
    default:
  }
  return state
}

export function MemberListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_MEMBERS:
      return action.payload
    default:
  }
  return state
}
