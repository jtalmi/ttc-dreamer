"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type GoLayersProps = Readonly<{
  routes: FeatureCollection;
  stations: FeatureCollection;
}>;

/**
 * Renders GO Transit rail corridor lines and station markers as context layers.
 * TorontoMap decides whether these layers participate in selection.
 */
export function GoLayers({ routes, stations }: GoLayersProps) {
  return (
    <>
      {/* GO rail corridor lines — dashed, lower opacity */}
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

      {/* GO station markers — smaller white/green circles */}
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
