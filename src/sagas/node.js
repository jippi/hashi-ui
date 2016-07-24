import superagent from 'superagent'
import { take, put, call, cancel, cancelled, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { NOMAD_API } from './root'

export const FETCH_NODES_FAILED = 'FETCH_NODES_FAILED';
export const FETCHED_NODES = 'FETCHED_NODES';

export const FETCH_NODE = 'FETCH_NODE';
export const FETCHED_NODE = 'FETCHED_NODE';
export const FETCH_NODE_FAILED = 'FETCH_NODE_FAILED';
export const STOP_WATCHING_NODE = 'STOP_WATCHING_NODE';

// Watch node list
export function *watchNodesSaga() {
    let index = 1
    while (true) {
        try {
            const request = superagent.get(`${NOMAD_API}/nodes`).query({ index })
            const nodes = yield call(() => { return request })

            if (nodes) {
                const newIndex = Number(nodes.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_NODES,
                    payload: nodes.body
                })
            }
        } catch(error) {
            console.log("Request error: ", error)
            yield put({
                type: FETCH_NODES_FAILED
            })
            index = 1
            yield call(delay, 5000)
        }
    }
}

// Watch an individual node
export function *watchNodeSaga(nodeId, watch = true) {
    let request
    let index = 0
    while (true) {
        try {
            request = superagent.get(`${NOMAD_API}/node/${nodeId}`).query({ index })

            const node = yield call(() => { return request })

            if (node) {
                const newIndex = Number(node.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_NODE,
                    payload: node.body
                })
            }

            if (!watch) { break }

        } catch(error) {
            console.log("Node: unable to fetch node: ", error)
            // maybe redirect to nodes overview?
            break
        } finally {
            const abort = yield cancelled()
            if (abort && request) {
                request.abort()
            }
        }
    }
}

// Watch node
export function *nodeSaga() {
    // Start monitoring for changes in all nodes
    yield fork(watchNodesSaga)

    // Start monitoring indivual nodes
    let nodeTask

    while (true) {
        const action = yield take([FETCH_NODE, STOP_WATCHING_NODE])

        // Abort the previous node watcher
        if (nodeTask) {
            yield cancel(nodeTask)
        }

        if (action.type === FETCH_NODE) {
            nodeTask = yield fork(watchNodeSaga, action.id, action.watch)
        }
    }
}
