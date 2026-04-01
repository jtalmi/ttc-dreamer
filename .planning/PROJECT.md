# Toronto Transit Sandbox

## What This Is

Toronto Transit Sandbox is a desktop-first web app for Toronto transit fans to create, edit, and share custom TTC rapid transit proposals on top of a preloaded Toronto map. Users start from the current or future-committed baseline, extend or branch TTC lines, invent entirely new subway, LRT, or BRT ideas, and shape a full fantasy network that still feels unmistakably local.

## Core Value

Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share.

## Requirements

### Validated

<!-- Shipped and confirmed in v1.0. -->

- ✓ Deliver a map-first desktop editor shell rooted in a preloaded Toronto transit map — v1.0
- ✓ Make the city itself prominent through TTC, GO, neighbourhood, street, and landmark context — v1.0
- ✓ Support playful but controlled proposal editing: new lines, extensions, branches, manual stations, naming, and styling — v1.0
- ✓ Add lightweight descriptive stats and inspectors without turning the product into a realism-heavy planning tool — v1.0
- ✓ Let users share proposals externally through clean exports and unlisted links — v1.0

### Active

<!-- Next milestone scope. -->

(None yet — run `/gsd:new-milestone` to define v1.1 requirements)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Official planning-grade forecasting — conflicts with the fun-first v1 goal and would dominate scope
- In-app public social network features — unlisted sharing is the v1 validation path, not community tooling
- Mobile-first creation — the product is explicitly desktop-first for editing
- Strict realism constraints or warnings — manual creativity should not be blocked by "planner mode" rules
- Editable GO infrastructure in v1 — GO is context/connectivity only for the first release
- Prompt-driven challenge mode or LLM map generation — not part of the initial core loop

## Context

**v1.0 shipped 2026-04-01.** The codebase is a complete Toronto transit sandbox: full-screen editor shell, interactive MapLibre GL map with TTC/GO baseline and Toronto context layers, click-to-draw editing (new lines, extensions, branches), manual station placement with snapping and interchange suggestions, inline naming/coloring, undo/redo/delete, line/station inspectors, descriptive ~prefixed stats, before/after comparison, PNG export, URL hash sharing, read-only view mode, edit-as-copy, and onboarding tooltips. 305 vitest tests cover domain logic, stats, geometry, history, and sharing.

**Tech stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, MapLibre GL JS, react-map-gl, @turf/turf, Vitest.

**No backend** — all state is client-side, sharing uses URL hash encoding.

## Constraints

- **Product**: Toronto-native context must stay prominent — it is one of the core differentiators
- **Product**: Keep scoring descriptive, not judgmental — v1 is not an official planning tool
- **UX**: Desktop-first creation and map-first layout — editing should prioritize large-screen composition
- **UX**: Prefer visible tools and manual placement with light snapping — user control matters more than automation
- **Domain**: Baseline TTC infrastructure may only change through allowed extensions and branches — preserves the "what if" sandbox framing
- **Domain**: GO is visible but not editable in v1 — it provides context rather than a second editing surface
- **Technical**: Add tests for domain logic and geometry helpers where practical — correctness hotspots

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Desktop-first creation is the primary target | Complex map editing is better suited to larger screens | ✓ Good |
| The workspace stays map-first with a supportive sidebar | Preserves fast creation and avoids dashboard sprawl | ✓ Good |
| Every proposal starts from a preloaded Toronto baseline | Blank-canvas starts weaken the TTC-specific fantasy | ✓ Good |
| Baseline TTC infrastructure stays fixed except for extensions and branches | Keeps proposals grounded without over-policing creativity | ✓ Good |
| GO is context only in v1 | Adds regional context without doubling scope | ✓ Good |
| Manual station placement with light snapping | Users should feel in control of their map | ✓ Good |
| Stats stay expressive (~prefixed) and directional | Supports debate and delight without realism creep | ✓ Good |
| Sharing is unlisted by default, read-only view first | Encourages sharing without turning v1 into a social platform | ✓ Good |
| MapLibre GL + MapTiler for map rendering | Open-source, no Mapbox token, BSD-licensed | ✓ Good |
| URL hash for sharing (no backend) | Client-side only, instant sharing, no server costs | ✓ Good — works up to ~11KB payloads |
| useReducer + history wrapper for state | Clean undo/redo without external deps | ✓ Good |
| @turf/turf for geodesic calculations | Accurate distance/snapping on real coordinates | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after v1.0 milestone*
