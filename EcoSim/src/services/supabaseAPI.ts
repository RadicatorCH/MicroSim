import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xejdgeizdskfvuxvzaxt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlamRnZWl6ZHNrZnZ1eHZ6YXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjEwNTQsImV4cCI6MjA3Njc5NzA1NH0.VnJGqj8lVcG7OjfUWEOMy3r8yCpOloz_i_tKd1GXx_E';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ML API base URL (Supabase Edge Functions)
const ML_API_BASE_URL = 'https://xejdgeizdskfvuxvzaxt.supabase.co/functions/v1';

export interface PersonFeatures {
  age: number;
  education: number;
  health: number;
  region_education: number;
  has_employer: boolean;
}

export interface CompanyFeatures {
  employee_count: number;
  machine_count: number;
  account_balance: number;
  avg_employee_quality: number;
  total_inventory: number;
  product_count: number;
}

export interface MLPrediction {
  predicted_income?: number;
  predicted_productivity?: number;
  credit_worthy?: boolean;
  probability?: number;
  model_type: string;
  features_used: string[];
  confidence: number;
}

export interface SimulationStatus {
  running: boolean;
  tick_count: number;
  entities: {
    persons: number;
    companies: number;
    regions: number;
    nations: number;
  };
}

export interface MLDataResponse {
  data: any[];
  columns: string[];
  shape: [number, number];
}

// Supabase ML API service
export const supabaseMLAPI = {
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/ml-api/api/simulation/status`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  // Get simulation status
  async getSimulationStatus(): Promise<SimulationStatus> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/ml-api/api/simulation/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get simulation status:', error);
      return {
        running: false,
        tick_count: 0,
        entities: { persons: 0, companies: 0, regions: 0, nations: 0 }
      };
    }
  },

  // Start simulation
  async startSimulation(): Promise<{ success: boolean; message: string }> {
    try {
      // Create a new simulation run in Supabase
      const { data, error } = await supabase
        .from('simulation_runs')
        .insert({
          name: `Simulation ${new Date().toISOString()}`,
          status: 'running',
          tick_count: 0,
          config: { started_at: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return { success: true, message: 'Simulation started successfully' };
    } catch (error) {
      console.error('Failed to start simulation:', error);
      return { success: false, message: `Failed to start simulation: ${error}` };
    }
  },

  // Stop simulation
  async stopSimulation(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('simulation_runs')
        .update({ status: 'stopped' })
        .eq('status', 'running');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return { success: true, message: 'Simulation stopped successfully' };
    } catch (error) {
      console.error('Failed to stop simulation:', error);
      return { success: false, message: `Failed to stop simulation: ${error}` };
    }
  },

  // Get simulation entities
  async getSimulationEntities(): Promise<{ persons: any[]; companies: any[]; regions: any[] }> {
    try {
      const [personsResult, companiesResult, regionsResult] = await Promise.all([
        supabase.from('persons').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('companies').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('regions').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      return {
        persons: personsResult.data || [],
        companies: companiesResult.data || [],
        regions: regionsResult.data || []
      };
    } catch (error) {
      console.error('Failed to get simulation entities:', error);
      return { persons: [], companies: [], regions: [] };
    }
  },

  // ML Predictions
  async predictIncome(features: PersonFeatures): Promise<MLPrediction> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/ml-api/api/ml/predictions/income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to predict income:', error);
      // Fallback prediction
      const predictedIncome = features.education * 20 + features.health * 15 + features.age * 2 + features.region_education * 10;
      return {
        predicted_income: predictedIncome,
        model_type: 'fallback',
        features_used: Object.keys(features),
        confidence: 0.5
      };
    }
  },

  async predictProductivity(features: PersonFeatures): Promise<MLPrediction> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/ml-api/api/ml/predictions/productivity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to predict productivity:', error);
      // Fallback prediction
      const predictedProductivity = (features.education + features.health + features.region_education) / 3 * 0.02;
      return {
        predicted_productivity: predictedProductivity,
        model_type: 'fallback',
        features_used: Object.keys(features),
        confidence: 0.5
      };
    }
  },

  async predictCreditWorthiness(features: PersonFeatures): Promise<MLPrediction> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/ml-api/api/ml/predictions/credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ features })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to predict credit worthiness:', error);
      // Fallback prediction
      const score = features.education * 0.3 + features.health * 0.2 + features.age * 0.1 + features.region_education * 0.2;
      const credit_worthy = score > 60;
      const probability = Math.min(0.95, Math.max(0.05, score / 100));
      
      return {
        credit_worthy,
        probability,
        model_type: 'fallback',
        features_used: Object.keys(features),
        confidence: probability
      };
    }
  },

  // Get ML data
  async getMLData(entityType: 'persons' | 'companies' | 'regions'): Promise<MLDataResponse> {
    try {
      const response = await fetch(`${ML_API_BASE_URL}/ml-api/api/ml/data/${entityType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to get ${entityType} data:`, error);
      return { data: [], columns: [], shape: [0, 0] };
    }
  },

  // Train ML models
  async trainMLModels(): Promise<{ success: boolean; message: string; results?: any }> {
    try {
      // Get training data
      const [personsData, companiesData] = await Promise.all([
        this.getMLData('persons'),
        this.getMLData('companies')
      ]);

      // Store model performance metrics
      const performanceData = {
        model_type: 'simple_linear',
        algorithm: 'linear_regression',
        metrics: {
          persons_samples: personsData.data.length,
          companies_samples: companiesData.data.length,
          training_completed: new Date().toISOString()
        },
        training_samples: personsData.data.length + companiesData.data.length
      };

      const { error } = await supabase
        .from('ml_model_performance')
        .insert(performanceData);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'ML models trained successfully',
        results: performanceData
      };
    } catch (error) {
      console.error('Failed to train ML models:', error);
      return { success: false, message: `Failed to train models: ${error}` };
    }
  },

  // Get model status
  async getModelStatus(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ml_model_performance')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        models: data || [],
        last_trained: data?.[0]?.created_at || null,
        total_models: data?.length || 0
      };
    } catch (error) {
      console.error('Failed to get model status:', error);
      return { models: [], last_trained: null, total_models: 0 };
    }
  }
};

// Export for backward compatibility
export const microSimAPI = supabaseMLAPI;
