import { FETCH_ALLOCS_FAILED, FETCHED_ALLOCS, FETCHED_ALLOC, FETCH_ALLOC_FAILED } from '../sagas/allocation';

export function AllocInfoReducer(state = {}, action) {
    switch (action.type) {
        case FETCHED_ALLOC:
            return action.payload
        case FETCH_ALLOC_FAILED:
            return {
                ID: action.id
            }
        default:
    }
    return state
}

export function AllocListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_ALLOCS:
            return action.payload
        case FETCH_ALLOCS_FAILED:
            return []
        default:
    }
    return state
}
