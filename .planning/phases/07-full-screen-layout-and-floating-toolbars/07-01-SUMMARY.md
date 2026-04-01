---
phase: 07-full-screen-layout-and-floating-toolbars
plan: "01"
subsystem: editor-layout
tags: [layout, toolbar, lucide-react, css-tokens, full-screen]
dependency_graph:
  requires: []
  provides: [full-screen-layout, floating-drawing-toolbar, phase-7-css-tokens]
  affects: [editor-frame, editor-shell, map-stage, toronto-map, proposal-types]
tech_stack:
  added: [lucide-react]
  patterns: [absolute-positioning, pointer-events-discipline, floating-overlay]
key_files:
  created:
    - components/editor/floating-drawing-toolbar.tsx
  modified:
    - app/globals.css
    - lib/proposal/proposal-types.ts
    - components/editor/editor-frame.tsx
    - components/editor/map-stage.tsx
    - components/editor/editor-shell.tsx
    - components/editor/toronto-map.tsx
    - package.json
decisions:
  - "Select mode now auto-opens inspector (inspectElement dispatch) instead of just selecting — inspect tool removed entirely"
  - "FloatingDrawingToolbar uses pointer-events:none wrapper with auto on interactive children per Phase 7 floating surface convention"
  - "EditorFrame simplified to pure layout shell — no state management, no tool awareness"
metrics:
  duration: "3 minutes"
  completed: "2026-04-01"
  tasks_completed: 2
  files_modified: 7
  files_created: 1
---

# Phase 07 Plan 01: Full-Screen Layout and Floating Drawing Toolbar Summary

**One-liner:** Full-screen Excalidraw-style canvas with lucide-react floating drawing toolbar replacing fixed TopToolbar.

## What Was Built

### Task 1: Install lucide-react, add CSS tokens, remove inspect tool, full-screen EditorFrame

- **lucide-react installed** as a new package dependency
- **Phase 7 CSS tokens** added to `globals.css`: floating surface bg/shadow (`--floating-toolbar-bg`, `--layer-picker-bg`, etc.) and a 7-level z-index scale (`--z-map` through `--z-tooltip`)
- **`ToolMode` updated** — removed `"inspect"` from the type union; now only `"select" | "draw-line" | "add-station"`
- **Inspect behavior merged into select mode** in `toronto-map.tsx`: clicking a station or line in select mode now dispatches `inspectElement` (auto-opens inspector); clicking empty space dispatches `closeInspector`; removed the `case "inspect"` from `cursorStyle`
- **`EditorFrame` refactored** — removed `TopToolbar` entirely; root div changed to `position: relative; height: 100vh; width: 100vw; overflow: hidden`; simplified props to only `sidebarCollapsed`, `onSidebarToggle`, `mapChildren`, `sidebarChildren`, `mapBanner`, `floatingControls`
- **`MapStage` updated** — changed from `flex: 1` to `position: absolute; inset: 0` so it fills the full viewport
- **`EditorShell` cleaned up** — removed `TOOL_DISPLAY`/`TOOL_MODE` mapping objects and all TopToolbar-forwarded props from the `EditorFrame` call

### Task 2: Create FloatingDrawingToolbar and wire into EditorShell

- **`FloatingDrawingToolbar`** created at `components/editor/floating-drawing-toolbar.tsx` — a vertically stacked pill with:
  - Select button (MousePointer2 icon, 20px)
  - Draw button (Pencil icon, 20px)
  - 1px rgba divider
  - Add Line button (Plus icon, 20px)
  - Active tool highlighted with `var(--shell-accent)` background
  - `pointer-events: none` on wrapper; `pointer-events: auto` on inner pill (per Phase 7 floating surface convention)
  - `z-index: var(--z-floating-toolbar)` (200)
  - Positioned `left: var(--space-lg); top: 50%; transform: translateY(-50%)` (left edge, vertically centered)
- **Wired into EditorShell** via `floatingControls` prop; dispatches `setActiveTool` on tool buttons and `setSidebarPanel: "create"` on Add Line

## Decisions Made

1. **Select mode auto-inspects on click** — The `inspect` ToolMode was a separate tool in v1; Phase 7 merges this into `select` mode (clicking an element in select mode opens the inspector). This simplifies the toolbar to 3 tools and makes the interaction feel more like Excalidraw/Figma where selection and inspection are unified.

2. **`pointer-events: none` on floating wrapper** — Per Phase 7 floating surface convention documented in STATE.md and UI-SPEC. The outer positioning div has `pointer-events: none` so the map underneath receives events in empty areas; only the inner pill container restores `pointer-events: auto`.

3. **EditorFrame as pure layout shell** — All tool state management removed from EditorFrame. The component is now a dumb layout container: MapStage fills viewport, floating controls overlay it, sidebar overlays on the right. No internal state required.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria passed on first attempt.

## Known Stubs

- `floatingControls` in EditorShell is wired with the drawing toolbar only; the Layer Picker (Plan 02) is not yet rendered here — this is intentional per plan scope.

## Self-Check: PASSED

Files verified:
- `components/editor/floating-drawing-toolbar.tsx` — exists
- `app/globals.css` — contains `--z-floating-toolbar` and `--floating-toolbar-bg`
- `components/editor/editor-frame.tsx` — contains `floatingControls`, no TopToolbar
- `components/editor/map-stage.tsx` — contains `inset`

Commits verified:
- `724024c` — feat(07-01): full-screen layout, Phase 7 tokens, remove inspect tool
- `06f343c` — feat(07-01): create FloatingDrawingToolbar and wire into EditorShell
