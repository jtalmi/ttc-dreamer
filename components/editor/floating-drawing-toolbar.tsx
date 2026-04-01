"use client";

import { MousePointer2, Pencil, Plus } from "lucide-react";

const FLOATING_TOOLBAR_BG =
  "var(--floating-toolbar-bg, rgba(24, 50, 74, 0.92))";
const FLOATING_TOOLBAR_SHADOW =
  "var(--floating-toolbar-shadow, 0 2px 12px rgba(0, 0, 0, 0.28))";

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
        position: "fixed",
        top: "var(--space-lg)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9000,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "var(--space-xs)",
          padding: "var(--space-sm)",
          borderRadius: "12px",
          background: FLOATING_TOOLBAR_BG,
          boxShadow: FLOATING_TOOLBAR_SHADOW,
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
            background: activeTool === "select" ? "var(--shell-accent)" : "rgba(243, 238, 229, 0.1)",
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
            background: activeTool === "draw-line" ? "var(--shell-accent)" : "rgba(243, 238, 229, 0.1)",
            color: "var(--shell-dominant)",
          }}
        >
          <Pencil size={20} />
        </button>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            alignSelf: "stretch",
            background: "rgba(243, 238, 229, 0.15)",
            margin: "var(--space-xs) 0",
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
            background: "rgba(243, 238, 229, 0.1)",
            color: "var(--shell-dominant)",
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
