import { APP_ERROR } from '../sagas/event'

export function AppErrorReducer (state = {}, action) {
  switch (action.type) {
  case APP_ERROR:
    return action.payload
  default:
  }
  return state
}
