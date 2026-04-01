"use client";

import { useState, useEffect } from "react";
import { Popup } from "react-map-gl/maplibre";

type StationNamePopoverProps = Readonly<{
  /** [lng, lat] position of the station on the map. */
  position: [number, number];
  /** Default station name to prefill the text field. */
  defaultName: string;
  /** Called when the user saves a name (Enter key or Save Name button). */
  onSave: (name: string) => void;
  /** Called when the popover is dismissed without an explicit save action. */
  onDismiss: () => void;
}>;

/**
 * Station name popover rendered as a react-map-gl Popup.
 * Appears immediately after a station is placed, allowing the user to name it.
 * Defaults to the prefilled name if dismissed without saving.
 */
export function StationNamePopover({
  position,
  defaultName,
  onSave,
  onDismiss,
}: StationNamePopoverProps) {
  const [name, setName] = useState(defaultName);

  // Reset name if defaultName changes (e.g. new station placed)
  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  function handleSave() {
    onSave(name.trim() || defaultName);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    }
  }

  // onClose fires on click-away — default to prefilled name per UI-SPEC
  function handleClose() {
    onDismiss();
  }

  return (
    <Popup
      longitude={position[0]}
      latitude={position[1]}
      anchor="bottom"
      offset={8}
      closeButton={false}
      onClose={handleClose}
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
          minWidth: "180px",
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
          Name this station
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: 1.5,
            fontFamily: "var(--font-sans)",
            padding: "4px 8px",
            border: "1px solid rgba(243, 238, 229, 0.4)",
            borderRadius: "3px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "var(--interchange-badge-text)",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleSave}
          style={{
            padding: "var(--space-sm) var(--space-md)",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.3,
            fontFamily: "var(--font-sans)",
            backgroundColor: "var(--shell-accent)",
            color: "var(--shell-dominant)",
            minHeight: "44px",
          }}
        >
          Save Name
        </button>
      </div>
    </Popup>
  );
}
