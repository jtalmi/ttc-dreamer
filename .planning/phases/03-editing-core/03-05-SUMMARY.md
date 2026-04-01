---
phase: 03-editing-core
plan: "05"
subsystem: map-interaction
tags: [waypoint-drag, proposal-layers, select-mode, geojson]
dependency_graph:
  requires: []
  provides: [waypoint-vertex-rendering, waypoint-drag-interaction]
  affects: [components/map/proposal-layers.tsx, components/editor/toronto-map.tsx]
tech_stack:
  added: []
  patterns: [drag-state-pattern, useMemo-geojson, interactive-layer-ids]
key_files:
  created: []
  modified:
    - components/map/proposal-layers.tsx
    - components/editor/toronto-map.tsx
decisions:
  - "waypointsGeoJSON useMemo returns empty FeatureCollection (not null) when not in select mode to keep type consistent with FeatureCollection return type"
  - "Waypoint vertex click detection in handleClick comes before station/line check so vertex clicks are not consumed by underlying element selection"
  - "draggingWaypoint state uses object {lineId, waypointIndex} rather than just index to avoid ambiguity across multiple lines"
metrics:
  duration_minutes: 12
  completed_date: "2026-04-01T06:06:16Z"
  tasks_completed: 2
  files_modified: 2
---

# Phase 03 Plan 05: Waypoint Drag Interaction Summary

Gap closure for EDIT-06: waypoint vertex rendering and drag-to-reshape interaction wired to the existing moveWaypoint reducer action.

## What Was Built

Added visible waypoint vertex dots on committed proposal lines in select mode, with full drag interaction that updates line geometry live and commits via moveWaypoint on mouse release.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add waypoint vertex layer to ProposalLayers | 90f235e | components/map/proposal-layers.tsx |
| 2 | Build waypointsGeoJSON and wire drag interaction in toronto-map.tsx | 88e3e83 | components/editor/toronto-map.tsx |

## Changes Summary

### Task 1: ProposalLayers waypoint vertex layer

- Added `waypointsGeoJSON?: FeatureCollection | null` to `ProposalLayersProps`
- Added `waypointsGeoJSON = null` to destructured props with default
- Added `proposal-waypoints` Source and `proposal-waypoints-circle` Layer at the end of JSX (above all other layers in stacking order)
- Circle paint: white fill, line-color stroke via `["get", "color"]`, 5px radius, 0.85 opacity

### Task 2: TorontoMap waypoint drag wiring

- `draggingWaypoint` state: `{ lineId: string; waypointIndex: number } | null`
- `waypointsGeoJSON` useMemo: builds Point features from `draft.lines` when `activeTool === "select"`, empty FeatureCollection otherwise
- `handleMouseMove`: dispatches `moveWaypoint` live when `draggingWaypoint` is set
- `handleMouseUp`: clears `draggingWaypoint` on release
- `handleClick`: detects `proposal-waypoints-circle` feature before station/line checks, sets `draggingWaypoint`
- `interactiveLayerIds`: added `"proposal-waypoints-circle"`
- `ProposalLayers`: receives `waypointsGeoJSON` prop
- `cursorStyle`: returns `"grabbing"` when `draggingWaypoint` is set

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npm run typecheck`: 0 errors
- `npm run lint`: 0 warnings/errors
- `npm run build`: compiled successfully
- `grep "waypointsGeoJSON" components/editor/toronto-map.tsx`: 2 occurrences (useMemo + ProposalLayers prop)
- `grep "proposal-waypoints-circle" components/editor/toronto-map.tsx`: 2 occurrences (interactiveLayerIds + handleClick)
- `grep "waypointsGeoJSON" components/map/proposal-layers.tsx`: 4 occurrences (props type + destructure + JSX condition + Source)

## Known Stubs

None.

## Self-Check: PASSED
