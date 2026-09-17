import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  MarkerType,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CanvasTextNode } from './components/CanvasTextNode';
import { CanvasToolbar } from './components/CanvasToolbar';
import { FlowEdge } from './components/FlowEdge';
import { INITIAL_WORKSPACES } from './data/initialWorkspaces';
import { type CanvasTextNodeData, type PaperCardTheme, type Workspace } from './types';

const STORAGE_KEY = 'drafter_workspaces_v1';

const HISTORY_LIMIT = 10;

type Snapshot = {
  nodes: Node<CanvasTextNodeData>[];
  edges: Edge[];
};

const cloneSnapshotData = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const historyContentKey = (nodeList: Node<CanvasTextNodeData>[], edgeList: Edge[]): string => {
  const slimNodes = nodeList.map((n) => ({
    id: n.id,
    x: Math.round(n.position.x * 100) / 100,
    y: Math.round(n.position.y * 100) / 100,
    html: n.data.html ?? '',
    theme: n.data.theme ?? 'default',
  }));
  const slimEdges = edgeList.map((e) => ({
    id: e.id,
    s: e.source,
    t: e.target,
    sh: e.sourceHandle,
    th: e.targetHandle,
    a: e.animated ? 1 : 0,
  }));
  return JSON.stringify([slimNodes, slimEdges]);
};

const withoutEdgesBetween = (edgeList: Edge[], source: string, target: string): Edge[] => {
  return edgeList.filter(
    (e) =>
      !(
        (e.source === source && e.target === target) ||
        (e.source === target && e.target === source)
      )
  );
};

const deduplicateEdges = (edgeList: Edge[]): Edge[] => {
  const seenPairs = new Set<string>();
  const cleaned: Edge[] = [];
  for (const edge of edgeList) {
    const pairKey = [edge.source, edge.target].sort().join('---');
    if (!seenPairs.has(pairKey)) {
      seenPairs.add(pairKey);
      cleaned.push(edge);
    }
  }
  return cleaned;
};

