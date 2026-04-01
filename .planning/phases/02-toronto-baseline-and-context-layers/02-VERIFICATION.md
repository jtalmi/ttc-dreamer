---
phase: 02-toronto-baseline-and-context-layers
verified: 2026-03-31T00:00:00Z
status: human_needed
score: 12/12 must-haves verified
human_verification:
  - test: "Map loads centered on Toronto with TTC lines, station dots, and GO layers visible"
    expected: "MapLibre map renders at zoom 11 centered on Toronto; TTC Lines 1/2/4/5 appear in yellow/green/purple/orange; GO dashed green lines are visible but receive no pointer events"
    why_human: "Requires NEXT_PUBLIC_MAPTILER_KEY in .env.local and a running dev server; tile rendering cannot be verified programmatically"
  - test: "Neighbourhood and landmark labels render on the map at correct locations"
    expected: "Labels like LESLIEVILLE, ANNEX, CN Tower, Union Station appear on the map; neighbourhood labels are uppercase and subdued; landmark labels are bold"
    why_human: "MapLibre symbol layer rendering depends on tile font availability; visual placement requires browser inspection"
  - test: "TTC station hover tooltip appears on mouse over"
    expected: "Hovering a TTC station dot shows a Popup with the station name and '-- TTC'; the tooltip follows the cursor correctly"
    why_human: "Mouse event behavior requires browser interaction; cannot simulate MapLayerMouseEvent programmatically"
  - test: "Bus + Streetcar Corridors toggle works correctly end-to-end"
    expected: "Clicking the button toggles dashed orange corridor lines on and off instantly with no reload delay; toggle button changes background color between --shell-secondary (off) and --shell-accent (on)"
    why_human: "Visual state change and instant-toggle behavior requires browser observation"
  - test: "Phase 1 shell functionality preserved"
    expected: "Toolbar tool buttons, baseline toggle (Today/Future committed), and sidebar collapse still function correctly alongside the new map layers"
    why_human: "Regression verification of interactive state requires browser observation"
---

# Phase 2: Toronto Baseline and Context Layers Verification Report

