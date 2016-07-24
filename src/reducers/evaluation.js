import { FETCH_EVALS_FAILED, FETCHED_EVALS, FETCHED_EVAL, FETCH_EVAL_FAILED } from '../sagas/evaluation';

export function EvalInfoReducer(state = {}, action) {
    switch (action.type) {
        case FETCHED_EVAL:
            return action.payload
        case FETCH_EVAL_FAILED:
            return {
                ID: action.id
            }
        default:
    }
    return state
}

export function EvalListReducer(state = [], action) {
    switch (action.type) {
        case FETCHED_EVALS:
            return action.payload
        case FETCH_EVALS_FAILED:
            return []
        default:
    }
    return state
}
