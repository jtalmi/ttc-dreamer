# Requirements: Toronto Transit Sandbox

**Defined:** 2026-03-31
**Core Value:** Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Editor Shell

- [x] **EDTR-01**: User can open a desktop-first full-screen editor workspace
- [x] **EDTR-02**: User sees a map-first workspace with visible core editing tools
- [x] **EDTR-03**: User can open and collapse a sidebar for inspectors and stats without losing the map
- [x] **EDTR-04**: User can switch the baseline between Today and Future committed
- [x] **EDTR-05**: Every proposal starts from a preloaded Toronto map instead of a blank canvas

### Toronto Context

- [x] **MAP-01**: User sees the TTC rapid transit baseline rendered on the map
- [x] **MAP-02**: User sees GO lines and stations as context only, not editable infrastructure
- [x] **MAP-03**: User sees Toronto context labels for neighbourhoods, major streets, landmarks, and stations
- [x] **MAP-04**: User can toggle major bus and streetcar corridor context on and off

### Proposal Editing

- [x] **EDIT-01**: User can create a new subway, LRT, or BRT line
- [x] **EDIT-02**: User can extend an existing TTC line from an existing endpoint
- [x] **EDIT-03**: User can branch an existing TTC line
- [x] **EDIT-04**: User can build a multi-line proposal, not just a single isolated line
- [x] **EDIT-05**: Existing TTC infrastructure stays fixed except for allowed extensions and branches
- [x] **EDIT-06**: User can draw a route and then clean up or adjust its geometry afterward
- [x] **EDIT-07**: User can place stations manually
- [x] **EDIT-08**: User can use shared stations across multiple lines
- [x] **EDIT-09**: Crossing lines do not auto-connect unless the user confirms an interchange
- [x] **EDIT-10**: When a new station is near an existing one, the app can suggest an interchange for the user to confirm or reject
- [x] **EDIT-11**: Editing offers light snapping and guidance without forcing geometry or station placement
- [x] **EDIT-12**: User can undo, redo, and delete editing actions

### Naming & Styling

- [x] **STYLE-01**: User can name new lines
- [x] **STYLE-02**: User can name new stations
- [x] **STYLE-03**: User can customize proposal line colors
- [x] **STYLE-04**: New proposal lines start with a distinct default color while existing TTC names remain unchanged

### Stats & Inspectors

- [x] **STATS-01**: User can inspect line details in a sidebar inspector
- [x] **STATS-02**: User can inspect station details in a sidebar inspector
- [x] **STATS-03**: User sees live proposal-level and line-level descriptive stats in the sidebar
- [x] **STATS-04**: Stats include speed/travel time, average stop spacing, estimated cost, and estimated ridership
- [x] **STATS-05**: Stats can also surface station count, line length, and connection/interchange counts
- [x] **STATS-06**: User can compare the proposal against the baseline with a before/after toggle

### Sharing & Onboarding

- [x] **SHARE-01**: User can give a proposal a map title
- [x] **SHARE-02**: User can optionally add a display name
- [x] **SHARE-03**: User can export a clean image of the proposal
- [x] **SHARE-04**: User can create an unlisted share link
- [x] **SHARE-05**: Shared proposals open in read-only view mode first
- [x] **SHARE-06**: A viewer can make their own editable copy from a shared proposal
- [x] **SHARE-07**: First-time users get lightweight onboarding or tooltips that do not dominate the map

## v2 Requirements

Requirements for v2.0 milestone: UI Revamp & Data Accuracy.

### Layout & Controls

- [x] **LAYOUT-01**: User sees a full-screen map canvas with no fixed header or nav bar
- [x] **LAYOUT-02**: User can switch drawing tools via a floating toolbar overlaid on the map
- [x] **LAYOUT-03**: User can toggle map layers (baseline mode, corridors) via a floating layer picker

### Drawing Model

- [x] **DRAW-01**: User can click on the map to place a station; consecutive stations auto-connect via a line
- [x] **DRAW-02**: User can click on an existing line to insert a new station mid-line
- [x] **DRAW-03**: User can click on a line terminus to extend or branch that line
- [x] **DRAW-04**: When a new station is placed near an existing station (proposal or baseline), an interchange is auto-created

### Station Interaction

- [x] **STATION-01**: User can drag a newly created proposal station to reposition it, and connected line geometry updates
- [ ] **STATION-02**: When a station is placed, a name is auto-suggested based on nearest street/intersection data
- [ ] **STATION-03**: User sees an inline name popover on station creation pre-filled with the street-based suggestion

### Sidebar

