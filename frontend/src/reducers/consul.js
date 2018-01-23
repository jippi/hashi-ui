import {
  CONSUL_FETCHED_KV_PAIR,
  CONSUL_FETCHED_KV_PATH,
  CONSUL_FETCHED_NODE,
  CONSUL_FETCHED_NODES,
  CONSUL_FETCHED_REGIONS,
  CONSUL_FETCHED_SERVICE,
  CONSUL_FETCHED_SERVICES,
  CONSUL_SET_REGION,
  CONSUL_UNKNOWN_REGION,
  CONSUL_UNWATCH_KV_PATH,
  CONSUL_UNWATCH_NODE,
  CONSUL_UNWATCH_NODES,
  CONSUL_UNWATCH_SERVICE,
  CONSUL_UNWATCH_SERVICES,
  CONSUL_CLEAR_KV_PAIR,
  CONSUL_FETCHED_SESSIONS,
  CONSUL_FETCHED_SESSION
} from "../sagas/event"

export function ChangeConsulRegionReducer(state = {}, action) {
  switch (action.type) {
    case CONSUL_SET_REGION:
      document.location.href = HASHI_PATH_PREFIX + "consul/" + action.payload + "/services"
      return {}

    case CONSUL_UNKNOWN_REGION:
      document.location.href = HASHI_PATH_PREFIX + "consul"
      return {}
  }

  return state
}

export function ConsulRegionsReducer(state = [], action) {
  switch (action.type) {
    case CONSUL_FETCHED_REGIONS:
      return action.payload
  }

  return state
}

export function ConsulServiceList(state = [], action) {
  switch (action.type) {
    case CONSUL_FETCHED_SERVICES:
      return action.payload

    case CONSUL_UNWATCH_SERVICES:
      return []

    default:
  }

  return state
}

export function ConsulService(state = [], action) {
  switch (action.type) {
    case CONSUL_FETCHED_SERVICE:
      return action.payload

    case CONSUL_UNWATCH_SERVICE:
      return []

    default:
  }

  return state
}

export function ConsulNodes(state = [], action) {
  switch (action.type) {
    case CONSUL_FETCHED_NODES:
      return action.payload

    case CONSUL_UNWATCH_NODES:
      return []

    default:
  }

  return state
}

export function ConsulNode(state = {}, action) {
  switch (action.type) {
    case CONSUL_FETCHED_NODE:
      return action.payload

    case CONSUL_UNWATCH_NODE:
      return {}

    default:
  }

  return state
}

export function ConsulKVPath(state = [], action) {
  switch (action.type) {
    case CONSUL_FETCHED_KV_PATH:
      return action.payload
    case CONSUL_UNWATCH_KV_PATH:
      return []
  }
  return state
}

export function ConsulKVPair(state = {}, action) {
  switch (action.type) {
    case CONSUL_FETCHED_KV_PAIR:
      return action.payload
    case CONSUL_CLEAR_KV_PAIR:
      return {}
  }

  return state
}

export function ConsulSessions(state = [], action) {
  switch (action.type) {
    case CONSUL_FETCHED_SESSIONS:
      return action.payload;

    default:
      return state;
  }
}

export function ConsulSession(state = {}, action) {
  switch (action.type) {
    case CONSUL_FETCHED_SESSION:
      return action.payload;

    default:
      return state;
  }
}
