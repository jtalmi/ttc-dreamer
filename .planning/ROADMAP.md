# Roadmap: Toronto Transit Sandbox

## Milestones

- ✅ **v1.0 MVP** - Phases 1-5 (shipped 2026-04-01)
- 🚧 **v2.0 UI Revamp & Data Accuracy** - Phases 6-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) - SHIPPED 2026-04-01</summary>

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Editor Shell and Proposal State** - Establish the desktop-first editor frame, baseline mode shell, and proposal foundation (completed 2026-04-01)
- [x] **Phase 2: Toronto Baseline and Context Layers** - Make the map feel unmistakably local with TTC, GO, and city context (completed 2026-04-01)
- [x] **Phase 3: Editing Core** - Deliver the fun proposal-building loop for lines, stations, branches, and styling (gap closure in progress) (completed 2026-04-01)
- [x] **Phase 4: Stats, Inspectors, and Comparison** - Add descriptive insight without drifting into realism-heavy tooling (completed 2026-04-01)
- [x] **Phase 5: Sharing, Export, and Polish** - Make proposals externally shareable and viewer-friendly (completed 2026-04-01)

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
- [x] 02-03-PLAN.md — Add bus/streetcar corridor toggle and verify complete Toronto-native map experience

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
**Plans**: 6 plans (3 original + 3 gap closure)

Plans:
- [x] 03-01: Implement new-line creation plus extension/branch flows against the proposal model
- [x] 03-02: Implement route shaping, manual station placement, shared stations, and explicit interchange logic
- [x] 03-03: Add naming, coloring, snapping/suggestion polish, and undo/redo/delete support
- [x] 03-04-PLAN.md — Wire extend/branch detection (EDIT-02, EDIT-03): import detectLineHitType, pass onStartExtend from editor-shell
- [x] 03-05-PLAN.md — Wire waypoint drag for geometry adjustment (EDIT-06): waypoint vertex layer + drag dispatch moveWaypoint
- [x] 03-06-PLAN.md — Fix shared station merging in confirmInterchange (EDIT-08): merge lineIds instead of creating duplicate

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
- [x] 04-01-PLAN.md — Build stat computation layer (TDD) and extend proposal state with inspector/comparison types
- [x] 04-02-PLAN.md — Create inspector and stats panel components, wire inspect tool and sidebar routing
- [x] 04-03-PLAN.md — Add before/after comparison toggle with proposal opacity control and verification checkpoint

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
- [x] 05-01-PLAN.md — Create sharing types, serialization utilities, reducer actions (updateTitle, loadDraft), and tests
- [x] 05-02-PLAN.md — Build Share modal, inline title editing, image export, and share link generation
- [x] 05-03-PLAN.md — Add shared view mode, edit-as-copy flow, and onboarding tooltips

</details>

### v2.0 UI Revamp & Data Accuracy (In Progress)

**Milestone Goal:** Transform the sandbox into a full-screen, Excalidraw-style map editor with intuitive station-first drawing, floating toolbars, and corrected baseline transit data.

- [x] **Phase 6: Baseline Data Correction** - Replace GeoJSON files with accurate TTC geometry and updated line statuses (completed 2026-04-01)
- [x] **Phase 7: Full-Screen Layout and Floating Toolbars** - Remove fixed header, float drawing and layer controls over the map, default sidebar to line list (completed 2026-04-01)
- [ ] **Phase 8: Station-First Drawing Model** - Rewrite drawing session so stations are the atomic unit and lines auto-connect between them
- [ ] **Phase 9: Station Drag, Auto-Interchange, and Sidebar Panels** - Enable station repositioning with live geometry, auto-interchanges at proposal crossings, and click-to-inspect panels
- [ ] **Phase 10: Auto-Generated Station Names** - Suggest street-based names via Nominatim reverse geocoding at station placement time

## Phase Details

