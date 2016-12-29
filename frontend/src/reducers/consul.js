import { SET_CONSUL_REGION, FETCHED_CONSUL_REGIONS, UNKNOWN_CONSUL_REGION } from '../sagas/event'

export function ChangeConsulRegionReducer (state = {}, action) {
  switch (action.type) {

  case SET_CONSUL_REGION:
    document.location.href = '//' + window.location.host + '/consul/' + action.payload + '/kv'
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
