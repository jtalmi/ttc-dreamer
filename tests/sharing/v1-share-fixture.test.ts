/**
 * Frozen v1 share payload fixture test.
 *
 * V1_FIXTURE_ENCODED is a hardcoded base64 string representing a real v1
 * SharePayload. It was captured before the v1-to-v2 type migration landed.
 *
 * This test serves as a regression guard: any change to encode/decode or the
 * migration path must preserve the ability to decode this frozen payload.
 *
 * After the v2 migration: decoding a v1 payload must produce a v2 payload with
 * stations derived from the original line waypoints.
 */
import { describe, it, expect } from "vitest";
import { decodeSharePayload } from "@/lib/sharing/decode-proposal";

/**
 * Frozen v1 payload containing:
 *  - 1 line "Fixture Line" with 3 waypoints (no stationIds populated)
 *  - 1 station "Fixture Station" at the first waypoint position
 *  - author: "v1-fixture-author"
 *
 * Generated with: encodeSharePayload({ v: 1, draft: { ... }, author: "v1-fixture-author" })
 * before any v2 type changes.
 */
export const V1_FIXTURE_ENCODED =
  "JTdCJTIydiUyMiUzQTElMkMlMjJkcmFmdCUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZml4dHVyZS1kcmFmdCUyMiUyQyUyMnRpdGxlJTIyJTNBJTIydjElMjBGaXh0dXJlJTIyJTJDJTIyYmFzZWxpbmVNb2RlJTIyJTNBJTIydG9kYXklMjIlMkMlMjJsaW5lcyUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIybGluZS1maXh0dXJlLTElMjIlMkMlMjJuYW1lJTIyJTNBJTIyRml4dHVyZSUyMExpbmUlMjIlMkMlMjJjb2xvciUyMiUzQSUyMiUyMzdCNjFGRiUyMiUyQyUyMm1vZGUlMjIlM0ElMjJzdWJ3YXklMjIlMkMlMjJ3YXlwb2ludHMlMjIlM0ElNUIlNUItNzkuMzglMkM0My42NSU1RCUyQyU1Qi03OS4zOSUyQzQzLjY2JTVEJTJDJTVCLTc5LjQlMkM0My42NyU1RCU1RCUyQyUyMnN0YXRpb25JZHMlMjIlM0ElNUIlNUQlN0QlNUQlMkMlMjJzdGF0aW9ucyUyMiUzQSU1QiU3QiUyMmlkJTIyJTNBJTIyc3RhdGlvbi1maXh0dXJlLTElMjIlMkMlMjJuYW1lJTIyJTNBJTIyRml4dHVyZSUyMFN0YXRpb24lMjIlMkMlMjJwb3NpdGlvbiUyMiUzQSU1Qi03OS4zOCUyQzQzLjY1JTVEJTJDJTIybGluZUlkcyUyMiUzQSU1QiUyMmxpbmUtZml4dHVyZS0xJTIyJTVEJTdEJTVEJTdEJTJDJTIyYXV0aG9yJTIyJTNBJTIydjEtZml4dHVyZS1hdXRob3IlMjIlN0Q=";

describe("v1 share fixture — frozen payload roundtrip", () => {
  it("decodes the frozen v1 fixture without returning null", () => {
    const decoded = decodeSharePayload(V1_FIXTURE_ENCODED);
    expect(decoded).not.toBeNull();
  });

  it("decoded payload has a valid draft with lines and stations arrays", () => {
    const decoded = decodeSharePayload(V1_FIXTURE_ENCODED);
    expect(decoded).not.toBeNull();
    expect(Array.isArray(decoded!.draft.lines)).toBe(true);
    expect(Array.isArray(decoded!.draft.stations)).toBe(true);
  });

  it("decoded payload preserves the author field", () => {
    const decoded = decodeSharePayload(V1_FIXTURE_ENCODED);
    expect(decoded!.author).toBe("v1-fixture-author");
  });

  it("decoded payload preserves the original line name and color", () => {
    const decoded = decodeSharePayload(V1_FIXTURE_ENCODED);
    const line = decoded!.draft.lines[0];
    expect(line.name).toBe("Fixture Line");
    expect(line.color).toBe("#7B61FF");
  });

  /**
   * After v2 migration lands: the decoded payload must be v2 and the line's
   * 3 waypoints must each have a corresponding station created by migrateV1toV2.
   * The existing manually-added station ("Fixture Station") remains in draft.stations.
   *
   * Total stations = 1 (original) + 3 (migrated from waypoints) = 4
   * Line stationIds should have 3 entries (one per waypoint).
   */
  it("decoded payload is v2 after migration with stations derived from waypoints", () => {
    const decoded = decodeSharePayload(V1_FIXTURE_ENCODED);
    expect(decoded!.v).toBe(2);

    // The line had 3 waypoints and empty stationIds — migration creates 3 stations
    const line = decoded!.draft.lines[0];
    expect(line.stationIds).toHaveLength(3);

    // draft.stations should contain the original 1 + 3 migrated = 4
    expect(decoded!.draft.stations).toHaveLength(4);

    // Each migrated station position corresponds to original waypoints
    const migratedPositions = line.stationIds.map(
      (id) => decoded!.draft.stations.find((s) => s.id === id)!.position,
    );
    expect(migratedPositions[0]).toEqual([-79.38, 43.65]);
    expect(migratedPositions[1]).toEqual([-79.39, 43.66]);
    expect(migratedPositions[2]).toEqual([-79.40, 43.67]);
  });
});
