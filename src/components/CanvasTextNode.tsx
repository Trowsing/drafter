import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Handle, Position, useViewport, type NodeProps, type Node } from '@xyflow/react';
import { type CanvasTextNodeData, type PaperCardTheme, PAPER_THEMES } from '../types';
import { TipTapEditor } from './TipTapEditor';
import { Trash2, Copy, Edit3, Palette } from 'lucide-react';

export type CanvasTextNodeType = Node<CanvasTextNodeData, 'canvasText'>;

const CanvasTextNodeComponent: React.FC<NodeProps<CanvasTextNodeType>> = ({
  id,
  data,
  selected,
  positionAbsoluteY,
}) => {
  const { y: viewportY, zoom } = useViewport();
  const toolbarBelow = positionAbsoluteY * zoom + viewportY < 74 * zoom + 8;
  const [isEditing, setIsEditing] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const themeKey = data.theme || 'default';
  const theme = PAPER_THEMES[themeKey] || PAPER_THEMES.default;

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  useEffect(() => {
    if (!showPalette) return;
    const handleOutside = (e: PointerEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as HTMLElement)) {
        setShowPalette(false);
      }
    };
    window.addEventListener('pointerdown', handleOutside, true);
    return () => window.removeEventListener('pointerdown', handleOutside, true);
  }, [showPalette]);

  useEffect(() => {
    if (!isEditing && !showPalette) return;
    const wrapper = rootRef.current?.closest('.react-flow__node') as HTMLElement | null;
    if (!wrapper) return;
    const prev = wrapper.style.zIndex;
    wrapper.style.zIndex = '1000';
    return () => {
      wrapper.style.zIndex = prev;
    };
  }, [isEditing, showPalette]);

  const handleSave = useCallback(
    (newHtml: string) => {
      setIsEditing(false);
      data.onUpdate?.(id, { html: newHtml });
    },
    [id, data]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      data.onDelete?.(id);
    },
    [id, data]
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      data.onDuplicate?.(id);
    },
    [id, data]
  );

  const keepEditorFocus = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      id={`canvas-node-${id}`}
      ref={rootRef}
      className={`group relative min-w-[220px] max-w-[420px] rounded-lg border transition-shadow duration-150 ${
        selected
          ? 'ring-1 ring-[#5a574f] shadow-[0_4px_20px_rgba(43,42,39,0.12)]'
          : 'shadow-[0_1px_4px_rgba(43,42,39,0.06),0_4px_12px_rgba(43,42,39,0.04)] hover:shadow-[0_2px_8px_rgba(43,42,39,0.08)]'
      }`}
      style={{
        backgroundColor: theme.bg,
        borderColor: selected ? '#5a574f' : theme.border,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={true}
        className="canvas-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={true}
        className="canvas-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        className="canvas-handle"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={true}
        className="canvas-handle"
      />

      <div
        className={`absolute right-0 z-10 nodrag nopan ${
          toolbarBelow ? 'top-full pt-1' : 'bottom-full pb-1'
        } ${
          selected || isEditing || showPalette
            ? 'visible opacity-100'
            : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'
        }`}
        onDoubleClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          role="group"
          aria-label="Card actions"
          className="relative flex items-center gap-0.5 bg-[#FBFBFA] rounded-md p-0.5 border border-[#E8E5DF] shadow-sm"
        >
        <div ref={paletteRef}>
          <button
            id={`theme-btn-${id}`}
            type="button"
            onPointerDown={keepEditorFocus}
            onClick={(e) => {
              e.stopPropagation();
              setShowPalette((prev) => !prev);
            }}
            title="Change card paper color"
            aria-expanded={showPalette}
            className="p-1 rounded text-[#7a766e] hover:text-[#2b2a27] hover:bg-black/[0.05] transition-colors"
          >
            <Palette className="w-3 h-3" />
          </button>
          {showPalette && (
            <div
              className={`absolute right-0 ${toolbarBelow ? 'top-full mt-1.5' : 'bottom-full mb-1.5'} flex items-center gap-1.5 p-1.5 bg-[#FBFBFA] border border-[#DDD9CE] rounded-full shadow-[0_4px_16px_rgba(43,42,39,0.12)] z-50 nodrag nopan`}
              onClick={(e) => e.stopPropagation()}
            >
              {(Object.keys(PAPER_THEMES) as PaperCardTheme[]).map((tKey) => (
                <button
                  key={tKey}
                  type="button"
                  onPointerDown={keepEditorFocus}
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onUpdate?.(id, { theme: tKey });
                    setShowPalette(false);
                  }}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    themeKey === tKey
                      ? 'scale-125 border-[#2B2A27] ring-2 ring-[#2B2A27]/40 shadow-xs'
                      : 'border-[#D5D0C6] hover:scale-115 hover:border-[#8E8B82]'
                  }`}
                  style={{ backgroundColor: PAPER_THEMES[tKey].bg }}
                  title={`${PAPER_THEMES[tKey].name} paper`}
                />
              ))}
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            id={`edit-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Edit Note"
            className="p-1 rounded text-[#7a766e] hover:text-[#2b2a27] hover:bg-black/[0.05] transition-colors"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}
        <button
          id={`duplicate-btn-${id}`}
          type="button"
          onClick={handleDuplicate}
          title="Duplicate Card"
          className="p-1 rounded text-[#7a766e] hover:text-[#2b2a27] hover:bg-black/[0.05] transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          id={`delete-btn-${id}`}
          type="button"
          onClick={handleDelete}
          title="Delete Card"
          className="p-1 rounded text-[#7a766e] hover:text-[#9e3328] hover:bg-black/[0.05] transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <TipTapEditor
            initialContent={data.html}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div
            className="shared-typography min-h-[1lh] cursor-text selection:bg-[#E8E5DF]"
            dangerouslySetInnerHTML={{
              __html:
                data.html && data.html.trim() !== ''
                  ? data.html
                  : '<p class="text-[#9c988f] italic">Double-click to write...</p>',
            }}
          />
        )}
      </div>
    </div>
  );
};

export const CanvasTextNode = memo(CanvasTextNodeComponent);
