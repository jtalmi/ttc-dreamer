// Pure stat computation functions for the proposal editor.
// All functions are deterministic and have no side effects.

import { length, lineString, nearestPoint, point } from "@turf/turf";
import type { FeatureCollection } from "geojson";
import type { ProposalDraft, ProposalLineDraft, TransitMode } from "./proposal-types";

/** Speed in km/h by transit mode. */
export const SPEED_KMH: Record<TransitMode, number> = {
  subway: 60,
  lrt: 35,
  brt: 25,
};

/** Estimated construction cost in millions per km by transit mode. */
export const COST_PER_KM_M: Record<TransitMode, number> = {
  subway: 250,
  lrt: 100,
  brt: 30,
};

/** Estimated daily ridership per station by transit mode. */
export const RIDERSHIP_PER_STATION: Record<TransitMode, number> = {
  subway: 2000,
  lrt: 1200,
  brt: 600,
};

/**
 * Returns the total length of a proposal line in kilometres.
 * Returns 0 if the line has fewer than 2 waypoints.
 */
export function computeLineLength(line: ProposalLineDraft): number {
  if (line.waypoints.length < 2) return 0;
  return length(lineString(line.waypoints), { units: "kilometers" });
}

/**
 * Returns the estimated travel time in minutes for a single line.
 * Rounded to the nearest minute. Returns 0 for empty lines.
 */
export function computeTravelTime(line: ProposalLineDraft): number {
  const km = computeLineLength(line);
  if (km === 0) return 0;
  return Math.round((km / SPEED_KMH[line.mode]) * 60);
}

/**
 * Returns the average stop spacing in km for a single line, rounded to 1 decimal.
 * Returns null when the line has fewer than 2 stations (would produce Infinity or NaN).
 */
export function computeAvgStopSpacing(line: ProposalLineDraft): number | null {
  const stationCount = line.stationIds.length;
  if (stationCount < 2) return null;
  const km = computeLineLength(line);
  return Math.round((km / (stationCount - 1)) * 10) / 10;
}

/**
 * Returns the estimated construction cost in millions for a single line.
 * Returns 0 for lines with fewer than 2 waypoints.
 */
export function computeLineCost(line: ProposalLineDraft): number {
  return computeLineLength(line) * COST_PER_KM_M[line.mode];
}

/**
 * Returns the estimated daily ridership for a single line,
 * rounded to the nearest 100.
 */
export function computeLineRidership(line: ProposalLineDraft): number {
  const raw = line.stationIds.length * RIDERSHIP_PER_STATION[line.mode];
  return Math.round(raw / 100) * 100;
}

/** Shape returned by computeProposalStats. */
export type ProposalStats = {
  /** Total network length in km (sum of all lines with 2+ waypoints). */
  networkKm: number;
  /** Estimated travel time in minutes for the longest line. */
  travelTime: number;
  /** Average stop spacing across all valid lines, or null if no valid lines. */
  avgSpacing: number | null;
  /** Total estimated construction cost in millions. */
  totalCostM: number;
  /** Total estimated daily ridership across all lines. */
  totalRidership: number;
  /** Total number of stations in the proposal. */
  stationCount: number;
  /** Number of interchange stations (shared across lines or linked to baseline TTC). */
  interchangeCount: number;
};

/**
 * Computes proposal-level stats by aggregating across all lines.
 * Lines with fewer than 2 waypoints are excluded from network/cost calculations.
 * Returns safe zeroes for empty proposals.
 */
export function computeProposalStats(draft: ProposalDraft): ProposalStats {
  const validLines = draft.lines.filter((l) => l.waypoints.length >= 2);

  const networkKm = Math.round(
    validLines.reduce((sum, l) => sum + computeLineLength(l), 0) * 10,
  ) / 10;

  const longestLine = validLines.reduce<ProposalLineDraft | null>((best, l) => {
    if (!best) return l;
    return computeTravelTime(l) > computeTravelTime(best) ? l : best;
  }, null);
  const travelTime = longestLine ? computeTravelTime(longestLine) : 0;

  const spacingValues = validLines
    .map(computeAvgStopSpacing)
    .filter((v): v is number => v !== null);
  const avgSpacing =
    spacingValues.length > 0
      ? Math.round(
          (spacingValues.reduce((a, b) => a + b, 0) / spacingValues.length) * 10,
        ) / 10
      : null;

  const totalCostM = validLines.reduce((sum, l) => sum + computeLineCost(l), 0);

  // All lines (including those with 0 waypoints) contribute ridership from their stations
  const totalRidership = draft.lines.reduce((sum, l) => sum + computeLineRidership(l), 0);

  const stationCount = draft.stations.length;

  const interchangeCount = draft.stations.filter(
    (s) => s.lineIds.length > 1 || s.linkedBaselineStationId != null,
  ).length;

  return {
    networkKm,
    travelTime,
    avgSpacing,
    totalCostM,
    totalRidership,
    stationCount,
    interchangeCount,
  };
}

/**
 * Resolves the nearest neighbourhood name for a given coordinate.
 * Uses turf.nearestPoint against a FeatureCollection of neighbourhood centroids.
 * Falls back to "lat, lng" rounded to 4 decimal places when beyond maxKm.
 *
 * @param position - [lng, lat] coordinate pair (GeoJSON order)
 * @param neighbourhoods - FeatureCollection of neighbourhood Point features with a `name` property
 * @param maxKm - maximum distance in km to consider a neighbourhood match (default 3)
 */
export function resolveNeighbourhood(
  position: [number, number],
  neighbourhoods: FeatureCollection,
  maxKm = 3,
): string {
  const nearest = nearestPoint(point(position), neighbourhoods as Parameters<typeof nearestPoint>[1]);
  const dist = nearest.properties?.distanceToPoint as number | undefined;
  if (dist !== undefined && dist <= maxKm) {
    return String(nearest.properties?.name ?? "");
  }
  // Fallback: lat, lng to 4 decimal places
  return `${position[1].toFixed(4)}, ${position[0].toFixed(4)}`;
}
