# Phase 3: Editing Core - Research

**Researched:** 2026-03-31
**Domain:** Interactive map geometry editing — MapLibre GL / react-map-gl, GeoJSON data modelling, undo/redo, spatial geometry helpers
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDIT-01 | User can create a new subway, LRT, or BRT line | Data model section; draw-line click pattern |
| EDIT-02 | User can extend an existing TTC line from an existing endpoint | Endpoint detection pattern; extend-mode flow |
| EDIT-03 | User can branch an existing TTC line | Branch-point detection; separate line entity pattern |
| EDIT-04 | User can build a multi-line proposal | ProposalDraft.lines array; reducer actions |
| EDIT-05 | Existing TTC infrastructure stays fixed | Baseline read-only guard in reducer; no mutation of baseline data |
| EDIT-06 | User can draw a route and then adjust geometry | Waypoint dragging via select tool; waypoints stored in line geometry |
| EDIT-07 | User can place stations manually | Add-station click; nearestPointOnLine snap |
| EDIT-08 | User can use shared stations across multiple lines | SharedStation entity; lineIds array |
| EDIT-09 | Crossing lines do not auto-connect unless user confirms | No implicit merge; interchange only via explicit suggestion flow |
| EDIT-10 | Interchange suggestion when near existing station | Screen-distance threshold check; suggestion badge pattern |
| EDIT-11 | Light snapping and guidance without forcing placement | map.project()/unproject() for screen-distance; snap cue ring only |
| EDIT-12 | User can undo, redo, and delete editing actions | Past/present/future history wrapper around reducer |
| STYLE-01 | User can name new lines | name field on ProposalLineDraft |
| STYLE-02 | User can name new stations | name field on ProposalStationDraft |
| STYLE-03 | User can customize proposal line colors | color field; 12-swatch picker |
| STYLE-04 | New proposal lines start with a distinct default color | DEFAULT_LINE_COLORS palette, sequential assignment |
</phase_requirements>

---

## Summary

Phase 3 implements the full interactive editing loop: drawing lines, placing stations, extending/branching TTC lines, interchange suggestions, and undo/redo. The technical foundation — MapLibre GL via react-map-gl/maplibre — is already in place from Phase 2. All editing state lives in the existing `proposalEditorReducer` / `EditorShellState` model, which must be extended.

The central technical pattern is: React state owns all geometry (as GeoJSON FeatureCollections), and the reactive `Source data={...}` prop in react-map-gl automatically syncs the map when state changes. Click events on the `<Map>` component provide `e.lngLat` for placing waypoints and stations. No drawing plugin is required — the existing react-map-gl click/mousemove handlers are sufficient for this scale of interaction.

Undo/redo is implemented as a history wrapper (past/present/future arrays) around the existing reducer, not a separate command-pattern library. Spatial helpers from `@turf/turf` handle nearest-point-on-line snapping and distance calculations.

**Primary recommendation:** Extend the existing proposal reducer with geometry, add a history wrapper for undo/redo, and drive all map rendering through reactive GeoJSON `Source` components — no third-party drawing plugins needed.

---

## Project Constraints (from CLAUDE.md)

Key CLAUDE.md directives that constrain this phase:

- **TypeScript 5** — all new files must be `.ts` / `.tsx` with strict types
- **Next.js 16 App Router** — client components need `"use client"` directive; no SSR for map components
- **No new icon library** — text labels only per UI-SPEC
- **No shadcn** — hand-authored CSS custom property token system only per UI-SPEC
- **2-space indentation, double quotes, semicolons** — code style conventions
- **`import type`** for type-only imports
- **`Readonly<{...}>`** for component props
- **Tests for domain logic and geometry helpers** — add tests where practical per AGENTS.md
- **Keep phases small and shippable** — do not over-engineer the data model for v1
- **Baseline TTC infrastructure may only change through allowed extensions and branches** — baseline data is read-only in reducer logic
- **Desktop-first** — no mobile touch events required in Phase 3
- **Manual placement with light snapping** — automation must not override user intent

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| maplibre-gl | 5.21.1 | Map renderer, event system | Already in use; provides project/unproject, MapMouseEvent |
| react-map-gl | 8.1.0 | React wrapper for MapLibre | Already in use; Source/Layer components, onClick/onMouseMove props |

