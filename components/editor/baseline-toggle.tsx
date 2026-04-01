"use client";

import type { BaselineMode } from "@/lib/proposal";

type BaselineToggleProps = Readonly<{
  value: BaselineMode;
  onChange: (mode: BaselineMode) => void;
}>;

const MODES: { mode: BaselineMode; label: string }[] = [
  { mode: "today", label: "Today" },
  { mode: "future_committed", label: "Future committed" },
];

export default function BaselineToggle({ value, onChange }: BaselineToggleProps) {
  return (
    <div
      aria-label="Baseline mode"
      style={{ display: "flex", gap: "var(--space-xs)" }}
    >
      {MODES.map(({ mode, label }) => {
        const isSelected = mode === value;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            aria-pressed={isSelected}
            style={{
              padding: "var(--space-xs) var(--space-sm)",
              borderRadius: "4px",
              border: "1px solid rgba(243, 238, 229, 0.3)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              backgroundColor: isSelected
                ? "var(--shell-accent)"
                : "transparent",
              color: "var(--shell-dominant)",
              transition: "background-color 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
