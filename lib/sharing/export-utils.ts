import type { RefObject } from "react";
import type { MapRef } from "@vis.gl/react-maplibre";

/**
 * Derives a safe filename from the proposal title.
 * Falls back to "ttc-proposal.png" for empty titles or "Untitled Proposal".
 */
export function buildExportFilename(title: string): string {
  const trimmed = title.trim();
  if (!trimmed || trimmed === "Untitled Proposal") return "ttc-proposal.png";
  const slug = trimmed
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "ttc-proposal.png";
  return `${slug}.png`;
}

/**
 * Exports the MapLibre map canvas as a PNG file download.
 * Requires the Map to be initialized with `canvasContextAttributes={{ preserveDrawingBuffer: true }}`.
 * Throws if the map canvas is not available.
 */
export async function exportMapAsPng(
  mapRef: RefObject<MapRef | null>,
  filename: string,
): Promise<void> {
  const canvas = mapRef.current?.getCanvas();
  if (!canvas) throw new Error("Map canvas not available");
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
