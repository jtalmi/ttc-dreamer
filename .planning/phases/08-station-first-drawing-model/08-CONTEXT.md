# Phase 8: Station-First Drawing Model - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite the drawing session so stations are the atomic unit. Clicking in draw mode places a station, lines auto-connect between consecutive stations. Support mid-line station insertion, terminus extension/branching, and granular undo. Bump share payload to v2 with migration for existing v1 URLs.

</domain>

<decisions>
## Implementation Decisions

### Drawing Session Model
- Stations are the canonical geometry source — waypoints derived via `deriveWaypointsFromStations()` generating straight-line segments between consecutive station positions
- `DrawingSession.waypoints` replaced with `DrawingSession.placedStationIds: string[]` — each click creates a station and appends its ID
- Stations created immediately on click — `placeStation` action creates ProposalStationDraft, adds ID to line's stationIds and session's placedStationIds
- Share payload bumped to v2 with migration in `decode-proposal.ts` — v1 waypoint-only lines converted to station-per-waypoint. Frozen v1 fixture test required before any type changes.

### Click Interactions
- Click on existing line segment in draw mode: find nearest point on segment, create station there, split stationIds to insert between adjacent stations
- Click near line terminus in draw mode: start new drawing session continuing from that station (extend same line). Modifier key or "New Line" first for branching to new line.
- Double-click places final station AND finishes drawing. "Finish" button also works. Minimum 2 stations for valid line.
- Click empty map in draw mode with no active session: auto-create new line (default name/color), place first station — reduces friction

### Ghost Line & Visual Feedback
- Ghost/preview line: straight line from last placed station position to cursor position
- Placed stations render immediately as regular proposal stations (committed to draft.stations on click)
- Undo during session: removes last placed station from draft.stations, session.placedStationIds, and line's stationIds. Ghost line snaps back to previous station.

### Claude's Discretion
- Exact implementation of `deriveWaypointsFromStations()` — likely iterate stationIds, look up positions from draft.stations, return array of positions
- How to detect "near a line segment" vs "near a terminus" — distance thresholds
- Default line name/color generation for auto-created lines
- Whether `buildInProgressGeoJSON` signature changes or adapts to use station positions from session
- HISTORY_ACTIONS enrollment for new actions (placeStation, etc.) — must be explicitly added and tested

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DrawingSession` type in proposal-types.ts (needs modification)
- `proposalEditorReducer` in proposal-state.ts (needs new actions)
- `buildInProgressGeoJSON` and `buildProposalLinesGeoJSON` in proposal-geometry.ts (need adaptation)
- `findSnapTarget` in toronto-map.tsx (reusable for station insertion detection)
- `detectLineHitType` for terminus vs segment detection
- HISTORY_ACTIONS set in proposal-history.ts

### Established Patterns
- Actions dispatched in proposalEditorReducer, chrome state for transient UI, draft state for undoable mutations
- HISTORY_ACTIONS must be explicitly updated for new draft-mutating actions
- `crypto.randomUUID()` for ID generation
- Inline styles, useReducer pattern

### Integration Points
- toronto-map.tsx click handlers need to change from addWaypoint to placeStation
- editor-shell.tsx handleStartDrawing flow needs updating
- ProposalLayers consumes GeoJSON from geometry helpers
- Share encode/decode needs v2 schema with migration

</code_context>

<specifics>
## Specific Ideas

- We're just adding stations and lines connect — makes more sense than draw-line-then-place-stations
- Clicking on an existing line adds a station to that line
- Overall should be dynamic and responsive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
