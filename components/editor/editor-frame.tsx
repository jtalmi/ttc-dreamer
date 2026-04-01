"use client";

import MapStage from "@/components/editor/map-stage";
import SidebarShell from "@/components/editor/sidebar-shell";

type EditorFrameProps = Readonly<{
  /** Whether the sidebar is open */
  sidebarOpen?: boolean;
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
  /** Current proposal title for sidebar header */
  title?: string;
  /** Called when the user commits a title change */
  onTitleChange?: (title: string) => void;
  /** Called when the Share button is clicked */
  onShareClick?: () => void;
}>;

export default function EditorFrame({
  sidebarOpen = true,
  onSidebarToggle,
  mapChildren,
  sidebarChildren,
  mapBanner,
  floatingControls,
  title,
  onTitleChange,
  onShareClick,
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

      {/* Floating controls rendered over the map */}
      {floatingControls}

      {/* Right-hand overlay sidebar */}
      <SidebarShell
        open={sidebarOpen}
        onToggle={onSidebarToggle ?? (() => {})}
        title={title}
        onTitleChange={onTitleChange}
        onShareClick={onShareClick}
      >
        {sidebarChildren}
      </SidebarShell>
    </div>
  );
}
