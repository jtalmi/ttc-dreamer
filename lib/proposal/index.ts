// Re-exports for the proposal module consumed by the editor shell.
export type {
  BaselineMode,
  EditorChromeState,
  EditorShellState,
  ProposalDraft,
  ProposalLineDraft,
  ProposalStationDraft,
  ToolMode,
} from "./proposal-types";

export type { EditorShellAction } from "./proposal-state";
export {
  createInitialProposalDraft,
  proposalEditorReducer,
} from "./proposal-state";
