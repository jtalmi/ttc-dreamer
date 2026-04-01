# Project Research Summary

**Project:** Toronto Transit Sandbox — v2.0 UX Revamp
**Domain:** Interactive map editor with Excalidraw-style floating UI
**Researched:** 2026-04-01
**Confidence:** HIGH

## Executive Summary

The v2.0 work is an evolution of a working product, not a greenfield build. The existing stack (Next.js 16, React 19, MapLibre GL JS 5.21, react-map-gl 8.1, Turf.js 7.3, Vitest 4.1, `useReducer` + history wrapper) requires only two net-new npm packages: `@radix-ui/react-toolbar` for accessible toolbar primitives and `lucide-react` for icons. The dominant v2.0 theme is a layout overhaul — replacing the fixed header with a full-screen canvas and absolutely-positioned floating overlays — paired with a drawing-model upgrade that makes stations the atomic unit of line creation rather than raw waypoints.

The recommended build sequence, validated by cross-referencing architecture and pitfall research, puts layout restructuring first because all other floating UI depends on the fixed header being gone. The station-first drawing model is the highest-complexity change and must come second, as a deliberate atomic rewrite of `DrawingSession`, `proposal-types.ts`, and the map click handler — not an incremental patch. Baseline data correction (refreshing GeoJSON files from TTC open data and OSM) is independent of all code changes and should be done before any UI work lands to avoid conflating visual bugs with data bugs.

The most serious risks are technical rather than product-level. Two pitfalls can silently destroy existing user work if not addressed proactively: (1) a schema version bump is required whenever `ProposalLineDraft` or `ProposalStationDraft` fields change, otherwise all previously-shared URLs decode silently to blank maps; (2) the station-first drawing model must designate a single canonical geometry source — either waypoints OR station positions, never both — or undo, drag, and stats will drift in ways that are hard to debug. Both constraints must be resolved before any drawing-model PR merges.

## Key Findings

### Recommended Stack

The v1.0 stack is production-validated and unchanged. The v2.0 additions are minimal by design. Two new npm production dependencies are justified: `@radix-ui/react-toolbar` provides accessible keyboard navigation, ARIA roles, and toggle group semantics for the floating toolbar, avoiding hand-rolled accessibility work. `lucide-react` provides 1,300+ tree-shakable SVG icons suited to a transit editor aesthetic. All other v2.0 behavior — floating panel positioning, station interaction, geometry updates — is handled by CSS and the existing MapLibre/React stack.

**Core technologies (existing, validated):**
- `maplibre-gl` + `react-map-gl`: Map canvas, layer rendering, click/drag event handling
- `@turf/turf`: Geometry helpers — snap, proximity, waypoint derivation
- `useReducer` + `historyReducer`: All editor state and undo/redo — no state management library needed
- `Vitest`: Domain logic and geometry unit tests

**New additions:**
- `@radix-ui/react-toolbar ^1.1`: Accessible floating toolbar primitives — avoids hand-rolling keyboard nav and ARIA
- `lucide-react ^1.7`: Icon set — tree-shakable, React 19 compatible
- Nominatim OSM API (HTTP, no package): Reverse geocoding for auto-generated station names — free, no API key, capped at 1 req/sec

**Explicitly rejected:**
- `terra-draw` / `maplibre-geoman`: Generic geometry tools that cannot express the station-first domain model with its business rules
- `@floating-ui/react`: For anchor-relative tooltips, not fixed-corner overlay panels — CSS `absolute` is sufficient
- Zustand / Jotai: Existing `useReducer` pattern is validated and sufficient

### Expected Features

**Must have — v2.0 launch (P1):**
- Full-screen map canvas — remove fixed header, everything floats; highest visual impact, unblocks all floating UI
- Floating drawing toolbar — tool picker overlaid on canvas; restores tool access after header removal
- Floating map layer picker — baseline/corridor toggles as floating card; replaces right-side header controls
- Corrected TTC baseline data — Eglinton Crosstown operational, Ontario Line under construction, accurate coordinates
- Sidebar default as line list — remains in list view during drawing; drawing status shown inline in active line row

