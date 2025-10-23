import React from 'react'
import { TreePine, Factory, Warehouse, Truck, MousePointer } from 'lucide-react'

interface ToolbarProps {
  selectedTool: string
  onToolSelect: (tool: string) => void
  onAddNode: (nodeType: string) => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, onToolSelect, onAddNode }) => {
  const tools = [
    { id: 'select', label: 'Auswählen', icon: MousePointer },
    { id: 'resource', label: 'Ressource', icon: TreePine },
    { id: 'production', label: 'Produktion', icon: Factory },
    { id: 'storage', label: 'Lager', icon: Warehouse },
    { id: 'transport', label: 'Transport', icon: Truck },
  ]

  const handleToolClick = (toolId: string) => {
    if (toolId === 'select') {
      onToolSelect(toolId)
    } else {
      onAddNode(toolId)
    }
  }

  return (
    <div className="toolbar">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.id}
            className={`toolbar-button ${selectedTool === tool.id ? 'active' : ''}`}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
          >
            <Icon size={16} />
            <span>{tool.label}</span>
          </button>
        )
      })}
    </div>
  )
}
