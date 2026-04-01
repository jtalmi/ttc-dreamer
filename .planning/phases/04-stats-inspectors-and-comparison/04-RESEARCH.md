# Phase 4: Stats, Inspectors, and Comparison — Research

**Researched:** 2026-03-31
**Domain:** React state management, GeoJSON geometry, sidebar UI panels, before/after toggle
**Confidence:** HIGH

---

## Summary

Phase 4 adds descriptive insight to the editor without introducing new npm packages. All stat formulas can be computed as pure functions in a new `lib/proposal/proposal-stats.ts` module using the already-installed `@turf/turf` for line length. Inspector panels are sidebar-only React components that replace the current `LineList` content area. The before/after toggle is a boolean flag added to `EditorChromeState` that controls proposal layer opacity in `ProposalLayers`.

The existing architecture already provides all the building blocks: `ProposalDraft` has `lines`, `stations`, `waypoints`, and `lineIds`; turf is installed and verified working for `length` and `nearestPoint`; the `sidebarPanel` union just needs two new states (`inspect-line`, `inspect-station`); and the `activeTool === "inspect"` path in `TorontoMap.handleClick` needs to dispatch inspect actions rather than the current no-op. No new dependencies are needed.

**Primary recommendation:** Implement stats as pure functions in `lib/proposal/proposal-stats.ts`, add `inspectedElementId` and `comparisonMode` to `EditorChromeState`, extend `sidebarPanel` to include the two inspect states, wire the Inspect tool click handler in `TorontoMap`, and build two new sidebar panel components for line and station inspector.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STATS-01 | User can inspect line details in a sidebar inspector | New `sidebarPanel` states + `LineInspectorPanel` component; Inspect tool click dispatch |
| STATS-02 | User can inspect station details in a sidebar inspector | New `sidebarPanel` states + `StationInspectorPanel` component; Inspect tool click dispatch |
| STATS-03 | User sees live proposal-level and line-level descriptive stats in the sidebar | `ProposalStatsPanel` component driven by pure stat functions in `proposal-stats.ts` |
| STATS-04 | Stats include speed/travel time, avg stop spacing, estimated cost, estimated ridership | Four pure stat functions verified with turf.length; formulas specified in UI-SPEC |
| STATS-05 | Stats can also surface station count, line length, interchange count | Three additional pure stat helpers; interchange count from `lineIds.length > 1` or `linkedBaselineStationId` |
| STATS-06 | User can compare the proposal against the baseline with a before/after toggle | Boolean `comparisonMode` in chrome state; `ProposalLayers` accepts opacity prop; toolbar toggle button |
</phase_requirements>

---

## Standard Stack

### Core (no additions needed)

| Library | Installed Version | Purpose | Notes |
|---------|-------------------|---------|-------|
| `@turf/turf` | ^7.3.4 (installed) | Line length, nearest point | `turf.length()` and `turf.nearestPoint()` verified working |
| `react` | 19.2.4 (installed) | Component model | `useMemo` for derived stat values |
| `react-map-gl` | ^8.1.0 (installed) | Map layer opacity control | `ProposalLayers` accepts opacity prop |

**No new npm packages are required for Phase 4.** The UI-SPEC explicitly calls this out.

### Verified function availability

```
turf.length(lineString, {units: 'kilometers'})  — HIGH confidence, verified in node
turf.nearestPoint(point, featureCollection)      — HIGH confidence, verified in node
turf.booleanPointInPolygon(point, polygon)        — available but not needed (neighbourhoods are Points not Polygons)
```

Neighbourhood data in `public/data/neighbourhoods.geojson` uses Point geometry (centroids, not polygons). Use `turf.nearestPoint` with a 3km radius cap and fallback to coordinates.

---

## Architecture Patterns

### Recommended File Structure

