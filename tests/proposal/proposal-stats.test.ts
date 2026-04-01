import { describe, it, expect } from "vitest";
import {
  computeLineLength,
  computeTravelTime,
  computeAvgStopSpacing,
  computeLineCost,
  computeLineRidership,
  computeProposalStats,
  resolveNeighbourhood,
} from "@/lib/proposal/proposal-stats";
import type { ProposalLineDraft, ProposalDraft } from "@/lib/proposal/proposal-types";
import type { FeatureCollection } from "geojson";

// Helpers to build test fixtures
function makeLine(
  overrides: Partial<ProposalLineDraft> & { mode: ProposalLineDraft["mode"] },
): ProposalLineDraft {
  return {
    id: "line-1",
    name: "Test Line",
    color: "#7B61FF",
    waypoints: [],
    stationIds: [],
    ...overrides,
  };
}

// Three waypoints across Toronto: roughly Bloor/Spadina → Bloor/Yonge → Bloor/Danforth
const TORONTO_WAYPOINTS: [number, number][] = [
  [-79.4044, 43.6672],
  [-79.3832, 43.6701],
  [-79.3591, 43.6742],
];

describe("computeLineLength", () => {
  it("returns 0 for a line with fewer than 2 waypoints", () => {
    const line = makeLine({ mode: "subway", waypoints: [] });
    expect(computeLineLength(line)).toBe(0);
  });

  it("returns 0 for a line with exactly 1 waypoint", () => {
    const line = makeLine({ mode: "subway", waypoints: [[-79.38, 43.65]] });
    expect(computeLineLength(line)).toBe(0);
  });

  it("returns a positive km value for a 3-waypoint line across Toronto", () => {
    const line = makeLine({ mode: "subway", waypoints: TORONTO_WAYPOINTS });
    const result = computeLineLength(line);
    expect(result).toBeGreaterThan(0);
    // Rough sanity: ~3-5km east-west in central Toronto across ~0.04 degrees longitude
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThan(10);
  });
});

describe("computeTravelTime", () => {
  it("returns 0 for a line with fewer than 2 waypoints", () => {
    const line = makeLine({ mode: "subway", waypoints: [] });
    expect(computeTravelTime(line)).toBe(0);
  });

  it("returns minutes rounded for subway speed (60 km/h)", () => {
    const line = makeLine({ mode: "subway", waypoints: TORONTO_WAYPOINTS });
    const km = computeLineLength(line);
    const expected = Math.round((km / 60) * 60);
    expect(computeTravelTime(line)).toBe(expected);
  });

  it("returns higher minutes for LRT speed (35 km/h) vs subway on same route", () => {
    const subwayLine = makeLine({ mode: "subway", waypoints: TORONTO_WAYPOINTS });
    const lrtLine = makeLine({ mode: "lrt", waypoints: TORONTO_WAYPOINTS });
    expect(computeTravelTime(lrtLine)).toBeGreaterThan(computeTravelTime(subwayLine));
  });

  it("returns minutes for BRT speed (25 km/h)", () => {
    const line = makeLine({ mode: "brt", waypoints: TORONTO_WAYPOINTS });
    const km = computeLineLength(line);
    const expected = Math.round((km / 25) * 60);
    expect(computeTravelTime(line)).toBe(expected);
  });
});

