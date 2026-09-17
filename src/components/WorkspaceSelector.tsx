import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
} from 'lucide-react';
import type { Workspace } from '../types';

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  onRenameWorkspace: (id: string, newName: string) => void;
  onDeleteWorkspace: (id: string) => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setEditingId(null);
        setIsCreating(false);
      }
    };

    if (isOpen) {
      window.addEventListener('pointerdown', handleClickOutside, true);
    }
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartRename = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    setEditingId(ws.id);
    setEditName(ws.name);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editingId && editName.trim()) {
      onRenameWorkspace(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleStartCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreating(true);
    setNewWorkspaceName('');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName.trim());
      setIsCreating(false);
      setNewWorkspaceName('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="workspace-trigger-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-serif text-[#2B2A27] hover:bg-black/[0.04] transition-colors border border-transparent hover:border-[#E8E5DF] group"
        title="Switch or manage canvas workspaces"
      >
        <Folder className="w-3.5 h-3.5 text-[#8C887F] group-hover:text-[#2B2A27] transition-colors" />
        <span className="font-medium max-w-[150px] truncate">
          {activeWorkspace ? activeWorkspace.name : 'Workspaces'}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[#8C887F] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#2B2A27]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="workspace-popover"
          className="absolute left-0 top-full mt-2 w-64 bg-[#FBFBFA] border border-[#E8E5DF] rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-[#E8E5DF]/60 mb-1">
            <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-[#9C988F]">
              Workspaces ({workspaces.length})
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              const isRenaming = editingId === ws.id;

              return (
                <div
                  key={ws.id}
                  onClick={() => {
                    if (!isRenaming) {
                      onSelectWorkspace(ws.id);
                      setIsOpen(false);
                    }
                  }}
                  className={`group/item flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#F0EDE6] text-[#2B2A27] font-medium'
                      : 'text-[#5A564F] hover:bg-black/[0.03] hover:text-[#2B2A27]'
                  }`}
                >
                  {isRenaming ? (
                    <form
                      onSubmit={handleSaveRename}
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-white border border-[#D5D0C6] rounded px-1.5 py-0.5 text-xs text-[#2B2A27] outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Save name"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-[#8C887F] hover:bg-black/5 rounded"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#2B2A27]' : 'text-[#A8A49B]'}`} />
                        <span className="truncate font-serif text-[13px]">{ws.name}</span>
                        <span className="text-[10px] font-sans text-[#9C988F] bg-black/[0.04] px-1.5 py-0.2 rounded flex-shrink-0">
                          {ws.nodes.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(e, ws)}
                          title="Rename workspace"
                          className="p-1 rounded text-[#8C887F] hover:text-[#2B2A27] hover:bg-black/5"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        {workspaces.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteWorkspace(ws.id);
                            }}
                            title="Delete workspace"
                            className="p-1 rounded text-[#8C887F] hover:text-[#A8322B] hover:bg-black/5"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-1 mt-1 border-t border-[#E8E5DF]/60">
            {isCreating ? (
              <form onSubmit={handleSaveCreate} className="p-1.5 flex items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  placeholder="New workspace name..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="flex-1 bg-white border border-[#D5D0C6] rounded px-2 py-1 text-xs text-[#2B2A27] outline-none placeholder:text-[#A8A49B]"
                />
                <button
                  type="submit"
                  disabled={!newWorkspaceName.trim()}
                  className="px-2 py-1 bg-[#2B2A27] text-white text-xs rounded hover:bg-[#403E3B] disabled:opacity-40 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1 text-[#8C887F] hover:bg-black/5 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-[#5A564F] hover:text-[#2B2A27] hover:bg-black/[0.03] rounded-lg transition-colors font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
