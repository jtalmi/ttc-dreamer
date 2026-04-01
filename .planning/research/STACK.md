# Stack Research

**Domain:** Desktop-first transit map sandbox — v2.0 additions only
**Researched:** 2026-04-01
**Confidence:** MEDIUM-HIGH

> This file covers only NEW stack additions for v2.0. The v1.0 baseline
> (Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, MapLibre GL JS 5.21,
> react-map-gl 8.1, @turf/turf 7.3, Vitest 4.1) is validated and unchanged.

---

## Recommended Stack — New Additions

### Floating Toolbar UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@radix-ui/react-toolbar` | `^1.1.x` | Accessible toolbar container for tool groups | Radix Toolbar handles keyboard navigation, ARIA roles, and toggle group semantics out of the box — no hand-rolling needed. Compose inside a `position: absolute` Tailwind container to float over the map. |
| `lucide-react` | `^1.7.0` | Icon set for toolbar buttons | 1,300+ SVG icons as tree-shakable React components. Clean stroke-style matches a transit editor aesthetic. Actively maintained (1.7.0 published April 2026). |
| CSS via Tailwind (`absolute`, `z-*`, `backdrop-blur`) | N/A | Floating panel positioning | No JS positioning library needed. The map canvas is a `relative` container; toolbars sit as `absolute`-positioned children with explicit `top`/`left`/`bottom`/`right` offsets and a `z-10` or higher stacking order. This avoids introducing a dependency for what is pure CSS layout. |

**Floating toolbar pattern:** Wrap the map canvas in `relative overflow-hidden`. Place toolbar divs as `absolute` children with Tailwind positional classes. Use `backdrop-blur-sm bg-white/80` for a frosted-glass panel. No floating-ui or popper dependency is needed — these tools are for dynamic anchor-relative positioning (tooltips, dropdowns), not fixed-quadrant overlays.

### Station-First Drawing Interactions

The existing `react-map-gl` `onClick` and `onMouseMove` handlers plus the current `useReducer` state machine are sufficient for click-to-place station drawing. No new library is needed for the core interaction loop.

For richer drag-to-reposition behavior on stations, `maplibre-gl`'s native `map.on('mousedown', ...)` listeners accessed via the `useMap()` hook cover the use case without adding a dependency.

**Do NOT add terra-draw for this project.** Terra-draw is designed for generic geometry drawing (polygons, rectangles, lines). This project has a custom station-first domain model where lines connect named stations with specific business rules (extensions, branches, interchanges). Wrapping terra-draw around that model adds complexity without benefit — the existing interaction handlers are the right layer.

### Auto-Generated Station Names (Reverse Geocoding)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Nominatim OSM API | N/A (HTTP) | Reverse geocode lat/lng to nearest street intersection | Free, no API key, returns structured address data including `road` and cross-street fields. Sufficient for generating plausible station names like "Yonge & Bloor". |

**Nominatim usage policy constraints (MEDIUM confidence — verified against official policy):**
- Maximum 1 request/second across all users of your app
- Must include `User-Agent` or `Referer` header identifying the app
- Cache results client-side; do not re-query coordinates you've already resolved
- Prohibited: bulk/grid reverse geocoding (not applicable here — one call per user-placed station)

**Implementation approach:** Fire a single `fetch` to `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}&zoom=17&addressdetails=1` when a station is placed. Extract `address.road` and the nearest cross-street to synthesize a name like "King St W". Debounce to avoid hammering the API during drag operations.

No wrapper library needed. A thin `reverseGeocode(lat, lng): Promise<string>` utility in `lib/` with in-memory caching is the right pattern.

**Alternative if Nominatim rate limits become a problem:** Photon (photon.komoot.io) — also OpenStreetMap-based, more lenient rate limits, same JSON structure. Drop-in swap.

### Baseline TTC Data Correction

No new library is needed. The approach is to re-source the static GeoJSON files in `public/data/` from the most accurate available data and update `lib/baseline/baseline-types.ts` to reflect new status fields.

**Recommended data sources (in priority order):**

| Source | What to Pull | Format | Why |
|--------|-------------|--------|-----|
| City of Toronto ArcGIS FeatureServer layer 11 | TTC rapid transit route lines (currently powering `ttc-routes.geojson`) | ArcGIS REST → GeoJSON | Already the existing source. Re-query to get current geometry including updated Line 5 alignment. Layer 11 confirmed to include Line 5 (Eglinton) with orange color code `FF8000`. |
| OpenStreetMap via Overpass API | Ontario Line planned alignment, corrected station positions | Overpass QL → GeoJSON via overpass-turbo.eu export | OSM has detailed Ontario Line geometry as a mapped "under construction" relation. Use `relation["name"="Ontario Line"]` in Overpass Turbo to export GeoJSON. More accurate than hand-drawn coordinates. |
| Finch West LRT (Line 6) | Current operational status and alignment | OSM Overpass | Confirmed operational; update `ttc-routes-future.geojson` status properties or graduate to main routes file. |

