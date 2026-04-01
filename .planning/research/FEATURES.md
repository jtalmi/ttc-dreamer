# Feature Research

**Domain:** Full-screen Excalidraw-style transit map editor (v2.0 UX revamp)
**Researched:** 2026-04-01
**Confidence:** HIGH (UX patterns from production editors), MEDIUM (auto-name geocoding specifics)

## Context: What v1 Already Ships

The following are already built and must not be re-researched as new features:
- Desktop editor shell (top toolbar, sidebar, map stage)
- Click-to-draw line creation with waypoints, extensions, branches
- Manual station placement with snapping and interchange suggestions
- Naming, coloring, undo/redo/delete
- Line/station inspectors, descriptive stats, before/after comparison
- PNG export, URL hash sharing, read-only view mode
- TTC/GO baseline layers with corridor toggle

---

## Feature Landscape: v2.0 New Features Only

### Table Stakes (Users Expect These)

Features users of any modern map editor expect. Missing = product feels unpolished or prototype-grade.

| Feature | Why Expected | Complexity | v1 Dependency | Notes |
|---------|--------------|------------|---------------|-------|
| Full-screen map canvas (no nav bar) | Every modern map editor — Google Maps, Figma, Excalidraw — maximizes canvas; a header consuming 48px of viewport feels dated | MEDIUM | `editor-frame.tsx`, `top-toolbar.tsx` | Remove the fixed header row; repurpose all controls as floating overlays. CSS: swap column flex layout for a single `position: relative` container with absolutely-positioned children. |
| Floating drawing toolbar (tool picker) | Figma, Excalidraw, and every whiteboard tool place drawing tools as a floating pill or vertical strip overlaid on canvas | MEDIUM | `top-toolbar.tsx` tool buttons, `chrome.activeTool` reducer state | Extract tool buttons (Select, Draw, Add Station, Inspect) into a floating panel with `position: absolute; left: 16px; top: 50%; transform: translateY(-50%)`. The reducer `setActiveTool` action is already in place. |
| Floating map layer picker | Google Maps' bottom-right layer card is industry-standard affordance for toggling basemap context. Users look for it there. | LOW | `busCorridorVisible`, `baselineMode` and the `baseline-toggle`, `corridor-layers` components | Card with checkboxes/toggles for Baseline (today vs future_committed), Bus+Streetcar Corridors, and eventually GO visibility. Position: `absolute; bottom: 40px; right: 16px`. |
| Station-first drawing: click to place station, line auto-connects | MetroDreamin', Rail Map Toolkit, and the conveyal transit editor all treat stations as the atomic unit. Drawing a line between stations is far more intuitive than placing abstract waypoints. | HIGH | `DrawingSession`, `addWaypoint` action, `ProposalStationDraft` model | Biggest v2 model change. Requires new interaction: click once = place station, line segment auto-generates between last placed and new station. Waypoints still drive GeoJSON geometry. |
| Auto-interchange detection at line intersections | Pro-level transit map tools detect crossings and offer to link stations. Users trying to build a network will manually discover intersections but expect the editor to notice them. | MEDIUM | `InterchangeSuggestion` type and pending interchange state already exist | Extend intersection-detection logic (currently proximity-based) to detect when a new station lands near any existing proposal station (not just TTC baseline), and trigger the same `pendingInterchangeSuggestion` flow. |
| Sidebar default as line list with inline info | Every design tool (Figma layers panel, Excalidraw element list) defaults the side panel to a structured list of elements, not a creation form. The v1 `list` panel satisfies this but the "create" panel takes over during line creation. | LOW | `LineList`, `sidebarPanel` state, existing sidebar components | Sidebar should remain in `list` panel even during active drawing, showing the drawing-status info inline within the active line row rather than taking over the full panel. |
| Drag to reposition station with geometry update | Users expect to move placed stations; any node-graph or map editor that places nodes supports dragging them. A station that can't be repositioned after placement feels broken. | HIGH | `ProposalStationDraft.position`, `proposal-geometry.ts`, `addWaypoint`/waypoints array | Requires: (1) MapLibre marker drag events or pointer-move on station symbol layer, (2) reducer action `moveStation` that updates `position` and recalculates the waypoints of all connected lines. `@turf/nearest-point-on-line` already in stack for geometry support. |

### Differentiators (Competitive Advantage)

Features that align with the core TTC-dreamer value and set this product apart from generic map editors.

