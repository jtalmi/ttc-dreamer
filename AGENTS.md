<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Toronto Transit Sandbox — Agent Guide

## What This Is

Desktop-first web app for Toronto transit fans to create, edit, and share custom TTC rapid transit proposals on a preloaded Toronto map. Full-screen Excalidraw-style editor with station-first drawing, floating toolbars, and Nominatim reverse geocoding for auto-generated station names.

**Core Value:** Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share.

**Current state:** v2.0 shipped. 11,578 LOC TypeScript, 156 Vitest tests, no backend (all client-side).

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript 5
- **Map:** MapLibre GL JS via react-map-gl/maplibre
- **Styling:** Tailwind CSS 4 + inline styles with CSS custom properties
- **Geometry:** @turf/turf for geodesic calculations
- **Icons:** lucide-react
- **Geocoding:** Nominatim reverse geocoding (HTTP, no npm package)
- **Tests:** Vitest
- **State:** useReducer + history wrapper (no external state library)

## File Map

```
app/
  page.tsx              → renders EditorShell (single page app)
  layout.tsx            → root layout
  globals.css           → CSS custom properties and global styles

components/editor/
  editor-shell.tsx      → top-level state (useReducer), keyboard shortcuts, all wiring
  editor-frame.tsx      → layout shell (full-screen map + sidebar + floating controls)
  toronto-map.tsx       → MapLibre canvas, click/drag handlers, layer rendering
  map-stage.tsx         → map container wrapper
  sidebar-shell.tsx     → overlay sidebar with title/share header, slide transition
  floating-drawing-toolbar.tsx  → top-center tool picker (Select/Draw/Add Line)
  floating-layer-picker.tsx     → top-right layer toggles (baseline/corridors/comparison)
  sidebar/
    line-list.tsx               → default sidebar: proposal lines with colors
    line-creation-panel.tsx     → new line form (name/mode/color)
    line-inspector-panel.tsx    → proposal line details + stats
    station-inspector-panel.tsx → proposal station details
    baseline-line-inspector-panel.tsx    → read-only TTC line info
    baseline-station-inspector-panel.tsx → read-only TTC station info
    proposal-stats-panel.tsx    → network-level stats
    station-name-popover.tsx    → inline name input during drawing
    confirmation-dialog.tsx     → delete confirmation

components/map/
  ttc-layers.tsx        → TTC line + station rendering (per-line colors, Ontario Line dashed)
  go-layers.tsx         → GO Transit context layers (read-only)
  proposal-layers.tsx   → proposal line + station + in-progress drawing rendering
  corridor-layers.tsx   → bus/streetcar corridor toggle layers
  station-labels.tsx    → station name text labels
  context-labels.tsx    → neighbourhood/landmark/street labels

lib/proposal/
  proposal-types.ts     → DrawingSession, ProposalDraft, ToolMode, all action types
  proposal-state.ts     → proposalEditorReducer (40+ actions), placeStation, moveStation, etc.
  proposal-history.ts   → historyReducer wrapping proposalEditorReducer for undo/redo
  proposal-geometry.ts  → deriveWaypointsFromStations, buildGeoJSON helpers, snap functions
  proposal-stats.ts     → pure stat computation (cost, ridership, travel time, spacing)

lib/baseline/
  baseline-types.ts     → TTC/GO feature types (TtcRouteProperties, etc.)
  baseline-data.ts      → GeoJSON loaders fetching from public/data/

lib/sharing/
  sharing-types.ts      → SharePayloadV1/V2 schemas
  encode-proposal.ts    → draft → URL hash encoding
  decode-proposal.ts    → URL hash → draft with v1→v2 migration

lib/geocoding/
  reverse-geocode.ts    → Nominatim API with in-memory cache, rate limiting

public/data/
  ttc-routes.geojson / ttc-routes-future.geojson     → TTC line geometry
  ttc-stations.geojson / ttc-stations-future.geojson  → TTC station coordinates (GTFS-sourced)
  go-routes.geojson / go-stations.geojson             → GO Transit context

tests/                  → mirrors lib/ structure, 156 tests
```

## Architecture

**State model:** `EditorShell` owns all state via `useReducer(historyReducer, initialState)`. State splits into:
- `draft` — proposal data (lines, stations, title, baselineMode). Mutations are undoable.
- `chrome` — UI state (activeTool, sidebarPanel, drawingSession, inspectedElementId). Not undoable.

**Drawing model (station-first):** Click in draw mode → `placeStation` creates station immediately in draft → station ID appended to `DrawingSession.placedStationIds` → `finishDrawing` calls `deriveWaypointsFromStations()` to generate line geometry. Auto-finish on tool switch if 2+ stations.

**Floating UI:** All toolbars use `position: fixed` with high z-index (9000+) to escape MapLibre's stacking context. `pointer-events: none` on wrappers, `auto` on interactive children.

**Sharing:** URL hash encoding with v2 schema. `decodeSharePayload` migrates v1→v2 automatically.

## Conventions

- 2-space indent, double quotes, semicolons, trailing commas
- Inline styles (no CSS classes) — CSS custom properties for tokens
- `import type` for type-only imports
- `Readonly<{...}>` for component props
- `useReducer` for state, not useState for complex objects
- `HISTORY_ACTIONS` set in proposal-history.ts must be updated for new draft-mutating actions
- Tests in `tests/` mirroring `lib/` structure

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npx vitest run` — run all tests

## Product Rules

### Priorities
1. Toronto-native context
2. Fast, satisfying editing
3. Polished visuals
4. Lightweight, descriptive stats
5. Shareable outputs

### Guardrails
- Do not optimize for realism over fun
- Do not add social/community features unless explicitly requested
- Do not make mobile the primary creation target
- Do not mutate baseline TTC infrastructure except through allowed extensions/branches
- Keep scoring descriptive, not judgmental
- Prefer map-first layouts and visible tools over hidden controls

## Deep Dive References

For detailed analysis beyond this guide, see `.planning/codebase/`:
- `ARCHITECTURE.md` — full layer breakdown, data flow diagrams
- `STRUCTURE.md` — complete directory listing with purpose annotations
- `CONVENTIONS.md` — naming patterns, error handling, module design
- `TESTING.md` — test framework, patterns, coverage
- `STACK.md` — all dependencies with versions
- `INTEGRATIONS.md` — external APIs (Nominatim, MapTiler, ArcGIS)
- `CONCERNS.md` — tech debt, known issues, fragile areas

## GSD Workflow

Before making file changes, prefer starting through a GSD command so planning artifacts stay in sync:
- `/gsd:quick` — small fixes, doc updates, ad-hoc tasks
- `/gsd:debug` — investigation and bug fixing
- `/gsd:execute-phase` — planned phase work

# currentDate
Today's date is 2026-04-02.
