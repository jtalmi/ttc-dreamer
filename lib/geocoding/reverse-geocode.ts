/**
 * Nominatim reverse geocoding utility.
 * Returns a street-based name string for a given [lng, lat] coordinate,
 * or null when the geocoder is unavailable or rate-limited.
 */

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  [key: string]: unknown;
};

type NominatimResponse = {
  address: NominatimAddress;
  [key: string]: unknown;
};

// In-memory cache keyed by rounded coordinate string (4 decimal places ≈ 11m precision)
const cache = new Map<string, string>();

/** Round lat/lng to 4 decimals and produce a cache key. */
function cacheKey(position: [number, number]): string {
  const lat = Math.round(position[1] * 10000) / 10000;
  const lng = Math.round(position[0] * 10000) / 10000;
  return `${lat},${lng}`;
}

// Suffix replacements — ordered so longer matches take priority.
const SUFFIX_REPLACEMENTS: [RegExp, string][] = [
  [/\bBoulevard\b/g, "Blvd"],
  [/\bCrescent\b/g, "Cres"],
  [/\bGardens\b/g, "Gdns"],
  [/\bTerrace\b/g, "Terr"],
  [/\bStreet\b/g, "St"],
  [/\bAvenue\b/g, "Ave"],
  [/\bDrive\b/g, "Dr"],
  [/\bCourt\b/g, "Ct"],
  [/\bPlace\b/g, "Pl"],
  [/\bTrail\b/g, "Trl"],
  [/\bCircle\b/g, "Cir"],
  [/\bLane\b/g, "Ln"],
  [/\bSquare\b/g, "Sq"],
  [/\bRoad\b/g, "Rd"],
  // Directional suffixes — word-boundary only to avoid "Western" -> "Wrn" issues
  [/\bWest\b/g, "W"],
  [/\bEast\b/g, "E"],
  [/\bNorth\b/g, "N"],
  [/\bSouth\b/g, "S"],
];

/**
 * Abbreviate common Toronto street name suffixes and directions.
 * Uses word-boundary regex to avoid partial matches (e.g. "Western" stays "Western").
 */
export function abbreviateStreetName(name: string): string {
  let result = name;
  for (const [pattern, replacement] of SUFFIX_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Extract a cross-street candidate from a Nominatim address object.
 * Nominatim sometimes exposes a nearby pedestrian or footway name that
 * functions as a second road reference.
 */
function extractCrossStreet(address: NominatimAddress): string | null {
  // Nominatim may include a pedestrian or footway as a secondary street name
  const candidate = address.pedestrian;
  if (candidate && typeof candidate === "string") {
    return candidate;
  }
  return null;
}

/**
 * Reverse geocode a [lng, lat] position using Nominatim.
 *
 * Returns a street-based name (abbreviated) or null when the geocoder is
 * unavailable, rate-limited, or returns unusable data.
 *
 * Results are cached by rounded coordinate (4 decimal places ≈ 11m) to
 * avoid redundant API requests when stations are placed near each other.
 */
export async function reverseGeocode(
  position: [number, number],
): Promise<string | null> {
  const key = cacheKey(position);

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${position[1]}&lon=${position[0]}&format=json&zoom=17`;
    const response = await fetch(url, {
      headers: { "User-Agent": "TorontoTransitSandbox/1.0" },
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as NominatimResponse;
    const address = data.address;

    let result: string | null = null;

    if (address.road) {
      const primaryRoad = abbreviateStreetName(address.road);
      const crossStreet = extractCrossStreet(address);

      if (crossStreet) {
        result = `${primaryRoad} & ${abbreviateStreetName(crossStreet)}`;
      } else {
        result = primaryRoad;
      }
    } else if (address.suburb) {
      result = address.suburb;
    } else if (address.neighbourhood) {
      result = address.neighbourhood;
    }

    if (result !== null) {
      cache.set(key, result);
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Clear the in-memory geocode cache.
 * Intended for use in tests only.
 */
export function clearGeocodeCache(): void {
  cache.clear();
}
