/**
 * API Service für MicroSim Backend Integration
 * Stellt alle notwendigen API-Calls für ML-Funktionalitäten bereit
 */

const API_BASE_URL = 'http://localhost:5000/api';

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

export interface PersonData {
  person_id: string;
  alter: number;
  bildung: number;
  gesundheit: number;
  einkommen: number;
  arbeitsproduktivitaet: number;
  region_bildung: number;
  hat_arbeitgeber: number;
  region: string;
  nation: string;
  tick: number;
  timestamp: number;
}

export interface CompanyData {
  company_id: string;
  mitarbeiter_anzahl: number;
  maschinen_anzahl: number;
  konto: number;
  durchschnittliche_mitarbeiterqualitaet: number;
  lager_gesamt: number;
  produkte_anzahl: number;
  region: string;
  nation: string;
  tick: number;
  timestamp: number;
}

export interface RegionData {
  region_id: string;
  bildung: number;
  bevoelkerung: number;
  unternehmen_anzahl: number;
  rohstoffe_gesamt: number;
  durchschnittliche_mitarbeiterqualitaet: number;
  nation: string;
  tick: number;
  timestamp: number;
}

export interface MLPrediction {
  predicted_income?: number;
  predicted_productivity?: number;
  features_used: string[];
  model_type: string;
}

export interface FeatureSummary {
  features: string[];
  statistics: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
    count: number;
  }>;
  total_records: number;
}

class MicroSimAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Simulation Control
  async startSimulation(): Promise<{ status: string; message: string }> {
    return this.request('/simulation/start', { method: 'POST' });
  }

  async stopSimulation(): Promise<{ status: string; message: string }> {
    return this.request('/simulation/stop', { method: 'POST' });
  }

  async getSimulationStatus(): Promise<SimulationStatus> {
    return this.request('/simulation/status');
  }

  async getHealthStatus(): Promise<{ status: string; simulation_running: boolean; tick_count: number }> {
    return this.request('/health');
  }

  // ML Data Access
  async getMLData(entityType: 'persons' | 'companies' | 'regions'): Promise<{
    data: any[];
    columns: string[];
    shape: [number, number];
  }> {
    return this.request(`/ml/data/${entityType}`);
  }

  async getFeatureSummary(entityType: 'persons' | 'companies' | 'regions'): Promise<FeatureSummary> {
    return this.request(`/ml/features/${entityType}`);
  }

  // ML Predictions
  async predictIncome(features: Record<string, number>): Promise<MLPrediction> {
    return this.request('/ml/predictions/income', {
      method: 'POST',
      body: JSON.stringify({ features }),
    });
  }

  async predictProductivity(features: Record<string, number>): Promise<MLPrediction> {
    return this.request('/ml/predictions/productivity', {
      method: 'POST',
      body: JSON.stringify({ features }),
    });
  }

  // Entity Data
  async getEntities(): Promise<{
    persons: any[];
    companies: any[];
    regions: any[];
    nations: any[];
  }> {
    return this.request('/simulation/entities');
  }

  // Utility Methods
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.getHealthStatus();
      return true;
    } catch {
      return false;
    }
  }

  // Data Processing Helpers
  async getPersonData(): Promise<PersonData[]> {
    const response = await this.getMLData('persons');
    return response.data as PersonData[];
  }

  async getCompanyData(): Promise<CompanyData[]> {
    const response = await this.getMLData('companies');
    return response.data as CompanyData[];
  }

  async getRegionData(): Promise<RegionData[]> {
    const response = await this.getMLData('regions');
    return response.data as RegionData[];
  }

  // ML Analysis Helpers
  async analyzePersonTrends(): Promise<{
    income_trend: number[];
    productivity_trend: number[];
    education_trend: number[];
    health_trend: number[];
    ticks: number[];
  }> {
    const data = await this.getPersonData();
    
    if (data.length === 0) {
      return {
        income_trend: [],
        productivity_trend: [],
        education_trend: [],
        health_trend: [],
        ticks: [],
      };
    }

    // Gruppiere nach Tick und berechne Durchschnittswerte
    const tickGroups = data.reduce((acc, person) => {
      if (!acc[person.tick]) {
        acc[person.tick] = [];
      }
      acc[person.tick].push(person);
      return acc;
    }, {} as Record<number, PersonData[]>);

    const ticks = Object.keys(tickGroups).map(Number).sort();
    
    const income_trend = ticks.map(tick => {
      const persons = tickGroups[tick];
      return persons.reduce((sum, p) => sum + p.einkommen, 0) / persons.length;
    });

    const productivity_trend = ticks.map(tick => {
      const persons = tickGroups[tick];
      return persons.reduce((sum, p) => sum + p.arbeitsproduktivitaet, 0) / persons.length;
    });

    const education_trend = ticks.map(tick => {
      const persons = tickGroups[tick];
      return persons.reduce((sum, p) => sum + p.bildung, 0) / persons.length;
    });

    const health_trend = ticks.map(tick => {
      const persons = tickGroups[tick];
      return persons.reduce((sum, p) => sum + p.gesundheit, 0) / persons.length;
    });

    return {
      income_trend,
      productivity_trend,
      education_trend,
      health_trend,
      ticks,
    };
  }

  async analyzeCompanyPerformance(): Promise<{
    profit_trend: number[];
    productivity_trend: number[];
    employee_trend: number[];
    ticks: number[];
  }> {
    const data = await this.getCompanyData();
    
    if (data.length === 0) {
      return {
        profit_trend: [],
        productivity_trend: [],
        employee_trend: [],
        ticks: [],
      };
    }

    const tickGroups = data.reduce((acc, company) => {
      if (!acc[company.tick]) {
        acc[company.tick] = [];
      }
      acc[company.tick].push(company);
      return acc;
    }, {} as Record<number, CompanyData[]>);

    const ticks = Object.keys(tickGroups).map(Number).sort();
    
    const profit_trend = ticks.map(tick => {
      const companies = tickGroups[tick];
      return companies.reduce((sum, c) => sum + c.konto, 0) / companies.length;
    });

    const productivity_trend = ticks.map(tick => {
      const companies = tickGroups[tick];
      return companies.reduce((sum, c) => sum + c.durchschnittliche_mitarbeiterqualitaet, 0) / companies.length;
    });

    const employee_trend = ticks.map(tick => {
      const companies = tickGroups[tick];
      return companies.reduce((sum, c) => sum + c.mitarbeiter_anzahl, 0) / companies.length;
    });

    return {
      profit_trend,
      productivity_trend,
      employee_trend,
      ticks,
    };
  }
}

// Singleton Instance
export const microSimAPI = new MicroSimAPI();

// Export für direkte Verwendung
export default microSimAPI;
