"use client";

import { useState, useRef, useEffect } from "react";
import type { ProposalLineDraft } from "@/lib/proposal";
import { EXTENDED_SWATCH_COLORS, DEFAULT_LINE_COLORS } from "@/lib/proposal";

const MODE_LABELS: Record<string, string> = {
  subway: "Subway",
  lrt: "LRT",
  brt: "BRT",
};

// All 12 swatch colors: 5 defaults + 7 extended
const ALL_SWATCH_COLORS = [...DEFAULT_LINE_COLORS, ...EXTENDED_SWATCH_COLORS];

type LineListProps = Readonly<{
  lines: ProposalLineDraft[];
  onAddLine: () => void;
  activeDrawingLineId: string | null;
  selectedLineId?: string | null;
  onUpdateName?: (lineId: string, name: string) => void;
  onUpdateColor?: (lineId: string, color: string) => void;
  onDeleteLine?: (lineId: string) => void;
  onSelectLine?: (lineId: string) => void;
  /** When provided, clicking a line row opens the line inspector instead of selecting. */
  onInspectLine?: (lineId: string) => void;
}>;

/**
 * Sidebar panel showing the list of proposal lines.
 * Supports inline name editing, color picker, delete affordance, and selection.
 */
export function LineList({
  lines,
  onAddLine,
  activeDrawingLineId,
  selectedLineId = null,
  onUpdateName,
  onUpdateColor,
  onDeleteLine,
  onSelectLine,
  onInspectLine,
}: LineListProps) {
  // Track which line is being edited inline
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  // Track which line has the color picker open
  const [colorPickerLineId, setColorPickerLineId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when editing starts
  useEffect(() => {
    if (editingLineId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingLineId]);

  function handleNameClick(line: ProposalLineDraft) {
    setEditingLineId(line.id);
    setEditingName(line.name);
    setColorPickerLineId(null);
  }

  function handleNameCommit(lineId: string) {
    const trimmed = editingName.trim();
    if (trimmed && trimmed !== lines.find((l) => l.id === lineId)?.name) {
      onUpdateName?.(lineId, trimmed);
    }
    setEditingLineId(null);
  }

  function handleNameKeyDown(e: React.KeyboardEvent, lineId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameCommit(lineId);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setEditingLineId(null);
    }
  }

  function handleSwatchClick(line: ProposalLineDraft) {
    setColorPickerLineId(colorPickerLineId === line.id ? null : line.id);
    setEditingLineId(null);
  }

  function handleColorSelect(lineId: string, color: string) {
    onUpdateColor?.(lineId, color);
    setColorPickerLineId(null);
  }

  function handleDeleteClick(e: React.MouseEvent, lineId: string) {
    e.stopPropagation();
    // Select the line first so deleteSelected knows what to target
    onSelectLine?.(lineId);
    onDeleteLine?.(lineId);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Line rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {lines.length === 0 ? (
          <p
            style={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.5,
              opacity: 0.5,
              margin: 0,
              padding: "var(--space-md) 0",
            }}
          >
            Your proposal is empty. Add a line to get started.
          </p>
        ) : (
          lines.map((line) => {
            const isActive = line.id === activeDrawingLineId;
            const isSelected = line.id === selectedLineId;
            const isEditingThis = editingLineId === line.id;
            const isColorPickerOpen = colorPickerLineId === line.id;

            return (
              <div key={line.id}>
                {/* Line row */}
                <div
                  onClick={() => {
                    if (!isEditingThis) {
                      if (onInspectLine) {
                        onInspectLine(line.id);
                      } else {
                        onSelectLine?.(line.id);
                      }
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-sm)",
                    padding: "var(--space-sm) var(--space-sm)",
                    borderRadius: "4px",
                    borderLeft: isActive
                      ? "3px solid var(--shell-accent)"
                      : isSelected
                        ? "3px solid rgba(216, 90, 42, 0.5)"
                        : "3px solid transparent",
                    backgroundColor: isSelected
                      ? "rgba(216, 90, 42, 0.1)"
                      : "transparent",
                    cursor: "default",
                    transition: "background-color 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor =
                        "rgba(243, 238, 229, 0.08)";
                    }
                    // Show delete button
                    const deleteBtn = e.currentTarget.querySelector(
                      "[data-delete-btn]",
                    ) as HTMLElement | null;
                    if (deleteBtn) deleteBtn.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor =
                        "transparent";
                    }
                    // Hide delete button
                    const deleteBtn = e.currentTarget.querySelector(
                      "[data-delete-btn]",
                    ) as HTMLElement | null;
                    if (deleteBtn) deleteBtn.style.opacity = "0";
                  }}
                >
                  {/* Color swatch — clickable to open color picker */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwatchClick(line);
                    }}
                    title="Change color"
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: line.color,
                      flexShrink: 0,
                      border: isColorPickerOpen
                        ? "2px solid var(--shell-accent)"
                        : "2px solid transparent",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none",
                    }}
                  />

                  {/* Line name — inline edit on click */}
                  {isEditingThis ? (
                    <input
                      ref={inputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleNameCommit(line.id)}
                      onKeyDown={(e) => handleNameKeyDown(e, line.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1,
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: 1.3,
                        fontFamily: "var(--font-sans)",
                        background: "rgba(243, 238, 229, 0.1)",
                        border: "1px solid var(--shell-accent)",
                        borderRadius: "3px",
                        color: "var(--shell-dominant)",
                        padding: "2px 4px",
                        outline: "none",
                        minWidth: 0,
                      }}
                    />
                  ) : (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNameClick(line);
                      }}
                      title="Click to rename"
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: 1.3,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "text",
                      }}
                    >
                      {line.name}
                    </span>
                  )}

                  {/* Mode badge */}
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: 1.3,
                      opacity: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {MODE_LABELS[line.mode] ?? line.mode}
                  </span>

                  {/* Delete button — visible on hover */}
                  <button
                    data-delete-btn
                    onClick={(e) => handleDeleteClick(e, line.id)}
                    title="Delete line"
                    style={{
                      width: "20px",
                      height: "20px",
                      minWidth: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "var(--shell-destructive)",
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: 1,
                      padding: 0,
                      opacity: 0,
                      transition: "opacity 0.1s",
                      flexShrink: 0,
                    }}
                  >
                    x
                  </button>
                </div>

                {/* Color picker popover — below the row */}
                {isColorPickerOpen && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 28px)",
                      gap: "var(--space-sm)",
                      padding: "var(--space-sm)",
                      backgroundColor: "rgba(24, 50, 74, 0.9)",
                      borderRadius: "4px",
                      marginLeft: "var(--space-sm)",
                      marginBottom: "var(--space-xs)",
                    }}
                  >
                    {ALL_SWATCH_COLORS.map((color) => {
                      const isActiveSwatch = color === line.color;
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(line.id, color)}
                          title={color}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            border: isActiveSwatch
                              ? "2px solid var(--shell-accent)"
                              : "2px solid transparent",
                            outline: isActiveSwatch
                              ? "2px solid var(--shell-accent)"
                              : "none",
                            outlineOffset: "2px",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Line button — pinned at bottom */}
      <div style={{ flexShrink: 0, paddingTop: "var(--space-md)" }}>
        <button
          onClick={onAddLine}
          style={{
            width: "100%",
            padding: "var(--space-sm) var(--space-md)",
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
      </div>
    </div>
  );
}
