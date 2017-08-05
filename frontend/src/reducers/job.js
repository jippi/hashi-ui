import {
  NOMAD_FETCHED_JOB,
  NOMAD_FETCHED_JOBS,
  NOMAD_JOB_HIDE_DIALOG,
  NOMAD_JOB_SHOW_DIALOG,
  NOMAD_UNWATCH_JOB
} from "../sagas/event"

export function JobInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_UNWATCH_JOB:
      return {}
    case NOMAD_FETCHED_JOB: {
      const job = action.payload
      job.TaskGroups.forEach((group, gidx) => {
        job.TaskGroups[gidx].ID = `${job.ID}.${group.Name}`
      })
      job.TaskGroups.forEach((group, gidx) => {
        group.Tasks.forEach((task, tidx) => {
          job.TaskGroups[gidx].Tasks[tidx].ID = `${group.ID}.${task.Name}`
        })
      })
      return job
    }
    default:
  }

  return state
}

export function JobDialogReducer(state = "", action) {
  switch (action.type) {
    case NOMAD_JOB_SHOW_DIALOG:
      return action.payload
    case NOMAD_JOB_HIDE_DIALOG:
      return ""
  }
  return state
}

export function JobListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_JOBS:
      return action.payload
    default:
  }
  return state
}
