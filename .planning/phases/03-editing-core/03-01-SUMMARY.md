---
phase: 03-editing-core
plan: 01
subsystem: ui
tags: [react, maplibre, geojson, turf, reducer, undo-redo, drawing]

# Dependency graph
requires:
  - phase: 02-toronto-baseline-and-context-layers
    provides: TorontoMap component with MapLibre, TTC/GO layers, Source/Layer pattern
  - phase: 01-editor-shell-and-proposal-state
    provides: ProposalDraft types, proposalEditorReducer, EditorShell, EditorFrame, TopToolbar

provides:
  - Extended proposal type system with TransitMode, DrawingSession, InterchangeSuggestion
  - Geometry helpers for GeoJSON building and spatial snap detection (proposal-geometry.ts)
  - History wrapper with undo/redo around proposalEditorReducer (proposal-history.ts)
  - ProposalLayers map component rendering committed and in-progress lines/stations
  - LineList and LineCreationPanel sidebar components for adding lines
  - Drawing interaction loop: click to place waypoints, double-click to finish
  - Full add-line-to-draw-waypoints-to-finish flow wired end to end

affects:
  - 03-02-PLAN.md
  - 03-03-PLAN.md

# Tech tracking
tech-stack:
  added:
    - "@turf/turf@7.3.4 — nearestPointOnLine, lineString, point for geospatial snap helpers"
  patterns:
    - "historyReducer wraps proposalEditorReducer with past/present/future arrays (max 50 entries)"
    - "GeoJSON built from reducer state via buildProposalLinesGeoJSON/buildProposalStationsGeoJSON, passed as Source data prop"
    - "Drawing session is chrome state (not draft state), only committed on finishDrawing"
    - "crypto.randomUUID() used for line ID generation (no external UUID library)"
    - "Sidebar panel switching via chrome.sidebarPanel: list | create | drawing-status"

key-files:
  created:
    - lib/proposal/proposal-geometry.ts
    - lib/proposal/proposal-history.ts
    - components/map/proposal-layers.tsx
    - components/editor/sidebar/line-list.tsx
    - components/editor/sidebar/line-creation-panel.tsx
  modified:
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/proposal/index.ts
    - components/editor/toronto-map.tsx
    - components/editor/editor-shell.tsx
    - components/editor/editor-frame.tsx
    - components/editor/top-toolbar.tsx
    - app/globals.css
    - package.json

key-decisions:
  - "DrawingSession lives in chrome state (not draft), only committing waypoints to draft on finishDrawing — keeps history clean from transient drawing state"
  - "historyReducer only pushes history on semantic draft mutations (addLine, finishDrawing) not on transient state like addWaypoint or updateCursorPosition"
  - "useMemo deps use full draft object (not draft.lines) to satisfy React Compiler's memoization rules"
  - "ProposalLayers positioned between TtcLayers and StationLabels per UI-SPEC visual hierarchy"
  - "onAddLine prop added to EditorFrame and TopToolbar to connect toolbar CTA to sidebar creation panel"

patterns-established:
  - "Sidebar panel state (list/create/drawing-status) owned by chrome.sidebarPanel in reducer"
  - "New line creation: generate UUID → dispatch addLine → dispatch startDrawing with same UUID"
  - "Ghost segment rendered from DrawingSession.cursorPosition via buildInProgressGeoJSON"
  - "Map cursor changes based on activeTool: crosshair for draw-line, cell for add-station"

requirements-completed: [EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, STYLE-04]

# Metrics
duration: 8min
completed: 2026-04-01
---

# Phase 03 Plan 01: Proposal Editing Foundation Summary

**Interactive line drawing with click-to-place waypoints, ghost segment cursor, undo/redo history, and sidebar UI backed by extended ProposalDraft type system and @turf/turf geometry helpers**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-01T04:51:50Z
- **Completed:** 2026-04-01T04:59:18Z
- **Tasks:** 2
- **Files modified:** 14 (8 modified, 6 created)

## Accomplishments

- Extended proposal type system with TransitMode, DrawingSession, InterchangeSuggestion, and updated ProposalLineDraft/ProposalStationDraft with geometry fields
- Built proposal-geometry.ts with buildProposalLinesGeoJSON, buildProposalStationsGeoJSON, buildInProgressGeoJSON, findSnapTarget, detectLineHitType, dist2D using @turf/turf
- Created proposal-history.ts with past/present/future undo/redo wrapper around proposalEditorReducer (max 50 entries)
- Wired full drawing loop: sidebar Add Line -> LineCreationPanel -> addLine + startDrawing -> click waypoints on map -> double-click to finish -> line rendered at full opacity
- ProposalLayers component renders committed lines, station dots, and semi-transparent ghost segment following cursor
- EditorShell now uses historyReducer and renders LineList/LineCreationPanel/drawing-status sidebar panels

## Task Commits

