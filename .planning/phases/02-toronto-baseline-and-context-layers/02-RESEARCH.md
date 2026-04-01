# Phase 2: Toronto Baseline and Context Layers - Research

**Researched:** 2026-03-31
**Domain:** Interactive map rendering, Toronto transit data, GeoJSON layer management
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-01 | User sees the TTC rapid transit baseline rendered on the map | City of Toronto ArcGIS GeoJSON endpoint confirmed; Layer 11 (routes) and Layer 8 (stations, filtered to Subway Stations) are live and queryable; canonical TTC line colors verified |
| MAP-02 | User sees GO lines and stations as context only, not editable infrastructure | City of Toronto ArcGIS Layer 7 (GO Train Stop, 20 stations) confirmed; GO routes available via Metrolinx GTFS or hand-authored static GeoJSON; pointer-events disabled pattern confirmed |
| MAP-03 | User sees Toronto context labels for neighbourhoods, major streets, landmarks, and stations | Toronto Open Data portal has neighbourhood boundaries; major streets available via City ArcGIS; landmarks as hand-authored static GeoJSON Point features; station labels via map symbol layers |
| MAP-04 | User can toggle major bus and streetcar corridor context on and off | City of Toronto ArcGIS Layers 10 (Bus Route) and 12 (Streetcar Route) confirmed queryable; MapLibre layout.visibility "none"/"visible" is the standard toggle mechanism |

</phase_requirements>

---

## Summary

Phase 2 replaces the MapStage placeholder with a live interactive map showing the TTC rapid transit network and city context layers. The map library is **MapLibre GL JS via react-map-gl**, using the `@vis.gl/react-maplibre`-style import (`react-map-gl/maplibre`). Toronto transit geodata comes from the **City of Toronto's live ArcGIS GeoJSON endpoints** — no shapefile conversion or manual coordinate entry is needed.

The tile basemap is **MapTiler Cloud** (free plan: 100k requests/month) using the `dataviz-light` or `streets-v2` style URL pattern. All TTC-specific layers (rapid transit routes, stations, bus/streetcar corridors) are added as GeoJSON sources on top of the basemap so they render with the exact brand colors specified in the UI-SPEC. GO transit data is rendered at a visually subordinate weight with pointer-events disabled.

**Next.js 16 Turbopack compatibility:** A known bug where MapLibre's inline worker was killed by Turbopack's HMR ping handler was **fixed in Next.js 16.0.6**. The project is on Next.js 16.2.1, so no workaround is needed. The map component must use `"use client"` and be wrapped in `next/dynamic` with `{ ssr: false }` to prevent `window is undefined` on the server.

**Primary recommendation:** Use `react-map-gl@8.1.0` + `maplibre-gl@5.21.1`, fetch all TTC/GO layer data from the City of Toronto's public ArcGIS GeoJSON endpoints at build time (write to `public/data/`), and wire layers to React state for visibility toggle.

---

## Project Constraints (from CLAUDE.md)