### Phase 6: Baseline Data Correction
**Goal**: Users see an accurate TTC baseline where lines pass through station dots, operational lines appear in service colors, and construction-phase lines are visually distinct
**Depends on**: Phase 5
**Requirements**: BASE-01, BASE-02, BASE-03
**Success Criteria** (what must be TRUE):
  1. TTC line paths visually run through their station dots with no visible offset or gap
  2. Eglinton Crosstown and Finch West LRT appear in the same operational style as Lines 1 and 2
  3. Ontario Line appears with a dashed or visually distinct under-construction style
  4. All current TTC rapid transit lines (Lines 1, 2, 3, 4, 5, Ontario Line) are present in the baseline
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — Add status properties to route GeoJSON, fix Line 6 color, add Ontario Line to future baseline, remove Scarborough RT stations, update types
- [x] 06-02-PLAN.md — Replace Line 5/6 station coordinates with GTFS data, add Ontario Line stations, update ttc-layers.tsx rendering

### Phase 7: Full-Screen Layout and Floating Toolbars
**Goal**: Users experience a map-first editor with no fixed header — drawing tools and layer controls float over the canvas, and the sidebar defaults to showing all proposal lines
**Depends on**: Phase 6
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, SIDE-01
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. The map canvas fills the entire viewport with no fixed header or nav bar visible
  2. User can switch drawing tools (select, draw, add station) via a floating toolbar on the map
  3. User can toggle baseline mode and corridor overlays via a floating layer picker on the map
  4. The sidebar shows a list of proposal lines with colors when no element is selected
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Remove TopToolbar, make map full-screen, install lucide-react, add CSS tokens, create floating drawing toolbar, merge inspect into select mode
- [x] 07-02-PLAN.md — Create floating layer picker, redesign sidebar as overlay with title/share header, add toggle chevron, human verification

### Phase 8: Station-First Drawing Model
**Goal**: Users draw lines by clicking to place stations, with lines auto-connecting between consecutive stations and existing line termini acting as natural extension or branch points
**Depends on**: Phase 7
**Requirements**: DRAW-01, DRAW-02, DRAW-03
**Success Criteria** (what must be TRUE):
  1. Clicking on the map in draw mode places a station and the line auto-connects from the previous station
  2. Clicking on an existing line segment inserts a new station at that point, splitting the segment
  3. Clicking on a line terminus starts an extension or branch from that endpoint
  4. Undo steps back through station placements one at a time without breaking line geometry
**Plans**: TBD

### Phase 9: Station Drag, Auto-Interchange, and Sidebar Panels
**Goal**: Users can reposition stations by dragging, crossing proposal lines auto-create interchanges, and clicking any station or line on the map loads its details in the sidebar
**Depends on**: Phase 8
**Requirements**: STATION-01, DRAW-04, SIDE-02, SIDE-03
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Dragging a proposal station moves it and all connected line segments update to follow
  2. Placing a station near an existing proposal or baseline station automatically creates an interchange without a confirmation prompt
  3. Clicking a station on the map shows its name, address, and connected lines in the sidebar
  4. Clicking a line on the map shows its name, color, stations, and stats in the sidebar
**Plans**: TBD

### Phase 10: Auto-Generated Station Names
**Goal**: Users see a street-based name pre-filled in the station name popover at placement time, reducing manual naming effort while keeping full control
**Depends on**: Phase 8
**Requirements**: STATION-02, STATION-03
**Success Criteria** (what must be TRUE):
  1. When a station is placed, a name derived from the nearest street or intersection appears automatically
  2. An inline name popover opens at placement time with the street-based suggestion pre-filled
  3. The auto-name gracefully falls back to a placeholder when the geocoder is unavailable or rate-limited
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 7 -> 8 -> 9 -> 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Editor Shell and Proposal State | v1.0 | 3/3 | Complete | 2026-04-01 |
| 2. Toronto Baseline and Context Layers | v1.0 | 3/3 | Complete | 2026-04-01 |
| 3. Editing Core | v1.0 | 6/6 | Complete | 2026-04-01 |
| 4. Stats, Inspectors, and Comparison | v1.0 | 3/3 | Complete | 2026-04-01 |
| 5. Sharing, Export, and Polish | v1.0 | 3/3 | Complete | 2026-04-01 |
| 6. Baseline Data Correction | v2.0 | 2/2 | Complete   | 2026-04-01 |
| 7. Full-Screen Layout and Floating Toolbars | v2.0 | 2/2 | Complete   | 2026-04-01 |
| 8. Station-First Drawing Model | v2.0 | 0/TBD | Not started | - |
| 9. Station Drag, Auto-Interchange, and Sidebar Panels | v2.0 | 0/TBD | Not started | - |
| 10. Auto-Generated Station Names | v2.0 | 0/TBD | Not started | - |
