---
phase: 04-stats-inspectors-and-comparison
plan: "02"
subsystem: editor-ui
tags: [inspector, stats, sidebar, proposal]
dependency_graph:
  requires: [04-01]
  provides: [line-inspector-panel, station-inspector-panel, proposal-stats-panel, inspect-tool-wiring]
  affects: [editor-shell, toronto-map, line-list, sidebar-routing]
tech_stack:
  added: []
  patterns: [useMemo-for-stats, conditional-sidebar-routing, css-custom-property-tokens]
key_files:
  created:
    - components/editor/sidebar/line-inspector-panel.tsx
    - components/editor/sidebar/station-inspector-panel.tsx
    - components/editor/sidebar/proposal-stats-panel.tsx
  modified:
    - components/editor/editor-shell.tsx
    - components/editor/toronto-map.tsx
    - components/editor/sidebar/line-list.tsx
decisions:
  - LineList onInspectLine takes priority over onSelectLine when both are provided — keeps inspect-in-any-mode spec without breaking existing select behavior
  - Inspector panels use height:100%+overflow:hidden to allow body scrolling with pinned header within the sidebar shell's padding
  - dispatch called inline in render for closeInspector on deleted-element fallback — acceptable since it immediately corrects stale chrome state
metrics:
  duration_min: 8
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_changed: 6
requirements:
  - STATS-01
  - STATS-02
  - STATS-03
---

# Phase 04 Plan 02: Inspector Panels and Stats Summary

Three sidebar panel components built and wired into the editor — line inspector with color-striped header and 2x2 stats grid, station inspector with line membership and location resolution, and live proposal stats summary below the line list.

## What Was Built

### Task 1: Inspector and stats panel components

**LineInspectorPanel** (`components/editor/sidebar/line-inspector-panel.tsx`):
- Header strip: 4px left border in line color, name (20px/600), mode badge (muted), close button (44x44px `×`)
- Geometry section: Length (1-decimal km) and Stations count
- Stats 2x2 grid: Travel Time (`~N min`), Avg Spacing (`~N km` or `—`), Est. Cost (`~$NB`/`~$NM`), Est. Ridership (`~NK/day`)
- Connection section: interchange count from `lineIds.length > 1` or `linkedBaselineStationId`
- All stat values use `~` prefix with qualifier text at `var(--stat-value-muted)`

**StationInspectorPanel** (`components/editor/sidebar/station-inspector-panel.tsx`):
- Header: station name (20px/600), close button — no color stripe
- Lines section: color dot (12px) + line name for each line the station belongs to
- Connected to baseline: `linkedBaselineStationId` presence or "None"
- Location: `resolveNeighbourhood` when neighbourhoods loaded, coordinate fallback otherwise

**ProposalStatsPanel** (`components/editor/sidebar/proposal-stats-panel.tsx`):
- Empty state: "Add a line to see proposal stats."
- Live stats via `useMemo(() => computeProposalStats(draft), [draft])`
- Section heading "Proposal Stats", 2x2 primary grid, secondary rows (Stations, Network, Interchanges)
- Exact copywriting contract copy for all qualifiers and labels

### Task 2: Wiring — editor shell, map, and line list

**EditorShell** (`components/editor/editor-shell.tsx`):
- Added `neighbourhoods` state with `fetch("/data/neighbourhoods.geojson")` on mount
- Sidebar routing extended: `inspect-line` → `LineInspectorPanel`, `inspect-station` → `StationInspectorPanel`
- Deleted-element fallback: dispatches `closeInspector` when inspected ID no longer exists in draft
- Default "list" panel now wraps `LineList` + `ProposalStatsPanel` in a flex column
- Escape key now closes inspector (before checking drawing session)

**TorontoMap** (`components/editor/toronto-map.tsx`):
- Inspect tool handler added BEFORE the select block in `handleClick`
- Waypoint click → resolves to parent line for inspect dispatch
- Station/line click → dispatches `inspectElement` with correct elementType
- Empty space click → dispatches `closeInspector`
- Cursor fixed: `zoom-in` → `pointer` for inspect mode

**LineList** (`components/editor/sidebar/line-list.tsx`):
- Added optional `onInspectLine?: (lineId: string) => void` prop
- Row `onClick` calls `onInspectLine` when provided (falling back to `onSelectLine`)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all stat values are live-computed from `draft` state.

## Self-Check: PASSED

Files created:
- `/Users/jonathan/dev/ttc-dreamer/components/editor/sidebar/line-inspector-panel.tsx` — FOUND
- `/Users/jonathan/dev/ttc-dreamer/components/editor/sidebar/station-inspector-panel.tsx` — FOUND
- `/Users/jonathan/dev/ttc-dreamer/components/editor/sidebar/proposal-stats-panel.tsx` — FOUND

Commits:
- `358696c` feat(04-02): add line inspector, station inspector, and proposal stats panels — FOUND
- `7cc5681` feat(04-02): wire inspect tool, sidebar routing, and stats panel into editor — FOUND

Build: `npm run build` — PASSED
Typecheck: `npm run typecheck` — PASSED
Lint: `npm run lint` — PASSED
Tests: 76 passed — PASSED