- **No editing features** in this phase — Phase 2 is read-only rendering
- **Desktop-first** — no mobile layout needed
- MapStage `children` slot is already wired from Phase 1; inject map there, do not change component signatures
- CSS custom property tokens are the design system; no Tailwind config changes
- 2-space indentation, double quotes, semicolons, trailing commas in multi-line objects/arrays
- `import type` for type-only imports
- Inline `Readonly<{...}>` for component props
- Phase 1 shell components (EditorFrame, TopToolbar, EditorShell) must not change
- Tests for domain/geometry helpers where practical (new `lib/baseline/` types qualify)
- Follow AGENTS.md: add tests for domain logic; prefer incremental implementation
- AGENTS.md: "Read the relevant guide in `node_modules/next/dist/docs/` before writing any code"

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `maplibre-gl` | 5.21.1 | WebGL map renderer, tile management | BSD-licensed Mapbox fork; the standard open-source WebGL map renderer; required by react-map-gl/maplibre |
| `react-map-gl` | 8.1.0 | React wrapper for MapLibre GL JS | Official vis.gl React bindings; Source/Layer component model fits declarative React; v8 has dedicated `/maplibre` import path |
| `@types/geojson` | included with TS | GeoJSON type definitions | Standard; lets you type FeatureCollection, Feature, LineString, etc. properly |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MapTiler Cloud (tile API) | n/a | Muted basemap tiles (free plan) | 100k requests/month; `dataviz` or `streets-v2` style is perfect for a transit-hero map |
| City of Toronto ArcGIS | n/a (public REST API) | Official TTC/GO GeoJSON data | Layer 11 (TTC routes), Layer 8 (public transit stops incl. subway), Layer 7 (GO stops), Layer 10 (bus routes), Layer 12 (streetcar routes) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-map-gl` | Raw `maplibre-gl` imperative API | `react-map-gl` Source/Layer components match React paradigm; raw API requires `map.on('load', ...)` refs and manual cleanup |
| `react-map-gl` | `@vis.gl/react-maplibre` (the sister package) | `react-map-gl/maplibre` IS `@vis.gl/react-maplibre` 8.1.0 under the hood; the `react-map-gl` package re-exports it at the `/maplibre` subpath |
| MapTiler tiles | Protomaps/PMTiles (self-hosted) | PMTiles requires hosting a large file; MapTiler free tier is simpler for development and sufficient for v1 |
| MapTiler tiles | Stamen/CARTO tiles | MapTiler offers first-class MapLibre GL JSON style URLs; Stamen requires custom style authoring |
| City ArcGIS endpoint | Hand-authored static GeoJSON | ArcGIS endpoint is authoritative and live; hand-authoring station coordinates is error-prone |
| City ArcGIS endpoint | GTFS feed conversion | GTFS processing requires extra tooling; the ArcGIS REST API outputs GeoJSON directly |

**Installation:**
```bash
npm install react-map-gl maplibre-gl
```

**Version verification (confirmed 2026-03-31):**
```
maplibre-gl: 5.21.1 (published 2026-03-25)
react-map-gl: 8.1.0 (latest stable)
@vis.gl/react-maplibre: 8.1.0 (react-map-gl/maplibre re-exports this)
```

---

## Architecture Patterns

### Recommended Project Structure

```
public/
└── data/
    ├── ttc-routes-today.geojson        # Fetched from City of Toronto ArcGIS at build/dev time
    ├── ttc-routes-future.geojson       # "future_committed" baseline variant
    ├── ttc-stations.geojson            # 75 subway stations from Layer 8 (PT_TYPE=Subway Stations)
    ├── go-stations.geojson             # 20 GO stations from Layer 7
    ├── go-routes.geojson               # GO lines (static hand-authored, see data strategy)
    ├── bus-corridors.geojson           # Major bus routes from Layer 10 (filtered by ridership)
    ├── streetcar-corridors.geojson     # Streetcar routes from Layer 12
    ├── neighbourhoods.geojson          # Toronto neighbourhood boundaries (City Open Data)
    └── landmarks.geojson               # Hand-authored: CN Tower, Union, Pearson, Rogers Centre, etc.

lib/
├── baseline/
│   ├── baseline-types.ts               # GeoJSON feature types; TtcLine, TtcStation, etc.
│   └── baseline-data.ts                # Loader helpers for public/data/ files
└── proposal/
    └── (unchanged from Phase 1)

components/
├── editor/
│   ├── editor-shell.tsx                # Extended: passes busCorridorVisible state to EditorFrame
│   ├── editor-frame.tsx                # Extended: busCorridorVisible prop + layer toggle in toolbar
│   ├── top-toolbar.tsx                 # Extended: adds "Bus + Streetcar Corridors" toggle button
│   ├── map-stage.tsx                   # Unchanged (children slot used)
│   └── toronto-map.tsx                 # NEW: MapLibre map with all layers
└── map/
    ├── ttc-layers.tsx                  # NEW: TTC rapid transit Source + Layer components
    ├── go-layers.tsx                   # NEW: GO context Source + Layer components
    ├── corridor-layers.tsx             # NEW: Bus/streetcar corridor Source + Layer components
    └── context-labels.tsx              # NEW: Neighbourhood, landmark, street label layers
```

### Pattern 1: next/dynamic SSR Guard

MapLibre GL JS uses `window` and `Worker` APIs unavailable on the server. Wrap the map component:

```typescript
// Source: Next.js docs / confirmed pattern in visgl.github.io/react-map-gl
import dynamic from "next/dynamic";

