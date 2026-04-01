// Pure geometry helpers for the proposal editor.
// All functions are deterministic and have no side effects.

import {
  nearestPointOnLine,
  lineString,
  point,
} from "@turf/turf";
import type { FeatureCollection, Feature, LineString, Point } from "geojson";
import type { ProposalDraft, DrawingSession, ProposalLineDraft } from "./proposal-types";

/** Result from findSnapTarget. */
export type SnapResult = {
  position: [number, number];
  type: "station" | "endpoint" | "segment";
};

/**
 * Converts proposal lines with 2+ waypoints to a GeoJSON FeatureCollection
 * of LineString features for rendering on the map.
 */
export function buildProposalLinesGeoJSON(
  draft: ProposalDraft,
): FeatureCollection {
  const features: Feature[] = draft.lines
    .filter((l: ProposalLineDraft) => l.waypoints.length >= 2)
    .map((l: ProposalLineDraft) => ({
      type: "Feature" as const,
      id: l.id,
      geometry: {
        type: "LineString" as const,
        coordinates: l.waypoints,
      },
      properties: {
        id: l.id,
        color: l.color,
        mode: l.mode,
        name: l.name,
      },
    }));

  return { type: "FeatureCollection", features };
}

/**
 * Converts proposal stations to a GeoJSON FeatureCollection of Point features.
 * Station color is derived from the first lineId on the station.
 */
export function buildProposalStationsGeoJSON(
  draft: ProposalDraft,
): FeatureCollection {
  const lineColorMap = new Map(
    draft.lines.map((l: ProposalLineDraft) => [l.id, l.color]),
  );

  const features: Feature[] = draft.stations.map((s) => {
    const color =
      s.lineIds.length > 0
        ? (lineColorMap.get(s.lineIds[0]) ?? "#7B61FF")
        : "#7B61FF";

    return {
      type: "Feature" as const,
      id: s.id,
      geometry: {
        type: "Point" as const,
        coordinates: s.position,
      },
      properties: {
        id: s.id,
        name: s.name,
        color,
      },
    };
  });

  return { type: "FeatureCollection", features };
}

/**
 * Builds a GeoJSON FeatureCollection for the in-progress drawing session.
 * Returns null if no session is active or session has no waypoints.
 * Includes a ghost segment to the cursor position if cursorPosition is set.
 */
export function buildInProgressGeoJSON(
  session: DrawingSession | null,
  lineColor: string,
): FeatureCollection | null {
  if (!session || session.waypoints.length === 0) return null;

  const coords: [number, number][] = [...session.waypoints];
  if (session.cursorPosition !== null) {
    coords.push(session.cursorPosition);
  }

  if (coords.length < 2) return null;

  const features: Feature[] = [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: coords,
      },
      properties: {
        color: lineColor,
      },
    },
  ];

  return { type: "FeatureCollection", features };
}

