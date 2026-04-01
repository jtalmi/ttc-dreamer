---
phase: 03-editing-core
verified: 2026-03-31T23:11:00Z
status: passed
score: 14/14 must-haves verified
re_verification: true
previous_status: gaps_found
previous_score: 10/14
gaps_closed:
  - "EDIT-02: detectLineHitType wired in toronto-map.tsx handleClick; onStartExtend passed from editor-shell.tsx"
  - "EDIT-03: branch detection wired via same hitType check; drawMode='branch' + branchPoint forwarded to reducer"
  - "EDIT-06: waypointsGeoJSON useMemo + draggingWaypoint state + moveWaypoint dispatch on mousemove + proposal-waypoints-circle layer in ProposalLayers"
  - "EDIT-08: confirmInterchange now checks draft.stations for UUID match and merges lineIds rather than creating a duplicate station entity"
gaps_remaining: []
regressions: []
human_verification:
  - test: "Extend a TTC line from an endpoint"
    expected: "In draw-line mode, clicking near a TTC subway line endpoint starts extend mode; first waypoint placed exactly at the endpoint; resulting line carries parentLineId and isExtension=true"
    why_human: "Requires runtime map interaction with loaded TTC GeoJSON — cannot be triggered from a unit test"
  - test: "Branch a TTC line from a mid-segment"
    expected: "In draw-line mode, clicking on a TTC line mid-segment starts branch mode; first waypoint snaps to nearest segment point; resulting line carries parentLineId and branchPoint"
    why_human: "Same — requires live map interaction"
  - test: "Drag a waypoint vertex to adjust route geometry"
    expected: "In select mode, white vertex dots appear on committed proposal lines; dragging a dot updates line geometry live; releasing commits via moveWaypoint"
    why_human: "Requires rendered map with committed lines and mouse drag interaction"
  - test: "Interchange between two proposal lines produces a single shared station entity"
    expected: "Placing a station on line B near an existing proposal station on line A and confirming interchange results in one ProposalStationDraft with lineIds=[lineA.id, lineB.id]; both lines' stationIds reference the same station ID"
    why_human: "Logic verified by unit tests; visual confirmation of interchange badge placement and rendering requires runtime inspection"
---

# Phase 3: Editing Core Verification Report

