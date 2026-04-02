---
phase: 09-station-drag-auto-interchange-and-sidebar-panels
plan: "01"
subsystem: proposal-state, toronto-map
tags: [station-drag, auto-interchange, reducer, geometry, throttle]
dependency_graph:
  requires: []
  provides: [moveStation-waypoint-rederivation, auto-interchange-placeStation]
  affects: [lib/proposal/proposal-state.ts, components/editor/toronto-map.tsx]
tech_stack:
  added: []
  patterns: [throttle-via-performance.now, mergeWithStationId, linkedBaselineStationId]
key_files:
  created:
    - tests/proposal/proposal-state-movestation.test.ts
    - tests/proposal/proposal-state-auto-interchange.test.ts
  modified:
    - lib/proposal/proposal-state.ts
    - components/editor/toronto-map.tsx
decisions:
  - "Auto-interchange fires via placeStation mergeWithStationId/linkedBaselineStationId fields instead of suggestInterchange+confirm/reject flow"
  - "InterchangeBadge JSX removed from toronto-map.tsx (no longer triggered); reducer cases kept for backward compat"
  - "Final moveStation dispatch fired on mouseup via lastDragPosition ref to ensure precise committed position after throttling"
  - "Throttle implemented with performance.now() refs (no setTimeout/rAF overhead)"
metrics:
  duration_seconds: 278
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_changed: 4
---

# Phase 09 Plan 01: Station Drag Waypoint Re-derivation and Auto-Interchange Summary

**One-liner:** moveStation reducer now re-derives connected line waypoints via deriveWaypointsFromStations; placeStation auto-interchanges (mergeWithStationId/linkedBaselineStationId) replacing the confirm/reject flow; drag throttled to 30ms.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix moveStation reducer + add auto-interchange to placeStation | efdb739 | lib/proposal/proposal-state.ts, tests/proposal/proposal-state-movestation.test.ts, tests/proposal/proposal-state-auto-interchange.test.ts |
| 2 | Wire throttled station drag and auto-interchange in toronto-map | fe2849c | components/editor/toronto-map.tsx |

## What Was Built

### Task 1: Reducer Changes

**moveStation** — The existing case only updated `station.position`. Now it also re-maps `state.draft.lines`, calling `deriveWaypointsFromStations(l.stationIds, updatedStations)` for every line whose `stationIds` includes the moved station. Lines not referencing the station are returned unchanged.

**placeStation** — Extended the `PlaceStationAction` payload with two optional fields:

- `mergeWithStationId?: string` — when present, adds `lineId` to the existing station's `lineIds`, splices/appends the existing station's id into the target line's `stationIds`, updates `drawingSession.placedStationIds`. No new station is created.
- `linkedBaselineStationId?: string` — when present, creates the new station as normal but sets the baseline link field on it.

### Task 2: toronto-map.tsx Changes

- Added `lastDragDispatch` (performance.now ref) and `lastDragPosition` (coordinate ref) to the component.
- `handleMouseMove`: station drag branch now guards with `now - lastDragDispatch.current < 30` before dispatching `moveStation`; always updates `lastDragPosition.current`.
- `handleMouseUp`: fires a final `moveStation` dispatch using `lastDragPosition.current` before clearing `draggingStationId`, ensuring the committed position is accurate despite throttling.
- **Draw-line session** (`handleClick`): replaced `suggestInterchange` dispatch with `placeStation` dispatches. Nearby proposal station → `mergeWithStationId`. Nearby TTC station → `linkedBaselineStationId`.
- **Add-station tool** (`handleClick`): same conversion — nearby proposal station → `mergeWithStationId`; nearby TTC → `linkedBaselineStationId`.
- **Auto-create-line** (empty draw-line click): checks nearby stations before placing first station on new line; applies auto-interchange if nearby.
- Removed `InterchangeBadge` JSX rendering (import commented out, handlers removed).

## Tests Added

| File | Tests | Coverage |
|------|-------|----------|
| tests/proposal/proposal-state-movestation.test.ts | 4 | position update, waypoint re-derivation, no-op for unrelated lines, shared station updates both lines |
| tests/proposal/proposal-state-auto-interchange.test.ts | 2 | linkedBaselineStationId set on new station, mergeWithStationId merges without creating new station |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all interchange logic is fully wired. The `pendingInterchangeSuggestion` prop on `TorontoMap` is kept for API compatibility (still passed by editor-shell) but produces no UI effect now that auto-interchange replaces the confirm/reject flow.

## Self-Check: PASSED

- lib/proposal/proposal-state.ts: FOUND
- tests/proposal/proposal-state-movestation.test.ts: FOUND
- tests/proposal/proposal-state-auto-interchange.test.ts: FOUND
- components/editor/toronto-map.tsx: FOUND
- Commit efdb739: FOUND
- Commit fe2849c: FOUND
