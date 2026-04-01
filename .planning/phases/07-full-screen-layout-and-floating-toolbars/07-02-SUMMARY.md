---
phase: 07-full-screen-layout-and-floating-toolbars
plan: "02"
subsystem: editor-layout
tags: [layout, floating-controls, sidebar, layer-picker, lucide-react, css-tokens]
dependency_graph:
  requires: [07-01]
  provides: [floating-layer-picker, sidebar-overlay, sidebar-header-title-share]
  affects: [editor-frame, editor-shell, sidebar-shell]
tech_stack:
  added: []
  patterns: [absolute-positioning, overlay-sidebar, inline-title-editing, floating-card]
key_files:
  created:
    - components/editor/floating-layer-picker.tsx
  modified:
    - components/editor/sidebar-shell.tsx
    - components/editor/editor-frame.tsx
    - components/editor/editor-shell.tsx
decisions:
  - "SidebarShell chevron uses ChevronRight when open and ChevronLeft when closed — opposite of typical convention but matches the visual direction (chevron points toward the sidebar to 'close' it)"
  - "FloatingLayerPicker right offset transitions with sidebar state via CSS transition on right property"
  - "EditorFrame renamed sidebarCollapsed to sidebarOpen for clarity (inverted semantics)"
metrics:
  duration: "2 minutes"
  completed: "2026-04-01"
  tasks_completed: 1
  files_modified: 3
  files_created: 1
---

# Phase 07 Plan 02: Floating Layer Picker and Sidebar Overlay Summary

**One-liner:** Floating layer picker card with baseline/corridor/comparison toggles, sidebar rewritten as absolute overlay with inline title editing and Share button in header.

## What Was Built

### Task 1: Create FloatingLayerPicker, redesign SidebarShell as overlay with header, wire into EditorShell

**FloatingLayerPicker** (`components/editor/floating-layer-picker.tsx`):
- Bottom-right floating card using `var(--layer-picker-bg)` and `var(--layer-picker-shadow)` Phase 7 CSS tokens
- Three toggle rows: Baseline (Train/TrainFront icon, toggles today↔future_committed), Corridors (Bus icon, on/off), Comparison (Layers icon, disabled with opacity 0.4 when no lines)
- Each row has a TogglePill indicator (ON/OFF pill, accent color when on)
- Right offset transitions when `sidebarOpen` changes (shifts left to avoid sidebar overlap)
- `pointer-events: none` on wrapper; `pointer-events: auto` on card (per Phase 7 floating surface convention)

**SidebarShell** (`components/editor/sidebar-shell.tsx`):
- Full rewrite as absolute-positioned overlay (`position: absolute; top:0; right:0; bottom:0; width:320px`)
- Slide transition: `transform: translateX(0)` when open, `translateX(320px)` when closed (0.2s ease)
- Chevron toggle button rendered as sibling (React fragment) outside the aside — always visible at right map edge, `z-index: var(--z-sidebar-toggle)`
- Header (52px): inline title editing (span→input on click, blur/Enter commits, Escape cancels) + Share button (accent bg, right-aligned)
- Content area: `flex:1; padding: var(--space-lg); overflowY: auto`
- Removed old `COLLAPSED_WIDTH = 64` fixed-width collapse approach entirely

**EditorFrame** (`components/editor/editor-frame.tsx`):
- Renamed `sidebarCollapsed` to `sidebarOpen` prop (inverted semantics for clarity)
- Added `title`, `onTitleChange`, `onShareClick` props forwarded to SidebarShell
- Passes `open={sidebarOpen}` and `onToggle` to SidebarShell

**EditorShell** (`components/editor/editor-shell.tsx`):
- Imported `FloatingLayerPicker`
- Combined `FloatingDrawingToolbar` + `FloatingLayerPicker` into `floatingControls` fragment
- Updated `EditorFrame` call: `sidebarOpen={chrome.sidebarOpen}`, added `title`, `onTitleChange`, `onShareClick` props
- FloatingLayerPicker receives all dispatch callbacks for baseline, corridor, and comparison state

## Decisions Made

1. **Chevron direction** — `ChevronRight` when open (pointing right = "push sidebar away"), `ChevronLeft` when closed (pointing left = "pull sidebar in"). Matches the mental model of the button's action direction.

2. **FloatingLayerPicker right offset** — Uses CSS `right` property with transition when `sidebarOpen` changes, shifting the card left by `320px + spacing` to prevent the sidebar from covering the layer picker.

3. **EditorFrame `sidebarOpen` rename** — The previous `sidebarCollapsed` prop had inverted semantics (you had to pass `!chrome.sidebarOpen`). Renamed for directness.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria passed on first attempt.

## Known Stubs

None — all three toggle rows in FloatingLayerPicker wire to real dispatch actions. SidebarShell header title editing wires to `onTitleChange` which dispatches `updateTitle`. Share button wires to `onShareClick` which opens `ShareModal`.

## Self-Check: PASSED

Files verified:
- `components/editor/floating-layer-picker.tsx` — exists, exports FloatingLayerPicker
- `components/editor/sidebar-shell.tsx` — contains translateX, ChevronLeft/Right, onShareClick, onTitleChange
- `components/editor/editor-frame.tsx` — contains sidebarOpen prop, forwards title/onTitleChange/onShareClick
- `components/editor/editor-shell.tsx` — imports and renders FloatingLayerPicker

Commit verified:
- `aff1420` — feat(07-02): FloatingLayerPicker, redesigned SidebarShell overlay, wired into EditorShell
