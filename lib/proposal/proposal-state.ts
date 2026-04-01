import type {
  BaselineMode,
  EditorShellState,
  ProposalDraft,
  ProposalLineDraft,
  ToolMode,
  TransitMode,
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

type AddLineAction = {
  type: "addLine";
  payload: { id: string; name: string; mode: TransitMode; color: string };
};

type StartDrawingAction = {
  type: "startDrawing";
  payload: {
    lineId: string;
    mode: "new" | "extend" | "branch";
    initialWaypoint?: [number, number];
  };
};

type AddWaypointAction = {
  type: "addWaypoint";
  payload: [number, number];
};

type UpdateCursorPositionAction = {
  type: "updateCursorPosition";
  payload: [number, number] | null;
};

type FinishDrawingAction = {
  type: "finishDrawing";
};

type CancelDrawingAction = {
  type: "cancelDrawing";
};

type SetSidebarPanelAction = {
  type: "setSidebarPanel";
  payload: "list" | "create" | "drawing-status";
};

type SetSelectedElementAction = {
  type: "setSelectedElement";
  payload: string | null;
};

/** All action variants the editor shell reducer handles. */
export type EditorShellAction =
  | SetBaselineModeAction
  | ToggleSidebarAction
  | SetActiveToolAction
  | ResetShellStateAction
  | ToggleCorridorsAction
  | AddLineAction
  | StartDrawingAction
  | AddWaypointAction
  | UpdateCursorPositionAction
  | FinishDrawingAction
  | CancelDrawingAction
  | SetSidebarPanelAction
  | SetSelectedElementAction;

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
      drawingSession: null,
      pendingInterchangeSuggestion: null,
      selectedElementId: null,
      sidebarPanel: "list",
    },
  };
}

/** Reducer for the editor shell. Handles all editing actions. */
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
      // Switching away from draw-line cancels the active drawing session
      if (action.payload !== "draw-line" && state.chrome.drawingSession !== null) {
        const session = state.chrome.drawingSession;
        // If line has no committed waypoints, remove it
        const linesToKeep = state.draft.lines.filter(
          (l: ProposalLineDraft) =>
            l.id !== session.lineId || l.waypoints.length > 0,
        );
        return {
          ...state,
          draft: { ...state.draft, lines: linesToKeep },
          chrome: {
            ...state.chrome,
            activeTool: action.payload,
            drawingSession: null,
            pendingInterchangeSuggestion: null,
            sidebarPanel: "list",
          },
        };
      }
      return {
        ...state,
        chrome: {
          ...state.chrome,
          activeTool: action.payload,
          pendingInterchangeSuggestion: null,
        },
      };

    case "toggleCorridors":
      return {
        ...state,
        chrome: { ...state.chrome, busCorridorVisible: !state.chrome.busCorridorVisible },
      };

    case "resetShellState":
      return createInitialProposalDraft();

    case "addLine": {
      const newLine: ProposalLineDraft = {
        id: action.payload.id,
        name: action.payload.name,
        color: action.payload.color,
        mode: action.payload.mode,
        waypoints: [],
        stationIds: [],
      };
      return {
        ...state,
        draft: {
          ...state.draft,
          lines: [...state.draft.lines, newLine],
        },
      };
    }

    case "startDrawing":
      return {
        ...state,
        chrome: {
          ...state.chrome,
          activeTool: "draw-line",
          drawingSession: {
            lineId: action.payload.lineId,
            waypoints: action.payload.initialWaypoint
              ? [action.payload.initialWaypoint]
              : [],
            cursorPosition: null,
            mode: action.payload.mode,
          },
          sidebarPanel: "drawing-status",
        },
      };

    case "addWaypoint":
      if (!state.chrome.drawingSession) return state;
      return {
        ...state,
        chrome: {
          ...state.chrome,
          drawingSession: {
            ...state.chrome.drawingSession,
            waypoints: [...state.chrome.drawingSession.waypoints, action.payload],
          },
        },
      };

    case "updateCursorPosition":
      if (!state.chrome.drawingSession) return state;
      return {
        ...state,
        chrome: {
          ...state.chrome,
          drawingSession: {
            ...state.chrome.drawingSession,
            cursorPosition: action.payload,
          },
        },
      };

    case "finishDrawing": {
      if (!state.chrome.drawingSession) return state;
      const session = state.chrome.drawingSession;
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
        l.id === session.lineId
          ? { ...l, waypoints: session.waypoints }
          : l,
      );
      return {
        ...state,
        draft: { ...state.draft, lines: updatedLines },
        chrome: {
          ...state.chrome,
          activeTool: "select",
          drawingSession: null,
          sidebarPanel: "list",
        },
      };
    }

    case "cancelDrawing": {
      if (!state.chrome.drawingSession) return state;
      const session = state.chrome.drawingSession;
      // Remove the line if it has no committed waypoints
      const linesToKeep = state.draft.lines.filter(
        (l: ProposalLineDraft) =>
          l.id !== session.lineId || l.waypoints.length > 0,
      );
      return {
        ...state,
        draft: { ...state.draft, lines: linesToKeep },
        chrome: {
          ...state.chrome,
          activeTool: "select",
          drawingSession: null,
          sidebarPanel: "list",
        },
      };
    }

    case "setSidebarPanel":
      return {
        ...state,
        chrome: { ...state.chrome, sidebarPanel: action.payload },
      };

    case "setSelectedElement":
      return {
        ...state,
        chrome: { ...state.chrome, selectedElementId: action.payload },
      };

    default:
      return state;
  }
}
