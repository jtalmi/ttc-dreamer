# Phase 6: Baseline Data Correction - Research

**Researched:** 2026-04-01
**Domain:** GeoJSON data authoring, TTC GTFS, MapLibre GL styling
**Confidence:** HIGH

## Summary

Phase 6 replaces or corrects the GeoJSON files in `public/data/` so that TTC line geometry passes through station dots, Lines 5 and 6 are shown as operational, and the Ontario Line appears as under construction. No new code infrastructure is required — this phase is almost entirely a data authoring task with a small style change in `ttc-layers.tsx`.

The core alignment problem is root-caused: the current station GeoJSON files use City of Toronto ArcGIS **address point** coordinates (street entrances / building addresses), which can be hundreds of meters from the actual track centerline. For the existing subway (Lines 1, 2, 4) this produces a 20–100 m visual offset that is barely perceptible at zoom 11. For the newer LRT lines (5, 6) whose ArcGIS entries were entered at early project stage, the offset is 300–1600 m — visibly wrong. The fix is to replace Line 5 and Line 6 station coordinates with TTC GTFS `stops.txt` platform coordinates, which sit 15–95 m from the route geometry (acceptable for a creative sandbox map).

**Primary recommendation:** Download authoritative TTC GTFS data from the City of Toronto Open Data portal, extract `stops.txt` coordinates for Lines 5 and 6, regenerate those station GeoJSON entries, add a `status` property to all route features, add the Ontario Line as a hand-authored feature with `status: under_construction`, and update `ttc-layers.tsx` to use `line-dasharray` for under-construction lines.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
None — this is an auto-generated context (infrastructure/data phase, discuss skipped). All implementation choices are at Claude's discretion.

### Claude's Discretion
All implementation choices are at Claude's discretion — pure data correction phase. Use ROADMAP phase goal, success criteria, and existing baseline-data infrastructure to guide decisions.

Key guidance from research:
- City of Toronto ArcGIS FeatureServer layer 11 is the current TTC data source
- Ontario Line geometry can be sourced from OpenStreetMap via Overpass API
- Add a `status` property (`operational | under_construction | planned`) for styling differentiation
- Baseline data correction touches only `public/data/*.geojson` files and paint expressions in `ttc-layers.tsx`

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BASE-01 | TTC line coordinates are accurate and lines pass directly through station dots | Replace Line 5/6 station coords with GTFS stops.txt data (15-95m from route vs current 300-1600m). Lines 1/2/4 stations are 20-100m off — acceptable at zoom 11. |
| BASE-02 | Eglinton Crosstown and Finch West LRT shown as operational; Ontario Line shown as under construction | Line 5 opened Feb 8, 2026; Line 6 opened Dec 7, 2025 — both operational. Add `status` property to route features; use `line-dasharray` for Ontario Line. |
| BASE-03 | All current TTC rapid transit lines are represented in the baseline | Lines 1, 2, 4, 5, 6 exist. Ontario Line is absent and must be added (15 stations, under construction). Line 3 (Scarborough RT) was decommissioned March 2023 and must be removed. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- TypeScript strict mode, 2-space indent, double quotes, semicolons required
- No test framework installed — tests not applicable to GeoJSON file edits
- Keep changes minimal; only touch files necessary for this phase
- Next.js 16.2.1 (App Router) — no server-side changes needed; GeoJSON is static
- AGENTS.md: read `node_modules/next/dist/docs/` if writing Next.js code

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TTC GTFS (Open Data Toronto) | Live feed | Authoritative station coordinates and route shapes | Official TTC data, platform-level accuracy (15-95m from route) |
| City of Toronto ArcGIS FeatureServer Layer 11 | Live API | TTC subway route polylines | Current source for Lines 1-6 route geometry |
| MapLibre GL JS (via react-map-gl) | Already installed | Rendering lines with `line-dasharray` for dashed styles | Already used throughout the project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Python 3 (scripting) | System | One-time data extraction and GeoJSON authoring | Write extraction script, don't commit it |
| OpenStreetMap / Overpass API | — | Ontario Line geometry (not yet in any official GIS) | Ontario Line only — not available from ArcGIS or GTFS |

**GTFS Download URL (verified working 2026-04-01):**
```
https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7795b45e-e65a-4465-81fc-c36b9dfff169/resource/cfb6b2b8-6191-41e3-bda1-b175c51148cb/download/TTC%20Routes%20and%20Schedules%20Data.zip
```

