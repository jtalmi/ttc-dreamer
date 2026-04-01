"use client";

import { useState } from "react";
import type { TransitMode } from "@/lib/proposal";
import { DEFAULT_LINE_COLORS, EXTENDED_SWATCH_COLORS } from "@/lib/proposal";

const ALL_SWATCH_COLORS = [...DEFAULT_LINE_COLORS, ...EXTENDED_SWATCH_COLORS];

const MODE_OPTIONS: { value: TransitMode; label: string }[] = [
  { value: "subway", label: "Subway" },
  { value: "lrt", label: "LRT" },
  { value: "brt", label: "BRT" },
];

/** Derives a default line name from the number of existing lines. */
function defaultLineName(lineCount: number): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = lineCount % letters.length;
  return `Line ${letters[index]}`;
}

type LineCreationPanelProps = Readonly<{
  onStartDrawing: (config: { name: string; mode: TransitMode; color: string }) => void;
  onCancel: () => void;
  nextDefaultColor: string;
  lineCount: number;
}>;

/**
 * Sidebar panel for creating a new proposal line.
 * Shows name field, mode selector, color swatch grid, and Start Drawing button.
 */
export function LineCreationPanel({
  onStartDrawing,
  onCancel,
  nextDefaultColor,
  lineCount,
}: LineCreationPanelProps) {
  const [name, setName] = useState(defaultLineName(lineCount));
  const [mode, setMode] = useState<TransitMode>("subway");
  const [color, setColor] = useState(nextDefaultColor);

  function handleSubmit() {
    onStartDrawing({ name: name.trim() || defaultLineName(lineCount), mode, color });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {/* Panel heading */}
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: 1.25,
          margin: 0,
          color: "var(--shell-dominant)",
        }}
      >
        New Line
      </h2>

      {/* Line name field */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <label
          htmlFor="line-name"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "var(--shell-dominant)",
          }}
        >
          Name
        </label>
        <input
          id="line-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Line A"
          style={{
            padding: "var(--space-xs) var(--space-sm)",
            borderRadius: "4px",
            border: "1px solid rgba(243, 238, 229, 0.3)",
            backgroundColor: "rgba(243, 238, 229, 0.08)",
            color: "var(--shell-dominant)",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: 1.5,
            fontFamily: "var(--font-sans)",
            outline: "none",
          }}
          onFocus={(e) => {
            (e.target as HTMLInputElement).style.borderColor = "var(--shell-accent)";
          }}
          onBlur={(e) => {
            (e.target as HTMLInputElement).style.borderColor =
              "rgba(243, 238, 229, 0.3)";
          }}
        />
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "var(--shell-dominant)",
          }}
        >
          Mode
        </span>
        <div style={{ display: "flex", gap: "var(--space-xs)" }}>
          {MODE_OPTIONS.map((opt) => {
            const isActive = opt.value === mode;
            return (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                aria-pressed={isActive}
                style={{
                  flex: 1,
                  padding: "var(--space-xs) var(--space-sm)",
                  borderRadius: "4px",
                  border: "1px solid rgba(243, 238, 229, 0.3)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  fontFamily: "var(--font-sans)",
                  backgroundColor: isActive ? "var(--shell-accent)" : "transparent",
                  color: "var(--shell-dominant)",
                  transition: "background-color 0.15s",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "var(--shell-dominant)",
          }}
        >
          Color
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 28px)",
            gap: "var(--space-sm)",
          }}
        >
          {ALL_SWATCH_COLORS.map((swatchColor) => {
            const isSelected = swatchColor === color;
            return (
              <button
                key={swatchColor}
                onClick={() => setColor(swatchColor)}
                aria-pressed={isSelected}
                aria-label={`Color ${swatchColor}`}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: swatchColor,
                  outline: isSelected
                    ? "2px solid var(--shell-accent)"
                    : "2px solid transparent",
                  outlineOffset: "2px",
                  padding: 0,
                  transition: "outline 0.1s",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Start Drawing button */}
      <button
        onClick={handleSubmit}
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
          marginTop: "var(--space-xs)",
        }}
      >
        Start Drawing
      </button>

      {/* Cancel link */}
      <button
        onClick={onCancel}
        style={{
          width: "100%",
          padding: "var(--space-xs)",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: 1.5,
          fontFamily: "var(--font-sans)",
          color: "var(--shell-dominant)",
          opacity: 0.5,
          textDecoration: "underline",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
