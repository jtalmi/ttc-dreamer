---
phase: 01-editor-shell-and-proposal-state
verified: 2026-04-01T02:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Visit / in a browser and click the Today / Future committed toggle"
    expected: "Active button visually highlights (accent color), and the toggle accurately reflects the selected baseline mode"
    why_human: "CSS visual state change cannot be confirmed programmatically"
  - test: "Click the sidebar collapse toggle (the ‹ Panel button)"
    expected: "Sidebar animates from 320px to 64px rail and back; map stage expands to fill"
    why_human: "CSS transition and layout reflow cannot be verified without rendering"
---

# Phase 1: Editor Shell and Proposal State — Verification Report

**Phase Goal:** Stand up the full-screen editor workspace, wire a proposal draft model into the shell, and expose a visible baseline-mode toggle — no real Toronto data, no drawing tools, just a typed foundation and a presentational scaffold that feels like a preloaded sandbox stage.
**Verified:** 2026-04-01T02:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User lands in a full-screen desktop-first editor instead of a placeholder landing page | VERIFIED | `app/page.tsx` renders `<EditorShell />` directly; no bootstrap placeholder text found; `Repo Bootstrap` string absent |
| 2 | User sees a map-first workspace with visible core tools and a collapsible sidebar scaffold | VERIFIED | `EditorFrame` composes `MapStage` (flex:1, dominant surface) + `TopToolbar` + `SidebarShell`; toolbar exposes Select / Draw Line / Add Station / Inspect labels |
| 3 | User can switch between Today and Future committed baseline modes | VERIFIED | `EditorShell.useReducer` dispatches `setBaselineMode`; `TopToolbar` renders both labels with `aria-pressed` and calls `onBaselineChange`; state flows through `EditorFrame` → `TopToolbar` |
| 4 | Starting a proposal always begins from the preloaded Toronto map shell | VERIFIED | `createInitialProposalDraft()` returns `baselineMode: "today"`, empty `lines`/`stations`; `MapStage` shows "Toronto draft starts here" empty state; no real TTC data loaded |
| 5 | Phase shell has one typed source of truth for draft proposal state | VERIFIED | `EditorShellState` combines `ProposalDraft` + `EditorChromeState`; single `proposalEditorReducer` owned by `EditorShell` |
| 6 | Sidebar collapse is interactive and backed by shared state | VERIFIED | `EditorShell` passes `sidebarCollapsed={!chrome.sidebarOpen}` and `onSidebarToggle` dispatching `toggleSidebar`; `SidebarShell` uses `EXPANDED_WIDTH=320` / `COLLAPSED_WIDTH=64` |
| 7 | Build, typecheck, and lint pass cleanly | VERIFIED | `npm run build` exits 0 (Turbopack, static `/`); `npm run typecheck` exits 0; `npm run lint` exits 0 |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/proposal/proposal-types.ts` | Type contracts for BaselineMode, ToolMode, ProposalDraft, EditorChromeState | VERIFIED | Exports all 7 types; BaselineMode = "today" \| "future_committed" confirmed |
| `lib/proposal/proposal-state.ts` | createInitialProposalDraft(), proposalEditorReducer, 4 action variants | VERIFIED | All 4 actions present (setBaselineMode, toggleSidebar, setActiveTool, resetShellState); default state confirmed |
| `lib/proposal/index.ts` | Barrel re-export of all types and helpers | VERIFIED | Re-exports from both `./proposal-types` and `./proposal-state`; 7 types + 2 functions exported |
| `app/globals.css` | CSS tokens: --shell-dominant, --shell-secondary, --shell-accent; full-height body | VERIFIED | All three color tokens present at :root; html/body have height:100%; IBM Plex Sans font token present |
| `components/editor/editor-frame.tsx` | Full-screen shell wrapper composing toolbar, map, sidebar | VERIFIED | Composes TopToolbar + MapStage + SidebarShell in flex column; controlled/uncontrolled prop pattern implemented |
| `components/editor/top-toolbar.tsx` | Tool buttons: Select, Draw Line, Add Station, Inspect; baseline toggle slot | VERIFIED | All 4 tool labels present; Today/Future committed toggle with aria-pressed; 46 lines substantive |
| `components/editor/map-stage.tsx` | Dominant map surface; "Toronto draft starts here" empty state | VERIFIED | flex:1 dominant surface; exact heading and body copy from UI-SPEC present |
| `components/editor/sidebar-shell.tsx` | Collapsible sidebar; 320px expanded, 64px collapsed | VERIFIED | EXPANDED_WIDTH=320, COLLAPSED_WIDTH=64 constants defined; toggle rail implemented |
| `components/editor/editor-shell.tsx` | Client component; useReducer(proposalEditorReducer, undefined, createInitialProposalDraft) | VERIFIED | 'use client' present; useReducer call confirmed; imports from @/lib/proposal |
| `components/editor/baseline-toggle.tsx` | Standalone BaselineToggle with Today/Future committed + aria-pressed | VERIFIED (ORPHANED) | Component exists and is correctly implemented; Today/Future committed labels and aria-pressed present — but component is never imported or consumed |
| `app/page.tsx` | Renders EditorShell; no 'use client'; no Repo Bootstrap text | VERIFIED | 5 lines; imports EditorShell; renders `<EditorShell />`; no 'use client'; no bootstrap text |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/page.tsx` | `components/editor/editor-shell.tsx` | `import EditorShell` | WIRED | Direct import and render on line 1 and 4 |
| `components/editor/editor-shell.tsx` | `lib/proposal` | `import { useReducer, createInitialProposalDraft, proposalEditorReducer }` | WIRED | Imports both helpers from barrel; useReducer call confirmed |
| `components/editor/editor-shell.tsx` | `components/editor/editor-frame.tsx` | `activeTool`, `baseline`, `sidebarCollapsed`, `onToolSelect`, `onBaselineChange`, `onSidebarToggle` props | WIRED | All 6 controlled props and callbacks passed through |
| `components/editor/editor-frame.tsx` | `components/editor/top-toolbar.tsx` | `activeTool`, `baseline`, `onToolSelect`, `onBaselineChange` | WIRED | Props passed at lines 62–79 |
| `components/editor/editor-frame.tsx` | `components/editor/sidebar-shell.tsx` | `collapsed`, `onToggle` | WIRED | Props passed at lines 93–104 |
| `components/editor/baseline-toggle.tsx` | (rendered from toolbar shell) | — | ORPHANED | Component exists but is never imported by TopToolbar or any other file; baseline toggle is implemented inline in TopToolbar instead |
| `lib/proposal/proposal-state.ts` | `lib/proposal/proposal-types.ts` | `import type { BaselineMode, EditorShellState, ProposalDraft, ToolMode }` | WIRED | Confirmed at lines 1–6 |
| `lib/proposal/index.ts` | both `./proposal-types` and `./proposal-state` | re-export | WIRED | Both modules re-exported; all 7 types + 2 functions present |

