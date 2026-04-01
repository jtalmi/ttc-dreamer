import type {
  BaselineMode,
  EditorShellState,
  ProposalDraft,
  ToolMode,
} from "./proposal-types";

// Action type discriminants for the editor shell reducer.
type SetBaselineModeAction = {
  type: "setBaselineMode";
  payload: BaselineMode;
};

type ToggleSidebarAction = {
  type: "toggleSidebar";
};

type SetActiveToolAction = {
  type: "setActiveTool";
  payload: ToolMode;
};

type ResetShellStateAction = {
  type: "resetShellState";
};

type ToggleCorridorsAction = {
  type: "toggleCorridors";
};

/** All action variants the editor shell reducer handles in Phase 1. */
export type EditorShellAction =
  | SetBaselineModeAction
  | ToggleSidebarAction
  | SetActiveToolAction
  | ResetShellStateAction
  | ToggleCorridorsAction;

/** Returns the default draft for the Toronto sandbox shell. */
export function createInitialProposalDraft(): EditorShellState {
  const draft: ProposalDraft = {
    id: "draft-toronto-sandbox",
    title: "My Toronto Proposal",
    baselineMode: "today",
    lines: [],
    stations: [],
  };

  return {
    draft,
    chrome: {
      activeTool: "select",
      sidebarOpen: true,
      busCorridorVisible: false,
    },
  };
}

/** Reducer for the editor shell. Handles UI-only shell actions in Phase 1. */
export function proposalEditorReducer(
  state: EditorShellState,
  action: EditorShellAction,
): EditorShellState {
  switch (action.type) {
    case "setBaselineMode":
      return {
        ...state,
        draft: { ...state.draft, baselineMode: action.payload },
      };

    case "toggleSidebar":
      return {
        ...state,
        chrome: { ...state.chrome, sidebarOpen: !state.chrome.sidebarOpen },
      };

    case "setActiveTool":
      return {
        ...state,
        chrome: { ...state.chrome, activeTool: action.payload },
      };

    case "toggleCorridors":
      return {
        ...state,
        chrome: { ...state.chrome, busCorridorVisible: !state.chrome.busCorridorVisible },
      };

    case "resetShellState":
      return createInitialProposalDraft();

    default:
      return state;
  }
}
