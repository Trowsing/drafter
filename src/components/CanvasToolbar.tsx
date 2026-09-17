import React, { useEffect, useRef } from 'react';
import { Plus, Maximize2, HelpCircle, Undo2, Redo2 } from 'lucide-react';
import { type PaperCardTheme, PAPER_THEMES, type Workspace } from '../types';
import { WorkspaceSelector } from './WorkspaceSelector';

interface CanvasToolbarProps {
  onAddNode: (theme: PaperCardTheme) => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  nodeCount: number;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onDeleteWorkspace: (id: string) => void;
  selectedTheme: PaperCardTheme;
  onSelectTheme: (theme: PaperCardTheme) => void;
  hasSelectedCard?: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddNode,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  nodeCount,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  selectedTheme,
  onSelectTheme,
  hasSelectedCard = false,
}) => {
  const [showHelp, setShowHelp] = React.useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setShowHelp(false);
      }
    };
    if (showHelp) {
      window.addEventListener('pointerdown', handleOutside, true);
    }
    return () => {
      window.removeEventListener('pointerdown', handleOutside, true);
    };
  }, [showHelp]);

  return (
    <aside
      aria-label="Canvas Controls"
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#FBFBFA]/92 backdrop-blur-md border border-[#E8E5DF] rounded-full px-3 py-1.5 shadow-[0_2px_12px_rgba(43,42,39,0.06)]"
    >
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#E8E5DF]/70">
        <WorkspaceSelector
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={onSelectWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          onRenameWorkspace={onRenameWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
        />
        <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[#EFECE6] text-[#6A665E]">
          {nodeCount} {nodeCount === 1 ? 'card' : 'cards'}
        </span>
      </div>

      <div
        className="flex items-center gap-1.5 px-1.5 border-r border-[#E8E5DF]/70"
        title={hasSelectedCard ? "Change selected card color (or paper tint for new cards)" : "Select paper tint for new cards"}
      >
        {(Object.keys(PAPER_THEMES) as PaperCardTheme[]).map((themeKey) => (
          <button
            key={themeKey}
            type="button"
            onClick={() => onSelectTheme(themeKey)}
            className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
              selectedTheme === themeKey
                ? 'scale-125 border-[#2B2A27] ring-2 ring-[#2B2A27]/40 shadow-xs'
                : 'border-[#D5D0C6] hover:scale-115 hover:border-[#8E8B82]'
            }`}
            style={{ backgroundColor: PAPER_THEMES[themeKey].bg }}
            title={`${PAPER_THEMES[themeKey].name} paper${hasSelectedCard ? ' (click to apply to selected card)' : ''}`}
          />
        ))}
      </div>

      <button
        id="add-node-btn"
        type="button"
        onClick={() => onAddNode(selectedTheme)}
        className="flex items-center gap-1.5 bg-[#2B2A27] text-[#FBFBFA] hover:bg-[#403E3B] text-xs font-sans font-medium px-3 py-1 rounded-full transition-all active:scale-95 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Card</span>
      </button>

      <div className="flex items-center gap-0.5 px-1 border-r border-[#E8E5DF]/70">
        <button
          id="undo-btn"
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-full text-[#6A665E] hover:text-[#2B2A27] hover:bg-[#EFECE6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6A665E] disabled:cursor-default"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          id="redo-btn"
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 rounded-full text-[#6A665E] hover:text-[#2B2A27] hover:bg-[#EFECE6] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6A665E] disabled:cursor-default"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        id="fit-view-btn"
        type="button"
        onClick={onFitView}
        title="Fit canvas to screen"
        className="p-1.5 rounded-full text-[#6A665E] hover:text-[#2B2A27] hover:bg-[#EFECE6] transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <div className="relative" ref={helpRef}>
        <button
          id="help-btn"
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          title="Guide & shortcuts"
          className="p-1.5 rounded-full text-[#6A665E] hover:text-[#2B2A27] hover:bg-[#EFECE6] transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {showHelp && (
          <div className="absolute right-0 top-full mt-2 w-76 bg-[#FBFBFA] border border-[#E8E5DF] rounded-xl p-3.5 shadow-xl text-left z-50 text-xs font-sans text-[#4A4740]">
            <div className="font-serif font-semibold text-sm text-[#2B2A27] mb-2">
              Canvas Guide
            </div>
            <ul className="space-y-1.5 leading-relaxed text-[#5A564F]">
              <li>
                <strong className="text-[#2B2A27]">Write:</strong> Double-click a card to write.
              </li>
              <li>
                <strong className="text-[#2B2A27]">Connect:</strong> Drag dot to dot. Click the line for Solid / Flow, Reverse, or Delete.
              </li>
              <li>
                <strong className="text-[#2B2A27]">Undo / Redo:</strong> Press <kbd className="bg-black/5 px-1 py-0.5 rounded font-sans">Ctrl+Z</kbd> to undo and <kbd className="bg-black/5 px-1 py-0.5 rounded font-sans">Ctrl+Shift+Z</kbd> to redo (last 10 steps).
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};