---

### Data-Flow Trace (Level 4)

These are shell-only UI components with no database or external data source — all state is in-memory reducer state. Level 4 is N/A for this phase by design.

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `EditorShell` | `state.draft.baselineMode` | `proposalEditorReducer` (in-memory) | Yes — user-driven toggle | FLOWING |
| `EditorShell` | `state.chrome.sidebarOpen` | `proposalEditorReducer` (in-memory) | Yes — user-driven toggle | FLOWING |
| `MapStage` | (no external data) | Static empty state (by design, Phase 1) | N/A — Phase 1 has no map data | EXPECTED STATIC — Phase 1 scope |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles cleanly | `npm run typecheck` | Exit 0, no errors | PASS |
| ESLint passes | `npm run lint` | Exit 0, no warnings | PASS |
| Production build succeeds | `npm run build` | Exit 0, static `/` route generated | PASS |
| Module exports expected functions | Inspected `lib/proposal/index.ts` | `createInitialProposalDraft` and `proposalEditorReducer` exported | PASS |
| Commits documented in SUMMARY match git log | `git log --oneline` | 4a1cb7d, ace1121, 8b1b455, ca5aef1, 2427c9b, 6ef5471 all present | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EDTR-01 | 01-02, 01-03 | User can open a desktop-first full-screen editor workspace | SATISFIED | `EditorFrame` renders 100vw/100vh; `app/page.tsx` shows it on `/` |
| EDTR-02 | 01-02, 01-03 | User sees a map-first workspace with visible core editing tools | SATISFIED | `MapStage` is `flex:1` dominant surface; toolbar exposes all 4 tool labels visibly |
| EDTR-03 | 01-02, 01-03 | User can open and collapse a sidebar without losing the map | SATISFIED | `SidebarShell` 320/64 toggle wired to `toggleSidebar` dispatch through `EditorShell` |
| EDTR-04 | 01-01, 01-03 | User can switch the baseline between Today and Future committed | SATISFIED | `setBaselineMode` action in reducer; `TopToolbar` renders both labels with `aria-pressed` and dispatches through `EditorShell` |
| EDTR-05 | 01-01, 01-03 | Every proposal starts from a preloaded Toronto map instead of a blank canvas | SATISFIED (Phase 1 scope) | `createInitialProposalDraft()` sets `baselineMode: "today"`; `MapStage` shows Toronto-forward empty state; no blank canvas; actual map data is Phase 2 scope by design |