### New Addition Required
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @turf/turf | 7.3.4 | Geospatial helpers: nearestPointOnLine, distance, bearing | Industry standard for browser-side GeoJSON geometry; handles snapping and interchange detection |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @turf/turf (individual packages) | Hand-rolled geometry | Turf's `nearestPointOnLine` solves the projection-to-segment math correctly in geodetic coordinates; hand-rolling introduces precision bugs at Toronto's latitude |
| React state + Source data prop | maplibre-gl-terradraw / maplibre-geoman | Drawing plugins add 3rd-party UI and interaction conventions that conflict with the bespoke tool-mode design; overkill for click-to-draw waypoints |
| Past/present/future history wrapper | react-use-history-reducer (npm pkg) | The wrapper pattern is 30 lines of code and zero new dependencies; keeps history inside the existing reducer |

**Installation:**
```bash
npm install @turf/turf
```

**Version verification:**
```bash
npm view @turf/turf version
# → 7.3.4 (verified 2026-03-31)
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)

```
lib/
├── proposal/
│   ├── proposal-types.ts         # Extend with geometry fields (waypoints, sharedStation)
│   ├── proposal-state.ts         # Add EDIT actions to reducer
│   ├── proposal-history.ts       # NEW: past/present/future undo-redo wrapper
│   ├── proposal-geometry.ts      # NEW: pure geometry helpers (snap, distance, endpoint detection)
│   └── index.ts                  # Re-export all
components/
├── editor/
│   ├── editor-shell.tsx          # Wire history wrapper; pass draft + dispatch to map + sidebar
│   ├── toronto-map.tsx           # Extend with proposal layers + drawing event handlers
│   ├── sidebar-shell.tsx         # Pass sidebarChildren from EditorShell
│   └── sidebar/                  # NEW: sidebar content components
│       ├── line-list.tsx          # Proposal line list + Add Line button
│       └── line-creation-panel.tsx # New line form (name, mode, color)
├── map/
│   └── proposal-layers.tsx       # NEW: proposal lines + stations + in-progress drawing
```

### Pattern 1: Geometry Storage — GeoJSON with Waypoints Array

**What:** Store each proposal line's route as an array of `[lng, lat]` coordinate pairs (waypoints) plus derived GeoJSON for rendering. Stations store a `[lng, lat]` point and optionally snap to a line segment.

**When to use:** Always — GeoJSON is the native format for MapLibre Source components; having an explicit waypoints array enables waypoint dragging/editing without re-parsing GeoJSON.

```typescript
// Source: proposal-types.ts extension for Phase 3
export type TransitMode = "subway" | "lrt" | "brt";

export type ProposalLineDraft = {
  id: string;
  name: string;
  color: string;
  mode: TransitMode;
  waypoints: [number, number][];   // [lng, lat] pairs — source of truth for geometry
  stationIds: string[];
  // Extension/branch linkage
  parentLineId?: string;           // set when branching from a TTC or proposal line
  parentStationId?: string;        // for branches: the station where branch diverges
  branchPoint?: [number, number];  // [lng, lat] of branch origin on parent segment
  isExtension?: boolean;           // true when extending an existing TTC endpoint
};

export type ProposalStationDraft = {
  id: string;
  name: string;
  position: [number, number];      // [lng, lat] — snapped to segment if placed via Add Station
  lineIds: string[];               // all lines sharing this station (length > 1 = interchange)
  // Interchange linkage
  linkedBaselineStationId?: string; // if this is an interchange with a TTC station
};
```

**Why GeoJSON FeatureCollection for rendering is derived, not stored:**
Store only `waypoints` and `position` as plain coordinate arrays. Derive the FeatureCollection in a selector function passed to `<Source data={...}>`. This keeps the reducer state serializable/JSON-friendly and avoids storing duplicate representation.

```typescript
// Source: lib/proposal/proposal-geometry.ts (new file)
import type { FeatureCollection } from "geojson";
import type { ProposalDraft } from "./proposal-types";

