import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Warehouse } from 'lucide-react'

export interface StorageNodeData {
  label: string
  storageType: 'general' | 'food' | 'materials' | 'tools'
  capacity: number
  storedResources: Record<string, number>
}

export const StorageNode: React.FC<NodeProps<StorageNodeData>> = ({ data, selected }) => {
  const getStorageIcon = (type: string) => {
    return <Warehouse size={20} />
  }

  const getStorageColor = (type: string) => {
    switch (type) {
      case 'general': return '#6B7280'
      case 'food': return '#F59E0B'
      case 'materials': return '#8B4513'
      case 'tools': return '#2F4F4F'
      default: return '#6B7280'
    }
  }

  const totalStored = Object.values(data.storedResources).reduce((sum, amount) => sum + amount, 0)
  const percentage = (totalStored / data.capacity) * 100

  return (
    <div 
      className={`react-flow__node ${selected ? 'selected' : ''}`}
      style={{
        background: 'white',
        border: `2px solid ${getStorageColor(data.storageType)}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '160px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ color: getStorageColor(data.storageType) }}>
          {getStorageIcon(data.storageType)}
        </div>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>
            {data.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'capitalize' }}>
            {data.storageType} Lager
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ color: '#6B7280' }}>Kapazität</span>
          <span style={{ fontWeight: '500' }}>{totalStored}/{data.capacity}</span>
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
            background: getStorageColor(data.storageType),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#6B7280' }}>
        {Object.entries(data.storedResources).map(([resource, amount]) => (
          <div key={resource} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ textTransform: 'capitalize' }}>{resource}:</span>
            <span>{amount}</span>
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
