import { NOMAD_SET_REGION, NOMAD_FETCHED_REGIONS, NOMAD_UNKNOWN_REGION } from "../sagas/event"

export function ChangeNomadRegionReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_SET_REGION:
      document.location.href = window.HASHI_ENDPOINT + "/nomad/" + action.payload + "/cluster"
      return {}

    case NOMAD_UNKNOWN_REGION:
      document.location.href = window.HASHI_ENDPOINT + "/nomad"
      return {}
  }

  return state
}

export function NomadRegionsReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_REGIONS:
      return action.payload
  }

  return state
}
