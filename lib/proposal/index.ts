// Re-exports for the proposal module consumed by the editor shell.

// Types and constants from proposal-types.ts
export type {
  BaselineMode,
  DrawingSession,
  EditorChromeState,
  EditorShellState,
  InterchangeSuggestion,
  PendingDeletion,
  ProposalDraft,
  ProposalLineDraft,
  ProposalStationDraft,
  ToolMode,
  TransitMode,
} from "./proposal-types";

export {
  DEFAULT_LINE_COLORS,
  EXTENDED_SWATCH_COLORS,
} from "./proposal-types";

// Actions and functions from proposal-state.ts
export type { EditorShellAction } from "./proposal-state";
export {
  createInitialProposalDraft,
  proposalEditorReducer,
} from "./proposal-state";

// Geometry helpers from proposal-geometry.ts
export type { SnapResult } from "./proposal-geometry";
export {
  buildProposalLinesGeoJSON,
  buildProposalStationsGeoJSON,
  buildInProgressGeoJSON,
  findSnapTarget,
  detectLineHitType,
  dist2D,
  snapToSegment,
  findNearbyStation,
  buildSnapCueGeoJSON,
} from "./proposal-geometry";

// History wrapper from proposal-history.ts
export type { HistoryState, HistoryAction } from "./proposal-history";
export {
  historyReducer,
  createInitialHistoryState,
} from "./proposal-history";