describe("computeAvgStopSpacing", () => {
  it("returns null for a line with 0 stations", () => {
    const line = makeLine({ mode: "subway", waypoints: TORONTO_WAYPOINTS, stationIds: [] });
    expect(computeAvgStopSpacing(line)).toBeNull();
  });

  it("returns null for a line with exactly 1 station", () => {
    const line = makeLine({
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1"],
    });
    expect(computeAvgStopSpacing(line)).toBeNull();
  });

  it("returns a positive km value for a line with 3 stations", () => {
    const line = makeLine({
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1", "s2", "s3"],
    });
    const result = computeAvgStopSpacing(line);
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  it("rounds spacing to 1 decimal place", () => {
    const line = makeLine({
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1", "s2", "s3"],
    });
    const result = computeAvgStopSpacing(line)!;
    // Should have at most 1 decimal place
    expect(result).toBe(Math.round(result * 10) / 10);
  });
});

describe("computeLineCost", () => {
  it("computes subway cost at $250M/km", () => {
    const line = makeLine({ mode: "subway", waypoints: TORONTO_WAYPOINTS });
    const km = computeLineLength(line);
    const expected = km * 250;
    expect(computeLineCost(line)).toBeCloseTo(expected, 5);
  });

  it("computes LRT cost at $100M/km", () => {
    const line = makeLine({ mode: "lrt", waypoints: TORONTO_WAYPOINTS });
    const km = computeLineLength(line);
    const expected = km * 100;
    expect(computeLineCost(line)).toBeCloseTo(expected, 5);
  });

  it("computes BRT cost at $30M/km", () => {
    const line = makeLine({ mode: "brt", waypoints: TORONTO_WAYPOINTS });
    const km = computeLineLength(line);
    const expected = km * 30;
    expect(computeLineCost(line)).toBeCloseTo(expected, 5);
  });

  it("returns 0 for a line with fewer than 2 waypoints", () => {
    const line = makeLine({ mode: "subway", waypoints: [] });
    expect(computeLineCost(line)).toBe(0);
  });
});

describe("computeLineRidership", () => {
  it("computes subway ridership: 3 stations * 2000/station, rounded to nearest 100", () => {
    const line = makeLine({
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1", "s2", "s3"],
    });
    // 3 * 2000 = 6000, already a multiple of 100
    expect(computeLineRidership(line)).toBe(6000);
  });

  it("computes LRT ridership: 3 stations * 1200/station, rounded to nearest 100", () => {
    const line = makeLine({
      mode: "lrt",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1", "s2", "s3"],
    });
    // 3 * 1200 = 3600
    expect(computeLineRidership(line)).toBe(3600);
  });

  it("computes BRT ridership: 3 stations * 600/station", () => {
    const line = makeLine({
      mode: "brt",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1", "s2", "s3"],
    });
    // 3 * 600 = 1800
    expect(computeLineRidership(line)).toBe(1800);
  });

  it("returns 0 for a line with no stations", () => {
    const line = makeLine({ mode: "subway", waypoints: TORONTO_WAYPOINTS, stationIds: [] });
    expect(computeLineRidership(line)).toBe(0);
  });
});

describe("computeProposalStats", () => {
  it("returns zeroes for an empty proposal (no lines)", () => {
    const draft: ProposalDraft = {
      id: "draft-1",
      title: "Empty",
      baselineMode: "today",
      lines: [],
      stations: [],
    };
    const stats = computeProposalStats(draft);
    expect(stats.networkKm).toBe(0);
    expect(stats.travelTime).toBe(0);
    expect(stats.avgSpacing).toBeNull();
    expect(stats.totalCostM).toBe(0);
    expect(stats.totalRidership).toBe(0);
    expect(stats.stationCount).toBe(0);
    expect(stats.interchangeCount).toBe(0);
  });

  it("aggregates stats across multiple lines", () => {
    const line1: ProposalLineDraft = makeLine({
      id: "line-1",
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1", "s2"],
    });
    const line2: ProposalLineDraft = makeLine({
      id: "line-2",
      mode: "lrt",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s3", "s4"],
    });
    const draft: ProposalDraft = {
      id: "draft-1",
      title: "Multi-line",
      baselineMode: "today",
      lines: [line1, line2],
      stations: [
        { id: "s1", name: "Stn 1", position: [-79.4044, 43.6672], lineIds: ["line-1"] },
        { id: "s2", name: "Stn 2", position: [-79.38, 43.67], lineIds: ["line-1"] },
        { id: "s3", name: "Stn 3", position: [-79.36, 43.67], lineIds: ["line-2"] },
        { id: "s4", name: "Stn 4 (interchange)", position: [-79.34, 43.67], lineIds: ["line-1", "line-2"] },
      ],
    };
    const stats = computeProposalStats(draft);
    // Network km should be sum of both lines
    expect(stats.networkKm).toBeGreaterThan(0);
    // Station count = 4
    expect(stats.stationCount).toBe(4);
    // s4 has 2 lineIds → interchange
    expect(stats.interchangeCount).toBe(1);
    // Total ridership from both lines
    expect(stats.totalRidership).toBeGreaterThan(0);
  });

  it("ignores lines with fewer than 2 waypoints when summing networkKm", () => {
    const validLine: ProposalLineDraft = makeLine({
      id: "line-1",
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1"],
    });
    const emptyLine: ProposalLineDraft = makeLine({
      id: "line-2",
      mode: "lrt",
      waypoints: [],
      stationIds: [],
    });
    const draft: ProposalDraft = {
      id: "draft-1",
      title: "Mixed",
      baselineMode: "today",
      lines: [validLine, emptyLine],
      stations: [
        { id: "s1", name: "Stn 1", position: [-79.4044, 43.6672], lineIds: ["line-1"] },
      ],
    };
    const stats = computeProposalStats(draft);
    const singleLineKm = computeLineLength(validLine);
    expect(stats.networkKm).toBeCloseTo(Math.round(singleLineKm * 10) / 10, 5);
  });

  it("counts linkedBaselineStationId stations as interchanges", () => {
    const line: ProposalLineDraft = makeLine({
      id: "line-1",
      mode: "subway",
      waypoints: TORONTO_WAYPOINTS,
      stationIds: ["s1"],
    });
    const draft: ProposalDraft = {
      id: "draft-1",
      title: "Baseline link",
      baselineMode: "today",
      lines: [line],
      stations: [
        {
          id: "s1",
          name: "Bloor-Yonge",
          position: [-79.38, 43.67],
          lineIds: ["line-1"],
          linkedBaselineStationId: "ttc-ba-bloor-yonge",
        },
      ],
    };
    const stats = computeProposalStats(draft);
    expect(stats.interchangeCount).toBe(1);
  });
});

describe("resolveNeighbourhood", () => {
  // Build a minimal FeatureCollection of neighbourhood centroids
  const neighbourhoods: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-79.3832, 43.6553] },
        properties: { name: "Downtown Toronto" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-79.4220, 43.6520] },
        properties: { name: "High Park" },
      },
    ],
  };

  it("returns the nearest neighbourhood name when within 3km", () => {
    // Position very close to Downtown Toronto centroid
    const position: [number, number] = [-79.383, 43.656];
    const result = resolveNeighbourhood(position, neighbourhoods);
    expect(result).toBe("Downtown Toronto");
  });

  it("returns coordinate string for a point beyond 3km of all neighbourhoods", () => {
    // Position far outside Toronto (e.g., Hamilton area)
    const position: [number, number] = [-79.8700, 43.2500];
    const result = resolveNeighbourhood(position, neighbourhoods);
    // Should be "lat, lng" to 4 decimal places
    expect(result).toMatch(/^\d+\.\d{4}, -\d+\.\d{4}$/);
    expect(result).toBe(`${position[1].toFixed(4)}, ${position[0].toFixed(4)}`);
  });

  it("accepts a custom maxKm parameter", () => {
    // Position ~5km from Downtown Toronto centroid
    // With maxKm=1 it should fall back to coordinates
    const position: [number, number] = [-79.383, 43.656];
    const resultSmallRadius = resolveNeighbourhood(position, neighbourhoods, 0.001);
    // Should be coordinates because radius is too small
    expect(resultSmallRadius).toMatch(/^\d+\.\d{4}, -\d+\.\d{4}$/);
  });
});
