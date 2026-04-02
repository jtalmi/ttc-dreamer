# Milestones

## v2.0 UI Revamp & Data Accuracy (Shipped: 2026-04-02)

**Phases completed:** 5 phases, 9 plans, 12 tasks

**Key accomplishments:**

- Status property added to all TTC route features, Line 5/6 colors corrected to official TTC values, Ontario Line hand-authored into future baseline, and 5 decommissioned Scarborough RT stations removed from today baseline
- GTFS-sourced Line 5 (25 stations) and Line 6 (18 stations) coordinates replace inaccurate ArcGIS data in both baselines, Ontario Line (15 stations) added to future baseline, and ttc-layers.tsx renders Ontario Line with dashed blue construction style
- One-liner:
- One-liner:
- DrawingSession
- Station-first drawing wired into map click handlers: clicks place stations with auto-connect, double-click finishes, undo steps back through stations, empty-map click auto-creates a line, terminus click extends from last station
- One-liner:
- Nominatim reverse geocoding wired into all 4 station placement paths; popover shows street-based name (e.g. "King St W & Spadina Ave") replacing "Station N" placeholder within ~1s

---

## v1.0 MVP (Shipped: 2026-04-01)

**Phases completed:** 5 phases, 18 plans, 26 tasks

**Key accomplishments:**

- Typed proposal draft and editor shell state module using BaselineMode, ToolMode, ProposalDraft, and a useReducer-ready proposalEditorReducer
- Full-screen desktop editor shell with IBM Plex Sans tokens, toolbar scaffold (Select/Draw Line/Add Station/Inspect), Toronto-forward map stage placeholder, and 320/64px collapsible sidebar
- React useReducer-backed EditorShell with BaselineToggle replaces the placeholder route, giving / a fully interactive Phase 1 editor chrome
- MapLibre GL map with TTC Lines 1/2/4/5/6 in brand colors and GO Transit dashed context layer, loaded from City of Toronto ArcGIS GeoJSON
- MapLibre symbol layers for neighbourhood, landmark, street, and station labels with TTC station hover tooltip, wired into TorontoMap in correct stacking order
- One-liner:
- Interactive line drawing with click-to-place waypoints, ghost segment cursor, undo/redo history, and sidebar UI backed by extended ProposalDraft type system and @turf/turf geometry helpers
- Station placement with snapToSegment snapping, interchange suggestion badge (auto-dismiss 8s), select-move station dragging, snap cue ring overlay, and StationNamePopover backed by extended reducer actions
- Completed the editing core loop: keyboard undo/redo (Cmd/Ctrl+Z), Delete key with confirmation dialog (UI-SPEC copy), and inline line name/color editing in the sidebar
- detectLineHitType wired from toronto-map.tsx into proposal editor via onStartExtend, with AddLineAction extended to carry parentLineId/isExtension/branchPoint for full EDIT-02/EDIT-03 gap closure
- One-liner:
- proposal-types.ts:
- LineInspectorPanel
- Toolbar before/after toggle dims proposal layers to 40% opacity with a map canvas banner using a proposalOpacity prop chain from EditorShell through TorontoMap to ProposalLayers
- URL-hash sharing serialization with Unicode-safe base64 roundtrip, slug-derived PNG filename builder, and updateTitle/loadDraft reducer actions with history support
- Share modal with PNG export, URL hash link generation, clipboard copy, and inline title editing — all wired to live MapLibre canvas via preserveDrawingBuffer
- One-liner:

---
