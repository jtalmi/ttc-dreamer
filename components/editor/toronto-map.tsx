"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Map, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapLayerMouseEvent, MapMouseEvent, MapRef } from "react-map-gl/maplibre";
import type { MapGeoJSONFeature } from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import { TtcLayers } from "@/components/map/ttc-layers";
import { GoLayers } from "@/components/map/go-layers";
import { ContextLabels } from "@/components/map/context-labels";
import { StationLabels } from "@/components/map/station-labels";
import { CorridorLayers } from "@/components/map/corridor-layers";
import { ProposalLayers } from "@/components/map/proposal-layers";
import { StationNamePopover } from "@/components/editor/sidebar/station-name-popover";
// InterchangeBadge kept for potential future use (auto-interchange now fires directly)
// import { InterchangeBadge } from "@/components/editor/sidebar/interchange-badge";
import {
  TORONTO_VIEW,
  loadTtcRoutes,
  loadTtcStations,
  loadFutureTtcRoutes,
  loadFutureTtcStations,
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
  detectLineHitType,
} from "@/lib/proposal";
import type {
  BaselineLineInspection,
  ProposalDraft,
  BaselineStationInspection,
  DrawingSession,
  ToolMode,
  InterchangeSuggestion,
  EditorShellAction,
  BaselineMode,
} from "@/lib/proposal";
import { DEFAULT_LINE_COLORS } from "@/lib/proposal";
import { reverseGeocode } from "@/lib/geocoding/reverse-geocode";