const TorontoMap = dynamic(
  () => import("@/components/editor/toronto-map"),
  { ssr: false, loading: () => <div className="map-stage-surface" style={{ flex: 1 }} /> }
);
```

Pass this as `mapChildren` to `EditorFrame`, which already has that slot.

### Pattern 2: MapLibre CSS Import

```typescript
// Source: visgl.github.io/react-map-gl/docs/get-started
// Must be imported in the "use client" map component itself, not globals.css
import "maplibre-gl/dist/maplibre-gl.css";
import Map from "react-map-gl/maplibre";
```

### Pattern 3: Source + Layer Component Model

```typescript
// Source: visgl.github.io/react-map-gl/docs/get-started/adding-custom-data
import { Map, Source, Layer } from "react-map-gl/maplibre";
import type { LineLayer, CircleLayer } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";

const ttcLine1Layer: LineLayer = {
  id: "ttc-line-1",
  type: "line",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: { "line-color": "#FFC41F", "line-width": 4 },
};

function TtcLayers({ routes }: { routes: FeatureCollection }) {
  return (
    <Source id="ttc-routes" type="geojson" data={routes}>
      <Layer {...ttcLine1Layer} />
    </Source>
  );
}
```

### Pattern 4: Layer Visibility Toggle

Use the MapLibre `layout.visibility` property, driven by React state:

```typescript
// Source: MapLibre GL JS style spec — layout property
const corridorLayer: LineLayer = {
  id: "bus-corridors",
  type: "line",
  layout: {
    visibility: busCorridorVisible ? "visible" : "none",
  },
  paint: {
    "line-color": "#E05A2A",
    "line-width": 2,
    "line-dasharray": [4, 4],
    "line-opacity": 0.6,
  },
};
```

The `layout` property in the Layer component is reactive — react-map-gl performs style diffing when props change.

### Pattern 5: Station Tooltip (Read-Only, Phase 2)

Use the react-map-gl `Popup` component with a `onMouseEnter`/`onMouseLeave` pattern on the circle layer:

```typescript
// Source: visgl.github.io/react-map-gl/docs/api-reference/maplibre/popup
import { Map, Popup, useMap } from "react-map-gl/maplibre";

// Conditional render: tooltip only when hoverStation is set
{hoverStation && (
  <Popup
    longitude={hoverStation.lng}
    latitude={hoverStation.lat}
    anchor="bottom"
    closeButton={false}
    closeOnClick={false}
    offset={10}
  >
    {hoverStation.name}
  </Popup>
)}
```

Wire `mouseenter`/`mouseleave` on the `ttc-stations` circle layer via the map `onMouseMove` handler or by passing `interactiveLayerIds` to the Map component and using `onMouseMove`.

### Pattern 6: Toronto-Centered Initial View

```typescript
const TORONTO_VIEW = {
  longitude: -79.387,
  latitude: 43.653,
  zoom: 11,
};

<Map
  initialViewState={TORONTO_VIEW}
  mapStyle="https://api.maptiler.com/maps/dataviz-light/style.json?key=YOUR_KEY"
  style={{ width: "100%", height: "100%" }}
