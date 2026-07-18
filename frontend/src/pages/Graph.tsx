import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getGraphData } from "../api/graph";
import ImageNode from "../components/graph/ImageNode";

const nodeTypes = { imageNode: ImageNode };

export default function Graph() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getGraphData()
      .then((data) => {
        // Layout nodes in a circle
        const count = data.nodes.length;
        const radius = Math.max(200, count * 40);
        const centerX = 400;
        const centerY = 300;

        const flowNodes: Node[] = data.nodes.map((n, i) => {
          const angle = (2 * Math.PI * i) / count;
          return {
            id: String(n.id),
            type: "imageNode",
            position: {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle),
            },
            data: {
              label: n.filename,
              filepath: n.filepath,
            },
          };
        });

        const flowEdges: Edge[] = data.edges.map((e, i) => ({
          id: `e-${i}`,
          source: String(e.source),
          target: String(e.target),
          style: {
            stroke: "#D4D4CF",
            strokeWidth: 1,
          },
          animated: false,
          label: `${(e.similarity_score * 100).toFixed(0)}%`,
          labelStyle: { fontSize: 9, fill: "#9B9B9B" },
          labelBgStyle: { fill: "#FAFAF8", fillOpacity: 0.8 },
          labelBgPadding: [4, 2] as [number, number],
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
      })
      .catch(() => setError("Failed to load graph data."))
      .finally(() => setLoading(false));
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate(`/app/images/${node.id}`);
    },
    [navigate]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "default" as const,
    }),
    []
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-tertiary">Loading knowledge graph…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-text-secondary mb-1">No knowledge to visualize yet.</p>
        <p className="text-[13px] text-text-tertiary">Upload images to start building your graph.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Knowledge Graph</h1>
        <p className="text-sm text-text-secondary">
          {nodes.length} image{nodes.length !== 1 ? "s" : ""} · {edges.length} connection{edges.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="w-full h-[calc(100vh-200px)] border border-border rounded-xl overflow-hidden bg-surface">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#E8E8E5" gap={20} size={1} />
          <Controls
            showInteractive={false}
            className="!border-border !shadow-none [&>button]:!border-border [&>button]:!bg-surface"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
