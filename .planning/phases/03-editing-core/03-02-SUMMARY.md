---
phase: 03-editing-core
plan: 02
subsystem: ui
tags: [react, maplibre, geojson, turf, station-placement, interchange, snapping, select-move]

# Dependency graph
requires:
  - phase: 03-01
    provides: ProposalLayers, TorontoMap, EditorShell with historyReducer, geometry helpers, drawing loop

provides:
  - Station placement on proposal lines with snapToSegment (12px threshold)
  - findNearbyStation for interchange detection (20px threshold, checks proposal + TTC)
  - buildSnapCueGeoJSON for snap cue ring overlay
  - suggestInterchange / confirmInterchange / rejectInterchange action flow
  - placeStation, moveStation, moveWaypoint, updateStationName actions
  - setSnapPosition chrome action for snap cue rendering
  - StationNamePopover: Popup for naming newly placed stations
  - InterchangeBadge: Popup with Yes/No buttons, 8s auto-dismiss
  - ProposalLayers updated with snap cue ring (16px, accent-derived) and selection highlights
  - TorontoMap wired for add-station tool, select-move, interchange badge, snap cues, cursor states
  - EditorShell passes dispatch + new chrome fields to TorontoMap

affects:
  - 03-03-PLAN.md

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "snapToSegment uses turf nearestPointOnLine + map.project() for screen-space threshold check"
    - "findNearbyStation scans proposal stations then TTC FeatureCollection via map.project()"
    - "Interchange flow: suggestInterchange defers station creation; confirmInterchange/rejectInterchange create station in reducer"
    - "Station drag tracked with draggingStationId useState, dispatches moveStation on mousemove"
    - "Snap cue ring rendered as Source/Layer with circle-color transparent, stroke rgba(216,90,42,0.45)"
    - "Selection highlight uses filter expression ['==', ['get', 'id'], selectedElementId]"

key-files:
  created:
    - components/editor/sidebar/station-name-popover.tsx
    - components/editor/sidebar/interchange-badge.tsx
  modified:
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/proposal/proposal-geometry.ts
    - lib/proposal/proposal-history.ts
    - lib/proposal/index.ts
    - components/map/proposal-layers.tsx
    - components/editor/toronto-map.tsx
    - components/editor/editor-shell.tsx

key-decisions:
  - "pendingInterchangeSuggestion type extended to include stationName, deferring station creation until user confirms or rejects"
  - "confirmInterchange and rejectInterchange generate station UUID in reducer (not in component) to keep side-effect-free pattern consistent"
  - "Station drag uses useState(draggingStationId) in TorontoMap rather than a pointer-capture API — simpler for v1, sufficient for desktop use"
  - "dispatch prop passed directly to TorontoMap rather than individual callbacks to avoid prop explosion"
  - "add-station cursor shows not-allowed when not over a proposal line segment, cell when over one — computed from isOverSegment state"

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 03 Plan 02: Station Placement, Snapping, and Interchange Summary

**Station placement with snapToSegment snapping, interchange suggestion badge (auto-dismiss 8s), select-move station dragging, snap cue ring overlay, and StationNamePopover backed by extended reducer actions**

## Performance

- Duration: 5 minutes
- Tasks completed: 2/2
- Files created: 2
- Files modified: 8

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Add station placement, snapping, interchange detection to domain model | 57f54bc | proposal-geometry.ts, proposal-state.ts, proposal-types.ts |
| 2 | Wire station placement UI, interchange badge, select-move, snap cues | c245f58 | toronto-map.tsx, proposal-layers.tsx, station-name-popover.tsx, interchange-badge.tsx |

## What Was Built

### Domain Model Extensions (Task 1)

**proposal-types.ts:**
- Added `snapPosition: [number, number] | null` to `EditorChromeState`
- Changed `pendingInterchangeSuggestion` type to `(InterchangeSuggestion & { stationName: string }) | null` to carry the deferred station name

