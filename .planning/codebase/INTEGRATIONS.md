# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**Maps & Tiles:**
- MapTiler Cloud - Vector tile basemap and map styling service
  - SDK/Client: maplibre-gl 5.21.1 (open-source vector tile renderer)
  - Auth: `NEXT_PUBLIC_MAPTILER_KEY` (required, public API key)
  - Usage: Map rendering and styling in `components/editor/toronto-map.tsx`

**Geocoding:**
- OpenStreetMap Nominatim - Free reverse geocoding service for street addresses
  - Endpoint: `https://nominatim.openstreetmap.org/reverse`
  - Client: Browser `fetch()` API with 3-second timeout
  - Rate limiting: Cached results to avoid redundant requests (4 decimal place coordinate precision ≈ 11m)
  - Usage: Convert station coordinates to street names/cross-streets in `lib/geocoding/reverse-geocode.ts`
  - User-Agent: `TorontoTransitSandbox/1.0`

## Data Storage

**Databases:**
- Not used - No persistent database integrated

**File Storage:**
- Local filesystem only - GeoJSON baseline data files served from `public/data/` directory
  - Data files:
    - `ttc-routes.geojson` - Current TTC rapid transit route lines
    - `ttc-stations.geojson` - Current TTC subway station points
    - `ttc-routes-future.geojson` - Future-committed TTC lines (Lines 5 & 6)
    - `ttc-stations-future.geojson` - Future-committed TTC stops
    - `go-routes.geojson` - GO rail corridor lines
    - `go-stations.geojson` - GO train station points
    - `neighbourhoods.geojson` - Toronto neighbourhood centroids
    - `landmarks.geojson` - Toronto landmark points
    - `bus-corridors.geojson` - Bus rapid transit corridors
    - `streetcar-corridors.geojson` - Streetcar line corridors
  - Loaded via `fetch()` calls in `lib/baseline/baseline-data.ts`
  - No database connection — all data is read-only during runtime

**Caching:**
- In-memory browser cache - Nominatim geocoding results cached by rounded coordinate
  - Cache key precision: 4 decimal places (≈11m accuracy)
  - Client-side only, lost on page refresh
  - No server-side cache configured

## Authentication & Identity

**Auth Provider:**
- Not used - No user authentication or authorization system integrated

## Monitoring & Observability

**Error Tracking:**
- Not detected - No error tracking service (Sentry, Rollbar, etc.) integrated

**Logs:**
- Console logging only - No structured logging library configured
- Browser console for client-side errors
- No server-side logging framework configured

## CI/CD & Deployment

**Hosting:**
- Not configured - No deployment target wired up in code
- Compatible with: Vercel (native Next.js), Node-based hosting, Docker containerization

**CI Pipeline:**
- Not detected - No CI service configuration found (.github/workflows, .gitlab-ci.yml, etc.)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_MAPTILER_KEY` - MapTiler Cloud API key (required for map tiles)

**Optional env vars:**
- None currently defined

**Secrets location:**
- `.env.local` - Local environment file (in `.gitignore`, not committed)
- Secrets must be sourced from `.env.local` at runtime
- Example template: `.env.local.example` (checked into git)

## Webhooks & Callbacks

**Incoming:**
- Not detected - No webhook endpoints configured

**Outgoing:**
- Not detected - No outgoing webhooks to external services

## Network Requests

**Baseline Data Loading:**
- Synchronous `fetch()` calls to local `/data/*` endpoints during component mount
- Data loaded in `components/editor/toronto-map.tsx` via functions in `lib/baseline/baseline-data.ts`
- Errors thrown if loading fails (e.g., 404, network error)

**Reverse Geocoding:**
- Asynchronous `fetch()` to Nominatim with:
  - 3-second timeout (`AbortSignal.timeout(3000)`)
  - Graceful failure: returns `null` on network error, rate limit, or timeout
  - User-Agent header required by Nominatim policy

---

*Integration audit: 2026-04-01*
