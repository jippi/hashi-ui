import superagent from 'superagent'
import { take, put, call, cancel, cancelled, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { NOMAD_API } from './root'

export const FETCH_ALLOCS_FAILED = 'FETCH_ALLOCS_FAILED';
export const FETCHED_ALLOCS = 'FETCHED_ALLOCATIONS';

export const FETCH_ALLOC = 'FETCH_ALLOC';
export const FETCHED_ALLOC = 'FETCHED_ALLOC';
export const FETCH_ALLOC_FAILED = 'FETCH_ALLOC_FAILED';
export const STOP_WATCHING_ALLOC = 'STOP_WATCHING_ALLOC';

// Watch allocation list
export function *watchAllocsSaga() {
    let index = 1
    while (true) {
        try {
            const request = superagent
                .get(`${NOMAD_API}/allocations`)
                .query({ index })

            const allocations = yield call(() => { return request })

            if (allocations) {
                const newIndex = Number(allocations.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_ALLOCS,
                    payload: allocations.body
                })
            }
        } catch(error) {
            console.log("Request error: ", error)
            yield put({
                type: FETCH_ALLOCS_FAILED
            })
            index = 1
            yield call(delay, 5000)
        }
    }
}

// Watch an individual allocation
export function *watchAllocSaga(allocationId, watch = true) {
    let request
    let index = 0

    while (true) {
        try {
            request = superagent
                .get(`${NOMAD_API}/allocation/${allocationId}`)
                .query({ index })

            const allocation = yield call(() => { return request })

            if (allocation) {
                const newIndex = Number(allocation.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_ALLOC,
                    payload: allocation.body
                })
            }

            if (!watch) { break }

        } catch(error) {
            console.log("Allocation: unable to fetch allocation: ", error)
            // maybe redirect to allocations overview?
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

// Monitor allocation changes
export function *allocSaga() {
    // Start monitoring for changes in all allocations
    yield fork(watchAllocsSaga)

    // Start monitoring indivual allocations
    let allocTask

    while (true) {
        const action = yield take([FETCH_ALLOC, STOP_WATCHING_ALLOC])

        // Abort the previous allocation watcher
        if (allocTask) {
            yield cancel(allocTask)
        }

        if (action.type === FETCH_ALLOC) {
            allocTask = yield fork(watchAllocSaga, action.id)
        }
    }
}
