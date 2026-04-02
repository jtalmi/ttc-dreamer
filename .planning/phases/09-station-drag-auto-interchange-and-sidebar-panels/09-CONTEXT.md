# Phase 9: Station Drag, Auto-Interchange, and Sidebar Panels - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable station repositioning by dragging (proposal stations only, not baseline), auto-create interchanges when stations are placed near existing stations (proposal or baseline), and wire click-to-inspect so clicking any station/line on the map opens its details in the sidebar.

</domain>

<decisions>
## Implementation Decisions

### Station Drag
- Only newly created proposal stations are draggable (not baseline TTC stations)
- Drag dispatches `moveStation` reducer action with `{ stationId, newPosition }`
- `moveStation` updates station position and re-derives waypoints for all connected lines via `deriveWaypointsFromStations`
- Throttle moveStation dispatch to ~30ms to avoid MapLibre worker queue blowup (per research pitfall)
- During drag: update visual preview only; commit full state on mouseup
- Custom pointer events on station symbol layer (mousedown/mousemove/mouseup), not MapLibre Marker drag

### Auto-Interchange
- When `placeStation` is dispatched, check proximity to all existing stations (both proposal draft.stations AND baseline TTC stations)
- If within threshold (~50m), auto-create interchange — set `linkedBaselineStationId` for baseline matches, or merge `lineIds` for proposal matches
- No confirmation prompt (per user decision: "automatically creates interchange")
- Reuse existing `InterchangeSuggestion` mechanism where possible

### Sidebar Panels (Click-to-Inspect)
- Clicking a station on the map: opens sidebar with StationInspectorPanel showing name, position, connected lines
- Clicking a line on the map: opens sidebar with LineInspectorPanel showing name, color, stations, stats
- These inspector panels already exist from v1 Phase 4 — just need proper wiring in the new select mode
- In Phase 7, select mode was wired to dispatch `inspectElement` — verify this opens the correct panel

### Claude's Discretion
- Exact proximity threshold for auto-interchange (50m suggested, adjust if needed)
- Whether to show a brief visual indicator when auto-interchange fires
- Throttle implementation details (requestAnimationFrame vs setTimeout)
- Whether station drag needs to be added to HISTORY_ACTIONS (yes — it mutates draft)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LineInspectorPanel` and `StationInspectorPanel` — already built in Phase 4
- `inspectElement` action in reducer — sets sidebarPanel and inspectedElementId
- `moveStation` may already partially exist — check proposal-state.ts
- `InterchangeSuggestion` type and pending interchange state from Phase 3
- `deriveWaypointsFromStations` from Phase 8 — used to rebuild geometry after drag

### Established Patterns
- Custom pointer events in toronto-map.tsx for station/line interaction
- useReducer for state, chrome for transient UI
- HISTORY_ACTIONS for undoable mutations

### Integration Points
- toronto-map.tsx needs mousedown/mousemove/mouseup handlers for drag
- proposal-state.ts needs moveStation action
- editor-shell.tsx sidebar panel routing already handles inspect-line and inspect-station

</code_context>

<specifics>
## Specific Ideas

- Clicking on a station loads station info (address, name, etc.) and line info
- Clicking on a line loads line info only
- Dragging a station moves the whole line — should be dynamic and responsive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