**ArcGIS Layer 11 GeoJSON query (all routes):**
```
https://gis.toronto.ca/arcgis/rest/services/cot_geospatial7/FeatureServer/11/query?where=1%3D1&outFields=*&f=geojson
```

---

## Current State Audit

### What the GeoJSON files contain today

**`public/data/ttc-routes.geojson`** (5 features):
| ROUTE_ID | Name | Status field | Notes |
|----------|------|-------------|-------|
| 1 | Line 1 Yonge-University | absent | GTFS shape data, 633 coords |
| 2 | Line 2 Bloor-Danforth | absent | GTFS shape data, 465 coords |
| 4 | Line 4 Sheppard | absent | GTFS shape data, 54 coords |
| 5 | Line 5 Eglinton | absent | MultiLineString 4 segments, 309 total coords |
| 6 | Line 6 Finch West | absent | 160 coords, color still #808080 (old construction grey) |

**Missing entirely:** Ontario Line (no feature, no ROUTE_ID 7).
**Note:** `ttc-routes-future.geojson` is identical to `ttc-routes.geojson` — same 5 features, same coords.

**`public/data/ttc-stations.geojson`** (73 features, today baseline):
- All 73 stations use raw ArcGIS address point coordinates (no `name`, no `line`, no `status` property)
- Includes 5 Scarborough RT stations (MCCOWAN, SCARBOROUGH CENTRE, MIDLAND, ELLESMERE, LAWRENCE EAST) — Line 3 was **decommissioned March 2023** and must be removed
- Lines 1/2/4 stations: 20–100 m from route (acceptable visual offset)

**`public/data/ttc-stations-future.geojson`** (103 features, future committed baseline):
- 73 subway stations (same ArcGIS coords as today file)
- 21 Line 5 stations with ArcGIS coords: **300–1600 m from route geometry** (very wrong)
- 9 Line 6 stations with ArcGIS coords: **445–900 m from route** (wrong)
- Has `ROUTE_ID` and `TRANSIT_LINE` properties for LRT stations
- Missing 4 Line 5 stations vs. actual opened count (21 in file, 25 stations opened)
- Missing 9 Line 6 stations vs. actual opened count (9 in file, 18 stops opened)
- `ttc-stations-future.geojson` should now mirror today's file + Ontario Line stations

### How `ttc-layers.tsx` uses the data

```typescript
// Route lines — filtered by ROUTE_ID from GeoJSON properties
filter={["==", ["get", "ROUTE_ID"], 5]}
// Hardcoded paint colors per line ID
"line-color": "#DF6C2B"

// Station circles — single uniform style, no per-line color differentiation
"circle-stroke-color": "#18324A"  // no ROUTE_ID-based coloring
```

The layer has **no `status` field awareness** — this must be added for Ontario Line dashes.

---

## Architecture Patterns

### Recommended File Structure (no structural changes needed)
```
public/data/
├── ttc-routes.geojson         # CORRECTED: add status property, same 5 lines (no Ontario Line in today baseline)
├── ttc-routes-future.geojson  # CORRECTED: add status + Ontario Line feature
├── ttc-stations.geojson       # CORRECTED: remove Line 3 stations, keep coords
├── ttc-stations-future.geojson # CORRECTED: replace Line 5/6 with GTFS coords, add Ontario Line stations
lib/baseline/
├── baseline-types.ts          # ADD: status property types
└── baseline-data.ts           # unchanged — no new loaders needed
components/map/
└── ttc-layers.tsx             # SMALL CHANGE: add dasharray layer for under_construction
```

### Pattern 1: Status Property Schema

Add `status` to route features. Use a simple string union:

```json
{
  "type": "Feature",
  "properties": {
    "ROUTE_ID": 7,
    "ROUTE_SHORT_NAME": "OL",
    "ROUTE_LONG_NAME": "Ontario Line",
    "ROUTE_COLOR": "00A4E3",
    "status": "under_construction"
  }
}
```

Values: `"operational"` | `"under_construction"` (omit `"planned"` — no planned lines in scope).

### Pattern 2: MapLibre Dashed Line for Under Construction