>
```

### Anti-Patterns to Avoid

- **Importing `maplibre-gl` in a server component:** Will throw `window is undefined`; always use `"use client"` + `next/dynamic`.
- **Adding layers before map load:** MapLibre requires `map.on('load')` before `addSource`/`addLayer`; react-map-gl Source/Layer components handle this automatically when nested inside `<Map>`.
- **Forgetting to import `maplibre-gl/dist/maplibre-gl.css`:** Map controls and popups will be unstyled without it.
- **Fetching ArcGIS data at runtime in the browser:** Network calls to `gis.toronto.ca` from the browser add latency on each load. Fetch once during development and commit static GeoJSON files to `public/data/`.
- **Using a custom webpack alias `mapbox-gl → maplibre-gl`:** No longer needed with `react-map-gl@8` — import directly from `react-map-gl/maplibre`.
- **Building a custom layer switcher:** react-map-gl's Layer component handles visibility via the `layout` prop; no external plugin needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Interactive WebGL map | Custom canvas/SVG renderer | `maplibre-gl` | Handles tiles, projections, zoom, pan, WebGL, touch, retina — thousands of edge cases |
| React bindings for MapLibre | Manual `useRef` + `map.addLayer()` imperative code | `react-map-gl` Source/Layer components | Handles mounting order, style diffing, layer cleanup, SSR guard hooks |
| Coordinate projection | Manual lat/lng → pixel math | MapLibre GL JS projection system built-in | Handles all projections, viewport transforms, and zoom-dependent rendering |
| Map tiles | Self-hosted tile server | MapTiler Cloud free plan | 100k tiles/month is enough for development; no infrastructure to maintain |
| Transit geodata | Hand-coded station coordinates | City of Toronto ArcGIS GeoJSON | Authoritative, updated, 75 stations confirmed available; manual entry introduces errors |
| Layer visibility toggling | Custom CSS show/hide of canvas elements | `layout: { visibility: "none" | "visible" }` in Layer component | The MapLibre-native approach; works at the GPU level, not DOM level |

**Key insight:** MapLibre GL JS's Source/Layer model separates data from style, which maps exactly to the "toggle by changing layout.visibility" pattern. Any approach that tries to mount/unmount DOM elements or canvas layers is fighting the rendering model.

---

## Data Strategy: Static GeoJSON in `public/data/`

### Rationale

The City of Toronto ArcGIS endpoints are publicly queryable but should not be called on every page load:

- Network latency adds 200–800ms to map initialization
- The data is stable (TTC routes don't change daily)
- Committing GeoJSON to `public/data/` makes the app fully offline after initial load

### Fetch URLs (run once during development, commit output)

```bash
# TTC subway routes (Layer 11)
curl "https://gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer/11/query?where=1%3D1&outFields=*&f=geojson" \
  > public/data/ttc-routes-today.geojson

# TTC subway stations - all subway station points (Layer 8, PT_TYPE filter)
curl "https://gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer/8/query?where=PT_TYPE%3D%27Subway%20Stations%27&outFields=*&f=geojson" \
  > public/data/ttc-stations.geojson

# GO Train stops (Layer 7)
curl "https://gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer/7/query?where=1%3D1&outFields=*&f=geojson" \
  > public/data/go-stations.geojson

# TTC streetcar routes (Layer 12)
curl "https://gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer/12/query?where=1%3D1&outFields=*&f=geojson" \
  > public/data/streetcar-corridors.geojson

# TTC bus routes (Layer 10) — large dataset, filter to major corridors by route_short_name
# Routes: 29 Dufferin, 36 Finch West (surface), 54 Lawrence East, 60 Steeles West,
#         72 Pape, 86 Scarborough, etc. (hand-select ~10-15 major routes)
```

### Future Committed Baseline

The "future_committed" toggle should show the same routes **plus** lines currently under construction with confirmed opening dates:

- **Line 5 Eglinton Crosstown** — opened February 2026, already in City ArcGIS data (ROUTE_ID=5)
- **Line 6 Finch West LRT** — opened December 2025, check if ROUTE_ID=6 is in ArcGIS data
- **Ontario Line** — still under construction (opens ~2031), NOT in future_committed baseline for v1
- **Scarborough Subway Extension** — still under construction, NOT in future_committed for v1
- **Yonge North Extension** — still under construction, NOT in future_committed for v1

**Decision needed by planner:** For v1, "future_committed" likely shows the same data as "today" since all recently opened lines (5, 6) are now in the live dataset. The distinction will matter more when Ontario Line approaches opening. For now, both baseline modes can use the same static GeoJSON files, with a comment noting where they would diverge.

### GO Route Lines

The City of Toronto ArcGIS server provides GO *stop* points (Layer 7) but not GO rail *line* geometries. Options:

1. **Hand-author GO line GeoJSON** — draw approximate polylines connecting the 20 confirmed GO station points (Lakeshore West, Lakeshore East, Barrie, Stouffville, Kitchener, Richmond Hill, Milton corridors). This is ~7 lines with ~3-6 waypoints each.
2. **Use Metrolinx Frequent Rapid Transit Network Shapefile** — convert from shapefile to GeoJSON.

**Recommendation:** Hand-author simplified GO line GeoJSON using the confirmed station point coordinates as anchors. GO lines only need to show approximate corridors at opacity 0.75 — they are context, not editable infrastructure. This avoids shapefile tooling and keeps the data simple.

### Neighbourhood Labels

The City of Toronto neighbourhood boundaries GeoJSON is available at:
- `https://open.toronto.ca/dataset/neighbourhoods/` (download from Open Data portal)
- GitHub: `github.com/jasonicarter/toronto-geojson` has pre-converted GeoJSON

