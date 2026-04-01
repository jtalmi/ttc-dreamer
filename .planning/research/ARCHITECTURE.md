# Architecture Research

**Domain:** Interactive map editor — v2.0 feature integration with existing EditorShell/useReducer/MapLibre stack
**Researched:** 2026-04-01
**Confidence:** HIGH (based on direct codebase analysis of all relevant components and types)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        EditorShell                               │
│  useReducer(historyReducer) → { draft, chrome }                  │
│  Owns all state. Renders EditorFrame + modals.                   │
├──────────────────────────────────────────────────────────────────┤
│                        EditorFrame                               │
│  Layout scaffold: TopToolbar + MapStage + SidebarShell           │
│  [v2.0: TopToolbar removed; MapStage becomes full viewport]      │
├────────────────────┬────────────────────────────────────────────┤
│   [REMOVED]        │         MapStage             │ SidebarShell│
│   TopToolbar       │  (flex-1, position:relative) │ (320px)     │
│                    │  TorontoMap fills 100%        │             │
│                    │  + position:absolute floats:  │             │
│                    │    DrawingToolbar             │             │
│                    │    LayerPicker                │             │
├────────────────────┴────────────────────────────────────────────┤
│                        TorontoMap (dynamic, SSR=false)           │
│  MapLibre GL via react-map-gl                                    │
│  Layer stack: ContextLabels → Corridors → GO → TTC → Proposal   │
│  → StationLabels → Popup overlays                                │
│  Handles all mouse events, snap logic, interchange detection     │
│  [v2.0: station-first click handler replaces waypoint model]     │
├──────────────────────────────────────────────────────────────────┤
│  lib/proposal/       │  lib/baseline/  │  lib/sharing/           │
│  Types, reducer,     │  GeoJSON        │  URL hash encode,        │
│  geometry helpers,   │  loaders        │  PNG export              │
│  history wrapper     │  (unchanged)    │  (unchanged)             │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | v2.0 Status |
|-----------|----------------|-------------|
| `EditorShell` | Owns all state via `useReducer`. Renders layout, modals, sidebar content, floating UI. | MODIFY — new action wiring, floating UI as mapChildren |
| `EditorFrame` | CSS layout only: toolbar + MapStage + SidebarShell. | MODIFY — remove TopToolbar render; MapStage grows to full height |
| `TopToolbar` | 48px header: tools, baseline toggle, title, share, comparison toggle, corridor toggle. | REMOVE — replaced by floating components |
| `MapStage` | `flex:1`, `position:relative`, `overflow:hidden`. Slots for children + banner. | KEEP — becomes anchor for all floating overlays |
| `SidebarShell` | 320px collapsible aside. Toggle rail, scrollable content area. | MODIFY — update interior default to colored line list |
| `TorontoMap` | MapLibre GL. Loads baseline GeoJSON. Click/drag/mousemove handlers. Renders proposal layers. | MODIFY — station-first click handler, drag-linked geometry update |
| `proposal-state.ts` | Reducer with 30+ action types. draft (undoable) + chrome (UI state). | MODIFY — new `placeStationOnLine`, updated `moveStation`, new DrawingSession shape |
| `proposal-types.ts` | All domain types: DrawingSession, ToolMode, EditorChromeState, etc. | MODIFY — DrawingSession.waypoints → stationIds |
| `proposal-geometry.ts` | Pure geometry helpers (snap, build GeoJSON, in-progress ghost). | MODIFY — add `deriveWaypointsFromStations`, update `buildInProgressGeoJSON` |
| `baseline-data.ts` | Async GeoJSON fetchers from `/public/data/`. | KEEP — replace data files, not loaders |

## Recommended Project Structure

