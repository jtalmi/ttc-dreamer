---
phase: 05-sharing-export-and-polish
plan: 01
subsystem: sharing
tags: [sharing, serialization, base64, url-hash, export, reducer, typescript]

# Dependency graph
requires:
  - phase: 04-stats-and-inspector
    provides: ProposalDraft, EditorShellState, EditorShellAction, proposalEditorReducer
provides:
  - SharePayload type with v:1, draft, and optional author fields
  - encodeSharePayload and decodeSharePayload roundtrip with Unicode safety
  - buildExportFilename with slug derivation and fallback
  - exportMapAsPng utility for MapLibre canvas download
  - updateTitle reducer action with 80-char clamp and empty fallback
  - loadDraft reducer action with full chrome reset
  - lib/sharing barrel module
affects: [05-02, 05-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "btoa(encodeURIComponent(JSON.stringify(payload))) for Unicode-safe base64 encoding"
    - "decodeURIComponent(atob(encoded)) for decoding; try/catch returns null on any failure"
    - "isValidSharePayload guard function validates unknown parsed JSON before casting"
    - "HISTORY_ACTIONS set extended for new draft-mutating actions (updateTitle, loadDraft)"

key-files:
  created:
    - lib/sharing/sharing-types.ts
    - lib/sharing/encode-proposal.ts
    - lib/sharing/decode-proposal.ts
    - lib/sharing/export-utils.ts
    - lib/sharing/index.ts
    - tests/sharing/encode-proposal.test.ts
    - tests/sharing/decode-proposal.test.ts
    - tests/sharing/export-utils.test.ts
  modified:
    - lib/proposal/proposal-state.ts
    - lib/proposal/proposal-history.ts

key-decisions:
  - "encodeURIComponent wraps JSON.stringify before btoa to handle Unicode station names and emoji safely"
  - "decodeSharePayload validates v===1, draft object, lines array, and stations array — returns null for any failure"
  - "buildExportFilename collapses consecutive hyphens after stripping non-alphanumeric chars to avoid double-hyphen artifacts"
  - "loadDraft resets full chrome state (selection, inspector, drawing session, pending deletion, comparison mode)"
  - "updateTitle defensive clamp in reducer too even though caller is expected to clamp — never store empty title"
  - "updateTitle and loadDraft both added to HISTORY_ACTIONS (title changes and draft loads are undoable)"

patterns-established:
  - "Sharing module lives in lib/sharing/ as a pure-function domain layer with no React dependencies (except export-utils MapRef type)"
  - "SharePayload v:1 version field enables future schema migration without breaking existing links"

requirements-completed: [SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-06]

# Metrics
duration: 4min
completed: 2026-04-01
---

# Phase 5 Plan 1: Sharing Domain Layer Summary

**URL-hash sharing serialization with Unicode-safe base64 roundtrip, slug-derived PNG filename builder, and updateTitle/loadDraft reducer actions with history support**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-01T07:29:00Z
- **Completed:** 2026-04-01T07:31:56Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Created `lib/sharing/` module with SharePayload type, encode/decode utilities, and PNG export helper — fully tested without browser
- 31 tests covering roundtrip (ASCII + Unicode + emoji), all null/invalid-input decode paths, and all buildExportFilename slug cases
- Extended `proposalEditorReducer` with `updateTitle` (80-char clamp, empty fallback) and `loadDraft` (full draft replacement + chrome reset)
- Both new actions registered in `HISTORY_ACTIONS` so title edits and draft loads are undoable

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sharing types, serialization utilities, and tests** - `7fcd0cf` (feat)
2. **Task 2: Add updateTitle and loadDraft reducer actions** - `79eec61` (feat)

**Plan metadata:** (docs commit follows)

_Note: Task 1 followed TDD — tests written first (RED: 3 file-not-found failures), then implementation (GREEN: 31/31 passing)_

## Files Created/Modified

- `lib/sharing/sharing-types.ts` - SharePayload type importing ProposalDraft
- `lib/sharing/encode-proposal.ts` - encodeSharePayload and buildShareUrl utilities
- `lib/sharing/decode-proposal.ts` - decodeSharePayload with isValidSharePayload guard
- `lib/sharing/export-utils.ts` - buildExportFilename slug builder and exportMapAsPng
- `lib/sharing/index.ts` - barrel re-exporting all sharing utilities
- `tests/sharing/encode-proposal.test.ts` - roundtrip, Unicode, and buildShareUrl tests
- `tests/sharing/decode-proposal.test.ts` - null-case and hash-prefix tests
- `tests/sharing/export-utils.test.ts` - all buildExportFilename edge cases
- `lib/proposal/proposal-state.ts` - added UpdateTitleAction, LoadDraftAction, union members, and reducer cases
- `lib/proposal/proposal-history.ts` - added "updateTitle" and "loadDraft" to HISTORY_ACTIONS

## Decisions Made

- `encodeURIComponent` wraps JSON before `btoa` to handle Unicode station names (Côte-des-Neiges) and emoji in titles safely — per RESEARCH.md pitfall 2
- `decodeSharePayload` validates `v === 1`, `draft` is an object, `lines` and `stations` are arrays; returns null for any validation failure or exception
- `buildExportFilename` adds `.replace(/-{2,}/g, "-")` step to collapse double-hyphens that arise when special chars between words are stripped (e.g. "Line & Station" → "line--station" without this step)
- `loadDraft` resets all chrome mutable state to prevent stale selection, inspector, or drawing session state when loading a foreign draft
- Both `updateTitle` and `loadDraft` added to `HISTORY_ACTIONS` — title changes are semantically meaningful and should be undoable; loadDraft represents a significant state transition

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed double-hyphen artifact in buildExportFilename slug**
- **Found during:** Task 1 (GREEN phase, first test run)
- **Issue:** "Line & Station!" produced "line--station.png" because stripping `&` left two adjacent hyphens
- **Fix:** Added `.replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "")` steps to collapse runs and trim edge hyphens
- **Files modified:** `lib/sharing/export-utils.ts`
- **Verification:** All 31 sharing tests pass including "strips special characters" case
- **Committed in:** `7fcd0cf` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required for slug correctness. No scope creep.

## Issues Encountered

None — implementation followed plan with one auto-fixed slug correctness bug.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `lib/sharing/` module is ready for Plans 02 and 03 to consume
- `SharePayload` type provides the typed contract for the share modal (Plan 02) and shared view mode (Plan 02)
- `encodeSharePayload` / `decodeSharePayload` are the serialization primitives for the URL hash link flow
- `exportMapAsPng` is ready to be wired to the share modal's Export button (requires `preserveDrawingBuffer: true` on the Map component — Plan 02 change)
- `updateTitle` action is ready for the inline title field in the toolbar (Plan 02)
- `loadDraft` action is ready for the edit-as-copy flow in shared view mode (Plan 02)

---
*Phase: 05-sharing-export-and-polish*
*Completed: 2026-04-01*
