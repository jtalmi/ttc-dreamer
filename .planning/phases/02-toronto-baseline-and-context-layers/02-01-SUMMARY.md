---
phase: 02-toronto-baseline-and-context-layers
plan: 01
subsystem: ui
tags: [maplibre-gl, react-map-gl, geojson, ttc, go-transit, toronto, map-layers]

# Dependency graph
requires:
  - phase: 01-editor-shell-and-proposal-state
    provides: EditorFrame mapChildren slot, MapStage children slot, CSS design tokens, EditorShell useReducer pattern
provides:
  - Live MapLibre GL map replacing Phase 1 placeholder in the editor canvas
  - TTC rapid transit lines (Lines 1/2/4/5/6) with canonical brand colors
  - TTC station circles (white dots, line-colored borders)
  - GO Transit rail corridors as dashed, 75%-opacity context layer
  - GO station markers (non-interactive)
  - Static GeoJSON data files for TTC routes (5), TTC stations (73), GO stations (19), GO routes (7)
  - lib/baseline module with TypeScript types and async fetch loaders
  - Phase 2 map layer CSS tokens in globals.css
  - .env.local.example documenting MapTiler key requirement
affects:
  - 02-toronto-baseline-and-context-layers-plan-02 (neighbourhood labels, context toggles)
  - 02-toronto-baseline-and-context-layers-plan-03 (bus/streetcar corridor toggle)
  - 03-proposal-editing (map layers will need interactive behavior wired)

# Tech tracking
tech-stack:
  added:
    - react-map-gl@8.1.0
    - maplibre-gl@5.21.1
  patterns:
    - next/dynamic with ssr:false guards MapLibre from window-is-undefined SSR errors
    - Source+Layer declarative composition inside Map component for GeoJSON layers
    - Layer filter expressions using ["==", ["get", "ROUTE_ID"], N] for per-line coloring
    - GoLayers excluded from interactiveLayerIds pattern for non-interactive context layers
    - Static GeoJSON in public/data/ fetched by loader functions in lib/baseline/
    - EditorShell passes map component via mapChildren prop to EditorFrame

key-files:
  created:
    - components/editor/toronto-map.tsx
    - components/map/ttc-layers.tsx
    - components/map/go-layers.tsx
    - lib/baseline/baseline-types.ts
    - lib/baseline/baseline-data.ts
    - lib/baseline/index.ts
    - public/data/ttc-routes.geojson
    - public/data/ttc-stations.geojson
    - public/data/go-stations.geojson
    - public/data/go-routes.geojson
    - .env.local.example
  modified:
    - app/globals.css
    - components/editor/editor-shell.tsx
    - .gitignore
    - package.json
    - package-lock.json

key-decisions:
  - "MapLibre GL via react-map-gl/maplibre is the map renderer; next/dynamic with ssr:false is the SSR guard"
  - "City of Toronto ArcGIS GeoJSON endpoints used for TTC data; GO routes hand-authored with station coordinate anchors"
  - "TTC station data from ArcGIS does not include ROUTE_ID so stations use a uniform dark border color (#18324A)"
  - "Line 6 (Finch West) is included in the data fetched from ArcGIS alongside Lines 1/2/4/5"
  - "Fallback map style uses maplibre.org demo tiles when NEXT_PUBLIC_MAPTILER_KEY is unset"
  - ".gitignore updated to allow .env.local.example via !.env.local.example negation rule"

patterns-established:
  - "Map layer components (TtcLayers, GoLayers) accept FeatureCollection props and render Source+Layer pairs"
  - "lib/baseline barrel index.ts is the single import target for all baseline types and loaders"
  - "TORONTO_VIEW constant in baseline-data.ts centralizes the default map viewport"

requirements-completed: [MAP-01, MAP-02]

# Metrics
duration: 16min
completed: 2026-04-01
---

# Phase 2 Plan 01: Toronto Baseline and Context Layers Summary

**MapLibre GL map with TTC Lines 1/2/4/5/6 in brand colors and GO Transit dashed context layer, loaded from City of Toronto ArcGIS GeoJSON**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-01T03:12:46Z
- **Completed:** 2026-04-01T03:29:29Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- TTC rapid transit lines (Lines 1, 2, 4, 5, 6) render with canonical brand colors on a MapLibre GL map
- GO Transit rail corridors render as dashed green lines at 75% opacity — visually subordinate, non-interactive
- Phase 1 placeholder grid completely replaced by live interactive map
- Build succeeds with no SSR errors (window-is-undefined guard via next/dynamic ssr:false)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install map dependencies, create baseline data infrastructure, and commit static GeoJSON** - `aded1e2` (feat)
2. **Task 2: Create TorontoMap component with TTC and GO layers and wire into EditorShell** - `43d5102` (feat)

