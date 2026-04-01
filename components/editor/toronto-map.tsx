"use client";

import { useState, useEffect, useCallback } from "react";
import { Map, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import { TtcLayers } from "@/components/map/ttc-layers";
import { GoLayers } from "@/components/map/go-layers";
import { ContextLabels } from "@/components/map/context-labels";
import { StationLabels } from "@/components/map/station-labels";
import { CorridorLayers } from "@/components/map/corridor-layers";
import {
  TORONTO_VIEW,
  loadTtcRoutes,
  loadTtcStations,
  loadGoRoutes,
  loadGoStations,
  loadNeighbourhoods,
  loadLandmarks,
  loadMajorStreets,
  loadBusCorridors,
  loadStreetcarCorridors,
} from "@/lib/baseline";

type MapData = {
  ttcRoutes: FeatureCollection;
  ttcStations: FeatureCollection;
  goRoutes: FeatureCollection;
  goStations: FeatureCollection;
  neighbourhoods: FeatureCollection;
  landmarks: FeatureCollection;
  streets: FeatureCollection;
  busCorridors: FeatureCollection;
  streetcarCorridors: FeatureCollection;
};

type HoverStation = {
  name: string;
  lng: number;
  lat: number;
  type: "ttc" | "go";
};

type TorontoMapProps = Readonly<{
  /** Controls visibility of bus and streetcar corridor overlay */
  busCorridorVisible?: boolean;
}>;

/**
 * Interactive MapLibre GL map showing TTC rapid transit routes and GO Transit
 * context layers. Loaded via next/dynamic with ssr: false to prevent
 * window-is-undefined errors during server rendering.
 */
export default function TorontoMap({ busCorridorVisible = false }: TorontoMapProps) {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  const [hoverStation, setHoverStation] = useState<HoverStation | null>(null);

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
      loadNeighbourhoods(),
      loadLandmarks(),
      loadMajorStreets(),
      loadBusCorridors(),
      loadStreetcarCorridors(),
    ])
      .then(([ttcRoutes, ttcStations, goRoutes, goStations, neighbourhoods, landmarks, streets, busCorridors, streetcarCorridors]) => {
        setData({ ttcRoutes, ttcStations, goRoutes, goStations, neighbourhoods, landmarks, streets, busCorridors, streetcarCorridors });
      })
      .catch((err) => {
        console.error("[TorontoMap] Failed to load baseline data:", err);
        setError(true);
      });
  }, []);

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const features = e.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const props = feature.properties as Record<string, unknown>;
      const coords = feature.geometry.type === "Point"
        ? (feature.geometry.coordinates as [number, number])
        : null;

      if (!coords) return;

      const name = (props["PT_NAME"] as string | null)
        ?? (props["PLACE_NAME"] as string | null)
        ?? (props["STATION"] as string | null)
        ?? "Unknown";

      setHoverStation({
        name,
        lng: coords[0],
        lat: coords[1],
        type: "ttc",
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverStation(null);
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
      interactiveLayerIds={["ttc-stations-circle"]}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/*
        Layer stacking order (bottom to top):
        1. ContextLabels (streets, neighbourhoods, landmarks)
        2. CorridorLayers (bus + streetcar surface corridors, toggleable)
        3. GoLayers (GO lines, GO station circles)
        4. TtcLayers (TTC lines, TTC station circles)
        5. StationLabels (TTC + GO station name text labels)
        6. Popup tooltip (floats above everything)
      */}
      <ContextLabels
        neighbourhoods={data.neighbourhoods}
        landmarks={data.landmarks}
        streets={data.streets}
      />
      <CorridorLayers
        busCorridors={data.busCorridors}
        streetcarCorridors={data.streetcarCorridors}
        visible={busCorridorVisible}
      />
      <GoLayers routes={data.goRoutes} stations={data.goStations} />
      <TtcLayers routes={data.ttcRoutes} stations={data.ttcStations} />
      <StationLabels
        ttcStations={data.ttcStations}
        goStations={data.goStations}
      />

      {hoverStation && (
        <Popup
          longitude={hoverStation.lng}
          latitude={hoverStation.lat}
          anchor="bottom"
          closeButton={false}
          closeOnClick={false}
          offset={10}
          style={{ fontSize: "14px" }}
        >
          {hoverStation.name} &mdash; TTC
        </Popup>
      )}
    </Map>
  );
}