MapLibre `line-dasharray` supports data-driven `case` expressions with `["literal", [...]]`. Add a **second layer** on the same source that renders only `under_construction` features with a dash pattern:

```typescript
// Operational lines: solid
<Layer
  id="ttc-line-ontario-solid"
  type="line"
  filter={["==", ["get", "ROUTE_ID"], 7]}
  paint={{
    "line-color": "#00A4E3",
    "line-width": 4,
    "line-opacity": 0.5,
  }}
/>
// Under-construction overlay: dashed
<Layer
  id="ttc-line-ontario-dashes"
  type="line"
  filter={["==", ["get", "ROUTE_ID"], 7]}
  paint={{
    "line-color": "#00A4E3",
    "line-width": 4,
    "line-dasharray": [4, 3],
  }}
/>
```

**Simpler alternative**: use a single layer per line but add a separate `under_construction_overlay` Source that only contains under-construction features. This avoids per-filter complexity.

**Simplest viable approach**: add one new `<Layer>` for the Ontario Line with `line-dasharray` — no need to restructure all existing layers. Operational lines stay as solid layers. Under-construction lines get an additional dashed layer.

### Pattern 3: GTFS Stop Coordinate Extraction

For each opened LRT station, average the westbound and eastbound platform coordinates to get a single representative point:

```python
# Pseudocode for extracting Line 5 station midpoints
for station_name in unique_stations:
    wb = gtfs_stop_coords["westbound"]
    eb = gtfs_stop_coords["eastbound"]
    midpoint = ((wb.lon + eb.lon) / 2, (wb.lat + eb.lat) / 2)
```

This produces a single dot per station that sits on or very close to the track centerline.

### Anti-Patterns to Avoid
- **Snapping station coords to nearest route vertex**: produces correct-looking alignment but artificially places all station dots on the exact line, which looks unnatural for elevated/tunnel transitions. GTFS coords are better.
- **Separate GeoJSON per line**: the current multi-line-per-file pattern works well with MapLibre filters. Don't split into per-line files.
- **Modifying `baseline-data.ts` loaders**: the loaders are thin fetch wrappers with no transformation logic. Keep them that way; fix the data files directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Station coordinate accuracy | Custom geocoding or coordinate lookup | TTC GTFS `stops.txt` | Official data, platform-level accuracy |
| Route geometry for existing lines | Re-digitizing routes from scratch | Existing GeoJSON (already GTFS shapes) | Route data in repo is already correct GTFS shapes |
| Ontario Line geometry | Calculating from Wikipedia description | Hand-authored GeoJSON using OSM station locations + route description | Ontario Line not in ArcGIS or GTFS yet |

---

## What Needs to Change (Full Scope)

### ttc-routes.geojson (today baseline)

1. **Add `status: "operational"`** to Lines 1, 2, 4, 5, 6
2. **Fix Line 5 ROUTE_COLOR** from `FF8000` to `E77817` (official TTC orange per Metro Route Atlas)
3. **Fix Line 6 ROUTE_COLOR** from `808080` (construction grey) to `969594` (official TTC grey per Metro Route Atlas)
4. **Do NOT add Ontario Line** — Ontario Line is not operational today; it belongs only in the future baseline

> Line 5 Eglinton Crosstown opened February 8, 2026 (confirmed operational).
> Line 6 Finch West opened December 7, 2025 (confirmed operational).

### ttc-routes-future.geojson (future committed baseline)

Same corrections as today, **plus**:

5. **Add Ontario Line** as a new `LineString` feature:
   - `ROUTE_ID: 7`
   - `ROUTE_SHORT_NAME: "OL"`
   - `ROUTE_LONG_NAME: "Ontario Line"`
   - `ROUTE_COLOR: "00A4E3"` (blue — matches Wikipedia/transit community usage)
   - `status: "under_construction"`
   - Geometry: hand-authored following the route description (Exhibition → downtown → Pape → Don Valley), verified against satellite/OSM station node positions

### ttc-stations.geojson (today baseline)

6. **Remove 5 Scarborough RT stations**: MCCOWAN, SCARBOROUGH CENTRE, MIDLAND, ELLESMERE, LAWRENCE EAST — Line 3 decommissioned March 2023
7. **Keep all 68 remaining stations** with existing ArcGIS coords (20–100 m offset is acceptable for subway stations at zoom 11)
8. **Do NOT add Line 5 or Line 6 stations** to today file — the today file only contains subway stations that existed prior to the LRT openings, and the baseline mode toggle handles the distinction

