// Proposal and editor shell type contracts for Phase 1.
// Serializable, ASCII-only, and free of real Toronto data payloads.

/** Which baseline the proposal builds on top of. */
export type BaselineMode = "today" | "future_committed";

/** Active editing tool in the toolbar. */
export type ToolMode = "select" | "draw-line" | "add-station" | "inspect";

/** A single proposed transit line in the draft. */
export type ProposalLineDraft = {
  id: string;
  name: string;
  color: string;
  stationIds: string[];
};

/** A single proposed station in the draft. */
export type ProposalStationDraft = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

/** The full proposal draft edited in the sandbox. */
export type ProposalDraft = {
  id: string;
  title: string;
  baselineMode: BaselineMode;
  lines: ProposalLineDraft[];
  stations: ProposalStationDraft[];
};

/** UI-only state for the editor chrome (toolbar, sidebar). */
export type EditorChromeState = {
  activeTool: ToolMode;
  sidebarOpen: boolean;
  busCorridorVisible: boolean;
};

/** Combined state held by the editor shell reducer. */
export type EditorShellState = {
  draft: ProposalDraft;
  chrome: EditorChromeState;
};
