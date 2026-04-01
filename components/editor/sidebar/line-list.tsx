"use client";

import type { ProposalLineDraft } from "@/lib/proposal";

const MODE_LABELS: Record<string, string> = {
  subway: "Subway",
  lrt: "LRT",
  brt: "BRT",
};

type LineListProps = Readonly<{
  lines: ProposalLineDraft[];
  onAddLine: () => void;
  activeDrawingLineId: string | null;
}>;

/**
 * Sidebar panel showing the list of proposal lines.
 * Includes color swatch, line name, mode badge, and an Add Line button.
 */
export function LineList({ lines, onAddLine, activeDrawingLineId }: LineListProps) {
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
            return (
              <div
                key={line.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-sm)",
                  borderRadius: "4px",
                  borderLeft: isActive
                    ? "3px solid var(--shell-accent)"
                    : "3px solid transparent",
                  backgroundColor: "transparent",
                  cursor: "default",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "rgba(243, 238, 229, 0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "transparent";
                }}
              >
                {/* Color swatch */}
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: line.color,
                    flexShrink: 0,
                  }}
                />
                {/* Line name */}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {line.name}
                </span>
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
