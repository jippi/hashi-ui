import { SET_NOMAD_REGION, FETCHED_NOMAD_REGIONS, UNKNOWN_NOMAD_REGION } from "../sagas/event"

export function ChangeNomadRegionReducer(state = {}, action) {
  switch (action.type) {
    case SET_NOMAD_REGION:
      document.location.href = window.NOMAD_ENDPOINT + "/nomad/" + action.payload + "/cluster"
      return {}

    case UNKNOWN_NOMAD_REGION:
      document.location.href = window.NOMAD_ENDPOINT + "/nomad"
      return {}
  }

  return state
}

export function NomadRegionsReducer(state = [], action) {
  switch (action.type) {
    case FETCHED_NOMAD_REGIONS:
      return action.payload
  }

  return state
}
