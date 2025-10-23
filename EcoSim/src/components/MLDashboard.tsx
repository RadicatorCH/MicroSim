import React, { useEffect, useState } from 'react'
import { useMLStore } from '../stores/mlStore'
import { BarChart3, TrendingUp, Users, Building2, Brain, Activity } from 'lucide-react'

interface MLDashboardProps {
  className?: string
}

export const MLDashboard: React.FC<MLDashboardProps> = ({ className = '' }) => {
  const {
    simulationStatus,
    isBackendConnected,
    isLoading,
    personData,
    companyData,
    analysisResults,
    checkBackendConnection,
    refreshMLData,
    analyzePersonTrends,
    analyzeCompanyPerformance,
  } = useMLStore()

  const [selectedTab, setSelectedTab] = useState<'overview' | 'predictions' | 'trends' | 'analysis'>('overview')

  useEffect(() => {
    checkBackendConnection()
    const interval = setInterval(() => {
      if (isBackendConnected) {
        refreshMLData()
        analyzePersonTrends()
        analyzeCompanyPerformance()
      }
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [isBackendConnected])

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: BarChart3 },
    { id: 'predictions', label: 'ML-Vorhersagen', icon: Brain },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'analysis', label: 'Analyse', icon: Activity },
  ]

  if (!isBackendConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            MicroSim Backend nicht verbunden
          </h3>
          <p className="text-gray-600 mb-4">
            Stellen Sie sicher, dass der MicroSim API Server läuft:
          </p>
          <code className="bg-gray-100 p-2 rounded text-sm">
            python api_server.py
          </code>
          <button
            onClick={checkBackendConnection}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Verbindung prüfen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Brain className="text-blue-500" size={24} />
            ML-Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isBackendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isBackendConnected ? 'Verbunden' : 'Getrennt'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'overview' && <OverviewTab simulationStatus={simulationStatus} />}
        {selectedTab === 'predictions' && <PredictionsTab />}
        {selectedTab === 'trends' && <TrendsTab analysisResults={analysisResults} />}
        {selectedTab === 'analysis' && <AnalysisTab personData={personData} companyData={companyData} />}
      </div>
    </div>
  )
}

const OverviewTab: React.FC<{ simulationStatus: any }> = ({ simulationStatus }) => {
  if (!simulationStatus) {
    return <div className="text-center text-gray-500">Keine Simulationsdaten verfügbar</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Users className="text-blue-500" size={20} />
          <span className="font-medium text-blue-800">Personen</span>
        </div>
        <div className="text-2xl font-bold text-blue-900">{simulationStatus.entities.persons}</div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="text-green-500" size={20} />
          <span className="font-medium text-green-800">Unternehmen</span>
        </div>
        <div className="text-2xl font-bold text-green-900">{simulationStatus.entities.companies}</div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="text-purple-500" size={20} />
          <span className="font-medium text-purple-800">Regionen</span>
        </div>
        <div className="text-2xl font-bold text-purple-900">{simulationStatus.entities.regions}</div>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-orange-500" size={20} />
          <span className="font-medium text-orange-800">Tick</span>
        </div>
        <div className="text-2xl font-bold text-orange-900">{simulationStatus.tick_count}</div>
      </div>
    </div>
  )
}