```
components/
├── editor/
│   ├── editor-shell.tsx          # MODIFY — new chrome wiring, floating UI in mapChildren
│   ├── editor-frame.tsx          # MODIFY — remove TopToolbar, MapStage full height
│   ├── map-stage.tsx             # KEEP — already position:relative
│   ├── sidebar-shell.tsx         # MODIFY — interior default panel update
│   ├── top-toolbar.tsx           # REMOVE
│   ├── baseline-toggle.tsx       # KEEP
│   ├── floating/                 # NEW folder
│   │   ├── drawing-toolbar.tsx   # NEW — tool selector overlaid on map
│   │   └── layer-picker.tsx      # NEW — layer/baseline toggles overlaid on map
│   └── sidebar/
│       ├── line-list.tsx         # KEEP, minor color-dot polish
│       ├── line-inspector-panel.tsx  # KEEP
│       ├── station-inspector-panel.tsx  # MODIFY — add street name display
│       ├── line-creation-panel.tsx  # KEEP or absorb into drawing-toolbar
│       ├── proposal-stats-panel.tsx # KEEP
│       └── ...
├── map/
│   ├── ttc-layers.tsx            # MODIFY — dashed styling for under-construction
│   ├── proposal-layers.tsx       # KEEP — renders same GeoJSON shape
│   └── ...
lib/
├── proposal/
│   ├── proposal-types.ts         # MODIFY — DrawingSession type, chrome fields
│   ├── proposal-state.ts         # MODIFY — new actions, updated moveStation
│   └── proposal-geometry.ts     # MODIFY — deriveWaypointsFromStations helper
└── baseline/
    └── baseline-data.ts          # KEEP loaders unchanged
public/data/
    ├── ttc-routes.geojson        # REPLACE with corrected coordinates
    ├── ttc-stations.geojson      # REPLACE with corrected station positions
    ├── ttc-routes-future.geojson # REPLACE — Eglinton operational, Ontario Line u/c
    └── ttc-stations-future.geojson  # REPLACE
```

### Structure Rationale

- **`components/editor/floating/`:** Isolates the new floating UI layer. These components are absolutely positioned inside MapStage's `position:relative` container — they do not affect CSS flow and do not need portals.
- **`lib/proposal/proposal-geometry.ts`:** Already the home for pure geometry helpers. `deriveWaypointsFromStations` belongs here — the reducer calls it but does not own the math.
- **`public/data/`:** GeoJSON files replaced in-place. Loaders in `baseline-data.ts` stay clean and unchanged.

## Architectural Patterns

### Pattern 1: Floating Toolbar via Absolute Positioning in MapStage

**What:** `MapStage` already has `position: relative` and `overflow: hidden`. New floating components use `position: absolute` with explicit top/left/bottom/right/zIndex values, rendered as children of MapStage alongside `mapElement`.

**When to use:** All map-overlaid UI: DrawingToolbar, LayerPicker. The comparison banner already uses this pattern via `mapBanner` slot.

**Trade-offs:** Simple, no portal needed. Z-index discipline required (map canvas = 0, floats = 10+, modals = 100+). MapStage's `overflow: hidden` clips anything beyond the map bounds — intentional behavior.

**Example:**
```typescript
// In editor-shell.tsx, build mapChildren as an array:
const mapChildren = (
  <>
    {mapElement}
    <FloatingDrawingToolbar
      activeTool={chrome.activeTool}
      onToolSelect={(tool) => dispatch({ type: "setActiveTool", payload: TOOL_MODE[tool] })}
      style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}
    />
    <FloatingLayerPicker
      busCorridorVisible={chrome.busCorridorVisible}
      baselineMode={draft.baselineMode}
      onCorridorToggle={() => dispatch({ type: "toggleCorridors" })}
      onBaselineChange={(mode) => dispatch({ type: "setBaselineMode", payload: mode })}
      style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
    />
  </>
);
```

### Pattern 2: Station-First Drawing Model — Two-Phase Click

**What:** Replace waypoint accumulation with a station-placement model. Each click places a station; the line geometry is derived from station positions. The `DrawingSession` tracks `stationIds` instead of raw `waypoints`.

**Current model:** `DrawingSession.waypoints` accumulates raw `[lng, lat]` coordinates. `finishDrawing` commits them to `line.waypoints`. Stations are a separate tool placed afterward.

**Station-first model:** `DrawingSession.stationIds: string[]` tracks placed station IDs. Each click: create station in `draft.stations` → append ID to `stationIds` → derive `line.waypoints` from the ordered station positions. `finishDrawing` clears the session; the line geometry is already committed from each click.

**When to use:** draw-line mode, which absorbs the old add-station tool flow.

**Trade-offs:** Simplifies UX into a single drawing tool. Makes geometry always station-derived. Dragging a station updates connected lines automatically. Increases coupling between station positions and line waypoints — this is intentional and desirable.

**New type shapes:**
```typescript
// Replaces existing DrawingSession
type DrawingSession = {
  lineId: string;
  stationIds: string[];          // replaces waypoints: [number,number][]
  cursorPosition: [number, number] | null;
  mode: "new" | "extend" | "branch";
};

// New action — replaces addWaypoint in draw-line mode
type PlaceStationOnLineAction = {
  type: "placeStationOnLine";
  payload: {
    stationId: string;
    position: [number, number];
    lineId: string;
    name: string;
  };
};
```

