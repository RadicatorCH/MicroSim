import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Truck, Ship, Train } from 'lucide-react'

export interface TransportNodeData {
  label: string
  transportType: 'road' | 'water' | 'rail'
  capacity: number
  speed: number
  cost: number
}

export const TransportNode: React.FC<NodeProps<TransportNodeData>> = ({ data, selected }) => {
  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'road': return <Truck size={20} />
      case 'water': return <Ship size={20} />
      case 'rail': return <Train size={20} />
      default: return <Truck size={20} />
    }
  }

  const getTransportColor = (type: string) => {
    switch (type) {
      case 'road': return '#F59E0B'
      case 'water': return '#3B82F6'
      case 'rail': return '#6B7280'
      default: return '#6B7280'
    }
  }

  return (
    <div 
      className={`react-flow__node ${selected ? 'selected' : ''}`}
      style={{
        background: 'white',
        border: `2px solid ${getTransportColor(data.transportType)}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '160px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ color: getTransportColor(data.transportType) }}>
          {getTransportIcon(data.transportType)}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>
            {data.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'capitalize' }}>
            {data.transportType} Transport
          </div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#6B7280' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Kapazität:</span>
          <span>{data.capacity}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>Geschwindigkeit:</span>
          <span>{data.speed}x</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Kosten:</span>
          <span>{data.cost}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
