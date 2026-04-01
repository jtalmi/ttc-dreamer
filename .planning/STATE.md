---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: UI Revamp & Data Accuracy
status: roadmap-ready
stopped_at: null
last_updated: "2026-04-01T20:00:00.000Z"
last_activity: 2026-04-01
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-01)

**Core value:** Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share
**Current focus:** Phase 6 — Baseline Data Correction (ready to plan)

## Current Position

Phase: 6 of 10 (Baseline Data Correction)
Plan: — (not yet planned)
Status: Ready to plan
Last activity: 2026-04-01 — v2.0 roadmap created (phases 6-10)

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

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key v2.0 constraints from research:

- [v2.0 Roadmap]: Station-first model is an atomic rewrite — `DrawingSession.waypoints` replaced by `stationIds`; no partial migration
- [v2.0 Roadmap]: Share payload must bump to v2 with migration before any ProposalLineDraft field removal lands
- [v2.0 Roadmap]: Floating toolbar wrappers must use `pointer-events: none`; only interactive children restore it
- [v2.0 Roadmap]: Station drag throttled to 30ms; preview decoupled from committed state to avoid MapLibre worker queue blowup
- [v2.0 Roadmap]: Nominatim reverse geocoding for auto-names; Photon wired as fallback from the start; in-memory cache keyed by rounded coordinate

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 8 planning: `HISTORY_ACTIONS` exhaustiveness check design decision required before implementation (TypeScript union vs. Vitest fixture)
- Phase 8 planning: Frozen v1 share payload JSON fixture must exist before any ProposalLineDraft type changes land

## Session Continuity

Last session: 2026-04-01T20:00:00.000Z
Stopped at: v2.0 roadmap created — phases 6-10 defined
Resume file: None