const PredictionsTab: React.FC = () => {
  const { predictions, predictIncome, predictProductivity } = useMLStore()
  const [inputFeatures, setInputFeatures] = useState({
    bildung: 75,
    gesundheit: 80,
    alter: 35,
    region_bildung: 70,
  })

  const handlePredictIncome = () => {
    predictIncome(inputFeatures)
  }

  const handlePredictProductivity = () => {
    predictProductivity(inputFeatures)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">ML-Features eingeben</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bildung</label>
              <input
                type="number"
                value={inputFeatures.bildung}
                onChange={(e) => setInputFeatures({ ...inputFeatures, bildung: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gesundheit</label>
              <input
                type="number"
                value={inputFeatures.gesundheit}
                onChange={(e) => setInputFeatures({ ...inputFeatures, gesundheit: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alter</label>
              <input
                type="number"
                value={inputFeatures.alter}
                onChange={(e) => setInputFeatures({ ...inputFeatures, alter: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="18"
                max="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region Bildung</label>
              <input
                type="number"
                value={inputFeatures.region_bildung}
                onChange={(e) => setInputFeatures({ ...inputFeatures, region_bildung: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Predictions */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Einkommensvorhersage</h3>
            <button
              onClick={handlePredictIncome}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
            >
              Vorhersage berechnen
            </button>
            {predictions.income && (
              <div className="mt-2">
                <div className="text-2xl font-bold text-blue-900">
                  {predictions.income.predicted_income?.toFixed(2)}€
                </div>
                <div className="text-sm text-blue-700">
                  Modell: {predictions.income.model_type}
                </div>
              </div>
            )}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Produktivitätsvorhersage</h3>
            <button
              onClick={handlePredictProductivity}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2"
            >
              Vorhersage berechnen
            </button>
            {predictions.productivity && (
              <div className="mt-2">
                <div className="text-2xl font-bold text-green-900">
                  {predictions.productivity.predicted_productivity?.toFixed(3)}
                </div>
                <div className="text-sm text-green-700">
                  Modell: {predictions.productivity.model_type}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const TrendsTab: React.FC<{ analysisResults: any }> = ({ analysisResults }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person Trends */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Personen-Trends</h3>
          {analysisResults.personTrends ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittliches Einkommen:</span>
                <span className="font-medium">
                  {analysisResults.personTrends.income_trend[analysisResults.personTrends.income_trend.length - 1]?.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittliche Produktivität:</span>
                <span className="font-medium">
                  {analysisResults.personTrends.productivity_trend[analysisResults.personTrends.productivity_trend.length - 1]?.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittliche Bildung:</span>
                <span className="font-medium">
                  {analysisResults.personTrends.education_trend[analysisResults.personTrends.education_trend.length - 1]?.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittliche Gesundheit:</span>
                <span className="font-medium">
                  {analysisResults.personTrends.health_trend[analysisResults.personTrends.health_trend.length - 1]?.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Keine Trenddaten verfügbar</div>
          )}
        </div>

        {/* Company Performance */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Unternehmens-Performance</h3>
          {analysisResults.companyPerformance ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittlicher Profit:</span>
                <span className="font-medium">
                  {analysisResults.companyPerformance.profit_trend[analysisResults.companyPerformance.profit_trend.length - 1]?.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittliche Produktivität:</span>
                <span className="font-medium">
                  {analysisResults.companyPerformance.productivity_trend[analysisResults.companyPerformance.productivity_trend.length - 1]?.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Durchschnittliche Mitarbeiter:</span>
                <span className="font-medium">
                  {analysisResults.companyPerformance.employee_trend[analysisResults.companyPerformance.employee_trend.length - 1]?.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Keine Performance-Daten verfügbar</div>
          )}
        </div>
      </div>
    </div>
  )
}

const AnalysisTab: React.FC<{ personData: any[]; companyData: any[] }> = ({ personData, companyData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person Data Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Personen-Daten ({personData.length})</h3>
          {personData.length > 0 ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Durchschnittsalter:</span>
                <span>{(personData.reduce((sum, p) => sum + p.alter, 0) / personData.length).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Durchschnittsbildung:</span>
                <span>{(personData.reduce((sum, p) => sum + p.bildung, 0) / personData.length).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Durchschnittseinkommen:</span>
                <span>{(personData.reduce((sum, p) => sum + p.einkommen, 0) / personData.length).toFixed(2)}€</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Keine Personendaten verfügbar</div>
          )}
        </div>

        {/* Company Data Summary */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-4">Unternehmens-Daten ({companyData.length})</h3>
          {companyData.length > 0 ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Durchschnittliche Mitarbeiter:</span>
                <span>{(companyData.reduce((sum, c) => sum + c.mitarbeiter_anzahl, 0) / companyData.length).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Durchschnittliches Konto:</span>
                <span>{(companyData.reduce((sum, c) => sum + c.konto, 0) / companyData.length).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between">
                <span>Durchschnittliche Produktivität:</span>
                <span>{(companyData.reduce((sum, c) => sum + c.durchschnittliche_mitarbeiterqualitaet, 0) / companyData.length).toFixed(3)}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Keine Unternehmensdaten verfügbar</div>
          )}
        </div>
      </div>
    </div>
  )
}
