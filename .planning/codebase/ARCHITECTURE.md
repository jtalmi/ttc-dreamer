# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** Client-side state-driven editor with domain-separated concerns.

**Key Characteristics:**
- **Single-page application** rendered entirely in the browser via Next.js App Router
- **Reducer-based state management** with full undo/redo history for draft mutations
- **Domain-separated modules** that isolate core logic (proposal state, geometry, sharing, baseline data) from UI rendering
- **Map-first layout** with sidebar as secondary editor interface
- **No server-side persistence** — all state lives in React component memory or URL hash for sharing

## Layers

**Presentation (UI Components):**
- Purpose: Render the editor interface and consume reducer actions
- Location: `app/`, `components/`
- Contains: React components for the main editor shell, map canvas, sidebar panels, toolbars, dialogs, and shared view
- Depends on: `lib/proposal`, `lib/baseline`, `lib/sharing` — calls exported types, functions, and reducer functions
- Used by: Browser rendering and user interactions

**Domain Logic (Core Editor State):**
- Purpose: Manage proposal draft mutations, undo/redo history, editor chrome state (selected elements, drawing sessions, sidebar panels), and validation
- Location: `lib/proposal/`
- Contains:
  - `proposal-types.ts` — Type contracts for drafts, lines, stations, actions
  - `proposal-state.ts` — Main `proposalEditorReducer` that handles 40+ action types
  - `proposal-history.ts` — Undo/redo wrapper that maintains past/present/future stacks
  - `proposal-geometry.ts` — Pure geometry helpers (snap detection, waypoint derivation, GeoJSON builders)
  - `proposal-stats.ts` — Pure stat computation (distance, cost, ridership, travel time)
- Depends on: `@turf/turf` for spatial math; no framework dependencies
- Used by: `EditorShell` via `useReducer(historyReducer)` and geometry/stats helpers in map components

**Baseline Data (TTC + GO Reference):**
- Purpose: Load and expose Toronto's current and future TTC/GO network geometry and station metadata
- Location: `lib/baseline/`
- Contains:
  - `baseline-types.ts` — Type definitions for TTC/GO features and their ArcGIS properties
  - `baseline-data.ts` — Loader functions that fetch GeoJSON from `/data/` directory
- Depends on: Fetch API; no external libraries
- Used by: Map component (`toronto-map.tsx`) to render baseline layers and enable snapping to TTC stations

**Sharing & Export:**
- Purpose: Encode/decode proposals in URL hash format and export map snapshots
- Location: `lib/sharing/`
- Contains:
  - `sharing-types.ts` — V1/V2 payload schema definitions
  - `encode-proposal.ts` — Compress proposal drafts into shareable URL-safe strings
  - `decode-proposal.ts` — Decompress and validate share links
  - `export-utils.ts` — Map snapshot and PNG export utilities
- Depends on: None (pure JS)
- Used by: `ShareModal`, `EditorShell` (decode on mount), shared view shell

**Geocoding:**
- Purpose: Resolve geographic coordinates to Toronto neighborhood names
- Location: `lib/geocoding/`
- Contains:
  - `reverse-geocode.ts` — Nearest-neighbor lookup against neighborhood centroids using Turf
- Depends on: `@turf/turf`
- Used by: `StationInspectorPanel` to display location context

## Data Flow

**Editing Flow (Interactive Draft Modification):**

1. User interacts with map (click, drag) or sidebar (form input)
2. `EditorShell` component event handler (e.g., `onMapReady`, `onStartDrawing`) calls `dispatch(action)`
3. Action flows through `historyReducer` → `proposalEditorReducer`
4. `proposalEditorReducer` returns a new `EditorShellState` with mutated `draft` and `chrome` properties
5. React re-renders affected components with new state
6. `TorontoMap` uses geometry helpers to convert `draft` into GeoJSON for MapLibre layers
7. Sidebar panels re-render with updated line/station/stats data

**History Flow (Undo/Redo):**

1. User presses Cmd+Z / Ctrl+Z
2. `EditorShell` keyboard handler calls `dispatch({ type: "undo" })`
3. `historyReducer` checks `HISTORY_ACTIONS` set — if action is in that set, push current draft to future and restore previous draft from past
4. Non-draft actions (chrome-only like "setActiveTool") skip history push
5. React re-renders with restored draft state

**Sharing Flow (URL-based Persistence):**

1. User clicks Share button → `ShareModal` opens
2. Modal encodes `draft` via `encodeSharePayload()` → compressed string
3. String inserted into URL hash (e.g., `/#xyz123abc...`)
4. User shares URL
5. Recipient visits URL
6. `EditorShell` `useEffect` reads `window.location.hash` → calls `decodeSharePayload()`
7. If valid, `setSharedPayload()` triggers shared view rendering via `SharedViewShell`
8. User clicks "Edit as copy" → `handleEditAsCopy()` → `dispatch({ type: "loadDraft", payload: copy })`

**State Management:**

- **Draft** (immutable across mutations): Lines, stations, title, baseline mode — source of truth for proposal content
- **Chrome** (transient UI state): Active tool, selected element, drawing session, sidebar panel, snap hints, comparison mode
- **History** (dual stacks): `past: Draft[]`, `present: EditorShellState`, `future: Draft[]` — enables undo/redo
- **Undo behavior**: Only actions in `HISTORY_ACTIONS` create new history entries. Chrome-only actions are ephemeral.

