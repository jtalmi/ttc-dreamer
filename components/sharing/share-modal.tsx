"use client";

import { useState, useEffect, useRef } from "react";
import type { MapRef } from "@vis.gl/react-maplibre";
import type { ProposalDraft } from "@/lib/proposal/proposal-types";
import { buildShareUrl, buildExportFilename, exportMapAsPng } from "@/lib/sharing";

type ShareModalProps = Readonly<{
  draft: ProposalDraft;
  mapRef: MapRef | null;
  onTitleChange: (title: string) => void;
  onClose: () => void;
}>;

export function ShareModal({ draft, mapRef, onTitleChange, onClose }: ShareModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [titleValue, setTitleValue] = useState(draft.title);

  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the modal container on mount for accessibility
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Dismiss on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleTitleChange(value: string) {
    const clamped = value.slice(0, 80);
    setTitleValue(clamped);
    onTitleChange(clamped.trim());
  }

  async function handleExport() {
    setExporting(true);
    try {
      const ref = { current: mapRef };
      await exportMapAsPng(ref, buildExportFilename(draft.title));
    } catch (err) {
      console.error("[ShareModal] Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  function handleCreateLink() {
    const url = buildShareUrl({
      v: 1,
      draft,
      author: authorName.trim() || undefined,
    });
    setShareUrl(url);
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1500);
    } catch (err) {
      console.error("[ShareModal] Clipboard write failed:", err);
    }
  }

  const hasLines = draft.lines.length > 0;
  const titleLength = titleValue.length;

  return (
    // Backdrop overlay — click outside to dismiss
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--share-modal-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      {/* Modal container — stop propagation so clicks inside don't dismiss */}
      <div
        ref={containerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "var(--shell-dominant)",
          borderRadius: "6px",
          overflow: "hidden",
          outline: "none",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "var(--shell-secondary)",
            color: "var(--shell-dominant)",
            padding: "0 var(--space-lg)",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 600, lineHeight: 1.25 }}>
            Share Your Proposal
          </span>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            style={{
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "var(--shell-dominant)",
              fontFamily: "var(--font-sans)",
            }}
          >
            &#xD7;
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "var(--space-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          {/* Map Title section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <label
              htmlFor="share-modal-title"
              style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.3, color: "var(--shell-secondary)" }}
            >
              Map Title
            </label>
            <input
              id="share-modal-title"
              type="text"
              value={titleValue}
              onChange={(e) => handleTitleChange(e.target.value)}
              maxLength={80}
              style={{
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
                color: "var(--shell-secondary)",
                backgroundColor: "var(--shell-dominant)",
                border: "1px solid rgba(24, 50, 74, 0.3)",
                borderRadius: "4px",
                padding: "var(--space-sm) var(--space-md)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            {titleLength >= 60 && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--shell-secondary)",
                  opacity: 0.6,
                  alignSelf: "flex-end",
                }}
              >
                {titleLength}/80
              </span>
            )}
          </div>

          {/* Your Name section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <label
              htmlFor="share-modal-author"
              style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.3, color: "var(--shell-secondary)" }}
            >
              Your name (optional)
            </label>
            <input
              id="share-modal-author"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              style={{
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
                color: "var(--shell-secondary)",
                backgroundColor: "var(--shell-dominant)",
                border: "1px solid rgba(24, 50, 74, 0.3)",
                borderRadius: "4px",
                padding: "var(--space-sm) var(--space-md)",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Divider */}
          <hr style={{ border: "none", borderTop: "1px solid rgba(24, 50, 74, 0.12)", margin: 0 }} />

          {/* Export Image section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.3, color: "var(--shell-secondary)" }}>
              Export Image
            </span>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                width: "100%",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "4px",
                border: "none",
                cursor: exporting ? "default" : "pointer",
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: 1.3,
                fontFamily: "var(--font-sans)",
                backgroundColor: "var(--shell-secondary)",
                color: "var(--shell-dominant)",
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? "Exporting..." : "Export PNG"}
            </button>
          </div>

          {/* Divider */}
          <hr style={{ border: "none", borderTop: "1px solid rgba(24, 50, 74, 0.12)", margin: 0 }} />

          {/* Share Link section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.3, color: "var(--shell-secondary)" }}>
              Share Link
            </span>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.5,
                color: "var(--shell-secondary)",
                opacity: 0.7,
                margin: 0,
              }}
            >
              Creates an unlisted link. Anyone with it can view your proposal.
            </p>

            {!hasLines && (
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: "var(--shell-secondary)",
                  opacity: 0.6,
                  margin: 0,
                }}
              >
                Add at least one line before sharing.
              </p>
            )}

            {shareUrl === null ? (
              <button
                onClick={hasLines ? handleCreateLink : undefined}
                style={{
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "4px",
                  border: "none",
                  cursor: hasLines ? "pointer" : "default",
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  fontFamily: "var(--font-sans)",
                  backgroundColor: "var(--shell-secondary)",
                  color: "var(--shell-dominant)",
                  opacity: hasLines ? 1 : 0.4,
                  pointerEvents: hasLines ? "auto" : "none",
                }}
              >
                Create Link
              </button>
            ) : (
              <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: 1.3,
                    fontFamily: "monospace",
                    color: "var(--shell-secondary)",
                    backgroundColor: "rgba(24, 50, 74, 0.06)",
                    border: "1px solid rgba(24, 50, 74, 0.2)",
                    borderRadius: "4px",
                    padding: "var(--space-sm) var(--space-sm)",
                    outline: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: "var(--space-sm) var(--space-md)",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    fontFamily: "var(--font-sans)",
                    backgroundColor: copyFeedback
                      ? "var(--copy-feedback-bg)"
                      : "var(--shell-accent)",
                    color: "var(--shell-dominant)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    minWidth: "44px",
                    minHeight: "44px",
                  }}
                >
                  {copyFeedback ? "Copied!" : "Copy Link"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