export function buildProposalLinesGeoJSON(draft: ProposalDraft): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: draft.lines
      .filter((l) => l.waypoints.length >= 2)
      .map((l) => ({
        type: "Feature",
        id: l.id,
        properties: { id: l.id, color: l.color, mode: l.mode },
        geometry: { type: "LineString", coordinates: l.waypoints },
      })),
  };
}

export function buildProposalStationsGeoJSON(draft: ProposalDraft): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: draft.stations.map((s) => ({
      type: "Feature",
      id: s.id,
      properties: { id: s.id, name: s.name, lineIds: s.lineIds.join(",") },
      geometry: { type: "Point", coordinates: s.position },
    })),
  };
}
```

### Pattern 2: Drawing Interaction — React State + Map Events

**What:** The `<Map>` component's `onClick` and `onMouseMove` handlers feed raw `e.lngLat` into reducer actions. An in-progress drawing state holds the current partial waypoint list separately from committed lines.

**When to use:** All draw-line, extend, and branch interactions.

```typescript
// Source: lib/proposal/proposal-types.ts — drawing session state
export type DrawingSession = {
  lineId: string;                  // the line being drawn
  waypoints: [number, number][];   // committed waypoints so far
  cursorPosition: [number, number] | null; // live cursor for ghost segment
  mode: "new" | "extend" | "branch";
};

export type EditorChromeState = {
  activeTool: ToolMode;
  sidebarOpen: boolean;
  busCorridorVisible: boolean;
  drawingSession: DrawingSession | null; // null when not drawing
  pendingInterchangeSuggestion: InterchangeSuggestion | null;
};

export type InterchangeSuggestion = {
  newStationPosition: [number, number];
  nearbyStationId: string;         // TTC or proposal station being suggested
  nearbyStationName: string;
  lineId: string;
};
```

**Map event wiring (pattern, not final code):**

```typescript
// In toronto-map.tsx: onClick dispatches based on activeTool
const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
  const { lng, lat } = e.lngLat;
  if (activeTool === "draw-line") {
    if (e.originalEvent.detail === 2) {
      // Double-click: finish drawing
      dispatch({ type: "finishDrawing" });
    } else {
      dispatch({ type: "addWaypoint", payload: [lng, lat] });
    }
  } else if (activeTool === "add-station") {
    dispatch({ type: "placeStation", payload: [lng, lat] });
  } else if (activeTool === "select") {
    // Feature selection handled via interactiveLayerIds
  }
}, [activeTool, dispatch]);
```

**Key insight:** `e.lngLat` from `MapLayerMouseEvent` provides geographic coordinates directly. No need to call `unproject()` manually when using the `onClick` prop on `<Map>`.

### Pattern 3: Proposal Rendering — Reactive Source/Layer Components

**What:** Derive GeoJSON FeatureCollections from proposal state (via selector functions) and pass them as the `data` prop to `<Source>` components. react-map-gl's shallow prop comparison triggers `setData()` internally whenever the reference changes.

**When to use:** All proposal line and station rendering.

```typescript
// Source: components/map/proposal-layers.tsx (new file)
// Source: react-map-gl docs (https://visgl.github.io/react-map-gl/docs/get-started/adding-custom-data)
import { Source, Layer } from "react-map-gl/maplibre";

type ProposalLayersProps = Readonly<{
  linesGeoJSON: FeatureCollection;
  stationsGeoJSON: FeatureCollection;
  inProgressGeoJSON: FeatureCollection | null;  // ghost segment + cursor dot
}>;

