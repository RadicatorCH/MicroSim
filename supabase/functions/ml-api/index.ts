import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PersonFeatures {
  age: number;
  education: number;
  health: number;
  region_education: number;
  has_employer: boolean;
}

interface CompanyFeatures {
  employee_count: number;
  machine_count: number;
  account_balance: number;
  avg_employee_quality: number;
  total_inventory: number;
  product_count: number;
}

interface MLPrediction {
  prediction_type: string;
  model_type: string;
  input_features: any;
  prediction_result: any;
  confidence?: number;
}

// Simple ML models (replace with actual ML models in production)
class SimpleMLModels {
  static predictIncome(features: PersonFeatures): number {
    // Simple linear model: income = education * 20 + health * 15 + age * 2 + region_education * 10
    return features.education * 20 + features.health * 15 + features.age * 2 + features.region_education * 10;
  }

  static predictProductivity(features: PersonFeatures): number {
    // Simple model: productivity = (education + health + region_education) / 3 * 0.02
    return (features.education + features.health + features.region_education) / 3 * 0.02;
  }

  static predictCreditWorthiness(features: PersonFeatures): { credit_worthy: boolean; probability: number } {
    // Simple rule-based model
    const score = features.education * 0.3 + features.health * 0.2 + features.age * 0.1 + features.region_education * 0.2;
    const credit_worthy = score > 60;
    const probability = Math.min(0.95, Math.max(0.05, score / 100));
    
    return { credit_worthy, probability };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    switch (path) {
      case '/api/ml/predictions/income':
        return await handleIncomePrediction(req);
      
      case '/api/ml/predictions/productivity':
        return await handleProductivityPrediction(req);
      
      case '/api/ml/predictions/credit':
        return await handleCreditPrediction(req);
      
      case '/api/simulation/status':
        return await handleSimulationStatus(req);
      
      case '/api/ml/data/persons':
        return await handleGetPersonsData(req);
      
      case '/api/ml/data/companies':
        return await handleGetCompaniesData(req);
      
      case '/api/ml/data/regions':
        return await handleGetRegionsData(req);
      
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function handleIncomePrediction(req: Request) {
  const data = await req.json();
  const features: PersonFeatures = data.features;
  
  const predictedIncome = SimpleMLModels.predictIncome(features);
  
  // Store prediction in database
  const prediction: MLPrediction = {
    prediction_type: 'income',
    model_type: 'simple_linear',
    input_features: features,
    prediction_result: { predicted_income: predictedIncome },
    confidence: 0.8
  };
  
  await storePrediction(prediction);
  
  return new Response(JSON.stringify({
    predicted_income: predictedIncome,
    model_type: 'simple_linear',
    features_used: Object.keys(features),
    confidence: 0.8
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleProductivityPrediction(req: Request) {
  const data = await req.json();
  const features: PersonFeatures = data.features;
  
  const predictedProductivity = SimpleMLModels.predictProductivity(features);
  
  // Store prediction in database
  const prediction: MLPrediction = {
    prediction_type: 'productivity',
    model_type: 'simple_linear',
    input_features: features,
    prediction_result: { predicted_productivity: predictedProductivity },
    confidence: 0.8
  };
  
  await storePrediction(prediction);
  
  return new Response(JSON.stringify({
    predicted_productivity: predictedProductivity,
    model_type: 'simple_linear',
    features_used: Object.keys(features),
    confidence: 0.8
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleCreditPrediction(req: Request) {
  const data = await req.json();
  const features: PersonFeatures = data.features;
  
  const result = SimpleMLModels.predictCreditWorthiness(features);
  
  // Store prediction in database
  const prediction: MLPrediction = {
    prediction_type: 'credit_worthiness',
    model_type: 'rule_based',
    input_features: features,
    prediction_result: result,
    confidence: result.probability
  };
  
  await storePrediction(prediction);
  
  return new Response(JSON.stringify({
    credit_worthy: result.credit_worthy,
    probability: result.probability,
    model_type: 'rule_based',
    features_used: Object.keys(features),
    confidence: result.probability
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleSimulationStatus(req: Request) {
  const { data: simulationRuns, error } = await supabase
    .from('simulation_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  const currentRun = simulationRuns?.[0];
  
  if (!currentRun) {
    return new Response(JSON.stringify({
      running: false,
      tick_count: 0,
      entities: { persons: 0, companies: 0, regions: 0, nations: 0 }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
  
  // Get entity counts
  const [personsResult, companiesResult, regionsResult] = await Promise.all([
    supabase.from('persons').select('id', { count: 'exact' }).eq('simulation_run_id', currentRun.id),
    supabase.from('companies').select('id', { count: 'exact' }).eq('simulation_run_id', currentRun.id),
    supabase.from('regions').select('id', { count: 'exact' }).eq('simulation_run_id', currentRun.id)
  ]);
  
  return new Response(JSON.stringify({
    running: currentRun.status === 'running',
    tick_count: currentRun.tick_count,
    entities: {
      persons: personsResult.count || 0,
      companies: companiesResult.count || 0,
      regions: regionsResult.count || 0,
      nations: 1 // Simplified for now
    }
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleGetPersonsData(req: Request) {
  const { data: persons, error } = await supabase
    .from('persons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return new Response(JSON.stringify({
    data: persons || [],
    columns: ['id', 'name', 'age', 'education', 'health', 'income', 'productivity', 'region_name', 'nation_name', 'has_employer', 'region_education', 'tick'],
    shape: [persons?.length || 0, 12]
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleGetCompaniesData(req: Request) {
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return new Response(JSON.stringify({
    data: companies || [],
    columns: ['id', 'name', 'employee_count', 'machine_count', 'account_balance', 'avg_employee_quality', 'total_inventory', 'product_count', 'region_name', 'nation_name', 'tick'],
    shape: [companies?.length || 0, 11]
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleGetRegionsData(req: Request) {
  const { data: regions, error } = await supabase
    .from('regions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return new Response(JSON.stringify({
    data: regions || [],
    columns: ['id', 'name', 'education', 'population', 'company_count', 'total_resources', 'avg_productivity', 'nation_name', 'tick'],
    shape: [regions?.length || 0, 9]
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function storePrediction(prediction: MLPrediction) {
  const { error } = await supabase
    .from('ml_predictions')
    .insert({
      simulation_run_id: await getCurrentSimulationRunId(),
      prediction_type: prediction.prediction_type,
      model_type: prediction.model_type,
      input_features: prediction.input_features,
      prediction_result: prediction.prediction_result,
      confidence: prediction.confidence
    });
  
  if (error) {
    console.error('Error storing prediction:', error);
  }
}

async function getCurrentSimulationRunId(): Promise<string> {
  const { data: simulationRuns, error } = await supabase
    .from('simulation_runs')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error || !simulationRuns?.[0]) {
    // Create a new simulation run if none exists
    const { data: newRun, error: createError } = await supabase
      .from('simulation_runs')
      .insert({ name: 'Auto-generated run', status: 'running' })
      .select('id')
      .single();
    
    if (createError) {
      throw new Error(`Failed to create simulation run: ${createError.message}`);
    }
    
    return newRun.id;
  }
  
  return simulationRuns[0].id;
}
