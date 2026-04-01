"use client";

import { useState } from "react";

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
  /** Whether comparison (Baseline View) mode is active. */
  comparisonMode?: boolean;
  /** Called when the comparison toggle is clicked. */
  onComparisonToggle?: () => void;
  /** Whether the proposal has at least one line. When false, toggle is muted. */
  hasLines?: boolean;
  /** Current draft title shown in the inline title field. */
  title?: string;
  /** Called when the user commits a title change (blur or Enter). */
  onTitleChange?: (title: string) => void;
  /** Called when the Share button is clicked. */
  onShareClick?: () => void;
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
  comparisonMode = false,
  onComparisonToggle,
  hasLines = false,
  title = "Untitled Proposal",
  onTitleChange,
  onShareClick,
}: TopToolbarProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  function startEditing() {
    setTitleInput(title);
    setEditingTitle(true);
  }

  function commitTitle() {
    const trimmed = titleInput.trim().slice(0, 80);
    onTitleChange?.(trimmed);
    setEditingTitle(false);
  }

  function cancelEditing() {
    setEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitTitle();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }

  // Truncate title display to 24 chars with ellipsis
  const displayTitle =
    title.length > 24 ? title.slice(0, 24) + "..." : title;

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

      {/* Inline title field — between tool group and spacer */}
      {editingTitle ? (
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={handleTitleKeyDown}
          maxLength={80}
          autoFocus
          style={{
            maxWidth: "200px",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            color: "var(--shell-dominant)",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: "1px solid var(--shell-dominant)",
            outline: "none",
            padding: "0 2px",
          }}
        />
      ) : (
        <span
          onClick={startEditing}
          title={title}
          style={{
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            color: "var(--shell-dominant)",
            opacity: 0.7,
            cursor: "pointer",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "200px",
          }}
        >
          {displayTitle}
        </span>
      )}

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

      {/* Before/after comparison toggle */}
      <button
        onClick={() => hasLines ? onComparisonToggle?.() : undefined}
        aria-pressed={comparisonMode}
        title={!hasLines ? "Add a line to use comparison mode." : undefined}
        style={{
          padding: "var(--space-xs) var(--space-sm)",
          borderRadius: "4px",
          border: "1px solid rgba(243, 238, 229, 0.3)",
          cursor: hasLines ? "pointer" : "default",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.3,
          fontFamily: "var(--font-sans)",
          backgroundColor: comparisonMode
            ? "var(--shell-accent)"
            : "var(--shell-secondary)",
          color: "var(--shell-dominant)",
          transition: "background-color 0.15s",
          opacity: hasLines ? 1 : 0.4,
          pointerEvents: hasLines ? "auto" : "none",
        }}
      >
        {comparisonMode ? "Baseline View" : "Proposal View"}
      </button>

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

      {/* Primary CTA — Add Line */}
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

      {/* Share CTA — rightmost */}
      <button
        onClick={() => onShareClick?.()}
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
        Share
      </button>
    </header>
  );
}
