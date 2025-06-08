'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Position,
  MarkerType,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PersonNode } from './PersonNode';
import { FamilyTreeToolbar } from './FamilyTreeToolbar';
import { PersonDetailsModal } from './PersonDetailsModal';
import { useTreeStore } from '@/stores/treeStore';
import toast from 'react-hot-toast';

const nodeTypes = {
  person: PersonNode,
};

interface FamilyTreeViewerProps {
  rootPersonId?: string;
  className?: string;
}

export function FamilyTreeViewer({ rootPersonId, className = '' }: FamilyTreeViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView } = useReactFlow();
  
  const { 
    fetchFamilyTree, 
    familyTreeData, 
    addPerson, 
    addRelationship 
  } = useTreeStore();

  // Load family tree data
  useEffect(() => {
    if (rootPersonId) {
      loadFamilyTree(rootPersonId);
    }
  }, [rootPersonId]);

  const loadFamilyTree = async (personId: string) => {
    setIsLoading(true);
    try {
      await fetchFamilyTree(personId, 3); // 3 generations
      toast.success('Family tree loaded successfully');
    } catch (error) {
      toast.error('Failed to load family tree');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert family tree data to React Flow nodes and edges
  useEffect(() => {
    if (familyTreeData) {
      const { nodes: treeNodes, edges: treeEdges } = convertToReactFlowFormat(familyTreeData);
      setNodes(treeNodes);
      setEdges(treeEdges);
      
      // Fit the view after nodes are set
      setTimeout(() => fitView({ duration: 800 }), 100);
    }
  }, [familyTreeData, setNodes, setEdges, fitView]);

  const convertToReactFlowFormat = (treeData: any) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Helper function to add a person node
    const addPersonNode = (person: any, x: number, y: number, generation: number) => {
      const nodeId = person.id;
      
      nodes.push({
        id: nodeId,
        type: 'person',
        position: { x, y },
        data: {
          person,
          onEdit: () => setSelectedPersonId(nodeId),
          onAddRelative: (type: string) => handleAddRelative(nodeId, type),
          generation
        },
        draggable: true,
      });
      
      return nodeId;
    };

    // Add root person
    const rootPerson = treeData.rootPerson;
    const rootNodeId = addPersonNode(rootPerson, 400, 300, 0);

    let ancestorY = 100;
    let descendantY = 500;
    let spouseX = 600;

    // Add ancestors (parents, grandparents, etc.)
    treeData.ancestors?.forEach((ancestor: any, index: number) => {
      const generation = ancestor.relationship === 'father' || ancestor.relationship === 'mother' ? -1 : -2;
      const x = ancestor.relationship === 'father' ? 200 : 300;
      const y = generation === -1 ? ancestorY : ancestorY - 150;
      
      const ancestorNodeId = addPersonNode(ancestor, x, y, generation);
      
      // Add edge from ancestor to root
      edges.push({
        id: `${ancestorNodeId}-${rootNodeId}`,
        source: ancestorNodeId,
        target: rootNodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        },
        label: ancestor.relationship,
        labelStyle: { fontSize: 12, fontWeight: 'bold' },
      });
    });

    // Add spouses
    treeData.spouses?.forEach((spouse: any, index: number) => {
      const spouseNodeId = addPersonNode(spouse, spouseX, 300, 0);
      
      // Add marriage edge
      edges.push({
        id: `${rootNodeId}-${spouseNodeId}`,
        source: rootNodeId,
        target: spouseNodeId,
        type: 'straight',
        animated: false,
        style: { stroke: '#ec4899', strokeWidth: 3 },
        label: `Married ${spouse.marriageDate || ''}`,
        labelStyle: { fontSize: 12, fontWeight: 'bold', fill: '#ec4899' },
      });
    });

    // Add descendants (children, grandchildren, etc.)
    treeData.descendants?.forEach((descendant: any, index: number) => {
      const generation = descendant.relationship === 'son' || descendant.relationship === 'daughter' ? 1 : 2;
      const x = 300 + (index * 150);
      const y = generation === 1 ? descendantY : descendantY + 150;
      
      const descendantNodeId = addPersonNode(descendant, x, y, generation);
      
      // Add edge from root to descendant
      edges.push({
        id: `${rootNodeId}-${descendantNodeId}`,
        source: rootNodeId,
        target: descendantNodeId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#10b981',
        },
        label: descendant.relationship,
        labelStyle: { fontSize: 12, fontWeight: 'bold' },
      });
    });

    return { nodes, edges };
  };

  const handleAddRelative = async (personId: string, relationship: string) => {
    try {
      // This would open a modal to add a new person
      toast.info(`Adding ${relationship} - feature coming soon!`);
    } catch (error) {
      toast.error('Failed to add relative');
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      // Handle new relationship creation
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#6b7280', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const handleZoomToFit = () => {
    fitView({ duration: 800, padding: 0.1 });
  };

  const handleZoomIn = () => {
    const reactFlowInstance = useReactFlow();
    reactFlowInstance.zoomIn();
  };

  const handleZoomOut = () => {
    const reactFlowInstance = useReactFlow();
    reactFlowInstance.zoomOut();
  };

  const handleCenterView = () => {
    fitView({ duration: 800 });
  };

  return (
    <div className={`relative w-full h-full bg-gray-50 ${className}`}>
      {/* Toolbar */}
      <FamilyTreeToolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomToFit={handleZoomToFit}
        onCenterView={handleCenterView}
        onAddPerson={() => setSelectedPersonId('new')}
        isLoading={isLoading}
      />

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid
        snapGrid={[20, 20]}
      >
        <Controls 
          position="top-right"
          className="bg-white border border-gray-300 rounded-lg shadow-lg"
        />
        
        <MiniMap 
          position="bottom-right"
          className="bg-white border border-gray-300 rounded-lg shadow-lg"
          nodeColor={(node) => {
            const generation = node.data.generation;
            if (generation < 0) return '#3b82f6'; // Ancestors - blue
            if (generation > 0) return '#10b981'; // Descendants - green
            return '#f59e0b'; // Current generation - amber
          }}
        />
        
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading family tree...</p>
          </div>
        </div>
      )}

      {/* Person details modal */}
      {selectedPersonId && (
        <PersonDetailsModal
          personId={selectedPersonId}
          isOpen={!!selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
          onSave={(personData) => {
            // Handle person save
            setSelectedPersonId(null);
            toast.success('Person saved successfully');
          }}
        />
      )}
    </div>
  );
} 