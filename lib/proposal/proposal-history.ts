// History wrapper for undo/redo around the proposal editor reducer.
// Maintains past/present/future arrays to support non-destructive editing.

import type { ProposalDraft, EditorShellState } from "./proposal-types";
import type { EditorShellAction } from "./proposal-state";
import { proposalEditorReducer, createInitialProposalDraft } from "./proposal-state";

/** State shape for the history reducer. */
export type HistoryState = {
  past: ProposalDraft[];
  present: EditorShellState;
  future: ProposalDraft[];
};

/** Actions handled by the history reducer (superset of EditorShellAction). */
export type HistoryAction = { type: "undo" } | { type: "redo" } | EditorShellAction;

/** Maximum number of undo steps to retain. */
const MAX_HISTORY = 50;

/**
 * Actions that mutate the draft in a meaningful way and should push to history.
 * Chrome-only actions and transient drawing state do NOT push to history.
 */
const HISTORY_ACTIONS = new Set<string>([
  "addLine",
  "finishDrawing",
  "placeStation",
  "deleteStation",
  "deleteLine",
  "linkInterchange",
  "updateLineName",
  "updateLineColor",
  "updateStationName",
  "moveStation",
  "moveWaypoint",
]);

/**
 * History-aware reducer wrapping proposalEditorReducer.
 * Undo/redo only swap out the draft portion of present; chrome state is preserved.
 */
export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  if (action.type === "undo") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    return {
      past: newPast,
      present: { ...state.present, draft: previous },
      future: [state.present.draft, ...state.future],
    };
  }

  if (action.type === "redo") {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      past: [...state.past, state.present.draft].slice(-MAX_HISTORY),
      present: { ...state.present, draft: next },
      future: newFuture,
    };
  }

  // Delegate to the core reducer
  const nextPresent = proposalEditorReducer(state.present, action);

  // Only push to history for draft-mutating actions
  if (HISTORY_ACTIONS.has(action.type)) {
    return {
      past: [...state.past, state.present.draft].slice(-MAX_HISTORY),
      present: nextPresent,
      future: [],
    };
  }

  return {
    ...state,
    present: nextPresent,
  };
}

/** Creates the initial history state wrapping the default proposal draft. */
export function createInitialHistoryState(): HistoryState {
  return {
    past: [],
    present: createInitialProposalDraft(),
    future: [],
  };
}
