import { delay, eventChannel } from "redux-saga"
import { fork, take, call, put } from "redux-saga/effects"

export const APP_CLEAR_ERROR_NOTIFICATION = "APP_CLEAR_ERROR_NOTIFICATION"
export const APP_CLEAR_SUCCESS_NOTIFICATION = "APP_CLEAR_SUCCESS_NOTIFICATION"
export const APP_DRAWER_CLOSE = "APP_DRAWER_CLOSE"
export const APP_DRAWER_OPEN = "APP_DRAWER_OPEN"
export const APP_ERROR = "APP_ERROR"
export const APP_ERROR_NOTIFICATION = "APP_ERROR_NOTIFICATION"
export const APP_SUCCESS_NOTIFICATION = "APP_SUCCESS_NOTIFICATION"
export const CONSUL_CLEAR_KV_PAIR = "CONSUL_CLEAR_KV_PAIR"
export const CONSUL_DELETE_KV_FOLDER = "CONSUL_DELETE_KV_FOLDER"
export const CONSUL_DELETE_KV_PAIR = "CONSUL_DELETE_KV_PAIR"
export const CONSUL_DEREGISTER_SERVICE = "CONSUL_DEREGISTER_SERVICE"
export const CONSUL_DEREGISTER_SERVICE_CHECK = "CONSUL_DEREGISTER_SERVICE_CHECK"
export const CONSUL_FETCH_REGIONS = "CONSUL_FETCH_REGIONS"
export const CONSUL_FETCHED_KV_PAIR = "CONSUL_FETCHED_KV_PAIR"
export const CONSUL_FETCHED_KV_PATH = "CONSUL_FETCHED_KV_PATH"
export const CONSUL_FETCHED_NODE = "CONSUL_FETCHED_NODE"
export const CONSUL_FETCHED_NODES = "CONSUL_FETCHED_NODES"
export const CONSUL_FETCHED_REGIONS = "CONSUL_FETCHED_REGIONS"
export const CONSUL_FETCHED_SERVICE = "CONSUL_FETCHED_SERVICE"
export const CONSUL_FETCHED_SERVICES = "CONSUL_FETCHED_SERVICES"
export const CONSUL_GET_KV_PAIR = "CONSUL_GET_KV_PAIR"
export const CONSUL_SET_KV_PAIR = "CONSUL_SET_KV_PAIR"
export const CONSUL_SET_REGION = "CONSUL_SET_REGION"
export const CONSUL_UNKNOWN_REGION = "CONSUL_UNKNOWN_REGION"
export const CONSUL_UNWATCH_KV_PATH = "CONSUL_UNWATCH_KV_PATH"
export const CONSUL_UNWATCH_NODE = "CONSUL_UNWATCH_NODE"
export const CONSUL_UNWATCH_NODES = "CONSUL_UNWATCH_NODES"
export const CONSUL_UNWATCH_SERVICE = "CONSUL_UNWATCH_SERVICE"
export const CONSUL_UNWATCH_SERVICES = "CONSUL_UNWATCH_SERVICES"
export const CONSUL_WATCH_KV_PATH = "CONSUL_WATCH_KV_PATH"
export const CONSUL_WATCH_NODE = "CONSUL_WATCH_NODE"
export const CONSUL_WATCH_NODES = "CONSUL_WATCH_NODES"
export const CONSUL_WATCH_SERVICE = "CONSUL_WATCH_SERVICE"
export const CONSUL_WATCH_SERVICES = "CONSUL_WATCH_SERVICES"
export const NOMAD_CHANGE_DEPLOYMENT_STATUS = "NOMAD_CHANGE_DEPLOYMENT_STATUS"
export const NOMAD_CHANGE_TASK_GROUP_COUNT = "NOMAD_CHANGE_TASK_GROUP_COUNT"
export const NOMAD_CLEAR_FILE_PATH = "NOMAD_CLEAR_FILE_PATH"
export const NOMAD_CLEAR_RECEIVED_FILE_DATA = "NOMAD_CLEAR_RECEIVED_FILE_DATA"
export const NOMAD_EVALUATE_JOB = "NOMAD_EVALUATE_JOB"
export const NOMAD_FETCH_CLIENT_STATS = "NOMAD_FETCH_CLIENT_STATS"
export const NOMAD_FETCH_DIR = "NOMAD_FETCH_DIR"
export const NOMAD_FETCH_MEMBER = "NOMAD_FETCH_MEMBER"
export const NOMAD_FETCH_NODE = "NOMAD_FETCH_NODE"
export const NOMAD_FETCH_REGIONS = "NOMAD_FETCH_REGIONS"
export const NOMAD_FETCHED_ALLOC = "NOMAD_FETCHED_ALLOC"
export const NOMAD_FETCHED_ALLOCS = "NOMAD_FETCHED_ALLOCS"
export const NOMAD_FETCHED_CLIENT_STATS = "NOMAD_FETCHED_CLIENT_STATS"
export const NOMAD_FETCHED_CLUSTER_STATISTICS = "NOMAD_FETCHED_CLUSTER_STATISTICS"
export const NOMAD_FETCHED_DEPLOYMENT = "NOMAD_FETCHED_DEPLOYMENT"
export const NOMAD_FETCHED_DEPLOYMENT_ALLOCATIONS = "NOMAD_FETCHED_DEPLOYMENT_ALLOCATIONS"
export const NOMAD_FETCHED_DEPLOYMENTS = "NOMAD_FETCHED_DEPLOYMENTS"
export const NOMAD_FETCHED_DIR = "NOMAD_FETCHED_DIR"
export const NOMAD_FETCHED_EVAL = "NOMAD_FETCHED_EVAL"
export const NOMAD_FETCHED_EVALS = "NOMAD_FETCHED_EVALS"
export const NOMAD_FETCHED_FILE = "NOMAD_FETCHED_FILE"
export const NOMAD_FETCHED_JOB = "NOMAD_FETCHED_JOB"
export const NOMAD_FETCHED_JOB_DEPLOYMENTS = "NOMAD_FETCHED_JOB_DEPLOYMENTS"
export const NOMAD_FETCHED_JOB_VERSIONS = "NOMAD_FETCHED_JOB_VERSIONS"
export const NOMAD_FETCHED_JOBS = "NOMAD_FETCHED_JOBS"
export const NOMAD_FETCHED_JOBS_FILTERED = "NOMAD_FETCHED_JOBS_FILTERED"
export const NOMAD_FETCHED_MEMBER = "NOMAD_FETCHED_MEMBER"
export const NOMAD_FETCHED_MEMBERS = "NOMAD_FETCHED_MEMBERS"
export const NOMAD_FETCHED_NODE = "NOMAD_FETCHED_NODE"
export const NOMAD_FETCHED_NODES = "NOMAD_FETCHED_NODES"
export const NOMAD_FETCHED_REGIONS = "NOMAD_FETCHED_REGIONS"
export const NOMAD_FORCE_PERIODIC_RUN = "NOMAD_FORCE_PERIODIC_RUN"
export const NOMAD_JOB_HIDE_DIALOG = "NOMAD_JOB_HIDE_DIALOG"
export const NOMAD_JOB_SHOW_DIALOG = "NOMAD_JOB_SHOW_DIALOG"
export const NOMAD_SET_REGION = "NOMAD_SET_REGION"
export const NOMAD_STOP_JOB = "NOMAD_STOP_JOB"
export const NOMAD_SUBMIT_JOB = "NOMAD_SUBMIT_JOB"
export const NOMAD_UNKNOWN_REGION = "NOMAD_UNKNOWN_REGION"
export const NOMAD_UNWATCH_ALLOC = "NOMAD_UNWATCH_ALLOC"
export const NOMAD_UNWATCH_ALLOCS = "NOMAD_UNWATCH_ALLOCS"
export const NOMAD_UNWATCH_ALLOCS_SHALLOW = "NOMAD_UNWATCH_ALLOCS_SHALLOW"
export const NOMAD_UNWATCH_CLIENT_STATS = "NOMAD_UNWATCH_CLIENT_STATS"
export const NOMAD_UNWATCH_CLUSTER_STATISTICS = "NOMAD_UNWATCH_CLUSTER_STATISTICS"
export const NOMAD_UNWATCH_DEPLOYMENT = "NOMAD_UNWATCH_DEPLOYMENT"
export const NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS = "NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS"
export const NOMAD_UNWATCH_DEPLOYMENTS = "NOMAD_UNWATCH_DEPLOYMENTS"
export const NOMAD_UNWATCH_EVAL = "NOMAD_UNWATCH_EVAL"
export const NOMAD_UNWATCH_EVALS = "NOMAD_UNWATCH_EVALS"
export const NOMAD_UNWATCH_FILE = "NOMAD_UNWATCH_FILE"
export const NOMAD_UNWATCH_JOB = "NOMAD_UNWATCH_JOB"
export const NOMAD_UNWATCH_JOB_DEPLOYMENTS = "NOMAD_UNWATCH_JOB_DEPLOYMENTS"
export const NOMAD_UNWATCH_JOB_VERSIONS = "NOMAD_UNWATCH_JOB_VERSIONS"
export const NOMAD_UNWATCH_JOBS = "NOMAD_UNWATCH_JOBS"
export const NOMAD_UNWATCH_JOBS_FILTERED = "NOMAD_UNWATCH_JOBS_FILTERED"
export const NOMAD_UNWATCH_MEMBER = "NOMAD_UNWATCH_MEMBER"
export const NOMAD_UNWATCH_MEMBERS = "NOMAD_UNWATCH_MEMBERS"
export const NOMAD_UNWATCH_NODE = "NOMAD_UNWATCH_NODE"
export const NOMAD_UNWATCH_NODES = "NOMAD_UNWATCH_NODES"
export const NOMAD_WATCH_ALLOC = "NOMAD_WATCH_ALLOC"
export const NOMAD_WATCH_ALLOCS = "NOMAD_WATCH_ALLOCS"
export const NOMAD_WATCH_ALLOCS_SHALLOW = "NOMAD_WATCH_ALLOCS_SHALLOW"
export const NOMAD_WATCH_CLIENT_STATS = "NOMAD_WATCH_CLIENT_STATS"
export const NOMAD_WATCH_CLUSTER_STATISTICS = "NOMAD_WATCH_CLUSTER_STATISTICS"
export const NOMAD_WATCH_DEPLOYMENT = "NOMAD_WATCH_DEPLOYMENT"
export const NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS = "NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS"
export const NOMAD_WATCH_DEPLOYMENTS = "NOMAD_WATCH_DEPLOYMENTS"
export const NOMAD_WATCH_EVAL = "NOMAD_WATCH_EVAL"
export const NOMAD_WATCH_EVALS = "NOMAD_WATCH_EVALS"
export const NOMAD_WATCH_FILE = "NOMAD_WATCH_FILE"
export const NOMAD_WATCH_JOB = "NOMAD_WATCH_JOB"
export const NOMAD_WATCH_JOB_DEPLOYMENTS = "NOMAD_WATCH_JOB_DEPLOYMENTS"
export const NOMAD_WATCH_JOB_VERSIONS = "NOMAD_WATCH_JOB_VERSIONS"
export const NOMAD_WATCH_JOBS = "NOMAD_WATCH_JOBS"
export const NOMAD_WATCH_JOBS_FILTERED = "NOMAD_WATCH_JOBS_FILTERED"
export const NOMAD_WATCH_MEMBER = "NOMAD_WATCH_MEMBER"
export const NOMAD_WATCH_MEMBERS = "NOMAD_WATCH_MEMBERS"
export const NOMAD_WATCH_NODE = "NOMAD_WATCH_NODE"
export const NOMAD_WATCH_NODES = "NOMAD_WATCH_NODES"

