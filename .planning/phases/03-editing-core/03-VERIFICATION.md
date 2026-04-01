---
phase: 03-editing-core
verified: 2026-03-31T00:00:00Z
status: gaps_found
score: 10/14 must-haves verified
re_verification: false
gaps:
  - truth: "User can extend an existing TTC line from an endpoint by clicking near it in draw-line mode"
    status: failed
    reason: "detectLineHitType geometry helper exists and is exported, but is never called from toronto-map.tsx onClick. The onStartExtend prop is declared but never passed from editor-shell.tsx. No reducer action sets parentLineId or isExtension on any line."
    artifacts:
      - path: "components/editor/toronto-map.tsx"
        issue: "handleClick for draw-line mode calls onAddWaypoint immediately without checking for TTC line proximity via detectLineHitType. detectLineHitType is not imported."
      - path: "components/editor/editor-shell.tsx"
        issue: "onStartExtend prop is never passed to TorontoMap. No handler for the extend flow exists."
    missing:
      - "Import detectLineHitType in toronto-map.tsx"
      - "In handleClick for draw-line mode: when no active drawingSession, check all TTC routes with detectLineHitType before falling through to addWaypoint"
      - "Pass onStartExtend callback from editor-shell to TorontoMap that dispatches addLine + startDrawing with mode=extend and sets parentLineId"

  - truth: "User can branch an existing TTC line by clicking on a mid-segment in draw-line mode"
    status: failed
    reason: "Same root cause as EDIT-02. detectLineHitType returns 'branch' for mid-segment clicks but is never called. No UI path sets mode='branch' or branchPoint on any line."
    artifacts:
      - path: "components/editor/toronto-map.tsx"
        issue: "draw-line onClick has no branch detection logic at all"
    missing:
      - "Wire detectLineHitType result 'branch' case into the extend/branch dispatch flow"
      - "Dispatch startDrawing with mode='branch' and set branchPoint on the new line"

  - truth: "User can draw a route and adjust its geometry afterward (EDIT-06)"
    status: failed
    reason: "moveWaypoint action exists in the reducer and is correctly tracked in HISTORY_ACTIONS, but is never dispatched from any component. Neither drag-based nor two-click waypoint repositioning is wired in toronto-map.tsx. Only the initial drawing is possible — post-hoc geometry adjustment is not available."
    artifacts:
      - path: "components/editor/toronto-map.tsx"
        issue: "No vertex layer, no waypoint drag tracking, no moveWaypoint dispatch. The select tool only handles proposal lines and station circles via interactiveLayerIds — waypoints are not interactive."
    missing:
      - "Add a proposal waypoint vertex layer to ProposalLayers for selection in select mode"
      - "Wire onMouseDown + drag tracking for waypoints in toronto-map.tsx select mode"
      - "Dispatch moveWaypoint on drag release with the correct lineId, waypointIndex, and new position"

  - truth: "User can use shared stations across multiple lines (EDIT-08)"
    status: partial
    reason: "The data model supports shared stations via lineIds array. However, confirmInterchange creates a new station with lineIds=[suggestion.lineId] and only sets linkedBaselineStationId — it does not merge into an existing proposal station's lineIds. Two proposal lines near each other cannot share a single station entity through the interchange flow; they create separate stations with link pointers. The requirement 'shared stations across multiple lines' implies a single station entity on multiple lines."
    artifacts:
      - path: "lib/proposal/proposal-state.ts"
        issue: "confirmInterchange case creates new station with lineIds: [suggestion.lineId] instead of merging into the existing nearby proposal station's lineIds array when nearbyStationId refers to a proposal station (not TTC)"
    missing:
      - "In confirmInterchange: check if nearbyStationId is a proposal station ID. If so, add suggestion.lineId to the existing station's lineIds and add the existing stationId to the new line's stationIds, rather than creating a new station."
human_verification:
  - test: "Extend a TTC line from an endpoint"
    expected: "In draw-line mode, clicking near a TTC subway line endpoint activates extend mode and places the first waypoint at the endpoint"
    why_human: "Extend/branch detection is not wired — no automated path to test this. Needs runtime map interaction."
  - test: "Move a waypoint on a proposal line to reshape the route"
    expected: "In select mode, a placed waypoint dot is selectable and draggable. Dragging it updates the rendered line geometry in real time."
    why_human: "moveWaypoint is not wired in any component — requires UI implementation first."
  - test: "Interchange between two proposal lines creates a truly shared station"
    expected: "Placing a station near an existing proposal station on a different line and confirming creates one station entity with lineIds containing both line IDs"
    why_human: "The reducer produces separate stations — needs human confirmation of whether the linked-station pattern is acceptable or whether full merging is required."
