"use client";

import { useMemo } from "react";
import type { FeatureCollection } from "geojson";
import type { ProposalDraft, ProposalStationDraft } from "@/lib/proposal";
import { resolveNeighbourhood } from "@/lib/proposal";

type StationInspectorPanelProps = Readonly<{
  station: ProposalStationDraft;
  draft: ProposalDraft;
  neighbourhoods: FeatureCollection | null;
  onClose: () => void;
}>;

/**
 * Inspector panel for a proposed station.
 * Shows which lines it belongs to, baseline interchange link, and neighbourhood location.
 */
export function StationInspectorPanel({
  station,
  draft,
  neighbourhoods,
  onClose,
}: StationInspectorPanelProps) {
  const stationLines = useMemo(() => {
    return station.lineIds
      .map((lineId) => draft.lines.find((l) => l.id === lineId))
      .filter((l): l is NonNullable<typeof l> => l != null);
  }, [station.lineIds, draft.lines]);

  const location = useMemo(() => {
    if (neighbourhoods) {
      return resolveNeighbourhood(station.position, neighbourhoods);
    }
    // Fallback: lat, lng to 4 decimal places ([lng, lat] order in position)
    return `${station.position[1].toFixed(4)}, ${station.position[0].toFixed(4)}`;
  }, [station.position, neighbourhoods]);

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
      {/* Header strip — no color stripe for stations */}
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
        <span
          style={{
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: 1.25,
            color: "var(--shell-dominant)",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {station.name}
        </span>
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
        {/* Lines section */}
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
            Lines
          </p>
          {stationLines.length === 0 ? (
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.3,
                color: "var(--shell-dominant)",
                opacity: 0.5,
                margin: 0,
              }}
            >
              No lines
            </p>
          ) : (
            stationLines.map((line) => (
              <div
                key={line.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  marginBottom: "var(--space-xs)",
                }}
              >
                {/* Color dot */}
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
            ))
          )}
        </div>

        {divider}

        {/* Interchange section */}
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
            Connected to baseline
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
            {station.linkedBaselineStationId
              ? station.name
              : "None"}
          </p>
        </div>

        {divider}

        {/* Position section */}
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
