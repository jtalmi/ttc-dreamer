---
phase: 08-station-first-drawing-model
verified: 2026-04-01T17:03:30Z
status: passed
score: 15/15 must-haves verified
re_verification: false
---

# Phase 08: Station-First Drawing Model Verification Report

**Phase Goal:** Users draw lines by clicking to place stations, with lines auto-connecting between consecutive stations and existing line termini acting as natural extension or branch points
**Verified:** 2026-04-01T17:03:30Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | DrawingSession tracks placedStationIds instead of waypoints | VERIFIED | `lib/proposal/proposal-types.ts` L34-40: `DrawingSession.placedStationIds: string[]`, `waypoints` field removed |
| 2 | Stations are the canonical geometry source; waypoints are derived | VERIFIED | `buildProposalLinesGeoJSON` calls `deriveWaypointsFromStations(l.stationIds, draft.stations)` at L48 |
| 3 | placeStation during a drawing session adds station to draft and session | VERIFIED | `proposal-state.ts` L539-543: `updatedSession` appends station ID to `session.placedStationIds` |
| 4 | Undo during a drawing session removes the last placed station | VERIFIED | `undoPlaceStation` case at L401-433; `editor-shell.tsx` L203: dispatches `undoPlaceStation` when session active |
| 5 | Existing v1 share links decode correctly into v2 format with station-per-waypoint migration | VERIFIED | `migrateV1toV2` in `decode-proposal.ts`; 5 fixture tests pass in `v1-share-fixture.test.ts` |
| 6 | finishDrawing derives waypoints from station positions and commits to line | VERIFIED | `proposal-state.ts` L438-441: `deriveWaypointsFromStations(session.placedStationIds, state.draft.stations)` |
| 7 | buildProposalLinesGeoJSON derives line coordinates from station positions | VERIFIED | `proposal-geometry.ts` L43-67: calls `deriveWaypointsFromStations`, filters on `stationIds.length >= 2` |
| 8 | buildInProgressGeoJSON uses station positions from session | VERIFIED | `proposal-geometry.ts` L110-142: takes `(session, draft, lineColor)`, looks up positions via `deriveWaypointsFromStations` |
| 9 | Clicking the map in draw mode places a station and the line auto-connects from the previous station | VERIFIED | `toronto-map.tsx` L352-412: active session branch dispatches `placeStation` with position |
| 10 | Clicking on an existing line segment in draw mode inserts a new station at that point | VERIFIED | `toronto-map.tsx` L516-592 (add-station tool): `snapToSegment` returns `segmentIndex`, passed as `insertAtIndex` to `placeStation` |
| 11 | Clicking on a line terminus starts an extension from that endpoint | VERIFIED | `toronto-map.tsx` L415-449: proposal terminus check dispatches `startDrawing` with `initialStationId` |
| 12 | Double-click places final station AND finishes drawing | VERIFIED | `toronto-map.tsx` L626-647: dispatches `placeStation` then `finishDrawing` |
| 13 | Ghost/preview line extends from last placed station position to cursor | VERIFIED | `buildInProgressGeoJSON` appends `cursorPosition` to coords at L122-124; `toronto-map.tsx` L201-203 wires it |
| 14 | Undo during session removes the last placed station via undoPlaceStation | VERIFIED | `editor-shell.tsx` L200-210: Cmd+Z during active session dispatches `undoPlaceStation` when `placedStationIds.length > 0` |
| 15 | Clicking empty map with no active session auto-creates a new line and places first station | VERIFIED | `toronto-map.tsx` L493-513: dispatches `addLine`, `startDrawing`, `placeStation` in sequence |

