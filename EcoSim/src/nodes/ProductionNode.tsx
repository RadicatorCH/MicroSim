import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Factory, Settings } from 'lucide-react'

export interface ProductionNodeData {
  label: string
  productionType: 'lumber' | 'tools' | 'weapons' | 'bread' | 'beer'
  inputResources: string[]
  outputResource: string
  productionRate: number
  efficiency: number
}

export const ProductionNode: React.FC<NodeProps<ProductionNodeData>> = ({ data, selected }) => {
  const getProductionIcon = (type: string) => {
    switch (type) {
      case 'lumber': return <Settings size={20} />
      case 'tools': return <Settings size={20} />
      case 'weapons': return <Settings size={20} />
      case 'bread': return <Settings size={20} />
      case 'beer': return <Settings size={20} />
      default: return <Factory size={20} />
    }
  }

  const getProductionColor = (type: string) => {
    switch (type) {
      case 'lumber': return '#8B4513'
      case 'tools': return '#2F4F4F'
      case 'weapons': return '#DC2626'
      case 'bread': return '#F59E0B'
      case 'beer': return '#92400E'
      default: return '#6B7280'
    }
  }

  return (
    <div 
      className={`react-flow__node ${selected ? 'selected' : ''}`}
      style={{
        background: 'white',
        border: `2px solid ${getProductionColor(data.productionType)}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ color: getProductionColor(data.productionType) }}>
          {getProductionIcon(data.productionType)}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>
            {data.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'capitalize' }}>
            {data.productionType}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
          Eingänge:
        </div>
        <div style={{ fontSize: '11px', color: '#374151' }}>
          {data.inputResources.join(', ')}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
          Ausgabe:
        </div>
        <div style={{ fontSize: '11px', color: '#374151', textTransform: 'capitalize' }}>
          {data.outputResource}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280' }}>
        <span>Rate: {data.productionRate}/s</span>
        <span>Effizienz: {Math.round(data.efficiency * 100)}%</span>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