export function ProposalLayers({ linesGeoJSON, stationsGeoJSON, inProgressGeoJSON }: ProposalLayersProps) {
  return (
    <>
      <Source id="proposal-lines" type="geojson" data={linesGeoJSON}>
        <Layer
          id="proposal-lines-stroke"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": 4,
          }}
          layout={{ "line-cap": "round", "line-join": "round" }}
        />
      </Source>
      <Source id="proposal-stations" type="geojson" data={stationsGeoJSON}>
        <Layer id="proposal-stations-circle" type="circle" paint={{
          "circle-radius": 4,
          "circle-color": "#FFFFFF",
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "color"],
        }} />
      </Source>
      {inProgressGeoJSON && (
        <Source id="proposal-in-progress" type="geojson" data={inProgressGeoJSON}>
          <Layer id="proposal-in-progress-line" type="line" paint={{
            "line-color": "var(--proposal-line-pending)",
            "line-width": 4,
            "line-dasharray": [2, 1],
          }} layout={{ "line-cap": "round" }} />
        </Source>
      )}
    </>
  );
}
```

**Critical note on performance:** Compute GeoJSON FeatureCollections with `useMemo` keyed on `draft.lines` / `draft.stations` references to avoid unnecessary `setData()` calls on unrelated state changes.

### Pattern 4: Undo/Redo — Past/Present/Future History Wrapper

**What:** Wrap the existing `proposalEditorReducer` with a history meta-reducer that maintains `{ past: EditorShellState[], present: EditorShellState, future: EditorShellState[] }`. Only proposal draft mutations (not chrome/UI state changes) push to history.

**When to use:** All `EDIT-*` and `STYLE-*` actions push to history. `setActiveTool`, `toggleSidebar`, `setBaselineMode` do NOT push to history.

```typescript
// Source: lib/proposal/proposal-history.ts (new file)
// Pattern: Redux "Implementing Undo History" (https://redux.js.org/usage/implementing-undo-history)

type HistoryState = {
  past: ProposalDraft[];
  present: EditorShellState;
  future: ProposalDraft[];
};

type UndoAction = { type: "undo" };
type RedoAction = { type: "redo" };
type HistoryAction = UndoAction | RedoAction | EditorShellAction;

// Actions that modify the draft and should be tracked in history:
const HISTORY_ACTIONS = new Set([
  "addLine", "deleteLine", "addWaypoint", "finishDrawing",
  "placeStation", "deleteStation", "linkInterchange", "updateLineName",
  "updateLineColor", "updateStationName", "moveStation", "moveWaypoint",
]);

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  if (action.type === "undo") {
    if (state.past.length === 0) return state;
    const [newPresent, ...newPast] = [...state.past].reverse();
    // ...swap present and past
  }
  if (action.type === "redo") {
    // ...swap present and future
  }
  const nextPresent = proposalEditorReducer(state.present, action as EditorShellAction);
  if (HISTORY_ACTIONS.has(action.type)) {
    return { past: [...state.past, state.present.draft], present: nextPresent, future: [] };
  }
  return { ...state, present: nextPresent };
}
```

**Maximum history depth:** 50 entries. Slice `past` array at 50 to avoid unbounded memory growth.

### Pattern 5: Snapping — Screen-Distance Check with Turf

**What:** On every `onMouseMove`, compute screen distance between cursor and each nearby snap candidate (station dot, endpoint, segment). If within 12px screen threshold, snap the cursor position.

**When to use:** Draw-line and add-station tool modes.

```typescript
// Source: lib/proposal/proposal-geometry.ts
import { nearestPointOnLine, point, lineString, distance } from "@turf/turf";

/**
 * Given cursor in lngLat and a map instance, find the nearest snappable point
 * within pixelThreshold screen pixels.
 * Returns the snapped lngLat if found, otherwise null.
 */
