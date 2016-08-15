import { FETCHED_MEMBERS, FETCHED_MEMBER } from '../sagas/event';

export function MemberInfoReducer(state = {}, action) {
    switch (action.type) {
        case FETCHED_MEMBER:
            return action.payload
        default:
    }
    return state
}

export function MemberListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_MEMBERS:
            return action.payload
        default:
    }
    return state
}
