---
phase: 01-editor-shell-and-proposal-state
plan: "01"
subsystem: ui
tags: [typescript, react, useReducer, proposal-state, editor-shell]

# Dependency graph
requires: []
provides:
  - Typed proposal draft model (ProposalDraft, ProposalLineDraft, ProposalStationDraft)
  - BaselineMode union type with exact values "today" and "future_committed"
  - ToolMode union type for toolbar state
  - EditorChromeState and EditorShellState types
  - createInitialProposalDraft() helper
  - proposalEditorReducer with setBaselineMode, toggleSidebar, setActiveTool, resetShellState
  - lib/proposal/index.ts barrel re-exporting all types and helpers
affects:
  - 01-02-PLAN
  - 01-03-PLAN
  - All editor shell components wiring useReducer

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Domain-first shell state — types and reducer in lib/proposal before UI wiring
    - Discriminated union actions for the editor shell reducer
    - Barrel index.ts re-exporting all proposal module members

key-files:
  created:
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/proposal/index.ts
  modified: []

key-decisions:
  - "BaselineMode union uses exact string literals today and future_committed per D-09"
  - "EditorShellState combines draft and chrome into one reducer root to avoid split-state pitfall"
  - "No real Toronto data or editing actions introduced — Phase 1 scope strictly enforced"

patterns-established:
  - "Pattern: lib/proposal/* is the domain module boundary; UI components import from lib/proposal/index.ts only"
  - "Pattern: EditorShellAction is a discriminated union exported from proposal-state.ts"

requirements-completed: [EDTR-04, EDTR-05]

# Metrics
duration: 15min
completed: 2026-04-01
---

# Phase 01 Plan 01: Proposal and Shell State Foundation Summary

**Typed proposal draft and editor shell state module using BaselineMode, ToolMode, ProposalDraft, and a useReducer-ready proposalEditorReducer**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-01T00:46:24Z
- **Completed:** 2026-04-01T01:01:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Established the typed contract for proposal state (draft shape, baseline mode, tool mode, chrome state)
- Implemented createInitialProposalDraft() returning a default Toronto sandbox shell with baselineMode "today", activeTool "select", and sidebarOpen true
- Implemented proposalEditorReducer covering all four Phase 1 action variants
- Created barrel index.ts so editor components have a single import target

## Task Commits

Each task was committed atomically:

1. **Task 1: Define future-facing proposal and shell types** - `4a1cb7d` (feat)
2. **Task 2: Add initial draft state and reducer helpers** - `ace1121` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified
- `lib/proposal/proposal-types.ts` - BaselineMode, ToolMode, ProposalDraft, EditorChromeState, EditorShellState
- `lib/proposal/proposal-state.ts` - createInitialProposalDraft, proposalEditorReducer, EditorShellAction union
- `lib/proposal/index.ts` - Barrel re-exporting all types and helpers from both modules

## Decisions Made
- Combined draft and chrome into a single EditorShellState root so the reducer stays cohesive and avoids the split-state pitfall described in RESEARCH.md
- Exported EditorShellAction as a named type from proposal-state.ts to keep action types co-located with the reducer
- Used `import type` for all type-only imports in proposal-state.ts per CLAUDE.md conventions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- lib/proposal/* is ready for UI wiring in plan 02 (editor shell components)
- proposalEditorReducer can be dropped into useReducer in the EditorShell client component
- The BaselineMode toggle, activeTool dispatch, and sidebar collapse are all wired to real state from day one
- No blockers

## Self-Check: PASSED

- lib/proposal/proposal-types.ts: FOUND
- lib/proposal/proposal-state.ts: FOUND
- lib/proposal/index.ts: FOUND
- Commit 4a1cb7d (Task 1): FOUND
- Commit ace1121 (Task 2): FOUND

---
*Phase: 01-editor-shell-and-proposal-state*
*Completed: 2026-04-01*
