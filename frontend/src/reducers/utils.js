import format from "date-fns/format"

export function calculateNodeStats(state, payload, maxLength) {
  if (!state.data) {
    state.data = {
      cpu: [],
      memory: []
    }
    state.data = prefillData(state.data, maxLength)
  }

  const allocatedCPU = payload.CPUAllocatedMHz / payload.CPUTotalMHz * 100
  const idleCPU = payload.CPUIdleTime / payload.CPUCores
  const usedCPU = 100 - idleCPU

  const usedMemory = payload.MemoryUsed / 1024 / 1024 / 1024
  const totalMemory = payload.MemoryTotal / 1024 / 1024 / 1024
  const freeMemory = totalMemory - usedMemory
  const allocatedMemory = payload.MemoryAllocated / 1024

  state.data.cpu.push({
    name: format(new Date(), "H:mm:ss"),
    Used: formatNumber(usedCPU),
    Allocated: formatNumber(allocatedCPU),
    Idle: formatNumber(idleCPU)
  })

  state.data.memory.push({
    name: format(new Date(), "H:mm:ss"),
    Used: formatNumber(usedMemory),
    Allocated: formatNumber(allocatedMemory),
    Free: formatNumber(freeMemory)
  })

  if (state.data.cpu.length > maxLength) {
    state.data.cpu.splice(0, 1)
    state.data.memory.splice(0, 1)
  }

  return state
}

function prefillData(data, amount = 30) {
  for (let i = 0; i < amount; i++) {
    data.cpu.push({ name: "", Used: 0, Allocated: 0, Idle: 0 })
    data.memory.push({ name: "", Used: 0, Allocated: 0, Free: 0 })
  }

  return data
}

function formatNumber(i) {
  return Math.round(i)
}
