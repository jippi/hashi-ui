import { FETCH_JOBS_FAILED, FETCHED_JOB, FETCH_JOB_FAILED, FETCHED_JOBS } from '../sagas/job';

export function JobInfoReducer(state = { TaskGroups: [] }, action) {
    switch (action.type) {
        case FETCHED_JOB:
            return action.payload
        case FETCH_JOB_FAILED:
            return {
                ID: action.id
            }
        default:
    }
    return state
}

export function JobListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_JOBS:
            return action.payload
        case FETCH_JOBS_FAILED:
            return []
        default:
    }
    return state
}
