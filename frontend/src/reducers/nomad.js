import { NOMAD_SET_REGION, NOMAD_FETCHED_REGIONS, NOMAD_UNKNOWN_REGION } from "../sagas/event"

export function ChangeNomadRegionReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_SET_REGION:
      document.location.href = HASHI_PATH_PREFIX + "nomad/" + action.payload + "/cluster"
      return {}

    case NOMAD_UNKNOWN_REGION:
      document.location.href = HASHI_PATH_PREFIX + "nomad"
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
