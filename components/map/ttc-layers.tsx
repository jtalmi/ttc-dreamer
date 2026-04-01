"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type TtcLayersProps = Readonly<{
  routes: FeatureCollection;
  stations: FeatureCollection;
}>;

/** Renders TTC rapid transit route lines and station circles on the map. */
export function TtcLayers({ routes, stations }: TtcLayersProps) {
  return (
    <>
      {/* TTC route lines — one filter per line for distinct brand colors */}
      <Source id="ttc-routes" type="geojson" data={routes}>
        {/* Line 1 — Yonge-University (yellow/gold) */}
        <Layer
          id="ttc-line-1"
          type="line"
          filter={["==", ["get", "ROUTE_ID"], 1]}
          paint={{
            "line-color": "#FFC41F",
            "line-width": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        {/* Line 2 — Bloor-Danforth (green) */}
        <Layer
          id="ttc-line-2"
          type="line"
          filter={["==", ["get", "ROUTE_ID"], 2]}
          paint={{
            "line-color": "#009A44",
            "line-width": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        {/* Line 4 — Sheppard (purple) */}
        <Layer
          id="ttc-line-4"
          type="line"
          filter={["==", ["get", "ROUTE_ID"], 4]}
          paint={{
            "line-color": "#800080",
            "line-width": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        {/* Line 5 — Eglinton Crosstown (orange) */}
        <Layer
          id="ttc-line-5"
          type="line"
          filter={["==", ["get", "ROUTE_ID"], 5]}
          paint={{
            "line-color": "#DF6C2B",
            "line-width": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
        {/* Line 6 — Finch West (grey — future/under construction) */}
        <Layer
          id="ttc-line-6"
          type="line"
          filter={["==", ["get", "ROUTE_ID"], 6]}
          paint={{
            "line-color": "#808080",
            "line-width": 4,
          }}
          layout={{
            "line-cap": "round",
            "line-join": "round",
          }}
        />
      </Source>

      {/* TTC station circles — white dots with line-colored border */}
      <Source id="ttc-stations" type="geojson" data={stations}>
        <Layer
          id="ttc-stations-circle"
          type="circle"
          paint={{
            "circle-radius": 4,
            "circle-color": "#FFFFFF",
            "circle-stroke-width": 2,
            // Default stroke color; station data from ArcGIS does not include ROUTE_ID
            "circle-stroke-color": "#18324A",
          }}
        />
      </Source>
    </>
  );
}
