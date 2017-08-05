import { NOMAD_FETCHED_MEMBERS, NOMAD_FETCHED_MEMBER, NOMAD_UNWATCH_MEMBER } from "../sagas/event"

export function MemberInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_MEMBER:
      return action.payload
    case NOMAD_UNWATCH_MEMBER:
      return {}
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