---

# Phase 3: Editing Core Verification Report

**Phase Goal:** Build the complete editing loop — create/extend/branch lines with click-to-draw geometry, place stations manually with snapping, handle interchanges with user confirmation, support line naming/coloring, and provide undo/redo/delete. Editing should feel fun and satisfying with manual control over automation.
**Verified:** 2026-03-31
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | User can create a new subway, LRT, or BRT line via the sidebar panel and draw its route | ✓ VERIFIED | LineCreationPanel wired to addLine+startDrawing; handleClick dispatches addWaypoint; double-click dispatches finishDrawing |
| 2  | User can extend an existing TTC line from an endpoint by clicking near it | ✗ FAILED | detectLineHitType exists but is never called from toronto-map.tsx onClick; onStartExtend prop declared but never passed |
| 3  | User can branch an existing TTC line by clicking on a mid-segment | ✗ FAILED | Same root cause as truth #2 — no extend/branch detection in handleClick |
| 4  | User can build a multi-line proposal by adding multiple lines sequentially | ✓ VERIFIED | Each addLine+startDrawing cycle creates a new ProposalLineDraft; all lines persist in draft.lines |
| 5  | Baseline TTC infrastructure is not mutated by any editing action | ✓ VERIFIED | TTC data loaded separately into MapData, never enters ProposalDraft; reducer only modifies draft.lines and draft.stations |
| 6  | New proposal lines start with distinct default colors from rotating palette | ✓ VERIFIED | nextDefaultColor = DEFAULT_LINE_COLORS[draft.lines.length % 5] passed to LineCreationPanel |
| 7  | User can place a station on a proposed line by clicking with Add Station tool | ✓ VERIFIED | handleClick add-station: snapToSegment + placeStation dispatch + StationNamePopover |
| 8  | Station snaps to nearest point on segment within 12px threshold | ✓ VERIFIED | snapToSegment(lngLat, line.waypoints, map, 12) called in onClick |
| 9  | Interchange suggestion appears near existing stations; user can accept/reject | ✓ VERIFIED | findNearbyStation → suggestInterchange → InterchangeBadge with Yes/No + 8s auto-dismiss |
| 10 | Crossing lines that do not go through interchange flow are never auto-connected | ✓ VERIFIED | No auto-connect logic exists anywhere in the codebase — connections require explicit user action |
| 11 | User can draw a route and adjust its geometry afterward | ✗ FAILED | moveWaypoint reducer action exists but is never dispatched; no vertex layer, no waypoint drag in toronto-map.tsx |
| 12 | User can use shared stations across multiple lines | ? UNCERTAIN | lineIds array in ProposalStationDraft supports sharing; but confirmInterchange creates separate station with link pointer rather than merging into existing station's lineIds |
| 13 | User can rename and recolor lines; undo/redo/delete all work | ✓ VERIFIED | inline editing in LineList, swatch picker, Cmd+Z / Cmd+Shift+Z keyboard handler, ConfirmationDialog on delete |
| 14 | Snap cue ring appears near snap targets | ✓ VERIFIED | buildSnapCueGeoJSON + setSnapPosition dispatch + ProposalLayers snap-cue-ring layer |

