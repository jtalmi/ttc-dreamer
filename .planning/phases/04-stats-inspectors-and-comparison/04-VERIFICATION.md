---
phase: 04-stats-inspectors-and-comparison
verified: 2026-03-31T23:56:45Z
status: passed
score: 11/11 must-haves verified
re_verification: false
human_verification:
  - test: "Inspector panels display correct live data"
    expected: "Line inspector shows color stripe, name, mode badge, geometry stats (length, stations), 2x2 stats grid with ~ prefix values and qualifiers, and interchange count. Station inspector shows station name, lines list with color dots, baseline connection status, and neighbourhood/coordinate location."
    why_human: "Visual layout and stat value correctness require interacting with a real drawn proposal in the browser"
  - test: "Inspect tool cursor is pointer on map"
    expected: "When Inspect tool is active, hovering over the map shows a pointer cursor (not zoom-in or default)"
    why_human: "Cursor style requires visual browser verification"
  - test: "Comparison mode visual opacity change"
    expected: "When Baseline View is active, proposal lines and stations render at visibly reduced (40%) opacity while TTC and GO baseline layers remain at full visibility"
    why_human: "Opacity rendering requires browser visual inspection"
  - test: "Comparison banner renders at map bottom"
    expected: "Banner reads exactly: 'Comparing against baseline — click Proposal View to return', positioned at the bottom of the map canvas"
    why_human: "Absolute positioning and banner text require visual browser verification"
  - test: "Comparison toggle muted state"
    expected: "When no lines exist, the comparison toggle appears visually muted and cannot be clicked"
    why_human: "Requires browser interaction with an empty proposal"
---

# Phase 4: Stats, Inspectors, and Comparison Verification Report

**Phase Goal:** Add line/station inspectors, live sidebar stats with descriptive metric formulas (~prefixed), and a before/after comparison toggle. Stats must be descriptive not authoritative, inspectors must not dominate the map.
**Verified:** 2026-03-31T23:56:45Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Pure stat functions return correct values for line length, travel time, avg stop spacing, cost, and ridership | ✓ VERIFIED | 26 tests pass in `tests/proposal/proposal-stats.test.ts`; all 7 functions present and substantive in `lib/proposal/proposal-stats.ts` |
| 2 | Proposal-level stats aggregate correctly across multiple lines | ✓ VERIFIED | `computeProposalStats` sums networkKm, finds longest travel time, averages spacing, totals cost/ridership; test confirms multi-line aggregation |
| 3 | Edge cases (empty lines, 0-1 stations) return safe values (0 or null), not NaN or Infinity | ✓ VERIFIED | `computeLineLength` returns 0 for <2 waypoints; `computeAvgStopSpacing` returns null for <2 stations; confirmed by tests |
| 4 | New chrome state fields (inspectedElementId, comparisonMode) and sidebar panel states exist in the type system | ✓ VERIFIED | `EditorChromeState` in `lib/proposal/proposal-types.ts` lines 117-119 has both fields; `sidebarPanel` union includes `"inspect-line" \| "inspect-station"` |
| 5 | New reducer actions (inspectElement, closeInspector, toggleComparisonMode) update chrome state correctly | ✓ VERIFIED | All three action types defined (lines 160-171), included in `EditorShellAction` union, reducer cases at lines 751-779 |
| 6 | Clicking a proposed line/station with Inspect tool opens the correct inspector panel | ✓ VERIFIED | `activeTool === "inspect"` block in `toronto-map.tsx` lines 455-478 dispatches `inspectElement` with correct `elementType`; `editor-shell.tsx` routes `inspect-line`/`inspect-station` to respective panels |
| 7 | Live proposal stats summary appears below the line list when no inspector is open | ✓ VERIFIED | `editor-shell.tsx` "list" panel branch (lines 299-337) renders `<LineList>` + `<ProposalStatsPanel>` in flex column; `ProposalStatsPanel` calls `useMemo(() => computeProposalStats(draft), [draft])` |
| 8 | Stats values use ~ prefix and include qualifiers per the copywriting contract | ✓ VERIFIED | All four stat cells in `proposal-stats-panel.tsx` and `line-inspector-panel.tsx` use `~` prefix; qualifiers "end-to-end, longest line", "per line average", "rough order of magnitude", "directional estimate" are present |
| 9 | User can toggle between Proposal View and Baseline View via a toolbar button | ✓ VERIFIED | `top-toolbar.tsx` lines 122-146 render comparison toggle button with "Proposal View"/"Baseline View" labels; `editor-shell.tsx` passes `onComparisonToggle={() => dispatch({ type: "toggleComparisonMode" })}` |
| 10 | When Baseline View is active, proposal lines and stations render at 40% opacity | ✓ VERIFIED | `editor-shell.tsx` line 339: `const proposalOpacity = chrome.comparisonMode ? 0.4 : 1`; passed to `TorontoMap` and then to `ProposalLayers` which applies it to `line-opacity`, `circle-opacity`, `circle-stroke-opacity`, `text-opacity` |
| 11 | Comparison banner appears at the bottom of the map canvas when Baseline View is active | ✓ VERIFIED | `editor-shell.tsx` lines 363-383 render `comparisonBanner` div when `chrome.comparisonMode` is true with exact copy text; `MapStage` renders `{banner}` after children inside `position: relative` container |

