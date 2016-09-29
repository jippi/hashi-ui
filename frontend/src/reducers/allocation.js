import { FETCHED_ALLOCS, FETCHED_ALLOC } from '../sagas/event';

export function AllocInfoReducer(state = {}, action) {
    switch (action.type) {
        case FETCHED_ALLOC:
            let allocation = action.payload;
            allocation.TaskGroupId = allocation.JobID + '.' + allocation.TaskGroup
            return allocation;
        default:
    }

    return state
}

export function AllocListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_ALLOCS:
            return action.payload
        default:
    }
    return state
}
