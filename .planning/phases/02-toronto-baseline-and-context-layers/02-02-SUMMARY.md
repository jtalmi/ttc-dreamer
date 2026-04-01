---
phase: 02-toronto-baseline-and-context-layers
plan: 02
subsystem: ui
tags: [maplibre, react-map-gl, geojson, toronto, context-labels, station-labels]

# Dependency graph
requires:
  - phase: 02-toronto-baseline-and-context-layers plan 01
    provides: TorontoMap component, TtcLayers, GoLayers, baseline data loaders, ttc-stations.geojson, go-stations.geojson

provides:
  - Toronto neighbourhood, landmark, and major street GeoJSON data in public/data/
  - ContextLabels component with street line, neighbourhood, and landmark symbol layers
  - StationLabels component with TTC and GO station name symbol layers
  - Station hover tooltip via react-map-gl Popup on TTC stations
  - Updated TorontoMap with correct 5-layer stacking order per UI-SPEC
  - Three new loader functions in lib/baseline (loadNeighbourhoods, loadLandmarks, loadMajorStreets)

affects: [03-layer-controls, 04-proposal-editing, any phase reading toronto-map.tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Context label layers (ContextLabels) render below transit layers for orientation without visual competition"
    - "Station labels (StationLabels) render above station circles as a separate component using Source with duplicate GeoJSON"
    - "TTC station name from PT_NAME field (not PLACE_NAME, which is null in ArcGIS data)"
    - "GO station name from PLACE_NAME field (with STATION as fallback)"
    - "Hover tooltip managed in TorontoMap via interactiveLayerIds + onMouseMove/onMouseLeave"

key-files:
  created:
    - public/data/neighbourhoods.geojson
    - public/data/landmarks.geojson
    - public/data/major-streets.geojson
    - components/map/context-labels.tsx
    - components/map/station-labels.tsx
  modified:
    - lib/baseline/baseline-data.ts
    - lib/baseline/index.ts
    - components/editor/toronto-map.tsx

key-decisions:
  - "TTC station labels use PT_NAME field — PLACE_NAME is null for all TTC station records in ArcGIS data"
  - "Hover tooltip shows station name and TTC/GO type only — PT_CONN_ROUTE contains bus/streetcar routes, not subway line numbers, so Line N format was not feasible without a separate station-to-line mapping"
  - "StationLabels receives the same FeatureCollection already loaded by TorontoMap — no extra fetch needed"
  - "interactiveLayerIds uses ttc-stations-circle (the layer id from TtcLayers) for hover detection"

patterns-established:
  - "Layer stacking order in TorontoMap: ContextLabels → GoLayers → TtcLayers → StationLabels → Popup"
  - "Open Sans Semibold + Arial Unicode MS Bold as font fallback chain for semibold label layers"
  - "Open Sans Regular + Arial Unicode MS Regular as font fallback chain for regular label layers"

requirements-completed: [MAP-03]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 02 Plan 02: Toronto Context Labels Summary

**MapLibre symbol layers for neighbourhood, landmark, street, and station labels with TTC station hover tooltip, wired into TorontoMap in correct stacking order**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T03:33:04Z
- **Completed:** 2026-04-01T03:37:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Created 26 Toronto neighbourhood centroids, 12 landmark points, and 12 major street LineStrings as hand-authored GeoJSON
- Built ContextLabels component rendering street lines + name labels, neighbourhood uppercase labels, and landmark callouts per UI-SPEC typography rules
- Built StationLabels component rendering TTC (PT_NAME) and GO (PLACE_NAME) station name labels above station dots
- Added hover tooltip to TorontoMap via react-map-gl Popup on TTC station circles
- Wired all 7 data sources into TorontoMap with correct 5-layer stacking order

## Task Commits

Each task was committed atomically:

1. **Task 1: Create neighbourhood, landmark, and major street GeoJSON data and context label layer component** - `a8a4bfb` (feat)
2. **Task 2: Add TTC and GO station label layers, hover tooltips, and wire all label layers into TorontoMap** - `2e7f25f` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified

- `public/data/neighbourhoods.geojson` - 26 Toronto neighbourhood centroid points for label placement
- `public/data/landmarks.geojson` - 12 Toronto landmark points (CN Tower, Union Station, ROM, etc.)
- `public/data/major-streets.geojson` - 12 major Toronto street LineStrings (Yonge, Bloor, Queen, etc.)
- `components/map/context-labels.tsx` - ContextLabels: street line + symbol layers, neighbourhood labels, landmark callouts
- `components/map/station-labels.tsx` - StationLabels: TTC and GO station name symbol layers
- `lib/baseline/baseline-data.ts` - Added loadNeighbourhoods, loadLandmarks, loadMajorStreets loaders
- `lib/baseline/index.ts` - Added new loaders to barrel export
- `components/editor/toronto-map.tsx` - Loads 7 data sources, renders in stacking order, adds hover tooltip

## Decisions Made

- **TTC station name field is PT_NAME, not PLACE_NAME.** The ArcGIS data has PLACE_NAME as null for all TTC subway station records. PT_NAME contains the station name in uppercase (e.g., "EGLINTON"). Used `coalesce` expression in MapLibre to fall back gracefully.
- **Tooltip shows station name + "TTC" rather than "Line N".** PT_CONN_ROUTE contains bus/streetcar connecting routes (not subway line numbers), so building `"Line N"` format would require a separate station-to-line mapping table. Deferred to a future plan where line assignment data is available.
- **GO stations not interactive per UI-SPEC.** The UI-SPEC specifies GO layers have pointer-events disabled. Only TTC stations are added to `interactiveLayerIds`.

## Deviations from Plan

None - plan executed exactly as written, with one minor implementation detail adjustment (tooltip format simplified due to data constraints — documented in Decisions Made above).

## Issues Encountered

None.

## Known Stubs

None — all label layers are wired to real GeoJSON data sources.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All context label layers are rendering; Plan 03 (bus/streetcar overlay toggle) can now add toggle controls on top of the existing layer structure
- ContextLabels, StationLabels, and TorontoMap are all in their final stacking positions per UI-SPEC
- The `interactiveLayerIds` pattern is established for future interactive layer additions in the editor phase

---
*Phase: 02-toronto-baseline-and-context-layers*
*Completed: 2026-04-01*
