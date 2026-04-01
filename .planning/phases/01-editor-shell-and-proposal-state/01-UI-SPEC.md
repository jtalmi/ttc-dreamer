---
phase: 1
slug: editor-shell-and-proposal-state
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-31
reviewed_at: 2026-03-31T16:58:00-07:00
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated for the Phase 1 shell before implementation work begins.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | none in Phase 1 |
| Font | IBM Plex Sans |

---

## Visual Hierarchy

- **Primary focal point:** the central map stage placeholder, which fills the remaining viewport below the toolbar
- **Secondary focal point:** the top toolbar cluster, especially the baseline toggle and primary CTA
- **Tertiary focal point:** the right-hand sidebar scaffold, which can collapse when the map needs more room
- **Accessibility rule:** toolbar actions use visible text labels in Phase 1; do not rely on icon-only affordances

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline separators and tiny icon gaps |
| sm | 8px | Compact toolbar gaps and chip padding |
| md | 16px | Default spacing between controls and text blocks |
| lg | 24px | Toolbar and sidebar interior padding |
| xl | 32px | Major section spacing inside the shell |
| 2xl | 48px | Header-to-canvas breathing room in empty states |
| 3xl | 64px | Desktop shell edge spacing and major breakpoints |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 14px | 600 | 1.3 |
| Heading | 20px | 600 | 1.25 |
| Display | 32px | 600 | 1.1 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F3EEE5` | App background, map surface base, empty-state field |
| Secondary (30%) | `#18324A` | Toolbar shell, sidebar shell, dense chrome surfaces |
| Accent (10%) | `#D85A2A` | Primary CTA, active tool pill, selected baseline toggle, keyboard focus ring |
| Destructive | `#A83232` | Reset/clear confirmations only |

Accent reserved for: primary CTA, active toolbar selection, selected baseline mode, focus indicators, and the map-stage empty-state emphasis line only

---

## Interaction Contract

- The shell uses a **top toolbar** pinned to the top of the editor surface
- The **baseline toggle** lives in the toolbar and always exposes the exact labels `Today` and `Future committed`
- The **sidebar scaffold** is anchored to the right edge, opens at 320px width, and collapses to a narrow 64px rail
- The **map stage** occupies the rest of the viewport and must remain visually dominant at all times
- Toolbar scaffold buttons use these exact labels in Phase 1: `Select`, `Draw Line`, `Add Station`, `Inspect`
- `Select` may appear active by default; the other scaffold buttons may be present but non-destructive/disabled until later phases
- The map stage is allowed to show a Toronto-forward placeholder grid/texture, but it must not load real TTC or GO data in Phase 1

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Start Proposal |
| Empty state heading | Toronto draft starts here |
| Empty state body | Phase 1 sets up the shell only: use the toolbar, sidebar, and baseline toggle to frame the workspace before real network data arrives. |
| Error state | Couldn't load the editor shell. Refresh the page. If it keeps failing, restart the dev server and check the console. |
| Destructive confirmation | Reset Draft: Clear the current shell state and return to the default Today baseline. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registries | none | not applicable |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-31