```
lib/proposal/
├── proposal-stats.ts      # NEW — pure stat computation functions
├── proposal-types.ts      # EXTEND — add inspectedElementId, comparisonMode to EditorChromeState; extend sidebarPanel union
├── proposal-state.ts      # EXTEND — add new action types; handle inspect-line/inspect-station panel transitions
├── proposal-geometry.ts   # UNCHANGED
├── proposal-history.ts    # UNCHANGED
└── index.ts               # EXTEND — re-export new stat functions and actions

components/editor/sidebar/
├── line-list.tsx          # UNCHANGED (still shown in list panel)
├── line-inspector-panel.tsx   # NEW
├── station-inspector-panel.tsx # NEW
├── proposal-stats-panel.tsx    # NEW
├── line-creation-panel.tsx     # UNCHANGED
├── confirmation-dialog.tsx     # UNCHANGED
├── interchange-badge.tsx       # UNCHANGED
└── station-name-popover.tsx    # UNCHANGED

components/editor/
├── editor-shell.tsx       # EXTEND — new sidebarContent branches; before/after toggle prop threading
├── toronto-map.tsx        # EXTEND — Inspect tool click handler; comparison mode opacity prop

components/map/
└── proposal-layers.tsx    # EXTEND — accept proposalOpacity prop for before/after mode

components/editor/
└── top-toolbar.tsx        # EXTEND — add Before/After toggle button between baseline toggle and corridors button

app/globals.css            # EXTEND — add five new CSS custom property tokens from UI-SPEC
```

### Pattern 1: Pure Stat Functions in proposal-stats.ts

**What:** All stat formulas live as pure functions that take `ProposalDraft` or `ProposalLineDraft` and return numbers. No side effects, fully testable.

**When to use:** Any time the sidebar needs a stat value. Called via `useMemo` in the parent component.

```typescript
// Source: derived from UI-SPEC formula table + turf.length verification
import { length, lineString, nearestPoint, point } from "@turf/turf";
import type { FeatureCollection } from "geojson";
import type { ProposalDraft, ProposalLineDraft, TransitMode } from "./proposal-types";

const SPEED_KMH: Record<TransitMode, number> = {
  subway: 60,
  lrt: 35,
  brt: 25,
};

const COST_PER_KM_M: Record<TransitMode, number> = {
  subway: 250,
  lrt: 100,
  brt: 30,
};

const RIDERSHIP_PER_STATION: Record<TransitMode, number> = {
  subway: 2000,
  lrt: 1200,
  brt: 600,
};

/** Returns line length in km, or 0 if fewer than 2 waypoints. */
export function computeLineLength(line: ProposalLineDraft): number {
  if (line.waypoints.length < 2) return 0;
  return length(lineString(line.waypoints), { units: "kilometers" });
}

/** Travel time in minutes for a single line (round to nearest minute). */
export function computeTravelTime(line: ProposalLineDraft): number {
  const km = computeLineLength(line);
  if (km === 0) return 0;
  return Math.round((km / SPEED_KMH[line.mode]) * 60);
}

/** Avg stop spacing in km for a single line (1 decimal). Returns null when < 2 stations. */
export function computeAvgStopSpacing(line: ProposalLineDraft): number | null {
  const stationCount = line.stationIds.length;
  if (stationCount < 2) return null;
  const km = computeLineLength(line);
  return Math.round((km / (stationCount - 1)) * 10) / 10;
}

/** Estimated cost in millions for a single line. */
export function computeLineCost(line: ProposalLineDraft): number {
  return computeLineLength(line) * COST_PER_KM_M[line.mode];
}

/** Estimated ridership/day for a single line. */
export function computeLineRidership(line: ProposalLineDraft): number {
  const raw = line.stationIds.length * RIDERSHIP_PER_STATION[line.mode];
  return Math.round(raw / 100) * 100;
}

/** Proposal-level stats aggregate across all lines. */
export function computeProposalStats(draft: ProposalDraft) {
  const lines = draft.lines.filter((l) => l.waypoints.length >= 2);

  const networkKm = lines.reduce((sum, l) => sum + computeLineLength(l), 0);
  const longestLine = lines.reduce((best, l) =>
    computeTravelTime(l) > computeTravelTime(best) ? l : best,
    lines[0],
  );
  const travelTime = longestLine ? computeTravelTime(longestLine) : 0;
  const spacingValues = lines.map(computeAvgStopSpacing).filter((v): v is number => v !== null);
  const avgSpacing = spacingValues.length > 0
    ? Math.round((spacingValues.reduce((a, b) => a + b, 0) / spacingValues.length) * 10) / 10
    : null;
  const totalCostM = lines.reduce((sum, l) => sum + computeLineCost(l), 0);
  const totalRidership = lines.reduce((sum, l) => sum + computeLineRidership(l), 0);
  const stationCount = draft.stations.length;
  const interchangeCount = draft.stations.filter(
    (s) => s.lineIds.length > 1 || s.linkedBaselineStationId != null,
  ).length;

  return {
    networkKm: Math.round(networkKm * 10) / 10,
    travelTime,
    avgSpacing,
    totalCostM,
    totalRidership,
    stationCount,
    interchangeCount,
  };
}
```

