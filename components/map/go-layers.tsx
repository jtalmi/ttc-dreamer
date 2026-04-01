"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type GoLayersProps = Readonly<{
  routes: FeatureCollection;
  stations: FeatureCollection;
}>;

/**
 * Renders GO Transit rail corridor lines and station markers as context-only,
 * non-interactive layers visually subordinate to the TTC rapid transit layers.
 *
 * GO layers are intentionally excluded from interactiveLayerIds in TorontoMap
 * so they receive no hover or click events.
 */
export function GoLayers({ routes, stations }: GoLayersProps) {
  return (
    <>
      {/* GO rail corridor lines — dashed, lower opacity, context-only */}
      <Source id="go-routes" type="geojson" data={routes}>
        <Layer
          id="go-routes-line"
          type="line"
          paint={{
            "line-color": "#007A3D",
            "line-width": 3,
            "line-dasharray": [6, 3],
            "line-opacity": 0.75,
          }}
          layout={{
            "line-cap": "butt",
            "line-join": "round",
          }}
        />
      </Source>

      {/* GO station markers — smaller white/green circles, non-interactive */}
      <Source id="go-stations" type="geojson" data={stations}>
        <Layer
          id="go-stations-circle"
          type="circle"
          paint={{
            "circle-radius": 3.5,
            "circle-color": "#FFFFFF",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#007A3D",
          }}
        />
      </Source>
    </>
  );
}
