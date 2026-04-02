"use client";

import { Source, Layer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

type ContextLabelsProps = Readonly<{
  neighbourhoods: FeatureCollection;
  landmarks: FeatureCollection;
  streets: FeatureCollection;
}>;

/**
 * Renders Toronto context label layers: major street lines with name labels,
 * neighbourhood name labels, and landmark callouts.
 *
 * These layers are rendered below transit layers so they provide geographic
 * orientation without competing visually with TTC rapid transit lines.
 */
export function ContextLabels({ neighbourhoods, landmarks, streets }: ContextLabelsProps) {
  return (
    <>
      {/* Major street lines and name labels */}
      <Source id="major-streets" type="geojson" data={streets}>
        <Layer
          id="major-streets-labels"
          type="symbol"
          layout={{
            "text-field": ["get", "name"],
            "symbol-placement": "line",
            "text-size": 14,
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          }}
          paint={{
            "text-color": "rgba(24, 50, 74, 0.50)",
            "text-halo-color": "#F3EEE5",
            "text-halo-width": 1,
          }}
        />
      </Source>

      {/* Neighbourhood name labels — uppercase, subdued weight */}
      <Source id="neighbourhoods" type="geojson" data={neighbourhoods}>
        <Layer
          id="neighbourhood-labels"
          type="symbol"
          layout={{
            "text-field": ["get", "name"],
            "text-size": 14,
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-transform": "uppercase",
            "text-letter-spacing": 0.08,
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "rgba(24, 50, 74, 0.70)",
            "text-halo-color": "#F3EEE5",
            "text-halo-width": 1.5,
          }}
        />
      </Source>

      {/* Landmark callouts — bold proper nouns with slight vertical offset */}
      <Source id="landmarks" type="geojson" data={landmarks}>
        <Layer
          id="landmark-labels"
          type="symbol"
          layout={{
            "text-field": ["get", "name"],
            "text-size": 14,
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, -1],
            "text-anchor": "bottom",
          }}
          paint={{
            "text-color": "rgba(24, 50, 74, 0.85)",
            "text-halo-color": "#F3EEE5",
            "text-halo-width": 1.5,
          }}
        />
      </Source>
    </>
  );
}
