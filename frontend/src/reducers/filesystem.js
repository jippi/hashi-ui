import { FETCHED_DIR, FETCHED_FILE, UNWATCHED_FILE, CLEAR_RECEIVED_FILE_DATA } from '../sagas/event';

export function DirectoryReducer(state = [], action) {
    switch (action.type) {
    case FETCHED_DIR:
        return action.payload;
    default:
    }
    return state;
}

export function FileReducer(state = { File: '<please select a file>' }, action) {
    switch (action.type) {
    case UNWATCHED_FILE:
        if (state.File === action.payload.File) {
            return Object.assign({}, state, { File: '<please select a file>', Data: '' });
        }
        break;
    case CLEAR_RECEIVED_FILE_DATA:
        if (state.File === action.payload.File) {
            return Object.assign({}, state, { Data: '' });
        }
        break;
    case FETCHED_FILE:
        return action.payload;
    default:
    }
    return state;
}
