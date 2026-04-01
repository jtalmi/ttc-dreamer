# Pitfalls Research

**Domain:** Adding Excalidraw-style editor features to existing MapLibre/React transit sandbox
**Researched:** 2026-04-01
**Confidence:** HIGH

> This supersedes the v1.0 PITFALLS.md. Scope is v2.0: floating toolbars, station-first drawing,
> baseline data correction, reverse geocoding, and dynamic geometry on an existing system.

---

## Critical Pitfalls

### Pitfall 1: Floating Toolbar Swallows Map Click Events

**What goes wrong:**
The floating drawing toolbar or layers toolbar sits in the DOM above the MapLibre canvas. Clicks on the toolbar's transparent padding or gaps between buttons register on the toolbar's DOM element rather than passing through to the map. Station placement or line drawing stops working near the toolbar edges with no visible error.

**Why it happens:**
React overlays are positioned `absolute` inside a flex container that also holds the map. Unless `pointer-events: none` is applied to the wrapper and `pointer-events: auto` is restored only on interactive children (buttons, inputs), the entire bounding box blocks hit testing to the canvas below.

**How to avoid:**
Apply `pointer-events: none` to every toolbar wrapper `div` and re-apply `pointer-events: auto` directly to each interactive element (buttons, toggles). Test by drawing a station at the exact coordinate position hidden behind the toolbar — the map should receive the click. Do not rely on `z-index` alone; z-index controls paint order, not event routing.

**Warning signs:**
- Drawing tool stops responding near toolbar edges
- Station placement works on the left side of the map but fails on the right (toolbar position)
- `onClick` fires on `div.toolbar-wrapper` rather than `Map`

**Phase to address:**
Floating toolbar phase (replacing nav-based toolbar)

---

### Pitfall 2: Station-First Drawing Model Breaks Existing Waypoint Arrays

**What goes wrong:**
The v1 drawing model appends waypoints to `ProposalLineDraft.waypoints` as the source of truth, with stations as a parallel list linked by `stationIds`. The station-first v2 model inverts this: stations drive geometry, waypoints become derived. If both models coexist or if the migration is partial, a line can have waypoints that disagree with its station positions. The line renders correctly from waypoints but snapping, drag, and stats read from the station list — producing silent position mismatches.

**Why it happens:**
`ProposalLineDraft` has both `waypoints: [number, number][]` and `stationIds: string[]` as first-class fields. Migrating to station-first does not automatically deprecate the waypoints array. Old drawing actions still push to `waypoints`; new station-drag actions update `ProposalStationDraft.position` without recomputing `waypoints`. Two sources of truth drift apart.

**How to avoid:**
Decide at the start of the drawing model phase whether `waypoints` becomes derived (computed from `stations.map(s => s.position)`) or whether it remains independent with stations snapped to waypoints. Pick one canonical source. If waypoints become derived, remove the `waypoints` field from `ProposalLineDraft` and compute it in `buildProposalLinesGeoJSON`. If waypoints remain canonical, stations must always reference a waypoint index — not a free-floating position. Do not allow both fields to be mutated independently.

**Warning signs:**
- Line renders correctly but station drag does not move the line
- Stats report a different length than the visual line
- Undo restores waypoints but not station positions, or vice versa
- Tests in `proposal-geometry.test.ts` pass individually but fail when stations and waypoints are both asserted

**Phase to address:**
Station-first drawing model phase — the data model decision must come before any UI work on the new drawing flow

---

### Pitfall 3: Undo/Redo History Does Not Cover the New Drawing Actions

**What goes wrong:**
New actions added for the station-first model (`placeStationOnLine`, `dragStation`, `autoConnectInterchange`) are not added to `HISTORY_ACTIONS` in `proposal-history.ts`. Undo skips them. Users place three stations, hit Cmd+Z, and the undo jumps back to before all three instead of stepping back one station at a time.

**Why it happens:**
`HISTORY_ACTIONS` is a manually-maintained `Set<string>` in `proposal-history.ts`. New action types added to `proposalEditorReducer` are not automatically enrolled. Since the history wrapper delegates to the core reducer and then checks the set, new actions silently bypass history unless explicitly added.

