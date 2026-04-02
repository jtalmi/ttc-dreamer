"use client";

import { useMemo } from "react";
import type {
  BaselineLineInspection,
  ProposalDraft,
  ProposalLineDraft,
} from "@/lib/proposal";

type BaselineLineInspectorPanelProps = Readonly<{
  line: BaselineLineInspection;
  draft: ProposalDraft;
  onClose: () => void;
}>;

function formatSystemLabel(system: "ttc" | "go") {
  return system === "go" ? "GO Transit" : "TTC";
}

export function BaselineLineInspectorPanel({
  line,
  draft,
  onClose,
}: BaselineLineInspectorPanelProps) {
  const connectedProposalLines = useMemo(() => {
    return draft.lines.filter((draftLine) => draftLine.parentLineId === line.sourceId);
  }, [draft.lines, line.sourceId]);

  const divider = (
    <div
      style={{
        height: "1px",
        backgroundColor: "var(--inspector-divider)",
        margin: "var(--space-md) 0",
        flexShrink: 0,
      }}
    />
  );

  function renderProposalLine(draftLine: ProposalLineDraft) {
    return (
      <div
        key={draftLine.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          marginBottom: "var(--space-xs)",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: draftLine.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "var(--shell-dominant)",
          }}
        >
          {draftLine.name}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          borderLeft: `4px solid ${line.color}`,
          backgroundColor: "var(--shell-secondary)",
          padding: "var(--space-sm) var(--space-md)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              lineHeight: 1.25,
              color: "var(--shell-dominant)",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {line.name}
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              opacity: 0.5,
              color: "var(--shell-dominant)",
            }}
          >
            {line.modeLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close inspector"
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "var(--shell-dominant)",
            fontSize: "20px",
            lineHeight: 1,
            fontFamily: "var(--font-sans)",
            flexShrink: 0,
          }}
        >
          &times;
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-md)",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--stat-group-label)",
              margin: "0 0 var(--space-sm) 0",
            }}
          >
            Baseline
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "var(--space-xs)",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              Network
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              {formatSystemLabel(line.system)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "var(--space-xs)",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              Label
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              {line.shortLabel ?? "Unknown"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              Status
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              {line.status ?? "Existing"}
            </span>
          </div>
        </div>

        {divider}

        <div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--stat-group-label)",
              margin: "0 0 var(--space-sm) 0",
            }}
          >
            Connected proposal lines
          </p>
          {connectedProposalLines.length === 0 ? (
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
                margin: 0,
                opacity: 0.5,
              }}
            >
              None
            </p>
          ) : (
            connectedProposalLines.map(renderProposalLine)
          )}
        </div>
      </div>
    </div>
  );
}
