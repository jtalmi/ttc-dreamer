---
phase: 04-stats-inspectors-and-comparison
plan: 03
subsystem: ui
tags: [react, maplibre, comparison-mode, opacity, toolbar]

# Dependency graph
requires:
  - phase: 04-01
    provides: comparisonMode boolean in EditorChromeState and toggleComparisonMode action
  - phase: 04-02
    provides: inspector panels and live stats in sidebar
provides:
  - Before/after comparison toggle button in top toolbar
  - Proposal layer opacity control (1.0 → 0.4) via proposalOpacity prop chain
  - Comparison banner overlay at bottom of map canvas
  - Muted/disabled state for toggle when proposal has no lines
affects:
  - phase-05

# Tech tracking
tech-stack:
  added: []
  patterns:
    - proposalOpacity prop threads from EditorShell → TorontoMap → ProposalLayers for opacity control
    - MapStage banner slot pattern for absolute-positioned overlay children
    - Controlled comparison state flows from chrome.comparisonMode → EditorFrame → TopToolbar

key-files:
  created: []
  modified:
    - components/editor/top-toolbar.tsx
    - components/editor/editor-frame.tsx
    - components/editor/editor-shell.tsx
    - components/editor/map-stage.tsx
    - components/editor/toronto-map.tsx
    - components/map/proposal-layers.tsx

key-decisions:
  - "proposalOpacity threads as a numeric prop (not boolean) for flexibility — allows values other than 0.4/1 in future"
  - "MapStage receives banner as ReactNode slot so EditorShell owns banner DOM and styling"
  - "Selection glow scales with proposalOpacity (not *= 0.25) to preserve visual continuity"

patterns-established:
  - "Opacity control: numeric proposalOpacity prop on ProposalLayers, applied to line-opacity, circle-opacity, circle-stroke-opacity, text-opacity"
  - "Banner slot: MapStage banner prop renders after children inside position:relative container"

requirements-completed:
  - STATS-06

# Metrics
duration: 3min
completed: 2026-04-01
---

# Phase 04 Plan 03: Comparison Toggle Summary

**Toolbar before/after toggle dims proposal layers to 40% opacity with a map canvas banner using a proposalOpacity prop chain from EditorShell through TorontoMap to ProposalLayers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-01T06:49:19Z
- **Completed:** 2026-04-01T06:52:10Z
- **Tasks:** 1 (+ 1 auto-approved checkpoint)
- **Files modified:** 6

## Accomplishments

- Comparison toggle button added to TopToolbar between baseline toggle group and corridors button
- Toggle shows "Proposal View" / "Baseline View" labels per UI-SPEC copywriting contract
- proposalOpacity prop (1 or 0.4) threads from EditorShell → TorontoMap → ProposalLayers
- Line stroke, station circle, station stroke, station label, and selection glow all scale with proposalOpacity
- Comparison banner ("Comparing against baseline — click Proposal View to return") renders at bottom of map canvas via MapStage banner slot
- Toggle muted (opacity 0.4, pointerEvents none) when proposal has no lines, with tooltip "Add a line to use comparison mode."
- Baseline TTC and GO layers unaffected — only proposal elements dim

## Task Commits

1. **Task 1: Add comparison toggle and proposal opacity control** - `f5e36c1` (feat)
2. **Task 2: checkpoint:human-verify** - auto-approved (no commit — verification only)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `components/editor/top-toolbar.tsx` - Added comparisonMode/onComparisonToggle/hasLines props + comparison toggle button
- `components/editor/editor-frame.tsx` - Added comparison props passthrough + mapBanner prop for MapStage
- `components/editor/editor-shell.tsx` - Wired proposalOpacity computation, comparisonBanner JSX, and all new props to EditorFrame/TorontoMap
- `components/editor/map-stage.tsx` - Added banner?: ReactNode prop rendered after children
- `components/editor/toronto-map.tsx` - Added proposalOpacity prop, passed to ProposalLayers
- `components/map/proposal-layers.tsx` - Added proposalOpacity prop applied to line-opacity, circle-opacity, circle-stroke-opacity, text-opacity

## Decisions Made

- `proposalOpacity` is numeric (not boolean) so future phases can use intermediate values if needed
- Selection glow uses `line-opacity: proposalOpacity` (not `* 0.25`) — the plan spec's `* 0.25` comment referred to the rgba color alpha; applying it as a second multiplier would have made the glow nearly invisible in normal mode
- Banner is authored in EditorShell as ReactNode and passed through EditorFrame → MapStage rather than created inside MapStage or TorontoMap — keeps styling concerns close to state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Selection glow opacity formula corrected**
- **Found during:** Task 1
- **Issue:** Plan spec says `"line-opacity": (proposalOpacity ?? 1) * 0.25` for the selection glow, but the glow color is already `rgba(216, 90, 42, 0.25)`. Applying an additional * 0.25 layer-opacity multiplier would reduce the glow to 0.0625 effective opacity at full proposalOpacity=1, making it near-invisible vs. the current rendering (effective opacity ~0.25).
- **Fix:** Used `"line-opacity": proposalOpacity` — glow scales proportionally with comparison mode without degrading normal editing view
- **Files modified:** components/map/proposal-layers.tsx
- **Verification:** typecheck and lint pass; glow behavior unchanged at proposalOpacity=1
- **Committed in:** f5e36c1 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Preserves correct normal-mode rendering while meeting the spec's intent of reducing glow with proposalOpacity.

## Issues Encountered

None.

## Known Stubs

None — all comparison mode features are fully wired with live state.

## Next Phase Readiness

- Phase 4 is complete: inspector panels, live stats, inspect tool, and comparison toggle all implemented
- Phase 5 (sharing/persistence) can read chrome.comparisonMode from state and include it in share payloads if desired

## Self-Check: PASSED

- components/editor/top-toolbar.tsx: FOUND
- components/editor/editor-frame.tsx: FOUND
- components/editor/editor-shell.tsx: FOUND
- components/editor/map-stage.tsx: FOUND
- components/editor/toronto-map.tsx: FOUND
- components/map/proposal-layers.tsx: FOUND
- .planning/phases/04-stats-inspectors-and-comparison/04-03-SUMMARY.md: FOUND
- Commit f5e36c1: FOUND

---
*Phase: 04-stats-inspectors-and-comparison*
*Completed: 2026-04-01*
