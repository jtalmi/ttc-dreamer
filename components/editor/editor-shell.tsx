"use client";

import { useReducer } from "react";
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
      dispatch={dispatch}
    />
  );

  return (
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
  );
}
