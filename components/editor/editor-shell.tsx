"use client";

import { useReducer, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  historyReducer,
  createInitialHistoryState,
  DEFAULT_LINE_COLORS,
} from "@/lib/proposal";
import type { TransitMode } from "@/lib/proposal";
import EditorFrame from "@/components/editor/editor-frame";
import { LineList } from "@/components/editor/sidebar/line-list";
import { LineCreationPanel } from "@/components/editor/sidebar/line-creation-panel";
import { ConfirmationDialog } from "@/components/editor/sidebar/confirmation-dialog";

// Dynamically import TorontoMap with ssr: false to guard against
// window-is-undefined errors from maplibre-gl during server rendering.
const TorontoMap = dynamic(() => import("@/components/editor/toronto-map"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--shell-secondary)",
        fontSize: "16px",
      }}
    >
      Loading Toronto map...
    </div>
  ),
});

// Map reducer ToolMode to the display names expected by EditorFrame's TopToolbar
const TOOL_DISPLAY: Record<string, "Select" | "Draw Line" | "Add Station" | "Inspect"> = {
  "select": "Select",
  "draw-line": "Draw Line",
  "add-station": "Add Station",
  "inspect": "Inspect",
};

// Map EditorFrame ToolName back to reducer ToolMode
const TOOL_MODE: Record<string, "select" | "draw-line" | "add-station" | "inspect"> = {
  "Select": "select",
  "Draw Line": "draw-line",
  "Add Station": "add-station",
  "Inspect": "inspect",
};

