---
phase: 06-baseline-data-correction
verified: 2026-04-01T22:00:00Z
status: passed
score: 13/13 must-haves verified
---

# Phase 06: Baseline Data Correction Verification Report

**Phase Goal:** Users see an accurate TTC baseline where lines pass through station dots, operational lines appear in service colors, and construction-phase lines are visually distinct
**Verified:** 2026-04-01T22:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All 5 existing route features in ttc-routes.geojson have `status: operational` | VERIFIED | Python check: all 5 features (ROUTE_IDs 1,2,4,5,6) carry `status=operational` |
| 2 | Line 5 ROUTE_COLOR is E77817 in both route files | VERIFIED | today: E77817, future: E77817; old placeholder FF8000 absent from both files |
| 3 | Line 6 ROUTE_COLOR is 969594 in both route files | VERIFIED | today: 969594, future: 969594; old 808080 absent from both files |
| 4 | Ontario Line appears as ROUTE_ID 7 feature in ttc-routes-future.geojson with status: under_construction | VERIFIED | Feature exists with ROUTE_COLOR 00A4E3, status under_construction, 57-coord LineString |
| 5 | Ontario Line does NOT appear in ttc-routes.geojson | VERIFIED | Python check: 0 ROUTE_ID 7 features in today file |
| 6 | 5 Scarborough RT stations removed from ttc-stations.geojson | VERIFIED | MCCOWAN, SCARBOROUGH CENTRE, MIDLAND, ELLESMERE, LAWRENCE EAST all absent |
| 7 | ttc-stations.geojson has 111 features (68 subway + 25 Line5 + 18 Line6) | VERIFIED | Actual count: 111; by ROUTE_ID: None=68, 5=25, 6=18 |
| 8 | TtcRouteProperties type includes optional status field | VERIFIED | `status?: "operational" \| "under_construction"` at line 19 of baseline-types.ts |
| 9 | Line 5 and Line 6 stations appear with GTFS-accurate coordinates in both baselines | VERIFIED | GTFS midpoint averaging used; Mount Dennis at [-79.485789, 43.688025], within GTA bounds |
| 10 | Line 5 has 25 stations and Line 6 has 18 stations | VERIFIED | today: L5=25, L6=18; future: L5=25, L6=18 |
| 11 | Ontario Line has 15 stations in ttc-stations-future.geojson but not ttc-stations.geojson | VERIFIED | future: ROUTE_ID 7 = 15 features; today: ROUTE_ID 7 = 0 features |
| 12 | Ontario Line renders with dashed/under-construction visual style on the map | VERIFIED | ttc-layers.tsx has ttc-line-7-base (opacity 0.4) + ttc-line-7-dash (line-dasharray [4,3]) |
| 13 | TTC line paths visually run through their station dots with no large offset | VERIFIED (conditional) | GTFS coordinates reduce offset from 300-1600m to 15-95m; visual confirmation needs human test |

**Score:** 13/13 truths verified (truth 13 has a human verification note)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `public/data/ttc-routes.geojson` | Today baseline routes with status property and corrected colors | VERIFIED | 5 features, all status=operational, L5=E77817, L6=969594 |
| `public/data/ttc-routes-future.geojson` | Future baseline routes with Ontario Line and corrected colors | VERIFIED | 6 features, Ontario Line ROUTE_ID=7 status=under_construction, 57 coords |
| `public/data/ttc-stations.geojson` | Today baseline stations: 111 features, no SRT, Lines 5/6 with GTFS coords | VERIFIED | 111 features; 68 subway + 25 L5 + 18 L6; all SRT stations absent |
| `public/data/ttc-stations-future.geojson` | Future station data with GTFS Line 5/6 coords + Ontario Line stations | VERIFIED | 126 features; 68 subway + 25 L5 + 18 L6 + 15 Ontario Line |
| `lib/baseline/baseline-types.ts` | TtcRouteProperties with optional status field | VERIFIED | `status?: "operational" \| "under_construction"` present at line 19 |
| `components/map/ttc-layers.tsx` | Ontario Line dashed layer rendering and corrected Line 5/6 colors | VERIFIED | ttc-line-7-base + ttc-line-7-dash present; #E77817 and #969594; no old colors |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/baseline/baseline-types.ts` | `public/data/ttc-routes.geojson` | `status` property in feature properties | VERIFIED | Type and data agree: `status?: "operational" \| "under_construction"` matches `"status": "operational"` in GeoJSON |
| `public/data/ttc-stations-future.geojson` | `components/map/ttc-layers.tsx` | GeoJSON source for station circle rendering | VERIFIED | toronto-map.tsx feeds futureTtcStations to TtcLayers `stations` prop via loadFutureTtcStations() → fetch("/data/ttc-stations-future.geojson") |
| `components/map/ttc-layers.tsx` | `public/data/ttc-routes-future.geojson` | ROUTE_ID 7 filter for Ontario Line layer | VERIFIED | Filter `["==", ["get", "ROUTE_ID"], 7]` on both ttc-line-7-base and ttc-line-7-dash layers; ROUTE_ID 7 present in ttc-routes-future.geojson |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `components/map/ttc-layers.tsx` | `routes` prop (FeatureCollection) | `loadTtcRoutes()` / `loadFutureTtcRoutes()` fetch GeoJSON from public/data | Yes — files are non-empty GeoJSON with 5/6 features | FLOWING |
| `components/map/ttc-layers.tsx` | `stations` prop (FeatureCollection) | `loadTtcStations()` / `loadFutureTtcStations()` fetch GeoJSON from public/data | Yes — files are non-empty GeoJSON with 111/126 features | FLOWING |

