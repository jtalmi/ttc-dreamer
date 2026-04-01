import { describe, it, expect } from "vitest";
import {
  dist2D,
  findSnapTarget,
  detectLineHitType,
  buildProposalLinesGeoJSON,
  buildProposalStationsGeoJSON,
  buildInProgressGeoJSON,
} from "@/lib/proposal/proposal-geometry";
import type { ProposalDraft, ProposalLineDraft, DrawingSession } from "@/lib/proposal/proposal-types";

// Minimal draft factory helpers
function makeDraft(overrides: Partial<ProposalDraft> = {}): ProposalDraft {
  return {
    id: "draft-1",
    title: "Test Proposal",
    baselineMode: "today",
    lines: [],
    stations: [],
    ...overrides,
  };
}

function makeLine(overrides: Partial<ProposalLineDraft> = {}): ProposalLineDraft {
  return {
    id: "line-1",
    name: "Test Line",
    color: "#7B61FF",
    mode: "subway",
    waypoints: [],
    stationIds: [],
    ...overrides,
  };
}

// A mock map that does a trivial identity projection: lng maps to x, lat maps to y.
// This makes screen-distance tests predictable with [lng, lat] → {x: lng, y: lat}.
const mockMap = {
  project: (lngLat: [number, number]) => ({ x: lngLat[0], y: lngLat[1] }),
};

