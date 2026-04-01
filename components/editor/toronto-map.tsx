"use client";

import { useState, useEffect } from "react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import { TtcLayers } from "@/components/map/ttc-layers";
import { GoLayers } from "@/components/map/go-layers";
import {
  TORONTO_VIEW,
  loadTtcRoutes,
  loadTtcStations,
  loadGoRoutes,
  loadGoStations,
} from "@/lib/baseline";

type MapData = {
  ttcRoutes: FeatureCollection;
  ttcStations: FeatureCollection;
  goRoutes: FeatureCollection;
  goStations: FeatureCollection;
};

/**
 * Interactive MapLibre GL map showing TTC rapid transit routes and GO Transit
 * context layers. Loaded via next/dynamic with ssr: false to prevent
 * window-is-undefined errors during server rendering.
 */
export default function TorontoMap() {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!key) {
      console.warn(
        "[TorontoMap] NEXT_PUBLIC_MAPTILER_KEY is not set. " +
          "Map tiles will not load. Add your MapTiler key to .env.local. " +
          "Get a free key at https://cloud.maptiler.com",
      );
    }

    Promise.all([
      loadTtcRoutes(),
      loadTtcStations(),
      loadGoRoutes(),
      loadGoStations(),
    ])
      .then(([ttcRoutes, ttcStations, goRoutes, goStations]) => {
        setData({ ttcRoutes, ttcStations, goRoutes, goStations });
      })
      .catch((err) => {
        console.error("[TorontoMap] Failed to load baseline data:", err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--shell-secondary)",
          fontSize: "16px",
          textAlign: "center",
          padding: "var(--space-2xl)",
        }}
      >
        {"Couldn't load the map. Check your connection and refresh the page."}
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--shell-secondary)",
          fontSize: "16px",
        }}
      >
        Loading Toronto map...
      </div>
    );
  }

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const mapStyle = mapTilerKey
    ? `https://api.maptiler.com/maps/dataviz-light/style.json?key=${mapTilerKey}`
    : "https://demotiles.maplibre.org/style.json";

  return (
    <Map
      initialViewState={TORONTO_VIEW}
      mapStyle={mapStyle}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      {/* Layer stacking order (bottom to top): GO lines → GO stations → TTC lines → TTC stations */}
      <GoLayers routes={data.goRoutes} stations={data.goStations} />
      <TtcLayers routes={data.ttcRoutes} stations={data.ttcStations} />
    </Map>
  );
}
