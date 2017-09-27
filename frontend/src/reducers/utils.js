import format from "date-fns/format"

export function calculateNodeStats(state, payload, AmountDataPoints) {
  if (!state.data) {
    state.data = {
      cpu: [],
      memory: [],
    }
    state.data = prefillData(state.data, AmountDataPoints)
  }

  const AllocatedCPU = payload.CPUAllocatedMHz / payload.CPUTotalMHz * 100
  const IdleCPU = payload.CPUIdleTime / payload.CPUCores
  const UsedCPU = 100 - IdleCPU

  const UsedMemory = payload.MemoryUsed / 1024 / 1024 / 1024
  const TotalMemory = payload.MemoryTotal / 1024 / 1024 / 1024
  const FreeMemory = TotalMemory - UsedMemory
  const AllocatedMemory = payload.MemoryAllocated / 1024

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

  if (state.data.cpu.length > AmountDataPoints) {
    state.data.cpu.splice(0, 1)
    state.data.memory.splice(0, 1)
  }

  return state
}

function prefillData(data, amount=30) {
  for (let i = 0; i < amount; i++) {
    data.cpu.push({ name: "", Used: 0, Allocated: 0, Idle: 0 })
    data.memory.push({ name: "", Used: 0, Allocated: 0, Free: 0 })
  }

  return data
}