**Score:** 15/15 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tests/sharing/v1-share-fixture.test.ts` | Frozen v1 share payload roundtrip test | VERIFIED | Contains `V1_FIXTURE_ENCODED`, 5 tests all pass |
| `lib/proposal/proposal-types.ts` | DrawingSession with placedStationIds | VERIFIED | L34-40: `placedStationIds: string[]` |
| `lib/proposal/proposal-geometry.ts` | deriveWaypointsFromStations helper | VERIFIED | L17-30: exported function; used in `buildProposalLinesGeoJSON` and `buildInProgressGeoJSON` |
| `lib/sharing/sharing-types.ts` | SharePayloadV1 and SharePayloadV2 types | VERIFIED | L4-22: both types defined and union exported |
| `lib/sharing/decode-proposal.ts` | v1-to-v2 migration in decode | VERIFIED | L11-35: `migrateV1toV2` function; exported for tests |
| `components/editor/toronto-map.tsx` | Station-first click handlers for draw-line mode | VERIFIED | Dispatches `placeStation`, no `onAddWaypoint` prop |
| `components/editor/editor-shell.tsx` | Updated drawing flow wiring with station-first model | VERIFIED | Contains `undoPlaceStation`, `placedStationIds`, "Click to place stations" text |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `lib/proposal/proposal-geometry.ts` | `lib/proposal/proposal-types.ts` | `deriveWaypointsFromStations` uses `ProposalDraft` | WIRED | Function accepts `ProposalStationDraft[]`; called in both geometry builders |
| `lib/proposal/proposal-state.ts` | `lib/proposal/proposal-types.ts` | reducer uses `DrawingSession.placedStationIds` | WIRED | L378, L404, L407 reference `session.placedStationIds` |
| `lib/sharing/decode-proposal.ts` | `lib/sharing/sharing-types.ts` | decoder migrates v1 to v2 | WIRED | L1: imports `SharePayloadV1, SharePayloadV2`; `migrateV1toV2` returns `SharePayloadV2` |
| `components/editor/toronto-map.tsx` | `lib/proposal/proposal-state.ts` | dispatch placeStation action on map click | WIRED | L396-405: `dispatch({ type: "placeStation", payload: ... })` |
| `components/editor/toronto-map.tsx` | `lib/proposal/proposal-geometry.ts` | buildInProgressGeoJSON with draft parameter | WIRED | L202: `buildInProgressGeoJSON(drawingSession, draft ?? {...}, activeLineColor)` |
| `components/editor/editor-shell.tsx` | `lib/proposal/proposal-state.ts` | dispatch undoPlaceStation for undo during drawing | WIRED | L204: `dispatch({ type: "undoPlaceStation" })` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `components/editor/toronto-map.tsx` (inProgressGeoJSON) | `drawingSession`, `draft` | Props from `editor-shell.tsx`; draft from `useReducer` with `historyReducer` | Yes — `session.placedStationIds` populated by `placeStation` reducer, `draft.stations` is live state | FLOWING |
| `lib/proposal/proposal-geometry.ts` (buildProposalLinesGeoJSON) | `draft.lines`, `draft.stations` | `deriveWaypointsFromStations(l.stationIds, draft.stations)` | Yes — iterates live station array, not cached/static | FLOWING |
| `components/editor/editor-shell.tsx` (drawing-status panel) | `chrome.drawingSession.placedStationIds` | `useReducer` state; updated by `placeStation` reducer | Yes — live count displayed in "Finish Line (N stations)" button | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 5 phase-specific test suites pass | `npx vitest run tests/sharing/v1-share-fixture.test.ts tests/proposal/proposal-geometry.test.ts tests/proposal/proposal-history.test.ts tests/sharing/decode-proposal.test.ts tests/sharing/encode-proposal.test.ts` | 89 tests passed | PASS |
| Full test suite (137 tests) passes | `npx vitest run` | 9 files, 137 tests passed | PASS |
| TypeScript clean | `npm run typecheck` | 0 errors | PASS |
| Lint clean | `npm run lint` | 0 errors, 1 pre-existing warning | PASS |
| All acceptance criteria from both plans | grep checks on 14 patterns | All 14 PASS | PASS |
| All commits exist in git history | `git log 128546c 1738428 76b04b2` | All 3 commits found | PASS |
| setActiveTool auto-finishes drawing when 2+ stations (post-fix) | grep `auto-finish` in `proposal-state.ts` | Present at L280-305 | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| DRAW-01 | 08-01, 08-02 | User can click on the map to place a station; consecutive stations auto-connect via a line | SATISFIED | `toronto-map.tsx` auto-creates line + dispatches `placeStation` on empty-map click; `buildProposalLinesGeoJSON` derives line from station positions |
| DRAW-02 | 08-01, 08-02 | User can click on an existing line to insert a new station mid-line | SATISFIED | `add-station` tool in `toronto-map.tsx` uses `snapToSegment` + `insertAtIndex` on `placeStation` to splice station at correct position |
| DRAW-03 | 08-01, 08-02 | User can click on a line terminus to extend or branch that line | SATISFIED | `toronto-map.tsx` checks proposal terminus positions (L415-449) and TTC line hits (L452-491) before auto-create fallback; `startDrawing` with `initialStationId` |

All three requirements are marked complete in `REQUIREMENTS.md` and the implementation satisfies each.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `lib/sharing/decode-proposal.ts` | 1 | `SharePayload` imported but only referenced in JSDoc comment (lint warning) | Info | Pre-existing cosmetic issue; does not affect behavior |

No stub implementations, placeholder returns, or empty-data anti-patterns found in phase-touched files.

### Human Verification Required

User has already validated the UI in the browser per the prompt context. The following behaviors were confirmed working:

1. **New line from empty map (DRAW-01)** — clicking Draw tool then empty map creates a line and places stations with auto-connect
2. **Mid-line station insertion (DRAW-02)** — Add Station tool snaps to line segments and splices station at correct position
3. **Terminus extension (DRAW-03)** — clicking near a line's last station starts extend mode from that station
4. **Undo during drawing** — Cmd/Ctrl+Z removes last placed station and ghost line snaps back
5. **setActiveTool auto-finish** — switching tool with 2+ stations placed auto-commits the line (post-fix applied)
6. **Double-click finish** — places final station then commits the line

### Gaps Summary

No gaps. All 15 observable truths verified, all 7 required artifacts found at all four levels (exists, substantive, wired, data flowing), all 6 key links confirmed wired, all 3 requirements satisfied, 137 tests passing, typecheck clean.

The single lint warning (`SharePayload` imported but unused in `decode-proposal.ts`) is cosmetic and pre-exists the phase — it does not block the goal.

---

_Verified: 2026-04-01T17:03:30Z_
_Verifier: Claude (gsd-verifier)_
