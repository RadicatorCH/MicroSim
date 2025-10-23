import React from 'react'
import { Play, Pause, Square, RefreshCw, Brain, Database } from 'lucide-react'
import { useMLStore } from '../stores/mlStore'

interface MLControlsProps {
  className?: string
}

export const MLControls: React.FC<MLControlsProps> = ({ className = '' }) => {
  const {
    simulationStatus,
    isBackendConnected,
    isLoading,
    startSimulation,
    stopSimulation,
    refreshSimulationStatus,
    refreshMLData,
    checkBackendConnection,
  } = useMLStore()

  const handleStart = async () => {
    await startSimulation()
  }

  const handleStop = async () => {
    await stopSimulation()
  }

  const handleRefresh = async () => {
    await Promise.all([
      refreshSimulationStatus(),
      refreshMLData(),
    ])
  }

  const handleReconnect = async () => {
    await checkBackendConnection()
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="text-purple-500" size={20} />
          ML-Simulation Steuerung
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-600">
            {isBackendConnected ? 'Backend verbunden' : 'Backend getrennt'}
          </span>
        </div>
      </div>

      {!isBackendConnected ? (
        <div className="text-center py-4">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-gray-600 mb-3">MicroSim Backend nicht verfügbar</p>
          <button
            onClick={handleReconnect}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Verbindung prüfen
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Simulation Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Simulationsstatus:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                simulationStatus?.running 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {simulationStatus?.running ? 'Läuft' : 'Gestoppt'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tick:</span>
              <span className="text-sm font-medium">{simulationStatus?.tick_count || 0}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!simulationStatus?.running ? (
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Play size={16} />
                {isLoading ? 'Starte...' : 'Simulation starten'}
              </button>
            ) : (
              <button
                onClick={handleStop}
                disabled={isLoading}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Pause size={16} />
                {isLoading ? 'Stoppe...' : 'Simulation stoppen'}
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Aktualisieren
            </button>
          </div>

          {/* Entity Counts */}
          {simulationStatus && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 p-2 rounded text-center">
                <div className="font-medium text-blue-800">{simulationStatus.entities.persons}</div>
                <div className="text-blue-600">Personen</div>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <div className="font-medium text-green-800">{simulationStatus.entities.companies}</div>
                <div className="text-green-600">Unternehmen</div>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <div className="font-medium text-purple-800">{simulationStatus.entities.regions}</div>
                <div className="text-purple-600">Regionen</div>
              </div>
              <div className="bg-orange-50 p-2 rounded text-center">
                <div className="font-medium text-orange-800">{simulationStatus.entities.nations}</div>
                <div className="text-orange-600">Nationen</div>
              </div>
            </div>
          )}

          {/* ML Data Status */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="text-purple-500" size={16} />
              <span className="text-sm font-medium text-purple-800">ML-Daten</span>
            </div>
            <div className="text-xs text-purple-600">
              Daten werden automatisch alle 5 Sekunden aktualisiert
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
