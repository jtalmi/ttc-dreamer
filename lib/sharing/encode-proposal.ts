import type { SharePayload, SharePayloadV2 } from "./sharing-types";

/**
 * Encodes a SharePayload (v1 or v2) to a URL-safe base64 string.
 * Uses encodeURIComponent before btoa to handle Unicode safely (non-Latin characters, emoji).
 * The encoder accepts the full union for backwards compatibility but always produces v2 when
 * given a v2 payload. Use SharePayloadV2 for new payloads.
 */
export function encodeSharePayload(payload: SharePayload | SharePayloadV2): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

/**
 * Builds a full share URL with the encoded payload as the URL hash.
 * Returns a string in the form `{origin}/#p={encoded}`.
 */
export function buildShareUrl(payload: SharePayload | SharePayloadV2): string {
  return `${window.location.origin}/#p=${encodeSharePayload(payload)}`;
}
