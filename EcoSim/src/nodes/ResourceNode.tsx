import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { TreePine, Package, Factory, Truck } from 'lucide-react'

export interface ResourceNodeData {
  label: string
  resourceType: 'wood' | 'stone' | 'iron' | 'food' | 'gold'
  amount: number
  maxAmount: number
  productionRate: number
}

export const ResourceNode: React.FC<NodeProps<ResourceNodeData>> = ({ data, selected }) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'wood': return <TreePine size={20} />
      case 'stone': return <Package size={20} />
      case 'iron': return <Package size={20} />
      case 'food': return <Package size={20} />
      case 'gold': return <Package size={20} />
      default: return <Package size={20} />
    }
  }

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'wood': return '#8B4513'
      case 'stone': return '#708090'
      case 'iron': return '#2F4F4F'
      case 'food': return '#228B22'
      case 'gold': return '#FFD700'
      default: return '#6B7280'
    }
  }

  const percentage = (data.amount / data.maxAmount) * 100

  return (
    <div 
      className={`react-flow__node ${selected ? 'selected' : ''}`}
      style={{
        background: 'white',
        border: `2px solid ${getResourceColor(data.resourceType)}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '150px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ color: getResourceColor(data.resourceType) }}>
          {getResourceIcon(data.resourceType)}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>
            {data.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'capitalize' }}>
            {data.resourceType}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ color: '#6B7280' }}>Menge</span>
          <span style={{ fontWeight: '500' }}>{data.amount}/{data.maxAmount}</span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '6px', 
          background: '#E5E7EB', 
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: getResourceColor(data.resourceType),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#6B7280' }}>
        Produktion: {data.productionRate}/s
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
