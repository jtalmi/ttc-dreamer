"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type ProposalLayersProps = Readonly<{
  linesGeoJSON: FeatureCollection;
  stationsGeoJSON: FeatureCollection;
  inProgressGeoJSON: FeatureCollection | null;
  selectedElementId: string | null;
}>;

/**
 * Renders proposal line geometry, station dots, and the in-progress drawing
 * on top of the TTC baseline layers. Follows the TtcLayers Source/Layer pattern.
 */
export function ProposalLayers({
  linesGeoJSON,
  stationsGeoJSON,
  inProgressGeoJSON,
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
      </Source>

      {/* Proposal station dots */}
      <Source id="proposal-stations" type="geojson" data={stationsGeoJSON}>
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
    </>
  );
}
