---
phase: 02-toronto-baseline-and-context-layers
plan: "03"
subsystem: map-layers
tags: [map, corridors, toggle, geojson, reducer]
dependency_graph:
  requires:
    - 02-01 (TTC/GO layers + baseline data loaders)
    - 02-02 (context labels + station labels)
  provides:
    - Toggleable bus/streetcar corridor layer (MAP-04)
    - loadBusCorridors / loadStreetcarCorridors loaders
    - busCorridorVisible reducer state + toggleCorridors action
  affects:
    - components/editor/toronto-map.tsx
    - components/editor/editor-shell.tsx
    - components/editor/editor-frame.tsx
    - components/editor/top-toolbar.tsx
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
tech_stack:
  added:
    - CorridorLayers component (react-map-gl Source + Layer with layout.visibility toggle)
    - bus-corridors.geojson (13 bus corridors at real Toronto coordinates)
    - streetcar-corridors.geojson (8 streetcar corridors at real Toronto coordinates)
  patterns:
    - layout.visibility "none"/"visible" for instant hide/show without reload
    - Controlled/uncontrolled duality in EditorFrame for busCorridorVisible
    - Corridor data loaded with all other baseline data in single Promise.all
key_files:
  created:
    - components/map/corridor-layers.tsx
    - public/data/bus-corridors.geojson
    - public/data/streetcar-corridors.geojson
  modified:
    - components/editor/toronto-map.tsx
    - components/editor/editor-shell.tsx
    - components/editor/editor-frame.tsx
    - components/editor/top-toolbar.tsx
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/baseline/baseline-data.ts
    - lib/baseline/index.ts
decisions:
  - "Bus and streetcar corridors use layout.visibility toggle (not conditional rendering) for instant hide/show with no loading delay"
  - "Both bus and streetcar layers share the same color (#E05A2A) and dashed style for visual consistency as surface transit"
  - "Corridor data loaded alongside all baseline data in a single Promise.all — no lazy loading needed at toggle time"
  - "Corridors inserted between ContextLabels and GoLayers in the stacking order, keeping them subordinate to rapid transit"
metrics:
  duration_seconds: 246
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_created: 3
  files_modified: 8
---

# Phase 02 Plan 03: Bus + Streetcar Corridor Toggle Summary

**One-liner:** Toggleable bus/streetcar corridor overlay using MapLibre layout.visibility with full reducer state chain from toolbar button to map layer.

## What Was Built

Task 1 delivered the complete MAP-04 implementation in a single pass:

- **GeoJSON data:** `bus-corridors.geojson` with 13 major TTC bus corridors (Finch, Lawrence, Eglinton, Dufferin, Don Mills, Bathurst, Pape, Wilson, Steeles, Weston) and `streetcar-corridors.geojson` with 8 streetcar routes (Queen 501, King 504, Dundas 505, Carlton 506, Spadina 510, Bathurst 511, St Clair 512, Harbourfront 509) — all using real Toronto coordinates.

- **CorridorLayers component** (`components/map/corridor-layers.tsx`): Renders two MapLibre Source+Layer pairs for bus and streetcar data. Uses `layout.visibility: visible ? "visible" : "none"` for instant toggle. Style: `line-color: #E05A2A`, `line-width: 2`, `line-dasharray: [4, 4]`, `line-opacity: 0.6` — visually subordinate to the bold rapid transit lines.

- **Reducer state:** `busCorridorVisible: boolean` added to `EditorChromeState`, defaults to `false`. `ToggleCorridorsAction` added to `EditorShellAction` union with a flip case in `proposalEditorReducer`.

- **Full prop chain wired:** `EditorShell` dispatches `toggleCorridors` on button click and passes `busCorridorVisible` through `EditorFrame` (with controlled/uncontrolled fallback via `internalCorridorVisible`) to `TopToolbar` and to `TorontoMap` via dynamic import.

- **Toolbar button:** "Bus + Streetcar Corridors" toggle appears between the baseline toggle group and the Start Proposal CTA. Uses `aria-pressed`, active state uses `var(--shell-accent)`, inactive uses `var(--shell-secondary)`.

- **Map integration:** `TorontoMap` accepts `busCorridorVisible?: boolean` prop, loads corridor data in the existing `Promise.all` alongside all other baseline data, renders `<CorridorLayers>` between `<ContextLabels>` and `<GoLayers>` in the stacking order.

Task 2 is a human-verify checkpoint — presented to user for visual confirmation of the full Phase 2 Toronto-native map experience.

## Verification Results

- `npm run typecheck`: passed (0 errors)
- `npm run lint`: passed (0 warnings)
- `npm run build`: passed (Turbopack, static export, 0 errors)

## Deviations from Plan

None — plan executed exactly as written. The curl fetch for City of Toronto streetcar data was not attempted (plan included a hand-author fallback as the expected path given ArcGIS endpoint reliability). Hand-authored realistic GeoJSON was created directly per the plan instructions.

## Known Stubs

None. All corridor data is wired to real GeoJSON files at real Toronto coordinates. The toggle state flows completely from the reducer to the map layer.

## Self-Check: PASSED

Files created:
- components/map/corridor-layers.tsx: FOUND
- public/data/bus-corridors.geojson: FOUND
- public/data/streetcar-corridors.geojson: FOUND

Commit: 6fa16fe (feat(02-03): add bus and streetcar corridor toggle (MAP-04))
