# Project Research Summary

**Project:** Toronto Transit Sandbox
**Domain:** Desktop-first transit map sandbox
**Researched:** 2026-03-31
**Confidence:** MEDIUM

## Executive Summary

This project is best treated as a map-first creative sandbox, not as a transit-planning simulator. The strongest product signal across `docs/product/*` and `AGENTS.md` is fast, satisfying creation on top of unmistakably Toronto-specific context, with sharing built in from the start but community features deferred.

The installed repo stack already fits that direction well: Next.js 16, React 19, TypeScript 5, Tailwind 4, and a GSD-driven planning loop. The main architectural imperative is to define a clean proposal domain model before feature UI sprawls across the app. The main delivery risk is drifting toward realism-heavy dashboards or generic map tooling instead of a bold Toronto-native editor.

## Key Findings

### Recommended Stack

Build on the current Next.js 16 + React 19 + TypeScript 5 scaffold, and keep the early architecture narrow: route shell, editor components, typed proposal state, derived stats, and only the minimum persistence/export surface needed later for sharing.

**Core technologies:**
- Next.js 16.2.1: app shell, routing, and eventual share/view routes
- React 19.2.4: interactive editor surfaces
- TypeScript 5.x: proposal model, geometry/state helpers, and stats formulas
- Tailwind CSS 4.x: rapid interface construction with room for a custom Toronto-forward visual system

### Expected Features

The table-stakes v1 set is clear from the source docs: Toronto baseline context, quick editing, manual station placement, descriptive stats, and shareable outputs.

**Must have (table stakes):**
- Toronto baseline context and map-first editor shell
- New line/extension/branch editing with manual stations and light suggestions
- Descriptive stats and inspectors
- Unlisted sharing plus clean image export

**Should have (competitive):**
- Strong Toronto-native context layers and vibe
- View-first shared maps with edit-as-copy

**Defer (v2+):**
- In-app social/community features
- Realism-heavy forecasting or challenge-generation flows

### Architecture Approach

Use a thin route shell over a typed proposal domain model. Keep toolbar/canvas/sidebar components focused on interaction and presentation while proposal state, stats derivation, baseline data, and sharing serialization live in `lib/` modules. This keeps the app testable and reduces later rewrites.

**Major components:**
1. Editor shell — route, toolbar, sidebar, and visual frame
2. Proposal domain model — lines, stations, segments, interchanges, baseline mode
3. Baseline/context layers — TTC, GO, labels, and optional corridor overlays
4. Derived insights — descriptive stats and before/after comparison
5. Sharing/export — serialization plus read-only share view

### Critical Pitfalls

1. **Building a planning simulator instead of a sandbox** — keep stats descriptive and fun-first
2. **Letting the sidebar dominate the experience** — keep the map clearly primary
3. **Skipping the proposal model** — define domain structures before deep UI work
4. **Over-automating edits** — keep snapping and interchange logic assistive, not mandatory
5. **Deferring sharing too late conceptually** — design proposal serialization before Phase 5

## Implications for Roadmap

Based on the source docs and current scaffold, the roadmap should stay close to the suggested five-phase structure already documented in `docs/product/phase-plan-notes.md`.

### Phase 1: Editor Shell and Proposal State
**Rationale:** Establishes the map-first workspace, proposal abstractions, and baseline toggle needed by everything else
**Delivers:** Desktop shell, toolbar/sidebar scaffold, proposal model, baseline mode shell
**Addresses:** Core editor table stakes
**Avoids:** UI-before-model drift

### Phase 2: Toronto Baseline and Context Layers
**Rationale:** The city-specific differentiator should appear early, before editing depth expands
**Delivers:** TTC baseline, GO context, labels, landmarks, corridor overlays
**Uses:** Baseline/context layer modules
**Implements:** Toronto-native visual identity

### Phase 3: Editing Core
**Rationale:** Once the shell and baseline exist, the product can deliver its main fun loop
**Delivers:** New lines, extensions, branches, stations, interchanges, naming, colors, undo/redo
**Uses:** Proposal model from Phase 1
**Implements:** Explicit, assistive editing patterns

### Phase 4: Stats, Inspectors, and Comparison
**Rationale:** Descriptive feedback makes proposals feel substantial without derailing v1 into realism
**Delivers:** Line/station inspectors, live stats, before/after toggle
**Uses:** Proposal state plus derived selectors/formulas
**Implements:** Fun-first insights instead of formal planning analysis

### Phase 5: Sharing, Export, and Polish
**Rationale:** External sharing is one of the clearest success signals in the source docs
**Delivers:** Title/display name, image export, unlisted link, read-only share view, edit-as-copy, onboarding polish
**Uses:** Stable proposal serialization and share/view surfaces
**Implements:** Product validation loop through external sharing

### Phase Ordering Rationale

- The sequence follows the existing product docs, keeping phases small and shippable
- Domain model and shell precede complex editing to avoid rewrites
- Toronto context lands before deeper editing so the product feels differentiated early
- Sharing closes the loop only after creation and insight flows are coherent

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Final editor state and rendering approach selection
- **Phase 5:** Minimal persistence/share architecture for unlisted links and export

Phases with standard patterns (skip research-phase):
- **Phase 2:** Context-layer presentation once baseline data format is settled
- **Phase 4:** Derived descriptive stats from existing proposal state

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Installed stack is clear, but future rendering/persistence choices are still open |
| Features | HIGH | Source docs are explicit about v1 scope |
| Architecture | MEDIUM | High-level boundaries are clear; specific rendering/storage decisions remain open |
| Pitfalls | HIGH | Guardrails and product docs make the main failure modes obvious |

**Overall confidence:** MEDIUM

### Gaps to Address

- Rendering choice for the map/editor canvas should be locked during Phase 1 planning
- Share persistence/storage scope should stay minimal and phase-gated

## Sources

### Primary (HIGH confidence)
- `docs/product/gsd-idea.md` — Product framing and milestone outline
- `docs/product/product-spec.md` — v1 behaviors and exclusions
- `docs/product/ui-vision.md` — layout and interaction goals
- `docs/product/phase-plan-notes.md` — phase structure and first-milestone definition
- `AGENTS.md` — product priorities and guardrails

### Secondary (MEDIUM confidence)
- `package.json` — Installed technology baseline
- `README.md` — Repo workflow expectations

---
*Research completed: 2026-03-31*
*Ready for roadmap: yes*
