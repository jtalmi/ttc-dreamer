"use client";

import { useEffect } from "react";
import { Popup } from "react-map-gl/maplibre";

/** Auto-dismiss delay in milliseconds per UI-SPEC. */
const AUTO_DISMISS_DELAY_MS = 8000;

type InterchangeBadgeProps = Readonly<{
  /** [lng, lat] position near the candidate interchange location. */
  position: [number, number];
  /** Name of the existing nearby station. */
  nearbyStationName: string;
  /** Called when user confirms the interchange. */
  onConfirm: () => void;
  /** Called when user rejects the interchange (or auto-dismiss fires). */
  onReject: () => void;
}>;

/**
 * Interchange suggestion badge rendered as a react-map-gl Popup.
 * Shows "Make interchange?" with Yes/No buttons anchored to the station position.
 * Auto-dismisses after 8 seconds, defaulting to No per UI-SPEC.
 */
export function InterchangeBadge({
  position,
  nearbyStationName,
  onConfirm,
  onReject,
}: InterchangeBadgeProps) {
  // Auto-dismiss after 8 seconds — defaults to No (onReject)
  useEffect(() => {
    const timer = setTimeout(() => {
      onReject();
    }, AUTO_DISMISS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onReject]);

  return (
    <Popup
      longitude={position[0]}
      latitude={position[1]}
      anchor="left"
      offset={12}
      closeButton={false}
      closeOnClick={false}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div
        style={{
          backgroundColor: "var(--interchange-badge-bg)",
          color: "var(--interchange-badge-text)",
          padding: "var(--space-sm)",
          borderRadius: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
          minWidth: "160px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          Make interchange?
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: 1.3,
            opacity: 0.7,
          }}
        >
          Near {nearbyStationName}
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              minHeight: "44px",
              minWidth: "44px",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              backgroundColor: "var(--shell-accent)",
              color: "var(--shell-dominant)",
            }}
          >
            Yes
          </button>
          <button
            onClick={onReject}
            style={{
              flex: 1,
              minHeight: "44px",
              minWidth: "44px",
              border: "1px solid rgba(243, 238, 229, 0.3)",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              background: "transparent",
              color: "var(--interchange-badge-text)",
            }}
          >
            No
          </button>
        </div>
      </div>
    </Popup>
  );
}
