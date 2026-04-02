"use client";

import { useMemo } from "react";
import type { FeatureCollection } from "geojson";
import type {
  BaselineStationInspection,
  ProposalDraft,
  ProposalLineDraft,
} from "@/lib/proposal";
import { resolveNeighbourhood } from "@/lib/proposal";

type BaselineStationInspectorPanelProps = Readonly<{
  station: BaselineStationInspection;
  draft: ProposalDraft;
  neighbourhoods: FeatureCollection | null;
  onClose: () => void;
}>;

function formatSystemLabel(system: "ttc" | "go") {
  return system === "go" ? "GO Transit" : "TTC";
}

export function BaselineStationInspectorPanel({
  station,
  draft,
  neighbourhoods,
  onClose,
}: BaselineStationInspectorPanelProps) {
  const connectedProposalLines = useMemo(() => {
    const linkedLineIds = new Set(
      draft.stations
        .filter((draftStation) => draftStation.linkedBaselineStationId === station.sourceId)
        .flatMap((draftStation) => draftStation.lineIds),
    );

    return draft.lines.filter((line) => linkedLineIds.has(line.id));
  }, [draft.lines, draft.stations, station.sourceId]);

  const location = useMemo(() => {
    if (neighbourhoods) {
      return resolveNeighbourhood(station.position, neighbourhoods);
    }

    if (station.municipality) {
      return station.municipality;
    }

    return `${station.position[1].toFixed(4)}, ${station.position[0].toFixed(4)}`;
  }, [neighbourhoods, station.municipality, station.position]);

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

  function renderLine(line: ProposalLineDraft) {
    return (
      <div
        key={line.id}
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
            backgroundColor: line.color,
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
          {line.name}
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
            {station.name}
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
            {formatSystemLabel(station.system)}
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
            connectedProposalLines.map(renderLine)
          )}
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
            Address
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.3,
              color: "var(--shell-dominant)",
              margin: 0,
            }}
          >
            {station.address ?? "Unknown"}
          </p>
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
            Accessibility
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.3,
              color: "var(--shell-dominant)",
              margin: 0,
            }}
          >
            {station.accessibility ?? "Unknown"}
          </p>
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
            Location
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.3,
              color: "var(--shell-dominant)",
              margin: 0,
            }}
          >
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}