export function findSnapTarget(
  cursorLngLat: [number, number],
  candidates: Array<{ lngLat: [number, number]; type: "station" | "endpoint" }>,
  lineCandidates: Array<[number, number][]>,  // each is a waypoints array
  map: maplibregl.Map,
  pixelThreshold: number,
): [number, number] | null {
  const cursorPoint = map.project(cursorLngLat);

  // Check station/endpoint candidates (exact points)
  for (const c of candidates) {
    const candidatePoint = map.project(c.lngLat);
    const dx = cursorPoint.x - candidatePoint.x;
    const dy = cursorPoint.y - candidatePoint.y;
    if (Math.sqrt(dx * dx + dy * dy) <= pixelThreshold) {
      return c.lngLat;
    }
  }

  // Check segment candidates (nearest point on line)
  for (const waypoints of lineCandidates) {
    if (waypoints.length < 2) continue;
    const line = lineString(waypoints);
    const snapped = nearestPointOnLine(line, point(cursorLngLat));
    const snappedPixel = map.project(snapped.geometry.coordinates as [number, number]);
    const dx = cursorPoint.x - snappedPixel.x;
    const dy = cursorPoint.y - snappedPixel.y;
    if (Math.sqrt(dx * dx + dy * dy) <= pixelThreshold) {
      return snapped.geometry.coordinates as [number, number];
    }
  }
  return null;
}
```

**Key insight:** All snap distance comparisons happen in screen pixels (via `map.project()`), not geographic distance. This is correct because the snap threshold is a UX concern ("12px on screen") not a geographic one. The `map` reference is obtained via `useMap()` from react-map-gl or via a `ref` on the `<Map>` component.

### Pattern 6: Interchange Suggestion Detection

**What:** When the user places a station (`add-station` click), check if any existing station (TTC baseline or proposal) is within 20px screen distance. If yes, set `pendingInterchangeSuggestion` in chrome state and show the badge.

**Critical rule from REQUIREMENTS (EDIT-09):** Crossing lines that do NOT go through the interchange flow are never connected. Only explicit `Yes` confirmation creates an interchange link.

```typescript
// In reducer: placeStation action
case "placeStation": {
  const { position } = action.payload;
  const nearbyStation = findNearbyStation(position, state, map, 20);
  if (nearbyStation) {
    // Don't create the station yet — hold the suggestion
    return {
      ...state,
      chrome: {
        ...state.chrome,
        pendingInterchangeSuggestion: {
          newStationPosition: position,
          nearbyStationId: nearbyStation.id,
          nearbyStationName: nearbyStation.name,
          lineId: state.chrome.drawingSession!.lineId,
        },
      },
    };
  }
  // No nearby station: create station directly
  return addStationToState(state, position);
}
```

### Pattern 7: Extend vs Branch Detection

**What:** When user clicks in draw-line mode on an existing line (TTC or proposal), determine whether the click is:
1. Near an **endpoint** → enter extend mode
2. Near a **mid-segment** → enter branch mode

**Detection logic:**
- Extend: cursor within 12px of a line's first or last waypoint
- Branch: cursor within 12px of any mid-segment point (not an endpoint)

```typescript
export function detectLineHitType(
  cursorLngLat: [number, number],
  line: { waypoints: [number, number][]; id: string },
  map: maplibregl.Map,
  pixelThreshold: number,
): "extend-start" | "extend-end" | "branch" | null {
  const first = line.waypoints[0];
  const last = line.waypoints[line.waypoints.length - 1];

  const cursorPixel = map.project(cursorLngLat);

  const firstPixel = map.project(first);
  const lastPixel = map.project(last);

  if (dist2D(cursorPixel, firstPixel) <= pixelThreshold) return "extend-start";
  if (dist2D(cursorPixel, lastPixel) <= pixelThreshold) return "extend-end";

  // Check if on a mid-segment
  const turfLine = lineString(line.waypoints);
  const snapped = nearestPointOnLine(turfLine, point(cursorLngLat));
  const snappedPixel = map.project(snapped.geometry.coordinates as [number, number]);
  if (dist2D(cursorPixel, snappedPixel) <= pixelThreshold) return "branch";

  return null;
}
```

### Anti-Patterns to Avoid

- **Do not call `map.addSource()` / `map.addLayer()` imperatively in useEffect.** Use react-map-gl's `<Source>` and `<Layer>` components. Mixing imperative and declarative approaches causes layers to disappear on re-render (confirmed issue: GitHub terra-draw #197 with react-map-gl).
- **Do not store GeoJSON FeatureCollections in reducer state.** Store coordinate arrays; derive FeatureCollections in selectors outside the reducer. GeoJSON objects in state bloat history entries.
- **Do not push chrome state changes to undo history.** Only draft mutations (line/station edits) belong in history. Tool mode, sidebar state, etc. are UI-only and should not be undoable.
- **Do not double-click detect with a timer.** MapLibre/react-map-gl fires `onDblClick` as a separate event. Use `onDblClick` for "finish drawing" rather than inspecting `e.originalEvent.detail === 2` inside `onClick`.
- **Do not use `@turf/turf` individual sub-packages as a mix.** Install `@turf/turf` as the monolith — it tree-shakes correctly with Next.js/webpack and avoids version skew between individual packages at 7.x.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Nearest point on a line segment | Custom segment projection math | `nearestPointOnLine` from `@turf/turf` | Handles geodetic curvature; handles multi-segment lines; returns segment index for correct branch-point attribution |
| Geographic distance for interchange detection | Custom Haversine formula | `distance()` from `@turf/turf` | Correct on WGS84 ellipsoid; handles edge cases at Toronto's latitude (~43.7°N) |
| Screen-pixel snapping distance | Geographic distance threshold | `map.project()` to convert to pixels first | Snap "feels" based on screen size not geographic units — 12px threshold should feel the same at all zoom levels |
| Undo/redo stack | External library like `use-undo` | 30-line history wrapper in `proposal-history.ts` | Zero new dependencies; integrates naturally with existing reducer; easy to tune which actions push history |

**Key insight:** Spatial math on geographic coordinates requires proper geodetic handling. Turf provides this; hand-rolled Euclidean approximations accumulate error when line segments span kilometers.

---

## Common Pitfalls

### Pitfall 1: Stale Map Reference in Event Handlers
**What goes wrong:** `map.project()` called inside a React closure captures a stale map instance, returning wrong pixel coordinates for snapping.
**Why it happens:** `useMap()` hook or `useRef` on `<Map>` can return null or stale reference during the first few renders.
**How to avoid:** Access the map ref via `useMap()` from `react-map-gl/maplibre` inside the event handler callback, or wrap snap calls in a null-guard: `if (!mapRef.current) return`.
**Warning signs:** Snap cues appear at wrong positions; snap appears to "stick" after map pan.

### Pitfall 2: GeoJSON Source Not Updating After State Change
**What goes wrong:** Waypoints are added to reducer state but the line doesn't appear on the map.
**Why it happens:** The `data` prop reference hasn't changed because the FeatureCollection is being re-created inline in the render function but shallow equality fails to detect it.
**How to avoid:** Compute the GeoJSON FeatureCollection with `useMemo` keyed on `draft.lines`. Because arrays are reference-equal, update the `lines` array reference on every mutation (standard immutable reducer pattern).
**Warning signs:** Line renders after a second state update but not the first.

### Pitfall 3: Double-Click Fires Two Clicks Before dblClick
**What goes wrong:** User double-clicks to finish drawing but two extra waypoints are placed first.
**Why it happens:** MapLibre fires `click` twice before `dblclick`. Using `onClick` to detect `detail === 2` fires after waypoints are already placed.
**How to avoid:** Use `onDblClick` on the `<Map>` component to dispatch `finishDrawing`. In `onClick`, add a 200ms debounce or check if `drawingSession` is still active.
**Warning signs:** Last committed line has two stray waypoints near the double-click location.

### Pitfall 4: Interchange Suggestion Persists After Tool Change
**What goes wrong:** `pendingInterchangeSuggestion` badge stays visible after user switches tools.
**Why it happens:** `setActiveTool` action doesn't clear the suggestion.
**How to avoid:** In the `setActiveTool` reducer case, clear `pendingInterchangeSuggestion: null`.
**Warning signs:** Badge appears even when Select tool is active.

### Pitfall 5: Undo Reverts Chrome State (Tool Mode etc.)
**What goes wrong:** User presses Cmd+Z expecting to undo a station placement; instead their active tool reverts.
**Why it happens:** History wrapper stores full `EditorShellState` (both draft and chrome) in past array.
**How to avoid:** Only store `ProposalDraft` (not `EditorChromeState`) in past/future arrays. On undo, restore only the draft portion; leave chrome intact.
**Warning signs:** Active tool changes on Cmd+Z.

### Pitfall 6: TTC Baseline Stations Clickable as Interchange Targets
**What goes wrong:** TTC stations are not in `interactiveLayerIds` so they can't be detected via `e.features`.
**Why it happens:** `interactiveLayerIds` in `toronto-map.tsx` currently only includes `"ttc-stations-circle"`.
**How to avoid:** The interchange suggestion detection should happen via a spatial scan of `ttcStations` FeatureCollection using Turf's `distance()`, not via click-layer detection. Pass `ttcStations` down to the snap/interchange detection logic.
**Warning signs:** Interchange suggestion never fires near TTC stations.

### Pitfall 7: Multiple Sources Sharing "proposal-lines" ID
**What goes wrong:** React re-mounts `ProposalLayers` component and tries to re-add a source that already exists in MapLibre's internal state.
**Why it happens:** MapLibre source IDs are global to the map instance. If a component mounts twice (strict mode, hot reload), `addSource` is called on an already-registered ID.
**How to avoid:** react-map-gl's `<Source>` handles add/remove lifecycle automatically. Never call `map.addSource()` directly for proposal layers.
**Warning signs:** Console error "A source with this ID already exists."

---

## Code Examples

Verified patterns from official sources and existing codebase:

### Accessing lngLat from Map onClick
```typescript
// Source: MapLibre GL JS API (https://maplibre.org/maplibre-gl-js/docs/API/classes/MapMouseEvent/)
// Source: existing toronto-map.tsx pattern (Phase 2)
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

