import {
  APP_CLEAR_ERROR_NOTIFICATION,
  APP_CLEAR_SUCCESS_NOTIFICATION,
  APP_DRAWER_CLOSE,
  APP_DRAWER_OPEN,
  APP_ERROR_NOTIFICATION,
  APP_ERROR,
  APP_SUCCESS_NOTIFICATION,
  NOMAD_FETCHED_CLUSTER_STATISTICS
} from "../sagas/event"
import format from "date-fns/format"

export function ClusterStatisticsReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_CLUSTER_STATISTICS:
      if (!state.data) {
        state.data = {
          cpu: [],
          memory: [],
        }
        state.data = prefillData(state.data)
      }

      const AllocatedCPU = action.payload.CPUAllocatedMHz / action.payload.CPUTotalMHz * 100
      const IdleCPU = action.payload.CPUIdleTime / action.payload.CPUCores
      const UsedCPU = 100 - IdleCPU

      const UsedMemory = action.payload.MemoryUsed / 1024 / 1024 / 1024
      const TotalMemory = action.payload.MemoryTotal / 1024 / 1024 / 1024
      const FreeMemory = TotalMemory - UsedMemory
      const AllocatedMemory = action.payload.MemoryAllocated / 1024

      state.data.cpu.push({
          name: format(new Date(), "H:mm:ss"),
          Used: UsedCPU,
          Allocated: AllocatedCPU,
          Idle: IdleCPU,
      })
      state.data.memory.push({
          name: format(new Date(), "H:mm:ss"),
          Used: UsedMemory,
          Allocated: AllocatedMemory,
          Free: FreeMemory
      })

      if (state.data.cpu.length > 60) {
        state.data.cpu.splice(0, 1)
        state.data.memory.splice(0, 1)
      }

      return Object.assign({}, state)
    default:
  }
  return state
}

function prefillData(data) {
  for (let i = 0; i < 60; i++) {
    data.cpu.push({ name: "", Used: 0, Allocated: 0, Idle: 0 })
    data.memory.push({ name: "", Used: 0, Allocated: 0, Free: 0 })
  }

  return data
}






export function ErrorNotificationReducer(state = {}, action) {
  switch (action.type) {
    case APP_CLEAR_ERROR_NOTIFICATION:
      return {}
    case APP_ERROR_NOTIFICATION:
      return {
        message: action.payload,
        index: action.index
      }
  }
  return state
}

export function SuccessNotificationReducer(state = {}, action) {
  switch (action.type) {
    case APP_CLEAR_SUCCESS_NOTIFICATION:
      return {}
    case APP_SUCCESS_NOTIFICATION:
      return {
        message: action.payload,
        index: action.index
      }
  }

  return state
}

export function AppErrorReducer(state = {}, action) {
  switch (action.type) {
    case APP_ERROR:
      return action.payload
    default:
  }
  return state
}

export function AppDrawer(state = false, action) {
  switch (action.type) {
    case APP_DRAWER_OPEN:
      return true
    case APP_DRAWER_CLOSE:
      return false
    default:
      return state
  }
}
