import {
  SET_CONSUL_REGION,
  FETCHED_CONSUL_REGIONS,
  FETCHED_CONSUL_SERVICES,
  FETCHED_CONSUL_SERVICE,
  UNKNOWN_CONSUL_REGION,
  UNWATCH_CONSUL_SERVICE,
  UNWATCH_CONSUL_SERVICES
} from '../sagas/event'

export function ChangeConsulRegionReducer (state = {}, action) {
  switch (action.type) {

  case SET_CONSUL_REGION:
    document.location.href = '//' + window.location.host + '/consul/' + action.payload + '/services'
    return {}

  case UNKNOWN_CONSUL_REGION:
    document.location.href = '//' + window.location.host + '/consul';
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
