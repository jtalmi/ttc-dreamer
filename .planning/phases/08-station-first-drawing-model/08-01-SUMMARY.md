---
phase: 08-station-first-drawing-model
plan: 01
subsystem: proposal-domain, sharing
tags: [tdd, station-first, data-model, migration, share-v2]
dependency_graph:
  requires: []
  provides: [station-first-drawing-model, v1-share-migration, deriveWaypointsFromStations]
  affects: [proposal-state, proposal-geometry, sharing, editor-shell, toronto-map]
tech_stack:
  added: [SharePayloadV1, SharePayloadV2, migrateV1toV2, deriveWaypointsFromStations, undoPlaceStation]
  patterns: [station-first-geometry, v1-to-v2-migration, session-tracked-station-ids]
key_files:
  created:
    - tests/sharing/v1-share-fixture.test.ts
  modified:
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/proposal/proposal-geometry.ts
    - lib/proposal/proposal-history.ts
    - lib/proposal/index.ts
    - lib/sharing/sharing-types.ts
    - lib/sharing/decode-proposal.ts
    - lib/sharing/encode-proposal.ts
    - lib/sharing/index.ts
    - tests/proposal/proposal-geometry.test.ts
    - tests/proposal/proposal-history.test.ts
    - tests/sharing/decode-proposal.test.ts
    - tests/sharing/encode-proposal.test.ts
    - vitest.config.ts
    - components/editor/editor-shell.tsx
    - components/editor/toronto-map.tsx
decisions:
  - "DrawingSession.waypoints replaced with placedStationIds: string[] — stations are the canonical geometry source"
  - "decodeSharePayload always returns SharePayloadV2 — v1 payloads migrated on decode via migrateV1toV2"
  - "finishDrawing requires 2+ placed stations; removes line and session stations if fewer"
  - "cancelDrawing removes all session-placed stations from draft, not just the line"
  - "vitest.config.ts updated to exclude .claude/worktrees to prevent parallel agent test conflicts"
metrics:
  duration: 14
  completed: "2026-04-01"
  tasks_completed: 1
  files_changed: 16
---

# Phase 08 Plan 01: Station-First Drawing Model Summary

Rewrote the drawing data model from waypoint-first to station-first, bumped share payload to v2 with full v1 migration, and added deriveWaypointsFromStations as the canonical geometry derivation helper.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| Step A (TDD RED) | Freeze v1 share fixture test | 128546c | tests/sharing/v1-share-fixture.test.ts |
| Task 1 (TDD GREEN) | Station-first rewrite + v2 share migration | 1738428 | 16 files |

## What Was Built

### Core Data Model Changes

**DrawingSession** (`lib/proposal/proposal-types.ts`):
- Replaced `waypoints: [number, number][]` with `placedStationIds: string[]`
- Each click during drawing creates a `ProposalStationDraft` and appends its ID to both `line.stationIds` and `session.placedStationIds`

**deriveWaypointsFromStations** (`lib/proposal/proposal-geometry.ts`):
- New helper: `deriveWaypointsFromStations(stationIds, stations): [number, number][]`
- Iterates stationIds in order, looks up each station by ID, returns their positions
- Skips missing station IDs silently
- Used by both `buildProposalLinesGeoJSON` and `buildInProgressGeoJSON`

**Geometry Helpers Updated**:
- `buildProposalLinesGeoJSON`: now filters lines with `stationIds.length >= 2` and derives coords via `deriveWaypointsFromStations`
- `buildInProgressGeoJSON`: new signature `(session, draft, lineColor)` — looks up station positions from `draft.stations` via `session.placedStationIds`

### Reducer Changes (`lib/proposal/proposal-state.ts`)

- `startDrawing`: now uses `placedStationIds: []` (or `[initialStationId]` for extend mode)
- `placeStation`: adds station ID to `session.placedStationIds` when a session is active for that line
- `finishDrawing`: calls `deriveWaypointsFromStations` to set `line.waypoints`; requires 2+ stations
- `cancelDrawing` / `setActiveTool`: removes all session-placed stations from draft before cleanup
- `undoPlaceStation`: new action — removes last station from session, draft.stations, and line.stationIds
- Removed `addWaypoint` action entirely

### Share Payload V2 (`lib/sharing/`)

