"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Map, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapLayerMouseEvent, MapMouseEvent, MapRef } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import { TtcLayers } from "@/components/map/ttc-layers";
import { GoLayers } from "@/components/map/go-layers";
import { ContextLabels } from "@/components/map/context-labels";
import { StationLabels } from "@/components/map/station-labels";
import { CorridorLayers } from "@/components/map/corridor-layers";
import { ProposalLayers } from "@/components/map/proposal-layers";
import { StationNamePopover } from "@/components/editor/sidebar/station-name-popover";
import { InterchangeBadge } from "@/components/editor/sidebar/interchange-badge";
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
  buildSnapCueGeoJSON,
  snapToSegment,
  findNearbyStation,
  findSnapTarget,
} from "@/lib/proposal";
import type {
  ProposalDraft,
  DrawingSession,
  ToolMode,
  InterchangeSuggestion,
  EditorShellAction,
} from "@/lib/proposal";

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

/** State tracking a pending station name for the name popover. */
type PendingStationName = {
  stationId: string;
  position: [number, number];
  defaultName: string;
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
  /** Current snap position for the snap cue ring */
  snapPosition?: [number, number] | null;
  /** Pending interchange suggestion from chrome state */
  pendingInterchangeSuggestion?: (InterchangeSuggestion & { stationName: string }) | null;
  /** Called when user clicks to place a waypoint in draw-line mode */
  onAddWaypoint?: (lngLat: [number, number]) => void;
  /** Called when user double-clicks to finish drawing */
  onFinishDrawing?: () => void;
  /** Called on mouse move to update ghost segment cursor position */
  onUpdateCursor?: (lngLat: [number, number] | null) => void;
  /** Called when user clicks near a TTC line to extend or branch */
  onStartExtend?: (lineId: string, mode: "extend" | "branch", clickPoint: [number, number]) => void;
  /** Dispatch function for all editor actions */
  dispatch?: (action: EditorShellAction) => void;
}>;

/**
 * Interactive MapLibre GL map showing TTC rapid transit routes and GO Transit
 * context layers. Loaded via next/dynamic with ssr: false to prevent
 * window-is-undefined errors during server rendering.
 *
 * Also renders proposal layers and handles the full editing interaction loop:
 * drawing, station placement, snapping, interchange suggestions, and select-move.
 */
