import { FETCH_NODES_FAILED, FETCHED_NODES, FETCHED_NODE, FETCH_NODE_FAILED } from '../sagas/node';

export function NodeInfoReducer(state = {}, action) {
    switch (action.type) {
        case FETCHED_NODE:
            return action.payload
        case FETCH_NODE_FAILED:
            return {
                ID: action.id
            }
        default:
    }
    return state
}

export function NodeListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_NODES:
            return action.payload
        case FETCH_NODES_FAILED:
            return []
        default:
    }
    return state
}