### Pattern 3: Dynamic Station Drag with Connected Geometry

**What:** When `moveStation` fires, all lines whose `stationIds` include the moved station have their `waypoints` recomputed atomically in the same reducer step.

**Current model:** `moveStation` only updates `station.position`. Lines' `waypoints` are independent — dragging a station moves the dot but not the line.

**v2.0 model:** `moveStation` calls `deriveWaypointsFromStations(line, updatedStations)` for every line that includes the moved station. The line geometry updates in real-time during drag.

**New geometry helper:**
```typescript
// In proposal-geometry.ts
export function deriveWaypointsFromStations(
  line: ProposalLineDraft,
  stations: ProposalStationDraft[],
): [number, number][] {
  const stationMap = new Map(stations.map((s) => [s.id, s.position]));
  return line.stationIds
    .map((id) => stationMap.get(id))
    .filter((p): p is [number, number] => p !== undefined);
}
```

### Pattern 4: Auto-Interchange During Drawing

**What:** During the station-first drawing flow, each click checks for nearby existing proposal stations and baseline TTC stations using the existing `findNearbyStation` helper. If a match is found within threshold, fire `suggestInterchange`. The existing reducer path (`suggestInterchange` → `confirmInterchange`) is reused unchanged.

**When to use:** Every `placeStationOnLine` dispatch in the drawing click handler.

**Trade-offs:** Reuses all existing interchange reducer logic. The interrupt (interchange badge popup) during active drawing may feel jarring. Mitigation: auto-link without confirmation at very tight threshold (< 8px); show prompt only at medium distance (8–24px).

## Data Flow

### v1.0 Drawing Flow (current, for reference)

```
User clicks map in draw-line mode
    → dispatch({ type: "addWaypoint", payload: lngLat })
    → DrawingSession.waypoints grows (chrome, not undoable)
User double-clicks
    → dispatch({ type: "finishDrawing" })
    → Reducer commits waypoints → ProposalLineDraft.waypoints (draft, undoable)
    → ProposalLayers re-renders
```

### v2.0 Station-First Drawing Flow

```
User clicks map in draw-line mode
    → TorontoMap.handleClick resolves click to:
        a) existing proposal station (snap) → reuse its id
        b) baseline TTC station (snap) → new station with linkedBaselineStationId
        c) free point → new station at clicked position
    → dispatch({ type: "placeStationOnLine", payload: { stationId, position, lineId, name } })
    → Reducer:
        1. Creates ProposalStationDraft and appends to draft.stations
        2. Appends stationId to DrawingSession.stationIds
        3. Appends stationId to ProposalLineDraft.stationIds
        4. Recomputes ProposalLineDraft.waypoints via deriveWaypointsFromStations
        5. Checks for interchange suggestion (reuses suggestInterchange path)
    → ProposalLayers re-renders immediately — line grows with each click
User clicks "Done" or Escape
    → dispatch({ type: "finishDrawing" })
    → Reducer clears DrawingSession, chrome returns to "select"
```

### Floating Toolbar Data Flow

```
User clicks tool in FloatingDrawingToolbar
    → FloatingDrawingToolbar.onToolSelect(tool)
    → EditorShell dispatch({ type: "setActiveTool", payload: tool })
    → chrome.activeTool updated
    → TorontoMap cursor style + click handler behavior changes
    → FloatingDrawingToolbar re-renders with active tool highlighted
```

### Station Drag + Connected Geometry Update

```
User mousedown on station (select mode)
    → TorontoMap: setDraggingStationId(id)
User mousemove
    → dispatch({ type: "moveStation", payload: { stationId, position: lngLat } })
    → Reducer:
        1. Updates station.position in draft.stations
        2. Finds all lines where line.stationIds.includes(stationId)
        3. For each: recomputes line.waypoints = deriveWaypointsFromStations(line, updatedStations)
    → ProposalLayers re-renders: station dot + connected line geometry move together
User mouseup
    → setDraggingStationId(null), history checkpoint recorded
```

### Sidebar Selection Flow (v2.0 default)