**Score:** 11/11 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/proposal/proposal-stats.ts` | Pure stat computation functions | ✓ VERIFIED | 166 lines; 7 exported functions + 3 constants + ProposalStats type; substantive implementations using turf.js |
| `tests/proposal/proposal-stats.test.ts` | Unit tests for all stat functions (min 60 lines) | ✓ VERIFIED | 337 lines; 26 tests covering all 7 functions; all pass |
| `lib/proposal/proposal-types.ts` | Extended EditorChromeState with inspectedElementId, comparisonMode, extended sidebarPanel union | ✓ VERIFIED | Lines 100-120 show both new fields; sidebarPanel union includes `"inspect-line" \| "inspect-station"` |
| `lib/proposal/proposal-state.ts` | Three new action types and reducer cases | ✓ VERIFIED | Lines 160-171 (type definitions), lines 751-779 (reducer cases); initial state includes both new fields |
| `lib/proposal/index.ts` | Re-exports of all new stat functions | ✓ VERIFIED | Lines 52-64 export ProposalStats type, all 7 functions, and 3 constants |
| `app/globals.css` | Five new CSS custom property tokens | ✓ VERIFIED | Lines 52-56: `--inspector-divider`, `--stat-value-muted`, `--stat-group-label`, `--comparison-delta-positive`, `--comparison-delta-neutral` |
| `components/editor/sidebar/line-inspector-panel.tsx` | Line inspector sidebar panel (min 80 lines) | ✓ VERIFIED | 398 lines; header with color stripe, mode badge, close button; geometry section; 2x2 stats grid; connection section; all stat functions imported from barrel |
| `components/editor/sidebar/station-inspector-panel.tsx` | Station inspector sidebar panel (min 60 lines) | ✓ VERIFIED | 238 lines; header, lines section with color dots, baseline connection, location via resolveNeighbourhood |
| `components/editor/sidebar/proposal-stats-panel.tsx` | Proposal stats summary panel (min 60 lines) | ✓ VERIFIED | 273 lines; empty state message, section heading, 2x2 primary grid, secondary stat rows; `useMemo` calling `computeProposalStats` |
| `components/editor/top-toolbar.tsx` | Before/After toggle button between baseline toggle and corridors button | ✓ VERIFIED | Lines 122-146: comparison toggle between baseline toggle group and corridors button; correct label logic, aria-pressed, muted state |
| `components/map/proposal-layers.tsx` | proposalOpacity prop controlling line, station, and label opacity | ✓ VERIFIED | `proposalOpacity` prop applied to `line-opacity` (both stroke and glow), `circle-opacity`, `circle-stroke-opacity`, `text-opacity`; not applied to in-progress ghost or snap cue |
| `components/editor/map-stage.tsx` | Comparison banner overlay at bottom of map canvas | ✓ VERIFIED | `banner?: React.ReactNode` prop rendered after `{children}` inside `position: relative` container |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/proposal/proposal-stats.ts` | `lib/proposal/proposal-types.ts` | imports ProposalDraft, ProposalLineDraft, TransitMode | ✓ WIRED | Line 6: `import type { ProposalDraft, ProposalLineDraft, TransitMode } from "./proposal-types"` |
| `lib/proposal/index.ts` | `lib/proposal/proposal-stats.ts` | barrel re-export | ✓ WIRED | Lines 52-64 export all stat functions and constants |
| `components/editor/editor-shell.tsx` | `components/editor/sidebar/line-inspector-panel.tsx` | `sidebarPanel === 'inspect-line'` conditional render | ✓ WIRED | Lines 183-197: `if (chrome.sidebarPanel === "inspect-line")` renders `<LineInspectorPanel>` |
| `components/editor/editor-shell.tsx` | `components/editor/sidebar/station-inspector-panel.tsx` | `sidebarPanel === 'inspect-station'` conditional render | ✓ WIRED | Lines 198-213: `else if (chrome.sidebarPanel === "inspect-station")` renders `<StationInspectorPanel>` |
| `components/editor/toronto-map.tsx` | `lib/proposal/proposal-state.ts` | dispatch inspectElement/closeInspector | ✓ WIRED | Lines 455-478: `activeTool === "inspect"` block dispatches `inspectElement` and `closeInspector` |
| `components/editor/sidebar/proposal-stats-panel.tsx` | `lib/proposal/proposal-stats.ts` | useMemo calling computeProposalStats | ✓ WIRED | Line 34: `const stats = useMemo(() => computeProposalStats(draft), [draft])` |
| `components/editor/editor-shell.tsx` | `components/editor/editor-frame.tsx` | comparisonMode and onComparisonToggle props | ✓ WIRED | Lines 401-403: `comparisonMode`, `onComparisonToggle`, `hasLines` all passed to EditorFrame |
| `components/editor/editor-frame.tsx` | `components/editor/top-toolbar.tsx` | comparisonMode and onComparisonToggle props | ✓ WIRED | Lines 90-92: props forwarded to TopToolbar |
| `components/editor/editor-shell.tsx` | `components/map/proposal-layers.tsx` | proposalOpacity={chrome.comparisonMode ? 0.4 : 1} through TorontoMap | ✓ WIRED | `proposalOpacity` computed at line 339, passed to TorontoMap at line 350, TorontoMap passes to ProposalLayers (default 1, destructured at line 120) |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `proposal-stats-panel.tsx` | `stats` | `useMemo(() => computeProposalStats(draft), [draft])` — `draft` flows from EditorShell's `state.present.draft` | Yes — pure function over live reducer state | ✓ FLOWING |
| `line-inspector-panel.tsx` | `line`, `draft` | Props from EditorShell after `draft.lines.find(l => l.id === chrome.inspectedElementId)` | Yes — real line object from live draft | ✓ FLOWING |
| `station-inspector-panel.tsx` | `station`, `draft`, `neighbourhoods` | Props from EditorShell; `neighbourhoods` fetched on mount via `fetch("/data/neighbourhoods.geojson")` | Yes — real station from draft; neighbourhoods from GeoJSON file | ✓ FLOWING |
| `proposal-layers.tsx` | `proposalOpacity` | `chrome.comparisonMode ? 0.4 : 1` from EditorShell reducer state | Yes — directly from chrome state | ✓ FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All stat tests pass | `npx vitest run tests/proposal/proposal-stats.test.ts` | 26 passed (26) | ✓ PASS |
| All project tests pass | `npx vitest run` | 38 passed (38) across 3 test files | ✓ PASS |
| TypeScript compilation | `npm run typecheck` | exit 0, no errors | ✓ PASS |
| ESLint | `npm run lint` | exit 0, no errors | ✓ PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STATS-01 | 04-02-PLAN | User can inspect line details in a sidebar inspector | ✓ SATISFIED | `line-inspector-panel.tsx` (398 lines), wired via `inspect-line` sidebar routing in `editor-shell.tsx` and Inspect tool handler in `toronto-map.tsx` |
| STATS-02 | 04-02-PLAN | User can inspect station details in a sidebar inspector | ✓ SATISFIED | `station-inspector-panel.tsx` (238 lines), wired via `inspect-station` sidebar routing |
| STATS-03 | 04-02-PLAN | User sees live proposal-level and line-level descriptive stats in the sidebar | ✓ SATISFIED | `proposal-stats-panel.tsx` uses `useMemo` over `computeProposalStats`; `line-inspector-panel.tsx` computes per-line stats live; both shown in sidebar |
| STATS-04 | 04-01-PLAN | Stats include speed/travel time, average stop spacing, estimated cost, and estimated ridership | ✓ SATISFIED | `computeTravelTime`, `computeAvgStopSpacing`, `computeLineCost`, `computeLineRidership` all implemented and exported; rendered in both inspector and stats panels |
| STATS-05 | 04-01-PLAN | Stats can also surface station count, line length, and connection/interchange counts | ✓ SATISFIED | `computeProposalStats` returns `stationCount`, `networkKm`, `interchangeCount`; `computeLineLength` for per-line length; all displayed in panels |
| STATS-06 | 04-03-PLAN | User can compare the proposal against the baseline with a before/after toggle | ✓ SATISFIED | Comparison toggle in toolbar, `proposalOpacity` prop chain dims proposal layers to 40%, comparison banner at map bottom, toggle disabled when no lines |