/** Simple 2D Euclidean distance between two screen points. */
export function dist2D(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Finds the nearest snap target to the cursor position.
 * Checks station positions, then line endpoints, then line segments.
 * Uses map.project() for screen-distance comparison.
 */
export function findSnapTarget(
  cursorLngLat: [number, number],
  stationCandidates: Array<{ id: string; position: [number, number] }>,
  lineCandidates: ProposalLineDraft[],
  map: { project: (lngLat: [number, number]) => { x: number; y: number } },
  pixelThreshold = 20,
): SnapResult | null {
  const cursorScreen = map.project(cursorLngLat);

  // Check stations first (highest priority)
  for (const station of stationCandidates) {
    const stationScreen = map.project(station.position);
    if (dist2D(cursorScreen, stationScreen) <= pixelThreshold) {
      return { position: station.position, type: "station" };
    }
  }

  // Check line endpoints
  for (const line of lineCandidates) {
    if (line.waypoints.length < 1) continue;
    const start = line.waypoints[0];
    const end = line.waypoints[line.waypoints.length - 1];

    const startScreen = map.project(start);
    const endScreen = map.project(end);

    if (dist2D(cursorScreen, startScreen) <= pixelThreshold) {
      return { position: start, type: "endpoint" };
    }
    if (dist2D(cursorScreen, endScreen) <= pixelThreshold) {
      return { position: end, type: "endpoint" };
    }
  }

  // Check line segments using Turf nearestPointOnLine
  for (const line of lineCandidates) {
    if (line.waypoints.length < 2) continue;

    const turfLine = lineString(line.waypoints as [number, number][]);
    const turfPoint = point(cursorLngLat);
    const nearest = nearestPointOnLine(turfLine, turfPoint);
    const nearestCoords = nearest.geometry.coordinates as [number, number];
    const nearestScreen = map.project(nearestCoords);

    if (dist2D(cursorScreen, nearestScreen) <= pixelThreshold) {
      return { position: nearestCoords, type: "segment" };
    }
  }

  return null;
}

/**
 * Determines how a click on a TTC/GO route line should be interpreted.
 * Returns "extend-start" if near the line's first endpoint, "extend-end" if near the last,
 * "branch" if on a mid-segment, or null if not close enough.
 */
export function detectLineHitType(
  cursorLngLat: [number, number],
  line: { waypoints: [number, number][] },
  map: { project: (lngLat: [number, number]) => { x: number; y: number } },
  pixelThreshold = 20,
): "extend-start" | "extend-end" | "branch" | null {
  if (line.waypoints.length < 2) return null;

  const cursorScreen = map.project(cursorLngLat);
  const start = line.waypoints[0];
  const end = line.waypoints[line.waypoints.length - 1];

  const startScreen = map.project(start);
  const endScreen = map.project(end);

  if (dist2D(cursorScreen, startScreen) <= pixelThreshold) {
    return "extend-start";
  }
  if (dist2D(cursorScreen, endScreen) <= pixelThreshold) {
    return "extend-end";
  }

  // Check if on mid-segment
  const turfLine = lineString(line.waypoints as [number, number][]);
  const turfPoint = point(cursorLngLat);
  const nearest = nearestPointOnLine(turfLine, turfPoint);
  const nearestCoords = nearest.geometry.coordinates as [number, number];
  const nearestScreen = map.project(nearestCoords);

  if (dist2D(cursorScreen, nearestScreen) <= pixelThreshold) {
    return "branch";
  }

  return null;
}

/**
 * Snaps a click position to the nearest point on a given line's waypoints.
 * Uses Turf's nearestPointOnLine for geodetic precision.
 * Returns the snapped position and segment index, or null if beyond pixelThreshold.
 */
export function snapToSegment(
  clickLngLat: [number, number],
  lineWaypoints: [number, number][],
  map: { project: (lngLat: [number, number]) => { x: number; y: number } },
  pixelThreshold = 12,
): { position: [number, number]; segmentIndex: number } | null {
  if (lineWaypoints.length < 2) return null;

  const turfLine = lineString(lineWaypoints as [number, number][]);
  const turfPt = point(clickLngLat);
  const nearest = nearestPointOnLine(turfLine, turfPt);
  const nearestCoords = nearest.geometry.coordinates as [number, number];
  const nearestScreen = map.project(nearestCoords);
  const clickScreen = map.project(clickLngLat);

  if (dist2D(clickScreen, nearestScreen) > pixelThreshold) return null;

  // Determine segment index from turf's index property
  const segmentIndex = (nearest.properties?.index as number | undefined) ?? 0;
  return { position: nearestCoords, segmentIndex };
}

/**
 * Finds an existing station (proposal or TTC baseline) within pixelThreshold
 * of the given position using screen-space distance.
 */
export function findNearbyStation(
  position: [number, number],
  proposalStations: Array<{ id: string; name: string; position: [number, number] }>,
  ttcStations: FeatureCollection,
  map: { project: (lngLat: [number, number]) => { x: number; y: number } },
  pixelThreshold = 20,
): { id: string; name: string; type: "proposal" | "ttc" } | null {
  const posScreen = map.project(position);

  // Check proposal stations first
  for (const station of proposalStations) {
    const stationScreen = map.project(station.position);
    if (dist2D(posScreen, stationScreen) <= pixelThreshold) {
      return { id: station.id, name: station.name, type: "proposal" };
    }
  }

  // Check TTC baseline stations from FeatureCollection
  for (const feature of ttcStations.features) {
    if (feature.geometry.type !== "Point") continue;
    const coords = feature.geometry.coordinates as [number, number];
    const stationScreen = map.project(coords);
    if (dist2D(posScreen, stationScreen) <= pixelThreshold) {
      const props = feature.properties as Record<string, unknown>;
      const id = String(props["OBJECTID"] ?? props["id"] ?? "");
      const name = String(
        props["PT_NAME"] ?? props["PLACE_NAME"] ?? props["STATION"] ?? "TTC Station",
      );
      return { id, name, type: "ttc" };
    }
  }

  return null;
}

/**
 * Builds a GeoJSON FeatureCollection containing a single Point for the snap cue ring.
 * Returns null if snapPosition is null.
 */
export function buildSnapCueGeoJSON(
  snapPosition: [number, number] | null,
): FeatureCollection | null {
  if (!snapPosition) return null;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: snapPosition,
        },
        properties: {},
      },
    ],
  };
}

// Re-export Feature types for use in ProposalLayers
export type { FeatureCollection, Feature, LineString, Point };
