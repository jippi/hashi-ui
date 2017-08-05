import {
  NOMAD_FETCHED_DIR,
  NOMAD_FETCHED_FILE,
  NOMAD_CLEAR_FILE_PATH,
  NOMAD_CLEAR_RECEIVED_FILE_DATA
} from "../sagas/event"

export function DirectoryReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_DIR:
      return action.payload
    default:
  }
  return state
}

export function FileReducer(state = { File: "<please select a file>" }, action) {
  switch (action.type) {
    case NOMAD_CLEAR_FILE_PATH:
      return Object.assign({}, state, {
        File: "<please select a file>",
        Data: ""
      })
    case NOMAD_CLEAR_RECEIVED_FILE_DATA:
      return Object.assign({}, state, { Data: "" })
    case NOMAD_FETCHED_FILE:
      return action.payload
    default:
  }
  return state
}