**Phase Goal:** Build the complete editing loop — create/extend/branch lines with click-to-draw geometry, place stations manually with snapping, handle interchanges with user confirmation, support line naming/coloring, and provide undo/redo/delete.
**Verified:** 2026-03-31T23:11:00Z
**Status:** passed
**Re-verification:** Yes — after gap closure in plans 03-04, 03-05, 03-06

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | User can create a new subway, LRT, or BRT line via the sidebar panel and draw its route | ✓ VERIFIED | LineCreationPanel wired to addLine+startDrawing; handleClick dispatches addWaypoint; double-click dispatches finishDrawing |
| 2  | User can extend an existing TTC line from an endpoint by clicking near it | ✓ VERIFIED | detectLineHitType imported at line 36 and called at line 346 of toronto-map.tsx; onStartExtend dispatches addLine+startDrawing with isExtension=true |
| 3  | User can branch an existing TTC line by clicking on a mid-segment | ✓ VERIFIED | Same hitType check returns "branch"; drawMode="branch" + branchPoint forwarded via onStartExtend/handleStartExtend |
| 4  | User can build a multi-line proposal by adding multiple lines sequentially | ✓ VERIFIED | Each addLine+startDrawing cycle creates a new ProposalLineDraft; all lines persist in draft.lines |
| 5  | Baseline TTC infrastructure is not mutated by any editing action | ✓ VERIFIED | TTC data loaded separately into MapData, never enters ProposalDraft; reducer only modifies draft.lines and draft.stations |
| 6  | New proposal lines start with distinct default colors from rotating palette | ✓ VERIFIED | nextDefaultColor = DEFAULT_LINE_COLORS[draft.lines.length % 5] passed to LineCreationPanel |
| 7  | User can place a station on a proposed line by clicking with Add Station tool | ✓ VERIFIED | handleClick add-station: snapToSegment + placeStation dispatch + StationNamePopover |
| 8  | Station snaps to nearest point on segment within 12px threshold | ✓ VERIFIED | snapToSegment(lngLat, line.waypoints, map, 12) called in onClick |
| 9  | Interchange suggestion appears near existing stations; user can accept/reject | ✓ VERIFIED | findNearbyStation → suggestInterchange → InterchangeBadge with Yes/No + 8s auto-dismiss |
| 10 | Crossing lines that do not go through interchange flow are never auto-connected | ✓ VERIFIED | No auto-connect logic exists anywhere in the codebase |
| 11 | User can draw a route and adjust its geometry afterward | ✓ VERIFIED | waypointsGeoJSON useMemo builds vertex features in select mode; draggingWaypoint state set on proposal-waypoints-circle click; moveWaypoint dispatched on mousemove; proposal-waypoints-circle layer rendered in ProposalLayers |
| 12 | User can use shared stations across multiple lines | ✓ VERIFIED | confirmInterchange finds existingProposalStation by UUID match (line 428); merge path updates lineIds on existing station and stationIds on incoming line — no new station created; 8 unit tests pass confirming both merge and TTC baseline paths |
| 13 | User can rename and recolor lines; undo/redo/delete all work | ✓ VERIFIED | Inline editing in LineList, swatch picker, Cmd+Z / Cmd+Shift+Z keyboard handler, ConfirmationDialog on delete |
| 14 | Snap cue ring appears near snap targets | ✓ VERIFIED | buildSnapCueGeoJSON + setSnapPosition dispatch + ProposalLayers snap-cue-ring layer |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/proposal/proposal-types.ts` | TransitMode, DrawingSession, InterchangeSuggestion, extended types | ✓ VERIFIED | All types present |
| `lib/proposal/proposal-state.ts` | Full reducer with all Phase 3 actions including extend/branch payload and confirmInterchange merge | ✓ VERIFIED | AddLineAction has parentLineId/isExtension/branchPoint; confirmInterchange has merge path at line 428 |
| `lib/proposal/proposal-history.ts` | historyReducer, createInitialHistoryState | ✓ VERIFIED | Past/present/future with MAX_HISTORY=50 |
| `lib/proposal/proposal-geometry.ts` | All geometry helpers including detectLineHitType | ✓ VERIFIED | detectLineHitType exported, all helpers present |
| `lib/proposal/index.ts` | Barrel re-exports | ✓ VERIFIED | Exports all expected types and functions |
| `components/map/proposal-layers.tsx` | ProposalLayers with waypoint vertex layer | ✓ VERIFIED | proposal-waypoints Source + proposal-waypoints-circle Layer added |
| `components/editor/toronto-map.tsx` | Drawing handlers + extend/branch detection + waypoint drag | ✓ VERIFIED | detectLineHitType called at line 346; draggingWaypoint state; moveWaypoint dispatched on mousemove; proposal-waypoints-circle in interactiveLayerIds |
| `components/editor/editor-shell.tsx` | historyReducer + handleStartExtend + onStartExtend passed to TorontoMap | ✓ VERIFIED | handleStartExtend at line 73; onStartExtend={handleStartExtend} at line 291 |
| `tests/proposal/proposal-state-addline.test.ts` | TDD tests for extend/branch reducer behavior | ✓ VERIFIED | 4 tests pass: parentLineId, isExtension, branchPoint, undefined semantics |
| `tests/proposal-state-confirm-interchange.test.ts` | TDD tests for shared station merge | ✓ VERIFIED | 8 tests pass: merge path + TTC baseline path |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `editor-shell.tsx` | `proposal-history.ts` | `useReducer(historyReducer, ...)` | ✓ WIRED | Line 54-58 |
| `toronto-map.tsx` | `proposal-layers.tsx` | `<ProposalLayers waypointsGeoJSON={waypointsGeoJSON}>` | ✓ WIRED | Line 622-629 |
| `toronto-map.tsx` | `proposal-geometry.ts` | `detectLineHitType` in handleClick | ✓ WIRED | Imported at line 36; called at line 346 |
| `editor-shell.tsx` | `toronto-map.tsx` | `onStartExtend={handleStartExtend}` | ✓ WIRED | Line 291 |
| `toronto-map.tsx` | `proposal-state.ts` | `moveWaypoint` dispatch on mousemove when draggingWaypoint set | ✓ WIRED | Lines 261-269 |
| `proposal-layers.tsx` | (waypoint vertex layer) | `proposal-waypoints-circle` in interactiveLayerIds + handleClick | ✓ WIRED | Line 591 (interactiveLayerIds) + line 457 (click handler) |
| `proposal-state.ts` | confirmInterchange merge | UUID lookup in draft.stations | ✓ WIRED | Lines 428-456 |
| `line-creation-panel.tsx` | `proposal-state.ts` | dispatch addLine via onStartDrawing | ✓ WIRED | editor-shell.tsx handleStartDrawing |
| `toronto-map.tsx` | `proposal-state.ts` | onClick dispatches addWaypoint | ✓ WIRED | handleClick line 329 |
| `editor-shell.tsx` | `proposal-history.ts` | useEffect keydown dispatches undo/redo | ✓ WIRED | Lines 100-126 |
| `confirmation-dialog.tsx` | `proposal-state.ts` | onConfirm dispatches confirmDeletion | ✓ WIRED | editor-shell.tsx line 319 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `proposal-layers.tsx` | linesGeoJSON | buildProposalLinesGeoJSON(draft) via useMemo | Yes — from draft.lines populated by addLine+finishDrawing | ✓ FLOWING |
| `proposal-layers.tsx` | stationsGeoJSON | buildProposalStationsGeoJSON(draft) via useMemo | Yes — from draft.stations populated by placeStation/confirmInterchange | ✓ FLOWING |
| `proposal-layers.tsx` | waypointsGeoJSON | draft.lines.flatMap(waypoints) via useMemo when activeTool==="select" | Yes — from draft.lines populated by addWaypoint/moveWaypoint | ✓ FLOWING |
| `proposal-layers.tsx` | inProgressGeoJSON | buildInProgressGeoJSON(drawingSession, activeLineColor) via useMemo | Yes — from chrome.drawingSession populated by startDrawing/addWaypoint | ✓ FLOWING |
| `proposal-layers.tsx` | snapCueGeoJSON | buildSnapCueGeoJSON(snapPosition) via useMemo | Yes — from chrome.snapPosition set by setSnapPosition dispatch | ✓ FLOWING |
| `line-list.tsx` | lines prop | draft.lines from historyReducer state | Yes — populated by addLine reducer action | ✓ FLOWING |
| `confirmation-dialog.tsx` | message/labels | chrome.pendingDeletion via buildConfirmationProps() | Yes — set by deleteSelected reducer action | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript types compile | `npm run typecheck` | 0 errors | ✓ PASS |
| ESLint passes | `npm run lint` | 0 errors/warnings | ✓ PASS |
| Production build succeeds | `npm run build` | Compiled successfully in 1534ms | ✓ PASS |
| All 12 unit tests pass | `npm test` | 12/12 tests pass (2 test files) | ✓ PASS |
| detectLineHitType imported and called in toronto-map.tsx | grep check | Line 36: import; line 346: called with 20px threshold | ✓ PASS |
| moveWaypoint dispatched in toronto-map.tsx | grep check | Line 262: dispatch moveWaypoint on mousemove | ✓ PASS |
| proposal-waypoints-circle in interactiveLayerIds | grep check | Line 591 in toronto-map.tsx | ✓ PASS |
| existingProposalStation merge path in proposal-state.ts | grep check | Line 428: draft.stations.find lookup | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| EDIT-01 | 03-01-PLAN | User can create a new subway, LRT, or BRT line | ✓ SATISFIED | LineCreationPanel + addLine + startDrawing fully wired |
| EDIT-02 | 03-04 (gap closure) | User can extend an existing TTC line from an existing endpoint | ✓ SATISFIED | detectLineHitType called; hitType "extend-start"/"extend-end" → onStartExtend with mode="extend" |
| EDIT-03 | 03-04 (gap closure) | User can branch an existing TTC line | ✓ SATISFIED | hitType "branch" → onStartExtend with mode="branch" and branchPoint |
| EDIT-04 | 03-01-PLAN | User can build a multi-line proposal | ✓ SATISFIED | Multiple addLine dispatches accumulate in draft.lines |
| EDIT-05 | 03-01-PLAN | Existing TTC infrastructure stays fixed | ✓ SATISFIED | TTC data isolated in MapData, never in ProposalDraft |
| EDIT-06 | 03-05 (gap closure) | User can draw a route and then adjust its geometry | ✓ SATISFIED | waypointsGeoJSON + draggingWaypoint state + moveWaypoint dispatch on mousemove |
| EDIT-07 | 03-02-PLAN | User can place stations manually | ✓ SATISFIED | add-station click → snapToSegment → placeStation |
| EDIT-08 | 03-06 (gap closure) | User can use shared stations across multiple lines | ✓ SATISFIED | confirmInterchange merge path: single ProposalStationDraft with lineIds=[lineA, lineB]; confirmed by 5 unit tests |
| EDIT-09 | 03-02-PLAN | Crossing lines do not auto-connect unless user confirms interchange | ✓ SATISFIED | No auto-connect logic in codebase |
| EDIT-10 | 03-02-PLAN | When new station near existing one, app suggests interchange | ✓ SATISFIED | findNearbyStation → suggestInterchange → InterchangeBadge |
| EDIT-11 | 03-02-PLAN | Editing offers light snapping without forcing geometry | ✓ SATISFIED | snap cue ring rendered; snapToSegment returns null beyond 12px threshold |
| EDIT-12 | 03-03-PLAN | User can undo, redo, and delete editing actions | ✓ SATISFIED | historyReducer + Cmd+Z / Cmd+Shift+Z + ConfirmationDialog + confirmDeletion |
| STYLE-01 | 03-03-PLAN | User can name new lines | ✓ SATISFIED | LineCreationPanel name field + LineList inline edit → updateLineName |
| STYLE-02 | 03-03-PLAN | User can name new stations | ✓ SATISFIED | StationNamePopover → updateStationName |
| STYLE-03 | 03-03-PLAN | User can customize proposal line colors | ✓ SATISFIED | LineCreationPanel swatch grid + LineList color picker popover → updateLineColor |
| STYLE-04 | 03-01-PLAN | New proposal lines start with distinct default colors | ✓ SATISFIED | DEFAULT_LINE_COLORS[lines.length % 5] rotates colors |

### Anti-Patterns Found

None. The three previously flagged warning-level anti-patterns (dead `onStartExtend` prop, orphaned `detectLineHitType`, dead `moveWaypoint` reducer action) have all been resolved by gap closure plans 03-04 and 03-05.

### Human Verification Required

#### 1. Extend TTC Line from Endpoint

**Test:** In draw-line mode, click near (within ~20px screen distance) the endpoint of an existing TTC subway line.
**Expected:** The draw session starts in extend mode with the first waypoint placed at the TTC endpoint. The new line carries parentLineId and isExtension=true.
**Why human:** Requires runtime map interaction with loaded TTC GeoJSON data.

#### 2. Branch TTC Line from Mid-Segment

**Test:** In draw-line mode, click on the middle portion of a TTC line segment (not near either endpoint).
**Expected:** Branch mode activates; first waypoint snaps to the nearest mid-segment point; new line carries parentLineId and branchPoint.
**Why human:** Same — requires live map interaction.

#### 3. Waypoint Drag to Adjust Route Geometry

**Test:** Draw a proposal line, finish it, switch to select mode. White vertex dots should appear on the line. Click-drag a vertex.
**Expected:** The waypoint is draggable and the line geometry updates in real time. Mouse release ends the drag.
**Why human:** Requires rendered map with committed lines and mouse drag interaction.

#### 4. Shared Station Visual Confirmation

**Test:** Draw two proposal lines that cross. Place a station on line A. With add-station tool, click near that station on line B. Confirm interchange.
**Expected:** One station entity visible on the map with both line colors. No duplicate dot at the same location.
**Why human:** Reducer correctness is verified by unit tests; visual rendering of the merged station across two lines requires runtime inspection.

### Gaps Summary

All three previously identified gaps are now closed:

- **EDIT-02/03 (extend/branch):** `detectLineHitType` is imported at the top of `toronto-map.tsx` and called inside the `draw-line` `handleClick` path when no `drawingSession` is active. The result drives `onStartExtend`, which in `editor-shell.tsx` dispatches `addLine` with `parentLineId`/`isExtension`/`branchPoint` metadata followed by `startDrawing` with the correct `mode` and `initialWaypoint`. Four reducer unit tests confirm the payload forwarding.

- **EDIT-06 (waypoint drag):** `waypointsGeoJSON` is computed in a `useMemo` that produces Point features from `draft.lines` waypoints when `activeTool === "select"`. A `draggingWaypoint` state tracks `{lineId, waypointIndex}`. Clicks on `proposal-waypoints-circle` set this state; `onMouseMove` dispatches `moveWaypoint` while it is set; `onMouseUp` clears it. The layer is registered in `interactiveLayerIds` and rendered in `ProposalLayers`.

- **EDIT-08 (shared station merge):** `confirmInterchange` now checks `draft.stations` for a UUID match. On match, it spreads `suggestion.lineId` into the existing station's `lineIds` and adds the existing station's ID to the new line's `stationIds` — no new station entity is created. Eight unit tests cover both the merge path and the original TTC baseline path (which continues to create a new station with `linkedBaselineStationId`).

The build passes, TypeScript reports zero errors, ESLint reports zero warnings, and all 12 unit tests pass.

---

_Verified: 2026-03-31T23:11:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification: After gap closure in plans 03-04, 03-05, 03-06_
