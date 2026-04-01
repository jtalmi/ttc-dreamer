"use client";

import { Train, TrainFront, Bus, Layers } from "lucide-react";

type FloatingLayerPickerProps = Readonly<{
  baselineMode: "today" | "future_committed";
  onBaselineChange: (mode: "today" | "future_committed") => void;
  busCorridorVisible: boolean;
  onCorridorToggle: () => void;
  comparisonMode: boolean;
  onComparisonToggle: () => void;
  hasLines: boolean;
  sidebarOpen?: boolean;
}>;

export function FloatingLayerPicker({
  baselineMode,
  onBaselineChange,
  busCorridorVisible,
  onCorridorToggle,
  comparisonMode,
  onComparisonToggle,
  hasLines,
  sidebarOpen = false,
}: FloatingLayerPickerProps) {
  const rightOffset = sidebarOpen
    ? "calc(320px + var(--space-lg) + 8px)"
    : "calc(var(--space-lg) + 8px)";

  return (
    <div
      style={{
        position: "absolute",
        bottom: "var(--space-lg)",
        right: rightOffset,
        zIndex: "var(--z-floating-toolbar)",
        pointerEvents: "none",
        transition: "right 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          padding: "var(--space-md)",
          borderRadius: "8px",
          background: "var(--layer-picker-bg)",
          boxShadow: "var(--layer-picker-shadow)",
          pointerEvents: "auto",
        }}
      >
        {/* Baseline row */}
        <button
          onClick={() =>
            onBaselineChange(
              baselineMode === "today" ? "future_committed" : "today",
            )
          }
          aria-pressed={baselineMode === "future_committed"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            height: "36px",
            padding: "0 var(--space-sm)",
            border: "none",
            cursor: "pointer",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            width: "100%",
            background: "transparent",
            color: "var(--shell-dominant)",
          }}
        >
          {baselineMode === "today" ? (
            <Train size={16} />
          ) : (
            <TrainFront size={16} />
          )}
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              flex: 1,
              textAlign: "left",
            }}
          >
            {baselineMode === "today" ? "Today" : "Future Committed"}
          </span>
          <TogglePill on={baselineMode === "future_committed"} />
        </button>

        {/* Corridors row */}
        <button
          onClick={onCorridorToggle}
          aria-pressed={busCorridorVisible}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            height: "36px",
            padding: "0 var(--space-sm)",
            border: "none",
            cursor: "pointer",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            width: "100%",
            background: "transparent",
            color: "var(--shell-dominant)",
          }}
        >
          <Bus size={16} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              flex: 1,
              textAlign: "left",
            }}
          >
            Bus + Streetcar
          </span>
          <TogglePill on={busCorridorVisible} />
        </button>

        {/* Comparison row */}
        <button
          onClick={hasLines ? onComparisonToggle : undefined}
          aria-pressed={comparisonMode}
          title={
            !hasLines ? "Add a line to use Baseline View." : undefined
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            height: "36px",
            padding: "0 var(--space-sm)",
            border: "none",
            cursor: hasLines ? "pointer" : "default",
            borderRadius: "6px",
            fontFamily: "var(--font-sans)",
            width: "100%",
            background: "transparent",
            color: "var(--shell-dominant)",
            opacity: hasLines ? 1 : 0.4,
            pointerEvents: hasLines ? "auto" : "none",
          }}
        >
          <Layers size={16} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              flex: 1,
              textAlign: "left",
            }}
          >
            Baseline View
          </span>
          <TogglePill on={comparisonMode} />
        </button>
      </div>
    </div>
  );
}

function TogglePill({ on }: { on: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "20px",
        borderRadius: "10px",
        fontSize: "10px",
        fontWeight: 600,
        flexShrink: 0,
        background: on
          ? "var(--shell-accent)"
          : "rgba(243, 238, 229, 0.12)",
        color: on ? "var(--shell-dominant)" : "rgba(243, 238, 229, 0.7)",
        transition: "background 0.15s",
      }}
    >
      {on ? "ON" : "OFF"}
    </span>
  );
}