**Plan metadata:** (committed after SUMMARY creation)

## Files Created/Modified

- `components/editor/toronto-map.tsx` - Main map component: loads GeoJSON on mount, renders Map with TTC/GO layers
- `components/map/ttc-layers.tsx` - TtcLayers: Source+Layer pairs for 5 TTC lines with per-line filter expressions
- `components/map/go-layers.tsx` - GoLayers: dashed GO corridor lines and station markers, non-interactive
- `lib/baseline/baseline-types.ts` - TypeScript types for TTC route, TTC station, GO station, GO route features
- `lib/baseline/baseline-data.ts` - Async loaders for all four GeoJSON files; TORONTO_VIEW constant
- `lib/baseline/index.ts` - Barrel re-export for all baseline types and functions
- `public/data/ttc-routes.geojson` - 5 TTC rapid transit routes from City of Toronto ArcGIS Layer 11
- `public/data/ttc-stations.geojson` - 73 TTC subway stations from City of Toronto ArcGIS Layer 8
- `public/data/go-stations.geojson` - 19 GO train stations from City of Toronto ArcGIS Layer 7
- `public/data/go-routes.geojson` - 7 hand-authored GO rail corridor lines using GO station coordinates
- `.env.local.example` - Documents NEXT_PUBLIC_MAPTILER_KEY requirement
- `app/globals.css` - Added Phase 2 map layer tokens (13 new CSS custom properties)
- `components/editor/editor-shell.tsx` - Added dynamic import of TorontoMap, passed as mapChildren prop
- `.gitignore` - Added !.env.local.example negation to allow the example file to be committed

## Decisions Made

- **Line 6 (Finch West) included:** ArcGIS data returned 5 routes — Lines 1, 2, 4, 5, and 6 (Finch West LRT). The plan mentioned Lines 1, 2, 4, 5. Line 6 is included with a grey (#808080) color since it is a real TTC line in the data.
- **TTC station stroke color fixed:** ArcGIS station data does not include ROUTE_ID, so the plan's data-driven stroke expression is not feasible. Used `#18324A` (shell-secondary) as the uniform border color.
- **Fallback map style:** When NEXT_PUBLIC_MAPTILER_KEY is unset, the component falls back to maplibre.org demo tiles so the map canvas still renders and layers are visible.
- **.gitignore exception:** The .env* pattern blocked committing .env.local.example. Added !.env.local.example negation rule.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed line-join from paint block**
- **Found during:** Task 2 (TtcLayers creation)
- **Issue:** Initial draft put `"line-join": "round"` in the `paint` object; TypeScript caught this as invalid — `line-join` belongs in `layout`
- **Fix:** Moved `line-join` to the `layout` object only; `paint` now contains only `line-color` and `line-width`
- **Files modified:** components/map/ttc-layers.tsx
- **Verification:** `npm run typecheck` passes
- **Committed in:** 43d5102 (Task 2 commit)

**2. [Rule 3 - Blocking] Updated .gitignore to allow .env.local.example**
- **Found during:** Task 1 (staging files for commit)
- **Issue:** `.env*` glob in .gitignore blocked `git add .env.local.example`
- **Fix:** Added `!.env.local.example` negation rule to .gitignore
- **Files modified:** .gitignore
- **Verification:** File tracked and committed successfully
- **Committed in:** aded1e2 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 blocking)
**Impact on plan:** Both auto-fixes required for correctness and task completion. No scope creep.

## Issues Encountered

- ArcGIS Layer 11 returned Route 6 (Finch West) in addition to the planned Lines 1/2/4/5. Included it with grey color since it is valid TTC data.
- ArcGIS station data does not include ROUTE_ID per-station, making the planned data-driven stroke color expression infeasible. Used uniform dark border instead.

## User Setup Required

**External service requires manual configuration.**

To see MapTiler basemap tiles:
1. Create a free account at https://cloud.maptiler.com
2. Go to Account → API Keys → copy your default key
3. Create `.env.local` in the project root with:
   ```
   NEXT_PUBLIC_MAPTILER_KEY=your_key_here
   ```
4. Run `npm run dev` and visit http://localhost:3000

Without the key, the map canvas renders using MapLibre demo tiles — the TTC and GO layers are still visible but the basemap will be minimal.

## Next Phase Readiness

- Interactive map canvas is live and ready for neighbourhood/landmark label layers (Plan 02)
- TTC and GO layer components accept FeatureCollection props, ready to swap datasets for baseline mode switching
- lib/baseline module provides a clean foundation for future data loading patterns
- No blockers for Plan 02 execution

---
*Phase: 02-toronto-baseline-and-context-layers*
*Completed: 2026-04-01*