### Pattern 2: sidebarPanel Extension and Inspector Dispatch

**What:** Extend the existing `sidebarPanel` union type and add `inspectedElementId` to chrome state. Inspector panels open when the Inspect tool clicks a proposal element.

**Current type:**
```typescript
sidebarPanel: "list" | "create" | "drawing-status";
```

**Extended type:**
```typescript
sidebarPanel: "list" | "create" | "drawing-status" | "inspect-line" | "inspect-station";
```

**New chrome state fields:**
```typescript
inspectedElementId: string | null;  // which line or station is inspected
comparisonMode: boolean;             // true = "Before (Baseline View)" mode
```

**New action types needed:**
```typescript
type InspectElementAction = {
  type: "inspectElement";
  payload: { id: string; elementType: "line" | "station" };
};

type CloseInspectorAction = {
  type: "closeInspector";
};

type ToggleComparisonModeAction = {
  type: "toggleComparisonMode";
};
```

**`inspectElement` reducer case:** sets `inspectedElementId`, sets `sidebarPanel` to `"inspect-line"` or `"inspect-station"` based on elementType.

**`closeInspector` reducer case:** clears `inspectedElementId`, resets `sidebarPanel` to `"list"`.

### Pattern 3: Inspect Tool Click Handler in TorontoMap

**What:** The `handleClick` callback already has an `activeTool === "inspect"` case that currently does nothing (falls through to empty space deselect). It needs to:
1. Check for a proposal station hit (same `features` array check as select mode)
2. Check for a proposal line hit
3. Dispatch `inspectElement` with the correct type
4. On empty space click, dispatch `closeInspector`

```typescript
if (activeTool === "inspect") {
  const features = e.features;
  if (features && features.length > 0) {
    const feature = features[0];
    const props = feature.properties as Record<string, unknown>;
    const id = props["id"] as string | null;
    if (id) {
      // Determine if station or line by layer id
      const elementType = feature.layer?.id === "proposal-stations-circle"
        ? "station"
        : "line";
      dispatch?.({ type: "inspectElement", payload: { id, elementType } });
      return;
    }
  }
  // Empty click — close inspector
  dispatch?.({ type: "closeInspector" });
  return;
}
```

**Interactive layers:** The `interactiveLayerIds` array in `TorontoMap` already includes `"proposal-lines-stroke"` and `"proposal-stations-circle"`. No new layers needed for Inspect tool hit detection.

**Cursor:** The current `cursorStyle` memo returns `"zoom-in"` for `inspect` mode. The UI-SPEC calls for `"pointer"`. This needs correction.

### Pattern 4: Before/After Comparison Mode

