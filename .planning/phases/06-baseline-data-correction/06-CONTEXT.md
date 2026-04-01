# Phase 6: Baseline Data Correction - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure/data phase — discuss skipped)

<domain>
## Phase Boundary

Replace GeoJSON data files with accurate TTC geometry and updated line statuses. Lines must pass through station dots. Eglinton Crosstown and Finch West LRT shown as operational. Ontario Line shown as under construction with distinct visual style. All current TTC rapid transit lines represented.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure data correction phase. Use ROADMAP phase goal, success criteria, and existing baseline-data infrastructure to guide decisions.

Key guidance from research:
- City of Toronto ArcGIS FeatureServer layer 11 is the current TTC data source
- Ontario Line geometry can be sourced from OpenStreetMap via Overpass API
- Add a `status` property (`operational | under_construction | planned`) for styling differentiation
- Baseline data correction touches only `public/data/*.geojson` files and paint expressions in `ttc-layers.tsx`

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/baseline/baseline-data.ts` — data loading utilities
- `components/map/ttc-layers.tsx` — TTC layer rendering and styling
- `public/data/` — GeoJSON data files for TTC and GO

### Established Patterns
- GeoJSON loaded via fetch in baseline-data.ts
- MapLibre paint/layout expressions for layer styling
- BaselineMode type (`today | future_committed`) for switching views

### Integration Points
- `ttc-layers.tsx` renders TTC lines and stations from GeoJSON source
- `baseline-data.ts` fetches and transforms GeoJSON data
- `toronto-map.tsx` consumes baseline layers

</code_context>

<specifics>
## Specific Ideas

- Lines not always touching station dots — need coordinate alignment
- Eglinton Crosstown and Finch West LRT are live as of today (2026)
- Ontario Line is under construction
- Some lines may be missing from the baseline entirely

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
