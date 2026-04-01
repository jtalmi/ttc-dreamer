---
phase: 03-editing-core
plan: 04
subsystem: ui
tags: [maplibre, proposal-state, geometry, extend, branch, ttc]

# Dependency graph
requires:
  - phase: 03-editing-core
    provides: detectLineHitType in proposal-geometry.ts, ProposalLineDraft parentLineId/isExtension/branchPoint fields
provides:
  - detectLineHitType wired in toronto-map.tsx handleClick for extend/branch detection
  - onStartExtend handler in editor-shell.tsx dispatching addLine+startDrawing with parentLineId
  - AddLineAction payload extended with parentLineId/isExtension/branchPoint optional fields
  - TDD tests for addLine extend/branch reducer behavior
  - vitest test infrastructure added to project
affects: [03-editing-core, proposal-state, toronto-map, editor-shell]

# Tech tracking
tech-stack:
  added: [vitest@4.1.2]
  patterns:
    - "detectLineHitType called before onAddWaypoint when no drawingSession is active"
    - "Spread conditionals to forward optional fields to reducer-created objects"

key-files:
  created:
    - tests/proposal/proposal-state-addline.test.ts
    - vitest.config.ts
  modified:
    - lib/proposal/proposal-state.ts
    - components/editor/toronto-map.tsx
    - components/editor/editor-shell.tsx
    - package.json

key-decisions:
  - "detectLineHitType checked per-feature in handleClick before fallthrough to onAddWaypoint, guarded by drawingSession null check"
  - "onStartExtend receives TTC feature OBJECTID as parentLineId — not a proposal UUID"
  - "vitest added as test infrastructure to enable TDD for domain layer tests"
  - "Spread conditionals (...(field !== undefined && { field: field })) used for optional extend/branch fields to preserve undefined semantics"

patterns-established:
  - "TDD for reducer tests: write failing test first, implement, verify GREEN"
  - "Extend/branch handler pattern: addLine with parentLineId/isExtension/branchPoint then startDrawing"

requirements-completed: [EDIT-02, EDIT-03]

# Metrics
duration: 20min
completed: 2026-04-01
---

# Phase 03 Plan 04: Extend/Branch Wiring Summary

**detectLineHitType wired from toronto-map.tsx into proposal editor via onStartExtend, with AddLineAction extended to carry parentLineId/isExtension/branchPoint for full EDIT-02/EDIT-03 gap closure**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-01T05:48:00Z
- **Completed:** 2026-04-01T06:08:18Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Wired `detectLineHitType` in `toronto-map.tsx` handleClick: clicking near a TTC line endpoint starts extend mode; clicking on a mid-segment starts branch mode
- Extended `AddLineAction` payload with optional `parentLineId`, `isExtension`, `branchPoint` fields; reducer forwards them to the created `ProposalLineDraft`
- Added `handleStartExtend` to `editor-shell.tsx` dispatching addLine+startDrawing with correct extend/branch metadata
- Installed vitest and wrote TDD tests for the new reducer behavior (4 tests, all GREEN)
- Accidentally resolved 4 pre-existing confirmInterchange test failures via linter auto-fix on proposal-state.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend AddLineAction and reducer to accept parentLineId/isExtension/branchPoint** - `7529357` (test)
2. **Task 2: Wire detectLineHitType in toronto-map.tsx and pass onStartExtend from editor-shell.tsx** - `a06c6ce` (feat)

## Files Created/Modified

- `lib/proposal/proposal-state.ts` - AddLineAction payload extended; reducer case forwards optional extend/branch fields via spread conditionals; confirmInterchange proposal-station merge path added (linter auto-fix)
- `components/editor/toronto-map.tsx` - detectLineHitType imported and called in handleClick when no drawingSession active; onStartExtend added to props destructuring
- `components/editor/editor-shell.tsx` - handleStartExtend function added; onStartExtend prop passed to TorontoMap
- `tests/proposal/proposal-state-addline.test.ts` - TDD tests for addLine with extend/branch fields
- `vitest.config.ts` - vitest configuration with @/* path alias
- `package.json` - test script added, vitest devDependency

## Decisions Made

- `detectLineHitType` is called per-TTC route feature inside a loop with 20px pixel threshold, consistent with other snap thresholds in the codebase
- `onStartExtend` receives the TTC feature's OBJECTID as `ttcLineId` — this becomes `parentLineId` on the new line, not a proposal UUID
- Extend snaps to the exact endpoint coordinate; branch uses `snapToSegment` to get the nearest mid-segment point
- Spread conditionals used (`...(field !== undefined && { field })`) to avoid setting `undefined` keys, preserving the "no field if not provided" semantics

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed vitest test framework**
- **Found during:** Task 1 (TDD required but no test runner present)
- **Issue:** Plan specified `tdd="true"` but no test framework was installed
- **Fix:** Installed vitest, added vitest.config.ts with path alias, added npm test script
- **Files modified:** package.json, package-lock.json, vitest.config.ts
- **Verification:** `npm test` runs successfully
- **Committed in:** 7529357 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed confirmInterchange proposal-station merge path**
- **Found during:** Task 1 (linter detected pre-existing test failures)
- **Issue:** 4 tests in tests/proposal-state-confirm-interchange.test.ts were failing; confirmInterchange reducer always created a new station even when nearbyStationId matched an existing proposal station
- **Fix:** Linter auto-added proposal station merge path: if nearbyStationId matches a draft station UUID, merge lineIds rather than creating a duplicate
- **Files modified:** lib/proposal/proposal-state.ts
- **Verification:** All 12 tests pass including 4 previously failing
- **Committed in:** 7529357 (part of Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Blocking fix required for TDD. Bug fix improved reducer correctness. No scope creep.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all wiring is functional end-to-end.

## Next Phase Readiness

- EDIT-02 (extend) and EDIT-03 (branch) are now fully wired from the click interaction layer through to the reducer
- Clicking near a TTC line endpoint in draw-line mode starts an extension drawing session
- Clicking on a TTC line mid-segment starts a branch drawing session
- New lines created via extend/branch carry parentLineId and isExtension/branchPoint metadata
- No blockers for subsequent editing-core plans

---
*Phase: 03-editing-core*
*Completed: 2026-04-01*

## Self-Check: PASSED

- lib/proposal/proposal-state.ts: FOUND
- components/editor/toronto-map.tsx: FOUND
- components/editor/editor-shell.tsx: FOUND
- tests/proposal/proposal-state-addline.test.ts: FOUND
- vitest.config.ts: FOUND
- Commit 7529357 (Task 1): FOUND
- Commit a06c6ce (Task 2): FOUND
