// Proposal and editor shell type contracts for Phase 1 + Phase 3.
// Serializable, ASCII-only, and free of real Toronto data payloads.

/** Which baseline the proposal builds on top of. */
export type BaselineMode = "today" | "future_committed";

/** Active editing tool in the toolbar. */
export type ToolMode = "select" | "draw-line" | "add-station";

/** Transit mode for a proposed line. */
export type TransitMode = "subway" | "lrt" | "brt";

/** Default palette colors for new proposal lines — rotated sequentially. */
export const DEFAULT_LINE_COLORS: string[] = [
  "#7B61FF",
  "#E91E8C",
  "#00B4D8",
  "#FF9800",
  "#4CAF50",
];

/** Extended swatch colors for the color picker (12 total with DEFAULT_LINE_COLORS). */
export const EXTENDED_SWATCH_COLORS: string[] = [
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#F43F5E",
];

/** State for an in-progress line drawing session. */
export type DrawingSession = {
  lineId: string;
  /** IDs of stations placed so far in this session, in order. */
  placedStationIds: string[];
  cursorPosition: [number, number] | null;
  mode: "new" | "extend" | "branch";
};

/** Suggestion to link a newly placed station with an existing TTC station as an interchange. */
export type InterchangeSuggestion = {
  newStationPosition: [number, number];
  nearbyStationId: string;
  nearbyStationName: string;
  lineId: string;
};

/** A single proposed transit line in the draft. */
export type ProposalLineDraft = {
  id: string;
  name: string;
  color: string;
  mode: TransitMode;
  /** Source-of-truth geometry as [lng, lat] coordinate pairs. */
  waypoints: [number, number][];
  /** IDs of stations on this line. */
  stationIds: string[];
  /** If this line extends or branches from an existing TTC line, the parent line ID. */
  parentLineId?: string;
  /** The branch point coordinate if this is a branch. */
  branchPoint?: [number, number];
  /** True if this line is an extension of a TTC line endpoint. */
  isExtension?: boolean;
};

/** A single proposed station in the draft. */
export type ProposalStationDraft = {
  id: string;
  name: string;
  /** [lng, lat] coordinate pair (GeoJSON order). */
  position: [number, number];
  /** Line IDs this station belongs to. */
  lineIds: string[];
  /** If this station is linked to an existing TTC baseline station as an interchange. */
  linkedBaselineStationId?: string;
};

/** The full proposal draft edited in the sandbox. */
export type ProposalDraft = {
  id: string;
  title: string;
  baselineMode: BaselineMode;
  lines: ProposalLineDraft[];
  stations: ProposalStationDraft[];
};

/** Pending deletion state waiting for user confirmation. */
export type PendingDeletion = {
  type: "line" | "station";
  id: string;
  name: string;
  /** True if this station is shared across multiple lines. */
  isShared?: boolean;
  /** Number of lines sharing this station (only set when isShared is true). */
  sharedLineCount?: number;
};

/** UI-only state for the editor chrome (toolbar, sidebar). */
export type EditorChromeState = {
  activeTool: ToolMode;
  sidebarOpen: boolean;
  busCorridorVisible: boolean;
  /** Active drawing session when in draw-line mode. */
  drawingSession: DrawingSession | null;
  /** Pending interchange suggestion waiting for user confirmation. */
  pendingInterchangeSuggestion: (InterchangeSuggestion & { stationName: string }) | null;
  /** Currently selected element ID (line or station). */
  selectedElementId: string | null;
  /** Which panel the sidebar is showing. */
  sidebarPanel: "list" | "create" | "drawing-status" | "inspect-line" | "inspect-station";
  /** Current snap target position for rendering the snap cue ring. */
  snapPosition: [number, number] | null;
  /** Pending deletion waiting for user confirmation via dialog. */
  pendingDeletion: PendingDeletion | null;
  /** ID of the currently inspected line or station (inspect tool). */
  inspectedElementId: string | null;
  /** True when comparison (Before / Baseline View) mode is active. */
  comparisonMode: boolean;
};

/** Combined state held by the editor shell reducer. */
export type EditorShellState = {
  draft: ProposalDraft;
  chrome: EditorChromeState;
};