**Score:** 10/14 truths verified (3 failed, 1 uncertain)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/proposal/proposal-types.ts` | TransitMode, DrawingSession, InterchangeSuggestion, extended types | ✓ VERIFIED | All types present including PendingDeletion, snapPosition, pendingDeletion in EditorChromeState |
| `lib/proposal/proposal-state.ts` | Full reducer with all Phase 3 actions | ✓ VERIFIED | 28 actions including addLine, startDrawing, addWaypoint, finishDrawing, placeStation, moveStation, moveWaypoint, deleteLine, undo/redo flow |
| `lib/proposal/proposal-history.ts` | historyReducer, createInitialHistoryState | ✓ VERIFIED | Past/present/future with MAX_HISTORY=50; HISTORY_ACTIONS set correct |
| `lib/proposal/proposal-geometry.ts` | buildProposalLinesGeoJSON, buildProposalStationsGeoJSON, buildInProgressGeoJSON, findSnapTarget, detectLineHitType, snapToSegment, findNearbyStation, buildSnapCueGeoJSON | ✓ VERIFIED | All helpers present and substantive using @turf/turf |
| `lib/proposal/index.ts` | Barrel re-exports all new types and functions | ✓ VERIFIED | Exports all expected types and functions from all three modules |
| `components/map/proposal-layers.tsx` | ProposalLayers with lines, stations, in-progress, snap cue, selection highlights | ✓ VERIFIED | All layers present including selection glow, station halo, snap cue ring, station labels |
| `components/editor/sidebar/line-list.tsx` | Inline name editing, swatch color picker, delete affordance, empty state | ✓ VERIFIED | Full inline editing, 12-swatch picker popover, x-button with hover reveal |
| `components/editor/sidebar/line-creation-panel.tsx` | Name field, mode selector, 12-color swatch grid, Start Drawing | ✓ VERIFIED | Complete with defaultLineName(lineCount), mode buttons, color swatches |
| `components/editor/sidebar/station-name-popover.tsx` | Popup at station position with name field and Save button | ✓ VERIFIED | Popup anchored "bottom" at 8px, autoFocus, Enter/dismiss fallback |
| `components/editor/sidebar/interchange-badge.tsx` | Popup with Yes/No, 8s auto-dismiss | ✓ VERIFIED | useEffect + setTimeout(8000) defaulting to onReject; 44px min-height buttons |
| `components/editor/sidebar/confirmation-dialog.tsx` | Modal with destructive styling, Escape key, backdrop click | ✓ VERIFIED | Fixed overlay, capture-phase Escape listener, destructive button on right |
| `components/editor/toronto-map.tsx` | Drawing handlers, station placement, interchange wiring, select-move | ⚠️ PARTIAL | Drawing and station placement wired; extend/branch detection and moveWaypoint not wired |
| `components/editor/editor-shell.tsx` | historyReducer, keyboard shortcuts, sidebar panels, ConfirmationDialog | ✓ VERIFIED | All present and substantive |
| `app/globals.css` | 8 Phase 3 CSS custom property tokens | ✓ VERIFIED | All 8 tokens present: --proposal-line-default, --proposal-line-pending, --proposal-station-dot, --snap-cue-ring, --interchange-badge-bg, --interchange-badge-text, --selected-element, --drawing-cursor-dot |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `editor-shell.tsx` | `proposal-history.ts` | `useReducer(historyReducer, ...)` | ✓ WIRED | Line 54-58 in editor-shell.tsx |
| `toronto-map.tsx` | `proposal-layers.tsx` | `<ProposalLayers>` child | ✓ WIRED | Line 526-532 in toronto-map.tsx |
| `toronto-map.tsx` | `proposal-geometry.ts` | `buildProposalLinesGeoJSON` in useMemo | ✓ WIRED | Lines 162-179 |
| `line-creation-panel.tsx` | `proposal-state.ts` | dispatch addLine via onStartDrawing | ✓ WIRED | editor-shell.tsx handleStartDrawing dispatches addLine+startDrawing |
| `toronto-map.tsx` | `proposal-state.ts` | onClick dispatches addWaypoint | ✓ WIRED | handleClick line 290 |
| `toronto-map.tsx` | `proposal-geometry.ts` | `snapToSegment` in add-station click | ✓ WIRED | handleClick line 303 |
| `toronto-map.tsx` | `interchange-badge.tsx` | Rendered as Popup when pendingInterchangeSuggestion set | ✓ WIRED | Lines 564-571 |
| `toronto-map.tsx` | `station-name-popover.tsx` | Rendered as Popup when pendingStationName set | ✓ WIRED | Lines 554-561 |
| `editor-shell.tsx` | `proposal-history.ts` | useEffect keydown dispatches undo/redo | ✓ WIRED | Lines 72-99 |
| `confirmation-dialog.tsx` | `proposal-state.ts` | onConfirm dispatches confirmDeletion | ✓ WIRED | editor-shell.tsx line 292 |
| `toronto-map.tsx` | `proposal-geometry.ts` | `detectLineHitType` for extend/branch | ✗ NOT WIRED | detectLineHitType is exported from geometry but never imported in toronto-map.tsx; extend/branch path is dead code |
| `line-list.tsx` | `proposal-state.ts` | dispatch updateLineName and updateLineColor | ✓ WIRED | editor-shell.tsx lines 235-242 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `proposal-layers.tsx` | linesGeoJSON | buildProposalLinesGeoJSON(draft) via useMemo in toronto-map | Yes — from draft.lines which are populated by addLine+finishDrawing reducer actions | ✓ FLOWING |
| `proposal-layers.tsx` | stationsGeoJSON | buildProposalStationsGeoJSON(draft) via useMemo | Yes — from draft.stations populated by placeStation/confirmInterchange/rejectInterchange | ✓ FLOWING |
| `proposal-layers.tsx` | inProgressGeoJSON | buildInProgressGeoJSON(drawingSession, activeLineColor) via useMemo | Yes — from chrome.drawingSession which is set by startDrawing/addWaypoint | ✓ FLOWING |
| `proposal-layers.tsx` | snapCueGeoJSON | buildSnapCueGeoJSON(snapPosition) via useMemo | Yes — from chrome.snapPosition set by setSnapPosition dispatch in onMouseMove | ✓ FLOWING |
| `line-list.tsx` | lines prop | draft.lines from historyReducer state | Yes — populated by addLine reducer action | ✓ FLOWING |
| `confirmation-dialog.tsx` | message, confirmLabel, cancelLabel | chrome.pendingDeletion via buildConfirmationProps() | Yes — set by deleteSelected reducer action | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript types compile | `npm run typecheck` | 0 errors | ✓ PASS |
| ESLint passes | `npm run lint` | 0 errors/warnings | ✓ PASS |
| Production build succeeds | `npm run build` | Compiled successfully in 1379ms | ✓ PASS |
| @turf/turf dependency present | `grep "@turf/turf" package.json` | `"@turf/turf": "^7.3.4"` | ✓ PASS |
| historyReducer used in EditorShell | grep match | Line 55: useReducer(historyReducer, ...) | ✓ PASS |
| Extend/branch detection wired | grep detectLineHitType in components/ | No matches | ✗ FAIL |
| moveWaypoint dispatched in components/ | grep moveWaypoint in components/ | No matches | ✗ FAIL |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| EDIT-01 | 03-01-PLAN | User can create a new subway, LRT, or BRT line | ✓ SATISFIED | LineCreationPanel + addLine + startDrawing flow fully wired |
| EDIT-02 | 03-01-PLAN | User can extend an existing TTC line from an existing endpoint | ✗ BLOCKED | detectLineHitType never called; onStartExtend never passed |
| EDIT-03 | 03-01-PLAN | User can branch an existing TTC line | ✗ BLOCKED | Same as EDIT-02 — no branch detection in onClick |
| EDIT-04 | 03-01-PLAN | User can build a multi-line proposal | ✓ SATISFIED | Multiple addLine dispatches accumulate in draft.lines |
| EDIT-05 | 03-01-PLAN | Existing TTC infrastructure stays fixed | ✓ SATISFIED | TTC data isolated in MapData, never in ProposalDraft |
| EDIT-06 | 03-02-PLAN | User can draw a route and then adjust its geometry | ✗ BLOCKED | moveWaypoint reducer action exists but is never dispatched; no waypoint drag UI |
| EDIT-07 | 03-02-PLAN | User can place stations manually | ✓ SATISFIED | add-station click → snapToSegment → placeStation |
| EDIT-08 | 03-02-PLAN | User can use shared stations across multiple lines | ? UNCERTAIN | lineIds array supports sharing; but confirmInterchange creates separate station rather than merging into existing proposal station |
| EDIT-09 | 03-02-PLAN | Crossing lines do not auto-connect unless user confirms interchange | ✓ SATISFIED | No auto-connect logic in codebase |
| EDIT-10 | 03-02-PLAN | When new station near existing one, app suggests interchange | ✓ SATISFIED | findNearbyStation → suggestInterchange → InterchangeBadge |
| EDIT-11 | 03-02-PLAN | Editing offers light snapping without forcing geometry | ✓ SATISFIED | snap cue ring rendered; snapToSegment returns null if beyond threshold (12px) |
| EDIT-12 | 03-03-PLAN | User can undo, redo, and delete editing actions | ✓ SATISFIED | historyReducer + Cmd+Z / Cmd+Shift+Z + ConfirmationDialog + confirmDeletion |
| STYLE-01 | 03-03-PLAN | User can name new lines | ✓ SATISFIED | LineCreationPanel name field + LineList inline edit → updateLineName |
| STYLE-02 | 03-03-PLAN | User can name new stations | ✓ SATISFIED | StationNamePopover → updateStationName |
| STYLE-03 | 03-03-PLAN | User can customize proposal line colors | ✓ SATISFIED | LineCreationPanel swatch grid + LineList color picker popover → updateLineColor |
| STYLE-04 | 03-01-PLAN | New proposal lines start with distinct default colors | ✓ SATISFIED | DEFAULT_LINE_COLORS[lines.length % 5] rotates colors |

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `toronto-map.tsx` (line 93) | `onStartExtend` prop declared but never passed from editor-shell | ⚠️ Warning | Dead prop declaration; extend/branch flow unreachable |
| `lib/proposal/index.ts` (line 37) | `detectLineHitType` exported but not consumed by any component | ⚠️ Warning | Helper is complete but orphaned from the UI |
| `lib/proposal/proposal-state.ts` (lines 100-105, 488-499) | `moveWaypoint` action defined and in HISTORY_ACTIONS but never dispatched from UI | ⚠️ Warning | Reducer case is dead code for now |
| `lib/proposal/proposal-types.ts` (lines 60-64) | `parentLineId`, `branchPoint`, `isExtension` fields defined but never set by any action | ℹ️ Info | Type surface for extend/branch is ready but unpopulated |

### Human Verification Required

#### 1. Extend TTC Line from Endpoint

**Test:** In draw-line mode, click near (within ~20px screen distance) the endpoint of an existing TTC subway line
**Expected:** The draw mode activates with "extend" context, placing the first waypoint exactly at the TTC endpoint. The resulting proposal line records parentLineId and isExtension=true.
**Why human:** detectLineHitType is not wired — this test cannot pass until the gap is fixed. Flagged to clarify the expected interaction once implemented.

#### 2. Branch TTC Line from Mid-Segment

**Test:** In draw-line mode, click on the middle portion of a TTC line segment (not near either endpoint)
**Expected:** Branch mode activates, placing the first waypoint at the branch point on the TTC line. The new line records parentLineId and branchPoint.
**Why human:** Not wired. Same root cause as extend.

#### 3. Waypoint Drag to Adjust Route Geometry

**Test:** Draw a proposal line. Switch to select mode. Click/drag a waypoint on the rendered line.
**Expected:** The waypoint is draggable and the line geometry updates in real time.
**Why human:** moveWaypoint is not dispatched from any component. This requires implementation before testing.

#### 4. Shared Station Merging Across Two Proposal Lines

**Test:** Draw two proposal lines that cross near the same point. Place a station on line A. With add-station tool, click near that station on line B. Click "Yes" on the interchange badge.
**Expected (strict):** One station entity in draft.stations with lineIds=[lineA.id, lineB.id]. Both lines' stationIds arrays contain the same station ID.
**Expected (lenient):** Two station entities, each with linkedBaselineStationId pointing at the other (acceptable if linked-station is the intended model).
**Why human:** The current implementation creates a new station with linkedBaselineStationId pointing to the nearby station rather than merging. Whether this meets EDIT-08's intent requires a product decision.

### Gaps Summary

Three requirements are blocked by the same class of unwired code: the extend/branch detection logic (EDIT-02, EDIT-03) and the waypoint adjustment interaction (EDIT-06). In all three cases, the domain model is fully in place — the types, reducer actions, geometry helpers, and history tracking are complete and correct. The gap is entirely at the interaction wiring layer in `toronto-map.tsx`.

For EDIT-02 and EDIT-03: `detectLineHitType` needs to be called inside the `draw-line` `handleClick` path when no session is active, and the result needs to dispatch an `addLine` + `startDrawing` sequence with the appropriate `mode`, `parentLineId`, and `initialWaypoint`.

For EDIT-06: a waypoint vertex layer needs to be added to `ProposalLayers`, and a drag handler in `toronto-map.tsx` needs to dispatch `moveWaypoint` on drag release.

For EDIT-08: a product decision is needed about whether two nearby proposal stations should merge into a single `ProposalStationDraft` entity (with `lineIds: [lineA, lineB]`) or remain as separate entities with a link pointer. The current implementation uses the link-pointer model, which may or may not satisfy the requirement's intent.

Everything else in the phase is fully implemented and wired: the complete new-line creation flow, station placement with snapping, interchange suggestions, select-move station drag, inline naming/coloring, undo/redo/delete with confirmation dialogs, CSS tokens, and the production build.

---

_Verified: 2026-03-31_
_Verifier: Claude (gsd-verifier)_
