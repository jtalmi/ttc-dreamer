"use client";

import type { ProposalDraft } from "@/lib/proposal/proposal-types";

type SharedViewShellProps = Readonly<{
  draft: ProposalDraft;
  author?: string;
  mapElement: React.ReactNode;
  onEditAsCopy: () => void;
}>;

/**
 * Read-only shared view rendered when the app opens with a share link hash.
 * Displays a view-mode banner with the proposal title, optional author,
 * line/station summary stats, and an "Edit as Copy" CTA. The map fills
 * the remaining viewport below the banner.
 */
export default function SharedViewShell({
  draft,
  author,
  mapElement,
  onEditAsCopy,
}: SharedViewShellProps) {
  const lineCount = draft.lines.length;
  const stationCount = draft.stations.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* View-mode banner */}
      <div
        style={{
          backgroundColor: "var(--view-mode-banner-bg)",
          color: "var(--shell-dominant)",
          padding: "var(--space-sm) var(--space-lg)",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          height: "48px",
          gap: "var(--space-md)",
        }}
      >
        {/* Left: title and optional author */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              lineHeight: 1.25,
              fontFamily: "var(--font-sans)",
              color: "var(--shell-dominant)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {draft.title || "Untitled Proposal"}
          </span>
          {author && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                fontFamily: "var(--font-sans)",
                color: "var(--shell-dominant)",
                opacity: 0.7,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {author}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Center-right: line/station summary badge */}
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            color: "var(--shell-dominant)",
            whiteSpace: "nowrap",
          }}
        >
          {lineCount} {lineCount === 1 ? "line" : "lines"} {"\u00B7"} {stationCount}{" "}
          {stationCount === 1 ? "station" : "stations"}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Far right: Edit as Copy button */}
        <button
          onClick={onEditAsCopy}
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
            flexShrink: 0,
            minHeight: "44px",
            minWidth: "44px",
          }}
        >
          Edit as Copy
        </button>
      </div>

      {/* Full-width map area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {lineCount === 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.5,
              fontFamily: "var(--font-sans)",
              color: "var(--shell-secondary)",
              opacity: 0.7,
            }}
          >
            This proposal has no lines yet.
          </div>
        ) : null}
        {mapElement}
      </div>
    </div>
  );
}