function subscribe(socket) {
  return eventChannel(emit => {
    socket.eventChannel = emit

    socket.onclose = err => {
      emit({
        type: APP_ERROR,
        payload: {
          error: err,
          source: "ws_onclose",
          reason: "WebSocket connection was closed, please reload the window to retry (no automatic retry will be made)"
        }
      })

      throw err
    }

    socket.onerror = err => {
      emit({
        type: APP_ERROR,
        payload: {
          error: err,
          source: "ws_onerror"
        }
      })

      throw err
    }

    // eslint-disable-next-line no-param-reassign
    socket.onmessage = event => {
      const data = JSON.parse(event.data)
      emit({
        type: data.Type,
        payload: data.Payload,
        index: data.Index
      })
    }

    return () => {}
  })
}

function* read(socket) {
  const channel = yield call(subscribe, socket)
  while (true) {
    const action = yield take(channel)
    yield put(action)
  }
}

function* write(socket) {
  while (true) {
    const action = yield take([
      APP_ERROR,
      CONSUL_DELETE_KV_FOLDER,
      CONSUL_DELETE_KV_PAIR,
      CONSUL_DEREGISTER_SERVICE_CHECK,
      CONSUL_DEREGISTER_SERVICE,
      CONSUL_FETCH_REGIONS,
      CONSUL_GET_KV_PAIR,
      CONSUL_SET_KV_PAIR,
      CONSUL_UNWATCH_KV_PATH,
      CONSUL_UNWATCH_NODE,
      CONSUL_UNWATCH_NODES,
      CONSUL_UNWATCH_SERVICE,
      CONSUL_UNWATCH_SERVICES,
      CONSUL_WATCH_KV_PATH,
      CONSUL_WATCH_NODE,
      CONSUL_WATCH_NODES,
      CONSUL_WATCH_SERVICE,
      CONSUL_WATCH_SERVICES,
      NOMAD_CHANGE_DEPLOYMENT_STATUS,
      NOMAD_CHANGE_TASK_GROUP_COUNT,
      NOMAD_EVALUATE_JOB,
      NOMAD_FETCH_CLIENT_STATS,
      NOMAD_FETCH_DIR,
      NOMAD_FETCH_MEMBER,
      NOMAD_FETCH_NODE,
      NOMAD_FETCH_REGIONS,
      NOMAD_FORCE_PERIODIC_RUN,
      NOMAD_STOP_JOB,
      NOMAD_SUBMIT_JOB,
      NOMAD_UNWATCH_ALLOC,
      NOMAD_UNWATCH_ALLOCS_SHALLOW,
      NOMAD_UNWATCH_ALLOCS,
      NOMAD_UNWATCH_CLIENT_STATS,
      NOMAD_UNWATCH_CLUSTER_STATISTICS,
      NOMAD_UNWATCH_DEPLOYMENT_ALLOCATIONS,
      NOMAD_UNWATCH_DEPLOYMENT,
      NOMAD_UNWATCH_DEPLOYMENTS,
      NOMAD_UNWATCH_EVAL,
      NOMAD_UNWATCH_EVALS,
      NOMAD_UNWATCH_FILE,
      NOMAD_UNWATCH_JOB_VERSIONS,
      NOMAD_UNWATCH_JOB,
      NOMAD_UNWATCH_JOBS_FILTERED,
      NOMAD_UNWATCH_JOBS,
      NOMAD_UNWATCH_MEMBER,
      NOMAD_UNWATCH_MEMBERS,
      NOMAD_UNWATCH_NODE,
      NOMAD_UNWATCH_NODES,
      NOMAD_WATCH_ALLOC,
      NOMAD_WATCH_ALLOCS_SHALLOW,
      NOMAD_WATCH_ALLOCS,
      NOMAD_WATCH_CLIENT_STATS,
      NOMAD_WATCH_CLUSTER_STATISTICS,
      NOMAD_WATCH_DEPLOYMENT_ALLOCATIONS,
      NOMAD_WATCH_DEPLOYMENT,
      NOMAD_WATCH_DEPLOYMENTS,
      NOMAD_WATCH_EVAL,
      NOMAD_WATCH_EVALS,
      NOMAD_WATCH_FILE,
      NOMAD_WATCH_JOB_DEPLOYMENTS,
      NOMAD_WATCH_JOB_VERSIONS,
      NOMAD_WATCH_JOB,
      NOMAD_WATCH_JOBS_FILTERED,
      NOMAD_WATCH_JOBS,
      NOMAD_WATCH_MEMBER,
      NOMAD_WATCH_MEMBERS,
      NOMAD_WATCH_NODE,
      NOMAD_WATCH_NODES
    ])

    socket.send(JSON.stringify(action))
  }
}

