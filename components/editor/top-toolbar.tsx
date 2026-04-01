"use client";

type ToolName = "Select" | "Draw Line" | "Add Station" | "Inspect";

type BaselineMode = "today" | "future_committed";

type TopToolbarProps = Readonly<{
  activeTool?: ToolName;
  baseline?: BaselineMode;
  onToolSelect?: (tool: ToolName) => void;
  onBaselineChange?: (mode: BaselineMode) => void;
  busCorridorVisible?: boolean;
  onCorridorToggle?: () => void;
  onAddLine?: () => void;
}>;

const TOOLS: ToolName[] = ["Select", "Draw Line", "Add Station", "Inspect"];

export default function TopToolbar({
  activeTool = "Select",
  baseline = "today",
  onToolSelect,
  onBaselineChange,
  busCorridorVisible = false,
  onCorridorToggle,
  onAddLine,
}: TopToolbarProps) {
  return (
    <header
      style={{
        backgroundColor: "var(--shell-secondary)",
        color: "var(--shell-dominant)",
        padding: "var(--space-sm) var(--space-lg)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-md)",
        flexShrink: 0,
        height: "48px",
      }}
    >
      {/* Tool buttons */}
      <nav
        aria-label="Editor tools"
        style={{ display: "flex", gap: "var(--space-sm)" }}
      >
        {TOOLS.map((tool) => {
          const isActive = tool === activeTool;
          return (
            <button
              key={tool}
              onClick={() => onToolSelect?.(tool)}
              aria-pressed={isActive}
              style={{
                padding: "var(--space-xs) var(--space-md)",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.3,
                fontFamily: "var(--font-sans)",
                backgroundColor: isActive
                  ? "var(--shell-accent)"
                  : "transparent",
                color: "var(--shell-dominant)",
                transition: "background-color 0.15s",
              }}
            >
              {tool}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Baseline toggle */}
      <div
        aria-label="Baseline mode"
        style={{ display: "flex", gap: "var(--space-xs)" }}
      >
        {(["today", "future_committed"] as const).map((mode) => {
          const label = mode === "today" ? "Today" : "Future committed";
          const isSelected = mode === baseline;
          return (
            <button
              key={mode}
              onClick={() => onBaselineChange?.(mode)}
              aria-pressed={isSelected}
              style={{
                padding: "var(--space-xs) var(--space-sm)",
                borderRadius: "4px",
                border: "1px solid rgba(243, 238, 229, 0.3)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.3,
                fontFamily: "var(--font-sans)",
                backgroundColor: isSelected
                  ? "var(--shell-accent)"
                  : "transparent",
                color: "var(--shell-dominant)",
                transition: "background-color 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Bus + Streetcar Corridors toggle */}
      <button
        onClick={() => onCorridorToggle?.()}
        aria-pressed={busCorridorVisible}
        style={{
          padding: "var(--space-xs) var(--space-md)",
          borderRadius: "4px",
          border: "1px solid rgba(243, 238, 229, 0.3)",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.3,
          fontFamily: "var(--font-sans)",
          backgroundColor: busCorridorVisible
            ? "var(--shell-accent)"
            : "var(--shell-secondary)",
          color: "var(--shell-dominant)",
          transition: "background-color 0.15s",
        }}
      >
        Bus + Streetcar Corridors
      </button>

      {/* Primary CTA */}
      <button
        onClick={() => onAddLine?.()}
        style={{
          padding: "var(--space-xs) var(--space-md)",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.3,
          fontFamily: "var(--font-sans)",
          backgroundColor: "var(--shell-accent)",
          color: "var(--shell-dominant)",
        }}
      >
        Add Line
      </button>
    </header>
  );
}