export default function TorontoMap({
  busCorridorVisible = false,
  draft,
  drawingSession = null,
  activeTool = "select",
  selectedElementId = null,
  snapPosition = null,
  pendingInterchangeSuggestion = null,
  onAddWaypoint,
  onFinishDrawing,
  onUpdateCursor,
  dispatch,
}: TorontoMapProps) {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  const [hoverStation, setHoverStation] = useState<HoverStation | null>(null);
  const [pendingStationName, setPendingStationName] = useState<PendingStationName | null>(null);
  // Track whether cursor is over a proposal line segment for cursor style
  const [isOverSegment, setIsOverSegment] = useState(false);
  // Track station drag state for select-move
  const [draggingStationId, setDraggingStationId] = useState<string | null>(null);
  // Track waypoint drag state for select-move waypoint repositioning
  const [draggingWaypoint, setDraggingWaypoint] = useState<{
    lineId: string;
    waypointIndex: number;
  } | null>(null);

  // Map ref for programmatic access (project/unproject)
  const mapRef = useRef<MapRef | null>(null);

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

  const snapCueGeoJSON = useMemo(() => {
    return buildSnapCueGeoJSON(snapPosition);
  }, [snapPosition]);

  const waypointsGeoJSON = useMemo((): FeatureCollection => {
    if (!draft || activeTool !== "select") {
      return { type: "FeatureCollection", features: [] };
    }
    const features = draft.lines.flatMap((line) =>
      line.waypoints.map((coord, index) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: coord },
        properties: { lineId: line.id, waypointIndex: index, color: line.color },
      })),
    );
    return { type: "FeatureCollection", features };
  }, [draft, activeTool]);

  // Helper: get the map instance from the ref
  function getMap() {
    return mapRef.current?.getMap() ?? null;
  }

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const map = getMap();

    if (activeTool === "draw-line") {
      onUpdateCursor?.(lngLat);

      // Compute snap target for snap cue ring
      if (map && draft) {
        const snapTarget = findSnapTarget(
          lngLat,
          draft.stations.map((s) => ({ id: s.id, position: s.position })),
          draft.lines,
          map,
          12,
        );
        dispatch?.({ type: "setSnapPosition", payload: snapTarget?.position ?? null });
      }
      return;
    }

    if (activeTool === "add-station") {
      // Check if cursor is over a proposal line segment
      if (map && draft) {
        let overSeg = false;
        for (const line of draft.lines) {
          if (line.waypoints.length < 2) continue;
          const snap = snapToSegment(lngLat, line.waypoints, map, 12);
          if (snap) {
            overSeg = true;
            dispatch?.({ type: "setSnapPosition", payload: snap.position });
            break;
          }
        }
        if (!overSeg) {
          dispatch?.({ type: "setSnapPosition", payload: null });
        }
        setIsOverSegment(overSeg);
      }
      return;
    }

    // Handle station drag in select mode
    if (activeTool === "select" && draggingStationId) {
      dispatch?.({ type: "moveStation", payload: { stationId: draggingStationId, position: lngLat } });
      return;
    }

    // Handle waypoint drag in select mode
    if (activeTool === "select" && draggingWaypoint) {
      dispatch?.({
        type: "moveWaypoint",
        payload: {
          lineId: draggingWaypoint.lineId,
          waypointIndex: draggingWaypoint.waypointIndex,
          position: lngLat,
        },
      });
      return;
    }

    // Clear snap cue in other tool modes
    if (map) {
      dispatch?.({ type: "setSnapPosition", payload: null });
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
    } else {
      setHoverStation(null);
    }
  }, [activeTool, onUpdateCursor, draft, dispatch, draggingStationId, draggingWaypoint]);

  const handleMouseLeave = useCallback(() => {
    setHoverStation(null);
    setIsOverSegment(false);
    if (activeTool === "draw-line") {
      onUpdateCursor?.(null);
    }
    dispatch?.({ type: "setSnapPosition", payload: null });
  }, [activeTool, onUpdateCursor, dispatch]);

  const handleMouseUp = useCallback(() => {
    if (draggingStationId) {
      setDraggingStationId(null);
    }
    if (draggingWaypoint) {
      setDraggingWaypoint(null);
    }
  }, [draggingStationId, draggingWaypoint]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const map = getMap();

    if (activeTool === "draw-line") {
      onAddWaypoint?.(lngLat);
      return;
    }

    if (activeTool === "add-station") {
      if (!draft || !map) return;

      // Find which proposal line the click is near (12px threshold)
      let snappedPosition: [number, number] | null = null;
      let targetLineId: string | null = null;

      for (const line of draft.lines) {
        if (line.waypoints.length < 2) continue;
        const snap = snapToSegment(lngLat, line.waypoints, map, 12);
        if (snap) {
          snappedPosition = snap.position;
          targetLineId = line.id;
          break;
        }
      }

      if (!snappedPosition || !targetLineId) {
        // No line nearby — cursor should show not-allowed (handled by cursorStyle)
        return;
      }

      // Generate default station name
      const stationName = `Station ${draft.stations.length + 1}`;

      // Check for nearby existing stations (20px threshold)
      if (data?.ttcStations) {
        const nearby = findNearbyStation(
          snappedPosition,
          draft.stations,
          data.ttcStations,
          map,
          20,
        );

        if (nearby) {
          // Suggest interchange — defer station creation
          dispatch?.({
            type: "suggestInterchange",
            payload: {
              newStationPosition: snappedPosition,
              nearbyStationId: nearby.id,
              nearbyStationName: nearby.name,
              lineId: targetLineId,
              stationName,
            },
          });
          return;
        }
      }

      // No nearby station — place station directly and show name popover
      const newStationId = crypto.randomUUID();
      dispatch?.({
        type: "placeStation",
        payload: {
          id: newStationId,
          position: snappedPosition,
          lineId: targetLineId,
          name: stationName,
        },
      });
      setPendingStationName({
        stationId: newStationId,
        position: snappedPosition,
        defaultName: stationName,
      });
      return;
    }

    if (activeTool === "select") {
      // Check if click hit a proposal element via interactive layers
      const features = e.features;
      if (features && features.length > 0) {
        const feature = features[0];
        const props = feature.properties as Record<string, unknown>;

        // Waypoint vertex click → start waypoint drag
        if (feature.layer?.id === "proposal-waypoints-circle") {
          const lineId = props["lineId"] as string;
          const waypointIndex = props["waypointIndex"] as number;
          setDraggingWaypoint({ lineId, waypointIndex });
          return;
        }

        // Station or line click (existing behavior)
        const id = props["id"] as string | null;
        if (id) {
          dispatch?.({ type: "setSelectedElement", payload: id });
          // Start dragging if it's a station and mouse is held down
          if (feature.layer?.id === "proposal-stations-circle") {
            setDraggingStationId(id);
          }
          return;
        }
      }
      // Click on empty space — deselect
      dispatch?.({ type: "setSelectedElement", payload: null });
    }
  }, [activeTool, onAddWaypoint, draft, data, dispatch]);

  const handleDblClick = useCallback((e: MapMouseEvent) => {
    if (activeTool !== "draw-line" || !drawingSession) return;
    // Prevent the default map zoom on double-click
    e.preventDefault();
    onFinishDrawing?.();
  }, [activeTool, drawingSession, onFinishDrawing]);

  // Handle station name save
  const handleStationNameSave = useCallback((name: string) => {
    if (!pendingStationName) return;
    dispatch?.({
      type: "updateStationName",
      payload: { stationId: pendingStationName.stationId, name },
    });
    setPendingStationName(null);
  }, [pendingStationName, dispatch]);

  // Handle station name dismissal — use the default name
  const handleStationNameDismiss = useCallback(() => {
    if (!pendingStationName) return;
    dispatch?.({
      type: "updateStationName",
      payload: {
        stationId: pendingStationName.stationId,
        name: pendingStationName.defaultName,
      },
    });
    setPendingStationName(null);
  }, [pendingStationName, dispatch]);

  // Handle interchange confirm — show name popover after
  const handleInterchangeConfirm = useCallback(() => {
    if (!pendingInterchangeSuggestion) return;
    dispatch?.({ type: "confirmInterchange" });
    // Note: confirmInterchange generates its own UUID in the reducer,
    // so we don't track a pending name here. The station is placed with
    // the suggestion's stationName.
  }, [pendingInterchangeSuggestion, dispatch]);

  // Handle interchange reject — show name popover after
  const handleInterchangeReject = useCallback(() => {
    if (!pendingInterchangeSuggestion) return;
    dispatch?.({ type: "rejectInterchange" });
  }, [pendingInterchangeSuggestion, dispatch]);

  // Determine map cursor style based on active tool and hover context
  const cursorStyle = useMemo(() => {
    if (draggingStationId || draggingWaypoint) return "grabbing";
    switch (activeTool) {
      case "draw-line": return "crosshair";
      case "add-station": return isOverSegment ? "cell" : "not-allowed";
      case "inspect": return "zoom-in";
      case "select": return "default";
      default: return "default";
    }
  }, [activeTool, isOverSegment, draggingStationId, draggingWaypoint]);

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
      ref={mapRef}
      initialViewState={TORONTO_VIEW}
      mapStyle={mapStyle}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      interactiveLayerIds={[
        "ttc-stations-circle",
        "proposal-lines-stroke",
        "proposal-stations-circle",
        "proposal-waypoints-circle",
      ]}
      cursor={cursorStyle}
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDblClick={handleDblClick}
    >
      {/*
        Layer stacking order (bottom to top):
        1. ContextLabels (streets, neighbourhoods, landmarks)
        2. CorridorLayers (bus + streetcar surface corridors, toggleable)
        3. GoLayers (GO lines, GO station circles)
        4. TtcLayers (TTC lines, TTC station circles)
        5. ProposalLayers (proposal lines, stations, in-progress drawing, snap cue)
        6. StationLabels (TTC + GO station name text labels)
        7. Popup overlays (hover tooltip, station name popover, interchange badge)
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
        snapCueGeoJSON={snapCueGeoJSON}
        waypointsGeoJSON={waypointsGeoJSON}
      />
      <StationLabels
        ttcStations={data.ttcStations}
        goStations={data.goStations}
      />

      {/* TTC station hover tooltip */}
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

      {/* Station name popover — appears after placing a station */}
      {pendingStationName && (
        <StationNamePopover
          position={pendingStationName.position}
          defaultName={pendingStationName.defaultName}
          onSave={handleStationNameSave}
          onDismiss={handleStationNameDismiss}
        />
      )}

      {/* Interchange suggestion badge */}
      {pendingInterchangeSuggestion && (
        <InterchangeBadge
          position={pendingInterchangeSuggestion.newStationPosition}
          nearbyStationName={pendingInterchangeSuggestion.nearbyStationName}
          onConfirm={handleInterchangeConfirm}
          onReject={handleInterchangeReject}
        />
      )}
    </Map>
  );
}
