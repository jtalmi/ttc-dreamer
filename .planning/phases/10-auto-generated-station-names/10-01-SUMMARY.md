---
phase: 10-auto-generated-station-names
plan: 01
subsystem: ui
tags: [geocoding, nominatim, reverse-geocode, station-naming, toronto-map]

# Dependency graph
requires:
  - phase: 08-station-first-drawing-model
    provides: placeStation action and StationNamePopover with useEffect defaultName sync
provides:
  - Nominatim reverse geocoding utility with in-memory cache and street abbreviation
  - Auto-suggested street-based station names in all 4 placement paths
affects:
  - station-naming, proposal-sharing, station-inspector

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fire-and-forget async geocode after synchronous station placement; update via setState functional updater"
    - "useCallback-wrapped geocode helper for stable reference in dependency arrays"
    - "Module-level Map cache keyed by rounded 4-decimal coordinate (11m precision)"

key-files:
  created:
    - lib/geocoding/reverse-geocode.ts
    - tests/geocoding/reverse-geocode.test.ts
  modified:
    - components/editor/toronto-map.tsx

key-decisions:
  - "fireGeocodeUpdate wrapped in useCallback (not plain function) to avoid react-hooks/exhaustive-deps errors in handleClick and handleDblClick"
  - "4-decimal rounding for cache key gives ~11m precision, matching station snapping threshold"
  - "Cross-street detection uses Nominatim address.pedestrian field (sometimes populated for intersections)"

patterns-established:
  - "Pattern: Geocode utility exports clearGeocodeCache() for test isolation — keep for all future caching utilities"
  - "Pattern: Functional setPendingStationName updater checks stationId equality before applying update to avoid stale closures"

requirements-completed: [STATION-02, STATION-03]

# Metrics
duration: 10min
completed: 2026-04-02
---

# Phase 10 Plan 01: Auto-Generated Station Names Summary

**Nominatim reverse geocoding wired into all 4 station placement paths; popover shows street-based name (e.g. "King St W & Spadina Ave") replacing "Station N" placeholder within ~1s**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-02T04:47:00Z
- **Completed:** 2026-04-02T04:50:22Z
- **Tasks:** 2 (Task 3 is a human-verify checkpoint — not yet executed)
- **Files modified:** 3

## Accomplishments
- Created `lib/geocoding/reverse-geocode.ts` with full Nominatim integration: URL, User-Agent header, 3s AbortSignal timeout, JSON parsing, street abbreviation, intersection detection, and in-memory coordinate cache
- 10 vitest tests covering all behaviour: road name, intersection, suburb fallback, neighbourhood fallback, network error, non-200, cache hit, abbreviation, non-suffix-word safety
- Wired `fireGeocodeUpdate` into all 4 "Station N" fallback paths in toronto-map.tsx: draw-line active session, auto-create-new-line, add-station tool, and double-click finish (which now also shows the name popover)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create reverse geocoding utility with Nominatim integration and tests** - `69c2e93` (feat)
2. **Task 2: Wire reverse geocoder into station placement paths in toronto-map.tsx** - `b5100b0` (feat)

_Note: Task 1 used TDD (RED tests first, then GREEN implementation)_

## Files Created/Modified
- `lib/geocoding/reverse-geocode.ts` - Nominatim reverse geocoding with cache, abbreviation, and null-safe fallback
- `tests/geocoding/reverse-geocode.test.ts` - 10 unit tests for reverseGeocode and clearGeocodeCache
- `components/editor/toronto-map.tsx` - Added reverseGeocode import, fireGeocodeUpdate callback, and 4 geocode call sites

## Decisions Made
- `fireGeocodeUpdate` wrapped in `useCallback` (not a plain function) to provide a stable reference for `handleClick` and `handleDblClick` dependency arrays — required to satisfy React Compiler and react-hooks/exhaustive-deps
- Double-click path now shows `setPendingStationName` + geocode before `finishDrawing` dispatch — this was documented in the plan as a missing feature in that path
- Cache uses 4-decimal rounding (~11m precision), matching station snap threshold

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] useCallback dependency array update required for fireGeocodeUpdate**
- **Found during:** Task 2 (lint verification)
- **Issue:** Plain `function fireGeocodeUpdate` caused react-hooks/exhaustive-deps warning and React Compiler error — the function was not stable and couldn't be included in dependency arrays
- **Fix:** Converted to `useCallback` with `[dispatch]` dependency; added `fireGeocodeUpdate` to `handleClick` and `handleDblClick` dep arrays
- **Files modified:** components/editor/toronto-map.tsx
- **Verification:** `npm run lint` passes with only the pre-existing `decode-proposal.ts` warning
- **Committed in:** b5100b0 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — stability of function reference)
**Impact on plan:** Essential for correctness — no scope creep.

## Issues Encountered
- Cache test initially used coordinates that differ at 4 decimals (`-79.3832` vs `-79.3831`), causing the cache to miss. Fixed test to use coordinates that round to the same key (e.g. `-79.38321` and `-79.38324` both round to `-79.3832`).

## Known Stubs
None — geocoding is wired end-to-end. Fallback to "Station N" when geocoder returns null is intentional behaviour, not a stub.

## User Setup Required
None - no external service configuration required. Nominatim is a free public API requiring no API key. The User-Agent header "TorontoTransitSandbox/1.0" is included per Nominatim usage policy.

## Next Phase Readiness
- Auto-generated station names ready for human verification (Task 3 checkpoint)
- All existing station placement behaviours (interchange, baseline linking, drawing) continue working
- TypeScript and lint pass cleanly

## Self-Check: PASSED
- lib/geocoding/reverse-geocode.ts: FOUND
- tests/geocoding/reverse-geocode.test.ts: FOUND
- 10-01-SUMMARY.md: FOUND
- Commit 69c2e93 (Task 1): FOUND
- Commit b5100b0 (Task 2): FOUND

---
*Phase: 10-auto-generated-station-names*
*Completed: 2026-04-02*