> Decision note: `baselineMode === "today"` loads `ttc-stations.geojson`. Since Line 5 and Line 6 are now open, they should appear in the today file. However, since the today file structure has no `ROUTE_ID` for existing subway stations, the cleanest approach is to **add Line 5 and Line 6 stations to the today file** with GTFS coordinates and add `ROUTE_ID` properties, keeping the today/future distinction meaningful. See Open Questions below.

### ttc-stations-future.geojson (future committed baseline)

9. **Replace Line 5 stations** (21 ArcGIS entries) with 25 GTFS-derived entries using platform midpoint coordinates
10. **Replace Line 6 stations** (9 ArcGIS entries) with 18 GTFS-derived entries using platform midpoint coordinates
11. **Add Ontario Line stations** (15 stations, hand-authored coordinates):
    Exhibition, King–Bathurst, Queen–Spadina, Osgoode, Queen, Moss Park, Corktown, East Harbour, Riverside–Leslieville, Gerrard, Pape, Cosburn, Thorncliffe Park, Flemingdon Park, Don Valley

### ttc-layers.tsx

12. **Add Ontario Line layer** with `line-dasharray` styling:
    - Solid base layer at reduced opacity
    - Dashed overlay layer (same color, `line-dasharray: [4, 3]`)
13. **Update Line 6 color** from `#808080` to `#969594`
14. **Update Line 5 color** from `#DF6C2B` to `#E77817` (or keep current if visually close enough)

### baseline-types.ts

15. **Add `status` to `TtcRouteProperties`** type: `status?: "operational" | "under_construction"`

---

## Common Pitfalls

### Pitfall 1: Line 5 Station Count Mismatch
**What goes wrong:** The future stations file has 21 Line 5 entries using old pre-opening project names (e.g., `SCIENCE CENTRE`, `BAYVIEW (CROSSTOWN)`, `DON MILLS (CROSSTOWN)`). The actual opened line has 25 stations with different official names (`Don Valley`, `Aga Khan Park & Museum`, etc.).
**Why it happens:** The file was authored before the line opened; station names changed during construction.
**How to avoid:** Use GTFS `stops.txt` station names directly — these are the official post-opening TTC names.
**Warning signs:** Station names with `(CROSSTOWN)` suffix, or references to `SCIENCE CENTRE` which is now `Don Valley`.

### Pitfall 2: Line 6 Station Count Mismatch
**What goes wrong:** The future stations file has only 9 Line 6 entries (partial list from early planning). The actual opened line has 18 stops.
**Why it happens:** File was created before final station list was confirmed.
**How to avoid:** Use GTFS `stops.txt` — it contains all 18 stations.

### Pitfall 3: Ontario Line Not in ArcGIS or GTFS
**What goes wrong:** Querying ArcGIS Layer 11 or TTC GTFS returns no Ontario Line data — it is not in either official source.
**Why it happens:** Ontario Line is still under construction (target 2031); TTC doesn't publish GTFS for unbuilt lines.
**How to avoid:** Hand-author the Ontario Line geometry from Wikipedia station list and route description. Use OSM station node positions as reference coordinates.

### Pitfall 4: `line-dasharray` Does Not Support Feature-State Expressions
**What goes wrong:** Attempting `"line-dasharray": ["case", ["==", ["get", "status"], "under_construction"], ["literal", [4,3]], ["literal", [1,0]]]` fails or produces no dashes.
**Why it happens:** MapLibre spec explicitly states `line-dasharray` arrays can only be written with `["literal", [...]]` — the outer `case` may not work reliably in all MapLibre versions.
**How to avoid:** Use a separate `<Layer>` with a fixed `filter` for the under-construction feature. Don't try to drive dasharray from feature properties.
**Verified approach:** Two layers on the same source — one solid (`line-opacity: 0.4`) and one dashed overlay.

### Pitfall 5: Scarborough RT Stations Still in Today File
**What goes wrong:** MCCOWAN, SCARBOROUGH CENTRE, MIDLAND, ELLESMERE, LAWRENCE EAST still appear as station dots in the today baseline.
**Why it happens:** They are in `ttc-stations.geojson` and have no line assignment — no filter removes them.
**How to avoid:** Explicitly remove these 5 features from `ttc-stations.geojson`.