For label rendering, use a MapLibre `symbol` layer on the neighbourhood boundary centroids — derive centroids from polygon centroid calculation or use the `label_point` geometry from the City dataset if provided.

### Landmarks (hand-authored)

For Phase 2, ~8-10 Toronto landmarks are sufficient for Toronto-native feel:

```json
[
  { "name": "CN Tower", "lng": -79.3871, "lat": 43.6426 },
  { "name": "Union Station", "lng": -79.3806, "lat": 43.6452 },
  { "name": "Rogers Centre", "lng": -79.3893, "lat": 43.6414 },
  { "name": "Pearson Airport", "lng": -79.6306, "lat": 43.6777 },
  { "name": "Scarborough Town Centre", "lng": -79.2568, "lat": 43.7739 },
  { "name": "Yonge-Dundas Square", "lng": -79.3804, "lat": 43.6561 },
  { "name": "Harbourfront", "lng": -79.3814, "lat": 43.6381 },
  { "name": "North York Centre", "lng": -79.4080, "lat": 43.7615 }
]
```

---

## Common Pitfalls

### Pitfall 1: MapLibre Worker Killed by Old Turbopack
**What goes wrong:** MapLibre uses an inline Web Worker for tile decoding; Turbopack's HMR `ping` message handling killed the worker in early Next.js 15-16.x releases.
**Why it happens:** Turbopack didn't recognize MapLibre's `{"event":"ping"}` HMR message format.
**How to avoid:** Project is already on Next.js 16.2.1 — the fix landed in 16.0.6. No action needed.
**Warning signs:** Map tiles never render; console error `unrecognized HMR message {"event":"ping"}`.

### Pitfall 2: `window is undefined` SSR Error
**What goes wrong:** Next.js App Router runs components on the server by default; MapLibre calls `window` at import time.
**Why it happens:** MapLibre GL JS is browser-only.
**How to avoid:** Two-step guard:
  1. `"use client"` directive on the map component
  2. `next/dynamic` with `{ ssr: false }` on the *import site*
**Warning signs:** `ReferenceError: window is not defined` during `next build` or first page render.

### Pitfall 3: Missing CSS for Map Controls
**What goes wrong:** Zoom controls, popups, and attribution appear unstyled or invisible.
**Why it happens:** Forgetting to import `maplibre-gl/dist/maplibre-gl.css`.
**How to avoid:** Import the CSS in the same `"use client"` component that uses `<Map>`.
**Warning signs:** Popup appears but has no background; zoom +/- buttons show as raw text.

### Pitfall 4: Map Style Not Loading (Invalid API Key)
**What goes wrong:** Map appears blank (black or transparent) but no JS error is thrown.
**Why it happens:** MapTiler style URL requires `?key=YOUR_KEY`; without a valid key, the style JSON returns a 401.
**How to avoid:** Store the key in `.env.local` as `NEXT_PUBLIC_MAPTILER_KEY=...`; fail fast in development with a clear console warning if the env var is missing.
**Warning signs:** Blank map canvas; network tab shows 401 on the style URL.

### Pitfall 5: TTC Line Colors Overridden by Basemap
**What goes wrong:** The basemap renders its own transit layer on top of custom GeoJSON layers.
**Why it happens:** MapTiler's `streets-v2` style includes built-in transit layers; custom layers added without `beforeId` go above everything.
**How to avoid:** Use `dataviz-light` style (no built-in transit lines) OR add TTC layers with `beforeId` set to the correct insertion point; OR explicitly hide basemap transit layers via style manipulation.
**Recommendation:** Use `dataviz-light` style for Phase 2 — it has no built-in transit and is the right visual foundation for a data-overlay map.

