import React from 'react'
import { Node } from 'reactflow'

interface PropertiesPanelProps {
  selectedNode: Node | null
  onUpdateNode: (nodeId: string, newData: any) => void
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode }) => {
  if (!selectedNode) {
    return (
      <div className="properties-panel">
        <h3>Eigenschaften</h3>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Wähle einen Node aus, um seine Eigenschaften zu bearbeiten.
        </p>
      </div>
    )
  }

  const handleInputChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value })
  }

  const renderResourceProperties = () => (
    <>
      <div className="property-group">
        <label>Name</label>
        <input
          type="text"
          value={selectedNode.data.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
        />
      </div>
      <div className="property-group">
        <label>Ressourcentyp</label>
        <select
          value={selectedNode.data.resourceType || 'wood'}
          onChange={(e) => handleInputChange('resourceType', e.target.value)}
        >
          <option value="wood">Holz</option>
          <option value="stone">Stein</option>
          <option value="iron">Eisen</option>
          <option value="food">Nahrung</option>
          <option value="gold">Gold</option>
        </select>
      </div>
      <div className="property-group">
        <label>Aktuelle Menge</label>
        <input
          type="number"
          value={selectedNode.data.amount || 0}
          onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
        />
      </div>
      <div className="property-group">
        <label>Maximale Menge</label>
        <input
          type="number"
          value={selectedNode.data.maxAmount || 1000}
          onChange={(e) => handleInputChange('maxAmount', parseInt(e.target.value))}
        />
      </div>
      <div className="property-group">
        <label>Produktionsrate (pro Sekunde)</label>
        <input
          type="number"
          step="0.1"
          value={selectedNode.data.productionRate || 1}
          onChange={(e) => handleInputChange('productionRate', parseFloat(e.target.value))}
        />
      </div>
    </>
  )

  const renderProductionProperties = () => (
    <>
      <div className="property-group">
        <label>Name</label>
        <input
          type="text"
          value={selectedNode.data.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
        />
      </div>
      <div className="property-group">
        <label>Produktionstyp</label>
        <select
          value={selectedNode.data.productionType || 'lumber'}
          onChange={(e) => handleInputChange('productionType', e.target.value)}
        >
          <option value="lumber">Bretter</option>
          <option value="tools">Werkzeuge</option>
          <option value="weapons">Waffen</option>
          <option value="bread">Brot</option>
          <option value="beer">Bier</option>
        </select>
      </div>
      <div className="property-group">
        <label>Ausgabe-Ressource</label>
        <input
          type="text"
          value={selectedNode.data.outputResource || ''}
          onChange={(e) => handleInputChange('outputResource', e.target.value)}
        />
      </div>
      <div className="property-group">
        <label>Produktionsrate (pro Sekunde)</label>
        <input
          type="number"
          step="0.1"
          value={selectedNode.data.productionRate || 1}
          onChange={(e) => handleInputChange('productionRate', parseFloat(e.target.value))}
        />
      </div>
      <div className="property-group">
        <label>Effizienz (0-1)</label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={selectedNode.data.efficiency || 0.8}
          onChange={(e) => handleInputChange('efficiency', parseFloat(e.target.value))}
        />
      </div>
    </>
  )

  const renderStorageProperties = () => (
    <>
      <div className="property-group">
        <label>Name</label>
        <input
          type="text"
          value={selectedNode.data.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
        />
      </div>
      <div className="property-group">
        <label>Lagertyp</label>
        <select
          value={selectedNode.data.storageType || 'general'}
          onChange={(e) => handleInputChange('storageType', e.target.value)}
        >
          <option value="general">Allgemein</option>
          <option value="food">Nahrung</option>
          <option value="materials">Materialien</option>
          <option value="tools">Werkzeuge</option>
        </select>
      </div>
      <div className="property-group">
        <label>Kapazität</label>
        <input
          type="number"
          value={selectedNode.data.capacity || 1000}
          onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
        />
      </div>
    </>
  )

  const renderTransportProperties = () => (
    <>
      <div className="property-group">
        <label>Name</label>
        <input
          type="text"
          value={selectedNode.data.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
        />
      </div>
      <div className="property-group">
        <label>Transporttyp</label>
        <select
          value={selectedNode.data.transportType || 'road'}
          onChange={(e) => handleInputChange('transportType', e.target.value)}
        >
          <option value="road">Straße</option>
          <option value="water">Wasser</option>
          <option value="rail">Schiene</option>
        </select>
      </div>
      <div className="property-group">
        <label>Kapazität</label>
        <input
          type="number"
          value={selectedNode.data.capacity || 100}
          onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
        />
      </div>
      <div className="property-group">
        <label>Geschwindigkeit</label>
        <input
          type="number"
          step="0.1"
          value={selectedNode.data.speed || 1}
          onChange={(e) => handleInputChange('speed', parseFloat(e.target.value))}
        />
      </div>
      <div className="property-group">
        <label>Kosten</label>
        <input
          type="number"
          step="0.01"
          value={selectedNode.data.cost || 0.1}
          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value))}
        />
      </div>
    </>
  )

  const renderProperties = () => {
    switch (selectedNode.type) {
      case 'resource':
        return renderResourceProperties()
      case 'production':
        return renderProductionProperties()
      case 'storage':
        return renderStorageProperties()
      case 'transport':
        return renderTransportProperties()
      default:
        return (
          <div className="property-group">
            <label>Name</label>
            <input
              type="text"
              value={selectedNode.data.label || ''}
              onChange={(e) => handleInputChange('label', e.target.value)}
            />
          </div>
        )
    }
  }

  return (
    <div className="properties-panel">
      <h3>Eigenschaften</h3>
      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
        Node: {selectedNode.type}
      </div>
      {renderProperties()}
    </div>
  )
}
