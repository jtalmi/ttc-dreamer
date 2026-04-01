"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Map, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapLayerMouseEvent, MapMouseEvent } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import { TtcLayers } from "@/components/map/ttc-layers";
import { GoLayers } from "@/components/map/go-layers";
import { ContextLabels } from "@/components/map/context-labels";
import { StationLabels } from "@/components/map/station-labels";
import { CorridorLayers } from "@/components/map/corridor-layers";
import { ProposalLayers } from "@/components/map/proposal-layers";
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
import {
  buildProposalLinesGeoJSON,
  buildProposalStationsGeoJSON,
  buildInProgressGeoJSON,
} from "@/lib/proposal";
import type { ProposalDraft, DrawingSession, ToolMode } from "@/lib/proposal";

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
  /** Current proposal draft for rendering proposal layers */
  draft?: ProposalDraft;
  /** Active drawing session for ghost segment rendering */
  drawingSession?: DrawingSession | null;
  /** Active editing tool (controls click behavior and cursor style) */
  activeTool?: ToolMode;
  /** Currently selected element ID */
  selectedElementId?: string | null;
  /** Called when user clicks to place a waypoint in draw-line mode */
  onAddWaypoint?: (lngLat: [number, number]) => void;
  /** Called when user double-clicks to finish drawing */
  onFinishDrawing?: () => void;
  /** Called on mouse move to update ghost segment cursor position */
  onUpdateCursor?: (lngLat: [number, number] | null) => void;
  /** Called when user clicks near a TTC line to extend or branch */
  onStartExtend?: (lineId: string, mode: "extend" | "branch", clickPoint: [number, number]) => void;
}>;

/**
 * Interactive MapLibre GL map showing TTC rapid transit routes and GO Transit
 * context layers. Loaded via next/dynamic with ssr: false to prevent
 * window-is-undefined errors during server rendering.
 *
 * Also renders proposal layers and handles the drawing interaction loop.
 */
export default function TorontoMap({
  busCorridorVisible = false,
  draft,
  drawingSession = null,
  activeTool = "select",
  selectedElementId = null,
  onAddWaypoint,
  onFinishDrawing,
  onUpdateCursor,
}: TorontoMapProps) {
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

  // Build proposal GeoJSON from draft state
  const linesGeoJSON = useMemo(() => {
    if (!draft) return { type: "FeatureCollection" as const, features: [] };
    return buildProposalLinesGeoJSON(draft);
  }, [draft]);

  const stationsGeoJSON = useMemo(() => {
    if (!draft) return { type: "FeatureCollection" as const, features: [] };
    return buildProposalStationsGeoJSON(draft);
  }, [draft]);

  const activeLineColor = useMemo(() => {
    if (!drawingSession || !draft) return "#7B61FF";
    return draft.lines.find((l) => l.id === drawingSession.lineId)?.color ?? "#7B61FF";
  }, [drawingSession, draft]);

  const inProgressGeoJSON = useMemo(() => {
    return buildInProgressGeoJSON(drawingSession, activeLineColor);
  }, [drawingSession, activeLineColor]);

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    // Update ghost segment cursor when drawing
    if (activeTool === "draw-line") {
      onUpdateCursor?.([e.lngLat.lng, e.lngLat.lat]);
      return;
    }

    // Show hover tooltip for station features
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
  }, [activeTool, onUpdateCursor]);

  const handleMouseLeave = useCallback(() => {
    setHoverStation(null);
    if (activeTool === "draw-line") {
      onUpdateCursor?.(null);
    }
  }, [activeTool, onUpdateCursor]);

  const handleClick = useCallback((e: MapMouseEvent) => {
    if (activeTool !== "draw-line") return;
    onAddWaypoint?.([e.lngLat.lng, e.lngLat.lat]);
  }, [activeTool, onAddWaypoint]);

  const handleDblClick = useCallback((e: MapMouseEvent) => {
    if (activeTool !== "draw-line" || !drawingSession) return;
    // Prevent the default map zoom on double-click
    e.preventDefault();
    onFinishDrawing?.();
  }, [activeTool, drawingSession, onFinishDrawing]);

  // Determine map cursor style based on active tool
  const cursorStyle = useMemo(() => {
    switch (activeTool) {
      case "draw-line": return "crosshair";
      case "add-station": return "cell";
      case "inspect": return "zoom-in";
      default: return "default";
    }
  }, [activeTool]);

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
      cursor={cursorStyle}
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseLeave}
      onClick={handleClick}
      onDblClick={handleDblClick}
    >
      {/*
        Layer stacking order (bottom to top):
        1. ContextLabels (streets, neighbourhoods, landmarks)
        2. CorridorLayers (bus + streetcar surface corridors, toggleable)
        3. GoLayers (GO lines, GO station circles)
        4. TtcLayers (TTC lines, TTC station circles)
        5. ProposalLayers (proposal lines, stations, in-progress drawing)
        6. StationLabels (TTC + GO station name text labels)
        7. Popup tooltip (floats above everything)
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
      <ProposalLayers
        linesGeoJSON={linesGeoJSON}
        stationsGeoJSON={stationsGeoJSON}
        inProgressGeoJSON={inProgressGeoJSON}
        selectedElementId={selectedElementId}
      />
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