const handleClick = useCallback((e: MapLayerMouseEvent) => {
  const { lng, lat } = e.lngLat;  // geographic coordinates
  // e.point gives screen pixels if needed
}, []);

// On <Map>:
<Map onClick={handleClick} onMouseMove={handleMouseMove} ... />
```

### Reactive GeoJSON Source Update
```typescript
// Source: react-map-gl docs (https://visgl.github.io/react-map-gl/docs/get-started/adding-custom-data)
// Memoize to avoid spurious setData() calls
const linesGeoJSON = useMemo(
  () => buildProposalLinesGeoJSON(draft),
  [draft.lines]  // only recompute when lines array reference changes
);

<Source id="proposal-lines" type="geojson" data={linesGeoJSON}>
  <Layer id="proposal-lines-stroke" type="line" paint={{ "line-color": ["get", "color"], "line-width": 4 }} />
</Source>
```

### Keyboard Undo/Redo Handler
```typescript
// Standard browser keyboard pattern — no library needed
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.startsWith("Mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      dispatch({ type: "undo" });
    }
    if (mod && e.key === "z" && e.shiftKey) {
      e.preventDefault();
      dispatch({ type: "redo" });
    }
    if ((e.key === "Backspace" || e.key === "Delete") && selectedElementId) {
      dispatch({ type: "deleteSelected", payload: selectedElementId });
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [dispatch, selectedElementId]);
```

### DataExpression for Per-Feature Line Color
```typescript
// Source: MapLibre GL JS paint expressions
// Each feature has a "color" property; this reads it directly
<Layer
  id="proposal-lines-stroke"
  type="line"
  paint={{
    "line-color": ["get", "color"],   // reads feature.properties.color
    "line-width": 4,
  }}
  layout={{ "line-cap": "round", "line-join": "round" }}
