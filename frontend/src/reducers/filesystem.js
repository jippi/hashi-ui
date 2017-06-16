import { FETCHED_DIR, FETCHED_FILE, CLEAR_FILE_PATH, CLEAR_RECEIVED_FILE_DATA } from "../sagas/event"

export function DirectoryReducer(state = [], action) {
  switch (action.type) {
    case FETCHED_DIR:
      return action.payload
    default:
  }
  return state
}

export function FileReducer(state = { File: "<please select a file>" }, action) {
  switch (action.type) {
    case CLEAR_FILE_PATH:
      return Object.assign({}, state, {
        File: "<please select a file>",
        Data: "",
      })
    case CLEAR_RECEIVED_FILE_DATA:
      return Object.assign({}, state, { Data: "" })
    case FETCHED_FILE:
      return action.payload
    default:
  }
  return state
}