**What:** A boolean `comparisonMode` in chrome state drives proposal element opacity in `ProposalLayers`. When `comparisonMode === true`, the map renders proposal lines and stations at 40% opacity.

**ProposalLayers change:**
```typescript
// Accept a proposalOpacity prop
type ProposalLayersProps = Readonly<{
  // ... existing props
  proposalOpacity?: number; // default 1.0, set to 0.4 in comparison mode
}>;

// Apply to line and station paint
"line-opacity": proposalOpacity,
"circle-opacity": proposalOpacity,
"circle-stroke-opacity": proposalOpacity,
```

**Comparison banner:** A simple `<div>` overlay positioned at the bottom of the map canvas (`position: absolute; bottom: 0; left: 0; right: 0`). Rendered inside `EditorFrame`'s map children area when `comparisonMode` is active. Not in `ProposalLayers` (which is a MapLibre layer component).

**Before/After toggle button:** Added to `TopToolbar` between the baseline toggle group and the corridors button. Needs an `onComparisonToggle` prop and `comparisonMode` boolean prop.

### Pattern 5: Neighbourhood Lookup for Station Inspector

**What:** The station inspector shows a "Location" row with the nearest neighbourhood name. The neighbourhood data is Point geometry (26 centroids), so use `turf.nearestPoint` with a 3km distance cap, falling back to rounded coordinates.

```typescript
// Source: verified against public/data/neighbourhoods.geojson structure
import { nearestPoint, point } from "@turf/turf";
import type { FeatureCollection } from "geojson";

export function resolveNeighbourhood(
  position: [number, number],
  neighbourhoods: FeatureCollection,
  maxKm = 3,
): string {
  const nearest = nearestPoint(point(position), neighbourhoods);
  const dist = nearest.properties?.distanceToPoint as number | undefined;
  if (dist !== undefined && dist <= maxKm) {
    return String(nearest.properties?.name ?? "");
  }
  // Fallback: coordinates to 4 decimal places
  return `${position[1].toFixed(4)}, ${position[0].toFixed(4)}`;
}
```

**Neighbourhood data availability:** `TorontoMap` already loads `neighbourhoods` in its `MapData` state via `loadNeighbourhoods()`. This data needs to be passed down to the station inspector — either passed as a prop or accessed through a context. The simplest approach: pass it as a prop from `EditorShell` (which receives it from `TorontoMap` via callback or a shared state) **or** move the neighbourhood data loading to `EditorShell` level.

**Practical recommendation:** Load neighbourhoods in `EditorShell` as a separate `useState` fetched once on mount. Pass to station inspector. This avoids threading it through `TorontoMap` and back.

### Anti-Patterns to Avoid

- **Putting stats computation in render:** Stat formulas are deterministic pure functions — they should live in `proposal-stats.ts` and be called with `useMemo` in the panel components, not computed inline during render.
- **Separate `inspectedElementId` from `selectedElementId`:** These serve different purposes. `selectedElementId` drives the select tool highlight; `inspectedElementId` drives the inspector panel. They should be kept separate so the user can inspect a line without accidentally "selecting" it for delete.
- **Floating inspector over the map:** The UI-SPEC is explicit — inspector panels live entirely within the 320px sidebar. Do not create floating map overlays for inspectors.
- **Importing neighbourhood FeatureCollection into a utility function file:** Keep it as a passed parameter — the stat module stays side-effect-free and testable.
- **Applying comparison opacity to baseline TTC/GO layers:** The UI-SPEC requires TTC and GO layers to remain at full visibility during comparison mode. Only `ProposalLayers` opacity changes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Line length in km | Manual Haversine loop | `turf.length(lineString, {units:'kilometers'})` | Handles geodetic accuracy, multipoint, edge cases |
| Nearest neighbourhood | Brute-force lat/lng distance | `turf.nearestPoint(pt, collection)` | Turf already installed, returns distance |
| GeoJSON feature collections | New structure | Existing `buildProposalLinesGeoJSON`, `buildProposalStationsGeoJSON` | Already in proposal-geometry.ts |

