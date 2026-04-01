"use client";

import MapStage from "@/components/editor/map-stage";
import SidebarShell from "@/components/editor/sidebar-shell";

type EditorFrameProps = Readonly<{
  /** Override sidebar collapsed state */
  sidebarCollapsed?: boolean;
  /** Called when the sidebar toggle is clicked */
  onSidebarToggle?: () => void;
  /** Slot for injecting map content */
  mapChildren?: React.ReactNode;
  /** Slot for injecting sidebar content */
  sidebarChildren?: React.ReactNode;
  /** Optional banner to render at the bottom of the map canvas */
  mapBanner?: React.ReactNode;
  /** Slot for floating controls (toolbars, layer pickers) rendered over the map */
  floatingControls?: React.ReactNode;
}>;

export default function EditorFrame({
  sidebarCollapsed,
  onSidebarToggle,
  mapChildren,
  sidebarChildren,
  mapBanner,
  floatingControls,
}: EditorFrameProps) {
  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Map fills the entire viewport */}
      <MapStage banner={mapBanner}>{mapChildren}</MapStage>

      {/* Floating controls (toolbars, layer pickers) rendered over the map */}
      {floatingControls}

      {/* Right-hand collapsible sidebar — overlays map */}
      <SidebarShell
        collapsed={sidebarCollapsed}
        onToggle={onSidebarToggle}
      >
        {sidebarChildren}
      </SidebarShell>
    </div>
  );
}
