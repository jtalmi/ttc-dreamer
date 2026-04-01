# Phase 7: Full-Screen Layout and Floating Toolbars - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the editor from a fixed-header layout to a full-screen map canvas with floating toolbars. Remove TopToolbar, make MapStage fill the viewport, add floating drawing toolbar and layer picker overlaid on the map, redesign sidebar as an anchored right-edge overlay, and move title/share controls into the sidebar header.

</domain>

<decisions>
## Implementation Decisions

### Layout & Positioning
- Floating drawing toolbar: left edge, vertically centered pill (Excalidraw/Figma pattern)
- Floating layer picker: bottom-right card (Google Maps convention)
- Sidebar: anchored right edge panel (320px), overlays map with semi-transparent backdrop when open
- Title editing and Share button: moved into the sidebar header area (always visible at top of sidebar)

### Toolbar Organization
- Drawing toolbar buttons: Select, Draw (station-first), Add Line — minimal 3-button pill
- Inspect removed as separate tool — clicking elements on map opens inspector automatically
- Icon-only with tooltip on hover — lucide-react icons, saves space
- Layer picker contains: Baseline toggle (Today/Future) + Corridors toggle + Comparison toggle
- "Add Line" button in floating drawing toolbar — clicking opens line creation flow in sidebar

### Sidebar Default & Interaction
- Default view: line list with colors + proposal stats below (existing "list" panel)
- Auto-opens when clicking a station/line on map (shows inspector panel)
- Does NOT auto-close when clicking empty map — returns to line list default
- Toggle via small floating chevron button at right edge of map (visible when sidebar closed)

### Claude's Discretion
- Exact z-index values for floating elements (establish a CSS variable scale)
- pointer-events discipline on toolbar wrappers (none on wrapper, auto on buttons)
- Transition/animation timing for sidebar open/close
- Exact icon choices from lucide-react for each tool button
- Whether to use @radix-ui/react-toolbar or plain buttons for the floating toolbar

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EditorFrame` — prop-driven layout container, controlled/uncontrolled pattern
- `TopToolbar` — buttons and callbacks already wired (will be removed, logic redistributed)
- `SidebarShell` — collapse/expand toggle, 320px/64px with transition
- `MapStage` — position: relative, children slot, banner slot (already supports absolute overlays)
- `TOOL_DISPLAY` / `TOOL_MODE` maps in editor-shell.tsx
- CSS variables: `--shell-secondary`, `--shell-dominant`, `--shell-accent`, `--space-*`

### Established Patterns
- All inline styles (no CSS classes) — consistent with codebase
- Controlled/uncontrolled prop pattern on EditorFrame
- Banner already uses `position: absolute; bottom: 0` in MapStage
- useReducer for all state, chrome state for UI concerns
- Keyboard shortcuts: Cmd+Z, Delete, Escape already handled in editor-shell.tsx

### Integration Points
- EditorShell dispatches tool/sidebar/baseline changes via reducer
- EditorFrame passes callbacks to TopToolbar (will be redirected to floating components)
- MapStage renders children (TorontoMap) and banner — floating toolbars will be new children
- SidebarShell receives collapsed prop and children for panel content

</code_context>

<specifics>
## Specific Ideas

- Full-screen like Excalidraw — avoid nav buttons wherever possible
- Map presentation toggles (today/future/bus/etc.) should be a floating toolbar like Google Maps roadmap/satellite/terrain picker
- All controls float over the map, not in fixed chrome

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
