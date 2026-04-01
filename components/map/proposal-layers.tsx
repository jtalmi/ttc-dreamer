"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type ProposalLayersProps = Readonly<{
  linesGeoJSON: FeatureCollection;
  stationsGeoJSON: FeatureCollection;
  inProgressGeoJSON: FeatureCollection | null;
  selectedElementId: string | null;
  /** GeoJSON for the snap cue ring overlay. Null when no snap target. */
  snapCueGeoJSON?: FeatureCollection | null;
}>;

/**
 * Renders proposal line geometry, station dots, and the in-progress drawing
 * on top of the TTC baseline layers. Follows the TtcLayers Source/Layer pattern.
 *
 * Also renders the snap cue ring overlay and selection highlights.
 */
export function ProposalLayers({
  linesGeoJSON,
  stationsGeoJSON,
  inProgressGeoJSON,
  selectedElementId,
  snapCueGeoJSON = null,
}: ProposalLayersProps) {
  return (
    <>
      {/* Committed proposal lines */}
      <Source id="proposal-lines" type="geojson" data={linesGeoJSON}>
        <Layer
          id="proposal-lines-stroke"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        {/* Selection glow for selected line */}
        <Layer
          id="proposal-lines-selected"
          type="line"
          filter={["==", ["get", "id"], selectedElementId ?? ""]}
          paint={{
            "line-color": "rgba(216, 90, 42, 0.25)",
            "line-width": 12,
            "line-blur": 8,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>

      {/* Proposal station dots */}
      <Source id="proposal-stations" type="geojson" data={stationsGeoJSON}>
        {/* Selection halo for selected station */}
        <Layer
          id="proposal-stations-selected"
          type="circle"
          filter={["==", ["get", "id"], selectedElementId ?? ""]}
          paint={{
            "circle-radius": 10,
            "circle-color": "rgba(216, 90, 42, 0.25)",
            "circle-blur": 0.5,
          }}
        />
        <Layer
          id="proposal-stations-circle"
          type="circle"
          paint={{
            "circle-radius": 4,
            "circle-color": "#FFFFFF",
            "circle-stroke-width": 2,
            "circle-stroke-color": ["get", "color"],
          }}
        />
        {/* Station labels */}
        <Layer
          id="proposal-stations-label"
          type="symbol"
          layout={{
            "text-field": ["get", "name"],
            "text-size": 14,
            "text-anchor": "left",
            "text-offset": [0.8, 0],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
          }}
          paint={{
            "text-color": "#18324A",
            "text-halo-color": "#F3EEE5",
            "text-halo-width": 1.5,
          }}
        />
      </Source>

      {/* In-progress drawing ghost line */}
      {inProgressGeoJSON && (
        <Source id="proposal-in-progress" type="geojson" data={inProgressGeoJSON}>
          <Layer
            id="proposal-in-progress-line"
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": 4,
              "line-opacity": 0.55,
            }}
            layout={{
              "line-cap": "round",
            }}
          />
        </Source>
      )}

      {/* Snap cue ring — 16px diameter, accent-derived stroke, no fill */}
      {snapCueGeoJSON && (
        <Source id="snap-cue" type="geojson" data={snapCueGeoJSON}>
          <Layer
            id="snap-cue-ring"
            type="circle"
            paint={{
              "circle-radius": 8,
              "circle-color": "transparent",
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "rgba(216, 90, 42, 0.45)",
            }}
          />
        </Source>
      )}
    </>
  );
}
