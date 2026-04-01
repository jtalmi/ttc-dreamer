import type { SharePayload } from "./sharing-types";

/**
 * Validates that a parsed unknown value matches the SharePayload shape.
 * Checks: v === 1, draft is an object, draft.lines is an array, draft.stations is an array.
 */
function isValidSharePayload(parsed: unknown): parsed is SharePayload {
  if (typeof parsed !== "object" || parsed === null) return false;
  const p = parsed as Record<string, unknown>;
  if (p["v"] !== 1) return false;
  if (typeof p["draft"] !== "object" || p["draft"] === null) return false;
  const draft = p["draft"] as Record<string, unknown>;
  if (!Array.isArray(draft["lines"])) return false;
  if (!Array.isArray(draft["stations"])) return false;
  return true;
}

/**
 * Decodes a URL hash string into a SharePayload.
 * Strips leading "#p=" prefix if present.
 * Returns null for any malformed, empty, or invalid input.
 */
export function decodeSharePayload(hash: string): SharePayload | null {
  if (!hash) return null;
  try {
    const encoded = hash.startsWith("#p=") ? hash.slice(3) : hash;
    if (!encoded) return null;
    const json = decodeURIComponent(atob(encoded));
    const parsed = JSON.parse(json) as unknown;
    if (!isValidSharePayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