### Pitfall 6: today vs future Baseline Divergence for Lines 5 and 6
**What goes wrong:** Lines 5 and 6 are now open but only appear in the `future_committed` baseline. In `baselineMode === "today"`, they are invisible.
**Why it happens:** The original data was authored when Lines 5/6 were future projects.
**How to avoid:** Add Lines 5 and 6 station data to `ttc-stations.geojson` and ensure `ttc-routes.geojson` includes them. Both lines are open as of the current date (2026-04-01).

---

## Code Examples

### Adding status to a route feature
```json
{
  "type": "Feature",
  "id": 5,
  "geometry": { "type": "MultiLineString", "coordinates": [...] },
  "properties": {
    "ROUTE_ID": 5,
    "ROUTE_SHORT_NAME": "5",
    "ROUTE_LONG_NAME": "Line 5 Eglinton",
    "ROUTE_COLOR": "E77817",
    "ROUTE_TEXT_COLOR": "FFFFFF",
    "status": "operational"
  }
}
```

### Ontario Line feature (hand-authored)
```json
{
  "type": "Feature",
  "id": 7,
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-79.4182, 43.6320],
      ...
      [-79.3393, 43.7201]
    ]
  },
  "properties": {
    "ROUTE_ID": 7,
    "ROUTE_SHORT_NAME": "OL",
    "ROUTE_LONG_NAME": "Ontario Line",
    "ROUTE_COLOR": "00A4E3",
    "ROUTE_TEXT_COLOR": "FFFFFF",
    "status": "under_construction"
  }
}
```

### ttc-layers.tsx — Ontario Line with construction style
```typescript
{/* Ontario Line — under construction (blue dashed) */}
<Layer
  id="ttc-line-7-base"
  type="line"
  filter={["==", ["get", "ROUTE_ID"], 7]}
  paint={{
    "line-color": "#00A4E3",
    "line-width": 4,
    "line-opacity": 0.5,
  }}
  layout={{ "line-cap": "round", "line-join": "round" }}
/>
<Layer
  id="ttc-line-7-dash"
  type="line"
  filter={["==", ["get", "ROUTE_ID"], 7]}
  paint={{
    "line-color": "#00A4E3",
    "line-width": 4,
    "line-dasharray": [4, 3],
  }}
  layout={{ "line-cap": "round", "line-join": "round" }}
/>
```

### GTFS stop midpoint extraction (Python one-liner pattern)
```python
# For each Line 5 station, average the westbound/eastbound platform coords
unique_bases = {}
for stop in line5_stops:
    base = stop["stop_name"].replace("Westbound Platform","").replace("Eastbound Platform","").replace("LRT Platform","").strip()
    if base not in unique_bases:
        unique_bases[base] = []
    unique_bases[base].append((float(stop["stop_lon"]), float(stop["stop_lat"])))

stations = [
    {"name": base, "lon": sum(c[0] for c in coords)/len(coords), "lat": sum(c[1] for c in coords)/len(coords)}
    for base, coords in unique_bases.items()
]
```

---

## Official TTC Line Colors (verified via Metro Route Atlas, 2025)

| Line | Official Color | Hex | Notes |
|------|---------------|-----|-------|
| 1 Yonge-University | Yellow | `#F8C300` | Currently `#FFC41F` in layers — close enough |
| 2 Bloor-Danforth | Green | `#009263` | Currently `#009A44` in layers — close enough |
| 4 Sheppard | Raspberry | `#A21A68` | Currently `#800080` in layers — acceptable |
| 5 Eglinton | Orange | `#E77817` | Currently `#DF6C2B` in layers — very close |
| 6 Finch West | Grey | `#969594` | Currently `#808080` — must update (was construction grey) |
| Ontario Line | Blue | `#00A4E3` | Not yet in layers — per transit community consensus |

> Color refinement is a judgment call for Claude's discretion. The primary deliverable is line presence, status styling, and station alignment. Color precision is secondary.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Line 3 Scarborough RT | Decommissioned, replaced by bus service | March 2023 | Remove from today baseline |
| Line 5 status: under construction | Line 5 opened (operational) | February 8, 2026 | Update status field, use operational color |
| Line 6 status: under construction | Line 6 opened (operational) | December 7, 2025 | Update status field, update color from grey |
| 73 subway stations in today file | 73 - 5 Scarborough + Lines 5/6 LRT stations | Phase 6 | Add new GTFS-sourced entries |

