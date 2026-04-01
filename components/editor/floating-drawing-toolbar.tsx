"use client";

import { MousePointer2, Pencil, Plus } from "lucide-react";

type FloatingDrawingToolbarProps = Readonly<{
  activeTool: "select" | "draw-line" | "add-station";
  onToolSelect: (tool: "select" | "draw-line" | "add-station") => void;
  onAddLine: () => void;
}>;

export function FloatingDrawingToolbar({
  activeTool,
  onToolSelect,
  onAddLine,
}: FloatingDrawingToolbarProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: "var(--space-lg)",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: "var(--z-floating-toolbar)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          padding: "var(--space-sm)",
          borderRadius: "12px",
          background: "var(--floating-toolbar-bg)",
          boxShadow: "var(--floating-toolbar-shadow)",
          pointerEvents: "auto",
        }}
      >
        {/* Select tool */}
        <button
          title="Select"
          aria-label="Select"
          onClick={() => onToolSelect("select")}
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontFamily: "var(--font-sans)",
            background: activeTool === "select" ? "var(--shell-accent)" : "transparent",
            color: "var(--shell-dominant)",
          }}
        >
          <MousePointer2 size={20} />
        </button>

        {/* Draw tool */}
        <button
          title="Draw"
          aria-label="Draw"
          onClick={() => onToolSelect("draw-line")}
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontFamily: "var(--font-sans)",
            background: activeTool === "draw-line" ? "var(--shell-accent)" : "transparent",
            color: "var(--shell-dominant)",
          }}
        >
          <Pencil size={20} />
        </button>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "rgba(243, 238, 229, 0.15)",
            margin: "0 var(--space-xs)",
          }}
        />

        {/* Add Line */}
        <button
          title="Add Line"
          aria-label="Add Line"
          onClick={onAddLine}
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            borderRadius: "8px",
            fontFamily: "var(--font-sans)",
            background: "transparent",
            color: "var(--shell-dominant)",
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
