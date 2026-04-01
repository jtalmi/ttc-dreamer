"use client";

import { useMemo } from "react";
import type { ProposalDraft, ProposalLineDraft } from "@/lib/proposal";
import {
  computeLineLength,
  computeTravelTime,
  computeAvgStopSpacing,
  computeLineCost,
  computeLineRidership,
} from "@/lib/proposal";

const MODE_LABELS: Record<string, string> = {
  subway: "Subway",
  lrt: "LRT",
  brt: "BRT",
};

/** Format cost in millions to ~$NB or ~$NM string (without the ~ prefix). */
function formatCost(costM: number): string {
  if (costM >= 1000) {
    const billions = Math.round((costM / 1000) * 10) / 10;
    return `~$${billions}B`;
  }
  const millions = Math.round(costM * 10) / 10;
  return `~$${millions}M`;
}

/** Format ridership as ~{N/1000}K/day string. */
function formatRidership(ridership: number): string {
  const k = ridership / 1000;
  const rounded = Math.round(k * 10) / 10;
  // Use integer if no decimal part
  const formatted = rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
  return `~${formatted}K/day`;
}

type LineInspectorPanelProps = Readonly<{
  line: ProposalLineDraft;
  draft: ProposalDraft;
  onClose: () => void;
}>;

/**
 * Inspector panel for a proposed transit line.
 * Shows geometry, stats, and connection information per the UI-SPEC.
 */
export function LineInspectorPanel({ line, draft, onClose }: LineInspectorPanelProps) {
  const lengthKm = useMemo(() => computeLineLength(line), [line]);
  const travelTime = useMemo(() => computeTravelTime(line), [line]);
  const avgSpacing = useMemo(() => computeAvgStopSpacing(line), [line]);
  const costM = useMemo(() => computeLineCost(line), [line]);
  const ridership = useMemo(() => computeLineRidership(line), [line]);

  const interchangeCount = useMemo(() => {
    return line.stationIds.filter((stationId) => {
      const station = draft.stations.find((s) => s.id === stationId);
      if (!station) return false;
      return station.lineIds.length > 1 || station.linkedBaselineStationId != null;
    }).length;
  }, [line, draft]);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header strip — pinned */}
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
            {MODE_LABELS[line.mode] ?? line.mode}
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

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-md)",
        }}
      >
        {/* Geometry section */}
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
            Geometry
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
              Length
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              {(Math.round(lengthKm * 10) / 10).toFixed(1)} km
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
              Stations
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              {line.stationIds.length}
            </span>
          </div>
        </div>

        {divider}

        {/* Stats section — 2x2 grid */}
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
            Line Stats
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-sm)",
            }}
          >
            {/* Travel Time */}
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: "var(--shell-dominant)",
                  margin: 0,
                }}
              >
                ~{travelTime} min
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--stat-value-muted)",
                  margin: 0,
                }}
              >
                end-to-end
              </p>
            </div>

            {/* Avg Spacing */}
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: "var(--shell-dominant)",
                  margin: 0,
                }}
              >
                {avgSpacing !== null ? `~${avgSpacing} km` : "\u2014"}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--stat-value-muted)",
                  margin: 0,
                }}
              >
                per line average
              </p>
            </div>

            {/* Est. Cost */}
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: "var(--shell-dominant)",
                  margin: 0,
                }}
              >
                {formatCost(costM)}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--stat-value-muted)",
                  margin: 0,
                }}
              >
                rough order of magnitude
              </p>
            </div>

            {/* Est. Ridership */}
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: "var(--shell-dominant)",
                  margin: 0,
                }}
              >
                {formatRidership(ridership)}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--stat-value-muted)",
                  margin: 0,
                }}
              >
                directional estimate
              </p>
            </div>
          </div>
        </div>

        {divider}

        {/* Connection section */}
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
            Connections
          </p>
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
              Interchanges
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
              }}
            >
              {interchangeCount} connections
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