| Feature | Value Proposition | Complexity | v1 Dependency | Notes |
|---------|-------------------|------------|---------------|-------|
| Auto-generated station names from street/neighbourhood data | No other transit sandbox auto-suggests "King & Spadina" or "Eglinton & Yonge" as station names from a dropped pin. This is a strong Toronto-native differentiator. | MEDIUM | `StationInspectorPanel`, `neighbourhoods.geojson` already loaded, `ProposalStationDraft.name` | Use Nominatim reverse geocoding API (`https://nominatim.openstreetmap.org/reverse`) with lat/lng to retrieve nearest road intersection. Parse `road` + cross-street from response. Fall back to neighbourhood name if no intersection found. Apply as default name on station placement, user can override. Note: Nominatim usage policy requires max 1 req/sec and a valid User-Agent — acceptable for this use pattern. |
| Corrected TTC baseline data (accurate line coordinates, updated statuses) | Eglinton Crosstown opened 2024, Finch West LRT is operational, Ontario Line is under construction. An app that shows 2015 TTC data feels abandonware. | MEDIUM | `baseline-data.ts`, `ttc-layers.tsx`, `BaselineMode` type | Update GeoJSON source data and layer symbology: Eglinton Crosstown + Finch West = solid line (operational), Ontario Line = dashed/striped (under construction). Requires sourcing accurate geometry — OpenStreetMap Toronto relations or TTC open data. |
| Inline station naming on placement (with street-data suggestion) | Excalidraw labels shapes inline on creation; this product should name stations inline rather than requiring the inspector panel. Naming feels like part of drawing, not editing. | LOW | `StationNamePopover` already exists but fires as a follow-up step | Wire the name suggestion from reverse geocoding as the pre-filled default in the inline popover so the user can accept or override in one tap. |
| Keyboard shortcut surface visible in toolbar | Pro tools expose keyboard shortcuts as tooltips on hover. Toronto transit nerds using this regularly will want shortcuts for tool switching. | LOW | Keyboard shortcuts for undo/redo/delete/escape already implemented in `editor-shell.tsx` | Add tooltip showing shortcut key (e.g. "V", "D", "S") on each floating toolbar button via `title` attribute or custom tooltip. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Fully floating sidebar (like Figma UI3 pre-revert) | Feels modern, maximizes canvas | Figma reversed this after user backlash — floating side panels crowd the canvas and obscure map content during active editing. Sidebar at a fixed edge is more predictable. | Keep sidebar anchored to right edge, collapsible. Only the *toolbar* and *layer picker* should float over the map. |
| Auto-routing lines along streets/transit corridors | Seems like it would save drawing effort | Removes user control; auto-routed lines may not express the user's creative intent; adds significant algorithmic complexity (not warranted for v1). | Keep manual waypoint placement. Light snapping is sufficient. |
| Snap-to-grid or octilinear constraint (45°/90° only) | Classic schematic transit map aesthetic | Constrains geographic accuracy, which is a core differentiator of this product over schematic-only tools. Users should be able to express approximate real-world routing. | Offer manual ortho-snap toggle later if requested. |
| Real-time collaboration/multiplayer editing | Looks like a modern feature | Requires a backend (this is intentionally client-only). Introduces merge-conflict complexity. Out of scope for v2. | URL-hash sharing + edit-as-copy covers the share-and-remix use case without backend. |
| Undo/redo moved to floating UI | Some editors surface undo in a floating undo history panel | Undo/redo is already keyboard-driven (Cmd+Z). Adding floating buttons would duplicate the existing toolbar buttons and waste canvas space. | Keep keyboard shortcuts; add subtle undo/redo buttons to the floating drawing toolbar only when a drawing session is active. |
| Auto-naming from AI/LLM | Sounds like a differentiator | Adds network dependency, latency, and cost. The street-intersection-based approach is faster, free, and more Toronto-authentic. | Reverse geocoding from Nominatim is accurate, instant, and free (within usage policy). |

---

## Feature Dependencies

