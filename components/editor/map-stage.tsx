"use client";

type MapStageProps = Readonly<{
  children?: React.ReactNode;
  /** Optional banner rendered absolutely at the bottom of the map canvas. */
  banner?: React.ReactNode;
}>;

export default function MapStage({ children, banner }: MapStageProps) {
  return (
    <div
      className="map-stage-surface"
      style={{
        position: "absolute",
        inset: "0",
        overflow: "hidden",
      }}
    >
      {children ?? (
        <div
          style={{
            textAlign: "center",
            maxWidth: "480px",
            padding: "var(--space-2xl)",
          }}
        >
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "var(--shell-secondary)",
              marginBottom: "var(--space-md)",
            }}
          >
            Toronto draft starts here
          </h2>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.5,
              color: "var(--shell-secondary)",
              opacity: 0.7,
            }}
          >
            Phase 1 sets up the shell only: use the toolbar, sidebar, and
            baseline toggle to frame the workspace before real network data
            arrives.
          </p>
        </div>
      )}
      {banner}
    </div>
  );
}
