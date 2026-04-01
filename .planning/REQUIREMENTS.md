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
- [ ] **EDIT-06**: User can draw a route and then clean up or adjust its geometry afterward
- [ ] **EDIT-07**: User can place stations manually
- [ ] **EDIT-08**: User can use shared stations across multiple lines
- [ ] **EDIT-09**: Crossing lines do not auto-connect unless the user confirms an interchange
- [ ] **EDIT-10**: When a new station is near an existing one, the app can suggest an interchange for the user to confirm or reject
- [ ] **EDIT-11**: Editing offers light snapping and guidance without forcing geometry or station placement
- [ ] **EDIT-12**: User can undo, redo, and delete editing actions

### Naming & Styling

- [ ] **STYLE-01**: User can name new lines
- [ ] **STYLE-02**: User can name new stations
- [ ] **STYLE-03**: User can customize proposal line colors
- [x] **STYLE-04**: New proposal lines start with a distinct default color while existing TTC names remain unchanged

### Stats & Inspectors

- [ ] **STATS-01**: User can inspect line details in a sidebar inspector
- [ ] **STATS-02**: User can inspect station details in a sidebar inspector
- [ ] **STATS-03**: User sees live proposal-level and line-level descriptive stats in the sidebar
- [ ] **STATS-04**: Stats include speed/travel time, average stop spacing, estimated cost, and estimated ridership
- [ ] **STATS-05**: Stats can also surface station count, line length, and connection/interchange counts
- [ ] **STATS-06**: User can compare the proposal against the baseline with a before/after toggle

### Sharing & Onboarding

- [ ] **SHARE-01**: User can give a proposal a map title
- [ ] **SHARE-02**: User can optionally add a display name
- [ ] **SHARE-03**: User can export a clean image of the proposal
- [ ] **SHARE-04**: User can create an unlisted share link
- [ ] **SHARE-05**: Shared proposals open in read-only view mode first
- [ ] **SHARE-06**: A viewer can make their own editable copy from a shared proposal
- [ ] **SHARE-07**: First-time users get lightweight onboarding or tooltips that do not dominate the map

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Deferred Expansion

- **GO-01**: User can edit GO infrastructure instead of using it as context only
- **TEXT-01**: User can attach richer written rationale or annotations to a proposal
- **AI-01**: User can start from prompt-driven challenges or generated proposal ideas
- **COMM-01**: User can publish to an in-app gallery or community surface

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Official planning-grade forecasting | Conflicts with the fun-first v1 goal and would dominate scope |
| Strict realism warnings or constraints | Manual creativity should not be blocked in v1 |
| In-app public social network in v1 | Unlisted sharing is the v1 validation path |
| Mobile-first editor | Creation target is explicitly desktop-first |
| Blank-canvas start | The core promise begins from Toronto's existing network |
| Editable baseline TTC renames or arbitrary deletions | Baseline infrastructure should stay fixed except for extensions/branches |

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
| EDIT-06 | Phase 3 | Pending |
| EDIT-07 | Phase 3 | Pending |
| EDIT-08 | Phase 3 | Pending |
| EDIT-09 | Phase 3 | Pending |
| EDIT-10 | Phase 3 | Pending |
| EDIT-11 | Phase 3 | Pending |
| EDIT-12 | Phase 3 | Pending |
| STYLE-01 | Phase 3 | Pending |
| STYLE-02 | Phase 3 | Pending |
| STYLE-03 | Phase 3 | Pending |
| STYLE-04 | Phase 3 | Complete |
| STATS-01 | Phase 4 | Pending |
| STATS-02 | Phase 4 | Pending |
| STATS-03 | Phase 4 | Pending |
| STATS-04 | Phase 4 | Pending |
| STATS-05 | Phase 4 | Pending |
| STATS-06 | Phase 4 | Pending |
| SHARE-01 | Phase 5 | Pending |
| SHARE-02 | Phase 5 | Pending |
| SHARE-03 | Phase 5 | Pending |
| SHARE-04 | Phase 5 | Pending |
| SHARE-05 | Phase 5 | Pending |
| SHARE-06 | Phase 5 | Pending |
| SHARE-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
