# Roadmap: Toronto Transit Sandbox

## Overview

This roadmap turns the current scaffold into a desktop-first Toronto transit sandbox in five small, coherent phases. It starts by establishing the editor shell and proposal model, makes the city feel unmistakably Toronto, unlocks the core editing loop, adds lightweight descriptive insight, and closes by making proposals shareable outside the app.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Editor Shell and Proposal State** - Establish the desktop-first editor frame, baseline mode shell, and proposal foundation (completed 2026-04-01)
- [ ] **Phase 2: Toronto Baseline and Context Layers** - Make the map feel unmistakably local with TTC, GO, and city context
- [ ] **Phase 3: Editing Core** - Deliver the fun proposal-building loop for lines, stations, branches, and styling
- [ ] **Phase 4: Stats, Inspectors, and Comparison** - Add descriptive insight without drifting into realism-heavy tooling
- [ ] **Phase 5: Sharing, Export, and Polish** - Make proposals externally shareable and viewer-friendly

## Phase Details

### Phase 1: Editor Shell and Proposal State
**Goal**: Boot a usable desktop-first editor shell around a preloaded Toronto map and baseline toggle, with the structural foundation for proposal editing
**Depends on**: Nothing (first phase)
**Requirements**: EDTR-01, EDTR-02, EDTR-03, EDTR-04, EDTR-05
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User lands in a full-screen desktop-first editor instead of a placeholder landing page
  2. User sees a map-first workspace with visible core tools and a collapsible sidebar scaffold
  3. User can switch between Today and Future committed baseline modes
  4. Starting a proposal always begins from the preloaded Toronto map shell
**Plans**: 3 plans

Plans:
- [x] 01-01: Replace the placeholder page with the editor shell, toolbar scaffold, and sidebar scaffold
- [x] 01-02: Establish proposal/baseline state foundations and wire the Today/Future committed toggle
- [x] 01-03: Refine desktop-first layout behavior, empty states, and shell-level UX framing

### Phase 2: Toronto Baseline and Context Layers
**Goal**: Make the city itself prominent by rendering TTC, GO, and Toronto-specific context on the map
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can see the TTC rapid transit baseline on the map
  2. User can see GO as contextual connectivity without being able to edit it
  3. User can read Toronto-specific labels for neighbourhoods, major streets, landmarks, and stations
  4. User can toggle bus and streetcar corridor context on and off
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Install MapLibre, create baseline data infrastructure, and render TTC + GO layers on interactive map
- [x] 02-02-PLAN.md — Add Toronto context labels (neighbourhoods, landmarks, streets, station names) and hover tooltips
- [ ] 02-03-PLAN.md — Add bus/streetcar corridor toggle and verify complete Toronto-native map experience

### Phase 3: Editing Core
**Goal**: Make proposal creation fun by enabling new lines, extensions, branches, stations, interchanges, and styling
**Depends on**: Phase 2
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, EDIT-07, EDIT-08, EDIT-09, EDIT-10, EDIT-11, EDIT-12, STYLE-01, STYLE-02, STYLE-03, STYLE-04
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can create a new subway, LRT, or BRT line and build a multi-line proposal
  2. User can extend or branch existing TTC lines while the rest of the baseline stays locked
  3. User can place stations manually, accept or reject interchange suggestions, and keep crossings separate unless explicitly connected
  4. User can rename and recolor proposal lines and stations
  5. User can undo, redo, and delete edits without losing control of the map
**Plans**: 3 plans

Plans:
- [ ] 03-01: Implement new-line creation plus extension/branch flows against the proposal model
- [ ] 03-02: Implement route shaping, manual station placement, shared stations, and explicit interchange logic
- [ ] 03-03: Add naming, coloring, snapping/suggestion polish, and undo/redo/delete support

### Phase 4: Stats, Inspectors, and Comparison
**Goal**: Make proposals feel richer than drawings through lightweight inspectors, live stats, and baseline comparison
**Depends on**: Phase 3
**Requirements**: STATS-01, STATS-02, STATS-03, STATS-04, STATS-05, STATS-06
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can inspect line details in the sidebar
  2. User can inspect station details in the sidebar
  3. User sees live descriptive stats for the proposal and relevant lines
  4. User can compare the proposal against the baseline through a before/after toggle
**Plans**: 3 plans

Plans:
- [ ] 04-01: Build line and station inspector surfaces in the sidebar
- [ ] 04-02: Implement descriptive stats formulas and live stat presentation
- [ ] 04-03: Add before/after comparison behavior and polish the insights UX tone

### Phase 5: Sharing, Export, and Polish
**Goal**: Make proposals externally shareable through image export, unlisted links, read-only viewing, and edit-as-copy
**Depends on**: Phase 4
**Requirements**: SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-05, SHARE-06, SHARE-07
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can title a proposal and optionally attach a display name
  2. User can export a clean image of the proposal
  3. User can create an unlisted link that opens in read-only view mode first
  4. A viewer can create their own editable copy from a shared proposal
  5. First-time onboarding/tooltips help new users without taking over the map
**Plans**: 3 plans

Plans:
- [ ] 05-01: Add proposal metadata, read-only shared view mode, and edit-as-copy flow
- [ ] 05-02: Implement clean image export and unlisted share-link generation
- [ ] 05-03: Add lightweight onboarding/tooltips and final UX polish for sharing flows

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Editor Shell and Proposal State | 3/3 | Complete   | 2026-04-01 |
| 2. Toronto Baseline and Context Layers | 1/3 | In Progress|  |
| 3. Editing Core | 0/3 | Not started | - |
| 4. Stats, Inspectors, and Comparison | 0/3 | Not started | - |
| 5. Sharing, Export, and Polish | 0/3 | Not started | - |
