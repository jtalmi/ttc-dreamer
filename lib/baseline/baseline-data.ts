// Async loaders for static baseline GeoJSON data files.
// Each function fetches from the public/data/ directory.

import type { FeatureCollection } from "geojson";

/** Default map viewport centered on Toronto at a comfortable zoom level. */
export const TORONTO_VIEW = {
  longitude: -79.387,
  latitude: 43.653,
  zoom: 11,
} as const;

/** Fetches TTC rapid transit route lines from the public data directory. */
export async function loadTtcRoutes(): Promise<FeatureCollection> {
  const res = await fetch("/data/ttc-routes.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load TTC routes: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}

/** Fetches TTC subway station points from the public data directory. */
export async function loadTtcStations(): Promise<FeatureCollection> {
  const res = await fetch("/data/ttc-stations.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load TTC stations: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}

/** Fetches GO rail corridor lines from the public data directory. */
export async function loadGoRoutes(): Promise<FeatureCollection> {
  const res = await fetch("/data/go-routes.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load GO routes: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}

/** Fetches GO train station points from the public data directory. */
export async function loadGoStations(): Promise<FeatureCollection> {
  const res = await fetch("/data/go-stations.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load GO stations: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}

/** Fetches Toronto neighbourhood centroid points from the public data directory. */
export async function loadNeighbourhoods(): Promise<FeatureCollection> {
  const res = await fetch("/data/neighbourhoods.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load neighbourhoods: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}

/** Fetches Toronto landmark points from the public data directory. */
export async function loadLandmarks(): Promise<FeatureCollection> {
  const res = await fetch("/data/landmarks.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load landmarks: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}

/** Fetches major Toronto street lines from the public data directory. */
export async function loadMajorStreets(): Promise<FeatureCollection> {
  const res = await fetch("/data/major-streets.geojson");
  if (!res.ok) {
    throw new Error(`Failed to load major streets: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<FeatureCollection>;
}
