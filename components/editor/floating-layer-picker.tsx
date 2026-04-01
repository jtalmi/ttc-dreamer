"use client";

import { Train, TrainFront, Bus, Layers } from "lucide-react";

const LAYER_PICKER_BG =
  "var(--layer-picker-bg, rgba(24, 50, 74, 0.92))";
const LAYER_PICKER_SHADOW =
  "var(--layer-picker-shadow, 0 2px 12px rgba(0, 0, 0, 0.28))";

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
    ? "calc(320px + var(--space-lg))"
    : "var(--space-lg)";

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--space-lg)",
        right: rightOffset,
        zIndex: 9000,
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
          background: LAYER_PICKER_BG,
          boxShadow: LAYER_PICKER_SHADOW,
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