**Should have — v2.0 or immediate follow-on (P2):**
- Station-first drawing model — click to place station, line auto-connects; most complex change, best after layout settles
- Auto-interchange detection at proposal line intersections — extends existing mechanism to proposal-on-proposal detection
- Auto-generated station names from Nominatim reverse geocoding — Toronto-native differentiator; fully independent
- Drag to reposition station with connected geometry update — most complex feature; validate other changes first

**Defer to v3+ (P3):**
- Keyboard shortcut hints in toolbar tooltips — polish pass
- Ortho-snap / octilinear constraint toggle — only if users request schematic output

**Anti-features (do not build):**
- Fully floating sidebar — Figma reversed this after user backlash; anchored sidebar is more predictable
- Auto-routing lines along corridors — removes user control; contradicts the manual-first product principle
- Real-time collaboration — requires a backend; client-only is an intentional v1/v2 constraint

### Architecture Approach

The architecture is a refactor within the existing component tree, not a rewrite. `EditorShell` retains ownership of all state. `MapStage` (already `position: relative`) becomes the anchor for all floating UI — `FloatingDrawingToolbar` and `FloatingLayerPicker` are added as `absolute`-positioned children via the existing `mapChildren` slot. `TopToolbar` is removed entirely. The station-first model change is scoped to three files: `proposal-types.ts` (type change), `proposal-state.ts` (new actions), and `proposal-geometry.ts` (new `deriveWaypointsFromStations` helper). Baseline data correction touches only `public/data/*.geojson` files and a paint expression in `ttc-layers.tsx`.

**Major components and v2.0 status:**
1. `EditorFrame` — MODIFY: remove TopToolbar render; MapStage fills full viewport height
2. `TopToolbar` — REMOVE: replaced by two new floating components
3. `FloatingDrawingToolbar` (NEW) — tool selector pill, `position: absolute` inside MapStage
4. `FloatingLayerPicker` (NEW) — baseline/corridor toggle card, `position: absolute` inside MapStage
5. `proposal-types.ts` — MODIFY: `DrawingSession.waypoints` becomes `DrawingSession.stationIds`
6. `proposal-state.ts` — MODIFY: new `placeStationOnLine` action; `moveStation` recomputes connected waypoints
7. `proposal-geometry.ts` — MODIFY: add `deriveWaypointsFromStations()` helper; update `buildInProgressGeoJSON` signature
8. `public/data/*.geojson` — REPLACE: corrected coordinates; new `status` property for construction state

### Critical Pitfalls

1. **Floating toolbar swallows map click events** — Apply `pointer-events: none` to every toolbar wrapper `div`; restore `pointer-events: auto` only on interactive children (buttons, toggles). Z-index controls paint order, not event routing. Verify station placement at pixel coordinates hidden behind the toolbar bounding box.

2. **Dual geometry sources cause silent position drift** — Do not allow `DrawingSession.waypoints` and `DrawingSession.stationIds` to coexist as writeable fields. Stations must be the single canonical source; waypoints must always be derived in `buildProposalLinesGeoJSON`. Failure makes undo, drag, and stats diverge silently.

3. **New reducer actions bypass undo history** — `HISTORY_ACTIONS` in `proposal-history.ts` is a manually-maintained `Set`. Any PR adding `placeStationOnLine` or related actions must also update `HISTORY_ACTIONS` and include a Vitest test asserting undo steps back one action at a time.

4. **Schema change breaks all existing shared URLs** — Removing `waypoints` from `ProposalLineDraft` without bumping the share payload version causes old URLs to decode without error but render blank. Before any field removal, bump version (`v: 1` → `v: 2`) and add a migration function in `decode-proposal.ts`. Test with a frozen v1 JSON fixture.

5. **Station drag at 60fps blows up the MapLibre worker queue** — `setData()` serializes and re-tiles the entire FeatureCollection in a web worker. At 60fps the queue grows faster than it drains. Throttle `moveStation` dispatch to 30ms intervals. During drag, update only a visual preview; commit full state on `mouseup`.

## Implications for Roadmap

Based on the dependency graph across all four research files, a 6-phase structure is recommended:

### Phase 1: Baseline Data Correction
**Rationale:** Pure data work, no code changes, fully independent. Doing this first establishes a visual truth baseline and eliminates data bugs as a confound when UI changes land. Also establishes schema-version-bump discipline before any model changes.
**Delivers:** Accurate TTC line geometry; Eglinton Crosstown and Finch West shown as operational; Ontario Line shown under construction with dashed styling; `status` property added to future GeoJSON features.
**Addresses:** Corrected TTC baseline data (P1)
**Avoids:** GeoJSON station/route misalignment (pitfall 5); sets version-bump discipline before drawing model phase (pitfall 4)

### Phase 2: Full-Screen Layout + Floating Toolbars
**Rationale:** All floating UI depends on the fixed header being gone. This is the layout foundation for every subsequent floating component. The z-index CSS variable scale must be established here before any other overlay is built.
**Delivers:** Full-screen map canvas; `FloatingDrawingToolbar` (tool picker); `FloatingLayerPicker` (baseline/corridor toggles); CSS z-index variable scale; `TopToolbar` removed; sidebar defaults to line list.
**Addresses:** Full-screen map canvas (P1), Floating drawing toolbar (P1), Floating map layer picker (P1), Sidebar default as line list (P1)
**Stack:** `@radix-ui/react-toolbar`, `lucide-react`, CSS `absolute` positioning
**Avoids:** Toolbar swallowing map clicks — `pointer-events: none` on wrappers (pitfall 1); z-index collisions — define CSS variable scale first (pitfall 8)

### Phase 3: Station-First Drawing Model
**Rationale:** Most invasive code change; must be done atomically. The dual-geometry-source decision (pitfall 2) must be made at the start of this phase. All drawing model changes ship together; partial migration is worse than no migration.
**Delivers:** `DrawingSession` redesigned around `stationIds`; new `placeStationOnLine` reducer action; `deriveWaypointsFromStations` geometry helper; `buildInProgressGeoJSON` updated; share payload bumped to v2 with migration function; ghost line preview during drawing.
**Addresses:** Station-first drawing model (P2)
**Avoids:** Dual geometry sources (pitfall 2); undo skipping new actions (pitfall 3); share URL breakage (pitfall 4)

### Phase 4: Dynamic Station Drag + Connected Geometry
**Rationale:** Depends on the station-first model (stations need IDs for `moveStation` to work). The 60fps drag performance risk is the primary concern — throttle strategy and preview-vs-commit separation must be in place before any drag feature ships.
**Delivers:** `moveStation` reducer recomputes connected line waypoints; MapLibre pointer event handlers for drag; 30ms dispatch throttle; drag visual preview decoupled from committed state.
**Addresses:** Drag to reposition station (P2)
**Avoids:** Worker queue blowup from drag (pitfall 7)

### Phase 5: Auto-Generated Station Names
**Rationale:** Independent of all other features but delivers higher value once station-first drawing is in place (names are auto-suggested at placement time). Rate-limit guard and in-memory caching are mandatory before shipping.
**Delivers:** Nominatim reverse geocoding utility in `lib/`; name suggestion pre-filled in `StationNamePopover`; in-memory cache keyed by rounded coordinate (~11m precision); graceful fallback when offline or rate-limited.
**Addresses:** Auto-generated station names from Nominatim (P2)
**Stack:** Nominatim HTTP API (no npm package); Photon as documented fallback
**Avoids:** Nominatim rate limiting (pitfall 6)

### Phase 6: Auto-Interchange at Proposal Intersections
**Rationale:** Extends the existing `InterchangeSuggestion` mechanism to detect proposal-on-proposal crossings. Requires station-first model — interchanges between proposal stations only make sense when those stations are explicit entities with IDs.
**Delivers:** `placeStationOnLine` handler scans `draft.stations` (not just TTC baseline) for proximity; tight threshold auto-links without confirmation; medium threshold shows existing interchange badge prompt.
**Addresses:** Auto-interchange at proposal intersections (P2)
**Avoids:** Reuses all existing `suggestInterchange` reducer logic — low regression risk

### Phase Ordering Rationale