### Pitfall 6: Layer Stacking Order Broken at Zoom Levels
**What goes wrong:** GO lines appear on top of TTC lines at certain zoom levels.
**Why it happens:** react-map-gl renders layers in the order they are mounted; the UI-SPEC layer stack order must be honored in component render order.
**How to avoid:** Mount layers in the exact order specified in the UI-SPEC: base map → streets → bus/streetcar (when on) → GO lines → GO stations → TTC lines → TTC stations → neighbourhood labels → landmark callouts. Use `beforeId` to anchor into basemap style layer positions.

### Pitfall 7: ArcGIS Data Fetched at Runtime
**What goes wrong:** Map initialization stalls for 200-800ms on each load while browser fetches from `gis.toronto.ca`.
**Why it happens:** Live API calls add network round-trips during map load.
**How to avoid:** Fetch once at development time and commit static GeoJSON to `public/data/`; load with `fetch("/data/ttc-routes-today.geojson")` which is served by Next.js from the static files.

---

## Code Examples

### Minimal TorontoMap Component

```typescript
// Source: visgl.github.io/react-map-gl/docs/get-started
// Source: confirmed pattern for Next.js App Router + maplibre-gl
"use client";

import Map, { Source, Layer } from "react-map-gl/maplibre";
import type { LineLayer, CircleLayer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";

const TORONTO_VIEW = {
  longitude: -79.387,
  latitude: 43.653,
  zoom: 11,
};

const mapStyle = `https://api.maptiler.com/maps/dataviz-light/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

export default function TorontoMap() {
  return (
    <Map
      initialViewState={TORONTO_VIEW}
      mapStyle={mapStyle}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
    >
      {/* Layers injected as children — rendered in stacking order */}
    </Map>
  );
}
```

### Dynamic Import Wrapper (SSR Guard)

```typescript
// Source: Next.js docs — next/dynamic with ssr: false
import dynamic from "next/dynamic";

const TorontoMap = dynamic(
  () => import("@/components/editor/toronto-map"),
  {
    ssr: false,
    loading: () => (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading Toronto map...
      </div>
    ),
  }
);
```

### TTC Route Layer (Line 1 example)

```typescript
// Source: visgl.github.io/react-map-gl/docs/get-started/adding-custom-data
// Source: maplibre.org/maplibre-gl-js/docs/examples/add-a-geojson-line/
const ttcLine1Layer: LineLayer = {
  id: "ttc-line-1",
  type: "line",
  filter: ["==", ["get", "ROUTE_ID"], "1"],
  layout: { "line-join": "round", "line-cap": "round" },
  paint: {
    "line-color": "#FFC41F",  // --ttc-line-1 from UI-SPEC
    "line-width": 4,
  },
};
```

### GO Context Layer (non-interactive, subordinate)

```typescript
const goRoutesLayer: LineLayer = {
  id: "go-routes",
  type: "line",
  layout: { "line-join": "round", "line-cap": "butt" },
  paint: {
    "line-color": "#007A3D",  // --go-line-surface from UI-SPEC
    "line-width": 3,
    "line-dasharray": [6, 3],
    "line-opacity": 0.75,
  },
};
// Pointer events: GO layers are non-interactive — handled by NOT adding them to interactiveLayerIds
```

### Bus/Streetcar Corridor Toggle

```typescript
// Controlled by React state from toolbar
const corridorLayer: LineLayer = {
  id: "bus-corridors",
  type: "line",
  layout: {
    visibility: busCorridorVisible ? "visible" : "none",  // reactive
  },
  paint: {
    "line-color": "#E05A2A",  // --bus-corridor-surface from UI-SPEC
    "line-width": 2,
    "line-dasharray": [4, 4],
    "line-opacity": 0.60,
  },
};
```

### Station Label Layer (symbol)

```typescript
const stationLabelLayer = {
  id: "ttc-station-labels",
  type: "symbol" as const,
  layout: {
    "text-field": ["get", "PLACE_NAME"],
    "text-font": ["IBM Plex Sans Regular", "Open Sans Regular"],
    "text-size": 14,
    "text-offset": [0.6, 0],
    "text-anchor": "left",
  },
  paint: {
    "text-color": "rgba(24, 50, 74, 0.90)",  // --shell-secondary at 90%
    "text-halo-color": "#F3EEE5",
    "text-halo-width": 1,
  },
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mapbox GL JS (proprietary) | MapLibre GL JS (BSD) | 2020 Mapbox license change | No API token required for rendering; community maintained |
| `react-map-gl/mapbox` | `react-map-gl/maplibre` | react-map-gl v8 (2024) | Clean import path; no Mapbox token error |
| `experimental.turbopack` in next.config | `turbopack` (top-level) in next.config | Next.js 16 | Turbopack now default; no flag needed |
| MapLibre worker killed by Turbopack HMR | Fixed | Next.js 16.0.6 | No workaround needed on 16.2.1 |
| `next lint` command | Direct ESLint CLI (`npx eslint`) | Next.js 16 | `npm run lint` still works via `eslint` in package.json |

**Deprecated/outdated:**
- `mapbox-gl` webpack alias trick: Not needed with react-map-gl v8 `/maplibre` path
- `experimental.turbopack` config key: Removed in Next.js 16 (now top-level `turbopack`)
- `serverRuntimeConfig` / `publicRuntimeConfig`: Removed in Next.js 16; use `NEXT_PUBLIC_` env vars

---

## Open Questions

1. **MapTiler API key handling**
   - What we know: Free plan provides 100k tile requests/month; key must be in `NEXT_PUBLIC_MAPTILER_KEY`
   - What's unclear: Should the key be committed (it's a free dev-only key) or documented as required setup?
   - Recommendation: Keep in `.env.local` (not committed); add `.env.local.example` showing the pattern

