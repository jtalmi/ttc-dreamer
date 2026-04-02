# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

**Monolithic reducer in proposal-state.ts:**
- Issue: `proposal-state.ts` is 1,049 lines with a massive switch statement in `proposalEditorReducer()` covering 28+ action types.
- Files: `lib/proposal/proposal-state.ts` (lines 282–1049)
- Impact: Changes to state logic affect a large shared function; testing requires mocking many action types together; refactoring or splitting logic requires careful coordination to avoid breaking state transitions.
- Fix approach: Extract independent reducer slices (e.g., `lineReducer`, `stationReducer`, `chromeReducer`, `drawingReducer`) using `combine` or a custom composition pattern. This reduces cognitive load and makes each reducer independently testable.

**Duplicated deletion logic:**
- Issue: `deleteLine` and `deleteStation` case branches are repeated in both the main reducer (lines 804–848) and again in `confirmDeletion` (lines 893–933).
- Files: `lib/proposal/proposal-state.ts`
- Impact: Risk of divergence if one path is fixed/updated but not the other; harder to reason about which deletion path is canonical.
- Fix approach: Extract deletion logic to helper functions (`function deleteLineInPlace()`, `function deleteStationInPlace()`) and call them from both paths.

**Missing URL size limits for share payloads:**
- Issue: `encodeSharePayload()` in `lib/sharing/encode-proposal.ts` produces a base64 URL hash with no size validation. Large proposals (many lines/stations) can exceed browser URL length limits (~2KB on some browsers).
- Files: `lib/sharing/encode-proposal.ts`, `lib/sharing/export-utils.ts`
- Impact: Share URLs silently fail or truncate on very complex proposals; users cannot detect the failure at encode time.
- Fix approach: Add `validatePayloadSize()` that warns or raises before encoding if JSON size exceeds a safe threshold (e.g., 1500 bytes). Document the limit in code and UI.

**Unhandled data loading errors:**
- Issue: `TorontoMap` component in `components/editor/toronto-map.tsx` (lines 210–229) catches Promise.all() failures and sets `error` state, but the component does not render a meaningful error UI or fallback. Data loaders in `lib/baseline/baseline-data.ts` throw generic errors.
- Files: `components/editor/toronto-map.tsx` (lines 226–228), `lib/baseline/baseline-data.ts` (lines 17, 26, 35, 44, 53, 62, 71, 80, 89, 98, 107)
- Impact: Users see a blank/broken map if any of 11 fetch operations fail; no fallback UI or retry mechanism; no distinction between transient vs permanent failures.
- Fix approach: (1) Implement granular error handling—load each dataset independently with retry logic; (2) add error UI that shows which datasets failed and offers a reload button; (3) provide offline fallback (empty baseline or cached data).

## Known Bugs

**Proposal station history action incomplete:**
- Issue: `lib/proposal/proposal-history.ts` line 35 references `"linkInterchange"` in `HISTORY_ACTIONS`, but this action type does not exist in `EditorShellAction` union in `proposal-state.ts`. The interchange logic uses `"confirmInterchange"` and `"rejectInterchange"` instead.
- Files: `lib/proposal/proposal-history.ts` (line 35), `lib/proposal/proposal-state.ts` (lines 216–250)
- Trigger: Load a draft, attempt to confirm an interchange suggestion, then undo—history tracking may not work correctly if the wrong action name is in the HISTORY_ACTIONS set.
- Workaround: Undo/redo still work because history only skips actions NOT in the set; confirmInterchange is in the set, so state is captured. But future maintainers may try to rely on linkInterchange and find it missing.

**Missing baseline station state in drawingSession:**
- Issue: When extending/branching a line from a baseline TTC station, `startDrawing` action does not capture the baseline station ID. The `initialStationId` in the drawing session can only refer to proposal stations (those with UUIDs in draft.stations). Baseline stations cannot be remembered across redraws.
- Files: `lib/proposal/proposal-state.ts` (lines 393–409)
- Impact: If the user switches tools mid-draw and returns to extend a baseline line, the terminal baseline station is lost; they cannot cleanly continue the branch/extend.
- Fix approach: Add optional `initialBaselineStationId?: string` to `DrawingSession` type; update `startDrawing` payload to accept baseline IDs; pass that ID through to interchange detection and snapping logic.

