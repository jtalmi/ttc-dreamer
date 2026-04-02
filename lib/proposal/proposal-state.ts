import type {
  BaselineMode,
  EditorShellState,
  InterchangeSuggestion,
  PendingDeletion,
  ProposalDraft,
  ProposalLineDraft,
  ProposalStationDraft,
  ToolMode,
  TransitMode,
} from "./proposal-types";
import { deriveWaypointsFromStations } from "./proposal-geometry";

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
  payload: {
    id: string;
    name: string;
    mode: TransitMode;
    color: string;
    parentLineId?: string;
    branchPoint?: [number, number];
    isExtension?: boolean;
  };
};

type StartDrawingAction = {
  type: "startDrawing";
  payload: {
    lineId: string;
    mode: "new" | "extend" | "branch";
    /** Optional ID of the terminus station being extended from (extend/branch modes). */
    initialStationId?: string;
  };
};

type UndoPlaceStationAction = {
  type: "undoPlaceStation";
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
  payload: {
    id: string;
    position: [number, number];
    lineId: string;
    name: string;
    /**
     * When provided, the station ID is spliced into line.stationIds at this index
     * instead of appended. Used for mid-line station insertion (add-station tool).
     */
    insertAtIndex?: number;
    /**
     * When provided, auto-sets the baseline link on the new station instead of
     * showing a confirmation prompt. Used for auto-interchange with TTC stations.
     */
    linkedBaselineStationId?: string;
    /**
     * When provided, merges the current line into the existing proposal station
     * instead of creating a new station. The existing station's ID is added to the
     * line's stationIds and the lineId is added to the existing station's lineIds.
     * No new station is created.
     */
    mergeWithStationId?: string;
  };
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

type DeleteLineAction = {
  type: "deleteLine";
  payload: { lineId: string };
};

type DeleteStationAction = {
  type: "deleteStation";
  payload: { stationId: string };
};

type DeleteSelectedAction = {
  type: "deleteSelected";
};

type ConfirmDeletionAction = {
  type: "confirmDeletion";
};

type CancelDeletionAction = {
  type: "cancelDeletion";
};

type UpdateLineNameAction = {
  type: "updateLineName";
  payload: { lineId: string; name: string };
};

type UpdateLineColorAction = {
  type: "updateLineColor";
  payload: { lineId: string; color: string };
};

type ClearProposalAction = {
  type: "clearProposal";
};

type InspectElementAction = {
  type: "inspectElement";
  payload: { id: string; elementType: "line" | "station" };
};

type CloseInspectorAction = {
  type: "closeInspector";
};

type ToggleComparisonModeAction = {
  type: "toggleComparisonMode";
};

type UpdateTitleAction = {
  type: "updateTitle";
  /** New title, trimmed and clamped to 80 chars by the caller. Reducer also clamps defensively. */
  payload: string;
};

type LoadDraftAction = {
  type: "loadDraft";
  /** Replaces the entire draft and resets chrome to a clean state. */
  payload: ProposalDraft;
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
  | UndoPlaceStationAction
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
  | SetSnapPositionAction
  | DeleteLineAction
  | DeleteStationAction
  | DeleteSelectedAction
  | ConfirmDeletionAction
  | CancelDeletionAction
  | UpdateLineNameAction
  | UpdateLineColorAction
  | ClearProposalAction
  | InspectElementAction
  | CloseInspectorAction
  | ToggleComparisonModeAction
  | UpdateTitleAction
  | LoadDraftAction;

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
      pendingDeletion: null,
      inspectedElementId: null,
      comparisonMode: false,
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
      // Switching away from draw-line: auto-finish if 2+ stations, cancel if <2
      if (action.payload !== "draw-line" && state.chrome.drawingSession !== null) {
        const session = state.chrome.drawingSession;
        const derivedWaypoints = deriveWaypointsFromStations(
          session.placedStationIds,
          state.draft.stations,
        );
        // Auto-finish: 2+ stations means a valid line — commit it
        if (derivedWaypoints.length >= 2) {
          const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
            l.id === session.lineId
              ? { ...l, waypoints: derivedWaypoints }
              : l,
          );
          return {
            ...state,
            draft: { ...state.draft, lines: updatedLines },
            chrome: {
              ...state.chrome,
              activeTool: action.payload,
              drawingSession: null,
              pendingInterchangeSuggestion: null,
              sidebarPanel: "list",
            },
          };
        }
        // Cancel: <2 stations — remove session stations and the empty line
        const sessionStationIds = new Set(session.placedStationIds);
        const stationsToKeep = state.draft.stations.filter(
          (s) => !sessionStationIds.has(s.id),
        );
        const linesWithStationsRemoved = state.draft.lines.map((l: ProposalLineDraft) => ({
          ...l,
          stationIds: l.stationIds.filter((id) => !sessionStationIds.has(id)),
        }));
        const linesToKeep = linesWithStationsRemoved.filter(
          (l: ProposalLineDraft) =>
            l.id !== session.lineId || l.waypoints.length > 0,
        );
        return {
          ...state,
          draft: { ...state.draft, lines: linesToKeep, stations: stationsToKeep },
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
        ...(action.payload.parentLineId !== undefined && { parentLineId: action.payload.parentLineId }),
        ...(action.payload.isExtension !== undefined && { isExtension: action.payload.isExtension }),
        ...(action.payload.branchPoint !== undefined && { branchPoint: action.payload.branchPoint }),
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
            placedStationIds: action.payload.initialStationId
              ? [action.payload.initialStationId]
              : [],
            cursorPosition: null,
            mode: action.payload.mode,
          },
          sidebarPanel: "drawing-status",
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

    case "undoPlaceStation": {
      if (!state.chrome.drawingSession) return state;
      const session = state.chrome.drawingSession;
      if (session.placedStationIds.length === 0) return state;
      // Remove the last placed station ID
      const lastStationId = session.placedStationIds[session.placedStationIds.length - 1];
      const newPlacedIds = session.placedStationIds.slice(0, -1);
      // Remove the station from draft.stations
      const stationsWithoutLast = state.draft.stations.filter(
        (s) => s.id !== lastStationId,
      );
      // Remove the station ID from the line's stationIds
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
        l.id === session.lineId
          ? { ...l, stationIds: l.stationIds.filter((id) => id !== lastStationId) }
          : l,
      );
      return {
        ...state,
        draft: {
          ...state.draft,
          stations: stationsWithoutLast,
          lines: updatedLines,
        },
        chrome: {
          ...state.chrome,
          drawingSession: {
            ...session,
            placedStationIds: newPlacedIds,
          },
        },
      };
    }

    case "finishDrawing": {
      if (!state.chrome.drawingSession) return state;
      const session = state.chrome.drawingSession;
      const derivedWaypoints = deriveWaypointsFromStations(
        session.placedStationIds,
        state.draft.stations,
      );
      // Require 2+ stations for a valid line; otherwise remove the line
      if (derivedWaypoints.length < 2) {
        const linesToKeep = state.draft.lines.filter(
          (l: ProposalLineDraft) => l.id !== session.lineId,
        );
        // Also remove stations that were placed only during this session
        const sessionStationIds = new Set(session.placedStationIds);
        const stationsToKeep = state.draft.stations.filter(
          (s) => !sessionStationIds.has(s.id),
        );
        return {
          ...state,
          draft: { ...state.draft, lines: linesToKeep, stations: stationsToKeep },
          chrome: {
            ...state.chrome,
            activeTool: "select",
            drawingSession: null,
            sidebarPanel: "list",
          },
        };
      }
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
        l.id === session.lineId
          ? { ...l, waypoints: derivedWaypoints }
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
      // Remove all stations placed during this session
      const sessionStationIds = new Set(session.placedStationIds);
      const stationsToKeep = state.draft.stations.filter(
        (s) => !sessionStationIds.has(s.id),
      );
      // Remove those station IDs from any line's stationIds
      const linesWithStationsRemoved = state.draft.lines.map((l: ProposalLineDraft) => ({
        ...l,
        stationIds: l.stationIds.filter((id) => !sessionStationIds.has(id)),
      }));
      // Remove the line if it has no committed waypoints
      const linesToKeep = linesWithStationsRemoved.filter(
        (l: ProposalLineDraft) =>
          l.id !== session.lineId || l.waypoints.length > 0,
      );
      return {
        ...state,
        draft: { ...state.draft, lines: linesToKeep, stations: stationsToKeep },
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
      const session = state.chrome.drawingSession;

      // Auto-interchange: merge with existing proposal station (no new station created)
      if (action.payload.mergeWithStationId) {
        const existingStation = state.draft.stations.find(
          (s) => s.id === action.payload.mergeWithStationId,
        );
        if (existingStation) {
          const updatedStations = state.draft.stations.map((s) =>
            s.id === existingStation.id
              ? { ...s, lineIds: [...s.lineIds, action.payload.lineId] }
              : s,
          );
          const updatedLines = state.draft.lines.map((l: ProposalLineDraft) => {
            if (l.id !== action.payload.lineId) return l;
            if (action.payload.insertAtIndex !== undefined) {
              const newStationIds = [...l.stationIds];
              newStationIds.splice(action.payload.insertAtIndex + 1, 0, existingStation.id);
              return { ...l, stationIds: newStationIds };
            }
            return { ...l, stationIds: [...l.stationIds, existingStation.id] };
          });
          const updatedSession =
            session && session.lineId === action.payload.lineId
              ? { ...session, placedStationIds: [...session.placedStationIds, existingStation.id] }
              : session;
          return {
            ...state,
            draft: { ...state.draft, stations: updatedStations, lines: updatedLines },
            chrome: { ...state.chrome, drawingSession: updatedSession },
          };
        }
      }

      // Normal placement (with optional linkedBaselineStationId)
      const newStation: ProposalStationDraft = {
        id: action.payload.id,
        name: action.payload.name,
        position: action.payload.position,
        lineIds: [action.payload.lineId],
        ...(action.payload.linkedBaselineStationId !== undefined && {
          linkedBaselineStationId: action.payload.linkedBaselineStationId,
        }),
      };
      const updatedLines = state.draft.lines.map((l: ProposalLineDraft) => {
        if (l.id !== action.payload.lineId) return l;
        if (action.payload.insertAtIndex !== undefined) {
          const newStationIds = [...l.stationIds];
          newStationIds.splice(action.payload.insertAtIndex + 1, 0, action.payload.id);
          return { ...l, stationIds: newStationIds };
        }
        return { ...l, stationIds: [...l.stationIds, action.payload.id] };
      });
      // If a drawing session is active for this line, add the station ID to placedStationIds
      const updatedSession =
        session && session.lineId === action.payload.lineId
          ? { ...session, placedStationIds: [...session.placedStationIds, action.payload.id] }
          : session;
      return {
        ...state,
        draft: {
          ...state.draft,
          stations: [...state.draft.stations, newStation],
          lines: updatedLines,
        },
        chrome: {
          ...state.chrome,
          drawingSession: updatedSession,
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

      // Check if the nearby station is an existing proposal station (UUID match in draft)
      const existingProposalStation = state.draft.stations.find(
        (s) => s.id === suggestion.nearbyStationId,
      );

      if (existingProposalStation) {
        // Merge path: add suggestion.lineId to the existing station's lineIds
        // and add the existing station's id to the new line's stationIds
        const updatedStations = state.draft.stations.map((s) =>
          s.id === existingProposalStation.id
            ? { ...s, lineIds: [...s.lineIds, suggestion.lineId] }
            : s,
        );
        const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
          l.id === suggestion.lineId
            ? { ...l, stationIds: [...l.stationIds, existingProposalStation.id] }
            : l,
        );
        return {
          ...state,
          draft: {
            ...state.draft,
            stations: updatedStations,
            lines: updatedLines,
          },
          chrome: {
            ...state.chrome,
            pendingInterchangeSuggestion: null,
          },
        };
      }

      // TTC baseline station path: check if a proposal station already links to this baseline station.
      // If so, reuse it (merge the new line) rather than creating a duplicate.
      const existingLinkedStation = state.draft.stations.find(
        (s) => s.linkedBaselineStationId === suggestion.nearbyStationId,
      );

      if (existingLinkedStation) {
        // Reuse path: add suggestion.lineId to the existing linked station's lineIds
        const updatedStations = state.draft.stations.map((s) =>
          s.id === existingLinkedStation.id
            ? { ...s, lineIds: [...s.lineIds, suggestion.lineId] }
            : s,
        );
        const updatedLines = state.draft.lines.map((l: ProposalLineDraft) =>
          l.id === suggestion.lineId
            ? { ...l, stationIds: [...l.stationIds, existingLinkedStation.id] }
            : l,
        );
        return {
          ...state,
          draft: {
            ...state.draft,
            stations: updatedStations,
            lines: updatedLines,
          },
          chrome: {
            ...state.chrome,
            pendingInterchangeSuggestion: null,
          },
        };
      }

      // No existing linked station — create a new proposal station with the baseline link
      const newStationId = crypto.randomUUID();
      const newStation: ProposalStationDraft = {
        id: newStationId,
        name: suggestion.stationName,
        position: suggestion.newStationPosition,
        lineIds: [suggestion.lineId],
        linkedBaselineStationId: suggestion.nearbyStationId,
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
      // Re-derive waypoints for all lines containing this station
      const updatedLines = state.draft.lines.map((l) => {
        if (!l.stationIds.includes(action.payload.stationId)) return l;
        return {
          ...l,
          waypoints: deriveWaypointsFromStations(l.stationIds, updatedStations),
        };
      });
      return {
        ...state,
        draft: { ...state.draft, stations: updatedStations, lines: updatedLines },
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

    case "deleteLine": {
      const { lineId } = action.payload;
      // Remove stations that only belong to this line
      const updatedStations = state.draft.stations
        .filter((s) => !(s.lineIds.length === 1 && s.lineIds[0] === lineId))
        .map((s) => ({
          ...s,
          lineIds: s.lineIds.filter((id) => id !== lineId),
        }));
      const updatedLines = state.draft.lines.filter((l) => l.id !== lineId);
      const newSelectedId =
        state.chrome.selectedElementId === lineId
          ? null
          : state.chrome.selectedElementId;
      return {
        ...state,
        draft: { ...state.draft, lines: updatedLines, stations: updatedStations },
        chrome: {
          ...state.chrome,
          selectedElementId: newSelectedId,
          pendingDeletion: null,
        },
      };
    }

    case "deleteStation": {
      const { stationId } = action.payload;
      const updatedStations = state.draft.stations.filter((s) => s.id !== stationId);
      const updatedLines = state.draft.lines.map((l) => ({
        ...l,
        stationIds: l.stationIds.filter((id) => id !== stationId),
      }));
      const newSelectedId =
        state.chrome.selectedElementId === stationId
          ? null
          : state.chrome.selectedElementId;
      return {
        ...state,
        draft: { ...state.draft, stations: updatedStations, lines: updatedLines },
        chrome: {
          ...state.chrome,
          selectedElementId: newSelectedId,
          pendingDeletion: null,
        },
      };
    }

    case "deleteSelected": {
      const selectedId = state.chrome.selectedElementId;
      if (!selectedId) return state;

      // Check if it's a proposal line
      const matchedLine = state.draft.lines.find((l) => l.id === selectedId);
      if (matchedLine) {
        const pendingDeletion: PendingDeletion = {
          type: "line",
          id: matchedLine.id,
          name: matchedLine.name,
        };
        return {
          ...state,
          chrome: { ...state.chrome, pendingDeletion },
        };
      }

      // Check if it's a proposal station
      const matchedStation = state.draft.stations.find((s) => s.id === selectedId);
      if (matchedStation) {
        const isShared = matchedStation.lineIds.length > 1;
        const pendingDeletion: PendingDeletion = {
          type: "station",
          id: matchedStation.id,
          name: matchedStation.name,
          isShared,
          sharedLineCount: isShared ? matchedStation.lineIds.length : undefined,
        };
        return {
          ...state,
          chrome: { ...state.chrome, pendingDeletion },
        };
      }

      // Not a proposal element (baseline TTC) — do nothing silently
      return state;
    }

    case "confirmDeletion": {
      const pending = state.chrome.pendingDeletion;
      if (!pending) return state;
      if (pending.type === "line") {
        // Inline the deleteLine logic directly to avoid recursive dispatch
        const lineId = pending.id;
        const updatedStations = state.draft.stations
          .filter((s) => !(s.lineIds.length === 1 && s.lineIds[0] === lineId))
          .map((s) => ({
            ...s,
            lineIds: s.lineIds.filter((id) => id !== lineId),
          }));
        const updatedLines = state.draft.lines.filter((l) => l.id !== lineId);
        const newSelectedId =
          state.chrome.selectedElementId === lineId ? null : state.chrome.selectedElementId;
        return {
          ...state,
          draft: { ...state.draft, lines: updatedLines, stations: updatedStations },
          chrome: {
            ...state.chrome,
            selectedElementId: newSelectedId,
            pendingDeletion: null,
          },
        };
      } else {
        // station deletion
        const stationId = pending.id;
        const updatedStations = state.draft.stations.filter((s) => s.id !== stationId);
        const updatedLines = state.draft.lines.map((l) => ({
          ...l,
          stationIds: l.stationIds.filter((id) => id !== stationId),
        }));
        const newSelectedId =
          state.chrome.selectedElementId === stationId ? null : state.chrome.selectedElementId;
        return {
          ...state,
          draft: { ...state.draft, stations: updatedStations, lines: updatedLines },
          chrome: {
            ...state.chrome,
            selectedElementId: newSelectedId,
            pendingDeletion: null,
          },
        };
      }
    }

    case "cancelDeletion":
      return {
        ...state,
        chrome: { ...state.chrome, pendingDeletion: null },
      };

    case "updateLineName": {
      const updatedLines = state.draft.lines.map((l) =>
        l.id === action.payload.lineId ? { ...l, name: action.payload.name } : l,
      );
      return {
        ...state,
        draft: { ...state.draft, lines: updatedLines },
      };
    }

    case "updateLineColor": {
      const updatedLines = state.draft.lines.map((l) =>
        l.id === action.payload.lineId ? { ...l, color: action.payload.color } : l,
      );
      return {
        ...state,
        draft: { ...state.draft, lines: updatedLines },
      };
    }

    case "clearProposal":
      return {
        ...state,
        draft: { ...state.draft, lines: [], stations: [] },
        chrome: {
          ...state.chrome,
          selectedElementId: null,
          pendingDeletion: null,
          drawingSession: null,
          sidebarPanel: "list",
          snapPosition: null,
          pendingInterchangeSuggestion: null,
        },
      };

    case "inspectElement":
      return {
        ...state,
        chrome: {
          ...state.chrome,
          inspectedElementId: action.payload.id,
          sidebarPanel: action.payload.elementType === "line" ? "inspect-line" : "inspect-station",
          sidebarOpen: true,
        },
      };

    case "closeInspector":
      return {
        ...state,
        chrome: {
          ...state.chrome,
          inspectedElementId: null,
          sidebarPanel: "list",
        },
      };

    case "toggleComparisonMode":
      return {
        ...state,
        chrome: {
          ...state.chrome,
          comparisonMode: !state.chrome.comparisonMode,
        },
      };

    case "updateTitle": {
      const clamped = action.payload.trim().slice(0, 80);
      return {
        ...state,
        draft: { ...state.draft, title: clamped || "Untitled Proposal" },
      };
    }

    case "loadDraft":
      return {
        ...state,
        draft: action.payload,
        chrome: {
          ...state.chrome,
          selectedElementId: null,
          inspectedElementId: null,
          sidebarPanel: "list",
          drawingSession: null,
          pendingDeletion: null,
          pendingInterchangeSuggestion: null,
          snapPosition: null,
          comparisonMode: false,
        },
      };

    default:
      return state;
  }
}
