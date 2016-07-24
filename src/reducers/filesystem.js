import { FETCHED_DIR, FETCH_DIR_FAILED, FETCHED_FILE, FETCH_FILE_FAILED } from '../sagas/filesystem';

export function DirectoryReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_DIR:
            return action.payload
        case FETCH_DIR_FAILED:
            return []
        default:
    }
    return state
}

export function FileReducer(state = {path: "<please select a file>", text: ""} , action) {
    switch (action.type) {
        case FETCHED_FILE:
            return action.payload
        case FETCH_FILE_FAILED:
            return {path: "<please select a file>", text: ""}
        default:
    }
    return state
}