function CanvasDiagram() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((ws: Workspace) => ({
            ...ws,
            edges: deduplicateEdges(ws.edges || []),
          }));
        }
      }
    } catch {
      return INITIAL_WORKSPACES;
    }
    return INITIAL_WORKSPACES;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return workspaces[0]?.id || 'ws-architecture';
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const onConnectStart = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const onConnectEnd = useCallback(() => {
    setIsConnecting(false);
  }, []);

  const currentWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  }, [workspaces, activeWorkspaceId]);

  useEffect(() => {
    const name = currentWorkspace?.name?.trim();
    document.title = name ? `${name} | Drafter` : 'Drafter';
  }, [currentWorkspace?.name]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CanvasTextNodeData>>(
    currentWorkspace?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    currentWorkspace?.edges || []
  );
  const [defaultTheme, setDefaultTheme] = useState<PaperCardTheme>('default');
  const { fitView } = useReactFlow();

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const lastSnapshotRef = useRef<Snapshot>({
    nodes: cloneSnapshotData(currentWorkspace?.nodes || []),
    edges: cloneSnapshotData(currentWorkspace?.edges || []),
  });
  const lastKeyRef = useRef<string>(
    historyContentKey(currentWorkspace?.nodes || [], currentWorkspace?.edges || [])
  );
  const isApplyingHistoryRef = useRef(false);
  const isDraggingRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryButtons = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const resetHistory = useCallback(
    (nextNodes: Node<CanvasTextNodeData>[], nextEdges: Edge[]) => {
      pastRef.current = [];
      futureRef.current = [];
      lastSnapshotRef.current = {
        nodes: cloneSnapshotData(nextNodes),
        edges: cloneSnapshotData(nextEdges),
      };
      lastKeyRef.current = historyContentKey(nextNodes, nextEdges);
      syncHistoryButtons();
    },
    [syncHistoryButtons]
  );

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push({
      nodes: cloneSnapshotData(nodesRef.current),
      edges: cloneSnapshotData(edgesRef.current),
    });
    isApplyingHistoryRef.current = true;
    lastSnapshotRef.current = {
      nodes: cloneSnapshotData(prev.nodes),
      edges: cloneSnapshotData(prev.edges),
    };
    lastKeyRef.current = historyContentKey(prev.nodes, prev.edges);
    setNodes(cloneSnapshotData(prev.nodes));
    setEdges(cloneSnapshotData(prev.edges));
    syncHistoryButtons();
  }, [setNodes, setEdges, syncHistoryButtons]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push({
      nodes: cloneSnapshotData(nodesRef.current),
      edges: cloneSnapshotData(edgesRef.current),
    });
    if (pastRef.current.length > HISTORY_LIMIT) {
      pastRef.current.shift();
    }
    isApplyingHistoryRef.current = true;
    lastSnapshotRef.current = {
      nodes: cloneSnapshotData(next.nodes),
      edges: cloneSnapshotData(next.edges),
    };
    lastKeyRef.current = historyContentKey(next.nodes, next.edges);
    setNodes(cloneSnapshotData(next.nodes));
    setEdges(cloneSnapshotData(next.edges));
    syncHistoryButtons();
  }, [setNodes, setEdges, syncHistoryButtons]);

  useEffect(() => {
    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      return;
    }
    if (isDraggingRef.current) return;
    const key = historyContentKey(nodes, edges);
    if (key === lastKeyRef.current) return;
    pastRef.current.push(lastSnapshotRef.current);
    if (pastRef.current.length > HISTORY_LIMIT) {
      pastRef.current.shift();
    }
    lastSnapshotRef.current = {
      nodes: cloneSnapshotData(nodes),
      edges: cloneSnapshotData(edges),
    };
    lastKeyRef.current = key;
    futureRef.current = [];
    syncHistoryButtons();
  }, [nodes, edges, syncHistoryButtons]);

  const handleNodeDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleNodeDragStop = useCallback(() => {
    isDraggingRef.current = false;
    const key = historyContentKey(nodesRef.current, edgesRef.current);
    if (key === lastKeyRef.current) return;
    pastRef.current.push(lastSnapshotRef.current);
    if (pastRef.current.length > HISTORY_LIMIT) {
      pastRef.current.shift();
    }
    lastSnapshotRef.current = {
      nodes: cloneSnapshotData(nodesRef.current),
      edges: cloneSnapshotData(edgesRef.current),
    };
    lastKeyRef.current = key;
    futureRef.current = [];
    syncHistoryButtons();
  }, [syncHistoryButtons]);

  useEffect(() => {
    setWorkspaces((prevWorkspaces) => {
      const updated = prevWorkspaces.map((ws) => {
        if (ws.id === activeWorkspaceId) {
          return {
            ...ws,
            nodes,
            edges,
            updatedAt: Date.now(),
          };
        }
        return ws;
      });
      return updated;
    });
  }, [nodes, edges, activeWorkspaceId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    } catch {
      console.warn('Drafter could not save workspaces to local storage.');
    }
  }, [workspaces]);

  useEffect(() => {
    const isEditingText = () => {
      const activeEl = document.activeElement;
      const activeTag = (activeEl?.tagName || '').toLowerCase();
      return (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeEl?.getAttribute('contenteditable') === 'true' ||
        activeEl?.classList.contains('ProseMirror') ||
        activeEl?.closest('.ProseMirror') !== null
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z' && !e.altKey) {
        if (isEditingText()) return;
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (mod && key === 'y' && !e.altKey) {
        if (isEditingText()) return;
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (isEditingText()) {
          return;
        }

        const selectedEdgeIds = edgesRef.current
          .filter((edge) => edge.selected)
          .map((e) => e.id);

        if (selectedEdgeIds.length > 0) {
          e.preventDefault();
          setEdges((eds) => eds.filter((edge) => !selectedEdgeIds.includes(edge.id)));
          return;
        }

        const selectedNodeIds = nodesRef.current
          .filter((node) => node.selected)
          .map((n) => n.id);

        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          const selectedSet = new Set(selectedNodeIds);
          setNodes((nds) => nds.filter((n) => !selectedSet.has(n.id)));
          setEdges((eds) =>
            eds.filter(
              (edge) => !selectedSet.has(edge.source) && !selectedSet.has(edge.target)
            )
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setEdges, setNodes, undo, redo]);

  const nodeTypes = useMemo(
    () => ({
      canvasText: CanvasTextNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      flowEdge: FlowEdge,
      default: FlowEdge,
    }),
    []
  );

  const handleSelectWorkspace = useCallback(
    (targetId: string) => {
      if (targetId === activeWorkspaceId) return;

      const targetWorkspace = workspaces.find((w) => w.id === targetId);
      if (!targetWorkspace) return;

      resetHistory(targetWorkspace.nodes || [], targetWorkspace.edges || []);
      setActiveWorkspaceId(targetId);
      setNodes(cloneSnapshotData(targetWorkspace.nodes || []));
      setEdges(cloneSnapshotData(targetWorkspace.edges || []));

      setTimeout(() => {
        fitView({ padding: 0.25, duration: 350 });
      }, 50);
    },
    [activeWorkspaceId, workspaces, setNodes, setEdges, fitView, resetHistory]
  );

  const handleCreateWorkspace = useCallback(
    (name: string) => {
      const newId = `ws-${Date.now()}`;
      const defaultNode: Node<CanvasTextNodeData> = {
        id: `node-${Date.now()}`,
        type: 'canvasText',
        position: { x: 260, y: 180 },
        data: {
          id: `node-${Date.now()}`,
          theme: 'default',
          html: `<h1>${name}</h1><p>Start jotting notes and connecting ideas. Double-click to write.</p>`,
        },
      };

      const newWorkspace: Workspace = {
        id: newId,
        name,
        updatedAt: Date.now(),
        nodes: [defaultNode],
        edges: [],
      };

      setWorkspaces((prev) => [...prev, newWorkspace]);
      resetHistory([defaultNode], []);
      setActiveWorkspaceId(newId);
      setNodes([defaultNode]);
      setEdges([]);

      setTimeout(() => {
        fitView({ padding: 0.25, duration: 350 });
      }, 50);
    },
    [setNodes, setEdges, fitView, resetHistory]
  );

  const handleRenameWorkspace = useCallback((id: string, newName: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, name: newName } : ws))
    );
  }, []);

  const handleDeleteWorkspace = useCallback(
    (id: string) => {
      if (workspaces.length <= 1) return;

      const remainingWorkspaces = workspaces.filter((workspace) => workspace.id !== id);
      setWorkspaces(remainingWorkspaces);

      if (id === activeWorkspaceId) {
        const fallback = remainingWorkspaces[0];
        resetHistory(fallback.nodes, fallback.edges);
        setActiveWorkspaceId(fallback.id);
        setNodes(cloneSnapshotData(fallback.nodes));
        setEdges(cloneSnapshotData(fallback.edges));
        setTimeout(() => {
          fitView({ padding: 0.25, duration: 350 });
        }, 50);
      }
    },
    [workspaces, activeWorkspaceId, setNodes, setEdges, fitView, resetHistory]
  );

  const updateNodeData = useCallback(
    (id: string, patch: Partial<CanvasTextNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...patch } } : node
        )
      );
    },
    [setNodes]
  );

  const handleSelectTheme = useCallback(
    (theme: PaperCardTheme) => {
      setDefaultTheme(theme);
      setNodes((nds) => {
        const hasSelection = nds.some((n) => n.selected);
        if (!hasSelection) return nds;
        return nds.map((n) =>
          n.selected ? { ...n, data: { ...n.data, theme } } : n
        );
      });
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges]
  );

  const handleDuplicateNode = useCallback(
    (id: string) => {
      setNodes((nds) => {
        const target = nds.find((n) => n.id === id);
        if (!target) return nds;
        const newId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newNode: Node<CanvasTextNodeData> = {
          ...target,
          id: newId,
          position: {
            x: target.position.x + 32,
            y: target.position.y + 32,
          },
          selected: true,
          data: {
            ...target.data,
            id: newId,
          },
        };
        return [...nds.map((n) => ({ ...n, selected: false })), newNode];
      });
    },
    [setNodes]
  );

  const handleAddNode = useCallback(
    (theme: PaperCardTheme = defaultTheme) => {
      const newId = `node-${Date.now()}`;
      const x = 300 + (Math.random() * 100 - 50);
      const y = 200 + (Math.random() * 100 - 50);

      const newNode: Node<CanvasTextNodeData> = {
        id: newId,
        type: 'canvasText',
        position: { x, y },
        selected: true,
        data: {
          id: newId,
          theme,
          html: `<p>New thought on paper...</p>`,
        },
      };

      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
    },
    [setNodes, defaultTheme]
  );

  const handleResetSample = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    resetHistory(INITIAL_WORKSPACES[0].nodes, INITIAL_WORKSPACES[0].edges);
    setWorkspaces(cloneSnapshotData(INITIAL_WORKSPACES));
    setActiveWorkspaceId(INITIAL_WORKSPACES[0].id);
    setNodes(cloneSnapshotData(INITIAL_WORKSPACES[0].nodes));
    setEdges(cloneSnapshotData(INITIAL_WORKSPACES[0].edges));
    setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 50);
  }, [setNodes, setEdges, fitView, resetHistory]);

  const onConnect = useCallback(
    (params: Connection) => {
      const source = params.source;
      const target = params.target;
      if (!source || !target || source === target) return;

      setEdges((eds) => {
        const filtered = withoutEdgesBetween(eds, source, target);

        return addEdge(
          {
            ...params,
            type: 'flowEdge',
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: '#BEB9AD',
            },
          },
          filtered
        );
      });
    },
    [setEdges]
  );

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.selected);
  }, [nodes]);

  const activeTheme = selectedNode?.data.theme || defaultTheme;

  const populatedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onUpdate: updateNodeData,
        onDelete: handleDeleteNode,
        onDuplicate: handleDuplicateNode,
      },
    }));
  }, [nodes, updateNodeData, handleDeleteNode, handleDuplicateNode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F6F5F0]">
      <CanvasToolbar
        onAddNode={handleAddNode}
        onFitView={() => fitView({ padding: 0.25, duration: 300 })}
        onResetSample={handleResetSample}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        nodeCount={nodes.length}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onRenameWorkspace={handleRenameWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        selectedTheme={activeTheme}
        onSelectTheme={handleSelectTheme}
        hasSelectedCard={Boolean(selectedNode)}
      />

      <ReactFlow
        className={isConnecting ? 'is-connecting' : ''}
        nodes={populatedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{
          stroke: '#2B2A27',
          strokeWidth: 2,
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        elementsSelectable={true}
        edgesFocusable={true}
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          type: 'flowEdge',
          interactionWidth: 28,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: '#BEB9AD',
          },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#DDD8CC"
        />
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="m-4"
        />
      </ReactFlow>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-sans text-[#A8A49B] tracking-wide">
        This space is yours. Everything stays in this browser.
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasDiagram />
    </ReactFlowProvider>
  );
}
