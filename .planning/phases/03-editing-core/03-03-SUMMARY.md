---
phase: 03-editing-core
plan: 03
subsystem: ui
tags: [react, typescript, nextjs, maplibre, undo-redo, confirmation-dialog]

# Dependency graph
requires:
  - phase: 03-01
    provides: history reducer (historyReducer, HISTORY_ACTIONS), proposal state, line drawing loop
  - phase: 03-02
    provides: station placement, snapping, interchange badge, select-move

provides:
  - Undo/redo via Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z keyboard shortcuts
  - Delete selected proposal element with Backspace/Delete key
  - ConfirmationDialog component for destructive actions (line delete, station delete, clear all)
  - Inline line name editing in sidebar (click to edit, Enter/blur to save, Escape to cancel)
  - Line color picker via swatch popover in sidebar (12 swatches, 28x28px)
  - Per-row delete affordance in LineList (x button, visible on hover)
  - PendingDeletion chrome state type for dialog trigger flow
  - deleteLine, deleteStation, deleteSelected, confirmDeletion, cancelDeletion, updateLineName, updateLineColor, clearProposal reducer actions
  - clearProposal and confirmDeletion added to HISTORY_ACTIONS

affects:
  - phase-04
  - phase-05

# Tech tracking
tech-stack:
  added: []
  patterns:
    - pendingDeletion chrome state pattern — delete key sets pending state, dialog dispatches confirmDeletion
    - Keyboard handler in useEffect with dependency on chrome.selectedElementId and chrome.drawingSession
    - Inline edit pattern: editingLineId/editingName local state in LineList, blur/Enter commits, Escape reverts
    - Color picker as inline popover below line row (no external library)

key-files:
  created:
    - components/editor/sidebar/confirmation-dialog.tsx
  modified:
    - lib/proposal/proposal-types.ts
    - lib/proposal/proposal-state.ts
    - lib/proposal/proposal-history.ts
    - lib/proposal/index.ts
    - components/editor/sidebar/line-list.tsx
    - components/editor/editor-shell.tsx

key-decisions:
  - "confirmDeletion is in HISTORY_ACTIONS (not deleteSelected) so undo captures the actual draft mutation, not the dialog trigger"
  - "deleteSelected sets pendingDeletion in chrome state rather than directly mutating draft — preserves the confirmation dialog gate"
  - "Baseline TTC elements silently ignored on Delete key (not found in draft.lines or draft.stations) — no error shown"
  - "ConfirmationDialog captures Escape key in capture phase (addEventListener with true) to prevent editor-shell Escape handler from also firing"

patterns-established:
  - "Pending state pattern: UI-only chrome state gates destructive actions behind confirmation; confirmDeletion is the HISTORY_ACTIONS entry point"
  - "Inline editing pattern: local editingLineId + editingName state, ref.focus() on effect, blur/Enter commits, Escape reverts"

requirements-completed:
  - EDIT-12
  - STYLE-01
  - STYLE-02
  - STYLE-03

# Metrics
duration: 24min
completed: 2026-04-01
---

# Phase 03 Plan 03: Undo/Redo, Delete with Confirmation, and Inline Line Naming/Coloring Summary

**Completed the editing core loop: keyboard undo/redo (Cmd/Ctrl+Z), Delete key with confirmation dialog (UI-SPEC copy), and inline line name/color editing in the sidebar**

## Performance

- **Duration:** 24 min
- **Started:** 2026-04-01T05:16:32Z
- **Completed:** 2026-04-01T05:40:42Z
- **Tasks:** 1 (Task 2 is checkpoint:human-verify, treated as autonomous per orchestrator)
- **Files modified:** 7

## Accomplishments

- Added undo/redo keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z) via useEffect keydown listener in EditorShell
- Created ConfirmationDialog component with destructive styling, backdrop/Escape cancel, exact UI-SPEC copy for all four scenarios
- Introduced PendingDeletion chrome state: deleteSelected sets it, confirmDeletion acts on it (ensuring dialog-gated deletes)
- Added inline name editing to LineList (click name text, input appears, Enter/blur commits, Escape reverts)
- Added swatch color picker popover to LineList (12 colors, 28x28px circles, active outline ring)
- Added per-row delete affordance (x button, hover-revealed, dispatches deleteSelected via onDeleteLine callback)
- Added clearProposal and confirmDeletion to HISTORY_ACTIONS so confirmed deletes are undoable

## Task Commits

Each task was committed atomically:

1. **Task 1: Add delete actions, inline naming/coloring in sidebar, and undo/redo keyboard handler** - `41948f5` (feat)

**Plan metadata:** (final docs commit follows)

## Files Created/Modified

- `lib/proposal/proposal-types.ts` - Added PendingDeletion type; added pendingDeletion field to EditorChromeState
- `lib/proposal/proposal-state.ts` - Added 8 new actions: deleteLine, deleteStation, deleteSelected, confirmDeletion, cancelDeletion, updateLineName, updateLineColor, clearProposal; added pendingDeletion: null to initial state
- `lib/proposal/proposal-history.ts` - Added clearProposal and confirmDeletion to HISTORY_ACTIONS set
- `lib/proposal/index.ts` - Exported PendingDeletion type
- `components/editor/sidebar/confirmation-dialog.tsx` - New: reusable destructive confirmation modal with backdrop, Escape key, min 44px button targets
- `components/editor/sidebar/line-list.tsx` - Added inline name editing, swatch color picker popover, per-row delete button, selectedLineId prop, onUpdateName/onUpdateColor/onDeleteLine/onSelectLine callbacks
- `components/editor/editor-shell.tsx` - Added keyboard useEffect, buildConfirmationProps helper, ConfirmationDialog rendering, updated LineList with all new props

## Decisions Made

- `confirmDeletion` (not `deleteSelected`) is the HISTORY_ACTIONS entry point — deleteSelected only sets chrome.pendingDeletion, confirmDeletion mutates the draft. This ensures undo captures the real deletion, not the dialog-open event.
- Inline deleteLine/deleteStation logic duplicated inside confirmDeletion case rather than calling sub-reducers — avoids recursive dispatch pattern and keeps the reducer flat.
- ConfirmationDialog attaches its Escape listener in capture phase (`addEventListener(key, fn, true)`) to prevent bubbling conflicts with the EditorShell Escape handler for cancelDrawing.
- Baseline TTC elements silently ignored on Delete: if selectedElementId is not found in draft.lines or draft.stations, the deleteSelected action returns state unchanged with no error message.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None — all new functionality is wired to real proposal state.

## Next Phase Readiness

- Phase 3 editing core is complete: create lines, draw routes, place stations, name/color, undo/redo, delete with confirmation
- All 16 Phase 3 requirements are implemented (EDIT-01 through EDIT-12, STYLE-01 through STYLE-04)
- Phase 4 can build on the established proposal state and history reducer patterns
- No blockers

## Self-Check: PASSED

- FOUND: components/editor/sidebar/confirmation-dialog.tsx
- FOUND: components/editor/sidebar/line-list.tsx
- FOUND: lib/proposal/proposal-types.ts
- FOUND: .planning/phases/03-editing-core/03-03-SUMMARY.md
- FOUND commit: 41948f5

---
*Phase: 03-editing-core*
*Completed: 2026-04-01*
