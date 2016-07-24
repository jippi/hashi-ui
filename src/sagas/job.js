import superagent from 'superagent';
import { take, put, call, fork, cancel, cancelled } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import { NOMAD_API } from './root'

export const FETCH_JOBS_FAILED = 'FETCH_JOBS_FAILED';
export const FETCHED_JOBS = 'FETCH_JOBS';

export const FETCH_JOB = 'FETCH_JOB';
export const FETCHED_JOB = 'FETCHED_JOB';
export const FETCH_JOB_FAILED = 'FETCH_JOB_FAILED';
export const STOP_WATCHING_JOB = 'STOP_WATCHING_JOB';

// Watch job list
export function *watchJobsSaga() {
    let index = 1
    while (true) {
        try {
            const request = superagent.get(`${NOMAD_API}/jobs`).query({ index })
            const jobs = yield call(() => { return request })

            if (jobs) {
                const newIndex = Number(jobs.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_JOBS,
                    payload: jobs.body
                })
            }
        } catch(error) {
            console.log("Request error: ", error)
            yield put({
                type: FETCH_JOBS_FAILED
            })
            index = 1
            yield call(delay, 5000)
        }
    }
}

// Watch an individual job
export function *watchJobSaga(jobId) {
    let request
    let index = 0
    while (true) {
        try {
            request = superagent
                .get(`${NOMAD_API}/job/${jobId}`)
                .query({ index })

            const job = yield call(() => { return request })

            if (job) {
                const newIndex = Number(job.header['x-nomad-index'])
                index = (newIndex > index) ? newIndex : index
                yield put({
                    type: FETCHED_JOB,
                    payload: job.body
                })
            }
        } catch(error) {
            console.log("Job: unable to job: ", error)
            // maybe redirect to jobs overview?
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

// Watch job
export function *jobSaga() {
    // Start monitoring for changes in all jobs
    yield fork(watchJobsSaga)

    // Start monitoring indivual jobs
    let jobTask

    while (true) {

        const action = yield take([FETCH_JOB, STOP_WATCHING_JOB])

        // Abort the previous job watcher
        if (jobTask) {
            yield cancel(jobTask)
        }

        if (action.type === FETCH_JOB) {
            jobTask = yield fork(watchJobSaga, action.id)
        }
    }
}
