import React from 'react'
import { Play, Pause, Square } from 'lucide-react'

interface SimulationControlsProps {
  isRunning: boolean
  speed: number
  onStart: () => void
  onPause: () => void
  onStop: () => void
  onSpeedChange: (speed: number) => void
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  speed,
  onStart,
  onPause,
  onStop,
  onSpeedChange
}) => {
  return (
    <div className="simulation-controls">
      {!isRunning ? (
        <button
          className="simulation-button play"
          onClick={onStart}
          title="Simulation starten"
        >
          <Play size={16} />
          Start
        </button>
      ) : (
        <button
          className="simulation-button pause"
          onClick={onPause}
          title="Simulation pausieren"
        >
          <Pause size={16} />
          Pause
        </button>
      )}
      
      <button
        className="simulation-button stop"
        onClick={onStop}
        title="Simulation stoppen"
      >
        <Square size={16} />
        Stop
      </button>

      <div className="simulation-speed">
        <label>Geschwindigkeit:</label>
        <input
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
        <span>x</span>
      </div>
    </div>
  )
}
