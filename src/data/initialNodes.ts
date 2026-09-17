import { type Node, type Edge, MarkerType } from '@xyflow/react';
import type { CanvasTextNodeData } from '../types';

export const INITIAL_NODES: Node<CanvasTextNodeData>[] = [
  {
    id: 'node-1',
    type: 'canvasText',
    position: { x: 100, y: 120 },
    data: {
      id: 'node-1',
      theme: 'default',
      html: `<h1>Drafter</h1><p>A quiet space for drafting thoughts and connections.</p><p><em>Double-click any card to begin writing.</em></p>`,
    },
  },
  {
    id: 'node-2',
    type: 'canvasText',
    position: { x: 600, y: 80 },
    data: {
      id: 'node-2',
      theme: 'sage',
      html: `<h2>Quick Formatting</h2><p>Use markdown shortcuts while writing:</p><ul><li>Type <code>#</code> for headings</li><li>Type <code>**bold**</code> for emphasis</li><li>Type <code>-</code> for bullet lists</li><li>Type <code>&gt;</code> for quotes</li></ul>`,
    },
  },
  {
    id: 'node-3',
    type: 'canvasText',
    position: { x: 600, y: 380 },
    data: {
      id: 'node-3',
      theme: 'clay',
      html: `<h2>Connecting Ideas</h2><p>Drag dot to dot to draw an arrow.</p><blockquote>Click the line to change its style, reverse it, or delete it.</blockquote>`,
    },
  },
  {
    id: 'node-4',
    type: 'canvasText',
    position: { x: 100, y: 400 },
    data: {
      id: 'node-4',
      theme: 'linen',
      html: `<h3>Workspaces</h3><p>Create separate workspaces from the top menu to keep your diagrams organized, focused, and fast.</p>`,
    },
  },
];

export const INITIAL_EDGES: Edge[] = [
  {
    id: 'edge-1-2',
    type: 'flowEdge',
    source: 'node-1',
    target: 'node-2',
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: '#8E8B82',
    },
  },
  {
    id: 'edge-1-4',
    type: 'flowEdge',
    source: 'node-1',
    target: 'node-4',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: '#BEB9AD',
    },
  },
  {
    id: 'edge-2-3',
    type: 'flowEdge',
    source: 'node-2',
    target: 'node-3',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: '#BEB9AD',
    },
  },
  {
    id: 'edge-4-3',
    type: 'flowEdge',
    source: 'node-4',
    target: 'node-3',
    sourceHandle: 'right',
    targetHandle: 'left',
    animated: false,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: '#BEB9AD',
    },
  },
];