```
Default state: SidebarShell shows LineList with colored line dots
    ↓
User clicks line row in LineList
    → dispatch({ type: "inspectElement", payload: { id, elementType: "line" } })
    → chrome.sidebarPanel = "inspect-line"
    → Sidebar shows LineInspectorPanel (unchanged component)

User clicks station on map
    → dispatch({ type: "inspectElement", payload: { id, elementType: "station" } })
    → chrome.sidebarPanel = "inspect-station"
    → Sidebar shows StationInspectorPanel (updated with street name)

User clicks empty map space
    → chrome.sidebarPanel = "list" (return to default)
```

### Baseline Data Correction Flow

```
No code changes to loaders (lib/baseline/baseline-data.ts stays identical)
Replace GeoJSON files in public/data/:
    ttc-routes.geojson         → corrected line coordinates through station centroids
    ttc-stations.geojson       → accurate station positions
    ttc-routes-future.geojson  → add Eglinton Crosstown (operational), Ontario Line (u/c status)
    ttc-stations-future.geojson → corresponding station points

TtcLayers.tsx update:
    → Read "status" property from future GeoJSON features
    → Apply dashed paint expression for status === "under_construction"
    → Solid stroke for status === "operational" or missing
```

## Component Change Inventory

### Components to REMOVE

| Component | Why |
|-----------|-----|
| `top-toolbar.tsx` | Replaced by `FloatingDrawingToolbar` (tool buttons) and `FloatingLayerPicker` (baseline/corridor toggles). Title and Share button move to a minimal header strip or a floating widget at the top of MapStage. |

### Components to MODIFY (significant changes)

| Component | What Changes | Scope |
|-----------|--------------|-------|
| `editor-frame.tsx` | Remove TopToolbar render. MapStage grows to fill full viewport height. If a title/share header is kept, reduce to ~32px. | Medium — layout restructure |
| `editor-shell.tsx` | Add FloatingDrawingToolbar and FloatingLayerPicker to mapChildren. Remove TopToolbar prop wiring. Add `placeStationOnLine` dispatch. Update TOOL_DISPLAY/TOOL_MODE maps. | Medium — wiring changes |
| `toronto-map.tsx` | Replace `addWaypoint` click path with `placeStationOnLine`. Update `DrawingSession` consumption (stationIds instead of waypoints). Keep drag handlers; `moveStation` now updates line geometry. Remove `onAddWaypoint` prop; add `onPlaceStationOnLine` prop. | Large — core interaction change |
| `proposal-types.ts` | Change `DrawingSession.waypoints` to `DrawingSession.stationIds`. No other type changes required unless new chrome flags are needed for layer picker. | Small — type-only edit |
| `proposal-state.ts` | Add `placeStationOnLine` action. Update `moveStation` to recompute connected waypoints. Update `finishDrawing` for station-first shape. Update `buildInProgressGeoJSON` call signature. | Medium — new action + updated logic |
| `proposal-geometry.ts` | Add `deriveWaypointsFromStations()`. Update `buildInProgressGeoJSON` to accept stations array instead of raw waypoints. | Small — additive |
| `sidebar-shell.tsx` | Update interior default content from empty state to LineList. Keep toggle rail and width behavior unchanged. | Small |
| `station-inspector-panel.tsx` | Add auto-generated street name from reverse geocoding (local streets GeoJSON or Nominatim). | Small — additive only |
| `ttc-layers.tsx` | Add conditional dashed stroke paint expression for `status === "under_construction"` GeoJSON property. | Small |

### Components to CREATE (new)

| Component | Purpose | Location |
|-----------|---------|---------|
| `FloatingDrawingToolbar` | Tool selector pill (Select, Draw, Erase) with keyboard shortcut hints. Pure display — no local state. | `components/editor/floating/drawing-toolbar.tsx` |
| `FloatingLayerPicker` | Toggle panel for baseline mode (Today / Future committed), bus corridors, GO visibility. Replaces TopToolbar right-side controls. | `components/editor/floating/layer-picker.tsx` |

### Components to KEEP (no meaningful changes)

| Component | Why No Change |
|-----------|---------------|
| `map-stage.tsx` | Already `position:relative`, already slots children + banner. No changes needed. |
| `line-list.tsx` | Minor color-dot visual update at most; structure and props unchanged. |
| `line-inspector-panel.tsx` | No change needed for v2.0. |
| `proposal-layers.tsx` | Renders from GeoJSON derived from draft. Station-first model produces the same GeoJSON shape. |
| `proposal-stats.ts` | Operates on draft data; station-first model produces same draft structure. |
| `lib/sharing/` | URL hash encode/decode operates on `ProposalDraft` — same structure. |
| `ConfirmationDialog` | Reused as-is. |
| `ShareModal` | Reused as-is. |
| `InterchangeBadge` | Reused as-is — triggered from drawing handler instead of add-station handler. |
| `StationNamePopover` | Reused as-is — shown after `placeStationOnLine` dispatch. |
| `OnboardingTooltip` | Reused as-is; tooltip copy updated for new UI. |