**How to avoid:**
When adding any new action to `proposal-state.ts`, the same PR must update `HISTORY_ACTIONS`. A unit test that exercises the new action and then calls `undo` should confirm the reversion. Consider adding a build-time exhaustiveness check: define all draft-mutating action types in a union and assert that `HISTORY_ACTIONS` contains all of them.

**Warning signs:**
- Undo steps are larger than expected — skipping multiple user actions
- New stations appear but cannot be individually undone
- Vitest coverage shows the new action dispatched but undo assertions missing

**Phase to address:**
Station-first drawing model phase — add history enrollment before shipping any new actions

---

### Pitfall 4: Existing Shared URLs Break After Schema Changes

**What goes wrong:**
The share URL encodes a full `ProposalDraft` as base64 JSON. If `ProposalLineDraft` or `ProposalStationDraft` gains or loses required fields during the drawing model migration (e.g., removing `waypoints`, adding `orderedStationIds`), old share links decode to an object that fails `isValidSharePayload` validation or passes validation but renders incorrectly because the geometry GeoJSON builder receives unexpected shapes.

**Why it happens:**
`decodeSharePayload` checks `v === 1` and the existence of `lines` and `stations` arrays — but does not validate inner field structure. A link generated before the schema change will decode without error, then fail silently when `buildProposalLinesGeoJSON` iterates `waypoints` that no longer exist.

**How to avoid:**
Before removing or renaming any field in `ProposalLineDraft` or `ProposalStationDraft`, bump the schema version in `SharePayload` from `v: 1` to `v: 2` and add a migration function in `decode-proposal.ts` that upgrades v1 payloads to v2. The migration should reconstruct any removed fields with sensible defaults. Write a unit test that decodes a hardcoded v1 JSON string and confirms the result passes v2 validation and renders without error.

**Warning signs:**
- Previously shared links load as blank maps
- `decodeSharePayload` returns `null` for links that worked before
- No schema version bump was made alongside a data model change

**Phase to address:**
Baseline data correction phase (first schema-touching phase) — establish version-bump discipline before drawing model changes land

---

### Pitfall 5: GeoJSON Data Replacement Misaligns Station Dots with Line Geometry

**What goes wrong:**
The corrected baseline TTC data ships new coordinate arrays for line routes. The station dot positions remain at the old coordinates. On the map, station circles appear offset from the line they belong to — sometimes by a full block. The visual looks wrong even though both datasets are technically "correct" in isolation.

**Why it happens:**
Line routes and station positions are loaded from separate GeoJSON files (`ttc-routes.geojson` and `ttc-stations.geojson`). If both files are not updated from the same source revision, coordinate drift accumulates. This is also common when routes are simplified (coordinate precision reduced) but station points are not re-snapped to the simplified line.

**How to avoid:**
Update both files from the same source at the same time. After loading the new data in the browser, visually verify each station dot sits on its line at multiple zoom levels. Write a geometry test that asserts every baseline station's coordinates fall within 50 meters of its associated line using `@turf/turf` `nearestPointOnLine`. Run this test on the GeoJSON files as static data, not as a rendered check.

**Warning signs:**
- Stations visually float beside their line at zoom 14+
- The offset grows at higher zoom levels (coordinate precision issue)
- GO or Crosstown stations appear correct but TTC Line 1/2 stations do not (datasets were corrected piecemeal)

**Phase to address:**
Baseline data correction phase — test passes before any UI changes land on top

---

### Pitfall 6: Reverse Geocoding Hammers Nominatim and Gets Rate-Limited

**What goes wrong:**
Station name auto-generation calls Nominatim `reverse` for every station placement, including during drag. The public Nominatim endpoint enforces a hard limit of 1 request per second and prohibits auto-complete or client-side streaming patterns. With 5-10 stations placed quickly, requests are queued and responses arrive out of order or fail with HTTP 429. Station names show up wrong (a later response overwrites an earlier one) or the feature silently stops working after the rate limit is hit.

**Why it happens:**
Client-side geocoding is easy to prototype with Nominatim but the OSM Foundation's usage policy explicitly prohibits high-frequency or automated client-side calls. Developers test with one station at a time and miss the rate limit until demos or load testing.

