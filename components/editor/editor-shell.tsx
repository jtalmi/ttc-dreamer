"use client";

import { useReducer } from "react";
import {
  createInitialProposalDraft,
  proposalEditorReducer,
} from "@/lib/proposal";
import EditorFrame from "@/components/editor/editor-frame";

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
    proposalEditorReducer,
    undefined,
    createInitialProposalDraft,
  );

  const { draft, chrome } = state;

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
    />
  );
}
