import { FETCHED_JOB, FETCHED_JOBS } from '../sagas/event';

export function JobInfoReducer(state = { TaskGroups: [] }, action) {
    switch (action.type) {
        case FETCHED_JOB:
            return action.payload
        default:
    }
    return state
}

export function JobListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_JOBS:
            return action.payload
        default:
    }
    return state
}
