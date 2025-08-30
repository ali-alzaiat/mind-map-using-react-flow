import React, { useState, useMemo, useEffect, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useReactFlow } from "reactflow";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Expand } from "lucide-react";

/* ======================= Styles (unchanged) ======================= */
const styles = `
  .mindmap-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  }

  .node {
    width: 180px;
    height: 64px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
    user-select: none;
    box-shadow: 0 8px 20px -8px rgba(2, 8, 23, 0.25);
    border: 2px solid #d1d5db;
    background: #ffffff;
    color: #111827;
    position: relative;
  }
  .node.root {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
    border-color: #1d4ed8;
  }

  .toggle-btn {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 1.5px solid #cbd5e1;
    background: #f8fafc;
    font-weight: 800;
    font-size: 14px;
    line-height: 1;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .toggle-btn:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 14px -6px rgba(2, 8, 23, 0.25);
  }
  .toggle-btn:active { transform: scale(.95); }
`;

/* ======================= Data (same sample set) ======================= */
const initialNodesData = [
  { id: "1", label: "Central Idea", isRoot: true },

  // first level
  { id: "2", label: "Main Topic 1", parentId: "1" },
  { id: "3", label: "Main Topic 2", parentId: "1" },
  { id: "4", label: "Main Topic 3", parentId: "1" },
  { id: "5", label: "Main Topic 4", parentId: "1" },
  { id: "16", label: "Main Topic 5", parentId: "1" },
  { id: "17", label: "Main Topic 6", parentId: "1" },

  // level 2
  { id: "6", label: "Sub 1.1", parentId: "2" },
  { id: "7", label: "Sub 1.2", parentId: "2" },
  { id: "8", label: "Sub 2.1", parentId: "3" },
  { id: "9", label: "Sub 2.2", parentId: "3" },
  { id: "10", label: "Sub 3.1", parentId: "4" },
  { id: "11", label: "Sub 3.2", parentId: "4" },
  { id: "12", label: "Sub 4.1", parentId: "5" },
  { id: "13", label: "Sub 4.2", parentId: "5" },
  { id: "18", label: "Sub 5.1", parentId: "16" },
  { id: "19", label: "Sub 5.2", parentId: "16" },
  { id: "20", label: "Sub 6.1", parentId: "17" },
  { id: "21", label: "Sub 6.2", parentId: "17" },

  // level 3
  { id: "22", label: "Detail 1.1.1", parentId: "6" },
  { id: "23", label: "Detail 1.1.2", parentId: "6" },
  { id: "24", label: "Detail 1.2.1", parentId: "7" },
  { id: "25", label: "Detail 2.1.1", parentId: "8" },
  { id: "26", label: "Detail 2.1.2", parentId: "8" },
  { id: "27", label: "Detail 2.2.1", parentId: "9" },
  { id: "28", label: "Detail 3.1.1", parentId: "10" },
  { id: "29", label: "Detail 3.2.1", parentId: "11" },
  { id: "30", label: "Detail 4.1.1", parentId: "12" },
  { id: "31", label: "Detail 4.2.1", parentId: "13" },
  { id: "32", label: "Detail 5.1.1", parentId: "18" },
  { id: "33", label: "Detail 6.2.1", parentId: "21" },

  // level 4+
  { id: "34", label: "Deep 1", parentId: "22" },
  { id: "35", label: "Deep 2", parentId: "23" },
  { id: "36", label: "Deep 3", parentId: "26" },
  { id: "37", label: "Deep 4", parentId: "31" },
  { id: "38", label: "Deep 5", parentId: "32" },
  { id: "39", label: "Deep 6", parentId: "33" },
  { id: "40", label: "Deepest", parentId: "38" },
];

/* ======================= Node Component (handles + styling preserved) ======================= */
const MindMapNode = ({ id, data }) => {
  const { label, isRoot, side, hasChildren, expanded, onToggle } = data;

  return (
    <div className={`node ${isRoot ? "root" : ""}`}>
      {/* Handles for consistent connector anchors */}
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{ visibility: "hidden" }}
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{ visibility: "hidden" }}
      />

      {/* toggle on side of branch (no toggle for root / leaves) */}
      {!isRoot && hasChildren && side === "left" && (
        <button
          className="toggle-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.(id);
          }}
          style={{
            position: "absolute",
            left: -18,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "−" : "+"}
        </button>
      )}

      <span>{label}</span>

      {!isRoot && hasChildren && side === "right" && (
        <button
          className="toggle-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.(id);
          }}
          style={{
            position: "absolute",
            right: -18,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "−" : "+"}
        </button>
      )}
    </div>
  );
};

const nodeTypes = { mindmapNode: MindMapNode };

