import type { Workspace } from '../types';
import { INITIAL_NODES, INITIAL_EDGES } from './initialNodes';

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-architecture',
    name: 'Overview',
    updatedAt: Date.now() - 3600000,
    nodes: INITIAL_NODES,
    edges: INITIAL_EDGES,
  },
];