---

## Open Questions

1. **Should Lines 5 and 6 appear in the today baseline?**
   - What we know: Lines 5 and 6 opened in 2025/2026, so as of 2026-04-01 they ARE open
   - What's unclear: The codebase treats `ttc-stations.geojson` as "today" and `ttc-stations-future.geojson` as "future committed" — Lines 5/6 need to move from future to today
   - Recommendation: Yes. Add Lines 5 and 6 stations (with GTFS coords) and routes (with `status: operational`) to both `ttc-routes.geojson` and `ttc-stations.geojson`. The today baseline should reflect the current state of TTC service.

2. **How accurate must the Ontario Line geometry be?**
   - What we know: Route runs Exhibition → King/Bathurst → Osgoode → Queen → Pape → Don Valley; 15.6 km, under construction until ~2031
   - What's unclear: No official GeoJSON or GTFS data exists; hand-authoring needed
   - Recommendation: Hand-author a plausible centerline that matches the known station locations. Use OSM node positions for stations (they are well-researched). The geometry needs to be visually convincing at zoom 11, not survey-accurate.

3. **Should existing subway station coordinates (Lines 1, 2, 4) also be updated?**
   - What we know: They are 20–100 m off the route; GTFS stops.txt has better coords (~30 m off)
   - What's unclear: Whether this visual offset is noticeable enough to fix in this phase
   - Recommendation: Out of scope for this phase. The 20–100 m offset is barely perceptible at zoom 11 (the default view). Focus on Lines 5 and 6 where the offset is 300–1600 m.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3 | GTFS extraction script | ✓ | System Python | Node.js script |
| curl / internet access | GTFS download | ✓ | — | Pre-download zip manually |
| TTC GTFS feed (ckan0.cf.opendata.inter.prod-toronto.ca) | Station coordinates | ✓ (verified 2026-04-01) | Live feed | Use cached data from `/tmp/ttc_gtfs_data/` |
| City of Toronto ArcGIS Layer 11 | Route geometry (optional) | ✓ (verified 2026-04-01) | Live API | Existing GeoJSON is same data |

**No missing dependencies.**

---

## Sources

### Primary (HIGH confidence)
- TTC GTFS `stops.txt` — station coordinates for Lines 5, 6 (downloaded and verified 2026-04-01)
- TTC GTFS `shapes.txt` — confirmed identical coord count/extent to existing GeoJSON routes (same source data)
- City of Toronto ArcGIS Layer 11 — queried live; confirms 5 routes (no Ontario Line)

### Secondary (MEDIUM confidence)
- [Line 5 Eglinton Wikipedia](https://en.wikipedia.org/wiki/Line_5_Eglinton) — 25 stations, official names, opened Feb 8 2026
- [Line 6 Finch West Wikipedia](https://en.wikipedia.org/wiki/Line_6_Finch_West) — 18 stops, opened Dec 7 2025
- [Ontario Line Wikipedia](https://en.wikipedia.org/wiki/Ontario_Line) — 15 stations, route description, under construction
- [Metro Route Atlas Color Notes](https://metrorouteatlas.net/color_notes.html) — official TTC line colors verified
- [Railway Age: Eglinton Crosstown Opens Feb 8](https://www.railwayage.com/passenger/light-rail/eglinton-crosstown-substantially-complete/) — confirmed opening date
- [Railway Age: Finch West Opens Dec 7](https://www.railwayage.com/passenger/light-rail/coming-dec-7-finch-line-west/) — confirmed opening date

### Tertiary (LOW confidence)
- [MapLibre Style Spec: line-dasharray](https://maplibre.org/maplibre-style-spec/layers/) — `line-dasharray` limitation: arrays must use `["literal", [...]]`, data-driven expressions not reliably supported (confirmed by issue #1235)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — GTFS download verified, ArcGIS API verified, all quantities measured from actual files
- Architecture: HIGH — no new infrastructure needed, existing patterns sufficient
- Pitfalls: HIGH — all identified from direct file inspection and measurement

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (GTFS changes every 6 weeks; Ontario Line construction status stable)
