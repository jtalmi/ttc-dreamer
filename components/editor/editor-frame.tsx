"use client";

import { useState } from "react";
import TopToolbar from "@/components/editor/top-toolbar";
import MapStage from "@/components/editor/map-stage";
import SidebarShell from "@/components/editor/sidebar-shell";

type ToolName = "Select" | "Draw Line" | "Add Station" | "Inspect";
type BaselineMode = "today" | "future_committed";

type EditorFrameProps = Readonly<{
  /** Override active tool; pass undefined to let frame manage state internally */
  activeTool?: ToolName;
  /** Override baseline mode; pass undefined to let frame manage state internally */
  baseline?: BaselineMode;
  /** Override sidebar collapsed state */
  sidebarCollapsed?: boolean;
  /** Called when a tool button is clicked (used by parent-controlled mode) */
  onToolSelect?: (tool: ToolName) => void;
  /** Called when the baseline toggle changes (used by parent-controlled mode) */
  onBaselineChange?: (mode: BaselineMode) => void;
  /** Called when the sidebar toggle is clicked (used by parent-controlled mode) */
  onSidebarToggle?: () => void;
  /** Override bus corridor visibility; pass undefined to let frame manage state internally */
  busCorridorVisible?: boolean;
  /** Called when the corridor toggle is clicked (used by parent-controlled mode) */
  onCorridorToggle?: () => void;
  /** Slot for injecting map content (future phases) */
  mapChildren?: React.ReactNode;
  /** Slot for injecting sidebar content (future phases) */
  sidebarChildren?: React.ReactNode;
}>;

export default function EditorFrame({
  activeTool: controlledTool,
  baseline: controlledBaseline,
  sidebarCollapsed: controlledCollapsed,
  onToolSelect: controlledOnToolSelect,
  onBaselineChange: controlledOnBaselineChange,
  onSidebarToggle: controlledOnSidebarToggle,
  busCorridorVisible: controlledCorridorVisible,
  onCorridorToggle: controlledOnCorridorToggle,
  mapChildren,
  sidebarChildren,
}: EditorFrameProps) {
  // Internal state — only used when the corresponding prop is not controlled
  const [internalTool, setInternalTool] = useState<ToolName>("Select");
  const [internalBaseline, setInternalBaseline] =
    useState<BaselineMode>("today");
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalCorridorVisible, setInternalCorridorVisible] = useState(false);

  const activeTool = controlledTool ?? internalTool;
  const baseline = controlledBaseline ?? internalBaseline;
  const sidebarCollapsed = controlledCollapsed ?? internalCollapsed;
  const busCorridorVisible = controlledCorridorVisible ?? internalCorridorVisible;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Top toolbar — pinned across the full width */}
      <TopToolbar
        activeTool={activeTool}
        baseline={baseline}
        busCorridorVisible={busCorridorVisible}
        onToolSelect={(tool) => {
          if (controlledOnToolSelect) {
            controlledOnToolSelect(tool);
          } else if (!controlledTool) {
            setInternalTool(tool);
          }
        }}
        onBaselineChange={(mode) => {
          if (controlledOnBaselineChange) {
            controlledOnBaselineChange(mode);
          } else if (!controlledBaseline) {
            setInternalBaseline(mode);
          }
        }}
        onCorridorToggle={() => {
          if (controlledOnCorridorToggle) {
            controlledOnCorridorToggle();
          } else if (controlledCorridorVisible === undefined) {
            setInternalCorridorVisible((prev) => !prev);
          }
        }}
      />

      {/* Main content row: map + sidebar */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Map stage — dominant surface */}
        <MapStage>{mapChildren}</MapStage>

        {/* Right-hand collapsible sidebar scaffold */}
        <SidebarShell
          collapsed={sidebarCollapsed}
          onToggle={() => {
            if (controlledOnSidebarToggle) {
              controlledOnSidebarToggle();
            } else if (controlledCollapsed === undefined) {
              setInternalCollapsed((prev) => !prev);
            }
          }}
        >
          {sidebarChildren}
        </SidebarShell>
      </div>
    </div>
  );
}
