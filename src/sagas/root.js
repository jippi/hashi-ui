import { jobSaga } from './job'
import { nodeSaga } from './node'
import { allocSaga } from './allocation'
import { evalSaga } from './evaluation'
import { filesystemSaga } from './filesystem'
import settings from 'settings'

export const NOMAD_API = settings.url

export default function* rootSaga() {
    yield [
        jobSaga(),
        nodeSaga(),
        allocSaga(),
        evalSaga(),
        filesystemSaga()
    ]
}
