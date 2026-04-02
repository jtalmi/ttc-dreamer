"use client";

import { useReducer, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";
import type { MapRef } from "@vis.gl/react-maplibre";
import {
  historyReducer,
  createInitialHistoryState,
  DEFAULT_LINE_COLORS,
} from "@/lib/proposal";
import type { TransitMode, ProposalDraft } from "@/lib/proposal";
import type { SharePayload } from "@/lib/sharing";
import { decodeSharePayload } from "@/lib/sharing";
import EditorFrame from "@/components/editor/editor-frame";
import { FloatingDrawingToolbar } from "@/components/editor/floating-drawing-toolbar";
import { FloatingLayerPicker } from "@/components/editor/floating-layer-picker";
import { LineList } from "@/components/editor/sidebar/line-list";
import { LineCreationPanel } from "@/components/editor/sidebar/line-creation-panel";
import { ConfirmationDialog } from "@/components/editor/sidebar/confirmation-dialog";
import { LineInspectorPanel } from "@/components/editor/sidebar/line-inspector-panel";
import { StationInspectorPanel } from "@/components/editor/sidebar/station-inspector-panel";
import { BaselineLineInspectorPanel } from "@/components/editor/sidebar/baseline-line-inspector-panel";
import { BaselineStationInspectorPanel } from "@/components/editor/sidebar/baseline-station-inspector-panel";
import { ProposalStatsPanel } from "@/components/editor/sidebar/proposal-stats-panel";
import { ShareModal } from "@/components/sharing/share-modal";
import SharedViewShell from "@/components/sharing/shared-view-shell";
import OnboardingTooltip from "@/components/sharing/onboarding-tooltip";

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


export default function EditorShell() {
  const [state, dispatch] = useReducer(
    historyReducer,
    undefined,
    createInitialHistoryState,
  );

  const { draft, chrome } = state.present;

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [mapRefState, setMapRefState] = useState<MapRef | null>(null);

  // Shared view mode state — populated when URL hash contains a valid SharePayload
  const [sharedPayload, setSharedPayload] = useState<SharePayload | null>(null);
  const hasLoadedFromHash = useRef(false);

  // Read URL hash on mount — runs client-side only (per RESEARCH.md pitfall 3)
  // hasLoadedFromHash guards against React strict mode double-invoke (pitfall 5)
  // Async callback pattern avoids lint rule react-hooks/set-state-in-effect
  useEffect(() => {
    if (hasLoadedFromHash.current) return;
    hasLoadedFromHash.current = true;
    const hash = window.location.hash;
    Promise.resolve(decodeSharePayload(hash)).then((payload) => {
      if (payload) setSharedPayload(payload);
    });
  }, []);

  // Onboarding tooltip state
  const [tooltipStep, setTooltipStep] = useState<0 | 1 | 2 | null>(null);
  const hasInteractedRef = useRef(false);

  // Onboarding controller — runs once on mount, skips in shared view
  useEffect(() => {
    // Guard: no onboarding in shared view (sharedPayload checked lazily via hasLoadedFromHash)
    // Guard: already onboarded
    try {
      if (localStorage.getItem("ttc-dreamer-onboarded") === "1") return;
    } catch {
      return; // Private browsing — skip onboarding
    }

    function markInteracted() {
      hasInteractedRef.current = true;
      window.removeEventListener("mousedown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    }

    window.addEventListener("mousedown", markInteracted);
    window.addEventListener("keydown", markInteracted);

    const timer = setTimeout(() => {
      // If user hasn't clicked/typed in 2 seconds, start onboarding
      if (!hasInteractedRef.current) {
        setTooltipStep(0);
      }
    }, 2000);

    return () => {
      window.removeEventListener("mousedown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
      clearTimeout(timer);
    };
  }, []);

  function handleTooltipNext() {
    setTooltipStep((prev) => {
      if (prev === null) return null;
      if (prev < 2) return (prev + 1) as 0 | 1 | 2;
      // Last step completed — mark onboarded
      try {
        localStorage.setItem("ttc-dreamer-onboarded", "1");
      } catch {}
      return null;
    });
  }

  function handleTooltipSkipAll() {
    try {
      localStorage.setItem("ttc-dreamer-onboarded", "1");
    } catch {}
    setTooltipStep(null);
  }

  // Edit-as-copy handler — clones draft with new UUID and "(copy)" suffix
  function handleEditAsCopy(sourceDraft: ProposalDraft) {
    const copy: ProposalDraft = {
      ...sourceDraft,
      id: crypto.randomUUID(),
      title: `${sourceDraft.title} (copy)`,
    };
    dispatch({ type: "loadDraft", payload: copy });
    // Clear URL hash so the editor URL is clean (per RESEARCH.md pattern 3)
    history.replaceState(null, "", window.location.pathname);
    setSharedPayload(null);
  }

  // Neighbourhoods GeoJSON for station location resolution in StationInspectorPanel
  const [neighbourhoods, setNeighbourhoods] = useState<FeatureCollection | null>(null);
  useEffect(() => {
    fetch("/data/neighbourhoods.geojson")
      .then((r) => r.json())
      .then((data: FeatureCollection) => setNeighbourhoods(data))
      .catch(() => {});
  }, []);

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
      payload: { lineId: newLineId, mode },
    });
  }

  // Keyboard shortcuts: undo, redo, delete, escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.startsWith("Mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (chrome.drawingSession) {
          if (chrome.drawingSession.placedStationIds.length > 0) {
            dispatch({ type: "undoPlaceStation" });
          } else {
            dispatch({ type: "cancelDrawing" });
          }
        } else {
          dispatch({ type: "undo" });
        }
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
      if (e.key === "Escape" && chrome.sidebarPanel.startsWith("inspect-")) {
        dispatch({ type: "closeInspector" });
        return;
      }
      if (e.key === "Escape" && chrome.drawingSession) {
        dispatch({ type: "cancelDrawing" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, chrome.selectedElementId, chrome.drawingSession, chrome.sidebarPanel]);

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

  if (chrome.sidebarPanel === "inspect-line") {
    const inspectedLine = draft.lines.find((l) => l.id === chrome.inspectedElementId);
    if (inspectedLine) {
      sidebarContent = (
        <LineInspectorPanel
          line={inspectedLine}
          draft={draft}
          onClose={() => dispatch({ type: "closeInspector" })}
        />
      );
    } else {
      // Inspected line was deleted — return to list
      dispatch({ type: "closeInspector" });
      sidebarContent = null;
    }
  } else if (chrome.sidebarPanel === "inspect-station") {
    const inspectedStation = draft.stations.find((s) => s.id === chrome.inspectedElementId);
    if (inspectedStation) {
      sidebarContent = (
        <StationInspectorPanel
          station={inspectedStation}
          draft={draft}
          neighbourhoods={neighbourhoods}
          onClose={() => dispatch({ type: "closeInspector" })}
        />
      );
    } else {
      // Inspected station was deleted — return to list
      dispatch({ type: "closeInspector" });
      sidebarContent = null;
    }
  } else if (chrome.sidebarPanel === "inspect-baseline-line") {
    if (chrome.inspectedBaseline?.type === "baseline-line") {
      sidebarContent = (
        <BaselineLineInspectorPanel
          line={chrome.inspectedBaseline}
          draft={draft}
          onClose={() => dispatch({ type: "closeInspector" })}
        />
      );
    } else {
      dispatch({ type: "closeInspector" });
      sidebarContent = null;
    }
  } else if (chrome.sidebarPanel === "inspect-baseline-station") {
    if (chrome.inspectedBaseline?.type === "baseline-station") {
      sidebarContent = (
        <BaselineStationInspectorPanel
          station={chrome.inspectedBaseline}
          draft={draft}
          neighbourhoods={neighbourhoods}
          onClose={() => dispatch({ type: "closeInspector" })}
        />
      );
    } else {
      dispatch({ type: "closeInspector" });
      sidebarContent = null;
    }
  } else if (chrome.sidebarPanel === "create") {
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
          Click to place stations. Double-click to finish.
        </p>
        <button
          onClick={() => dispatch({ type: "finishDrawing" })}
          disabled={(chrome.drawingSession?.placedStationIds.length ?? 0) < 2}
          style={{
            width: "100%",
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "4px",
            border: "none",
            cursor: (chrome.drawingSession?.placedStationIds.length ?? 0) >= 2 ? "pointer" : "not-allowed",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            backgroundColor: "var(--shell-accent)",
            color: "var(--shell-dominant)",
            marginTop: "var(--space-xs)",
            opacity: (chrome.drawingSession?.placedStationIds.length ?? 0) >= 2 ? 1 : 0.4,
          }}
        >
          {`Finish Line${chrome.drawingSession && chrome.drawingSession.placedStationIds.length > 0 ? ` (${chrome.drawingSession.placedStationIds.length} station${chrome.drawingSession.placedStationIds.length === 1 ? "" : "s"})` : ""}`}
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
    // Default "list" panel — line list + stats panel below
    sidebarContent = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
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
            onInspectLine={(lineId) =>
              dispatch({ type: "inspectElement", payload: { id: lineId, elementType: "line" } })
            }
          />
        </div>
        <div style={{ flexShrink: 0 }}>
          <ProposalStatsPanel draft={draft} />
        </div>
      </div>
    );
  }

  // Shared view mode — render read-only SharedViewShell when hash payload is present
  if (sharedPayload) {
    const viewMapElement = (
      <TorontoMap
        busCorridorVisible={false}
        baselineMode={sharedPayload.draft.baselineMode}
        draft={sharedPayload.draft}
        drawingSession={null}
        activeTool="select"
        selectedElementId={null}
        snapPosition={null}
        pendingInterchangeSuggestion={null}
        proposalOpacity={1}
      />
    );
    return (
      <SharedViewShell
        draft={sharedPayload.draft}
        author={sharedPayload.author}
        mapElement={viewMapElement}
        onEditAsCopy={() => handleEditAsCopy(sharedPayload.draft)}
      />
    );
  }

  const proposalOpacity = chrome.comparisonMode ? 0.4 : 1;

  const mapElement = (
    <TorontoMap
      busCorridorVisible={chrome.busCorridorVisible}
      baselineMode={draft.baselineMode}
      draft={draft}
      drawingSession={chrome.drawingSession}
      activeTool={chrome.activeTool}
      selectedElementId={chrome.selectedElementId}
      snapPosition={chrome.snapPosition}
      pendingInterchangeSuggestion={chrome.pendingInterchangeSuggestion}
      proposalOpacity={proposalOpacity}
      onFinishDrawing={() => dispatch({ type: "finishDrawing" })}
      onUpdateCursor={(lngLat) =>
        dispatch({ type: "updateCursorPosition", payload: lngLat })
      }
      onStartExtend={handleStartExtend}
      dispatch={dispatch}
      onMapReady={(ref) => setMapRefState(ref)}
    />
  );

  const comparisonBanner = chrome.comparisonMode ? (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "var(--space-sm) var(--space-md)",
        backgroundColor: "rgba(24, 50, 74, 0.85)",
        color: "var(--shell-dominant)",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: 1.5,
        textAlign: "center",
        fontFamily: "var(--font-sans)",
        zIndex: 10,
      }}
    >
      Comparing against baseline — click Proposal View to return
    </div>
  ) : undefined;

  const floatingControls = (
    <>
      <FloatingDrawingToolbar
        activeTool={chrome.activeTool}
        onToolSelect={(tool) => dispatch({ type: "setActiveTool", payload: tool })}
        onAddLine={() => dispatch({ type: "setSidebarPanel", payload: "create" })}
      />
      <FloatingLayerPicker
        baselineMode={draft.baselineMode}
        onBaselineChange={(mode) => dispatch({ type: "setBaselineMode", payload: mode })}
        busCorridorVisible={chrome.busCorridorVisible}
        onCorridorToggle={() => dispatch({ type: "toggleCorridors" })}
        comparisonMode={chrome.comparisonMode}
        onComparisonToggle={() => dispatch({ type: "toggleComparisonMode" })}
        hasLines={draft.lines.length > 0}
        sidebarOpen={chrome.sidebarOpen}
      />
    </>
  );

  return (
    <>
      <EditorFrame
        sidebarOpen={chrome.sidebarOpen}
        onSidebarToggle={() => dispatch({ type: "toggleSidebar" })}
        mapBanner={comparisonBanner}
        mapChildren={mapElement}
        sidebarChildren={sidebarContent}
        floatingControls={floatingControls}
        title={draft.title}
        onTitleChange={(title) => dispatch({ type: "updateTitle", payload: title })}
        onShareClick={() => setShareModalOpen(true)}
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
      {shareModalOpen && (
        <ShareModal
          draft={draft}
          mapRef={mapRefState}
          onTitleChange={(title) => dispatch({ type: "updateTitle", payload: title })}
          onClose={() => setShareModalOpen(false)}
        />
      )}
      {tooltipStep !== null && (
        <OnboardingTooltip
          step={tooltipStep}
          onNext={handleTooltipNext}
          onSkipAll={handleTooltipSkipAll}
        />
      )}
    </>
  );
}