export default function EditorShell() {
  const [state, dispatch] = useReducer(
    historyReducer,
    undefined,
    createInitialHistoryState,
  );

  const { draft, chrome } = state.present;

  // Determine the next default color based on how many lines exist
  const nextDefaultColor = DEFAULT_LINE_COLORS[draft.lines.length % DEFAULT_LINE_COLORS.length];

  // Handle creating a new line and immediately starting drawing
  function handleStartDrawing(config: { name: string; mode: TransitMode; color: string }) {
    const newLineId = crypto.randomUUID();
    dispatch({ type: "addLine", payload: { id: newLineId, ...config } });
    dispatch({ type: "startDrawing", payload: { lineId: newLineId, mode: "new" } });
  }

  // Handle starting an extend or branch from a TTC line click
  function handleStartExtend(
    ttcLineId: string,
    mode: "extend" | "branch",
    initialWaypoint: [number, number],
  ) {
    const newLineId = crypto.randomUUID();
    const nextColor = DEFAULT_LINE_COLORS[draft.lines.length % DEFAULT_LINE_COLORS.length];
    const lineName = mode === "extend" ? "Extension" : "Branch";
    dispatch({
      type: "addLine",
      payload: {
        id: newLineId,
        name: lineName,
        mode: "subway" as const,
        color: nextColor,
        parentLineId: ttcLineId,
        isExtension: mode === "extend",
        branchPoint: mode === "branch" ? initialWaypoint : undefined,
      },
    });
    dispatch({
      type: "startDrawing",
      payload: { lineId: newLineId, mode, initialWaypoint },
    });
  }

  // Keyboard shortcuts: undo, redo, delete, escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.startsWith("Mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "undo" });
        return;
      }
      if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "redo" });
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && chrome.selectedElementId) {
        e.preventDefault();
        dispatch({ type: "deleteSelected" });
        return;
      }
      if (e.key === "Escape" && chrome.drawingSession) {
        dispatch({ type: "cancelDrawing" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, chrome.selectedElementId, chrome.drawingSession]);

  // Build confirmation dialog message from pendingDeletion
  function buildConfirmationProps() {
    const pending = chrome.pendingDeletion;
    if (!pending) return null;

    if (pending.type === "line") {
      return {
        message: `Delete "${pending.name}" and all its stations? This cannot be undone.`,
        confirmLabel: "Delete Line",
        cancelLabel: "Keep Line",
      };
    }
    // Station
    if (pending.isShared && pending.sharedLineCount) {
      return {
        message: `"${pending.name}" is shared by ${pending.sharedLineCount} lines. Removing it will also remove all interchange links. This cannot be undone.`,
        confirmLabel: "Delete Station",
        cancelLabel: "Keep Station",
      };
    }
    return {
      message: `Remove "${pending.name}"? This cannot be undone.`,
      confirmLabel: "Delete Station",
      cancelLabel: "Keep Station",
    };
  }

  const confirmationProps = buildConfirmationProps();

  // Determine selectedLineId for LineList
  const selectedLineId = chrome.selectedElementId &&
    draft.lines.some((l) => l.id === chrome.selectedElementId)
    ? chrome.selectedElementId
    : null;

  // Render sidebar content based on current panel state
  let sidebarContent: React.ReactNode;

  if (chrome.sidebarPanel === "create") {
    sidebarContent = (
      <LineCreationPanel
        lineCount={draft.lines.length}
        nextDefaultColor={nextDefaultColor}
        onStartDrawing={handleStartDrawing}
        onCancel={() => dispatch({ type: "setSidebarPanel", payload: "list" })}
      />
    );
  } else if (chrome.sidebarPanel === "drawing-status") {
    const drawingLine = draft.lines.find(
      (l) => l.id === chrome.drawingSession?.lineId,
    );
    sidebarContent = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            lineHeight: 1.3,
            margin: 0,
            color: "var(--shell-dominant)",
          }}
        >
          {drawingLine?.name ?? "Drawing..."}
        </p>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.5,
            margin: 0,
            opacity: 0.6,
            color: "var(--shell-dominant)",
          }}
        >
          Click to place waypoints. Double-click to finish.
        </p>
        <button
          onClick={() => dispatch({ type: "finishDrawing" })}
          style={{
            width: "100%",
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            backgroundColor: "var(--shell-accent)",
            color: "var(--shell-dominant)",
            marginTop: "var(--space-xs)",
          }}
        >
          Finish Line
        </button>
        <button
          onClick={() => dispatch({ type: "cancelDrawing" })}
          style={{
            width: "100%",
            padding: "var(--space-xs)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.5,
            fontFamily: "var(--font-sans)",
            color: "var(--shell-dominant)",
            opacity: 0.5,
            textDecoration: "underline",
          }}
        >
          Cancel
        </button>
      </div>
    );
  } else {
    // Default "list" panel
    sidebarContent = (
      <LineList
        lines={draft.lines}
        onAddLine={() => dispatch({ type: "setSidebarPanel", payload: "create" })}
        activeDrawingLineId={chrome.drawingSession?.lineId ?? null}
        selectedLineId={selectedLineId}
        onUpdateName={(lineId, name) =>
          dispatch({ type: "updateLineName", payload: { lineId, name } })
        }
        onUpdateColor={(lineId, color) =>
          dispatch({ type: "updateLineColor", payload: { lineId, color } })
        }
        onSelectLine={(lineId) =>
          dispatch({ type: "setSelectedElement", payload: lineId })
        }
        onDeleteLine={(lineId) => {
          dispatch({ type: "setSelectedElement", payload: lineId });
          dispatch({ type: "deleteSelected" });
        }}
      />
    );
  }

  const mapElement = (
    <TorontoMap
      busCorridorVisible={chrome.busCorridorVisible}
      draft={draft}
      drawingSession={chrome.drawingSession}
      activeTool={chrome.activeTool}
      selectedElementId={chrome.selectedElementId}
      snapPosition={chrome.snapPosition}
      pendingInterchangeSuggestion={chrome.pendingInterchangeSuggestion}
      onAddWaypoint={(lngLat) =>
        dispatch({ type: "addWaypoint", payload: lngLat })
      }
      onFinishDrawing={() => dispatch({ type: "finishDrawing" })}
      onUpdateCursor={(lngLat) =>
        dispatch({ type: "updateCursorPosition", payload: lngLat })
      }
      onStartExtend={handleStartExtend}
      dispatch={dispatch}
    />
  );

  return (
    <>
      <EditorFrame
        activeTool={TOOL_DISPLAY[chrome.activeTool]}
        baseline={draft.baselineMode}
        sidebarCollapsed={!chrome.sidebarOpen}
        onToolSelect={(tool) =>
          dispatch({ type: "setActiveTool", payload: TOOL_MODE[tool] })
        }
        onBaselineChange={(mode) =>
          dispatch({ type: "setBaselineMode", payload: mode })
        }
        onSidebarToggle={() => dispatch({ type: "toggleSidebar" })}
        busCorridorVisible={chrome.busCorridorVisible}
        onCorridorToggle={() => dispatch({ type: "toggleCorridors" })}
        onAddLine={() => dispatch({ type: "setSidebarPanel", payload: "create" })}
        mapChildren={mapElement}
        sidebarChildren={sidebarContent}
      />
      {confirmationProps && (
        <ConfirmationDialog
          message={confirmationProps.message}
          confirmLabel={confirmationProps.confirmLabel}
          cancelLabel={confirmationProps.cancelLabel}
          onConfirm={() => dispatch({ type: "confirmDeletion" })}
          onCancel={() => dispatch({ type: "cancelDeletion" })}
        />
      )}
    </>
  );
}
