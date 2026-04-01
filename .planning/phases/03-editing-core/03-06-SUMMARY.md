---
phase: 03-editing-core
plan: "06"
subsystem: proposal-state
tags: [reducer, interchange, shared-station, tdd, gap-closure]
dependency_graph:
  requires: []
  provides: [shared-station-merge-via-confirmInterchange]
  affects: [lib/proposal/proposal-state.ts]
tech_stack:
  added: [vitest@4.1.2]
  patterns: [TDD red-green, reducer branch on draft-station lookup]
key_files:
  created:
    - tests/proposal-state-confirm-interchange.test.ts
  modified:
    - lib/proposal/proposal-state.ts
decisions:
  - confirmInterchange disambiguates proposal vs TTC station by checking draft.stations array — UUID IDs match draft stations; numeric ArcGIS IDs do not
  - Merge path mutates lineIds on the existing station and stationIds on the incoming line — no new ProposalStationDraft entity is created
metrics:
  duration_minutes: 8
  completed_date: "2026-04-01"
  tasks_completed: 1
  files_changed: 2
---

# Phase 03 Plan 06: Shared Station Merging (EDIT-08) Summary

**One-liner:** Fix confirmInterchange reducer to merge lineIds into an existing proposal station instead of always creating a duplicate station entity.

## What Was Built

The `confirmInterchange` reducer case in `lib/proposal/proposal-state.ts` previously always created a new `ProposalStationDraft` regardless of whether the `nearbyStationId` already referred to an existing proposal station. This meant two lines could never share a single station entity — a duplicate was always created with `linkedBaselineStationId` set to the other proposal station's ID.

The fix adds a branch at the top of the `confirmInterchange` case:

1. Look up `suggestion.nearbyStationId` in `state.draft.stations`.
2. If found (proposal station merge path): spread `suggestion.lineId` into the existing station's `lineIds`; add the existing station's ID to the new line's `stationIds`. Station count unchanged.
3. If not found (TTC baseline path): original behavior preserved — create a new station with `linkedBaselineStationId` set.

## Tasks

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 (RED) | Failing tests for confirmInterchange merge | dc27f5f | tests/proposal-state-confirm-interchange.test.ts |
| 1 (GREEN) | Fix confirmInterchange reducer | 7529357 | lib/proposal/proposal-state.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vitest not installed — TDD tests could not run**
- **Found during:** Task 1 setup
- **Issue:** No test framework was installed; `tests/` directory was empty; `npm test` was not configured.
- **Fix:** Installed vitest@4.1.2 as dev dependency; added `"test": "vitest run"` script to package.json; vitest.config.ts already existed (created by a prior plan in parallel execution).
- **Files modified:** package.json, package-lock.json
- **Commit:** dc27f5f (test commit)

**2. [Parallel execution note] GREEN commit was included by parallel agent 03-04**
- The `confirmInterchange` changes to `lib/proposal/proposal-state.ts` were committed as part of commit `7529357` by the parallel plan 03-04 agent (which noted "pre-existing interchange tests fixed as side-effect"). The fix is functionally identical to what this plan specified. All tests pass against that committed code.

## Verification

- `npm run typecheck` — 0 errors
- `npm run lint` — 0 warnings/errors
- `npm run build` — compiles successfully
- `npm test` — 12/12 tests pass (8 new interchange tests + 4 addLine tests from plan 03-04)
- `grep existingProposalStation lib/proposal/proposal-state.ts` — present at line 428

## Known Stubs

None — the reducer fix is fully wired. The `lineIds` array on `ProposalStationDraft` is the authoritative shared-station mechanism and both paths exercise it correctly.

## Self-Check: PASSED

- `tests/proposal-state-confirm-interchange.test.ts` — FOUND
- `lib/proposal/proposal-state.ts` (contains `existingProposalStation`) — FOUND
- Commit dc27f5f — FOUND
- Commit 7529357 — FOUND (contains the GREEN implementation)