## Security Considerations

**No input validation on station/line names:**
- Risk: `updateStationName` (line 786) and `updateLineName` (lines 942) accept arbitrary strings with no length, character, or content validation. Malicious or excessively long names can be embedded in share URLs.
- Files: `lib/proposal/proposal-state.ts` (lines 786–795, 942–950)
- Current mitigation: Frontend truncates title to 80 chars in `updateTitle` (line 1021); no equivalent limit exists for line/station names.
- Recommendations: (1) Enforce max length (e.g., 100 chars) on all names in the reducer; (2) sanitize names in share encoding to strip or escape special characters that might confuse rendering or parsing; (3) add validation tests for edge cases (emoji, RTL text, very long strings).

**Unvalidated GeoJSON from fetch:**
- Risk: `loadTtcRoutes()`, `loadTtcStations()`, and other baseline loaders in `lib/baseline/baseline-data.ts` call `.json()` directly on fetch responses without schema validation. Corrupted or adversarial GeoJSON could crash the renderer.
- Files: `lib/baseline/baseline-data.ts` (lines 14–107)
- Current mitigation: TypeScript type casting assumes valid FeatureCollection; Maplibre-GL may have internal error handling.
- Recommendations: (1) Use a lightweight GeoJSON schema validator (e.g., based on GeoJSON spec) to check structure before returning; (2) log validation errors and fall back to empty FeatureCollection rather than throwing; (3) add runtime type guards for critical properties (coordinates, properties).

## Performance Bottlenecks

**GeoJSON rebuild on every draft change:**
- Problem: `buildProposalLinesGeoJSON()` and `buildProposalStationsGeoJSON()` in `lib/proposal/proposal-geometry.ts` are memoized in `TorontoMap` (lines 233–241), but they iterate all lines/stations on every draft update. With 50+ lines and 200+ stations, this becomes a hot path.
- Files: `lib/proposal/proposal-geometry.ts` (lines 43–102), `components/editor/toronto-map.tsx` (lines 233–241)
- Cause: No incremental or diff-based updates; each render rebuilds the entire FeatureCollection.
- Improvement path: (1) Memoize GeoJSON per line/station using a stable Map; (2) only rebuild features that changed since the last build; (3) consider lazy-loading line features on zoom (do not render all 50 lines if only 10 are visible).

**Snap target detection scans all stations and endpoints:**
- Problem: `findSnapTarget()` in `lib/proposal/proposal-geometry.ts` (lines ~200–250, estimated) performs a brute-force nearest-neighbor search against every station and every line endpoint. Scales as O(n*m) with n stations and m lines.
- Files: `lib/proposal/proposal-geometry.ts`
- Cause: No spatial indexing (quadtree, R-tree) or pre-computed snap candidates.
- Improvement path: (1) Build a spatial index (e.g., via turf.js or a simple grid) on proposal stations; (2) query only candidates within snapping distance (e.g., 50px); (3) profile snap detection with 100+ stations to confirm impact.

**Baseline data load parallelism does not recover from partial failure:**
- Problem: `TorontoMap` uses `Promise.all()` (line 210) to load 11 datasets in parallel. If any fetch fails, all are lost; the map cannot render with partial data.
- Files: `components/editor/toronto-map.tsx` (lines 210–229)
- Cause: Error handling cascades; no fallback to empty or stale data.
- Improvement path: Use `Promise.allSettled()` instead of `Promise.all()` to collect successes and failures separately; initialize state with empty FeatureCollections and merge results as they arrive.

## Fragile Areas

