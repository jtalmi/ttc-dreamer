"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    heading: "Draw your first line",
    body: "Click to start drawing a new transit line on the map.",
    anchor: "Draw Line",
  },
  {
    heading: "Place stations",
    body: "Click on any line to add a station along the route.",
    anchor: "Add Station",
  },
  {
    heading: "Share your proposal",
    body: "Export an image or create a link to share your map.",
    anchor: "Share",
  },
] as const;

type OnboardingTooltipProps = Readonly<{
  step: 0 | 1 | 2;
  onNext: () => void;
  onSkipAll: () => void;
}>;

type TooltipPosition = {
  top: number;
  left: number;
  arrowLeft: number;
};

/**
 * Sequential onboarding tooltip anchored below a target toolbar button.
 * Uses fixed positioning derived from getBoundingClientRect on the anchor element.
 * Dismissible via "Got it" (advance) or "Skip all" (dismiss all).
 */
export default function OnboardingTooltip({
  step,
  onNext,
  onSkipAll,
}: OnboardingTooltipProps) {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const currentStep = STEPS[step];

  // Dismiss on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onSkipAll();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSkipAll]);

  // Position the tooltip by finding the anchor button
  useEffect(() => {
    const TOOLTIP_WIDTH = 240;
    const GAP = 8; // gap between button bottom and tooltip top

    function findAnchorButton(): Element | null {
      const anchorText = currentStep.anchor;

      // Search all header buttons for the matching text content
      const headerButtons = document.querySelectorAll("header button");
      for (const btn of headerButtons) {
        if (btn.textContent?.trim() === anchorText) {
          return btn;
        }
      }

      // Fallback: also search nav buttons specifically
      const navButtons = document.querySelectorAll("header nav button");
      for (const btn of navButtons) {
        if (btn.textContent?.trim() === anchorText) {
          return btn;
        }
      }

      return null;
    }

    function computePosition() {
      const anchor = findAnchorButton();
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const anchorCenterX = rect.left + rect.width / 2;

      // Position tooltip so it's centered on the anchor button
      let tooltipLeft = anchorCenterX - TOOLTIP_WIDTH / 2;
      // Clamp to viewport
      tooltipLeft = Math.max(8, Math.min(tooltipLeft, window.innerWidth - TOOLTIP_WIDTH - 8));

      // Arrow should point at the anchor center
      const arrowLeft = anchorCenterX - tooltipLeft - 6; // 6 = half arrow width

      setPosition({
        top: rect.bottom + GAP,
        left: tooltipLeft,
        arrowLeft: Math.max(8, Math.min(arrowLeft, TOOLTIP_WIDTH - 20)),
      });
    }

    // Compute immediately, then again after a short delay to handle any layout shifts
    computePosition();
    const timer = setTimeout(computePosition, 100);

    return () => clearTimeout(timer);
  }, [step, currentStep.anchor]);

  if (!position) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      role="dialog"
      aria-label={`Onboarding tip: ${currentStep.heading}`}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "240px",
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      {/* Arrow/caret pointing up */}
      <div
        style={{
          position: "absolute",
          top: "-6px",
          left: `${position.arrowLeft}px`,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "6px solid var(--onboarding-tooltip-bg)",
        }}
      />

      {/* Tooltip box */}
      <div
        style={{
          backgroundColor: "var(--onboarding-tooltip-bg)",
          border: "1px solid var(--onboarding-tooltip-border)",
          borderRadius: "4px",
          padding: "var(--space-sm) var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        {/* Heading */}
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            color: "var(--shell-dominant)",
          }}
        >
          {currentStep.heading}
        </p>

        {/* Body */}
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.5,
            fontFamily: "var(--font-sans)",
            color: "var(--shell-dominant)",
            opacity: 0.8,
          }}
        >
          {currentStep.body}
        </p>

        {/* Actions row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            marginTop: "var(--space-xs)",
          }}
        >
          {/* Got it button */}
          <button
            onClick={onNext}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              color: "var(--shell-accent)",
              minHeight: "44px",
              minWidth: "44px",
            }}
          >
            Got it
          </button>

          {/* Skip all link */}
          <button
            onClick={onSkipAll}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              color: "var(--shell-dominant)",
              opacity: 0.7,
              textDecoration: "underline",
              minHeight: "44px",
            }}
          >
            Skip all
          </button>
        </div>
      </div>
    </div>
  );
}