**proposal-geometry.ts:**
- `snapToSegment(clickLngLat, lineWaypoints, map, pixelThreshold=12)` — snaps click to nearest point on line segment using turf's `nearestPointOnLine` + screen-distance check
- `findNearbyStation(position, proposalStations, ttcStations, map, pixelThreshold=20)` — spatial scan of both proposal and TTC baseline stations
- `buildSnapCueGeoJSON(snapPosition)` — creates FeatureCollection with one Point for snap cue ring

**proposal-state.ts:**
- `placeStation` — creates ProposalStationDraft, pushes id to line.stationIds
- `suggestInterchange` — sets pendingInterchangeSuggestion (defers station creation)
- `confirmInterchange` — creates station with linkedBaselineStationId set, clears suggestion
- `rejectInterchange` — creates station without link, clears suggestion
- `moveStation` — updates station position by id
- `moveWaypoint` — updates single waypoint in line's waypoints array by index
- `updateStationName` — updates station name by id
- `setSnapPosition` — updates chrome.snapPosition for snap cue ring

**proposal-history.ts:** Added `confirmInterchange` and `rejectInterchange` to HISTORY_ACTIONS

### UI Components (Task 2)

**StationNamePopover:**
- react-map-gl Popup anchored "bottom", offset 8px
- Prefilled text field with sequential default name ("Station N")
- Save on Enter key or button click
- onDismiss saves default name (click-away behavior per UI-SPEC)
- `--interchange-badge-bg` background, `--interchange-badge-text` color

**InterchangeBadge:**
- react-map-gl Popup anchored "left", offset 12px
- "Make interchange?" text with Yes/No buttons
- 44x44px minimum button height per UI-SPEC accessibility rule
- `useEffect` + `setTimeout` for 8-second auto-dismiss defaulting to No

**ProposalLayers:**
- `snapCueGeoJSON` optional prop (renders Source/Layer only when non-null)
- Snap cue ring: `circle-radius: 8`, transparent fill, `rgba(216,90,42,0.45)` stroke, 1.5px width
- Line selection glow: second Layer with `filter: ['==', ['get', 'id'], selectedElementId]`, rgba(216,90,42,0.25), width 12, blur 8
- Station selection halo: circle Layer with larger radius and same selection color
- Station labels: symbol Layer with text-field from name property

**TorontoMap:**
- `dispatch`, `snapPosition`, `pendingInterchangeSuggestion` new props
- `add-station` onClick: snapToSegment for all lines, findNearbyStation check, dispatch suggestInterchange or placeStation
- `select` onClick: checks interactiveLayerIds for proposal elements, sets selectedElement, starts drag tracking
- `onMouseMove`: updates snap cue position and isOverSegment state for cursor style
- `onMouseUp`: clears dragging state
- cursor: `crosshair` (draw-line), `cell`/`not-allowed` (add-station based on isOverSegment), `grabbing` (dragging), `default` (select/inspect)
- Renders StationNamePopover when pendingStationName is set
- Renders InterchangeBadge when pendingInterchangeSuggestion is non-null

**EditorShell:** Passes `dispatch`, `snapPosition`, `pendingInterchangeSuggestion` to TorontoMap

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All wired data flows to active UI.

## Self-Check: PASSED

Files verified:
- components/editor/sidebar/station-name-popover.tsx: FOUND
- components/editor/sidebar/interchange-badge.tsx: FOUND
- lib/proposal/proposal-geometry.ts exports snapToSegment, findNearbyStation, buildSnapCueGeoJSON: FOUND
- lib/proposal/proposal-state.ts handles placeStation, suggestInterchange, confirmInterchange, rejectInterchange, moveStation, moveWaypoint, updateStationName, setSnapPosition: FOUND

Commits verified:
- 57f54bc (Task 1): FOUND
- c245f58 (Task 2): FOUND

Build: npm run build exits 0
Typecheck: npm run typecheck exits 0
Lint: npm run lint exits 0