type MapData = {
  ttcRoutes: FeatureCollection;
  ttcStations: FeatureCollection;
  futureTtcRoutes: FeatureCollection;
  futureTtcStations: FeatureCollection;
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

const SELECT_LAYER_PRIORITY = [
  "proposal-stations-circle",
  "proposal-lines-stroke",
  "ttc-stations-circle",
  "go-stations-circle",
  "ttc-line-1",
  "ttc-line-2",
  "ttc-line-4",
  "ttc-line-5",
  "ttc-line-6",
  "ttc-line-7-dash",
  "go-routes-line",
] as const;

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function buildAddress(addressNumber: unknown, streetName: unknown) {
  const number = asString(addressNumber);
  const street = asString(streetName);
  const value = [number, street].filter(Boolean).join(" ").trim();
  return value.length > 0 ? value : null;
}

function pickSelectableFeature(features: MapGeoJSONFeature[] | undefined) {
  if (!features || features.length === 0) return null;

  let bestFeature: MapGeoJSONFeature | null = null;
  let bestPriority = Number.POSITIVE_INFINITY;

  for (const feature of features) {
    const layerId = feature.layer?.id ?? "";
    const priority = SELECT_LAYER_PRIORITY.indexOf(layerId as (typeof SELECT_LAYER_PRIORITY)[number]);
    if (priority !== -1 && priority < bestPriority) {
      bestFeature = feature;
      bestPriority = priority;
    }
  }

  return bestFeature;
}

type TorontoMapProps = Readonly<{
  /** Controls visibility of bus and streetcar corridor overlay */
  busCorridorVisible?: boolean;
  /** Controls which baseline TTC dataset is shown (today vs future committed) */
  baselineMode?: BaselineMode;
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
  /**
   * Opacity applied to committed proposal elements (lines, stations, labels).
   * Set to 0.4 in comparison (Baseline View) mode. Defaults to 1.
   */
  proposalOpacity?: number;
  /** Called when user double-clicks to finish drawing */
  onFinishDrawing?: () => void;
  /** Called on mouse move to update ghost segment cursor position */
  onUpdateCursor?: (lngLat: [number, number] | null) => void;
  /** Called when user clicks near a TTC line to extend or branch */
  onStartExtend?: (lineId: string, mode: "extend" | "branch", clickPoint: [number, number]) => void;
  /** Dispatch function for all editor actions */
  dispatch?: (action: EditorShellAction) => void;
  /** Called once after the map finishes loading, passes the MapRef for canvas export. */
  onMapReady?: (mapRef: MapRef) => void;
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
  baselineMode = "today",
  draft,
  drawingSession = null,
  activeTool = "select",
  selectedElementId = null,
  snapPosition = null,
  proposalOpacity = 1,
  onFinishDrawing,
  onUpdateCursor,
  onStartExtend,
  dispatch,
  onMapReady,
}: TorontoMapProps) {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  const [hoverStation, setHoverStation] = useState<HoverStation | null>(null);
  const [pendingStationName, setPendingStationName] = useState<PendingStationName | null>(null);
  // Track whether cursor is over a proposal line segment for cursor style
  const [isOverSegment, setIsOverSegment] = useState(false);
  // Track whether the cursor is over any clickable feature in select mode
  const [isOverSelectable, setIsOverSelectable] = useState(false);
  // Track station drag state for select-move
  const [draggingStationId, setDraggingStationId] = useState<string | null>(null);
  // Map ref for programmatic access (project/unproject)
  const mapRef = useRef<MapRef | null>(null);
  // Throttle ref for station drag dispatch (~30ms to avoid MapLibre worker queue blowup)
  const lastDragDispatch = useRef<number>(0);
  // Track last drag position so mouseup can fire a final precise dispatch
  const lastDragPosition = useRef<[number, number] | null>(null);

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
      loadFutureTtcRoutes(),
      loadFutureTtcStations(),
      loadGoRoutes(),
      loadGoStations(),
      loadNeighbourhoods(),
      loadLandmarks(),
      loadMajorStreets(),
      loadBusCorridors(),
      loadStreetcarCorridors(),
    ])
      .then(([ttcRoutes, ttcStations, futureTtcRoutes, futureTtcStations, goRoutes, goStations, neighbourhoods, landmarks, streets, busCorridors, streetcarCorridors]) => {
        setData({ ttcRoutes, ttcStations, futureTtcRoutes, futureTtcStations, goRoutes, goStations, neighbourhoods, landmarks, streets, busCorridors, streetcarCorridors });
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
    return buildInProgressGeoJSON(drawingSession, draft ?? { id: "", title: "", baselineMode: "today", lines: [], stations: [] }, activeLineColor);
  }, [drawingSession, draft, activeLineColor]);

  const snapCueGeoJSON = useMemo(() => {
    return buildSnapCueGeoJSON(snapPosition);
  }, [snapPosition]);

  // Helper: get the map instance from the ref
  function getMap() {
    return mapRef.current?.getMap() ?? null;
  }

  const buildBaselineStationInspection = useCallback(
    (feature: MapGeoJSONFeature, layerId: string): BaselineStationInspection | null => {
      if (feature.geometry.type !== "Point") return null;

      const props = feature.properties as Record<string, unknown>;
      const position = feature.geometry.coordinates as [number, number];

      if (layerId === "ttc-stations-circle") {
        return {
          type: "baseline-station",
          sourceId: String(props["OBJECTID"] ?? ""),
          system: "ttc",
          name:
            asString(props["PT_NAME"])
            ?? asString(props["PLACE_NAME"])
            ?? "TTC Station",
          position,
          address:
            asString(props["ADDRESS_FULL"])
            ?? buildAddress(props["ADDRESS_NUMBER"], props["LINEAR_NAME_FULL"]),
          municipality:
            asString(props["CITY"])
            ?? asString(props["MUNICIPALITY"]),
          accessibility: asString(props["PT_ELEVATOR"]),
        };
      }

      if (layerId === "go-stations-circle") {
        return {
          type: "baseline-station",
          sourceId: String(props["OBJECTID"] ?? ""),
          system: "go",
          name:
            asString(props["STATION"])
            ?? asString(props["PLACE_NAME"])
            ?? "GO Station",
          position,
          address: buildAddress(props["ADDRESS_NUMBER"], props["LINEAR_NAME_FULL"]),
          municipality:
            asString(props["MUNICIPALITY_NAME"])
            ?? asString(props["WARD_NAME"]),
          accessibility: null,
        };
      }

      return null;
    },
    [],
  );

  const buildBaselineLineInspection = useCallback(
    (feature: MapGeoJSONFeature, layerId: string): BaselineLineInspection | null => {
      const props = feature.properties as Record<string, unknown>;

      if (layerId.startsWith("ttc-line-")) {
        const color = asString(props["ROUTE_COLOR"]);
        return {
          type: "baseline-line",
          sourceId: String(props["OBJECTID"] ?? props["ROUTE_ID"] ?? ""),
          system: "ttc",
          name:
            asString(props["ROUTE_LONG_NAME"])
            ?? asString(props["ROUTE_SHORT_NAME"])
            ?? "TTC Line",
          color: color ? `#${color}` : "#18324A",
          modeLabel: "Subway",
          status: asString(props["status"]),
          shortLabel: asString(props["ROUTE_SHORT_NAME"]),
        };
      }

      if (layerId === "go-routes-line") {
        const corridor = asString(props["CORRIDOR"]) ?? "GO Corridor";
        return {
          type: "baseline-line",
          sourceId: String(props["CORRIDOR_ID"] ?? corridor),
          system: "go",
          name: `${corridor} GO Corridor`,
          color: "#007A3D",
          modeLabel: "Regional Rail",
          status: null,
          shortLabel: asString(props["CORRIDOR_ID"]),
        };
      }

      return null;
    },
    [],
  );

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const map = getMap();

    if (activeTool === "draw-line") {
      setIsOverSelectable(false);

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
      setIsOverSelectable(false);
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

    // Handle station drag in select mode (throttled to ~30ms)
    if (activeTool === "select" && draggingStationId) {
      setIsOverSelectable(false);
      lastDragPosition.current = lngLat;
      const now = performance.now();
      if (now - lastDragDispatch.current < 30) return;
      lastDragDispatch.current = now;
      dispatch?.({ type: "moveStation", payload: { stationId: draggingStationId, position: lngLat } });
      return;
    }

    // Clear snap cue in other tool modes
    if (map) {
      dispatch?.({ type: "setSnapPosition", payload: null });
    }

    if (activeTool === "select") {
      setIsOverSelectable(Boolean(pickSelectableFeature(e.features)));
    } else {
      setIsOverSelectable(false);
    }

    // Show hover tooltip for station features
    const stationFeature = (e.features ?? []).find((feature) => feature.geometry.type === "Point");
    if (stationFeature) {
      if (stationFeature.geometry.type !== "Point") return;
      const props = stationFeature.properties as Record<string, unknown>;
      const coords = stationFeature.geometry.coordinates as [number, number];

      const name = (props["PT_NAME"] as string | null)
        ?? (props["PLACE_NAME"] as string | null)
        ?? (props["STATION"] as string | null)
        ?? "Unknown";

      // Determine station type from the layer the feature came from
      const layerId = stationFeature.layer?.id;
      const stationType: "ttc" | "go" = layerId === "go-stations-circle" ? "go" : "ttc";

      setHoverStation({
        name,
        lng: coords[0],
        lat: coords[1],
        type: stationType,
      });
    } else {
      setHoverStation(null);
    }
  }, [activeTool, onUpdateCursor, draft, dispatch, draggingStationId]);

  const handleMouseDown = useCallback((e: MapLayerMouseEvent) => {
    if (activeTool !== "select") return;

    const map = getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["proposal-stations-circle"],
    });
    if (features.length === 0) return;

    const feature = features[0];
    const props = feature.properties as Record<string, unknown>;
    const stationId = props["id"] as string | null;
    if (stationId) {
      setDraggingStationId(stationId);
    }
  }, [activeTool]);

  const handleMouseLeave = useCallback(() => {
    setHoverStation(null);
    setIsOverSegment(false);
    setIsOverSelectable(false);
    setDraggingStationId(null);
    lastDragPosition.current = null;
    if (activeTool === "draw-line") {
      onUpdateCursor?.(null);
    }
    dispatch?.({ type: "setSnapPosition", payload: null });
  }, [activeTool, onUpdateCursor, dispatch]);

  const handleMouseUp = useCallback(() => {
    if (draggingStationId) {
      // Fire a final moveStation dispatch with the last known position to
      // ensure the committed position is accurate after throttling
      if (lastDragPosition.current) {
        dispatch?.({
          type: "moveStation",
          payload: { stationId: draggingStationId, position: lastDragPosition.current },
        });
        lastDragPosition.current = null;
      }
      setDraggingStationId(null);
    }
  }, [draggingStationId, dispatch]);

  /**
   * Async geocode helper — fires after station placement.
   * Updates the pending station name popover once the geocoded name arrives,
   * then also updates the station's name in the store so it persists on dismiss.
   * Fire-and-forget: does not block the synchronous placement flow.
   */
  const fireGeocodeUpdate = useCallback((stationId: string, position: [number, number]) => {
    reverseGeocode(position).then((geocodedName) => {
      if (!geocodedName) return;
      setPendingStationName((prev) =>
        prev && prev.stationId === stationId
          ? { ...prev, defaultName: geocodedName }
          : prev,
      );
      dispatch?.({
        type: "updateStationName",
        payload: { stationId, name: geocodedName },
      });
    });
  }, [dispatch]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const map = getMap();

    if (activeTool === "draw-line") {
      if (drawingSession) {
        // Session is active — place a station at the click position
        const stationId = crypto.randomUUID();
        const stationName = `Station ${(draft?.stations.length ?? 0) + 1}`;

        // Snap click to a nearby proposal line segment (mid-line context)
        let stationPosition: [number, number] = lngLat;
        if (map && draft) {
          for (const line of draft.lines) {
            const waypoints = line.stationIds.length >= 2
              ? line.stationIds.map((id) => draft.stations.find((s) => s.id === id)?.position).filter(Boolean) as [number, number][]
              : line.waypoints;
            if (waypoints.length < 2) continue;
            const snap = snapToSegment(lngLat, waypoints, map, 8);
            if (snap && line.id !== drawingSession.lineId) {
              stationPosition = snap.position;
              break;
            }
          }
        }

        // Check for nearby existing stations — auto-interchange (no confirmation prompt)
        if (map && draft && data?.ttcStations) {
          const nearby = findNearbyStation(
            stationPosition,
            draft.stations,
            data.ttcStations,
            map,
            20,
          );
          if (nearby) {
            if (nearby.type === "proposal") {
              // Merge current line into the existing proposal station
              dispatch?.({
                type: "placeStation",
                payload: {
                  id: stationId,
                  position: stationPosition,
                  lineId: drawingSession.lineId,
                  name: nearby.name,
                  mergeWithStationId: nearby.id,
                },
              });
              setPendingStationName({
                stationId: nearby.id,
                position: stationPosition,
                defaultName: nearby.name,
              });
            } else {
              // Auto-link to TTC baseline station
              dispatch?.({
                type: "placeStation",
                payload: {
                  id: stationId,
                  position: stationPosition,
                  lineId: drawingSession.lineId,
                  name: nearby.name,
                  linkedBaselineStationId: nearby.id,
                },
              });
              setPendingStationName({
                stationId,
                position: stationPosition,
                defaultName: nearby.name,
              });
            }
            return;
          }
        }

        dispatch?.({
          type: "placeStation",
          payload: {
            id: stationId,
            position: stationPosition,
            lineId: drawingSession.lineId,
            name: stationName,
          },
        });
        setPendingStationName({
          stationId,
          position: stationPosition,
          defaultName: stationName,
        });
        fireGeocodeUpdate(stationId, stationPosition);
        return;
      }

      // No active session — check if click is near a proposal line terminus (extend from proposal line)
      if (map && draft && draft.lines.length > 0) {
        for (const line of draft.lines) {
          if (line.stationIds.length < 1) continue;
          const firstStation = draft.stations.find((s) => s.id === line.stationIds[0]);
          const lastStation = draft.stations.find((s) => s.id === line.stationIds[line.stationIds.length - 1]);
          if (!firstStation || !lastStation) continue;

          const firstScreen = map.project(firstStation.position);
          const lastScreen = map.project(lastStation.position);
          const clickScreen = map.project(lngLat);

          const dx1 = clickScreen.x - firstScreen.x;
          const dy1 = clickScreen.y - firstScreen.y;
          const dx2 = clickScreen.x - lastScreen.x;
          const dy2 = clickScreen.y - lastScreen.y;
          const distFirst = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const distLast = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (distLast <= 20) {
            // Extend from the last station of this proposal line
            dispatch?.({
              type: "startDrawing",
              payload: { lineId: line.id, mode: "extend", initialStationId: lastStation.id },
            });
            return;
          }
          if (distFirst <= 20) {
            // Extend from the first station of this proposal line
            dispatch?.({
              type: "startDrawing",
              payload: { lineId: line.id, mode: "extend", initialStationId: firstStation.id },
            });
            return;
          }
        }
      }

      // No active session — check if click is near a TTC line to extend or branch
      if (map && data?.ttcRoutes) {
        for (const feature of data.ttcRoutes.features) {
          if (feature.geometry.type !== "LineString" && feature.geometry.type !== "MultiLineString") continue;

          // Flatten MultiLineString into single waypoints array
          const waypoints: [number, number][] =
            feature.geometry.type === "LineString"
              ? (feature.geometry.coordinates as [number, number][])
              : (feature.geometry.coordinates as [number, number][][]).flat();

          if (waypoints.length < 2) continue;

          const hitType = detectLineHitType(lngLat, { waypoints }, map, 20);
          if (!hitType) continue;

          const props = feature.properties as Record<string, unknown>;
          const ttcLineId = String(props["OBJECTID"] ?? "");

          // Determine the snapped initial waypoint and draw mode
          let initialWaypoint: [number, number];
          let drawMode: "extend" | "branch";

          if (hitType === "extend-start") {
            initialWaypoint = waypoints[0];
            drawMode = "extend";
          } else if (hitType === "extend-end") {
            initialWaypoint = waypoints[waypoints.length - 1];
            drawMode = "extend";
          } else {
            // branch — snap to nearest mid-segment point
            const nearestResult = snapToSegment(lngLat, waypoints, map, 20);
            initialWaypoint = nearestResult?.position ?? lngLat;
            drawMode = "branch";
          }

          onStartExtend?.(ttcLineId, drawMode, initialWaypoint);
          return;
        }
      }

      // Click on empty map — auto-create a new line and place first station
      if (draft && dispatch) {
        const newLineId = crypto.randomUUID();
        const newStationId = crypto.randomUUID();
        const nextColor = DEFAULT_LINE_COLORS[draft.lines.length % DEFAULT_LINE_COLORS.length];
        const lineName = `Line ${draft.lines.length + 1}`;
        const stationName = `Station ${draft.stations.length + 1}`;

        dispatch({ type: "addLine", payload: { id: newLineId, name: lineName, mode: "subway", color: nextColor } });
        dispatch({ type: "startDrawing", payload: { lineId: newLineId, mode: "new" } });

        // Check for nearby stations — auto-interchange on first station of new line
        if (map && data?.ttcStations) {
          const nearby = findNearbyStation(lngLat, draft.stations, data.ttcStations, map, 20);
          if (nearby) {
            if (nearby.type === "proposal") {
              dispatch({
                type: "placeStation",
                payload: { id: newStationId, position: lngLat, lineId: newLineId, name: nearby.name, mergeWithStationId: nearby.id },
              });
              setPendingStationName({ stationId: nearby.id, position: lngLat, defaultName: nearby.name });
            } else {
              dispatch({
                type: "placeStation",
                payload: { id: newStationId, position: lngLat, lineId: newLineId, name: nearby.name, linkedBaselineStationId: nearby.id },
              });
              setPendingStationName({ stationId: newStationId, position: lngLat, defaultName: nearby.name });
            }
            return;
          }
        }

        dispatch({
          type: "placeStation",
          payload: { id: newStationId, position: lngLat, lineId: newLineId, name: stationName },
        });
        setPendingStationName({
          stationId: newStationId,
          position: lngLat,
          defaultName: stationName,
        });
        fireGeocodeUpdate(newStationId, lngLat);
      }
      return;
    }

    if (activeTool === "add-station") {
      if (!draft || !map) return;

      // Find which proposal line the click is near (12px threshold)
      let snappedPosition: [number, number] | null = null;
      let targetLineId: string | null = null;
      let insertAtIndex: number | undefined;

      for (const line of draft.lines) {
        // Use derived station waypoints for snap detection
        const waypoints = line.stationIds.length >= 2
          ? line.stationIds.map((id) => draft.stations.find((s) => s.id === id)?.position).filter(Boolean) as [number, number][]
          : line.waypoints;
        if (waypoints.length < 2) continue;
        const snap = snapToSegment(lngLat, waypoints, map, 12);
        if (snap) {
          snappedPosition = snap.position;
          targetLineId = line.id;
          // segmentIndex refers to the waypoint index; map it to stationIds index
          insertAtIndex = snap.segmentIndex;
          break;
        }
      }

      if (!snappedPosition || !targetLineId) {
        // No line nearby — cursor should show not-allowed (handled by cursorStyle)
        return;
      }

      // Generate default station name
      const stationName = `Station ${draft.stations.length + 1}`;

      // Check for nearby existing stations — auto-interchange (no confirmation prompt)
      if (data?.ttcStations) {
        const nearby = findNearbyStation(
          snappedPosition,
          draft.stations,
          data.ttcStations,
          map,
          20,
        );

        if (nearby) {
          const nearbyStationId = crypto.randomUUID();
          if (nearby.type === "proposal") {
            dispatch?.({
              type: "placeStation",
              payload: {
                id: nearbyStationId,
                position: snappedPosition,
                lineId: targetLineId,
                name: nearby.name,
                insertAtIndex,
                mergeWithStationId: nearby.id,
              },
            });
            setPendingStationName({ stationId: nearby.id, position: snappedPosition, defaultName: nearby.name });
          } else {
            dispatch?.({
              type: "placeStation",
              payload: {
                id: nearbyStationId,
                position: snappedPosition,
                lineId: targetLineId,
                name: nearby.name,
                insertAtIndex,
                linkedBaselineStationId: nearby.id,
              },
            });
            setPendingStationName({ stationId: nearbyStationId, position: snappedPosition, defaultName: nearby.name });
          }
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
          insertAtIndex,
        },
      });
      setPendingStationName({
        stationId: newStationId,
        position: snappedPosition,
        defaultName: stationName,
      });
      fireGeocodeUpdate(newStationId, snappedPosition);
      return;
    }

    if (activeTool === "select") {
      const feature = pickSelectableFeature(e.features);
      if (feature) {
        const props = feature.properties as Record<string, unknown>;
        const layerId = feature.layer?.id;

        // Proposal station click — open inspector
        if (layerId === "proposal-stations-circle") {
          const id = props["id"] as string | null;
          if (id) {
            setHoverStation(null);
            dispatch?.({ type: "inspectElement", payload: { id, elementType: "station" } });
          }
          return;
        }

        // Proposal line click — open line inspector
        if (layerId === "proposal-lines-stroke") {
          const id = props["id"] as string | null;
          if (id) {
            setHoverStation(null);
            dispatch?.({ type: "inspectElement", payload: { id, elementType: "line" } });
          }
          return;
        }

        if (layerId === "ttc-stations-circle" || layerId === "go-stations-circle") {
          const inspection = buildBaselineStationInspection(feature, layerId);
          if (inspection) {
            setHoverStation(null);
            dispatch?.({
              type: "inspectElement",
              payload: {
                id: `baseline-station:${inspection.system}:${inspection.sourceId}`,
                elementType: "baseline-station",
                inspection,
              },
            });
          }
          return;
        }

        if (layerId?.startsWith("ttc-line-") || layerId === "go-routes-line") {
          const inspection = buildBaselineLineInspection(feature, layerId);
          if (inspection) {
            setHoverStation(null);
            dispatch?.({
              type: "inspectElement",
              payload: {
                id: `baseline-line:${inspection.system}:${inspection.sourceId}`,
                elementType: "baseline-line",
                inspection,
              },
            });
          }
          return;
        }
      }
      // Click on empty space — return to line list (do NOT close sidebar)
      setHoverStation(null);
      dispatch?.({ type: "closeInspector" });
    }
  }, [
    activeTool,
    onStartExtend,
    drawingSession,
    draft,
    data,
    dispatch,
    fireGeocodeUpdate,
    buildBaselineLineInspection,
    buildBaselineStationInspection,
  ]);

  const handleDblClick = useCallback((e: MapMouseEvent) => {
    if (activeTool !== "draw-line" || !drawingSession) return;
    // Prevent the default map zoom on double-click
    e.preventDefault();

    // Place a final station at the double-click position, then finish drawing
    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const stationId = crypto.randomUUID();
    const stationName = `Station ${(draft?.stations.length ?? 0) + 1}`;
    dispatch?.({
      type: "placeStation",
      payload: {
        id: stationId,
        position: lngLat,
        lineId: drawingSession.lineId,
        name: stationName,
      },
    });
    // Show name popover for the final station before finishing
    setPendingStationName({
      stationId,
      position: lngLat,
      defaultName: stationName,
    });
    fireGeocodeUpdate(stationId, lngLat);
    // Finish drawing after placing the final station
    dispatch?.({ type: "finishDrawing" });
    onFinishDrawing?.();
  }, [activeTool, drawingSession, draft, dispatch, fireGeocodeUpdate, onFinishDrawing]);

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

  // Note: confirmInterchange/rejectInterchange handlers removed — auto-interchange
  // fires placeStation directly instead of going through the confirm/reject flow.

  // Determine map cursor style based on active tool and hover context
  const cursorStyle = useMemo(() => {
    if (draggingStationId) return "grabbing";
    switch (activeTool) {
      case "draw-line": return "crosshair";
      case "add-station": return isOverSegment ? "cell" : "not-allowed";
      case "select": return isOverSelectable ? "pointer" : "default";
      default: return "default";
    }
  }, [activeTool, isOverSegment, isOverSelectable, draggingStationId]);

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
      canvasContextAttributes={{ preserveDrawingBuffer: true }}
      interactiveLayerIds={[
        "ttc-stations-circle",
        "go-stations-circle",
        "ttc-line-1",
        "ttc-line-2",
        "ttc-line-4",
        "ttc-line-5",
        "ttc-line-6",
        "ttc-line-7-dash",
        "go-routes-line",
        "proposal-lines-stroke",
        "proposal-stations-circle",
      ]}
      cursor={cursorStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDblClick={handleDblClick}
      onLoad={() => {
        if (mapRef.current) {
          // Strip base-map symbol (text/label) layers so they don't
          // duplicate our custom ContextLabels. At onLoad, only the
          // base-style layers exist — react-map-gl adds ours later.
          const map = mapRef.current.getMap();
          const style = map.getStyle();
          if (style?.layers) {
            for (const layer of style.layers) {
              if (layer.type === "symbol") {
                map.removeLayer(layer.id);
              }
            }
          }
          onMapReady?.(mapRef.current);
        }
      }}
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
      <TtcLayers
        routes={baselineMode === "future_committed" ? data.futureTtcRoutes : data.ttcRoutes}
        stations={baselineMode === "future_committed" ? data.futureTtcStations : data.ttcStations}
      />
      <ProposalLayers
        linesGeoJSON={linesGeoJSON}
        stationsGeoJSON={stationsGeoJSON}
        inProgressGeoJSON={inProgressGeoJSON}
        selectedElementId={selectedElementId}
        snapCueGeoJSON={snapCueGeoJSON}
        proposalOpacity={proposalOpacity}
      />
      <StationLabels
        ttcStations={baselineMode === "future_committed" ? data.futureTtcStations : data.ttcStations}
        goStations={data.goStations}
      />

      {/* Station hover tooltip */}
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
          {hoverStation.name} &mdash; {hoverStation.type === "go" ? "GO" : "TTC"}
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

      {/* Interchange suggestion badge — no longer triggered (auto-interchange replaces confirm/reject flow) */}
    </Map>
  );
}