```
Full-screen map canvas
    └──enables──> Floating drawing toolbar (floating only works if no fixed header)
    └──enables──> Floating map layer picker

Station-first drawing model
    └──requires──> New reducer action: placeStation (replaces addWaypoint for explicit station creation)
    └──requires──> Auto-connect geometry (create/extend line segment between consecutive placed stations)
    └──enables──> Auto-interchange detection (detect intersection with existing proposal stations, not just TTC baseline)

Auto-generated station names
    └──requires──> Reverse geocoding call on station placement (Nominatim or MapTiler Geocoding API)
    └──enhances──> Inline station naming (StationNamePopover already exists)

Drag to reposition station
    └──requires──> moveStation reducer action (new)
    └──requires──> Connected waypoints update: walk all lines with this stationId, replace nearest waypoint(s)
    └──requires──> proposal-geometry.ts update (recalculate derived GeoJSON after position change)

Corrected TTC baseline data
    └──requires──> Updated GeoJSON sources in baseline-data.ts
    └──requires──> Updated ttc-layers.tsx symbology for construction vs operational status
    └──no new UI components needed──>

Sidebar redesign (line list as default + inline drawing status)
    └──requires──> sidebarPanel logic change: drawing-status shown inline in list, not as full panel takeover
    └──enhances──> station-first drawing model (users see line list as they place stations)
```

### Dependency Notes

- **Full-screen canvas must come first** — the floating toolbar and layer picker are only viable after the fixed header row is removed. Implementing floating toolbars on top of a fixed header creates z-index mess and layout conflicts.
- **Station-first drawing requires a model change** — the current `DrawingSession` model stores `waypoints: [number, number][]` without station references. Station-first drawing needs stations created explicitly (with IDs) during the drawing session, not retroactively after waypoints are committed. This is a reducer and type change, not just a UI change.
- **Drag-to-reposition requires geometry recalculation** — `proposal-geometry.ts` derives GeoJSON from waypoints. Moving a station means identifying which waypoints on which lines correspond to that station's position and updating them, then re-deriving the line GeoJSON. This is the most complex v2 feature.
- **Auto-name generation is independent** — can be added to any station creation path without blocking other features.
- **Baseline data correction is independent** — data-only change, no new UI component required.

---

## MVP Definition for v2.0

### Launch With (v2.0)

- [ ] Full-screen map canvas — remove fixed header, everything floats — *highest visual impact, unblocks other floating UI*
- [ ] Floating drawing toolbar — tools and undo accessible from map — *restores tool access after header removal*
- [ ] Floating map layer picker — baseline toggle, corridor toggle, layer visibility — *restores context controls after header removal*
- [ ] Corrected TTC baseline data — accurate coordinates, updated line statuses — *data accuracy, no model changes required*
- [ ] Sidebar default as line list with inline drawing status — *UX improvement, low-risk change*

### Add After Core Layout Ships (v2.x)

- [ ] Station-first drawing model — *high complexity, model-level change; best after layout is settled*
- [ ] Auto-interchange at proposal line intersections — *depends on station-first drawing to be meaningful*
- [ ] Auto-generated station names from Nominatim — *independent, can ship separately*
- [ ] Drag to reposition station — *most complex feature, should validate other changes first*

### Future Consideration (v3+)

- [ ] Inline keyboard shortcut hints in toolbar tooltips — *polish, not blocking*
- [ ] Ortho-snap toggle (octilinear constraint) — *only if users request schematic output*

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Full-screen map canvas | HIGH | MEDIUM | P1 |
| Floating drawing toolbar | HIGH | LOW | P1 |
| Floating map layer picker | HIGH | LOW | P1 |
| Corrected TTC baseline data | HIGH | MEDIUM | P1 |
| Sidebar redesign (list default, inline status) | MEDIUM | LOW | P1 |
| Station-first drawing model | HIGH | HIGH | P2 |
| Auto-interchange at proposal intersections | MEDIUM | MEDIUM | P2 |
| Auto-generated station names (Nominatim) | HIGH | MEDIUM | P2 |
| Drag to reposition station | HIGH | HIGH | P2 |
| Keyboard shortcut hints in toolbar | LOW | LOW | P3 |

**Priority key:**
- P1: Must ship in v2.0 milestone
- P2: Should ship in v2.0, defer if timeline slips
- P3: Polish pass or v2.1

---

## Competitor Feature Analysis

| Feature | MetroDreamin' | Rail Map Toolkit | Our v2 Approach |
|---------|---------------|------------------|-----------------|
| Canvas layout | Map fills viewport, controls float | Schematic canvas, separate controls | Full-screen map with floating overlays |
| Drawing model | Station-first, click to place | Station-first, grid-snapped | Station-first with geographic coordinates |
| Layer control | Minimal | Style picker | Floating Google Maps-style layer card |
| Sidebar | Persistent left panel | Separate configuration | Collapsible right panel, list by default |
| Station naming | Manual only | Manual only | Auto-suggest from reverse geocoding |
| Baseline data | Generic, not city-specific | Not city-specific | Toronto-accurate TTC with correct 2024 statuses |

