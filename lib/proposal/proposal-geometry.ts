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

// Re-export Feature types for use in ProposalLayers
export type { FeatureCollection, Feature, LineString, Point };
