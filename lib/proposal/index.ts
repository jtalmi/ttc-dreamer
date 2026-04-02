// Re-exports for the proposal module consumed by the editor shell.

// Types and constants from proposal-types.ts
export type {
  BaselineFeatureSystem,
  BaselineInspection,
  BaselineLineInspection,
  BaselineStationInspection,
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
  deriveWaypointsFromStations,
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

// Stat computation functions and constants from proposal-stats.ts
export type { ProposalStats } from "./proposal-stats";
export {
  computeLineLength,
  computeTravelTime,
  computeAvgStopSpacing,
  computeLineCost,
  computeLineRidership,
  computeProposalStats,
  resolveNeighbourhood,
  SPEED_KMH,
  COST_PER_KM_M,
  RIDERSHIP_PER_STATION,
} from "./proposal-stats";
