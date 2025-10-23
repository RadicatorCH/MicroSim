import { create } from 'zustand'

interface SimulationState {
  isRunning: boolean
  speed: number
  startSimulation: () => void
  pauseSimulation: () => void
  stopSimulation: () => void
  setSpeed: (speed: number) => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isRunning: false,
  speed: 1,
  startSimulation: () => set({ isRunning: true }),
  pauseSimulation: () => set({ isRunning: false }),
  stopSimulation: () => set({ isRunning: false }),
  setSpeed: (speed: number) => set({ speed }),
}))
