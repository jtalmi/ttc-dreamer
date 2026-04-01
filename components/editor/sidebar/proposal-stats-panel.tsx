"use client";

import { useMemo } from "react";
import type { ProposalDraft } from "@/lib/proposal";
import { computeProposalStats } from "@/lib/proposal";

/** Format cost in millions to ~$NB or ~$NM string. */
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
  const formatted = rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
  return `~${formatted}K/day`;
}

type ProposalStatsPanelProps = Readonly<{
  draft: ProposalDraft;
}>;

/**
 * Live stats summary panel shown below the line list when no inspector is open.
 * Computes proposal-level aggregates and renders them with ~ prefix and qualifiers.
 */
export function ProposalStatsPanel({ draft }: ProposalStatsPanelProps) {
  const stats = useMemo(() => computeProposalStats(draft), [draft]);

  if (draft.lines.length === 0) {
    return (
      <p
        style={{
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: 1.5,
          opacity: 0.5,
          margin: 0,
          paddingTop: "var(--space-md)",
          color: "var(--shell-dominant)",
        }}
      >
        Add a line to see proposal stats.
      </p>
    );
  }

  const divider = (
    <div
      style={{
        height: "1px",
        backgroundColor: "var(--inspector-divider)",
        margin: "var(--space-md) 0",
      }}
    />
  );

  return (
    <div style={{ paddingTop: "var(--space-md)" }}>
      {/* Section heading */}
      <p
        style={{
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.3,
          color: "var(--stat-group-label)",
          margin: "0 0 var(--space-sm) 0",
        }}
      >
        Proposal Stats
      </p>

      {divider}

      {/* 2x2 primary stats grid */}
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
            ~{stats.travelTime} min
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
            end-to-end, longest line
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
            {stats.avgSpacing !== null ? `~${stats.avgSpacing} km` : "\u2014"}
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
            {formatCost(stats.totalCostM)}
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
            {formatRidership(stats.totalRidership)}
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

      {divider}

      {/* Secondary stat rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--stat-group-label)",
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
            {stats.stationCount} total
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--stat-group-label)",
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
            {stats.networkKm} km total
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--stat-group-label)",
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
            {stats.interchangeCount} connections
          </span>
        </div>
      </div>
    </div>
  );
}