2. **"Future committed" baseline data**
   - What we know: Lines 5 (Eglinton) and 6 (Finch West) opened in late 2025/early 2026; they are likely already in the live ArcGIS data
   - What's unclear: Whether the ArcGIS endpoint includes Line 5 and 6 in ROUTE_ID 5 and 6 respectively (confirmed: ROUTE_ID 5 and 6 exist in the endpoint query result from this research)
   - Recommendation: Both baseline modes can use the same static GeoJSON for v1; add a comment noting where Ontario Line data would be injected in future

3. **GO rail route line geometry**
   - What we know: City ArcGIS Layer 7 has 20 GO *stations* (points only); no GO *line* geometry is available from City ArcGIS
   - What's unclear: Whether Metrolinx's Frequent Rapid Transit Network Shapefile conversion is worth the tooling overhead
   - Recommendation: Hand-author ~7 GO rail lines as simplified polylines connecting the confirmed station coordinates; commit as `public/data/go-routes.geojson`

4. **IBM Plex Sans font availability in MapLibre symbol layers**
   - What we know: MapLibre symbol layers use glyph fonts from a glyphs URL; the default MapTiler style provides common fonts; IBM Plex Sans may not be in the MapTiler glyph set
   - What's unclear: Whether IBM Plex Sans is available as a MapLibre glyph
   - Recommendation: Fall back to `"Open Sans Regular"` (available in all MapTiler styles) for map label symbol layers; IBM Plex Sans remains the font for all UI chrome (toolbar, sidebar, tooltips)

5. **Neighbourhood label polygon source**
   - What we know: Toronto neighbourhood boundaries exist on City Open Data and GitHub
   - What's unclear: Which exact file to download, whether it includes centroid points
   - Recommendation: Use `github.com/jasonicarter/toronto-geojson` for the GeoJSON polygon boundaries; compute or hard-code centroid label points for the ~25 most prominent neighbourhoods

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling | ✓ | v20.19.1 | — |
| npm | Package management | ✓ | 10.8.2 | — |
| `maplibre-gl` | Map rendering | ✗ (not yet installed) | — | Must install |
| `react-map-gl` | React map bindings | ✗ (not yet installed) | — | Must install |
| MapTiler API | Map basemap tiles | ✗ (key needed) | free plan | Self-host with PMTiles (significant effort) |
| City of Toronto ArcGIS REST API | Transit geodata | ✓ | live public endpoint | N/A — will be fetched once and committed to `public/data/` |

**Missing dependencies with no fallback:**
- `maplibre-gl` and `react-map-gl` must be installed before any map code runs

**Missing dependencies with fallback:**
- MapTiler API key: developer must obtain a free key from `cloud.maptiler.com`; Wave 0 task should document this as a required environment setup step

---

## Validation Architecture

