import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getImageUrl } from "../../api/client";

interface ImageNodeData {
  label: string;
  filepath: string;
  [key: string]: unknown;
}

function ImageNodeComponent({ data }: NodeProps) {
  const nodeData = data as ImageNodeData;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm cursor-pointer hover:border-border-strong transition-colors w-[120px]">
      <Handle type="target" position={Position.Top} className="!bg-border !w-2 !h-2 !border-0" />
      <div className="w-full aspect-square bg-bg-secondary rounded-t-lg overflow-hidden">
        <img
          src={getImageUrl(nodeData.filepath)}
          alt={nodeData.label}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-medium text-text-primary truncate m-0 leading-tight">
          {nodeData.label}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-border !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(ImageNodeComponent);
