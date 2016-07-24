import superagent from 'superagent'
import { takeLatest } from 'redux-saga'
import { put, call, fork } from 'redux-saga/effects'

export const FETCH_DIR = 'FETCH_DIR'
export const FETCH_DIR_FAILED = 'FETCH_DIR_FAILED'
export const FETCHED_DIR = 'FETCHED_DIR'
export const FETCH_FILE = 'FETCH_FILE'
export const FETCH_FILE_FAILED = 'FETCH_FILE_FAILED'
export const FETCHED_FILE = 'FETCHED_FILE'

function *fetchDirectory(action) {
    try {
        const request = superagent
            .get(`http://${action.client}/v1/client/fs/ls/${action.alloc}`)
            .query({ path: action.path })
        const response = yield call(() => { return (request) })

        yield put({type: "FETCHED_DIR", payload: response.body})
    } catch(error) {
        console.log(error)
        yield put({type: "FETCH_DIR_FAILED"})
    }
}

function *fetchFile(action) {
    try {
        const request = superagent
            .get(`http://${action.client}/v1/client/fs/cat/${action.alloc}`)
            .query({ path: action.path })
        const response = yield call(() => { return (request) })

        yield put({type: "FETCHED_FILE", payload: { text: response.text, path: action.path}})
    } catch(error) {
        console.log(error)
        yield put({type: "FETCH_FILE_FAILED"})
    }

}

export function *filesystemSaga() {
  yield fork(takeLatest, FETCH_DIR, fetchDirectory)
  yield fork(takeLatest, FETCH_FILE, fetchFile)
}