**Phase Goal:** Make the city itself prominent by rendering TTC, GO, and Toronto-specific context on the map
**Verified:** 2026-03-31
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | User sees TTC rapid transit lines (Lines 1, 2, 4, 5) rendered with canonical brand colors | VERIFIED | `ttc-layers.tsx` renders 5 Layer components using filter `["==", ["get", "ROUTE_ID"], N]` with colors #FFC41F, #009A44, #800080, #DF6C2B, #808080; data wired from `ttc-routes.geojson` (5 features) |
| 2  | User sees TTC subway station dots along the lines | VERIFIED | `ttc-layers.tsx` Source+Layer with id `ttc-stations-circle`, circle-radius 4, white fill, #18324A border; 73-feature `ttc-stations.geojson` loaded and passed as prop |
| 3  | User sees GO Transit lines and stations rendered at visually subordinate weight | VERIFIED | `go-layers.tsx` uses line-dasharray [6,3], line-opacity 0.75, line-width 3 (vs TTC 4); circle-radius 3.5 (vs TTC 4); 7 routes, 19 stations |
| 4  | GO elements are non-interactive | VERIFIED | `toronto-map.tsx` line 168: `interactiveLayerIds={["ttc-stations-circle"]}` — GO layers intentionally excluded |
| 5  | The map replaces the Phase 1 placeholder entirely | VERIFIED | `editor-shell.tsx` passes `<TorontoMap>` as `mapChildren` prop; `MapStage` renders `{children}` when provided, replacing the placeholder grid |
| 6  | Map tiles load from MapTiler with a muted basemap | VERIFIED (conditional) | `toronto-map.tsx` constructs MapTiler dataviz-light URL when `NEXT_PUBLIC_MAPTILER_KEY` is set; falls back to maplibre.org demo tiles when unset — key documented in `.env.local.example` |
| 7  | User sees neighbourhood names placed on the map | VERIFIED | `context-labels.tsx` renders symbol layer with `text-transform: uppercase`, `text-letter-spacing: 0.08`, `text-color: rgba(24,50,74,0.70)`; 26 neighbourhood features in `neighbourhoods.geojson` |
| 8  | User sees landmark callouts on the map | VERIFIED | `context-labels.tsx` renders landmark symbol layer with `text-font: ["Open Sans Semibold",...]`, 85% opacity; 12 landmark features in `landmarks.geojson` (CN Tower, Union Station, Rogers Centre, etc.) |
| 9  | User sees major street names on the map for orientation | VERIFIED | `context-labels.tsx` renders street line layer + symbol layer with `symbol-placement: "line"`, 50% opacity; 12 street features in `major-streets.geojson` |
| 10 | User sees TTC and GO station names next to station dots | VERIFIED | `station-labels.tsx` renders two symbol layers: TTC uses `["coalesce", ["get", "PT_NAME"], ...]`, GO uses `["coalesce", ["get", "PLACE_NAME"], ...]`; both placed to the right of dots via `text-offset: [0.6, 0]` |
| 11 | User sees a Bus + Streetcar Corridors toggle button in the top toolbar | VERIFIED | `top-toolbar.tsx` line 131: button labeled "Bus + Streetcar Corridors" with `aria-pressed={busCorridorVisible}` |
| 12 | Toggle controls corridor visibility through the full state chain | VERIFIED | `toggleCorridors` action in `proposalEditorReducer` flips `chrome.busCorridorVisible`; flows through EditorShell → EditorFrame → TopToolbar and EditorShell → TorontoMap → CorridorLayers via `layout.visibility` |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Lines | Status | Details |
|----------|----------|-------|--------|---------|
| `components/editor/toronto-map.tsx` | MapLibre GL map component with TTC and GO layers | 213 | VERIFIED | Loads 9 GeoJSON sources, renders all layer components in correct stacking order, handles hover tooltip |
| `components/map/ttc-layers.tsx` | TTC route line and station circle Source+Layer components | 105 | VERIFIED | Named export `TtcLayers`; 5 line layers with per-line filters, 1 station circle layer |
| `components/map/go-layers.tsx` | GO route line and station circle Source+Layer components | 54 | VERIFIED | Named export `GoLayers`; dashed lines at 75% opacity, station circles at 3.5px radius |
| `components/map/context-labels.tsx` | Neighbourhood, landmark, and street label symbol layers | 92 | VERIFIED | Named export `ContextLabels`; 3 Source+Layer pairs, correct font/color spec |
| `components/map/station-labels.tsx` | TTC and GO station name symbol layers | 62 | VERIFIED | Named export `StationLabels`; coalesce field expressions handle ArcGIS field variance |
| `components/map/corridor-layers.tsx` | Bus and streetcar corridor Source+Layer with visibility toggle | 64 | VERIFIED | Named export `CorridorLayers`; `layout.visibility` reactive toggle; #E05A2A, dasharray [4,4], opacity 0.6 |
| `lib/baseline/baseline-types.ts` | GeoJSON feature type definitions for TTC and GO data | — | VERIFIED | TtcRouteProperties, TtcStationProperties, GoStationProperties, GoRouteProperties with correct ArcGIS field names |
| `lib/baseline/baseline-data.ts` | Async loader functions + TORONTO_VIEW constant | — | VERIFIED | 9 loader functions (loadTtcRoutes through loadStreetcarCorridors), TORONTO_VIEW at {-79.387, 43.653, zoom:11} |
| `public/data/ttc-routes.geojson` | Static TTC route geometry | — | VERIFIED | 5 features (Lines 1, 2, 4, 5, 6) from City of Toronto ArcGIS Layer 11 |
| `public/data/ttc-stations.geojson` | Static TTC station points | — | VERIFIED | 73 features from City of Toronto ArcGIS Layer 8 |
| `public/data/go-routes.geojson` | Static GO route geometry | — | VERIFIED | 7 hand-authored GO rail corridor LineStrings |
| `public/data/go-stations.geojson` | Static GO station points | — | VERIFIED | 19 features from City of Toronto ArcGIS Layer 7 |
| `public/data/neighbourhoods.geojson` | Toronto neighbourhood centroid points | — | VERIFIED | 26 features with `name` property |
| `public/data/landmarks.geojson` | Toronto landmark point features | — | VERIFIED | 12 features (CN Tower, Union Station, Rogers Centre, etc.) |
| `public/data/major-streets.geojson` | Major Toronto street line features | — | VERIFIED | 12 LineString features |
| `public/data/bus-corridors.geojson` | Major TTC bus corridor line features | — | VERIFIED | 13 features at real Toronto coordinates |
| `public/data/streetcar-corridors.geojson` | TTC streetcar route line features | — | VERIFIED | 8 features (501 Queen, 504 King, etc.) |
| `components/editor/top-toolbar.tsx` | Toolbar with Bus + Streetcar Corridors toggle button | — | VERIFIED | Button with correct label, aria-pressed, active/inactive color states |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `editor-shell.tsx` | `toronto-map.tsx` | `next/dynamic` with `ssr: false`, passed as `mapChildren` | WIRED | Line 13-30: dynamic import confirmed; line 71: `mapChildren={<TorontoMap busCorridorVisible={...} />}` |
| `toronto-map.tsx` | `ttc-layers.tsx` | `<TtcLayers` child inside `<Map>` | WIRED | Line 192: `<TtcLayers routes={data.ttcRoutes} stations={data.ttcStations} />` |
| `toronto-map.tsx` | `go-layers.tsx` | `<GoLayers` child inside `<Map>` | WIRED | Line 191: `<GoLayers routes={data.goRoutes} stations={data.goStations} />` |
| `ttc-layers.tsx` | `public/data/ttc-routes.geojson` | `loadTtcRoutes()` called in `useEffect` | WIRED | `loadTtcRoutes()` fetches `/data/ttc-routes.geojson`; result stored in `data.ttcRoutes` |
| `toronto-map.tsx` | `context-labels.tsx` | `<ContextLabels` child inside `<Map>` | WIRED | Line 181: `<ContextLabels neighbourhoods=... landmarks=... streets=... />` |
| `toronto-map.tsx` | `station-labels.tsx` | `<StationLabels` child inside `<Map>` | WIRED | Line 193: `<StationLabels ttcStations=... goStations=... />` |
| `top-toolbar.tsx` | `editor-shell.tsx` | `onCorridorToggle` callback dispatches `toggleCorridors` | WIRED | `editor-shell.tsx` line 70: `onCorridorToggle={() => dispatch({ type: "toggleCorridors" })}` |
| `editor-shell.tsx` | `toronto-map.tsx` | `busCorridorVisible` prop through `EditorFrame` | WIRED | Line 69: `busCorridorVisible={chrome.busCorridorVisible}`; line 71: `<TorontoMap busCorridorVisible={chrome.busCorridorVisible} />` |
| `toronto-map.tsx` | `corridor-layers.tsx` | `<CorridorLayers` with `visible` prop | WIRED | Line 186-190: `<CorridorLayers busCorridors=... streetcarCorridors=... visible={busCorridorVisible} />` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `toronto-map.tsx` | `data.ttcRoutes` | `loadTtcRoutes()` → `fetch("/data/ttc-routes.geojson")` → 5-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.ttcStations` | `loadTtcStations()` → `fetch("/data/ttc-stations.geojson")` → 73-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.goRoutes` | `loadGoRoutes()` → `fetch("/data/go-routes.geojson")` → 7-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.goStations` | `loadGoStations()` → `fetch("/data/go-stations.geojson")` → 19-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.neighbourhoods` | `loadNeighbourhoods()` → `fetch("/data/neighbourhoods.geojson")` → 26-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.landmarks` | `loadLandmarks()` → `fetch("/data/landmarks.geojson")` → 12-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.streets` | `loadMajorStreets()` → `fetch("/data/major-streets.geojson")` → 12-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.busCorridors` | `loadBusCorridors()` → `fetch("/data/bus-corridors.geojson")` → 13-feature FeatureCollection | Yes | FLOWING |
| `toronto-map.tsx` | `data.streetcarCorridors` | `loadStreetcarCorridors()` → `fetch("/data/streetcar-corridors.geojson")` → 8-feature FeatureCollection | Yes | FLOWING |
| `corridor-layers.tsx` | `visible` prop | Flows from `chrome.busCorridorVisible` via reducer → EditorShell → EditorFrame → TorontoMap | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compilation passes | `npm run typecheck` | Exit 0, no errors | PASS |
| ESLint passes | `npm run lint` | Exit 0, no warnings | PASS |
| Production build succeeds (SSR guard works) | `npm run build` | Compiled successfully, static pages generated | PASS |
| TTC routes GeoJSON has features | `node -e "JSON.parse(fs.readFileSync(...)).features.length"` | 5 features | PASS |
| TTC stations GeoJSON has features | node check | 73 features | PASS |
| GO stations GeoJSON has features | node check | 19 features | PASS |
| GO routes GeoJSON has features | node check | 7 features | PASS |
| Neighbourhood GeoJSON has >= 20 features | node check | 26 features | PASS |
| Landmarks GeoJSON has >= 8 features | node check | 12 features | PASS |
| Major streets GeoJSON has >= 10 features | node check | 12 features | PASS |
| Bus corridors GeoJSON loaded | node check | 13 features | PASS |
| Streetcar corridors GeoJSON loaded | node check | 8 features | PASS |
| Map tile loading with real basemap | Requires running server + API key | Not testable programmatically | SKIP |
| Hover tooltip renders on mouse over TTC station | Requires browser interaction | Not testable programmatically | SKIP |
| Corridor toggle visual state in browser | Requires browser observation | Not testable programmatically | SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| MAP-01 | 02-01-PLAN | User sees TTC rapid transit baseline on the map | SATISFIED | `ttc-layers.tsx` renders Lines 1/2/4/5/6 with filter expressions and brand colors; `ttc-stations.geojson` (73 stations) loaded and displayed |
| MAP-02 | 02-01-PLAN | User sees GO lines and stations as context only, not editable | SATISFIED | `go-layers.tsx` renders dashed/opacity-reduced layers; GO layers excluded from `interactiveLayerIds` in `toronto-map.tsx` |
| MAP-03 | 02-02-PLAN | User sees Toronto context labels for neighbourhoods, major streets, landmarks, and stations | SATISFIED | `context-labels.tsx` (neighbourhoods, streets, landmarks), `station-labels.tsx` (TTC + GO station names) all wired into `toronto-map.tsx` |
| MAP-04 | 02-03-PLAN | User can toggle major bus and streetcar corridor context on and off | SATISFIED | `corridor-layers.tsx` uses `layout.visibility` toggle; `busCorridorVisible` flows through reducer → EditorShell → EditorFrame → TorontoMap → CorridorLayers; toolbar button present with correct label and aria-pressed |

No orphaned requirements: all four MAP requirements declared in REQUIREMENTS.md Phase 2 traceability section are claimed by plans 02-01, 02-02, and 02-03 respectively, and all are implemented.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None detected | — | — | No stubs, placeholder returns, empty implementations, or TODO comments found in any key file |

The `map-stage-surface` CSS class in `globals.css` still contains the Phase 1 placeholder grid texture (background-image with linear-gradient), but this class is no longer applied when `mapChildren` is provided — `MapStage` renders children instead of the placeholder surface. This is not a blocker.

### Human Verification Required

#### 1. Map Rendering with MapTiler Tiles

**Test:** Set `NEXT_PUBLIC_MAPTILER_KEY` in `.env.local`, run `npm run dev`, visit `http://localhost:3000`
**Expected:** Map loads centered on Toronto at zoom 11 with the dataviz-light basemap; TTC Lines 1/2/4/5 appear in yellow/green/purple/orange (Line 6 in grey); GO rail corridors appear as dashed green lines visually subordinate to TTC; Phase 1 shell (toolbar, sidebar) intact
**Why human:** Tile rendering and visual layer hierarchy require browser observation with a valid API key

