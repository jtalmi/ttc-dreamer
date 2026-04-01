"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type CorridorLayersProps = Readonly<{
  busCorridors: FeatureCollection;
  streetcarCorridors: FeatureCollection;
  visible: boolean;
}>;

/**
 * Renders TTC bus and streetcar surface corridor lines as thin dashed overlays.
 * Corridors are visually subordinate to rapid transit lines — lower opacity,
 * narrower strokes, dashed pattern. Visibility is toggled via layout.visibility
 * (instant hide/show with no loading delay).
 */
export function CorridorLayers({
  busCorridors,
  streetcarCorridors,
  visible,
}: CorridorLayersProps) {
  const visibility = visible ? "visible" : "none";

  return (
    <>
      <Source id="bus-corridors-source" type="geojson" data={busCorridors}>
        <Layer
          id="bus-corridors"
          type="line"
          layout={{
            visibility,
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#E05A2A",
            "line-width": 2,
            "line-dasharray": [4, 4],
            "line-opacity": 0.6,
          }}
        />
      </Source>

      <Source id="streetcar-corridors-source" type="geojson" data={streetcarCorridors}>
        <Layer
          id="streetcar-corridors"
          type="line"
          layout={{
            visibility,
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#E05A2A",
            "line-width": 2,
            "line-dasharray": [4, 4],
            "line-opacity": 0.6,
          }}
        />
      </Source>
    </>
  );
}