function* transport(socket) {
  yield fork(read, socket)
  yield fork(write, socket)
}

function connectTo(url) {
  const socket = new WebSocket(url)

  const resolver = (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject("Unable to connect to the backend...")
    }, 2000)

    socket.onopen = () => {
      resolve(socket)
      clearTimeout(timeout)
    }
  }

  return new Promise(resolver.bind(socket))
}

function* events(socket) {
  while (true) {
    yield call(transport, socket)
    yield delay(5000)
  }
}

export default function eventSaga() {
  return new Promise((resolve, reject) => {
    const parser = document.createElement("a")
    parser.href = window.NOMAD_ENDPOINT

    const host = parser.host ? parser.host : document.location.host
    const protocol = location.protocol === "https:" ? "wss:" : "ws:"
    let relPath = document.location.pathname.replace(parser.pathname, "/").replace("//", "/")
    let wsRoot = `${protocol}//${host}`
    let wsURL = `/${parser.pathname}/ws`.replace("//", "/")

    // inside nomad scope
    if (relPath.indexOf("/nomad") === 0) {
      wsURL = wsURL + "/nomad"
      relPath = relPath.replace("/nomad/", "").split("/")[0]
      if (relPath) {
        wsURL = wsURL + "/" + relPath
      }
    }

    // inside consul scope
    if (relPath.indexOf("/consul") === 0) {
      wsURL = wsURL + "/consul"
      relPath = relPath.replace("/consul/", "").split("/")[0]
      if (relPath) {
        wsURL = wsURL + "/" + relPath
      }
    }

    // cleanup double slashes, yes, dirty hack :)
    wsURL = wsURL.replace("//", "/")

    const p = connectTo(wsRoot + wsURL)

    return p
      .then(socket => {
        resolve(function* eventGenerator() {
          yield fork(events, socket)
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}
