import type { SharePayload } from "./sharing-types";

/**
 * Encodes a SharePayload to a URL-safe base64 string.
 * Uses encodeURIComponent before btoa to handle Unicode safely (non-Latin characters, emoji).
 */
export function encodeSharePayload(payload: SharePayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

/**
 * Builds a full share URL with the encoded payload as the URL hash.
 * Returns a string in the form `{origin}/#p={encoded}`.
 */
export function buildShareUrl(payload: SharePayload): string {
  return `${window.location.origin}/#p=${encodeSharePayload(payload)}`;
}
