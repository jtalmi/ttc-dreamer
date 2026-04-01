---
phase: 01-editor-shell-and-proposal-state
plan: 03
subsystem: ui
tags: [react, next.js, useReducer, editor-shell, typescript]

# Dependency graph
requires:
  - phase: 01-editor-shell-and-proposal-state (plans 01 and 02)
    provides: proposal-types, proposalEditorReducer, createInitialProposalDraft, EditorFrame, TopToolbar, MapStage, SidebarShell
provides:
  - EditorShell client component with useReducer owning all shell state
  - BaselineToggle component with Today/Future committed aria-pressed controls
  - app/page.tsx renders EditorShell directly (route wired to shell)
affects: [phase-02-toronto-baseline, any phase building on the editor shell]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - EditorShell as single owner of useReducer(proposalEditorReducer) state, passing controlled props down to EditorFrame
    - EditorFrame extended with optional parent-driven callbacks (onToolSelect, onBaselineChange, onSidebarToggle) to complement existing controlled/uncontrolled prop pattern

key-files:
  created:
    - components/editor/editor-shell.tsx
    - components/editor/baseline-toggle.tsx
  modified:
    - components/editor/editor-frame.tsx
    - app/page.tsx

key-decisions:
  - "EditorShell owns all Phase 1 interactive state via useReducer rather than lifting state into the route"
  - "BaselineToggle extracted as a standalone component with aria-pressed and exact labels Today / Future committed"
  - "EditorFrame extended with optional callback props so parent-controlled mode does not require bypassing the frame entirely"

patterns-established:
  - "Client component with useReducer at the shell boundary: EditorShell is the only stateful layer; all children receive plain props"
  - "Controlled/uncontrolled duality in EditorFrame: callback props take priority over internal setState when provided"

requirements-completed: [EDTR-01, EDTR-02, EDTR-03, EDTR-04, EDTR-05]

# Metrics
duration: 1min
completed: 2026-04-01
---

# Phase 01 Plan 03: Wire Editor Shell into Route Summary

**React useReducer-backed EditorShell with BaselineToggle replaces the placeholder route, giving / a fully interactive Phase 1 editor chrome**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-01T01:04:38Z
- **Completed:** 2026-04-01T01:06:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `EditorShell` as a `'use client'` component using `useReducer(proposalEditorReducer, undefined, createInitialProposalDraft)` as the single state owner for all Phase 1 chrome interactions
- Created `BaselineToggle` as a standalone component emitting exact labels `Today` and `Future committed` with `aria-pressed` semantics and a `setBaselineMode` dispatch callback
- Wired `app/page.tsx` to render `EditorShell` directly, replacing the Repo Bootstrap placeholder; route stays server-compatible with no `'use client'`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the interactive editor shell and baseline toggle** - `2427c9b` (feat)
2. **Task 2: Replace the placeholder route with the Phase 1 editor shell** - `6ef5471` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `components/editor/editor-shell.tsx` - Client component wrapping EditorFrame with reducer-owned state
- `components/editor/baseline-toggle.tsx` - Standalone baseline toggle with Today/Future committed aria-pressed buttons
- `components/editor/editor-frame.tsx` - Extended with optional onToolSelect, onBaselineChange, onSidebarToggle callback props
- `app/page.tsx` - Thinned to single `<EditorShell />` render, no placeholder copy

## Decisions Made
- Kept `EditorShell` as a thin orchestrator that owns reducer state and passes controlled props + callbacks into `EditorFrame`, rather than restructuring the frame component
- Extended `EditorFrame`'s callback slots to support parent-driven controlled mode without removing the existing uncontrolled fallback path

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added onToolSelect/onBaselineChange/onSidebarToggle to EditorFrame**
- **Found during:** Task 1 (EditorShell creation)
- **Issue:** EditorFrame had no way to receive external callbacks — its internal handlers used local useState unconditionally, making parent-controlled mode impossible without bypassing the frame
- **Fix:** Added three optional callback props; internal handlers now delegate to the provided callback when present, falling back to local setState otherwise
- **Files modified:** components/editor/editor-frame.tsx
- **Verification:** npm run typecheck exits 0; EditorShell compiles and passes all controlled props through
- **Committed in:** 2427c9b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — controlled callback support)
**Impact on plan:** Essential for EditorShell to own state. No scope creep; strictly extends the existing controlled/uncontrolled API pattern already designed into EditorFrame.

## Issues Encountered
None — deviation was identified and resolved in the same task pass.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The Phase 1 editor shell is fully wired: baseline toggle and sidebar collapse work through shared reducer state
- Phase 2 can inject real Toronto map data via MapStage's `children` slot without touching the shell structure
- `EditorFrame` and `EditorShell` are stable API boundaries for Phase 2 additions

## Self-Check: PASSED

- FOUND: components/editor/editor-shell.tsx
- FOUND: components/editor/baseline-toggle.tsx
- FOUND: components/editor/editor-frame.tsx
- FOUND: app/page.tsx
- FOUND: .planning/phases/01-editor-shell-and-proposal-state/01-03-SUMMARY.md
- COMMIT 2427c9b: feat(01-03): create EditorShell and BaselineToggle components
- COMMIT 6ef5471: feat(01-03): replace placeholder route with Phase 1 editor shell

---
*Phase: 01-editor-shell-and-proposal-state*
*Completed: 2026-04-01*