---

## Common Pitfalls

### Pitfall 1: sidebarPanel Type Mismatch at setSidebarPanel Call Sites

**What goes wrong:** The `setSidebarPanel` action payload type in `proposal-state.ts` is currently typed as `"list" | "create" | "drawing-status"`. After extending to include `"inspect-line"` and `"inspect-station"`, TypeScript will reject any call site that dispatches the old string union directly until the type is updated.

**Why it happens:** The action payload type is hardcoded in `SetSidebarPanelAction`. The new `inspectElement` action should set the panel directly rather than going through `setSidebarPanel` — this avoids exposing the inspect panel states as a general-purpose payload.

**How to avoid:** Add `inspectElement` as a dedicated action that sets both `sidebarPanel` and `inspectedElementId` atomically. Reserve `setSidebarPanel` for the three original states. Update its type to remain `"list" | "create" | "drawing-status"` so existing callers don't break.

### Pitfall 2: comparisonMode Survives Tool Switches Unexpectedly

**What goes wrong:** If `comparisonMode` is stored in chrome state without any reset logic, a user might switch tools, draw a new line, then notice the comparison overlay is still active — confusing.

**Why it happens:** Chrome state fields are generally sticky unless explicitly cleared.

**How to avoid:** `comparisonMode` should NOT be cleared on tool switch (it is a toggle the user set intentionally). However, it SHOULD be disabled when the proposal is empty (zero lines). The `ProposalStatsPanel` and toolbar button should gate on `draft.lines.length > 0` before enabling the toggle, per the UI-SPEC. The actual `comparisonMode` boolean can stay true in state — the gate is in the rendered component.

### Pitfall 3: Inspect Tool Hitting Waypoint Dots Instead of Lines

**What goes wrong:** The `interactiveLayerIds` array includes `"proposal-waypoints-circle"`. In select mode, clicking a waypoint dot starts a drag. In inspect mode, clicking a waypoint dot would need to be treated differently (no drag — inspect the parent line instead).

**Why it happens:** The same layer is interactive across all tools.

**How to avoid:** In the inspect tool click handler, check `feature.layer?.id === "proposal-waypoints-circle"` and resolve to the parent line ID via `props["lineId"]`. Dispatch `inspectElement` with the line's `id`, not the waypoint's `lineId` property directly — those are the same value in waypoint features, but it's worth being explicit.

### Pitfall 4: Avg Stop Spacing with Zero or One Station

**What goes wrong:** `total_length / (stationCount - 1)` produces `Infinity` or `NaN` when `stationCount` is 0 or 1.

**Why it happens:** Division by zero in the denominator.

**How to avoid:** `computeAvgStopSpacing` returns `null` when `stationCount < 2`. The UI component renders "—" for `null`. This is explicitly called out in the UI-SPEC ("Zero stations → show "—"").

### Pitfall 5: Inspect Tool Cursor Shows zoom-in Instead of pointer

**What goes wrong:** The existing `cursorStyle` memo in `TorontoMap` returns `"zoom-in"` for the `inspect` tool. The UI-SPEC requires `"pointer"`.

**Why it happens:** The cursor was set as a placeholder in Phase 3 scaffolding.

**How to avoid:** Update the `cursorStyle` memo in Phase 4: return `"pointer"` for `activeTool === "inspect"`. For the more precise per-element variant (pointer over proposal element, default over empty map), add an `isOverInspectable` flag similar to the existing `isOverSegment` flag.

### Pitfall 6: Neighbourhood Data Not Available at Inspector Render Time

**What goes wrong:** The station inspector needs `neighbourhoods` FeatureCollection to call `resolveNeighbourhood`. Currently this data lives inside `TorontoMap`'s local state and is not surfaced to `EditorShell`.

**Why it happens:** `TorontoMap` loads all baseline data internally and never passes it up.