#### 2. Context Labels Legibility

**Test:** On the loaded map, pan across Toronto and observe label rendering
**Expected:** Neighbourhood names (LESLIEVILLE, THE ANNEX, SCARBOROUGH, etc.) appear in uppercase at roughly 70% opacity; landmark callouts (CN Tower, Union Station, Rogers Centre) appear in bolder styling; major street names (Yonge, Bloor, Queen, etc.) appear along the street lines at 50% opacity; no label type visually competes with the TTC transit lines
**Why human:** MapLibre symbol layer rendering depends on glyph availability in the tile style; visual hierarchy judgment requires direct observation

#### 3. TTC Station Hover Tooltip

**Test:** Hover the mouse over any TTC station dot
**Expected:** A Popup appears anchored at the bottom of the station dot showing `"{Station Name} — TTC"`; popup disappears on mouse-out
**Why human:** `MapLayerMouseEvent` behavior requires live browser interaction

#### 4. Corridor Toggle Interaction

**Test:** Click "Bus + Streetcar Corridors" button in the toolbar; click again
**Expected:** First click shows thin dashed orange corridor lines across the city (instant, no loading delay); button background changes to `--shell-accent`; second click hides corridors immediately; button returns to `--shell-secondary` background
**Why human:** Visual state change and instant-toggle behavior requires browser observation

#### 5. Overall Toronto-Native Feel

**Test:** Load the full map and evaluate subjectively whether it reads as Toronto
**Expected:** TTC lines are the dominant visual element; GO provides regional context without distraction; neighbourhood and landmark labels reinforce the Toronto-local character; the map does not feel like a generic transit diagram
**Why human:** Subjective product quality judgment per the phase goal ("feel unmistakably Toronto-native")

### Gaps Summary

No automated gaps detected. All 12 observable truths are verified at all four levels (existence, substance, wiring, data flow). All 4 requirements (MAP-01 through MAP-04) are satisfied by concrete implementations. TypeScript, ESLint, and production build all pass cleanly.

The only open items are 5 human-verification scenarios that require a running browser with a MapTiler API key — these are expected for a map-rendering phase and are not defects.

---

_Verified: 2026-03-31_
_Verifier: Claude (gsd-verifier)_
