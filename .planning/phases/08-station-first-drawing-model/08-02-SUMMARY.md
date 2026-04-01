---
phase: 08-station-first-drawing-model
plan: 02
subsystem: editor-ui
tags: [station-first, drawing, click-handlers, undo, map-interaction]

requires:
  - phase: 08-01
    provides: [placeStation, undoPlaceStation, placedStationIds, deriveWaypointsFromStations, buildInProgressGeoJSON-new-signature]

provides:
  - station-first map click handlers in toronto-map.tsx
  - undo-during-drawing dispatches undoPlaceStation in editor-shell.tsx
  - auto-create-line on empty-map click
  - terminus-extend from proposal line click
  - mid-line station insertion with insertAtIndex

affects: [toronto-map, editor-shell, proposal-state]

tech-stack:
  added: []
  patterns:
    - "draw-line click: session active → dispatch placeStation; no session → check proposal terminus → check TTC hit → auto-create line"
    - "double-click: place final station + dispatch finishDrawing in sequence"
    - "undo during drawing: undoPlaceStation if placedStationIds > 0, else cancelDrawing"
    - "mid-line insertion: snapToSegment returns segmentIndex → passed as insertAtIndex to placeStation"

key-files:
  created: []
  modified:
    - components/editor/toronto-map.tsx
    - components/editor/editor-shell.tsx
    - lib/proposal/proposal-state.ts

key-decisions:
  - "PlaceStationAction.insertAtIndex added for splice-based mid-line station ordering in add-station tool"
  - "Auto-create-line on empty draw-line click: dispatch addLine + startDrawing + placeStation in sequence"
  - "Proposal terminus extension: check last/first station distance before TTC line hit detection"
  - "Double-click places final station immediately before finishDrawing (no separate click needed)"
  - "Draw-line handleMouseMove dispatches updateCursorPosition directly in addition to onUpdateCursor callback"

patterns-established:
  - "Draw mode click sequence: generate UUID → check nearby stations → dispatch placeStation → show StationNamePopover"
  - "Undo hierarchy: drawingSession active → undoPlaceStation (or cancelDrawing if 0 placed) → else generic undo"

requirements-completed: [DRAW-01, DRAW-02, DRAW-03]

duration: 8min
completed: "2026-04-01"
tasks_completed: 1
files_changed: 3
---

# Phase 08 Plan 02: Station-First UI Wiring Summary

**Station-first drawing wired into map click handlers: clicks place stations with auto-connect, double-click finishes, undo steps back through stations, empty-map click auto-creates a line, terminus click extends from last station**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-01T23:12:00Z
- **Completed:** 2026-04-01T23:20:37Z
- **Tasks:** 1 (Task 2 is checkpoint:human-verify — paused)
- **Files modified:** 3

## Accomplishments
- Rewrote draw-line click handler to dispatch `placeStation` instead of `addWaypoint`
- Added empty-map auto-line-creation flow (addLine + startDrawing + placeStation in one click)
- Added proposal terminus detection so clicking near an existing line's last station extends it
- Added double-click handler that places final station then finishes drawing
- Updated Ctrl+Z during drawing to dispatch `undoPlaceStation` (or `cancelDrawing` if 0 placed)
- Disabled "Finish Line" button when < 2 stations placed; button shows live station count
- Add-station tool passes `insertAtIndex` for correct mid-line splice ordering
- Extended `PlaceStationAction` payload with optional `insertAtIndex` field

## Task Commits

1. **Task 1: Rewrite click handlers and editor-shell drawing flow** - `76b04b2` (feat)

## Files Created/Modified
- `components/editor/toronto-map.tsx` - Station-first handleClick, handleDblClick, handleMouseMove; removed onAddWaypoint prop
- `components/editor/editor-shell.tsx` - undoPlaceStation undo, "Click to place stations" text, Finish Line station count + disabled state
- `lib/proposal/proposal-state.ts` - PlaceStationAction.insertAtIndex optional field + splice logic in placeStation reducer

## Decisions Made
- `insertAtIndex` added to `PlaceStationAction` instead of a new action type — simpler, reducer already handles the line lookup
- Proposal terminus check runs before TTC line hit detection — extending your own line is more common than extending TTC
- Double-click places the final station immediately then calls finishDrawing — avoids needing the user to single-click the same spot

## Deviations from Plan

None — plan executed exactly as written. The `insertAtIndex` field in `PlaceStationAction` was specified in the plan and implemented as described.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Task 2 (human-verify) is a checkpoint: browser verification of the full drawing flow
- All drawing interactions should be testable at http://localhost:3000 with `npm run dev`
- TypeScript and lint are clean

## Self-Check: PASSED

Files verified:
- `components/editor/toronto-map.tsx` — FOUND
- `components/editor/editor-shell.tsx` — FOUND
- `lib/proposal/proposal-state.ts` — FOUND
- `.planning/phases/08-station-first-drawing-model/08-02-SUMMARY.md` — FOUND

Commits verified:
- `76b04b2` — feat(08-02): wire station-first drawing into map click handlers and editor shell

---
*Phase: 08-station-first-drawing-model*
*Completed: 2026-04-01*