## Integration Points

### EditorShell → FloatingDrawingToolbar and FloatingLayerPicker

Both are pure display components receiving props from EditorShell. They render inside the mapChildren slot alongside `mapElement`:

```typescript
// editor-shell.tsx
const mapChildren = (
  <>
    {mapElement}
    <FloatingDrawingToolbar
      activeTool={TOOL_DISPLAY[chrome.activeTool]}
      onToolSelect={(tool) => dispatch({ type: "setActiveTool", payload: TOOL_MODE[tool] })}
    />
    <FloatingLayerPicker
      busCorridorVisible={chrome.busCorridorVisible}
      baselineMode={draft.baselineMode}
      onCorridorToggle={() => dispatch({ type: "toggleCorridors" })}
      onBaselineChange={(mode) => dispatch({ type: "setBaselineMode", payload: mode })}
    />
  </>
);
```

No portal. No z-index conflicts. MapStage's `position: relative` container is the correct stacking context.

### TorontoMap → Station-First Drawing Interaction

The `onAddWaypoint` prop is removed and replaced by `onPlaceStationOnLine`:

```typescript
type TorontoMapProps = {
  // REMOVED: onAddWaypoint?: (lngLat: [number, number]) => void;
  onPlaceStationOnLine?: (
    stationId: string,
    position: [number, number],
    lineId: string,
    name: string,
  ) => void;
  // ... all other props unchanged
};
```

EditorShell generates `stationId = crypto.randomUUID()` and the default name, then dispatches `placeStationOnLine`. TorontoMap handles snap resolution and passes the resolved position up.

### DrawingSession → In-Progress Ghost Line

`buildInProgressGeoJSON` currently takes `DrawingSession | null` and reads `session.waypoints`. After the change it reads `session.stationIds`, resolves positions from `draft.stations`, and appends the cursor position as the final point:

```typescript
// Updated signature in proposal-geometry.ts
export function buildInProgressGeoJSON(
  session: DrawingSession | null,
  stations: ProposalStationDraft[],  // NEW: needed to resolve stationIds
  color: string,
): FeatureCollection
```

This is a breaking change to the existing call site in `toronto-map.tsx` — update both together.

### Baseline Data → TtcLayers Status Styling

The future GeoJSON files need a `status` property on each feature:

```json
{ "properties": { "status": "under_construction" } }  // Ontario Line
{ "properties": { "status": "operational" } }          // Eglinton Crosstown
```

TtcLayers reads this to apply a MapLibre paint expression:

```typescript
// In ttc-layers.tsx, line paint
"line-dasharray": ["case",
  ["==", ["get", "status"], "under_construction"], ["literal", [4, 4]],
  ["literal", [1, 0]]  // solid
]
```

### Sidebar → Selection Events

The `sidebarPanel` conditional logic in `editor-shell.tsx` is simplified. The v1.0 `"drawing-status"` panel (rendered in the sidebar) becomes unnecessary once drawing status moves to a floating toolbar overlay. The default panel is always `"list"` unless `chrome.sidebarPanel` is explicitly `"inspect-line"` or `"inspect-station"`.

## Scaling Considerations

Client-only app; network scaling is irrelevant. Relevant scale is proposal complexity:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Small (1–5 lines, < 20 stations) | Current model fine. All re-renders are O(n) on small n. |
| Medium (5–20 lines, 20–100 stations) | Station drag recomputes all connected line geometries per mousemove event. Consider committing `moveStation` only on mouseup and using local TorontoMap state for drag preview (avoids reducer+history thrash during drag). |
| Large (20+ lines, 100+ stations) | GeoJSON rebuild on cursor move becomes expensive. Memoize `buildProposalLinesGeoJSON` more aggressively. Separate "drawing preview layer" from "committed lines layer" to reduce re-renders during active drawing. |

## Anti-Patterns

### Anti-Pattern 1: Dual Geometry Sources (waypoints + stationIds in parallel)

