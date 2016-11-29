import { FETCHED_JOB, FETCHED_JOBS, RUN_JOB, EDIT_TASK } from '../sagas/event';

export function JobInfoReducer(state = { TaskGroups: [] }, action) {
    switch (action.type) {
    case FETCHED_JOB: {
        const job = action.payload;
        job.TaskGroups.forEach((group, gidx) => {
            job.TaskGroups[gidx].ID = `${job.ID}.${group.Name}`;
        });
        job.TaskGroups.forEach((group, gidx) => {
            group.Tasks.forEach((task, tidx) => {
                job.TaskGroups[gidx].Tasks[tidx].ID = `${group.ID}.${task.Name}`;
            });
        });
        return job;
    }
    default:
    }

    return state;
}

export function JobListReducer(state = [], action) {
    switch (action.type) {
    case FETCHED_JOBS:
        return action.payload;
    default:
    }
    return state;
}

export function JobRunReducer(state = [], action) {
    switch (action.type) {
    case RUN_JOB:
        return action.payload;
    default:
    }
    return state;
}

export function TaskEditReducer(state = null, action) {
    switch (action.type) {
    case EDIT_TASK:
        return action.payload;
    default:
    }
    return state;
}