> Validation is enabled (workflow.nyquist_validation not set to false in config).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed yet — Wave 0 must add Vitest |
| Config file | `vitest.config.ts` — needs to be created |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MAP-01 | TTC route GeoJSON loads and has expected features (lines with ROUTE_ID 1-6) | unit | `npx vitest run tests/baseline-data.test.ts -t "ttc routes"` | ❌ Wave 0 |
| MAP-01 | TTC station data has ≥ 70 features with valid coordinates | unit | `npx vitest run tests/baseline-data.test.ts -t "ttc stations"` | ❌ Wave 0 |
| MAP-02 | GO station data loads and has ≥ 18 features | unit | `npx vitest run tests/baseline-data.test.ts -t "go stations"` | ❌ Wave 0 |
| MAP-04 | busCorridorVisible flag toggles layer layout.visibility | unit | `npx vitest run tests/toronto-map.test.ts -t "corridor toggle"` | ❌ Wave 0 |
| MAP-03 | Landmark GeoJSON has ≥ 6 named point features | unit | `npx vitest run tests/baseline-data.test.ts -t "landmarks"` | ❌ Wave 0 |

Map rendering integration cannot be unit-tested meaningfully (requires browser WebGL); the above tests cover data integrity and state logic. Visual rendering is verified manually.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/baseline-data.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `package.json` — add `vitest` and `@vitest/ui` dev dependencies
- [ ] `vitest.config.ts` — configure test environment
- [ ] `tests/baseline-data.test.ts` — covers MAP-01, MAP-02, MAP-03
- [ ] `tests/toronto-map.test.ts` — covers MAP-04 (layer visibility logic)
- [ ] `public/data/` directory — fetch and commit static GeoJSON files
- [ ] `.env.local.example` — document `NEXT_PUBLIC_MAPTILER_KEY` requirement

---

## Sources

### Primary (HIGH confidence)

- **City of Toronto ArcGIS FeatureServer** `gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer` — Layer inventory, GeoJSON query confirmation, TTC route data (6 routes confirmed), 75 subway stations confirmed, 20 GO stations confirmed
- **react-map-gl official docs** `visgl.github.io/react-map-gl/docs` — Installation, Source/Layer API, Popup API, get-started guide
- **MapLibre GL JS official docs** `maplibre.org/maplibre-gl-js/docs` — GeoJSON line example, Layer paint/layout properties, Popup hover example
- **Next.js 16 upgrade guide** `nextjs.org/docs/app/guides/upgrading/version-16` — Turbopack default, webpack config behavior, breaking changes
- **GitHub Issue #86495 vercel/next.js** — MapLibre worker fix confirmed in Next.js 16.0.6

### Secondary (MEDIUM confidence)

- **MapTiler pricing** `maptiler.com/cloud/pricing` — Free plan: 100k requests/month, 5k sessions/month confirmed
- **MapTiler Dataviz style** `maptiler.com/maps/dataviz` — Described as muted, data-visualization-focused map style
- **npm registry** — `maplibre-gl@5.21.1`, `react-map-gl@8.1.0`, `@vis.gl/react-maplibre@8.1.0` current versions verified 2026-03-31

### Tertiary (LOW confidence, flag for validation)

- **jasonicarter/toronto-geojson GitHub repo** — neighbourhood boundary GeoJSON; not verified for completeness or current accuracy of neighbourhood names
- **Hand-authored landmark coordinates** from latlong.net / Wikipedia — CN Tower, Union Station, Pearson; coordinates are approximate, sufficient for map label placement

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — versions verified against npm registry; react-map-gl/maplibre combination confirmed from official docs
- Architecture: HIGH — SSR guard pattern confirmed; Source/Layer model confirmed from official react-map-gl docs
- Geodata sources: HIGH — City of Toronto ArcGIS GeoJSON endpoints live-tested with actual queries during research; 75 stations, 6 routes, 20 GO stops confirmed
- Pitfalls: HIGH — Turbopack worker fix confirmed against GitHub issue; SSR pattern confirmed from official docs
- Basemap/tile style: MEDIUM — MapTiler Dataviz style confirmed exists; exact URL structure needs MapTiler account to confirm `dataviz-light` variant
- Font compatibility in MapLibre glyphs: LOW — IBM Plex Sans availability in MapTiler glyph set not verified

**Research date:** 2026-03-31
**Valid until:** 2026-05-01 (stable ecosystem; tile API may change pricing)
