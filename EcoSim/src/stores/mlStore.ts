import { create } from 'zustand'
import { supabaseMLAPI, SimulationStatus, MLPrediction, PersonFeatures } from '../services/supabaseAPI'

interface MLDataState {
  // Simulation Status
  simulationStatus: SimulationStatus | null
  isBackendConnected: boolean
  isLoading: boolean
  
  // ML Data
  personData: any[]
  companyData: any[]
  regionData: any[]
  
  // ML Predictions
  predictions: {
    income: MLPrediction | null
    productivity: MLPrediction | null
    credit: MLPrediction | null
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
  predictIncome: (features: PersonFeatures) => Promise<void>
  predictProductivity: (features: PersonFeatures) => Promise<void>
  predictCreditWorthiness: (features: PersonFeatures) => Promise<void>
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
    credit: null,
  },
  analysisResults: {
    personTrends: null,
    companyPerformance: null,
  },

  // Actions
  checkBackendConnection: async () => {
    try {
      const isConnected = await supabaseMLAPI.healthCheck()
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
      const result = await supabaseMLAPI.startSimulation()
      if (result.success) {
        await get().refreshSimulationStatus()
      }
    } catch (error) {
      console.error('Failed to start simulation:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  stopSimulation: async () => {
    set({ isLoading: true })
    try {
      const result = await supabaseMLAPI.stopSimulation()
      if (result.success) {
        await get().refreshSimulationStatus()
      }
    } catch (error) {
      console.error('Failed to stop simulation:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  refreshSimulationStatus: async () => {
    try {
      const status = await supabaseMLAPI.getSimulationStatus()
      set({ simulationStatus: status })
    } catch (error) {
      console.error('Failed to refresh simulation status:', error)
    }
  },

  refreshMLData: async () => {
    set({ isLoading: true })
    try {
      const [personData, companyData, regionData] = await Promise.all([
        supabaseMLAPI.getMLData('persons'),
        supabaseMLAPI.getMLData('companies'),
        supabaseMLAPI.getMLData('regions'),
      ])
      
      set({ 
        personData: personData.data,
        companyData: companyData.data,
        regionData: regionData.data,
      })
    } catch (error) {
      console.error('Failed to refresh ML data:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  predictIncome: async (features: PersonFeatures) => {
    try {
      const prediction = await supabaseMLAPI.predictIncome(features)
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

  predictProductivity: async (features: PersonFeatures) => {
    try {
      const prediction = await supabaseMLAPI.predictProductivity(features)
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

  predictCreditWorthiness: async (features: PersonFeatures) => {
    try {
      const prediction = await supabaseMLAPI.predictCreditWorthiness(features)
      set(state => ({
        predictions: {
          ...state.predictions,
          credit: prediction,
        }
      }))
    } catch (error) {
      console.error('Credit worthiness prediction failed:', error)
    }
  },

  analyzePersonTrends: async () => {
    try {
      // Simple trend analysis based on available data
      const { personData } = get()
      if (personData.length === 0) return

      const ticks = personData.map((p: any) => p.tick).sort((a, b) => a - b)
      const income_trend = personData.map((p: any) => p.income)
      const productivity_trend = personData.map((p: any) => p.productivity)
      const education_trend = personData.map((p: any) => p.education)
      const health_trend = personData.map((p: any) => p.health)

      set(state => ({
        analysisResults: {
          ...state.analysisResults,
          personTrends: {
            income_trend,
            productivity_trend,
            education_trend,
            health_trend,
            ticks,
          },
        }
      }))
    } catch (error) {
      console.error('Person trends analysis failed:', error)
    }
  },

  analyzeCompanyPerformance: async () => {
    try {
      // Simple performance analysis based on available data
      const { companyData } = get()
      if (companyData.length === 0) return

      const ticks = companyData.map((c: any) => c.tick).sort((a, b) => a - b)
      const profit_trend = companyData.map((c: any) => c.account_balance)
      const productivity_trend = companyData.map((c: any) => c.avg_employee_quality)
      const employee_trend = companyData.map((c: any) => c.employee_count)

      set(state => ({
        analysisResults: {
          ...state.analysisResults,
          companyPerformance: {
            profit_trend,
            productivity_trend,
            employee_trend,
            ticks,
          },
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