**How to avoid:** Load `neighbourhoods` as a separate `useState` in `EditorShell` (a single `fetch` call on mount). Pass the loaded `FeatureCollection | null` as a prop to the station inspector. Show `null` as coordinates-only fallback while loading.

---

## Code Examples

### Computing All Proposal Stats (verified output)

```typescript
// Tested: 12.3km subway line with 3 stations
// Length: 12.3km, Travel: 12min, AvgSpacing: 6.2km, Cost: ~3.1B, Ridership: 6.0K/day
const stats = computeProposalStats(draft);
// Format cost: stats.totalCostM >= 1000 ? `~$${(totalCostM/1000).toFixed(1)}B` : `~$${totalCostM.toFixed(0)}M`
```

### Extending ProposalLayers for Comparison Opacity

```typescript
// In ProposalLayers — add to line-stroke layer paint
"line-opacity": proposalOpacity ?? 1,
// In station circle layer paint
"circle-opacity": proposalOpacity ?? 1,
"circle-stroke-opacity": proposalOpacity ?? 1,
```

### Line Inspector — Interchange Count

```typescript
// Count stations on this line that are shared or linked to TTC baseline
const interchangeCount = draft.stations.filter((s) =>
  s.lineIds.includes(line.id) && (s.lineIds.length > 1 || s.linkedBaselineStationId != null)
).length;
```

### Before/After Toggle Button (TopToolbar)

```typescript
// Added between baseline toggle group and corridors button
<button
  onClick={() => onComparisonToggle?.()}
  aria-pressed={comparisonMode}
  style={{
    padding: "var(--space-xs) var(--space-sm)",
    borderRadius: "4px",
    border: "1px solid rgba(243, 238, 229, 0.3)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "var(--font-sans)",
    backgroundColor: comparisonMode ? "var(--shell-accent)" : "var(--shell-secondary)",
    color: "var(--shell-dominant)",
    opacity: hasLines ? 1 : 0.4,
    pointerEvents: hasLines ? "auto" : "none",
  }}
>
  {comparisonMode ? "Baseline View" : "Proposal View"}
</button>
```

---

## State Changes Summary

The following changes to `proposal-types.ts` are required:

### EditorChromeState additions

```typescript
/** ID of the currently inspected line or station (inspect tool). */
inspectedElementId: string | null;
/** True when comparison (Before / Baseline View) mode is active. */
comparisonMode: boolean;
/** Extended sidebar panel union. */
sidebarPanel: "list" | "create" | "drawing-status" | "inspect-line" | "inspect-station";
```

### New action types in proposal-state.ts

```typescript
type InspectElementAction = {
  type: "inspectElement";
  payload: { id: string; elementType: "line" | "station" };
};

type CloseInspectorAction = {
  type: "closeInspector";
};

type ToggleComparisonModeAction = {
  type: "toggleComparisonMode";
};
```

### Initial state values

```typescript
inspectedElementId: null,
comparisonMode: false,
```

### History treatment

None of the three new actions (`inspectElement`, `closeInspector`, `toggleComparisonMode`) are draft mutations — they should NOT be added to `HISTORY_ACTIONS` in `proposal-history.ts`. They are chrome-only state changes.

---

## Key Questions — Answered

**Q1: How should stat formulas be computed?**
Pure functions in `lib/proposal/proposal-stats.ts`. Called with `useMemo` in the panel components. Functions take `ProposalLineDraft` or `ProposalDraft` and return numbers/null. Zero turf imports in components — only in the stats module.

**Q2: How should inspector content be structured in the sidebar?**
Two new components — `LineInspectorPanel` and `StationInspectorPanel` — rendered in `EditorShell`'s `sidebarContent` switch when `chrome.sidebarPanel` is `"inspect-line"` or `"inspect-station"`. They receive the relevant line/station object plus `dispatch` to send `closeInspector`.

