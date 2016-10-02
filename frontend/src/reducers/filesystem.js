import { FETCHED_DIR, FETCHED_FILE } from '../sagas/event';

export function DirectoryReducer(state = [], action) {
    switch (action.type) {
    case FETCHED_DIR:
        return action.payload;
    default:
    }
    return state;
}

export function FileReducer(state = { path: '<please select a file>', text: '' }, action) {
    switch (action.type) {
    case FETCHED_FILE:
        return action.payload;
    default:
    }
    return state;
}
