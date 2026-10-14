import { useState } from "react";
import Badge from "../ui/Badge";
import Card from "../ui/Card";

export default function PipelineDiagram({ nodes }) {
  const [activeId, setActiveId] = useState("claim");

  const activeNode = nodes.find((n) => n.id === activeId) || nodes[0];

  return (
    <div className="w-full">
      {/* Screen reader only linear description */}
      <div className="sr-only">
        <h3>Sequential fact verification pipeline</h3>
        <ol>
          {nodes.map((node, i) => (
            <li key={node.id}>
              <strong>
                Step {i + 1}: {node.title}
              </strong>{" "}
              — {node.detail}
            </li>
          ))}
        </ol>
      </div>

      {/* Visual interactive diagram */}
      <Card className="p-5 sm:p-8 border border-line bg-surface overflow-hidden">
        <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-6 flex items-center justify-between">
          <span>Interactive verification pipeline</span>
          <span className="text-[11px] font-normal text-fg-muted/80">
            Click any step to inspect details
          </span>
        </div>

        {/* Desktop Pipeline Layout */}
        <div className="hidden lg:flex flex-col gap-6">
          {/* Main flow row */}
          <div className="flex items-center justify-between gap-3">
            {/* Step 1: Claim */}
            <PipelineNode
              node={nodes.find((n) => n.id === "claim")}
              isActive={activeId === "claim"}
              onClick={() => setActiveId("claim")}
            />

            <FlowArrow />

            {/* Step 2: Semantic Cache */}
            <PipelineNode
              node={nodes.find((n) => n.id === "cache")}
              isActive={activeId === "cache"}
              onClick={() => setActiveId("cache")}
            />

            <FlowArrow />

            {/* Hit / Miss Branch Container */}
            <div className="flex flex-col gap-3 min-w-[210px]">
              <PipelineNode
                node={nodes.find((n) => n.id === "hit")}
                isActive={activeId === "hit"}
                onClick={() => setActiveId("hit")}
                isHit={true}
              />
              <PipelineNode
                node={nodes.find((n) => n.id === "miss")}
                isActive={activeId === "miss"}
                onClick={() => setActiveId("miss")}
                isMiss={true}
              />
            </div>

            <FlowArrow />

            {/* Step 4: Result shown */}
            <PipelineNode
              node={nodes.find((n) => n.id === "result")}
              isActive={activeId === "result"}
              onClick={() => setActiveId("result")}
            />

            <FlowArrow />

            {/* Step 5: Beta agent */}
            <PipelineNode
              node={nodes.find((n) => n.id === "beta")}
              isActive={activeId === "beta"}
              onClick={() => setActiveId("beta")}
            />

            <FlowArrow />

            {/* Step 6: Triaged decision */}
            <PipelineNode
              node={nodes.find((n) => n.id === "decision")}
              isActive={activeId === "decision"}
              onClick={() => setActiveId("decision")}
            />
          </div>
        </div>

        {/* Mobile / Tablet Vertical Flow */}
        <div className="flex lg:hidden flex-col gap-3">
          {nodes.map((node, idx) => (
            <div key={node.id} className="flex flex-col items-center w-full">
              <PipelineNode
                node={node}
                isActive={activeId === node.id}
                onClick={() => setActiveId(node.id)}
                className="w-full"
                isHit={node.id === "hit"}
                isMiss={node.id === "miss"}
              />
              {idx < nodes.length - 1 && (
                <div className="my-1.5 flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-primary/40 flow-pulse-vertical" />
                  <svg
                    className="w-3 h-3 text-primary/70 -mt-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 16l-6-6h12z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Detail Card */}
        <div
          id="pipeline-detail-panel"
          role="region"
          aria-live="polite"
          className="mt-8 p-5 sm:p-6 bg-surface-2 rounded-2xl border border-line transition-all duration-300"
        >
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <Badge variant="primary" size="sm">
              {activeNode.badge}
            </Badge>
            <h3 className="text-base sm:text-lg font-bold text-fg font-display">
              {activeNode.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
            {activeNode.detail}
          </p>
        </div>
      </Card>
    </div>
  );
}

function PipelineNode({
  node,
  isActive,
  onClick,
  className = "",
  isHit = false,
  isMiss = false,
}) {
  if (!node) return null;

  const activeStyles = isActive
    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
    : "border-line bg-surface hover:bg-surface-2 hover:border-line/80";

  const branchBorder = isHit
    ? "border-l-4 border-l-success"
    : isMiss
    ? "border-l-4 border-l-warning"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isActive}
      aria-controls="pipeline-detail-panel"
      className={`group relative p-3 rounded-xl border text-left transition cursor-pointer select-none min-h-[44px] flex flex-col justify-center ${activeStyles} ${branchBorder} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-fg-muted">
          {node.badge}
        </span>
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-none" />
        )}
      </div>
      <span className="text-xs sm:text-sm font-semibold text-fg leading-tight">
        {node.label}
      </span>
    </button>
  );
}

function FlowArrow() {
  return (
    <div
      className="hidden lg:flex items-center flex-none text-primary/50"
      aria-hidden="true"
    >
      <div className="w-4 h-0.5 bg-primary/40 flow-pulse" />
      <svg
        className="w-3.5 h-3.5 -ml-1 text-primary/70"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
}
