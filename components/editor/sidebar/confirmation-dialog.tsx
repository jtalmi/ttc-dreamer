"use client";

import { useEffect } from "react";

type ConfirmationDialogProps = Readonly<{
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}>;

/**
 * Reusable modal overlay for destructive confirmations.
 * Follows the UI-SPEC Copywriting Contract: destructive confirm on the right,
 * safe-exit cancel on the left. Backdrop click or Escape key calls onCancel.
 */
export function ConfirmationDialog({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onCancel]);

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Dialog panel — stop propagation so clicks inside don't close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--shell-secondary)",
          borderRadius: "6px",
          padding: "var(--space-lg)",
          maxWidth: "400px",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
        }}
      >
        {/* Message */}
        <p
          style={{
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: 1.5,
            color: "var(--shell-dominant)",
            margin: 0,
          }}
        >
          {message}
        </p>

        {/* Actions: cancel on left, destructive confirm on right */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              minWidth: "44px",
              minHeight: "44px",
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "4px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              color: "var(--shell-dominant)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              minWidth: "44px",
              minHeight: "44px",
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              backgroundColor: "var(--shell-destructive)",
              color: "#FFFFFF",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