/>
```

### Finding Nearest Point on a Line (Turf)
```typescript
// Source: Turf.js docs (https://turfjs.org/docs/api/nearestPointOnLine)
import { nearestPointOnLine, lineString, point } from "@turf/turf";

const line = lineString(waypoints);  // waypoints: [number, number][]
const snapped = nearestPointOnLine(line, point([lng, lat]));
// snapped.geometry.coordinates: [lng, lat] of nearest point
// snapped.properties.index: segment index
// snapped.properties.dist: distance in km
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| mapbox-gl-draw (drawing plugin) | Hand-rolled click-to-draw + Turf for geometry | 2023–2024 | mapbox-gl-draw is no longer actively maintained; Terra Draw is the modern plugin but adds UI conventions incompatible with bespoke tool modes |
| Imperative `map.addSource()` in useEffect | Declarative `<Source data={state}>` in JSX | react-map-gl v6+ | Declarative approach avoids source lifecycle bugs; data updates flow reactively |
| `useMemo` with full state object as dependency | Narrow dep arrays: `[draft.lines]`, `[draft.stations]` | React perf best practice | Prevents unnecessary GeoJSON recomputation on chrome-only state changes |

**Deprecated/outdated:**
- `mapbox-gl-draw` / `@mapbox/mapbox-gl-draw`: Not maintained; MapLibre-specific fork exists but Terra Draw is the current recommendation for drawing plugins if one were needed.
- Storing GeoJSON objects directly in Redux/reducer state: Current best practice is to store normalized primitive data (coordinate arrays) and derive GeoJSON via selectors.

