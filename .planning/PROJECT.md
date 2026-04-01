# Toronto Transit Sandbox

## What This Is

Toronto Transit Sandbox is a desktop-first web app for Toronto transit fans to create, edit, and share custom TTC rapid transit proposals on top of a preloaded Toronto map. Users start from the current or future-committed baseline, extend or branch TTC lines, invent entirely new subway, LRT, or BRT ideas, and shape a full fantasy network that still feels unmistakably local.

## Core Value

Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] Deliver a map-first desktop editor shell rooted in a preloaded Toronto transit map — Validated in Phase 1: Editor Shell and Proposal State (shell scaffold, baseline toggle, proposal state)
- [x] Make the city itself prominent through TTC, GO, neighbourhood, street, and landmark context — Validated in Phase 2: Toronto Baseline and Context Layers (MapLibre map, TTC/GO layers, context labels, corridor toggle)
- [x] Support playful but controlled proposal editing: new lines, extensions, branches, manual stations, naming, and styling — Validated in Phase 3: Editing Core (click-to-draw, extend/branch, station snapping, interchanges, naming/coloring, undo/redo/delete)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Deliver a map-first desktop editor shell rooted in a preloaded Toronto transit map
- [ ] Make the city itself prominent through TTC, GO, neighbourhood, street, and landmark context
- [ ] Support playful but controlled proposal editing: new lines, extensions, branches, manual stations, naming, and styling
- [ ] Add lightweight descriptive stats and inspectors without turning the product into a realism-heavy planning tool
- [ ] Let users share proposals externally through clean exports and unlisted links

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Official planning-grade forecasting — conflicts with the fun-first v1 goal and would dominate scope
- In-app public social network features in v1 — unlisted sharing is the default validation path, not community tooling
- Mobile-first creation — the product is explicitly desktop-first for editing
- Strict realism constraints or warnings — manual creativity should not be blocked by “planner mode” rules
- Editable GO infrastructure in v1 — GO is context/connectivity only for the first release
- Prompt-driven challenge mode or LLM map generation in v1 — not part of the initial core loop

## Context

The source-of-truth product inputs for this project are `docs/product/gsd-idea.md`, `docs/product/product-spec.md`, `docs/product/ui-vision.md`, `docs/product/phase-plan-notes.md`, and `AGENTS.md`. Phase 3 complete — the codebase has a full editing loop: click-to-draw lines (subway/LRT/BRT), extend/branch TTC lines, manual station placement with snapping, interchange suggestions, inline naming/coloring, undo/redo, and delete with confirmation. 12 unit tests cover domain logic.

The product intent is consistent across the docs: Toronto-native context should be obvious, the editor should feel quick and satisfying, the map should stay visually primary, and the resulting proposals should be worth sharing externally. The first release should favour fun, clarity, and visible tools over realism, hidden controls, or enterprise-style dashboards.

## Constraints

- **Product**: Toronto-native context must stay prominent — it is one of the core differentiators
- **Product**: Keep scoring descriptive, not judgmental — v1 is not an official planning tool
- **UX**: Desktop-first creation and map-first layout — editing should prioritize large-screen composition
- **UX**: Prefer visible tools and manual placement with light snapping — user control matters more than automation
- **Domain**: Baseline TTC infrastructure may only change through allowed extensions and branches — preserves the “what if” sandbox framing
- **Domain**: GO is visible but not editable in v1 — it provides context rather than a second editing surface
- **Delivery**: Keep phases small and shippable — the roadmap should avoid giant “build everything” phases
- **Technical**: Add tests for domain logic and geometry helpers where practical — those areas will become correctness hotspots quickly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Desktop-first creation is the primary target | Complex map editing is better suited to larger screens | — Pending |
| The workspace stays map-first with a supportive sidebar | Preserves fast creation and avoids dashboard sprawl | — Pending |
| Every proposal starts from a preloaded Toronto baseline | Blank-canvas starts weaken the TTC-specific fantasy | — Pending |
| Baseline TTC infrastructure stays fixed except for extensions and branches | Keeps proposals grounded without over-policing creativity | — Pending |
| GO is context only in v1 | Adds regional context without doubling scope | — Pending |
| Manual station placement is primary, with light snapping and suggestion flows only | Users should feel in control of their map | — Pending |
| Stats stay expressive and directional rather than authoritative | Supports debate and delight without realism creep | — Pending |
| Sharing is unlisted by default and shared maps open in read-only mode first | Encourages external sharing without turning v1 into a social platform | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after Phase 3 completion*