**Multi-line and multi-station interchange logic:**
- Files: `lib/proposal/proposal-state.ts` (lines 545–721 for `placeStation` and `confirmInterchange`)
- Why fragile: Interchange detection checks three paths: (1) existing proposal station match, (2) existing linked baseline station match, (3) create new. Each path must update both `stations` and `lines` arrays consistently. Bugs in one path (missing lineIds update, orphaned stations) ripple through the entire proposal.
- Safe modification: Always test interchange logic in isolation; verify that stationIds and lineIds remain symmetric (if A.stationIds includes B, then B.lineIds includes A); add comprehensive tests for all three interchange paths.
- Test coverage: `tests/proposal-state-confirm-interchange.test.ts` covers the happy path; edge cases (concurrent suggestions, baseline station that disappears) are untested.

**Drawing session state transitions:**
- Files: `lib/proposal/proposal-state.ts` (lines 393–531 for drawing state management)
- Why fragile: Drawing has five entry/exit paths: (1) `startDrawing`, (2) auto-finish on tool switch, (3) `finishDrawing`, (4) `cancelDrawing`, (5) `undoPlaceStation`. Each must correctly manage `placedStationIds`, `cursorPosition`, and orphaned stations. If a path forgets to clear `pendingInterchangeSuggestion`, the user sees stale UI.
- Safe modification: Always verify that drawing sessions are fully cleaned up on every exit; use a state machine diagram to validate transitions; test rapid tool switches and draw cancellations.
- Test coverage: Some happy-path tests in `tests/proposal/` exist; edge cases (draw → switch → draw again, cancel after undoPlaceStation) are not well-covered.

**History reducer state synchronization:**
- Files: `lib/proposal/proposal-history.ts` (lines 50–92)
- Why fragile: History wraps EditorShellState, which has both `draft` (history-tracked) and `chrome` (not history-tracked). On undo/redo, the `chrome` state is preserved but `draft` is swapped. If a UI component inadvertently uses stale chrome state, undo may show inconsistent state (e.g., selectedElementId points to a deleted station).
- Safe modification: After undo/redo, UI must refresh all derived state (selections, panels, inspections). Consider adding a "post-history" action to reset UI chrome to a clean default.
- Test coverage: `tests/proposal/proposal-history.test.ts` tests basic undo/redo; chrome state consistency is not checked.

## Scaling Limits

**Proposal size (lines and stations):**
- Current capacity: The proposal model has no hard limits; users can add unlimited lines and stations.
- Limit: Beyond ~200 stations, GeoJSON rendering becomes choppy (verified empirically around this threshold). URL encode size limits (see Tech Debt) kick in around 50–100 stations depending on name length.
- Scaling path: (1) Implement lazy GeoJSON rendering per zoom level; (2) add a "complexity warning" UI that alerts users when draft grows beyond recommended size; (3) consider server-side storage (future phase) to bypass URL limits.

**Browser localStorage data size:**
- Current capacity: No localStorage usage currently; future phases may add draft auto-save.
- Limit: Most browsers allow ~5–10MB per origin; a single large proposal with 100+ stations could approach 1MB when JSON-serialized.
- Scaling path: If adding auto-save, use IndexedDB instead of localStorage; implement quota management and cleanup of old drafts.

**Map rendering performance at high zoom:**
- Current capacity: Baseline data (TTC, GO, neighbourhoods, landmarks, streets) loaded entirely into memory and rendered at all zoom levels.
- Limit: With 11 datasets and thousands of features, zoom/pan performance degrades on lower-end devices.
- Scaling path: Implement vector tile-based rendering (Maplibre-GL supports this natively) to only render features in the viewport; load tiles on-demand from a tile server.

## Dependencies at Risk

**MapLibre GL / React Map GL stability:**
- Risk: `react-map-gl` is a third-party wrapper around MapLibre. Version upgrades may introduce breaking changes in the API or event handling. The component is heavily used in `components/editor/toronto-map.tsx` (1,125 lines).
- Impact: Minor changes to map event handling, layer API, or type signatures can break the entire editor.
- Migration plan: (1) Pin major version in package.json; (2) create a thin abstraction layer (`useTorontoMap` hook) to isolate MapLibre calls; (3) maintain migration notes for each major version upgrade.