**How to avoid:**
1. Gate reverse geocoding to a user action (e.g., after station placement is confirmed, not during drag)
2. Implement a debounce of at least 1 200ms between calls
3. Build a fallback chain: attempt Nominatim, on failure return an empty string and prompt the user to type a name
4. Cache responses keyed by coordinate rounded to 4 decimal places (~11m precision) to avoid re-fetching for nearby placements
5. Never call Nominatim during `mousemove` or drag events

**Warning signs:**
- Station names correct during slow placement but wrong during fast placement
- Network tab shows queued or failed requests to `nominatim.openstreetmap.org`
- Vitest mocks pass but manual testing with real network reveals flipped names

**Phase to address:**
Redesigned sidebar / auto-generated station names phase

---

### Pitfall 7: Station Drag Updates GeoJSON Source Faster Than MapLibre Can Process

**What goes wrong:**
Dragging a station dispatches a `moveStation` action on every `mousemove` event. Each dispatch triggers a React re-render, which recomputes `buildProposalLinesGeoJSON` and calls `map.getSource(...).setData(...)`. MapLibre's worker queues these updates sequentially. When `mousemove` fires at 60fps, the worker queue grows faster than it drains. The drag lags 2-4 seconds behind the cursor, memory usage climbs, and on slower machines the tab crashes. This is a documented issue in MapLibre (issue #6154).

**Why it happens:**
`setData()` on a GeoJSON source serializes the entire FeatureCollection, passes it to a web worker, and the worker re-tiles the geometry. At 60fps this is one serialization + tiling cycle every 16ms. The worker cannot keep up, the `Actor.tasks` queue grows unbounded, and memory climbs continuously.

**How to avoid:**
1. Throttle `mousemove` dispatch to at most 30ms intervals using `useRef` + timestamp comparison — never dispatch on every event
2. During an active drag, update only the visual position using a CSS transform on the DOM Marker (or a separate temporary GeoJSON source) and commit the full state update only on `mouseup`/drag end
3. Do not recompute all line GeoJSON on every drag tick — only update the specific station source and the line segment connecting to that station
4. Add a Vitest performance assertion or a manual drag test that confirms the worker queue does not grow during a 2-second drag session

**Warning signs:**
- Drag feels fine with 1-2 lines but lags with 5+ lines
- Chrome DevTools memory profiler shows a sawtooth pattern that never fully drops during drag
- `requestAnimationFrame` loop falls behind 60fps during mousemove

**Phase to address:**
Dynamic line/station interaction phase — throttle strategy must be in place before any drag feature ships

---

### Pitfall 8: Z-Index Stack Conflicts Between MapLibre Controls, Floating Toolbars, Confirmation Dialogs, and Share Modal

**What goes wrong:**
The share modal and confirmation dialog use a high z-index to appear above the editor. The new floating toolbars also require a high z-index to appear above the MapLibre canvas. Without a documented z-index scale, one component's value collides with another's. The floating toolbar appears above the confirmation dialog, blocking the user from confirming a deletion while in drawing mode.

**Why it happens:**
Z-index values get chosen ad-hoc per component. MapLibre's own controls (compass, zoom, attribution) default to z-index 2. React portal-based dialogs often start at 1000 or 9999. Floating toolbars placed as `position: absolute` children of the map container get z-index 10 or 100 — accidentally sandwiched between map controls and modals.

**How to avoid:**
Establish a z-index scale as CSS custom properties in `globals.css` before floating toolbars are built:
- `--z-map-controls: 2` (MapLibre defaults)
- `--z-floating-toolbar: 10`
- `--z-popover: 100`
- `--z-modal-backdrop: 500`
- `--z-modal: 501`

Enforce the scale in code review. Every `zIndex` value in the codebase should reference a CSS variable, not a magic number.

**Warning signs:**
- Share modal appears behind a floating toolbar
- Confirmation dialog cannot be clicked because a toolbar overlay intercepts pointer events
- Onboarding tooltip disappears behind the layers toolbar

