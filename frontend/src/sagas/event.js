import { delay, eventChannel } from 'redux-saga';
import { fork, take, call, put } from 'redux-saga/effects';

export const FETCHED_JOBS = 'FETCHED_JOBS';
export const FETCHED_JOB = 'FETCHED_JOB';
export const WATCH_JOB = 'WATCH_JOB';
export const UNWATCH_JOB = 'UNWATCH_JOB';
export const RUN_JOB = 'RUN_JOB';

export const FETCHED_MEMBERS = 'FETCHED_MEMBERS';
export const FETCHED_MEMBER = 'FETCHED_MEMBER';
export const FETCH_MEMBER = 'FETCH_MEMBER';
export const WATCH_MEMBER = 'WATCH_MEMBER';
export const UNWATCH_MEMBER = 'UNWATCH_MEMBER';

export const FETCHED_NODES = 'FETCHED_NODES';
export const FETCHED_NODE = 'FETCHED_NODE';
export const FETCH_NODE = 'FETCH_NODE';
export const WATCH_NODE = 'WATCH_NODE';
export const UNWATCH_NODE = 'UNWATCH_NODE';

export const FETCHED_EVALS = 'FETCHED_EVALS';
export const FETCHED_EVAL = 'FETCHED_EVAL';
export const WATCH_EVAL = 'WATCH_EVAL';
export const UNWATCH_EVAL = 'UNWATCH_EVAL';

export const FETCHED_ALLOCS = 'FETCHED_ALLOCS';
export const FETCHED_ALLOC = 'FETCHED_ALLOC';
export const WATCH_ALLOC = 'WATCH_ALLOC';
export const UNWATCH_ALLOC = 'UNWATCH_ALLOC';

export const FETCH_DIR = 'FETCH_DIR';
export const FETCHED_DIR = 'FETCHED_DIR';

export const WATCH_FILE = 'WATCH_FILE';
export const UNWATCH_FILE = 'UNWATCH_FILE';
export const FETCHED_FILE = 'FETCHED_FILE';

export const CLEAR_FILE_PATH = 'CLEAR_FILE_PATH';
export const CLEAR_RECEIVED_FILE_DATA = 'CLEAR_RECEIVED_FILE_DATA';

function subscribe(socket) {
    return eventChannel((emit) => {
        // eslint-disable-next-line no-param-reassign
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            emit({
                type: data.Type,
                payload: data.Payload,
            });
        };
        return () => {};
    });
}

function* read(socket) {
    const channel = yield call(subscribe, socket);
    while (true) {
        const action = yield take(channel);
        yield put(action);
    }
}

function* write(socket) {
    while (true) {
        const action = yield take([
            WATCH_JOB,
            UNWATCH_JOB,
            RUN_JOB,
            WATCH_ALLOC,
            UNWATCH_ALLOC,
            WATCH_EVAL,
            UNWATCH_EVAL,
            WATCH_NODE,
            UNWATCH_NODE,
            FETCH_NODE,
            WATCH_MEMBER,
            UNWATCH_MEMBER,
            FETCH_MEMBER,
            FETCH_DIR,
            WATCH_FILE,
            UNWATCH_FILE,
        ]);
        socket.send(JSON.stringify(action));
    }
}

function* transport(socket) {
    yield fork(read, socket);
    yield fork(write, socket);
}

function connectTo(url) {
    const socket = new WebSocket(url);

    const resolver = (resolve, reject) => {
        const timeout = setTimeout(() => {
            reject('Unable to connect to the backend...');
        }, 2000);

        socket.onopen = () => {
            resolve(socket);
            clearTimeout(timeout);
        };
    };

    return new Promise(resolver.bind(socket));
}

function* events(socket) {
    while (true) {
        yield call(transport, socket);
        yield delay(5000);
    }
}

export default function eventSaga() {
    return new Promise((resolve, reject) => {
        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

        // If we build production page, assume /ws run inside the go-binary
        // and such on same host+port otherwise assume development, where we
        // re-use the hostname but use GO_PORT end with fallback to :3000.
        let hostname;
        if (process.env.NODE_ENV === 'production') {
            hostname = location.host;
        } else {
            hostname = `${location.hostname}:${process.env.GO_PORT}` || 3000;
        }

        const url = `${protocol}//${hostname}/ws`;
        const p = connectTo(url);

        return p.then((socket) => {
            resolve(function* eventGenerator() { yield fork(events, socket); });
        }).catch((err) => {
            reject(err);
        });
    });
}