---

## Implementation Notes Per Feature

### Full-Screen Canvas
The `editor-frame.tsx` currently renders a column flexbox: `[header][content-row]`. The v2 layout should be a single `position: relative; width: 100vw; height: 100vh` container. All floating elements use `position: absolute` with explicit `top/left/bottom/right` values. The MapLibre map should fill the container. No third-party floating library is needed (no anchor positioning requirements — all panels are fixed to viewport corners).

### Floating Drawing Toolbar
Position: vertical pill on the left edge, vertically centered. Pattern used by Figma (before UI3), Miro, and all whiteboard tools. Contains: Select, Draw, Add Station, Inspect icons with labels or tooltips. Active tool highlighted with accent background (matches existing `isActive` button styling). Keyboard shortcuts (V/D/S/I) shown as tooltip on hover.

### Floating Map Layer Picker
Position: bottom-right, above zoom controls (if any). Pattern: Google Maps' "Layers" button expands to a card. For this product: a persistent small card (not expand-on-click) listing toggleable layers. Low interaction frequency makes a persistent card preferable to a click-to-expand toggle.

### Station-First Drawing Model
Current model: `DrawingSession.waypoints` accumulates raw `[lng, lat]` pairs. Station objects are created after drawing finishes (the "Add Station" tool is separate from "Draw Line"). The v2 station-first model merges these: clicking in "Draw" mode creates a `ProposalStationDraft` immediately and appends its position to `DrawingSession.waypoints`. The last waypoint always corresponds to the last placed station. This requires a new reducer action and type changes but the existing `historyReducer` and `useReducer` pattern are the right container.

### Auto-Interchange Detection
The existing `InterchangeSuggestion` mechanism checks proximity to TTC baseline stations only. Extend it to also check proximity to existing proposal stations when a new station is placed, triggering an interchange link between proposal stations. This means `updateCursorPosition` and `addWaypoint` handlers in the reducer need to scan `draft.stations` not just baseline data.

### Nominatim Reverse Geocoding
API: `GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&zoom=17`
Response fields: `address.road`, `address.suburb`, `address.neighbourhood`
Station name strategy: `"{road} & {nearest_cross_street}"` if intersection data available, else `"{suburb}"` or `"{neighbourhood}"`. Usage policy: max 1 req/sec, must set `User-Agent` header. This is well within the rate for manual station placement. For production scale, mirror via MapTiler Geocoding API (already in use for map tiles) as a paid fallback.

### Drag to Reposition Station
MapLibre GL JS does not natively support dragging GeoJSON point features. Two implementation patterns:
1. Use `maplibre-gl` `Marker` with `draggable: true` for proposal stations — simpler, but requires rendering stations as HTML markers instead of GeoJSON symbol layers (regression from current approach).
2. Custom pointer events: `mousedown` on station feature → track `mousemove` → `mouseup` to commit. Requires the station symbol layer to be interactive (`interactive: true`). This is the pattern used by custom map editors and preserves the GeoJSON layer approach. Recommended: option 2. The `moveStation` reducer action will accept `{ stationId, newPosition }` and update `position` plus walk all lines with `stationId` in `stationIds` to replace the nearest waypoint.

---

## Sources

- Excalidraw toolbar architecture: [DeepWiki — Actions and Toolbars](https://deepwiki.com/excalidraw/excalidraw/4.1-actions-and-toolbars)
- Figma UI3 floating panel reversal: [Figma Forum — Fixed panels are back](https://forum.figma.com/suggest-a-feature-11/launched-fixed-panels-are-back-23789) | [Bitskingdom UX analysis](https://bitskingdom.com/blog/figma-floating-panels-ux-lesson/)
- Nominatim reverse geocoding API: [Nominatim docs](https://nominatim.org/release-docs/latest/api/Reverse/) | [Usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- Transit editor station-first patterns: [Conveyal Data Tools — Add stop at click](https://data-tools-docs.ibi-transit.com/en/dev/user/editor/patterns/)
- Turf.js nearestPointOnLine: [turfjs.org](https://turfjs.org/docs/api/nearestPointOnLine)
- Rail Map Toolkit: [railmapgen.github.io](https://railmapgen.github.io/)
- MetroDreamin': [metrodreamin.com](https://metrodreamin.com/explore)
- Floating UI positioning library: [floating-ui.com](https://floating-ui.com/docs/tutorial)

---
*Feature research for: full-screen Excalidraw-style transit map editor (v2.0 UX revamp)*
*Researched: 2026-04-01*
