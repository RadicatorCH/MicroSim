import { create } from 'zustand'
import { microSimAPI, SimulationStatus, PersonData, CompanyData, RegionData, MLPrediction } from '../services/microSimAPI'

interface MLDataState {
  // Simulation Status
  simulationStatus: SimulationStatus | null
  isBackendConnected: boolean
  isLoading: boolean
  
  // ML Data
  personData: PersonData[]
  companyData: CompanyData[]
  regionData: RegionData[]
  
  // ML Predictions
  predictions: {
    income: MLPrediction | null
    productivity: MLPrediction | null
  }
  
  // Analysis Results
  analysisResults: {
    personTrends: {
      income_trend: number[]
      productivity_trend: number[]
      education_trend: number[]
      health_trend: number[]
      ticks: number[]
    } | null
    companyPerformance: {
      profit_trend: number[]
      productivity_trend: number[]
      employee_trend: number[]
      ticks: number[]
    } | null
  }
  
  // Actions
  checkBackendConnection: () => Promise<void>
  startSimulation: () => Promise<void>
  stopSimulation: () => Promise<void>
  refreshSimulationStatus: () => Promise<void>
  refreshMLData: () => Promise<void>
  predictIncome: (features: Record<string, number>) => Promise<void>
  predictProductivity: (features: Record<string, number>) => Promise<void>
  analyzePersonTrends: () => Promise<void>
  analyzeCompanyPerformance: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useMLStore = create<MLDataState>((set, get) => ({
  // Initial State
  simulationStatus: null,
  isBackendConnected: false,
  isLoading: false,
  personData: [],
  companyData: [],
  regionData: [],
  predictions: {
    income: null,
    productivity: null,
  },
  analysisResults: {
    personTrends: null,
    companyPerformance: null,
  },

  // Actions
  checkBackendConnection: async () => {
    try {
      const isConnected = await microSimAPI.isBackendAvailable()
      set({ isBackendConnected: isConnected })
      
      if (isConnected) {
        await get().refreshSimulationStatus()
      }
    } catch (error) {
      console.error('Backend connection check failed:', error)
      set({ isBackendConnected: false })
    }
  },

  startSimulation: async () => {
    set({ isLoading: true })
    try {
      await microSimAPI.startSimulation()
      await get().refreshSimulationStatus()
    } catch (error) {
      console.error('Failed to start simulation:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  stopSimulation: async () => {
    set({ isLoading: true })
    try {
      await microSimAPI.stopSimulation()
      await get().refreshSimulationStatus()
    } catch (error) {
      console.error('Failed to stop simulation:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  refreshSimulationStatus: async () => {
    try {
      const status = await microSimAPI.getSimulationStatus()
      set({ simulationStatus: status })
    } catch (error) {
      console.error('Failed to refresh simulation status:', error)
    }
  },

  refreshMLData: async () => {
    set({ isLoading: true })
    try {
      const [personData, companyData, regionData] = await Promise.all([
        microSimAPI.getPersonData(),
        microSimAPI.getCompanyData(),
        microSimAPI.getRegionData(),
      ])
      
      set({ 
        personData,
        companyData,
        regionData,
      })
    } catch (error) {
      console.error('Failed to refresh ML data:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  predictIncome: async (features: Record<string, number>) => {
    try {
      const prediction = await microSimAPI.predictIncome(features)
      set(state => ({
        predictions: {
          ...state.predictions,
          income: prediction,
        }
      }))
    } catch (error) {
      console.error('Income prediction failed:', error)
    }
  },

  predictProductivity: async (features: Record<string, number>) => {
    try {
      const prediction = await microSimAPI.predictProductivity(features)
      set(state => ({
        predictions: {
          ...state.predictions,
          productivity: prediction,
        }
      }))
    } catch (error) {
      console.error('Productivity prediction failed:', error)
    }
  },

  analyzePersonTrends: async () => {
    try {
      const trends = await microSimAPI.analyzePersonTrends()
      set(state => ({
        analysisResults: {
          ...state.analysisResults,
          personTrends: trends,
        }
      }))
    } catch (error) {
      console.error('Person trends analysis failed:', error)
    }
  },

  analyzeCompanyPerformance: async () => {
    try {
      const performance = await microSimAPI.analyzeCompanyPerformance()
      set(state => ({
        analysisResults: {
          ...state.analysisResults,
          companyPerformance: performance,
        }
      }))
    } catch (error) {
      console.error('Company performance analysis failed:', error)
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))
