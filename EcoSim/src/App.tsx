import React, { useCallback, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { ResourceNode } from './nodes/ResourceNode'
import { ProductionNode } from './nodes/ProductionNode'
import { StorageNode } from './nodes/StorageNode'
import { TransportNode } from './nodes/TransportNode'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { SimulationControls } from './components/SimulationControls'
import { MLDashboard } from './components/MLDashboard'
import { MLControls } from './components/MLControls'
import { useSimulationStore } from './stores/simulationStore'

const nodeTypes: NodeTypes = {
  resource: ResourceNode,
  production: ProductionNode,
  storage: StorageNode,
  transport: TransportNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'resource',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Holz',
      resourceType: 'wood',
      amount: 1000,
      maxAmount: 1000,
      productionRate: 10
    },
  },
  {
    id: '2',
    type: 'production',
    position: { x: 400, y: 100 },
    data: { 
      label: 'Sägewerk',
      productionType: 'lumber',
      inputResources: ['wood'],
      outputResource: 'lumber',
      productionRate: 5,
      efficiency: 0.8
    },
  },
  {
    id: '3',
    type: 'storage',
    position: { x: 700, y: 100 },
    data: { 
      label: 'Lager',
      storageType: 'general',
      capacity: 5000,
      storedResources: {
        lumber: 0,
        wood: 0
      }
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    data: { resourceType: 'wood', amount: 10 }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    animated: true,
    data: { resourceType: 'lumber', amount: 5 }
  },
]

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showMLPanel, setShowMLPanel] = useState<boolean>(false)
  
  const { isRunning, speed, startSimulation, pauseSimulation, stopSimulation, setSpeed } = useSimulationStore()

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        data: { resourceType: 'default', amount: 1 }
      }
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const addNode = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: nodeType,
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 200 
      },
      data: getDefaultNodeData(nodeType)
    }
    setNodes((nds) => [...nds, newNode])
  }, [setNodes])

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    )
  }, [setNodes])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Main Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        <Toolbar 
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onAddNode={addNode}
        />
        
        <PropertiesPanel 
          selectedNode={selectedNode}
          onUpdateNode={updateNodeData}
        />
        
        <SimulationControls 
          isRunning={isRunning}
          speed={speed}
          onStart={startSimulation}
          onPause={pauseSimulation}
          onStop={stopSimulation}
          onSpeedChange={setSpeed}
        />
      </div>

      {/* ML Panel */}
      {showMLPanel && (
        <div style={{ 
          width: '400px', 
          height: '100vh', 
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #e9ecef',
          overflow: 'auto',
          padding: '16px'
        }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">ML-Integration</h2>
              <button
                onClick={() => setShowMLPanel(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <MLControls />
            <MLDashboard />
          </div>
        </div>
      )}

      {/* ML Panel Toggle Button */}
      {!showMLPanel && (
        <button
          onClick={() => setShowMLPanel(true)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🧠 ML-Panel öffnen
        </button>
      )}
    </div>
  )
}

function getDefaultNodeData(nodeType: string) {
  switch (nodeType) {
    case 'resource':
      return {
        label: 'Neue Ressource',
        resourceType: 'wood',
        amount: 100,
        maxAmount: 1000,
        productionRate: 5
      }
    case 'production':
      return {
        label: 'Neue Produktion',
        productionType: 'lumber',
        inputResources: ['wood'],
        outputResource: 'lumber',
        productionRate: 2,
        efficiency: 0.7
      }
    case 'storage':
      return {
        label: 'Neues Lager',
        storageType: 'general',
        capacity: 1000,
        storedResources: {}
      }
    case 'transport':
      return {
        label: 'Neuer Transport',
        transportType: 'road',
        capacity: 100,
        speed: 1,
        cost: 0.1
      }
    default:
      return { label: 'Neuer Node' }
  }
}

export default App