- `sharing-types.ts`: Added `SharePayloadV1 { v: 1 }`, `SharePayloadV2 { v: 2 }`, union `SharePayload`
- `decode-proposal.ts`: `isValidSharePayload` now accepts v:1 and v:2; migrates v:1 via `migrateV1toV2`
- `migrateV1toV2`: for each line with waypoints but no stationIds, creates a station per waypoint
- `decodeSharePayload` return type changed to `SharePayloadV2 | null` (always returns v2 after migration)
- `encode-proposal.ts`: updated to accept `SharePayload | SharePayloadV2` union

### Frozen v1 Fixture

`tests/sharing/v1-share-fixture.test.ts` committed **before** any type changes per plan requirement. Contains hardcoded `V1_FIXTURE_ENCODED` base64 payload with 3-waypoint line and 1 station.

## Tests Added/Updated

- `tests/sharing/v1-share-fixture.test.ts` (new): 5 tests including v2 migration assertion
- `tests/proposal/proposal-geometry.test.ts` (updated): 36 tests — added `deriveWaypointsFromStations` suite, updated `buildProposalLinesGeoJSON` and `buildInProgressGeoJSON` for new API
- `tests/proposal/proposal-history.test.ts` (updated): added `undoPlaceStation` history tracking test
- `tests/sharing/decode-proposal.test.ts` (updated): added v2 payload tests, v1-to-v2 migration tests
- `tests/sharing/encode-proposal.test.ts` (updated): updated roundtrip tests to use v2 payloads

**Final test count: 137 tests across 9 test files — all pass**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript errors in editor-shell.tsx and toronto-map.tsx**
- **Found during:** Step D/G implementation
- **Issue:** `initialWaypoint` no longer exists in `StartDrawingAction` payload; `addWaypoint` removed from action union; `buildInProgressGeoJSON` needs `draft` parameter
- **Fix:** Removed `initialWaypoint` from `startDrawing` dispatch in `handleStartExtend`; removed `onAddWaypoint` prop pass-through from `editor-shell.tsx`; updated `buildInProgressGeoJSON` call in `toronto-map.tsx` to pass `draft`
- **Files modified:** `components/editor/editor-shell.tsx`, `components/editor/toronto-map.tsx`
- **Commit:** 1738428

**2. [Rule 3 - Blocking] encode-proposal.test.ts roundtrip tests expected v1 back after decode**
- **Found during:** GREEN phase
- **Issue:** The test encoded a v1 payload and expected `toEqual(v1Payload)`, but now decode always migrates to v2
- **Fix:** Updated test to use `SharePayloadV2` payloads directly; added new test for v1→v2 migration roundtrip
- **Files modified:** `tests/sharing/encode-proposal.test.ts`
- **Commit:** 1738428

**3. [Rule 3 - Blocking] Other parallel agent worktrees' test files scanned by vitest**
- **Found during:** Verification
- **Issue:** `vitest.config.ts` had no `exclude` pattern; vitest scanned `.claude/worktrees/` finding OLD test files from other agents (pre-migration)
- **Fix:** Added `exclude: [".claude/worktrees/**", "node_modules/**"]` to `vitest.config.ts`
- **Files modified:** `vitest.config.ts`
- **Commit:** 1738428

## Known Stubs

None — all tests verify real behavior. The `editor-shell.tsx` still passes `onAddWaypoint` prop to `TorontoMap` interface (prop exists in interface, just no longer dispatched), but map click handling for the draw-line tool's station placement will be wired in the follow-up UI plan (08-02).

## Self-Check

Files created/modified checked:
- `tests/sharing/v1-share-fixture.test.ts` — FOUND
- `lib/proposal/proposal-types.ts` — FOUND (contains `placedStationIds`)
- `lib/proposal/proposal-geometry.ts` — FOUND (contains `deriveWaypointsFromStations`)
- `lib/sharing/decode-proposal.ts` — FOUND (contains `migrateV1toV2`)
- `lib/sharing/sharing-types.ts` — FOUND (contains `SharePayloadV2`)

Commits verified:
- `128546c` — test(08-01): freeze v1 share payload fixture before type migration
- `1738428` — feat(08-01): station-first drawing model with v1-to-v2 share migration

## Self-Check: PASSED