**Phase to address:**
Floating toolbar phase — establish the scale before building any overlay

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keeping `waypoints` and `stations` as co-equal fields after v2 | Drawing still works, no migration needed | Position drift, undo inconsistency, two geometry sources of truth | Never — pick one canonical source before shipping v2 drawing |
| Calling Nominatim without rate-limit guard | Simple prototype | Rate limit hit in production; names silently wrong under load | Only in unit test mocks, never in production |
| Dispatching `moveStation` on every `mousemove` without throttle | Dragging works in dev with few lines | Worker queue blowup; drag lags 2-4s with real proposals | Never — throttle from day one |
| Sharing `v: 1` payload type after schema changes | No migration code to write | All previously-shared URLs silently fail to decode | Never — bump version and add migration on any field removal |
| Hardcoded `zIndex` numbers in component files | Quick fix | Z-index collisions between modal, toolbar, and map controls | Never for overlay components |
| Skipping `pointer-events: none` on toolbar wrapper | Toolbar renders correctly visually | Drawing fails near toolbar bounding box; subtle and hard to debug | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MapLibre `setData()` on drag | Call on every `mousemove` | Throttle to 30ms; commit full update only on drag end |
| Nominatim reverse geocoding | Fire on every station placement including programmatic placements | Only fire after user-confirmed placement; debounce 1 200ms; cache by rounded coordinate |
| MapLibre canvas + React overlay | Overlay `div` blocks clicks to canvas | `pointer-events: none` on wrapper, `pointer-events: auto` on buttons |
| `HISTORY_ACTIONS` set + new reducer actions | Add action to reducer without adding to set | Same PR must touch both; add exhaustiveness test |
| Share URL + schema migration | Remove field from `ProposalDraft` without bumping `v` | Bump version, add upgrade function in `decode-proposal.ts`, test with frozen v1 JSON |
| Baseline GeoJSON route + station files | Update one file without updating the other | Always update as a pair from the same source; verify with geometry proximity test |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full GeoJSON recompute on every drag tick | Drag lags 2-4s; memory climbs during drag | Throttle dispatches; use temporary visual source during drag | With 3+ proposal lines |
| DOM Marker per station (instead of SymbolLayer) | 20+ stations causes noticeable slowdown | Use GeoJSON SymbolLayer for bulk rendering; DOM Markers only for drag handle of actively-dragged station | Once proposals exceed ~15 stations |
| Re-rendering all sidebar panels on every pointer move | Sidebar flickers; CPU spikes during drawing | Memoize panel content; only re-render sidebar when `chrome.sidebarPanel` changes | Immediately visible in drawing mode |
| Computing `buildProposalLinesGeoJSON` inside render path without memoization | Re-render cost on every chrome-only state change | `useMemo` keyed on `draft.lines`; chrome changes must not invalidate line geometry memo | From the first phase that adds chrome state changes |
| Width animation on sidebar toggle without `will-change` or `transform` | Layout reflow on every animation frame; map stutters during toggle | Animate `transform: translateX()` not `width`; or use `absolute` positioned sidebar outside document flow | Immediately visible on slower hardware |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting Nominatim response content as safe HTML | XSS if name injected into DOM unsanitized | Treat geocoding response as plain text; never set `innerHTML` from API data |
| Decoding a v2 share URL with v1 validator | Silently accepts malformed payloads that pass loose checks | Strict version-gated validation; unknown fields stripped, required fields checked |
| Embedding user-typed station names in exported PNG without sanitization | Possible rogue characters in export filename or canvas | Sanitize title and name strings before use in `export-utils.ts` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Station-first drawing with no line preview | User places 3 stations with no visual feedback of the emerging line | Show a dashed preview line from the last placed station to the cursor during drawing |
| Auto-generated name from Nominatim shown immediately | Names often wrong (cross-street format, not TTC naming convention) | Show auto-generated name as editable suggestion in the station name popover, not as committed name |
| Floating toolbar with no visual anchor | Toolbar feels detached and easy to lose on wide screens | Give toolbar a subtle drop shadow and a fixed screen-edge anchor point |
| Sidebar collapse breaks drawing mode | User collapses sidebar mid-drawing; no way to finish or cancel | Ensure drawing controls (Finish / Cancel) are accessible even with sidebar collapsed — move them to a floating status chip |
| Drag handle too small for station dots | Users accidentally click-to-select instead of drag | Increase drag hit area to at least 24x24px; use a separate invisible drag handle element |

