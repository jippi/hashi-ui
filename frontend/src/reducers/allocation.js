import format from "date-fns/format"
import {
  NOMAD_FETCHED_ALLOC,
  NOMAD_FETCHED_ALLOCATION_HEALTH,
  NOMAD_FETCHED_ALLOCS,
  NOMAD_UNWATCH_ALLOC,
  NOMAD_UNWATCH_ALLOCATION_HEALTH,
  NOMAD_FETCHED_ALLOC_STATS,
  NOMAD_FETCHED_ALLOC_STATS_SIMPLE,
  NOMAD_UNWATCH_ALLOC_STATS
} from "../sagas/event"

export function AllocInfoReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_UNWATCH_ALLOC:
      return {}

    case NOMAD_FETCHED_ALLOC: {
      const allocation = action.payload
      allocation.TaskGroupId = `${allocation.JobID}.${allocation.TaskGroup}`
      return allocation
    }

    default:
  }

  return state
}

export function AllocListReducer(state = [], action) {
  switch (action.type) {
    case NOMAD_FETCHED_ALLOCS: {
      const allocations = action.payload.map(allocation =>
        Object.assign({}, allocation, {
          TaskGroupId: `${allocation.JobID}.${allocation.TaskGroup}`
        })
      )

      return allocations
    }
    default:
  }

  return state
}

export function AllocHealthReducer(state = {}, action) {
  switch (action.type) {
    case NOMAD_FETCHED_ALLOCATION_HEALTH: {
      state[action.payload.ID] = action.payload
      return Object.assign({}, state)
    }

    case NOMAD_UNWATCH_ALLOCATION_HEALTH: {
      delete state[action.payload.id]
      return Object.assign({}, state)
    }

    default:
  }

  return state
}

export function AllocStatsReducer(state = {}, action) {
  let payload,
    allocationID = undefined

  if (action.payload) {
    payload = action.payload
    allocationID = payload.ID
  }

  switch (action.type) {
    case NOMAD_FETCHED_ALLOC_STATS_SIMPLE:
      if (!(allocationID in state)) {
        state[allocationID] = {
          CPU: { Used: 0, Allocated: 0 },
          Memory: { Used: 0, Allocated: 0 }
        }
      }

      state[allocationID] = {
        CPU: {
          Used: payload.Stats.ResourceUsage.CpuStats.TotalTicks,
          Allocated: payload.Resources.CPU
        },
        Memory: {
          Used:
            (payload.Stats.ResourceUsage.MemoryStats.RSS +
              payload.Stats.ResourceUsage.MemoryStats.Cache +
              payload.Stats.ResourceUsage.MemoryStats.Swap) /
            1024 /
            1024,
          Allocated: payload.Resources.MemoryMB
        }
      }

      return Object.assign({}, state)

    case NOMAD_FETCHED_ALLOC_STATS:
      if (!(allocationID in state)) {
        state[allocationID] = {
          Global: {},
          Task: {}
        }
      }

      state[allocationID].Global = computeResourceStats(
        state[allocationID].Global,
        payload.Stats.ResourceUsage,
        payload.Resources
      )

      // only bother with per-task resources if there is more than one
      const tasks = Object.keys(payload.Stats.Tasks)
      if (tasks.length > 1) {
        tasks.map((key, index) => {
          state[allocationID].Task[key] = computeResourceStats(
            state[allocationID].Task[key],
            payload.Stats.Tasks[key].ResourceUsage,
            payload.TaskResources[key]
          )
        })
      }

      state[allocationID] = Object.assign({}, state[allocationID])
      return Object.assign({}, state)

    case NOMAD_UNWATCH_ALLOC_STATS:
      delete state[action.payload.ID]
      return Object.assign({}, state)

    default:
      return state
  }

  return state
}

function computeResourceStats(state = {}, stats, resources) {
  let cpu = {
    name: format(new Date(), "H:mm:ss"),
    Used: formatNumber(stats.CpuStats.TotalTicks),
    System: formatNumber(stats.CpuStats.SystemMode),
    User: formatNumber(stats.CpuStats.UserMode),
    Allocated: formatNumber(resources.CPU)
  }

  let mem = {
    name: format(new Date(), "H:mm:ss"),
    RSS: formatNumber(stats.MemoryStats.RSS / 1024 / 1024),
    Cache: formatNumber(stats.MemoryStats.Cache / 1024 / 1024),
    Swap: formatNumber(stats.MemoryStats.Swap / 1024 / 1024),
    Allocated: formatNumber(resources.MemoryMB)
  }

  if (!state.cpu) {
    state.cpu = []
    state.memory = []

    state = prefillData(state)
  }

  state.cpu.push(cpu)
  state.memory.push(mem)

  if (state.cpu.length > 300) {
    state.cpu.splice(0, 1)
    state.memory.splice(0, 1)
  }

  // remove the intiial prefill data
  if (state.cpu.filter(v => v.name == "").length > 0) {
    state.cpu.splice(0, 1)
    state.memory.splice(0, 1)
  }

  return state
}

function prefillData(data) {
  for (let i = 0; i < 60; i++) {
    data.cpu.push({ name: "", Used: 0, System: 0, User: 0 })
    data.memory.push({ name: "", RSS: 0, Cache: 0, Swap: 0 })
  }

  return data
}

function formatNumber(i) {
  return Math.round(i)
}
