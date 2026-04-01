---
phase: 06-baseline-data-correction
plan: 01
subsystem: data
tags: [geojson, ttc, baseline, routes, stations, typescript]

# Dependency graph
requires: []
provides:
  - Route GeoJSON files with status property on all features
  - Ontario Line (ROUTE_ID 7) added to future baseline as under_construction LineString
  - Line 5 ROUTE_COLOR corrected to E77817 (official TTC orange)
  - Line 6 ROUTE_COLOR corrected to 969594 (official TTC operational grey)
  - Scarborough RT (Line 3) stations removed from today baseline
  - TtcRouteProperties type extended with optional status field
affects: [06-02, ttc-layers, baseline-types, map-styling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Status property schema: route features carry status: operational | under_construction"
    - "Ontario Line geometry: hand-authored LineString with 57 coords, ~3-4 intermediate points per station pair"

key-files:
  created: []
  modified:
    - public/data/ttc-routes.geojson
    - public/data/ttc-routes-future.geojson
    - public/data/ttc-stations.geojson
    - lib/baseline/baseline-types.ts

key-decisions:
  - "Ontario Line geometry hand-authored with 57 coordinate points (15 stations + ~3 intermediate points per segment) for smooth visual at zoom 11"
  - "Status property is optional in TtcRouteProperties to avoid breaking existing callers without status"
  - "Stations file reformatted from minified JSON to 2-space indented for readability"

patterns-established:
  - "Pattern 1: All route features carry status property (operational | under_construction) for layer filtering"
  - "Pattern 2: Ontario Line (ROUTE_ID 7) exists only in future baseline, never in today baseline"

requirements-completed: [BASE-01, BASE-02, BASE-03]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 06 Plan 01: Baseline Data Correction Summary

**Status property added to all TTC route features, Line 5/6 colors corrected to official TTC values, Ontario Line hand-authored into future baseline, and 5 decommissioned Scarborough RT stations removed from today baseline**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-01T21:19:00Z
- **Completed:** 2026-04-01T21:23:54Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added `status: "operational"` to all 5 route features in both route GeoJSON files
- Fixed Line 5 ROUTE_COLOR from placeholder `FF8000` to official TTC orange `E77817`
- Fixed Line 6 ROUTE_COLOR from construction grey `808080` to operational grey `969594`
- Added Ontario Line as ROUTE_ID 7 feature in ttc-routes-future.geojson (57-coord LineString, status: under_construction)
- Removed 5 Scarborough RT stations (Line 3 decommissioned March 2023) from ttc-stations.geojson (73 -> 68 features)
- Added `status?: "operational" | "under_construction"` to TtcRouteProperties in baseline-types.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Add status property to route GeoJSON files, fix colors, add Ontario Line** - `5f272df` (feat)
2. **Task 2: Remove Scarborough RT stations and update TtcRouteProperties type** - `fd7ee01` (feat)

**Plan metadata:** (docs commit forthcoming)

## Files Created/Modified
- `public/data/ttc-routes.geojson` - Added status: operational to all 5 features; fixed Line 5/6 colors
- `public/data/ttc-routes-future.geojson` - Same fixes + new Ontario Line feature (ROUTE_ID 7, LineString, 57 coords)
- `public/data/ttc-stations.geojson` - Removed 5 Scarborough RT stations; file reformatted to 2-space indent
- `lib/baseline/baseline-types.ts` - Added `status?: "operational" | "under_construction"` to TtcRouteProperties

## Decisions Made
- Hand-authored Ontario Line with 57 coordinates (15 station points + ~3 intermediate points per segment). No official GTFS/ArcGIS source for this under-construction line.
- Status field optional in TtcRouteProperties — existing code reading features without status field continues to work.
- Stations file reformatted from minified single-line JSON to 2-space indented for maintainability.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All verifications passed on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Route GeoJSON files now carry status property — Plan 02 can filter by status for visual differentiation (dashed Ontario Line, solid operational lines)
- Ontario Line geometry is in place in the future baseline, ready for ttc-layers.tsx to add a dashed line layer
- 68 stations in today baseline (clean, no decommissioned stations)
- TypeScript type updated — Plan 02 layer code can reference `status` property without type errors

---
*Phase: 06-baseline-data-correction*
*Completed: 2026-04-01*
