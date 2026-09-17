import type { Node, Edge } from '@xyflow/react';

export type CanvasTextNodeData = {
  id: string;
  html: string;
  theme?: PaperCardTheme;
  onUpdate?: (id: string, patch: Partial<CanvasTextNodeData>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  [key: string]: unknown;
};

export interface Workspace {
  id: string;
  name: string;
  updatedAt: number;
  nodes: Node<CanvasTextNodeData>[];
  edges: Edge[];
}

export type PaperCardTheme = 'default' | 'sage' | 'clay' | 'linen' | 'sky';

export interface ThemeConfig {
  name: string;
  bg: string;
  border: string;
  accent: string;
}

export const PAPER_THEMES: Record<PaperCardTheme, ThemeConfig> = {
  default: {
    name: 'Paper',
    bg: '#FBFBFA',
    border: '#E8E5DF',
    accent: '#2B2A27',
  },
  sage: {
    name: 'Sage',
    bg: '#E8EFE6',
    border: '#C4D6BE',
    accent: '#445742',
  },
  clay: {
    name: 'Clay',
    bg: '#F7E7D6',
    border: '#E3BFA0',
    accent: '#6E4E3A',
  },
  linen: {
    name: 'Linen',
    bg: '#F6EACD',
    border: '#DFC793',
    accent: '#5E553F',
  },
  sky: {
    name: 'Sky',
    bg: '#DEEBF5',
    border: '#AFCBDF',
    accent: '#3B5266',
  },
};
