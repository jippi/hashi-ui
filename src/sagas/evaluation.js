import superagent from 'superagent'
import { take, put, call, cancel, cancelled, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { NOMAD_API } from './root'

export const FETCH_EVALS_FAILED = 'FETCH_EVALS_FAILED';
export const FETCHED_EVALS = 'FETCHED_EVALS';

export const FETCH_EVAL = 'FETCH_EVAL';
export const FETCHED_EVAL = 'FETCHED_EVAL';
export const FETCH_EVAL_FAILED = 'FETCH_EVAL_FAILED';
export const STOP_WATCHING_EVAL = 'STOP_WATCHING_EVAL';

// Watch evaluation list
export function *watchEvalsSaga() {
    let index = 1
    while (true) {
        try {
            const request = superagent
                .get(`${NOMAD_API}/evaluations`)
                .query({ index })

            const evaluations = yield call(() => { return request })

            if (evaluations) {
                const newIndex = Number(evaluations.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_EVALS,
                    payload: evaluations.body
                })
            }
        } catch(error) {
            console.log("Request error: ", error)
            yield put({
                type: FETCH_EVALS_FAILED
            })
            index = 1
            yield call(delay, 5000)
        }
    }
}

// Watch an individual evaluation
export function *watchEvalSaga(evaluationId) {
    let request
    let index = 0

    while (true) {
        try {
            request = superagent
                .get(`${NOMAD_API}/evaluation/${evaluationId}`)
                .query({ index })

            const evaluation = yield call(() => { return request })

            if (evaluation) {
                const newIndex = Number(evaluation.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_EVAL,
                    payload: evaluation.body
                })
            }
        } catch(error) {
            console.log("Evaluation: unable to fetch evaluation: ", error)
            // maybe redirect to evaluations overview?
            break
        } finally {
            const abort = yield cancelled()
            if (abort && request) {
                request.abort()
                break
            }
        }
    }
}

// Monitor evaluation changes
export function *evalSaga() {
    // Start monitoring for changes in all evaluations
    yield fork(watchEvalsSaga)

    // Start monitoring indivual evaluations
    let evalTask

    while (true) {
        const action = yield take([FETCH_EVAL, STOP_WATCHING_EVAL])

        // Abort the previous evaluation watcher
        if (evalTask) {
            yield cancel(evalTask)
        }

        if (action.type === FETCH_EVAL) {
            evalTask = yield fork(watchEvalSaga, action.id)
        }
    }
}