describe("dist2D", () => {
  it("returns 0 for identical points", () => {
    expect(dist2D({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0);
  });

  it("returns correct distance for a 3-4-5 right triangle", () => {
    expect(dist2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
  });

  it("returns correct distance for a horizontal pair", () => {
    expect(dist2D({ x: 1, y: 2 }, { x: 6, y: 2 })).toBeCloseTo(5);
  });

  it("is symmetric", () => {
    const a = { x: 10, y: 20 };
    const b = { x: 15, y: 28 };
    expect(dist2D(a, b)).toBeCloseTo(dist2D(b, a));
  });
});

describe("findSnapTarget", () => {
  const line = makeLine({
    waypoints: [
      [0, 0],
      [100, 0],
    ],
  });

  it("returns null when no candidates are within the pixel threshold", () => {
    // cursor is far away at [200, 200]
    const result = findSnapTarget([200, 200], [], [line], mockMap, 20);
    expect(result).toBeNull();
  });

  it("snaps to a station when cursor is within threshold", () => {
    const stations = [{ id: "s1", position: [50, 0] as [number, number] }];
    // cursor at [51, 0] — 1 pixel away from station
    const result = findSnapTarget([51, 0], stations, [], mockMap, 20);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("station");
    expect(result!.position).toEqual([50, 0]);
  });

  it("snaps to an endpoint when cursor is near line start", () => {
    // cursor at [1, 0] — 1 pixel from line start [0, 0]
    const result = findSnapTarget([1, 0], [], [line], mockMap, 20);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("endpoint");
    expect(result!.position).toEqual([0, 0]);
  });

  it("snaps to an endpoint when cursor is near line end", () => {
    // cursor at [98, 0] — 2 pixels from line end [100, 0]
    const result = findSnapTarget([98, 0], [], [line], mockMap, 20);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("endpoint");
    expect(result!.position).toEqual([100, 0]);
  });

  it("prefers station snap over endpoint snap at the same position", () => {
    const stationAtEndpoint = [{ id: "s1", position: [0, 0] as [number, number] }];
    const result = findSnapTarget([0, 0], stationAtEndpoint, [line], mockMap, 20);
    expect(result!.type).toBe("station");
  });

  it("returns null for a line with fewer than 1 waypoint", () => {
    const emptyLine = makeLine({ waypoints: [] });
    const result = findSnapTarget([0, 0], [], [emptyLine], mockMap, 20);
    expect(result).toBeNull();
  });
});

describe("detectLineHitType", () => {
  const line = {
    waypoints: [
      [0, 0],
      [50, 0],
      [100, 0],
    ] as [number, number][],
  };

  it("returns null for lines with fewer than 2 waypoints", () => {
    expect(detectLineHitType([0, 0], { waypoints: [[0, 0]] }, mockMap)).toBeNull();
    expect(detectLineHitType([0, 0], { waypoints: [] }, mockMap)).toBeNull();
  });

  it('returns "extend-start" when cursor is near the first waypoint', () => {
    // cursor at [1, 0] — 1 pixel from start [0, 0]
    const result = detectLineHitType([1, 0], line, mockMap, 20);
    expect(result).toBe("extend-start");
  });

  it('returns "extend-end" when cursor is near the last waypoint', () => {
    // cursor at [98, 0] — 2 pixels from end [100, 0]
    const result = detectLineHitType([98, 0], line, mockMap, 20);
    expect(result).toBe("extend-end");
  });

  it('returns "branch" when cursor is near a mid-segment point', () => {
    // cursor directly on the midpoint of the first segment [25, 0]
    const result = detectLineHitType([25, 0], line, mockMap, 20);
    expect(result).toBe("branch");
  });

  it("returns null when cursor is far from the line", () => {
    const result = detectLineHitType([50, 200], line, mockMap, 20);
    expect(result).toBeNull();
  });
});

describe("buildProposalLinesGeoJSON", () => {
  it("returns a FeatureCollection with type set correctly", () => {
    const draft = makeDraft();
    const result = buildProposalLinesGeoJSON(draft);
    expect(result.type).toBe("FeatureCollection");
    expect(Array.isArray(result.features)).toBe(true);
  });

  it("returns an empty features array when draft has no lines", () => {
    const result = buildProposalLinesGeoJSON(makeDraft());
    expect(result.features).toHaveLength(0);
  });

  it("excludes lines with fewer than 2 waypoints", () => {
    const draft = makeDraft({
      lines: [
        makeLine({ id: "l1", waypoints: [] }),
        makeLine({ id: "l2", waypoints: [[-79.38, 43.65]] }),
      ],
    });
    const result = buildProposalLinesGeoJSON(draft);
    expect(result.features).toHaveLength(0);
  });

  it("includes lines with 2+ waypoints as LineString features", () => {
    const wp: [number, number][] = [
      [-79.38, 43.65],
      [-79.39, 43.66],
    ];
    const draft = makeDraft({
      lines: [makeLine({ id: "l1", color: "#E91E8C", mode: "lrt", waypoints: wp })],
    });
    const result = buildProposalLinesGeoJSON(draft);
    expect(result.features).toHaveLength(1);

    const feature = result.features[0];
    expect(feature.type).toBe("Feature");
    expect(feature.geometry.type).toBe("LineString");
    expect((feature.geometry as GeoJSON.LineString).coordinates).toEqual(wp);
    expect(feature.properties?.color).toBe("#E91E8C");
    expect(feature.properties?.mode).toBe("lrt");
  });

  it("sets the feature id from the line id", () => {
    const wp: [number, number][] = [[-79.38, 43.65], [-79.39, 43.66]];
    const draft = makeDraft({ lines: [makeLine({ id: "my-line-id", waypoints: wp })] });
    const result = buildProposalLinesGeoJSON(draft);
    expect(result.features[0].id).toBe("my-line-id");
  });
});

describe("buildProposalStationsGeoJSON", () => {
  it("returns a FeatureCollection with type set correctly", () => {
    const result = buildProposalStationsGeoJSON(makeDraft());
    expect(result.type).toBe("FeatureCollection");
  });

  it("returns an empty features array when draft has no stations", () => {
    const result = buildProposalStationsGeoJSON(makeDraft());
    expect(result.features).toHaveLength(0);
  });

  it("maps each station to a Point feature", () => {
    const pos: [number, number] = [-79.38, 43.65];
    const draft = makeDraft({
      stations: [
        { id: "s1", name: "Union", position: pos, lineIds: [] },
      ],
    });
    const result = buildProposalStationsGeoJSON(draft);
    expect(result.features).toHaveLength(1);

    const feature = result.features[0];
    expect(feature.type).toBe("Feature");
    expect(feature.geometry.type).toBe("Point");
    expect((feature.geometry as GeoJSON.Point).coordinates).toEqual(pos);
    expect(feature.properties?.name).toBe("Union");
  });

  it("uses the line color for stations belonging to a line", () => {
    const draft = makeDraft({
      lines: [makeLine({ id: "line-1", color: "#00B4D8" })],
      stations: [
        { id: "s1", name: "Bloor", position: [-79.38, 43.65], lineIds: ["line-1"] },
      ],
    });
    const result = buildProposalStationsGeoJSON(draft);
    expect(result.features[0].properties?.color).toBe("#00B4D8");
  });

  it("uses fallback color #7B61FF for stations with no lineIds", () => {
    const draft = makeDraft({
      stations: [
        { id: "s1", name: "Orphan", position: [-79.38, 43.65], lineIds: [] },
      ],
    });
    const result = buildProposalStationsGeoJSON(draft);
    expect(result.features[0].properties?.color).toBe("#7B61FF");
  });
});

describe("buildInProgressGeoJSON", () => {
  it("returns null when session is null", () => {
    expect(buildInProgressGeoJSON(null, "#7B61FF")).toBeNull();
  });

  it("returns null when session has no waypoints", () => {
    const session: DrawingSession = {
      lineId: "l1",
      waypoints: [],
      cursorPosition: null,
      mode: "new",
    };
    expect(buildInProgressGeoJSON(session, "#7B61FF")).toBeNull();
  });

  it("returns null when session has only one waypoint and no cursor", () => {
    const session: DrawingSession = {
      lineId: "l1",
      waypoints: [[-79.38, 43.65]],
      cursorPosition: null,
      mode: "new",
    };
    expect(buildInProgressGeoJSON(session, "#7B61FF")).toBeNull();
  });

  it("returns a FeatureCollection with a LineString when session has 2+ waypoints", () => {
    const session: DrawingSession = {
      lineId: "l1",
      waypoints: [
        [-79.38, 43.65],
        [-79.39, 43.66],
      ],
      cursorPosition: null,
      mode: "new",
    };
    const result = buildInProgressGeoJSON(session, "#E91E8C");
    expect(result).not.toBeNull();
    expect(result!.type).toBe("FeatureCollection");
    expect(result!.features).toHaveLength(1);
    expect(result!.features[0].geometry.type).toBe("LineString");
    expect(result!.features[0].properties?.color).toBe("#E91E8C");
  });

  it("includes the cursor position as the final coordinate when set", () => {
    const cursor: [number, number] = [-79.40, 43.67];
    const session: DrawingSession = {
      lineId: "l1",
      waypoints: [[-79.38, 43.65]],
      cursorPosition: cursor,
      mode: "new",
    };
    const result = buildInProgressGeoJSON(session, "#7B61FF");
    expect(result).not.toBeNull();
    const coords = (result!.features[0].geometry as GeoJSON.LineString).coordinates;
    expect(coords).toHaveLength(2);
    expect(coords[1]).toEqual(cursor);
  });
});