---

## "Looks Done But Isn't" Checklist

- [ ] **Floating toolbar:** Verify station placement works at pixel coordinates hidden behind the toolbar bounding box — not just to the sides of it
- [ ] **Station-first drawing:** Verify `undo` steps back one station at a time, not the entire drawing session
- [ ] **Baseline data correction:** Verify every corrected station dot is within 50m of its line using a Turf proximity test in Vitest
- [ ] **Reverse geocoding:** Verify the fallback path (no network) still allows manual name entry — geocoding failure must not block station creation
- [ ] **Station drag:** Verify memory does not climb during a 10-second drag session (Chrome DevTools performance tab)
- [ ] **Share URL migration:** Verify a hardcoded v1 URL still loads correctly after any schema changes (frozen JSON test fixture)
- [ ] **Z-index stack:** Verify the confirmation dialog renders above the floating toolbar with no pointer-event interception
- [ ] **Sidebar toggle:** Verify the sidebar can collapse and expand without a map render stutter on a mid-tier laptop

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Waypoints and stations out of sync | HIGH | Designate one canonical source; write a one-time migration that re-derives the other from it; update all geometry builders and action handlers; retest all geometry tests |
| Shared URLs broken by schema change | MEDIUM | Add v1→v2 migration in `decode-proposal.ts`; deploy; test against captured v1 URL fixtures; no server-side fix possible since URLs are client-only |
| Nominatim rate-limited in production | LOW | Add debounce and caching in geocoding helper; switch to cached offline street-name lookup from existing `streets.geojson` baseline data as permanent fallback |
| Worker queue blowup from drag | MEDIUM | Add throttle wrapper around `moveStation` dispatch; separate drag visual from committed state using a temporary marker layer |
| Z-index collision | LOW | Audit all `zIndex` usages; replace with CSS variable scale; component-by-component fix |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Floating toolbar swallows map clicks | Floating toolbar phase | Station placement works at coordinates under toolbar bounding box |
| Station-first breaks waypoint arrays | Station-first drawing model phase (data model decision) | No two writeable sources of truth for line geometry exist in codebase |
| Undo skips new drawing actions | Station-first drawing model phase | `undo` steps back one station; Vitest history test covers new actions |
| Shared URLs break on schema change | Baseline data correction phase | Frozen v1 JSON test fixture decodes correctly after every subsequent change |
| GeoJSON station/route misalignment | Baseline data correction phase | Turf proximity test asserts all stations within 50m of their line |
| Nominatim rate limiting | Auto-generated station names phase | Debounce, cache, and fallback all present before feature ships |
| Station drag worker queue blowup | Dynamic geometry phase | Throttle in place; performance test passes during 10-second drag |
| Z-index stack collisions | Floating toolbar phase (establish scale) | CSS variable scale defined; no magic numbers in overlay components |

---

## Sources

- [MapLibre GeoJSON memory leak issue #6154](https://github.com/maplibre/maplibre-gl-js/issues/6154) — worker queue growth from rapid `setData()` calls
- [maplibre-geoman drag performance issue #48](https://github.com/geoman-io/maplibre-geoman/issues/48) — `_pendingLoads` queue growth during drag, queue-merge workaround
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/) — 1 req/s max, no client-side streaming
- [MapLibre Optimising Large GeoJSON](https://maplibre.org/maplibre-gl-js/docs/guides/large-data/) — GeoJSON source update patterns
- [react-map-gl What's New](https://visgl.github.io/react-map-gl/docs/whats-new) — Marker draggable prop, MapLibre endpoint
- [deck.gl overlay pointer event pattern](https://github.com/visgl/deck.gl/discussions/9132) — pointer-events on overlays above MapLibre canvas
- Existing codebase: `lib/proposal/proposal-history.ts` (HISTORY_ACTIONS set), `lib/sharing/decode-proposal.ts` (v1 schema validator), `lib/proposal/proposal-types.ts` (dual waypoints+stations fields)

---

*Pitfalls research for: v2.0 features on existing MapLibre/React transit editor*
*Researched: 2026-04-01*