## Key Abstractions

**Proposal Draft (`ProposalDraft`):**
- Purpose: Serializable representation of a complete transit proposal
- Examples: `lib/proposal/proposal-types.ts`, used throughout `EditorShell` and child components
- Pattern: Flat object with `id`, `title`, `baselineMode`, `lines[]`, `stations[]` arrays
- Validation: Performed implicitly by reducer logic; no explicit validator

**Editor Shell State (`EditorShellState`):**
- Purpose: Union of mutable draft and transient UI chrome state in a single reducer state
- Examples: `lib/proposal/proposal-types.ts` (exported from `proposal-state.ts`)
- Pattern: Separates `draft` (mutated only by reducer) from `chrome` (toolbar selection, drawing session, panels)
- Rationale: Keeps undo/redo focused on draft mutations; chrome is UI convenience state

**Drawing Session (`DrawingSession`):**
- Purpose: Track in-progress line creation (stations placed, cursor position, mode: new/extend/branch)
- Examples: Used in `TorontoMap` to render ghost line to cursor and in sidebar to show station count
- Pattern: Active session is stored in `chrome.drawingSession`; null when not drawing
- Lifecycle: Created on "startDrawing" action → updated on "placeStation" and "updateCursorPosition" → cleared on "finishDrawing"/"cancelDrawing"

**Geometry Helpers (Pure Functions):**
- Purpose: Deterministic spatial math for snapping, waypoint derivation, GeoJSON generation
- Examples: `deriveWaypointsFromStations()`, `findSnapTarget()`, `buildProposalLinesGeoJSON()`
- Pattern: Exported from `proposal-geometry.ts`, no internal state or side effects
- Testability: 100% pure — can be tested with simple input/output assertions

**Stat Computations (Pure Functions):**
- Purpose: Estimate line/network metrics (length, cost, ridership, travel time)
- Examples: `computeLineLength()`, `computeProposalStats()`
- Pattern: Accept `ProposalLineDraft | ProposalDraft`, return numbers; use `SPEED_KMH`, `COST_PER_KM_M` constants
- Extensibility: Constants can be adjusted per transit mode for future refinement

**Share Payload (Versioned):**
- Purpose: Encode proposal + metadata into URL-safe format
- Examples: `SharePayloadV1 | SharePayloadV2` from `sharing-types.ts`
- Pattern: Versioned schema to support forward/backward migration
- V1: Same as V2 for now; schema reserved for future station-first model changes

## Entry Points

**Web UI Root:**
- Location: `app/page.tsx`
- Triggers: Browser request to `/`
- Responsibilities: Renders `<EditorShell />` as the main editor interface

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every App Router render (wraps all routes)
- Responsibilities: Sets metadata (title, description), wraps children in `<html>/<body>` tags

**Editor Shell Component:**
- Location: `components/editor/editor-shell.tsx`
- Triggers: Rendered from `app/page.tsx`
- Responsibilities:
  - Initialize `useReducer(historyReducer, undefined, createInitialHistoryState)`
  - Read URL hash on mount → conditionally enter shared view mode
  - Manage local state: `shareModalOpen`, `mapRefState`, `tooltipStep`
  - Wire all UI event handlers to `dispatch()` calls
  - Render `EditorFrame` with map and sidebar slots
  - Conditionally render `ShareModal`, `ConfirmationDialog`, `OnboardingTooltip` overlays

**Toronto Map Component:**
- Location: `components/editor/toronto-map.tsx`
- Triggers: Rendered inside `EditorFrame` after dynamic import
- Responsibilities:
  - Initialize MapLibre canvas and load baseline GeoJSON data (TTC, GO, neighborhoods, corridors)
  - Build and render proposal layers (lines, stations, in-progress ghost line)
  - Handle mouse events (click to place station, drag to move station/waypoint, hover for snapping)
  - Dispatch actions for placing stations, moving geometry, toggling baseline layers
  - Manage drawing-specific UX (snap cues, cursor position, interchange suggestions)

## Error Handling

**Strategy:** Lightweight, graceful degradation.

**Patterns:**
- **Type safety as primary guard**: TypeScript strict mode in `tsconfig.json` catches most errors at build time
- **Reducer action exhaustiveness**: Action type unions in `proposal-state.ts` ensure all cases are handled; unused actions can be flagged by linter
- **Boundary conditions in pure functions**: Geometry and stats helpers check array length, return safe defaults (0, null) for empty inputs
- **User-facing validation**: Share modal and inspector panels validate input (e.g., name length, coordinate bounds) before dispatching
- **Graceful async failure**: Baseline data loaders and neighborhood fetches have `.catch(() => {})` to silently degrade if data unavailable
- **Private browsing fallback**: Onboarding state uses try/catch around localStorage to handle private browsing mode

**No explicit error classes or logging** — errors are prevented, not caught.

## Cross-Cutting Concerns

**Logging:** None configured. Debug via React DevTools and browser console; consider adding structured logging if observability is needed.

**Validation:** Implicit via reducer logic and type contracts. Form inputs validated in components before dispatch.

**Authentication:** Not applicable — no backend, all state is client-side and shareable.

**Accessibility:** Semantic HTML, keyboard shortcuts (Undo, Redo, Delete, Escape), focus management on modals. Tailwind utilities provide color contrast; full a11y audit pending.

---

*Architecture analysis: 2026-04-01*
