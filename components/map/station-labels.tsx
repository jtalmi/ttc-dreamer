"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type StationLabelsProps = Readonly<{
  ttcStations: FeatureCollection;
  goStations: FeatureCollection;
}>;

/**
 * Renders TTC and GO station name labels as symbol layers above the station
 * circle markers. TTC stations use the PT_NAME field from the City of Toronto
 * ArcGIS data. GO stations use the PLACE_NAME field.
 */
export function StationLabels({ ttcStations, goStations }: StationLabelsProps) {
  return (
    <>
      {/* TTC station name labels — placed to the right of each station dot */}
      <Source id="ttc-station-label-source" type="geojson" data={ttcStations}>
        <Layer
          id="ttc-station-labels"
          type="symbol"
          layout={{
            "text-field": ["coalesce", ["get", "PT_NAME"], ["get", "PLACE_NAME"], ["get", "name"]],
            "text-size": 14,
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-offset": [0.6, 0],
            "text-anchor": "left",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "rgba(24, 50, 74, 0.90)",
            "text-halo-color": "#F3EEE5",
            "text-halo-width": 1,
          }}
        />
      </Source>

      {/* GO station name labels — placed to the right of each station dot */}
      <Source id="go-station-label-source" type="geojson" data={goStations}>
        <Layer
          id="go-station-labels"
          type="symbol"
          layout={{
            "text-field": ["coalesce", ["get", "PLACE_NAME"], ["get", "STATION"], ["get", "name"]],
            "text-size": 14,
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-offset": [0.6, 0],
            "text-anchor": "left",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "rgba(0, 90, 43, 0.80)",
            "text-halo-color": "#F3EEE5",
            "text-halo-width": 1,
          }}
        />
      </Source>
    </>
  );
}
