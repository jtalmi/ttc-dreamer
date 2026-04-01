---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: UI Revamp & Data Accuracy
status: verifying
stopped_at: "Checkpoint: Task 2 human-verify for 07-02-PLAN.md"
last_updated: "2026-04-01T22:12:21.079Z"
last_activity: 2026-04-01
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 4
  completed_plans: 4
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-01)

**Core value:** Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share
**Current focus:** Phase 07 — full-screen-layout-and-floating-toolbars

## Current Position

Phase: 07 (full-screen-layout-and-floating-toolbars) — EXECUTING
Plan: 2 of 2
Status: Phase complete — ready for verification
Last activity: 2026-04-01

Progress: ░░░░░░░░░░ 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0 (v2.0)
- Average duration: — min
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: none yet (v2.0)
- Trend: Stable

*Updated after each plan completion*
| Phase 06 P01 | 5 | 2 tasks | 4 files |
| Phase 06 P02 | 5 | 2 tasks | 3 files |
| Phase 07 P01 | 3 | 2 tasks | 8 files |
| Phase 07 P02 | 2 | 1 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key v2.0 constraints from research:

- [v2.0 Roadmap]: Station-first model is an atomic rewrite — `DrawingSession.waypoints` replaced by `stationIds`; no partial migration
- [v2.0 Roadmap]: Share payload must bump to v2 with migration before any ProposalLineDraft field removal lands
- [v2.0 Roadmap]: Floating toolbar wrappers must use `pointer-events: none`; only interactive children restore it
- [v2.0 Roadmap]: Station drag throttled to 30ms; preview decoupled from committed state to avoid MapLibre worker queue blowup
- [v2.0 Roadmap]: Nominatim reverse geocoding for auto-names; Photon wired as fallback from the start; in-memory cache keyed by rounded coordinate
- [Phase 06]: Ontario Line geometry hand-authored with 57 coordinates (15 stations + intermediate points) since no official GTFS/ArcGIS source exists for this under-construction line
- [Phase 06]: Status property is optional in TtcRouteProperties to avoid breaking existing callers without status field
- [Phase 06]: GTFS platform midpoint averaging used for Line 5/6 station coordinates (15-95m from route vs 300-1600m ArcGIS)
- [Phase 06]: Under-construction line styling uses two MapLibre layers (solid base + dashed overlay) due to line-dasharray not supporting data-driven expressions
- [Phase 07]: Select mode auto-opens inspector (inspectElement dispatch) - inspect tool removed from ToolMode
- [Phase 07]: FloatingDrawingToolbar uses pointer-events:none wrapper with auto on interactive children
- [Phase 07]: EditorFrame simplified to pure layout shell with no tool state management
- [Phase 07]: SidebarShell rewritten as absolute overlay with translateX transition; ChevronRight=open, ChevronLeft=closed for toggle button direction
- [Phase 07]: FloatingLayerPicker right offset transitions with sidebar open state to avoid overlap

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 8 planning: `HISTORY_ACTIONS` exhaustiveness check design decision required before implementation (TypeScript union vs. Vitest fixture)
- Phase 8 planning: Frozen v1 share payload JSON fixture must exist before any ProposalLineDraft type changes land

## Session Continuity

Last session: 2026-04-01T22:12:21.077Z
Stopped at: Checkpoint: Task 2 human-verify for 07-02-PLAN.md
Resume file: None