- [x] **SIDE-01**: Sidebar defaults to a line list view showing all proposal lines with colors
- [ ] **SIDE-02**: Clicking a station on the map loads station info (name, address, connected lines) in the sidebar
- [ ] **SIDE-03**: Clicking a line on the map loads line info (name, color, stations, stats) in the sidebar

### Baseline Data

- [x] **BASE-01**: TTC line coordinates are accurate and lines pass directly through station dots
- [x] **BASE-02**: Eglinton Crosstown and Finch West LRT shown as operational; Ontario Line shown as under construction
- [x] **BASE-03**: All current TTC rapid transit lines are represented in the baseline

## v3 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Deferred Expansion

- **GO-01**: User can edit GO infrastructure instead of using it as context only
- **TEXT-01**: User can attach richer written rationale or annotations to a proposal
- **AI-01**: User can start from prompt-driven challenges or generated proposal ideas
- **COMM-01**: User can publish to an in-app gallery or community surface
- **KBD-01**: User sees keyboard shortcut hints in toolbar tooltips on hover

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Official planning-grade forecasting | Conflicts with the fun-first goal and would dominate scope |
| Strict realism warnings or constraints | Manual creativity should not be blocked |
| In-app public social network | Unlisted sharing is the validation path |
| Mobile-first editor | Creation target is explicitly desktop-first |
| Blank-canvas start | The core promise begins from Toronto's existing network |
| Editable baseline TTC renames or arbitrary deletions | Baseline infrastructure stays fixed except for extensions/branches |
| Dragging baseline TTC stations | Baseline is read-only by design |
| Auto-routing lines along streets | Removes user control; contradicts manual-first principle |
| Real-time collaboration | Requires backend; client-only is intentional |
| Floating sidebar | Figma reversed this after backlash; anchored is better |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDTR-01 | Phase 1 | Complete |
| EDTR-02 | Phase 1 | Complete |
| EDTR-03 | Phase 1 | Complete |
| EDTR-04 | Phase 1 | Complete |
| EDTR-05 | Phase 1 | Complete |
| MAP-01 | Phase 2 | Complete |
| MAP-02 | Phase 2 | Complete |
| MAP-03 | Phase 2 | Complete |
| MAP-04 | Phase 2 | Complete |
| EDIT-01 | Phase 3 | Complete |
| EDIT-02 | Phase 3 | Complete |
| EDIT-03 | Phase 3 | Complete |
| EDIT-04 | Phase 3 | Complete |
| EDIT-05 | Phase 3 | Complete |
| EDIT-06 | Phase 3 | Complete |
| EDIT-07 | Phase 3 | Complete |
| EDIT-08 | Phase 3 | Complete |
| EDIT-09 | Phase 3 | Complete |
| EDIT-10 | Phase 3 | Complete |
| EDIT-11 | Phase 3 | Complete |
| EDIT-12 | Phase 3 | Complete |
| STYLE-01 | Phase 3 | Complete |
| STYLE-02 | Phase 3 | Complete |
| STYLE-03 | Phase 3 | Complete |
| STYLE-04 | Phase 3 | Complete |
| STATS-01 | Phase 4 | Complete |
| STATS-02 | Phase 4 | Complete |
| STATS-03 | Phase 4 | Complete |
| STATS-04 | Phase 4 | Complete |
| STATS-05 | Phase 4 | Complete |
| STATS-06 | Phase 4 | Complete |
| SHARE-01 | Phase 5 | Complete |
| SHARE-02 | Phase 5 | Complete |
| SHARE-03 | Phase 5 | Complete |
| SHARE-04 | Phase 5 | Complete |
| SHARE-05 | Phase 5 | Complete |
| SHARE-06 | Phase 5 | Complete |
| SHARE-07 | Phase 5 | Complete |
| BASE-01 | Phase 6 | Complete |
| BASE-02 | Phase 6 | Complete |
| BASE-03 | Phase 6 | Complete |
| LAYOUT-01 | Phase 7 | Complete |
| LAYOUT-02 | Phase 7 | Complete |
| LAYOUT-03 | Phase 7 | Complete |
| SIDE-01 | Phase 7 | Complete |
| DRAW-01 | Phase 8 | Complete |
| DRAW-02 | Phase 8 | Complete |
| DRAW-03 | Phase 8 | Complete |
| STATION-01 | Phase 9 | Complete |
| DRAW-04 | Phase 9 | Complete |
| SIDE-02 | Phase 9 | Pending |
| SIDE-03 | Phase 9 | Pending |
| STATION-02 | Phase 10 | Pending |
| STATION-03 | Phase 10 | Pending |

**v1 Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

**v2 Coverage:**
- v2 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-04-01 after v2.0 roadmap creation*