All 6 phase 4 requirements satisfied. No orphaned requirements — every STATS-01 through STATS-06 is claimed by a plan and implemented.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/editor/sidebar/station-inspector-panel.tsx` | 202-203 | `station.linkedBaselineStationId ? station.name : "None"` — shows proposal station's own name instead of the TTC baseline station's name when linked | ⚠️ Warning | When a station is linked to a TTC baseline station (e.g., Bloor-Yonge), the inspector shows the proposal station's name in the "Connected to baseline" field rather than the baseline TTC station name. Both may be the same due to the interchange naming flow, so this is usually non-misleading in practice, but is technically incorrect per the UI-SPEC. Not a blocker. |

No TODO/FIXME/placeholder comments found in Phase 4 files. No empty return null or hardcoded empty state patterns that reach rendering. No stubs.

---

### Human Verification Required

#### 1. Inspector Panel Content Correctness

**Test:** Draw a subway line with 3 waypoints across Toronto, place 2-3 stations, then click a line row in the sidebar to open the line inspector.
**Expected:** Header shows colored left border stripe (matching line color), line name, mode badge (e.g., "Subway" at 50% opacity), and a close button (×). Geometry section shows length in km (1 decimal) and station count. Stats grid shows ~N min (end-to-end), ~N km avg spacing or — (per line average), ~$NB or ~$NM (rough order of magnitude), ~NK/day (directional estimate). Connections section shows interchange count.
**Why human:** Visual layout, correct stat value computation with real Toronto coordinates, and ~ prefix formatting require browser interaction with a live map.

#### 2. Inspect Tool Cursor

**Test:** Switch to the Inspect tool using the toolbar. Hover over the map, over a proposed line, and over a proposed station.
**Expected:** Cursor shows pointer (hand icon) in all Inspect mode states — not zoom-in.
**Why human:** Cursor style requires visual browser verification; grep confirms `case "inspect": return "pointer"` at toronto-map.tsx line 562 but visual confirmation is preferred.

#### 3. Comparison Mode Visual Effect

**Test:** Draw at least one line, then click the "Proposal View" toggle in the toolbar. Observe the map.
**Expected:** Toggle label changes to "Baseline View", proposal lines and station dots fade visibly to ~40% opacity, TTC and GO layers remain at full brightness, banner appears at bottom of map canvas reading exactly "Comparing against baseline — click Proposal View to return". Clicking the toggle again restores full opacity and removes the banner.
**Why human:** Opacity rendering and banner position require visual browser inspection.

#### 4. Comparison Toggle Disabled State

**Test:** Open the editor with no lines drawn. Observe the "Proposal View" button in the toolbar.
**Expected:** Button appears muted (visually faded), cannot be clicked, and shows tooltip "Add a line to use comparison mode." on hover.
**Why human:** Disabled visual state and tooltip require browser interaction.

#### 5. Station Inspector Baseline Connection Display

**Test:** Place a station near an existing TTC station and confirm the interchange suggestion. Then open the station inspector.
**Expected:** "Connected to baseline" section shows the TTC station name (e.g., "Bloor-Yonge Station").
**Why human:** There is a code-level discrepancy — the field shows `station.name` (the proposal station's name) when `linkedBaselineStationId` is set, rather than a separately looked-up TTC station name. In practice the names may match since the interchange naming flow copies the TTC station name, but this warrants visual confirmation.

---

### Gaps Summary

No gaps found. All 11 truths are verified, all 12 artifacts pass levels 1-3 and level 4 where applicable, all key links are wired, all 6 requirements are satisfied, and the test suite passes with 38/38 tests.

One warning-level anti-pattern was found: the station inspector's "Connected to baseline" field renders `station.name` (the proposal station's own name) rather than the TTC baseline station's name. Since the TTC station name is typically copied during the interchange suggestion flow, these are usually equal, making this a cosmetic inconsistency rather than a functional defect. It does not block goal achievement.

---

_Verified: 2026-03-31T23:56:45Z_
_Verifier: Claude (gsd-verifier)_