**Status field addition:** Add a `status` property to route features (`"operational" | "under_construction" | "planned"`) and update the rendering layers in `components/map/` to use it for styling (solid line vs dashed vs dotted).

**No new npm dependency.** Data correction is a one-time GeoJSON file refresh task, not a runtime concern.

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `terra-draw` or `maplibre-geoman` | These are generic geometry drawing tools. The project's station-first model requires custom business logic (line extensions, branch rules, interchange detection) that can't be delegated to a generic draw mode | Keep the existing `onClick`/`useReducer` interaction pattern |
| `@floating-ui/react` or `popper.js` | These are for anchor-relative tooltip/dropdown positioning. Floating toolbars with fixed viewport-quadrant placement don't need JS positioning | CSS `absolute`/`fixed` with Tailwind utilities |
| Paid geocoding APIs (Google Maps, Mapbox, HERE) | Station name suggestions are a convenience feature, not a core product capability. Rate-limited free OSM data is sufficient | Nominatim + Photon as fallback |
| GTFS parsing libraries | The baseline data is baked into static GeoJSON at build time, not parsed from GTFS feeds at runtime | Re-derive GeoJSON from GTFS once during data preparation and commit the output |
| React state management libraries (Zustand, Jotai) | The existing `useReducer` + history wrapper pattern is validated and sufficient | Keep the current architecture |

---

## Installation

```bash
# New production dependencies only
npm install @radix-ui/react-toolbar lucide-react

# No new dev dependencies required
```

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@radix-ui/react-toolbar@^1.1` | `react@19.2.4` | Radix UI v1.x supports React 18 and 19 |
| `lucide-react@^1.7` | `react@19.2.4` | Tree-shakable; no compatibility issues with React 19 |
| Nominatim API | All browsers (fetch) | No npm package needed; plain `fetch` with `User-Agent` header |

---

## Integration Notes for Existing Stack

**react-map-gl and floating toolbars:** The `<Map>` component from `react-map-gl/maplibre` renders into a `div`. Wrap that div in a `relative` container and position toolbar children absolutely. The map's own controls (zoom, compass) use `maplibre-gl` IControl API — custom toolbars bypass that system entirely and live in React DOM.

**Radix Toolbar + Tailwind:** `@radix-ui/react-toolbar` provides unstyled primitives. Apply Tailwind classes directly to `Toolbar.Root`, `Toolbar.Button`, and `Toolbar.ToggleGroup` items. No additional styling library needed.

**Nominatim + existing geometry flow:** Station placement already emits a `[lng, lat]` coordinate pair through the reducer. The reverse geocode call hooks into the `ADD_STATION` action or a post-dispatch effect — fetch the name, then dispatch a `SET_STATION_NAME` action with the result. The station model already has a `name` field.

**ArcGIS data re-pull:** The existing `lib/baseline/baseline-data.ts` loads from `public/data/*.geojson`. Replacing those files is sufficient — no code changes needed unless new status fields require updates to type definitions and render layers.

---

## Sources

- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/ — rate limits and attribution requirements (MEDIUM confidence, verified via official OSM Foundation policy page)
- terra-draw npm: https://www.npmjs.com/package/terra-draw — version 1.26.0, MapLibre GL JS 4/5 adapter confirmed (MEDIUM confidence)
- terra-draw-maplibre-gl-adapter npm — version 1.3.0 confirmed
- Radix UI Toolbar: https://www.radix-ui.com/primitives/docs/components/toolbar — available, React 18/19 compatible (MEDIUM confidence)
- lucide-react npm: https://www.npmjs.com/package/lucide-react — version 1.7.0 confirmed April 2026 (HIGH confidence)
- react-map-gl v8.1 docs: https://visgl.github.io/react-map-gl/docs/whats-new — MapLibre endpoint `react-map-gl/maplibre` for maplibre-gl>=4, confirmed v8.1 released October 2025 (HIGH confidence)
- City of Toronto ArcGIS FeatureServer Layer 11: https://gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer/11 — includes Line 5 Eglinton with current color codes (MEDIUM confidence — no explicit update date in metadata)
- OpenStreetMap Overpass API: https://wiki.openstreetmap.org/wiki/Overpass_API — for Ontario Line GeoJSON extraction (MEDIUM confidence)
- MapLibre GL JS docs plugins page: https://maplibre.org/maplibre-gl-js/docs/plugins/ — terra-draw listed as official plugin

---
*Stack research for: v2.0 floating toolbars, station-first drawing, auto station naming, baseline data correction*
*Researched: 2026-04-01*
