import { FETCHED_JOB, FETCHED_JOBS } from '../sagas/event';

export function JobInfoReducer(state = { TaskGroups: [] }, action) {
    switch (action.type) {
        case FETCHED_JOB:
            let job = action.payload;
            job.TaskGroups.forEach(g => {
                g.ID = job.ID + '.' + g.Name
            });
            job.TaskGroups.forEach(g => {
                g.Tasks.forEach(t => {
                    t.ID = g.ID + '.' + t.Name
                })
            });
            return job;
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
