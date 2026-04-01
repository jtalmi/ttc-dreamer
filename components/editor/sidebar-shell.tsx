"use client";

const EXPANDED_WIDTH = 320;
const COLLAPSED_WIDTH = 64;

type SidebarShellProps = Readonly<{
  collapsed?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}>;

export default function SidebarShell({
  collapsed = false,
  onToggle,
  children,
}: SidebarShellProps) {
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <aside
      aria-label="Editor sidebar"
      style={{
        width: `${width}px`,
        flexShrink: 0,
        backgroundColor: "var(--shell-secondary)",
        color: "var(--shell-dominant)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.2s ease",
        position: "relative",
      }}
    >
      {/* Toggle rail */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "48px",
          border: "none",
          borderBottom: "1px solid rgba(243, 238, 229, 0.1)",
          background: "transparent",
          cursor: "pointer",
          color: "var(--shell-dominant)",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          flexShrink: 0,
        }}
      >
        {collapsed ? "›" : "‹ Panel"}
      </button>

      {/* Sidebar content area */}
      {!collapsed && (
        <div
          style={{
            flex: 1,
            padding: "var(--space-lg)",
            overflowY: "auto",
          }}
        >
          {children ?? (
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.5,
                opacity: 0.5,
              }}
            >
              Inspector and proposal details will appear here in later phases.
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