---

## Open Questions

1. **Map ref access for `map.project()`**
   - What we know: `useMap()` hook from react-map-gl returns the map context; `ref` on `<Map>` also works.
   - What's unclear: `TorontoMap` currently does not expose its map ref. The snap helper in `proposal-geometry.ts` needs a `maplibregl.Map` instance. Either `TorontoMap` must accept a `ref` and forward it, or the snap logic must live inside the `TorontoMap` component.
   - Recommendation: Pass drawing state and dispatch into `TorontoMap` as props. Keep snap logic inside the component where the map instance is accessible. Expose calculated snap results upward via callback.

2. **Double-click vs single click disambiguation**
   - What we know: MapLibre fires two `click` events before `dblclick`. The `onDblClick` prop on `<Map>` is the cleanest way to detect finish-drawing intent.
   - What's unclear: Whether `onDblClick` fires reliably for all zoom levels and map interaction states in maplibre-gl 5.x.
   - Recommendation: Use `onDblClick` for finish-drawing. Add a guard: if `drawingSession` is null, `onDblClick` is a no-op.

3. **TTC baseline station hit-test for interchange detection**
   - What we know: TTC station positions are in `ttcStations: FeatureCollection` loaded in Phase 2. Interchange detection needs to check proximity to these.
   - What's unclear: The most efficient way to pass `ttcStations` into the interchange detection logic without prop-drilling.
   - Recommendation: Move `ttcStations` data into `EditorShellState` (or pass it as a separate stable prop from `EditorShell`). The interchange detection function takes both the TTC stations FeatureCollection and the proposal stations as candidates.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies beyond already-installed packages; `@turf/turf` is the only new npm addition)

---

## Sources

### Primary (HIGH confidence)
- MapLibre GL JS API docs — `MapMouseEvent.lngLat`, `Map.project()`, `GeoJSONSource.setData()`, `MapEventType`
  - https://maplibre.org/maplibre-gl-js/docs/API/classes/MapMouseEvent/
  - https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/
  - https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/
- react-map-gl v8 docs — Source/Layer data prop reactive update, event props on Map component
  - https://visgl.github.io/react-map-gl/docs/get-started/adding-custom-data
  - https://visgl.github.io/react-map-gl/docs/api-reference/maplibre/source
- Turf.js docs — `nearestPointOnLine`, `distance`, `lineString`, `point`
  - https://turfjs.org/docs/api/nearestPointOnLine
- Redux docs — Implementing Undo History (past/present/future pattern)
  - https://redux.js.org/usage/implementing-undo-history
- Existing codebase: `lib/proposal/proposal-types.ts`, `lib/proposal/proposal-state.ts`, `components/editor/toronto-map.tsx`, `components/map/ttc-layers.tsx` — all read directly

### Secondary (MEDIUM confidence)
- Terra Draw / maplibre-gl-terradraw — evaluated as alternative, rejected for this project's bespoke tool-mode design
  - https://maplibre.org/maplibre-gl-js/docs/examples/draw-geometries-with-terra-draw/
  - https://github.com/watergis/maplibre-gl-terradraw
- GitHub issue: terra-draw #197 "Drawings disappear on map re-render" — confirms risk of mixing imperative and declarative source management

### Tertiary (LOW confidence)
- Pattern for double-click disambiguation — based on MapLibre event order; needs validation against maplibre-gl 5.x specifically

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via `npm view`; react-map-gl 8 and maplibre-gl 5 already installed; Turf 7.3.4 confirmed current
- Architecture: HIGH — reactive `Source data={...}` pattern verified in react-map-gl docs; history wrapper pattern verified in Redux docs; GeoJSON FeatureCollection derivation pattern matches existing Phase 2 code style
- Pitfalls: MEDIUM — most pitfalls are based on verified documentation + confirmed GitHub issues; double-click behavior is LOW (needs runtime validation)

**Research date:** 2026-03-31
**Valid until:** 2026-05-01 (stable libraries; react-map-gl and maplibre-gl do not have breaking changes scheduled)