**Q3: What data does the before/after toggle need to track?**
A single `comparisonMode: boolean` in `EditorChromeState`. When true, `ProposalLayers` receives `proposalOpacity={0.4}`. A comparison banner `<div>` renders in the map area. The baseline TTC and GO layers are unaffected.

**Q4: How do inspectors interact with the select tool and map clicks?**
The Inspect tool is its own `ToolMode` ("inspect"). The click handler in `TorontoMap.handleClick` handles the `activeTool === "inspect"` branch. It uses the existing `interactiveLayerIds` feature detection to identify clicked elements. The inspector does NOT need a separate interactive layer — it reuses the existing `"proposal-lines-stroke"` and `"proposal-stations-circle"` layers for hit detection.

**Q5: What's the simplest approach to line length/distance calculation?**
`turf.length(lineString(waypoints), {units: 'kilometers'})`. This is already used in `findSnapTarget` and `detectLineHitType` via `nearestPointOnLine` — turf is tree-shaken and the `length` function is available. Verified: a 3-waypoint line across Toronto returns 12.3 km.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is code-only. All required tools (Node.js, npm, turf library) are already confirmed as installed dependencies.

---

## Open Questions

1. **Neighbourhood data prop threading**
   - What we know: `TorontoMap` loads `neighbourhoods` internally; `EditorShell` does not have access to it
   - What's unclear: Whether to load it in `EditorShell` separately or surface it from `TorontoMap` via callback
   - Recommendation: Load in `EditorShell` as a separate `useState` — cleaner architecture and avoids a new callback prop on `TorontoMap`

2. **Inspect-from-line-list affordance**
   - The UI-SPEC says clicking a line row in the sidebar line list while in any mode should open the line inspector. This implies the `LineList` component needs an `onInspectLine` callback.
   - What's unclear: Whether the planner treats this as the same task as map-click inspection or a separate wire-up
   - Recommendation: Include as part of Plan 04-01 (inspector surfaces) since it's a single callback addition to `LineList`

3. **Comparison banner z-index**
   - The banner at the bottom of the map canvas requires `position: absolute` within the map container. EditorFrame uses CSS custom properties and flex layout.
   - What's unclear: Whether the map stage container in `EditorFrame` already allows `position: relative` children
   - Recommendation: Check `components/editor/map-stage.tsx` during implementation; likely needs `position: relative` on the map stage container

---

## Sources

### Primary (HIGH confidence)
- `lib/proposal/proposal-types.ts` — existing `EditorChromeState`, `sidebarPanel` union, `ProposalDraft` shape
- `lib/proposal/proposal-state.ts` — existing action pattern, reducer structure, HISTORY_ACTIONS
- `lib/proposal/proposal-geometry.ts` — turf import pattern already established
- `components/editor/toronto-map.tsx` — existing `handleClick` structure, `interactiveLayerIds`
- `components/map/proposal-layers.tsx` — existing layer paint structure for opacity extension
- `components/editor/top-toolbar.tsx` — existing button pattern for comparison toggle
- `package.json` — confirmed `@turf/turf ^7.3.4` installed
- `public/data/neighbourhoods.geojson` — confirmed Point geometry with `name` property, 26 features
- `.planning/phases/04-stats-inspectors-and-comparison/04-UI-SPEC.md` — locked formula table, copy contract, interaction contract

### Secondary (MEDIUM confidence)
- Vitest test files — established test pattern using `describe/it/expect` without DOM rendering
- `vitest.config.ts` — confirmed `environment: "node"`, suitable for pure function tests

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages installed and verified with node
- Architecture: HIGH — follows established patterns from Phases 1–3 exactly
- Pitfalls: HIGH — derived from direct code inspection of existing type contracts and component structure
- Stat formulas: HIGH — verified with turf.length in node against real coordinate data

**Research date:** 2026-03-31
**Valid until:** 2026-06-01 (stable dependencies, no fast-moving APIs)