**What people do:** Keep `DrawingSession.waypoints` alongside the new `DrawingSession.stationIds`, updating both in parallel.

**Why it's wrong:** Creates a synchronization burden. When stations are moved, both sources must stay consistent. Divergence bugs are subtle and hard to test.

**Do this instead:** Remove `waypoints` from DrawingSession. Station positions are the single source of truth. `line.waypoints` is always derived. The reducer does not store raw coordinates in the drawing session.

### Anti-Pattern 2: Floating Toolbars as Portal Renders

**What people do:** Use `createPortal` to render floating toolbars outside the MapStage DOM tree, targeting `document.body`.

**Why it's wrong:** MapStage is already `position: relative` and `overflow: hidden` — it is the correct and intended stacking context. Portals escape this context and require manual z-index coordination with the MapLibre canvas, Popup overlays, and modal layers.

**Do this instead:** Pass floating components as children of MapStage via the `mapChildren` slot already implemented in EditorFrame. No portal needed.

### Anti-Pattern 3: Local Tool State in FloatingDrawingToolbar

**What people do:** Give FloatingDrawingToolbar its own `useState` for the active tool to avoid prop drilling from EditorShell.

**Why it's wrong:** `chrome.activeTool` drives TorontoMap's cursor behavior and click handling. Duplicating it in FloatingDrawingToolbar creates split-brain — the toolbar shows one tool but the map responds to another.

**Do this instead:** FloatingDrawingToolbar is a pure display component. It receives `activeTool` and `onToolSelect` as props from EditorShell. Zero local state for tool selection.

### Anti-Pattern 4: Baseline Data Correction as Runtime Transforms

**What people do:** Patch incorrect coordinates in JavaScript at load time (`baseline-data.ts`), applying coordinate offsets or property replacements to the fetched GeoJSON.

**Why it's wrong:** Fragile, hard to verify visually, slows the load path, and mixes data concerns into loader code.

**Do this instead:** Replace the GeoJSON source files directly in `public/data/`. Loaders stay clean. Verify corrections visually against satellite imagery before shipping.

### Anti-Pattern 5: Drawing Status Panel in Sidebar During Station-First Drawing

**What people do:** Keep the `"drawing-status"` sidebar panel (with "Finish Line" / "Cancel" buttons) from v1.0.

**Why it's wrong:** In the station-first Excalidraw-style model, status and finish/cancel controls belong in the FloatingDrawingToolbar, not in the sidebar. Putting them in the sidebar breaks the "map is the entire experience" principle.

**Do this instead:** FloatingDrawingToolbar shows drawing status contextually (station count, active line name, finish/cancel actions) when a drawing session is active. The sidebar stays on its default line list.

## Suggested Build Order

Dependencies between features determine a safe build order:

```
1. Baseline data correction
   (pure data work, no code changes, independent of everything)

2. Full-screen layout + FloatingDrawingToolbar + FloatingLayerPicker
   (remove TopToolbar, restructure EditorFrame, create floating components)
   (layout only — existing state and drawing model untouched)

3. Station-first drawing model
   (DrawingSession type change, new placeStationOnLine action, updated TorontoMap click handler)
   (most invasive change — do atomically with tests; breaks addWaypoint call sites)

4. Dynamic station drag + connected geometry update
   (extends moveStation reducer to call deriveWaypointsFromStations)
   (depends on station-first model being in place)

5. Sidebar redesign
   (default line list, selection-triggered info panels, remove drawing-status panel)
   (independent of drawing model; can be done after step 2)

6. Auto-generated station names
   (additive enhancement to StationInspectorPanel; depends on data source choice)
```

Steps 2 and 5 are independent and can be parallelized if worked by separate contributors.

## Sources

- Direct codebase analysis: `components/editor/editor-shell.tsx`, `editor-frame.tsx`, `top-toolbar.tsx`, `map-stage.tsx`, `sidebar-shell.tsx`, `toronto-map.tsx`
- Direct codebase analysis: `lib/proposal/proposal-types.ts`, `proposal-state.ts`, `proposal-geometry.ts`
- Direct codebase analysis: `lib/baseline/baseline-data.ts`
- `.planning/PROJECT.md` — v2.0 milestone feature list
- `docs/product/ui-vision.md` — map-first, manual control principles

---
*Architecture research for: Toronto Transit Sandbox v2.0 — floating toolbars, station-first drawing, sidebar redesign, baseline data correction, dynamic station drag*
*Researched: 2026-04-01*