- Data before code: baseline correction first eliminates one class of visual bugs before UI changes land
- Layout before interaction: full-screen canvas must precede all floating UI; z-index scale must exist before any overlay is built
- Model before behavior: station-first type changes must be atomic and complete before drag or interchange depend on the new shape
- Independence last: auto-names and auto-interchange are additive with no dependents, so they follow the structural changes
- Pitfall alignment: each phase's "phase to address" guidance from PITFALLS.md aligns exactly with when that component is first touched

### Research Flags

Needs deeper research during planning:
- **Phase 3 (Station-First Drawing Model):** The `HISTORY_ACTIONS` exhaustiveness check needs a concrete design decision before implementation starts — TypeScript union-based compile-time check vs. Vitest fixture-based runtime check. This is an internal architecture decision, not external research.

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1:** Data file replacement from open data sources — no novel technology
- **Phase 2:** CSS absolute positioning + Radix UI toolbar — patterns fully documented in architecture research
- **Phase 4:** Throttled pointer events + GeoJSON source updates — patterns documented with specific thresholds in pitfall research
- **Phase 5:** Single HTTP utility with caching — straightforward; Nominatim API fully documented
- **Phase 6:** Extending existing interchange detection path — additive to existing reducer logic, no new external APIs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | v1.0 stack is production-validated. New additions verified against current npm registry and official policy docs. Terra-draw rejection is well-reasoned and supported by codebase analysis. |
| Features | HIGH | Feature landscape drawn from production editors (MetroDreamin', Excalidraw, Figma) with direct UX citations. Competitor analysis grounded in real tools. Anti-features section backed by documented reversals (Figma UI3). |
| Architecture | HIGH | Based on direct codebase analysis, not inference. Component change inventory lists specific files, props, and type shapes. Data flow diagrams match existing reducer action patterns. |
| Pitfalls | HIGH | MapLibre worker queue issue references specific issue #6154. Nominatim rate limits reference the official OSM Foundation policy page. Dual-geometry-source risk derived from actual `proposal-types.ts` field analysis. |

**Overall confidence:** HIGH

### Gaps to Address

- **Nominatim production rate limits:** The 1 req/sec policy is verified but production behavior under concurrent users is untested. Photon (photon.komoot.io) should be wired as a fallback from the start rather than retrofitted later.
- **Share payload v1 fixtures:** No frozen v1 JSON fixture currently exists in the test suite. Creating one should be one of the first acts of Phase 3 implementation — before any type changes land.
- **Sidebar drawing-status panel removal UX:** The v1 `"drawing-status"` sidebar panel provides Finish/Cancel controls. Moving these to the floating toolbar is architecturally correct, but the collapsed-sidebar + active-drawing-session edge case needs validation during Phase 2 implementation.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `components/editor/`, `lib/proposal/`, `lib/baseline/`, `lib/sharing/` — component responsibilities, type shapes, reducer action inventory
- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/ — rate limits, attribution requirements
- MapLibre GeoJSON worker issue #6154: https://github.com/maplibre/maplibre-gl-js/issues/6154 — `setData()` performance constraints
- lucide-react npm: https://www.npmjs.com/package/lucide-react — version 1.7.0 confirmed April 2026

### Secondary (MEDIUM confidence)
- Radix UI Toolbar docs: https://www.radix-ui.com/primitives/docs/components/toolbar — React 19 compatibility confirmed
- City of Toronto ArcGIS FeatureServer Layer 11 — TTC rapid transit route GeoJSON (no explicit update date in metadata)
- OpenStreetMap Overpass API — Ontario Line geometry as "under construction" relation
- Figma UI3 floating panel reversal: https://forum.figma.com/suggest-a-feature-11/launched-fixed-panels-are-back-23789 — anti-feature justification for anchored sidebar
- Excalidraw toolbar architecture: https://deepwiki.com/excalidraw/excalidraw/4.1-actions-and-toolbars — floating toolbar patterns

### Tertiary (LOW confidence — verify during implementation)
- Photon geocoding API (photon.komoot.io) — cited as Nominatim drop-in alternative but not directly tested
- maplibre-geoman drag issue #48 — queue-merge workaround referenced but not adopted directly

---
*Research completed: 2026-04-01*
*Ready for roadmap: yes*
