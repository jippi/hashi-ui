import {
  FETCHED_CONSUL_KV_PAIR,
  FETCHED_CONSUL_KV_PATH,
  FETCHED_CONSUL_NODE,
  FETCHED_CONSUL_NODES,
  FETCHED_CONSUL_REGIONS,
  FETCHED_CONSUL_SERVICE,
  FETCHED_CONSUL_SERVICES,
  SET_CONSUL_REGION,
  UNKNOWN_CONSUL_REGION,
  UNWATCH_CONSUL_KV_PATH,
  UNWATCH_CONSUL_NODE,
  UNWATCH_CONSUL_NODES,
  UNWATCH_CONSUL_SERVICE,
  UNWATCH_CONSUL_SERVICES,
  CLEAR_CONSUL_KV_PAIR,
} from '../sagas/event'

export function ChangeConsulRegionReducer (state = {}, action) {
  switch (action.type) {

  case SET_CONSUL_REGION:
    document.location.href = window.NOMAD_ENDPOINT + '/consul/' + action.payload + '/services'
    return {}

  case UNKNOWN_CONSUL_REGION:
    document.location.href = window.NOMAD_ENDPOINT + '/consul';
    return {}

  }

  return state
}

export function ConsulRegionsReducer (state = {}, action) {
  switch (action.type) {

  case FETCHED_CONSUL_REGIONS:
    return action.payload

  }

  return state
}

export function ConsulServiceList (state = [], action) {
  switch (action.type) {

  case FETCHED_CONSUL_SERVICES:
    return action.payload

  case UNWATCH_CONSUL_SERVICES:
    return []

  default:

  }

  return state

}

export function ConsulService (state = [], action) {
  switch (action.type) {

  case FETCHED_CONSUL_SERVICE:
    return action.payload

  case UNWATCH_CONSUL_SERVICE:
    return []

  default:

  }

  return state
}

export function ConsulNodes (state = [], action) {
  switch (action.type) {

  case FETCHED_CONSUL_NODES:
    return action.payload

  case UNWATCH_CONSUL_NODES:
    return []

  default:

  }

  return state

}

export function ConsulNode (state = {}, action) {
  switch (action.type) {

  case FETCHED_CONSUL_NODE:
    return action.payload

  case UNWATCH_CONSUL_NODE:
    return {}

  default:

  }

  return state
}

export function ConsulKVPath (state = [], action) {
  switch(action.type) {
  case FETCHED_CONSUL_KV_PATH:
    return action.payload
  case UNWATCH_CONSUL_KV_PATH:
    return []
  }
  return state
}

export function ConsulKVPair (state = {}, action) {
  switch (action.type) {
  case FETCHED_CONSUL_KV_PAIR:
    return action.payload
  case CLEAR_CONSUL_KV_PAIR:
    return {}
  }

  return state
}