1. **Task 1: Extend proposal domain model, geometry helpers, and history wrapper** - `d4e02d5` (feat)
2. **Task 2: Wire drawing interaction loop, proposal map layers, and sidebar line UI** - `afe30ec` (feat)

## Files Created/Modified

- `lib/proposal/proposal-types.ts` - Extended with TransitMode, DrawingSession, InterchangeSuggestion, DEFAULT_LINE_COLORS, EXTENDED_SWATCH_COLORS, updated ProposalLineDraft/ProposalStationDraft/EditorChromeState
- `lib/proposal/proposal-state.ts` - Extended with addLine/startDrawing/addWaypoint/updateCursorPosition/finishDrawing/cancelDrawing/setSidebarPanel/setSelectedElement actions
- `lib/proposal/proposal-geometry.ts` - New: GeoJSON builders, snap target finder, endpoint/branch detection using @turf/turf
- `lib/proposal/proposal-history.ts` - New: Past/present/future history wrapper with selective action tracking
- `lib/proposal/index.ts` - Updated barrel with all new exports
- `components/map/proposal-layers.tsx` - New: Proposal lines, stations, in-progress drawing layers
- `components/editor/sidebar/line-list.tsx` - New: Line list with color swatch, mode badge, empty state, Add Line button
- `components/editor/sidebar/line-creation-panel.tsx` - New: Name field, mode selector, 12-color swatch grid, Start Drawing button
- `components/editor/toronto-map.tsx` - Updated with drawing handlers, cursor style, ProposalLayers injection
- `components/editor/editor-shell.tsx` - Switched to historyReducer, renders sidebar panels, handles addLine->startDrawing flow
- `components/editor/editor-frame.tsx` - Added onAddLine prop pass-through
- `components/editor/top-toolbar.tsx` - Renamed CTA from "Start Proposal" to "Add Line", wired onAddLine
- `app/globals.css` - Added 8 Phase 3 proposal/editing CSS tokens
- `package.json` - Added @turf/turf@7.3.4 dependency

## Decisions Made

- DrawingSession lives in chrome state (not draft), only committing waypoints to draft on finishDrawing — keeps history clean from transient drawing state
- historyReducer only pushes history on semantic draft mutations (addLine, finishDrawing) not on transient state like addWaypoint or updateCursorPosition
- useMemo deps use full draft object (not draft.lines) to satisfy React Compiler's memoization preserve rules
- ProposalLayers positioned between TtcLayers and StationLabels per UI-SPEC visual hierarchy contract
- New line ID generated with crypto.randomUUID() before both addLine and startDrawing dispatches to avoid multi-step async flow

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed React Compiler memoization violation in useMemo deps**
- **Found during:** Task 2 (toronto-map.tsx updates)
- **Issue:** Plan specified `[draft?.lines]` as useMemo deps (optional chaining) but React Compiler's preserve-manual-memoization rule rejected optional chaining in deps arrays — it expected full `draft` dependency
- **Fix:** Changed all three useMemo calls to use `[draft]` as dependency instead of `[draft?.lines]` and `[draft?.stations]`
- **Files modified:** components/editor/toronto-map.tsx
- **Verification:** npm run lint passes (0 errors)
- **Committed in:** afe30ec (Task 2 commit)

**2. [Rule 1 - Bug] Removed unused handleMouseMoveBasic function and void useMap**
- **Found during:** Task 2 (lint check)
- **Issue:** Plan had a redundant handleMouseMoveBasic callback and `void useMap` suppression pattern that triggered @typescript-eslint/no-unused-vars and import errors
- **Fix:** Removed redundant callback (handleMouseMove already handles all mouse moves), removed useMap import
- **Files modified:** components/editor/toronto-map.tsx
- **Verification:** npm run lint passes (0 errors)
- **Committed in:** afe30ec (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes required for lint to pass. No scope changes. Core functionality unchanged.

## Issues Encountered

None beyond the two auto-fixed lint issues above.

## User Setup Required

None - no external service configuration required. NEXT_PUBLIC_MAPTILER_KEY already required from Phase 2.

## Known Stubs

None - all proposal data flows from real reducer state. GeoJSON is built from actual ProposalDraft. Empty state text in LineList is intentional (shows when no lines exist, not a stub).

## Next Phase Readiness

- Phase 3 Plan 02 can add station placement: the ProposalStationDraft type, buildProposalStationsGeoJSON, and proposal-stations-circle layer are already in place
- Phase 3 Plan 03 can add undo/redo keyboard shortcuts: historyReducer already handles "undo" and "redo" action types
- findSnapTarget and detectLineHitType geometry helpers are ready for Phase 3 Plans 02/03 to wire interchange suggestions and extend/branch detection
- Baseline TTC data is completely isolated from proposal state — no mutation risk

## Self-Check: PASSED

All created files verified present on disk. All task commits (d4e02d5, afe30ec) verified in git log.

---
*Phase: 03-editing-core*
*Completed: 2026-04-01*
