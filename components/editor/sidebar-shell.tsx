"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SidebarShellProps = Readonly<{
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  title?: string;
  onTitleChange?: (title: string) => void;
  onShareClick?: () => void;
}>;

export default function SidebarShell({
  open,
  onToggle,
  children,
  title = "Untitled Proposal",
  onTitleChange,
  onShareClick,
}: SidebarShellProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(title);

  function startEditing() {
    setTitleInput(title);
    setEditingTitle(true);
  }

  function commitTitle() {
    const trimmed = titleInput.trim().slice(0, 80);
    onTitleChange?.(trimmed || "Untitled Proposal");
    setEditingTitle(false);
  }

  function cancelEditing() {
    setEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      commitTitle();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }

  return (
    <>
      {/* Sidebar toggle chevron — floats at right map edge */}
      <button
        onClick={onToggle}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
        style={{
          position: "absolute",
          top: "50%",
          right: open ? "320px" : "0",
          transform: "translateY(-50%)",
          zIndex: "var(--z-sidebar-toggle)",
          width: "32px",
          height: "32px",
          borderRadius: "6px 0 0 6px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--shell-secondary)",
          color: "var(--shell-dominant)",
          transition: "right 0.2s ease",
          flexShrink: 0,
        }}
      >
        {open ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar overlay panel */}
      <aside
        aria-label="Editor sidebar"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "320px",
          zIndex: "var(--z-sidebar)",
          background: "var(--shell-secondary)",
          color: "var(--shell-dominant)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(320px)",
          transition: "transform 0.2s ease",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Sidebar header — title + share */}
        <div
          style={{
            height: "52px",
            flexShrink: 0,
            background: "rgba(243, 238, 229, 0.06)",
            borderBottom: "1px solid var(--inspector-divider)",
            display: "flex",
            alignItems: "center",
            padding: "0 var(--space-md)",
            gap: "var(--space-sm)",
          }}
        >
          {editingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              maxLength={80}
              autoFocus
              style={{
                flex: 1,
                maxWidth: "180px",
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: 1.2,
                fontFamily: "var(--font-sans)",
                color: "var(--shell-dominant)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid var(--shell-dominant)",
                outline: "none",
                padding: "0 2px",
              }}
            />
          ) : (
            <span
              onClick={startEditing}
              title={title}
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: 1.2,
                fontFamily: "var(--font-sans)",
                color: "var(--shell-dominant)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "180px",
              }}
            >
              {title}
            </span>
          )}

          {/* Spacer */}
          <div style={{ marginLeft: "auto" }} />

          {/* Share button */}
          <button
            onClick={() => onShareClick?.()}
            style={{
              padding: "var(--space-xs) var(--space-md)",
              background: "var(--shell-accent)",
              color: "var(--shell-dominant)",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              flexShrink: 0,
            }}
          >
            Share
          </button>
        </div>

        {/* Sidebar content area */}
        <div
          style={{
            flex: 1,
            padding: "var(--space-lg)",
            overflowY: "auto",
          }}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
