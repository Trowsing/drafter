import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';
import { ArrowLeftRight, Trash2, Activity, Minus } from 'lucide-react';

const normalizeHandle = (handleId?: string | null) => {
  if (!handleId) return undefined;
  if (handleId.includes('top')) return 'top';
  if (handleId.includes('right')) return 'right';
  if (handleId.includes('bottom')) return 'bottom';
  if (handleId.includes('left')) return 'left';
  return handleId;
};

export function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  animated,
}: EdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const setAnimated = (e: React.MouseEvent, shouldAnimate: boolean) => {
    e.stopPropagation();
    setEdges((eds) => {
      const current = eds.find((x) => x.id === id);
      return eds.map((edge) => {
        const isTarget =
          edge.id === id ||
          (current &&
            ((edge.source === current.source && edge.target === current.target) ||
              (edge.source === current.target && edge.target === current.source)));

        if (isTarget) {
          return {
            ...edge,
            animated: shouldAnimate,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 14,
              height: 14,
              color: shouldAnimate ? '#8E8B82' : '#BEB9AD',
            },
          };
        }
        return edge;
      });
    });
  };

  const reverseDirection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            source: edge.target,
            target: edge.source,
            sourceHandle: normalizeHandle(edge.targetHandle),
            targetHandle: normalizeHandle(edge.sourceHandle),
          };
        }
        return edge;
      })
    );
  };

  const deleteEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((eds) => {
      const current = eds.find((x) => x.id === id);
      if (!current) return eds.filter((edge) => edge.id !== id);
      return eds.filter(
        (edge) =>
          edge.id !== id &&
          !(
            (edge.source === current.source && edge.target === current.target) ||
            (edge.source === current.target && edge.target === current.source)
          )
      );
    });
  };

  const strokeColor = selected
    ? '#2B2A27'
    : animated
    ? '#8E8B82'
    : '#BEB9AD';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: animated ? '6 4' : undefined,
        }}
      />

      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan flex items-center gap-1.5 bg-[#FBFBFA] border border-[#DDD9CE] px-2 py-1 rounded-full shadow-[0_3px_12px_rgba(43,42,39,0.12)] z-30 text-[11px] font-sans"
          >
            <div className="flex items-center bg-[#EFECE6] p-0.5 rounded-full text-[10px]">
              <button
                type="button"
                onClick={(e) => setAnimated(e, false)}
                title="Solid line"
                className={`px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                  !animated
                    ? 'bg-[#2B2A27] text-[#FBFBFA] font-medium shadow-xs'
                    : 'text-[#6A665E] hover:text-[#2B2A27]'
                }`}
              >
                <Minus className="w-2.5 h-2.5" />
                <span>Solid</span>
              </button>
              <button
                type="button"
                onClick={(e) => setAnimated(e, true)}
                title="Flowing animated dashes"
                className={`px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                  animated
                    ? 'bg-[#2B2A27] text-[#FBFBFA] font-medium shadow-xs'
                    : 'text-[#6A665E] hover:text-[#2B2A27]'
                }`}
              >
                <Activity className="w-2.5 h-2.5" />
                <span>Flow</span>
              </button>
            </div>

            <span className="w-px h-3 bg-[#E8E5DF]" />

            <button
              type="button"
              onClick={reverseDirection}
              title="Reverse direction (flip arrow)"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[#5A574F] hover:bg-[#EFECE6] hover:text-[#2B2A27] transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Reverse</span>
            </button>

            <span className="w-px h-3 bg-[#E8E5DF]" />

            <button
              type="button"
              onClick={deleteEdge}
              title="Delete connection (Backspace / Del)"
              className="p-1 rounded-full text-[#7A766E] hover:text-[#9E3328] hover:bg-[#FBEBEA] transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
