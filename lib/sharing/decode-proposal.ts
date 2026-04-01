import type { SharePayload, SharePayloadV1, SharePayloadV2 } from "./sharing-types";
import type { ProposalStationDraft } from "@/lib/proposal/proposal-types";

/**
 * Migrates a v1 SharePayload to a v2 SharePayload.
 * For each line that has waypoints but empty stationIds, creates a ProposalStationDraft
 * per waypoint (using crypto.randomUUID()), populates line.stationIds, and adds the
 * new stations to draft.stations.
 * Lines that already have stationIds populated are left as-is.
 */
function migrateV1toV2(v1: SharePayloadV1): SharePayloadV2 {
  const draft = { ...v1.draft, lines: [...v1.draft.lines], stations: [...v1.draft.stations] };

  for (let i = 0; i < draft.lines.length; i++) {
    const line = draft.lines[i];
    // Only migrate lines that have waypoints but no stationIds
    if (line.waypoints.length > 0 && line.stationIds.length === 0) {
      const newStations: ProposalStationDraft[] = line.waypoints.map((wp, idx) => ({
        id: crypto.randomUUID(),
        name: `Station ${idx + 1}`,
        position: wp,
        lineIds: [line.id],
      }));
      const newStationIds = newStations.map((s) => s.id);
      draft.lines[i] = { ...line, stationIds: newStationIds };
      draft.stations = [...draft.stations, ...newStations];
    }
  }

  return {
    v: 2,
    draft,
    author: v1.author,
  };
}

/**
 * Validates that a parsed unknown value matches the SharePayload shape.
 * Checks: v === 1 or v === 2, draft is an object, draft.lines is an array, draft.stations is an array.
 * Returns the payload as v2 (migrating v1 if needed), or null if invalid.
 */
function isValidSharePayload(parsed: unknown): SharePayloadV2 | null {
  if (typeof parsed !== "object" || parsed === null) return null;
  const p = parsed as Record<string, unknown>;
  if (p["v"] !== 1 && p["v"] !== 2) return null;
  if (typeof p["draft"] !== "object" || p["draft"] === null) return null;
  const draft = p["draft"] as Record<string, unknown>;
  if (!Array.isArray(draft["lines"])) return null;
  if (!Array.isArray(draft["stations"])) return null;

  if (p["v"] === 1) {
    return migrateV1toV2(parsed as SharePayloadV1);
  }
  return parsed as SharePayloadV2;
}

/**
 * Decodes a URL hash string into a SharePayloadV2.
 * Strips leading "#p=" prefix if present.
 * Migrates v1 payloads to v2 automatically.
 * Returns null for any malformed, empty, or invalid input.
 */
export function decodeSharePayload(hash: string): SharePayloadV2 | null {
  if (!hash) return null;
  try {
    const encoded = hash.startsWith("#p=") ? hash.slice(3) : hash;
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json) as unknown;
    return isValidSharePayload(parsed);
  } catch {
    return null;
  }
}

// Export for testing
export { migrateV1toV2 };