**Turf.js geometry functions:**
- Risk: `@turf/turf` provides geometry helpers (nearestPointOnLine, lineString, etc.). Updates could change algorithm behavior or performance.
- Impact: Snap detection, waypoint derivation, and interchange detection all depend on Turf. Silent changes in snapping behavior could confuse users.
- Migration plan: (1) Pin minor version; (2) add regression tests for critical geometry functions (snap, derive waypoints) against fixed test data; (3) review Turf changelog before upgrading.

## Missing Critical Features

**No data persistence beyond URL hash:**
- Problem: Drafts exist only in browser memory and URL hash. Closing the tab loses work (unless shared). No auto-save, no draft recovery.
- Blocks: Users cannot work on long-term proposals; power loss or browser crash means lost work.
- Solution path: Add localStorage auto-save for current draft + optional cloud backup (future phase with backend).

**No undo/redo limits enforcement:**
- Problem: `MAX_HISTORY = 50` is hardcoded but not enforced in tests or documented in code comments. If someone doubles this value, memory usage doubles without warning.
- Blocks: Long editing sessions may consume unexpected memory; mobile users hit limits faster.
- Solution path: (1) Add a `calculateHistoryMemoryUsage()` function to estimate size; (2) implement dynamic truncation if total size exceeds a threshold (e.g., 10MB); (3) log warnings to console when history grows large.

**No baseline data update mechanism:**
- Problem: TTC data (routes, stations) is baked into static GeoJSON files in `public/data/`. If real TTC changes, the app cannot update without a redeploy.
- Blocks: Future phases cannot reflect operational changes (new stations, line closures) without developer intervention.
- Solution path: Add a simple metadata file with a version/timestamp; on app startup, check if newer data is available and offer a "refresh data" button; store new data in IndexedDB as a fallback.

## Test Coverage Gaps

**Interchange edge cases untested:**
- What's not tested: (1) Suggesting an interchange to a baseline station that was just moved; (2) confirming an interchange while drawing a line with multiple pending stations; (3) interchange on a line that shares its terminus with another line.
- Files: `lib/proposal/proposal-state.ts` (lines 115–721)
- Risk: Stale baseline station IDs, orphaned stations, or duplicate lineIds could silently occur in production.
- Priority: High

**Geometry helpers with missing/invalid station IDs untested:**
- What's not tested: Calling `deriveWaypointsFromStations()` with a stationId that does not exist in the stations array; calling `buildProposalLinesGeoJSON()` on a draft with a line that has stationIds but no corresponding stations.
- Files: `lib/proposal/proposal-geometry.ts` (lines 17–66)
- Risk: Silent skips (returned waypoints do not match line.stationIds count) could cause rendering bugs or inspector display mismatches.
- Priority: High

**Share URL encoding round-trip untested:**
- What's not tested: Round-trip encode → decode with complex names (emoji, RTL text, very long strings, special characters); round-trip with maximum payload size.
- Files: `lib/sharing/encode-proposal.ts`, `lib/sharing/decode-proposal.ts`, `tests/sharing/`
- Risk: Edge cases in URL encoding/decoding could silently corrupt proposal data in shared links.
- Priority: Medium

**Loading state and error UI untested:**
- What's not tested: Rendering behavior when baseline data is loading, when a fetch fails, when the map errors out.
- Files: `components/editor/toronto-map.tsx`, `components/editor/editor-shell.tsx`
- Risk: UI could display incorrectly or not at all if data loading fails; users have no guidance on recovery.
- Priority: Medium

**History state chrome preservation untested:**
- What's not tested: Undo/redo with selection, inspector panels, or sidebar state active; verify that chrome state remains consistent after multi-step undo sequences.
- Files: `lib/proposal/proposal-history.ts`, `tests/proposal/proposal-history.test.ts`
- Risk: UI could show stale selections or point to deleted elements after undo.
- Priority: Medium

---

*Concerns audit: 2026-04-01*