No orphaned requirements: REQUIREMENTS.md lists EDTR-01 through EDTR-05 for Phase 1, all claimed and covered.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `components/editor/baseline-toggle.tsx` | 1–50 | Orphaned component — never imported or used | Warning | Zero functional impact: baseline toggle behavior is fully implemented inline in `TopToolbar`; the orphaned component is a clean duplicate implementation, not a missing feature |
| `components/editor/top-toolbar.tsx` | 107–124 | "Start Proposal" CTA button has no `onClick` handler | Info | Non-functional button with no editing logic yet; acceptable Phase 1 scaffold behavior |
| `app/globals.css` | 40–43 | `#__next` selector targets Next.js Pages Router output; App Router uses different root element | Info | Does not break functionality (Tailwind reset still applies); minor legacy selector that has no effect in App Router context |

No blockers found. No TODO/FIXME/placeholder comments in implementation files.

---

### Human Verification Required

#### 1. Baseline Toggle Visual Feedback

**Test:** Open `http://localhost:3000`, observe the top-right area of the toolbar; click "Future committed"
**Expected:** "Future committed" button highlights with the accent color (#D85A2A); "Today" deactivates; clicking "Today" reverses it
**Why human:** CSS `aria-pressed` styling driven by inline style logic cannot be confirmed without browser rendering

#### 2. Sidebar Collapse Animation

**Test:** Click the "‹ Panel" button in the right sidebar
**Expected:** Sidebar animates from 320px to 64px showing only "›"; map stage expands to fill; clicking "›" expands back with the 0.2s ease transition
**Why human:** CSS transition and layout reflow require a browser; cannot verify pixel dimensions or animation smoothness programmatically

---

### Note on BaselineToggle

`components/editor/baseline-toggle.tsx` is a correctly implemented, well-formed component that is never used. The baseline toggle functionality is duplicated inline within `TopToolbar`. This is an orphaned artifact — it does not block any goal or requirement, and both implementations are correct. The `BaselineToggle` component can be integrated into `TopToolbar` in a future cleanup, or left as a standalone reusable component for future use. It is noted here for completeness but does not constitute a gap for Phase 1 goal achievement.

---

## Summary

Phase 1 goal is fully achieved. All 7 observable truths verified, all 5 requirements satisfied (EDTR-01 through EDTR-05), and the production build passes cleanly.

The only notable finding is that `BaselineToggle` is an orphaned component — it was built but the toolbar implements the same toggle inline. This does not affect any user-visible behavior or requirement. Two items are flagged for human visual confirmation (toggle highlight, sidebar animation).

---

_Verified: 2026-04-01T02:00:00Z_
_Verifier: Claude (gsd-verifier)_