Data path confirmed: `toronto-map.tsx` → Promise.all([loadTtcRoutes(), loadTtcStations(), loadFutureTtcRoutes(), loadFutureTtcStations()]) → setData() → TtcLayers props driven by `baselineMode === "future_committed"` ternary. All four data files exist in `public/data/` and are served as static assets.

---

### Behavioral Spot-Checks

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| Today routes file returns 5 operational features | `python3` JSON parse + assert | 5 features, all status=operational | PASS |
| Future routes file contains Ontario Line with under_construction | `python3` JSON parse + assert | ROUTE_ID 7, status=under_construction, 57 coords | PASS |
| Ontario Line absent from today routes | `python3` count ROUTE_ID 7 | 0 features | PASS |
| Station counts match expected totals | `python3` len() checks | today=111, future=126 | PASS |
| No old placeholder colors in route files | `python3` color check | FF8000 and 808080 absent | PASS |
| Old colors absent from ttc-layers.tsx | `grep` check | #808080 and #DF6C2B not found | PASS |
| Correct colors present in ttc-layers.tsx | `grep` check | #E77817 and #969594 present | PASS |
| dasharray layer present in ttc-layers.tsx | `grep` for `line-dasharray` | Found in ttc-line-7-dash layer | PASS |
| TypeScript typecheck passes | `npm run typecheck` | Clean exit, no errors | PASS |
| ESLint passes | `npm run lint` | Clean exit, no errors | PASS |
| All 5 phase commits exist in git history | `git log` with commit hashes | 5f272df, fd7ee01, 44a0076, c0c96fe, 33a05c2 all found | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| BASE-01 | 06-01, 06-02 | TTC line coordinates are accurate and lines pass directly through station dots | SATISFIED | GTFS midpoint averaging reduces station offset from 300-1600m to 15-95m; Ontario Line geometry hand-authored through station points |
| BASE-02 | 06-01, 06-02 | Eglinton Crosstown and Finch West LRT shown as operational; Ontario Line shown as under construction | SATISFIED | L5=E77817 (orange), L6=969594 (grey) in solid layers; OL rendered with dashed blue (ttc-line-7-base + ttc-line-7-dash) |
| BASE-03 | 06-01, 06-02 | All current TTC rapid transit lines are represented in the baseline | SATISFIED | Lines 1, 2, 4, 5, 6 in today baseline; Ontario Line (ROUTE_ID 7) in future baseline; Scarborough RT (Line 3, decommissioned 2023) correctly absent |

No orphaned requirements: all three BASE-0x IDs appear in both plan frontmatter fields and REQUIREMENTS.md. REQUIREMENTS.md marks all three as complete with Phase 6 assignment.

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `components/map/ttc-layers.tsx` line 127 | Comment `// Default stroke color; station data from ArcGIS does not include ROUTE_ID` on hardcoded `circle-stroke-color: "#18324A"` | Info | Pre-existing from Phase 2; all station circles render the same color regardless of route. Not a stub — intentional design decision noted in comment. No impact on Phase 06 goals. |

No blockers. No warning-level anti-patterns introduced by this phase.

---

### Human Verification Required

#### 1. Station Dot Alignment on Map (BASE-01 visual confirmation)

**Test:** Load the app in today-baseline mode and zoom to zoom 11 on the Eglinton corridor (around Yonge/Eglinton). Toggle to future-committed mode.
**Expected:** Line 5 orange route line passes through or very near (< 100m) each orange station dot. Same check for Line 6 (Finch West corridor). Ontario Line in future-committed mode shows dashed blue line passing through the 15 station dots from Exhibition to Science Centre.
**Why human:** Coordinate accuracy at map zoom 11 requires visual inspection — the 15-95m offset claimed by GTFS midpoint averaging cannot be confirmed purely from coordinate arithmetic without rendering.

#### 2. Under-Construction Visual Distinction (BASE-02 visual confirmation)

**Test:** Load future-committed mode. Compare the Ontario Line appearance to Lines 1/2/4/5/6.
**Expected:** Ontario Line appears as a dashed/pulsing blue line, clearly distinct from the solid-colored operational lines. The dual-layer approach (0.4 opacity base + dasharray overlay) should produce a visually readable dashed effect at zoom 11.
**Why human:** MapLibre rendering of `line-dasharray` at specific zoom levels and tile scales cannot be verified from code inspection alone.

---

### Gaps Summary

No gaps. All 13 must-have truths are verified at all applicable levels (exists, substantive, wired, data-flowing). All three requirements (BASE-01, BASE-02, BASE-03) are satisfied with implementation evidence. TypeScript typecheck and ESLint both pass clean. Two human verification items are noted for visual confirmation but do not block the automated assessment.

---

_Verified: 2026-04-01T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
