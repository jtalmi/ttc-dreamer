---
phase: 04-stats-inspectors-and-comparison
plan: "01"
subsystem: proposal-stats
tags: [stats, tdd, pure-functions, chrome-state, inspector]
dependency_graph:
  requires: []
  provides: [proposal-stats, inspector-chrome-state, comparison-mode-toggle]
  affects: [lib/proposal/index.ts, lib/proposal/proposal-types.ts, lib/proposal/proposal-state.ts, app/globals.css]
tech_stack:
  added: []
  patterns: [pure-stat-functions, turf-length, chrome-state-extension, tdd-red-green]
key_files:
  created:
    - lib/proposal/proposal-stats.ts
    - tests/proposal/proposal-stats.test.ts
  modified:
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/proposal/index.ts
    - app/globals.css
decisions:
  - "Stat functions are pure (take ProposalLineDraft/ProposalDraft, return numbers/null) — no side effects"
  - "resolveNeighbourhood accepts FeatureCollection as parameter (no internal fetch) — keeps module side-effect-free and testable"
  - "inspectElement is a dedicated action that atomically sets both sidebarPanel and inspectedElementId — setSidebarPanel payload stays at the original 3-value union per RESEARCH pitfall #1"
  - "New chrome actions (inspectElement, closeInspector, toggleComparisonMode) NOT added to HISTORY_ACTIONS — chrome-only, not draft mutations"
metrics:
  duration_seconds: 182
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_modified: 6
---

# Phase 04 Plan 01: Proposal Stats Computation and State Extensions Summary

Pure stat computation layer built with TDD, plus inspector/comparison chrome state extensions. All 26 stat tests pass; 50 total tests pass after integration.

## What Was Built

### Task 1 (TDD): proposal-stats.ts

Seven pure functions and three exported constants:

- `computeLineLength(line)` — uses `turf.length` on waypoints; returns 0 for <2 waypoints
- `computeTravelTime(line)` — `Math.round((km / SPEED_KMH[mode]) * 60)`; 0 for empty lines
- `computeAvgStopSpacing(line)` — `null` for <2 stations; `km / (count-1)` to 1 decimal
- `computeLineCost(line)` — `km * COST_PER_KM_M[mode]`
- `computeLineRidership(line)` — `stations * RIDERSHIP_PER_STATION[mode]`, rounded to nearest 100
- `computeProposalStats(draft)` — aggregates networkKm, travelTime (longest line), avgSpacing, totalCostM, totalRidership, stationCount, interchangeCount
- `resolveNeighbourhood(position, neighbourhoods, maxKm=3)` — `turf.nearestPoint` with 3km cap; fallback to `"lat, lng"` to 4 decimal places

Constants exported: `SPEED_KMH`, `COST_PER_KM_M`, `RIDERSHIP_PER_STATION` (all `Record<TransitMode, number>`)

### Task 2: Type/State/CSS Extensions

**proposal-types.ts:**
- `sidebarPanel` extended: `"list" | "create" | "drawing-status" | "inspect-line" | "inspect-station"`
- `EditorChromeState` gains: `inspectedElementId: string | null` and `comparisonMode: boolean`

**proposal-state.ts:**
- Three new action types: `InspectElementAction`, `CloseInspectorAction`, `ToggleComparisonModeAction`
- Initial state: `inspectedElementId: null, comparisonMode: false`
- `inspectElement` reducer: sets id, derives panel from elementType, opens sidebar
- `closeInspector` reducer: clears id, resets panel to `"list"`
- `toggleComparisonMode` reducer: flips boolean

**index.ts:** Re-exports `ProposalStats` type, all 7 stat functions, and 3 constants from `proposal-stats.ts`

**globals.css:** Five new Phase 4 tokens — `--inspector-divider`, `--stat-value-muted`, `--stat-group-label`, `--comparison-delta-positive`, `--comparison-delta-neutral`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

```
npx vitest run → 50 passed (50)
npm run typecheck → exit 0
npm run lint → exit 0
```

## Self-Check: PASSED

Files exist:
- FOUND: lib/proposal/proposal-stats.ts
- FOUND: tests/proposal/proposal-stats.test.ts

Commits exist:
- 2698800 — test(04-01): add failing tests for proposal stat functions (RED)
- 00ca5ef — feat(04-01): implement proposal stat computation functions (GREEN)
- e982905 — feat(04-01): extend types, reducer, barrel exports, and CSS tokens