/* ======================= Layout constants ======================= */
const NODE_W = 180;
const NODE_H = 64;
const L1_X_OFFSET = 260;
const X_STEP = 260;
const Y_SPACING_L1 = 120;
const Y_SPACING = 96;

/* ======================= Custom Edge (only change applied) ======================= */
/**
 * Draws a smooth cubic curve from source to (adjusted) target,
 * and draws a polygon arrowhead placed slightly BEFORE the node
 * when data.side === 'left' so the collapse button doesn't hide it.
 */
function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
}) {
  const isLeft = data?.side === "left" && data?.level !== 1;

  // Padding so arrow is not hidden by button
  const ARROW_PAD = 15;

  // Decide arrow tip position: always outside node
  const arrowStartX = isLeft ? targetX - ARROW_PAD : targetX;

  // Bend point halfway horizontally
  const midX = (sourceX + arrowStartX) / 2;
  const midY = (sourceY + targetY) / 2;

  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${midX} ${sourceY}`,
    `Q ${midX} ${sourceY} ${midX} ${midY}`,
    `L ${midX} ${targetY}`,
    `L ${arrowStartX} ${targetY}`,
  ].join(" ");

  const arrowPoints = "-8,-4 -8,4 0,0"; // simple right-pointing arrow

  return (
    <g id={id}>
      <path
        d={path}
        fill="none"
        stroke={style.stroke || "#64748b"}
        strokeWidth={style.strokeWidth ?? 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* arrow head */}
      <polygon
        points={arrowPoints}
        fill={style.stroke || "#64748b"}
        transform={`translate(${arrowStartX}, ${targetY})`}
      />
    </g>
  );
}

/* ======================= Main MindMapFlow ======================= */
export default function App() {
  return (
    <ReactFlowProvider>
      <MindMapFlow />
    </ReactFlowProvider>
  );
}

function CustomMiniMap() {
  const [visible, setVisible] = useState(true);
  const { fitView, setViewport, getViewport } = useReactFlow();

  const handleZoom = (factor) => {
    const { x, y, zoom } = getViewport();
    setViewport({ x, y, zoom: zoom * factor }, { duration: 200 });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        overflow: "hidden",
        height: visible ? 200 : 35,
        width: 300,
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 10px",
          borderBottom: "1px solid #eee",
          background: "#f9f9f9",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 500, color: "#444" }}>
          MiniMap
        </span>
        <button
          onClick={() => setVisible(!visible)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          {visible ? <Minimize2 size={16} /> : <Expand size={16} />}
        </button>
      </div>

      {/* MiniMap */}
      {visible && (
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(n) => (n.data?.isRoot ? "#3b82f6" : "#aaa")}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 10px 20px -10px rgba(2, 8, 23, 0.25)",
            width: 300,
            height: 165,
            margin: 0,
          }}
          zoomable
          pannable
        />
      )}
    </div>
  );
}

const btnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "2px",
};

function MindMapFlow() {
  // Expanded set: nodes that are currently expanded (deep levels collapsed by default)
  const [expanded, setExpanded] = useState(new Set()); // start with only L1 visible; deeper nodes collapse unless toggled
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Build lookup maps once
  const { nodeMap, childrenMap, rootId, l1Left, l1Right } = useMemo(() => {
    const map = new Map();
    const cMap = new Map();
    initialNodesData.forEach((n) => {
      map.set(n.id, n);
      cMap.set(n.id, []);
    });
    initialNodesData.forEach((n) => {
      if (n.parentId) cMap.get(n.parentId)?.push(n.id);
    });
    const root = initialNodesData.find((n) => n.isRoot) ?? initialNodesData[0];
    const l1 = cMap.get(root.id) ?? [];
    const mid = Math.ceil(l1.length / 2);
    return {
      nodeMap: map,
      childrenMap: cMap,
      rootId: root.id,
      l1Left: l1.slice(0, mid),
      l1Right: l1.slice(mid),
    };
  }, []);

  // Toggle handler
  const onToggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Compute visible-leaf counts (treat collapsed nodes as leaf=1)
  const computeVisibleLeafCounts = useCallback(() => {
    const cache = new Map();

    const dfs = (id) => {
      if (cache.has(id)) return cache.get(id);
      const kids = childrenMap.get(id) || [];
      if (kids.length === 0) {
        cache.set(id, 1);
        return 1;
      }
      // if node is collapsed (and it's not the root), treat as a single leaf
      if (id !== rootId && !expanded.has(id)) {
        cache.set(id, 1);
        return 1;
      }
      let sum = 0;
      for (const c of kids) sum += dfs(c);
      cache.set(id, Math.max(1, sum));
      return cache.get(id);
    };

    // precompute for all nodes (but function only called inside layout)
    initialNodesData.forEach((n) => dfs(n.id));
    return cache;
  }, [childrenMap, expanded, rootId]);

  // Build layout on expanded change
  useEffect(() => {
    const leafCounts = computeVisibleLeafCounts();

    const outNodes = [];
    const outEdges = [];

    const pushNode = (id, x, y, side, level) => {
      const n = nodeMap.get(id);
      const kids = childrenMap.get(id) ?? [];
      const hasChildren = kids.length > 0;

      outNodes.push({
        id,
        type: "mindmapNode",
        position: { x, y },
        data: {
          label: n.label,
          isRoot: level === 0,
          side,
          hasChildren,
          expanded: expanded.has(id),
          onToggle,
          level,
        },
        selectable: true,
        draggable: false,
        connectable: false,
        style: { width: NODE_W, height: NODE_H },
      });
    };

    // uniform edge creation uses custom edge so we can shift arrow for left side
    const pushEdge = (leftNodeId, rightNodeId, side, level) => {
      outEdges.push({
        id: `e-${leftNodeId}-${rightNodeId}`,
        source: leftNodeId,
        target: rightNodeId,
        sourceHandle: "right-source",
        targetHandle: "left-target",
        type: "custom",
        data: { side, level },
        style: { stroke: "#64748b", strokeWidth: 1 },
      });
    };

    // root
    const rootX = 0;
    const rootY = 0;
    pushNode(rootId, rootX, rootY, undefined, 0);

    // Layout helpers using visible leaf allocations
    const layoutSide = (ids, side) => {
      // compute total visible leaves for this side
      const leaves = ids.map((id) => leafCounts.get(id) ?? 1);
      const totalLeaves = Math.max(
        1,
        leaves.reduce((s, v) => s + v, 0)
      );
      const allocatedHeight = totalLeaves * Y_SPACING;
      let cursorY = -allocatedHeight / 2;

      ids.forEach((id, i) => {
        const myLeaves = leafCounts.get(id) ?? 1;
        const myAlloc = (myLeaves / totalLeaves) * allocatedHeight;
        const myCenterY = cursorY + myAlloc / 2;
        const x = side === "left" ? rootX - L1_X_OFFSET : rootX + L1_X_OFFSET;

        // place L1 node
        pushNode(id, x, myCenterY, side, 1);

        // edge from root to this L1:
        if (side === "right") {
          pushEdge(rootId, id, "right", 1); // root -> child
        } else {
          pushEdge(id, rootId, "left", 1); // child -> root (so arrow points right)
        }

        // recursively layout subtree using allocated height
        layoutSubtree(id, x, myCenterY, myAlloc, side, 2, leafCounts);

        cursorY += myAlloc;
      });
    };

    const layoutSubtree = (
      parentId,
      parentX,
      parentY,
      allocatedHeight,
      side,
      level,
      leafCountsMap
    ) => {
      const kids = childrenMap.get(parentId) ?? [];
      if (!kids.length) return;

      // if parent is not expanded treat as leaf → do not layout children
      if (!expanded.has(parentId)) return;

      // total visible leaves among children (should be > 0)
      const totalLeaves = Math.max(
        1,
        kids.reduce((s, c) => s + (leafCountsMap.get(c) ?? 1), 0)
      );
      let cursorY = parentY - allocatedHeight / 2;
      const childX = side === "left" ? parentX - X_STEP : parentX + X_STEP;

      for (const childId of kids) {
        const childLeaves = leafCountsMap.get(childId) ?? 1;
        const childAlloc = (childLeaves / totalLeaves) * allocatedHeight;
        const childCenterY = cursorY + childAlloc / 2;

        // push child node
        pushNode(childId, childX, childCenterY, side, level);

        // push edge:
        if (side === "right") {
          pushEdge(parentId, childId, "right", level);
        } else {
          pushEdge(childId, parentId, "left", level);
        }

        // recurse if child expanded
        if (expanded.has(childId)) {
          layoutSubtree(
            childId,
            childX,
            childCenterY,
            childAlloc,
            side,
            level + 1,
            leafCountsMap
          );
        }

        cursorY += childAlloc;
      }
    };

    // start layout for each side
    layoutSide(l1Left, "left");
    layoutSide(l1Right, "right");

    // apply to react-flow state
    setNodes(outNodes);
    setEdges(outEdges);
  }, [
    expanded,
    nodeMap,
    childrenMap,
    rootId,
    l1Left,
    l1Right,
    onToggle,
    setEdges,
    setNodes,
    computeVisibleLeafCounts,
  ]);

  // expose custom edge type
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  return (
    <div className="mindmap-container">
      <style>{styles}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.25, maxZoom: 2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.25}
        maxZoom={2}
      >
        <Controls
          showInteractive={false}
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 10px 20px -10px rgba(2, 8, 23, 0.25)",
          }}
        />
        <CustomMiniMap />
        <Background variant="dots" gap={22} size={1.4} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
}
