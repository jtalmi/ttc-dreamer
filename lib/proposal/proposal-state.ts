import type {
  BaselineMode,
  EditorShellState,
  InterchangeSuggestion,
  ProposalDraft,
  ProposalLineDraft,
  ProposalStationDraft,
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

type PlaceStationAction = {
  type: "placeStation";
  payload: { id: string; position: [number, number]; lineId: string; name: string };
};

type SuggestInterchangeAction = {
  type: "suggestInterchange";
  payload: InterchangeSuggestion & { stationName: string };
};

type ConfirmInterchangeAction = {
  type: "confirmInterchange";
};

type RejectInterchangeAction = {
  type: "rejectInterchange";
};

type MoveStationAction = {
  type: "moveStation";
  payload: { stationId: string; position: [number, number] };
};

type MoveWaypointAction = {
  type: "moveWaypoint";
  payload: { lineId: string; waypointIndex: number; position: [number, number] };
};

type UpdateStationNameAction = {
  type: "updateStationName";
  payload: { stationId: string; name: string };
};

type SetSnapPositionAction = {
  type: "setSnapPosition";
  payload: [number, number] | null;
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
  | SetSelectedElementAction
  | PlaceStationAction
  | SuggestInterchangeAction
  | ConfirmInterchangeAction
  | RejectInterchangeAction
  | MoveStationAction
  | MoveWaypointAction
  | UpdateStationNameAction
  | SetSnapPositionAction;

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
      snapPosition: null,
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

    case "placeStation": {
      const newStation: ProposalStationDraft = {
        id: action.payload.id,
        name: action.payload.name,
        position: action.payload.position,
        lineIds: [action.payload.lineId],
      };
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
        l.id === action.payload.lineId
          ? { ...l, stationIds: [...l.stationIds, action.payload.id] }
          : l,
      );
      return {
        ...state,
        draft: {
          ...state.draft,
          stations: [...state.draft.stations, newStation],
          lines: updatedLines,
        },
      };
    }

    case "suggestInterchange":
      return {
        ...state,
        chrome: {
          ...state.chrome,
          pendingInterchangeSuggestion: action.payload,
        },
      };

    case "confirmInterchange": {
      const suggestion = state.chrome.pendingInterchangeSuggestion;
      if (!suggestion) return state;
      const newStationId = crypto.randomUUID();
      // Create the new station with optional TTC link
      const newStation: ProposalStationDraft = {
        id: newStationId,
        name: suggestion.stationName,
        position: suggestion.newStationPosition,
        lineIds: [suggestion.lineId],
        linkedBaselineStationId:
          // We'll store the nearbyStationId regardless of type — TTC IDs are strings
          // from ArcGIS OBJECTID, proposal IDs are UUIDs. The consumer can disambiguate.
          suggestion.nearbyStationId,
      };
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
        l.id === suggestion.lineId
          ? { ...l, stationIds: [...l.stationIds, newStationId] }
          : l,
      );
      return {
        ...state,
        draft: {
          ...state.draft,
          stations: [...state.draft.stations, newStation],
          lines: updatedLines,
        },
        chrome: {
          ...state.chrome,
          pendingInterchangeSuggestion: null,
        },
      };
    }

    case "rejectInterchange": {
      const suggestion = state.chrome.pendingInterchangeSuggestion;
      if (!suggestion) return state;
      const newStationId = crypto.randomUUID();
      // Create the station without any interchange link
      const newStation: ProposalStationDraft = {
        id: newStationId,
        name: suggestion.stationName,
        position: suggestion.newStationPosition,
        lineIds: [suggestion.lineId],
      };
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
        l.id === suggestion.lineId
          ? { ...l, stationIds: [...l.stationIds, newStationId] }
          : l,
      );
      return {
        ...state,
        draft: {
          ...state.draft,
          stations: [...state.draft.stations, newStation],
          lines: updatedLines,
        },
        chrome: {
          ...state.chrome,
          pendingInterchangeSuggestion: null,
        },
      };
    }

    case "moveStation": {
      const updatedStations = state.draft.stations.map((s) =>
        s.id === action.payload.stationId
          ? { ...s, position: action.payload.position }
          : s,
      );
      return {
        ...state,
        draft: { ...state.draft, stations: updatedStations },
      };
    }

    case "moveWaypoint": {
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) => {
        if (l.id !== action.payload.lineId) return l;
        const newWaypoints = [...l.waypoints];
        newWaypoints[action.payload.waypointIndex] = action.payload.position;
        return { ...l, waypoints: newWaypoints };
      });
      return {
        ...state,
        draft: { ...state.draft, lines: updatedLines },
      };
    }

    case "updateStationName": {
      const updatedStations = state.draft.stations.map((s) =>
        s.id === action.payload.stationId
          ? { ...s, name: action.payload.name }
          : s,
      );
      return {
        ...state,
        draft: { ...state.draft, stations: updatedStations },
      };
    }

    case "setSnapPosition":
      return {
        ...state,
        chrome: { ...state.chrome, snapPosition: action.payload },
      };

    default:
      return state;
  }
}
