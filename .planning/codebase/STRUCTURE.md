# Codebase Structure

**Analysis Date:** 2026-04-01

## Directory Layout

```
ttc-dreamer/
├── app/                     # Next.js App Router entry points and layout
│   ├── page.tsx             # Root page (renders EditorShell)
│   ├── layout.tsx           # Root layout wrapper
│   └── globals.css          # Global styles and CSS variables
├── components/              # React UI components organized by domain
│   ├── editor/              # Main editor interface components
│   │   ├── editor-shell.tsx # Top-level state management and orchestration
│   │   ├── editor-frame.tsx # Layout composition (map + sidebar + floating controls)
│   │   ├── toronto-map.tsx  # MapLibre canvas with all layer and interaction logic
│   │   ├── map-stage.tsx    # Map container wrapper
│   │   ├── sidebar-shell.tsx # Sidebar container with header and toggle
│   │   ├── floating-drawing-toolbar.tsx # Tool selector overlay
│   │   ├── floating-layer-picker.tsx # Baseline/comparison mode toggles overlay
│   │   ├── baseline-toggle.tsx # Baseline mode selector (today/future-committed)
│   │   ├── top-toolbar.tsx  # Top action bar (title, share, sidebar toggle)
│   │   └── sidebar/         # Sidebar panel components
│   │       ├── line-list.tsx # List of proposal lines with actions
│   │       ├── line-creation-panel.tsx # Form to create new line
│   │       ├── line-inspector-panel.tsx # Edit line properties and stations
│   │       ├── station-inspector-panel.tsx # Edit station name and location
│   │       ├── baseline-line-inspector-panel.tsx # Read-only TTC line details
│   │       ├── baseline-station-inspector-panel.tsx # Read-only TTC station details
│   │       ├── proposal-stats-panel.tsx # Network stats display (cost, ridership, etc)
│   │       ├── station-name-popover.tsx # Inline name input during drawing
│   │       ├── interchange-badge.tsx # Visual indicator for shared stations
│   │       └── confirmation-dialog.tsx # Delete confirmation modal
│   ├── map/                 # MapLibre layer rendering components
│   │   ├── ttc-layers.tsx   # Operational TTC lines + stations
│   │   ├── go-layers.tsx    # GO Train routes + stations (read-only context)
│   │   ├── proposal-layers.tsx # Proposed lines + stations being edited
│   │   ├── corridor-layers.tsx # Bus/streetcar rapid corridor context
│   │   ├── station-labels.tsx # Station name labels for all networks
│   │   └── context-labels.tsx # Neighborhood and landmark labels
│   └── sharing/             # Share/export and read-only view components
│       ├── share-modal.tsx  # Encode proposal to URL, show preview, copy/download
│       ├── shared-view-shell.tsx # Read-only view for shared URLs
│       └── onboarding-tooltip.tsx # First-time user guidance
├── lib/                     # Domain logic and utilities (no React dependencies)
│   ├── proposal/            # Core proposal editor state and geometry
│   │   ├── proposal-types.ts # Type contracts for drafts, actions, UI state
│   │   ├── proposal-state.ts # proposalEditorReducer and action handlers
│   │   ├── proposal-history.ts # historyReducer for undo/redo
│   │   ├── proposal-geometry.ts # Pure geometry helpers (snap, waypoints, GeoJSON)
│   │   ├── proposal-stats.ts # Pure stat computation (cost, ridership, etc)
│   │   └── index.ts         # Barrel re-exports for proposal module
│   ├── baseline/            # TTC + GO network reference data
│   │   ├── baseline-types.ts # Type definitions for TTC/GO features
│   │   ├── baseline-data.ts # Loader functions for GeoJSON from /data
│   │   └── index.ts         # Barrel re-exports for baseline module
│   ├── sharing/             # URL encoding/decoding and export
│   │   ├── sharing-types.ts # SharePayloadV1/V2 schema definitions
│   │   ├── encode-proposal.ts # Encode draft to URL-safe string
│   │   ├── decode-proposal.ts # Decode and validate share URLs
│   │   ├── export-utils.ts  # Map snapshot and PNG export
│   │   └── index.ts         # Barrel re-exports for sharing module
│   └── geocoding/           # Geographic coordinate utilities
│       ├── reverse-geocode.ts # Resolve coordinates to neighborhood names
│       └── (no index.ts — single export)
├── tests/                   # Vitest unit and integration tests
│   ├── proposal/            # Tests for state, geometry, history, stats
│   │   ├── proposal-geometry.test.ts
│   │   ├── proposal-history.test.ts
│   │   ├── proposal-state-*.test.ts (multiple variants)
│   │   └── proposal-stats.test.ts
│   ├── sharing/             # Tests for encoding, decoding, export
│   │   ├── encode-proposal.test.ts
│   │   ├── decode-proposal.test.ts
│   │   ├── export-utils.test.ts
│   │   └── v1-share-fixture.test.ts
│   └── geocoding/           # Tests for reverse geocoding
│       └── reverse-geocode.test.ts
├── public/                  # Static assets
│   └── data/                # GeoJSON baseline data (neighborhoods, landmarks, etc)
├── styles/                  # (Reserved; empty for now — use app/globals.css)
├── e2e/                     # (Reserved; empty for now — playwright config present)
├── .claude/                 # GSD workflow and product documentation
│   ├── commands/            # GSD command definitions
│   ├── get-shit-done/       # Workflow templates and orchestration logic
│   ├── scheduled_tasks.lock # Task scheduler state
│   └── worktrees/           # Git worktree workspace
├── .planning/               # (Generated by GSD) Codebase analysis docs
│   └── codebase/            # Architecture, structure, conventions, testing docs
├── docs/                    # Product direction and design
│   └── product/             # Product spec, vision, phase plans
├── .next/                   # (Generated) Next.js build output and cache
├── node_modules/            # (Generated) Dependencies
├── Configuration Files
│   ├── next.config.ts       # Next.js build and runtime config
│   ├── tsconfig.json        # TypeScript compiler options and path aliases
│   ├── eslint.config.mjs    # ESLint rules (Next.js + core-web-vitals)
│   ├── postcss.config.mjs   # PostCSS for Tailwind integration
│   ├── vitest.config.ts     # Vitest test runner configuration
│   ├── package.json         # Dependencies and scripts
│   └── package-lock.json    # Locked dependency versions
├── .gitignore               # Git ignore rules (env, .next, etc)
├── .env.local.example       # Environment variable template
└── README.md                # Project overview
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router entry points and root layout
- Contains: Route components (only `/` defined), metadata, global CSS
- Key files: `page.tsx` (renders EditorShell), `layout.tsx` (wraps all routes), `globals.css` (CSS variables for design system)

**`components/`:**
- Purpose: All React UI components organized by feature/domain
- Contains: Editor shell and frame, map rendering, sidebar panels, sharing UI
- Subdomains:
  - `editor/` — Main editor interface and top-level orchestration
  - `editor/sidebar/` — Right-hand sidebar panel components
  - `map/` — MapLibre layer rendering (pure data → GeoJSON)
  - `sharing/` — Share modal, read-only view shell, onboarding tooltip

**`lib/`:**
- Purpose: Domain logic with no React dependencies (pure functions, reducers, types)
- Contains: Proposal state machine, geometry helpers, baseline data loaders, sharing codecs
- Submodules:
  - `proposal/` — Editor state, geometry, stats (core of the application)
  - `baseline/` — TTC + GO reference data types and loaders
  - `sharing/` — URL encoding/decoding, export utilities
  - `geocoding/` — Coordinate-to-neighborhood resolution

**`tests/`:**
- Purpose: Unit and integration tests for pure functions and reducers
- Contains: Vitest test suites mirroring `lib/` structure
- Pattern: `*.test.ts` files co-located with tested modules; describe/it structure

**`public/data/`:**
- Purpose: Static GeoJSON files for baseline networks and geographic context
- Contains: TTC lines, TTC stations, GO lines, GO stations, neighborhoods, landmarks, corridors
- Loaded by: `lib/baseline/` loaders via fetch at map component mount

**`.claude/`:**
- Purpose: GSD (Get Shit Done) workflow orchestration and product direction
- Contains: Command definitions, workflow templates, scheduled task state

**`docs/product/`:**
- Purpose: Product specification and design decisions (separate from code)
- Contains: Product vision, phase plans, research notes

## Key File Locations

**Entry Points:**
- `app/page.tsx` — Web UI root (renders EditorShell)
- `app/layout.tsx` — Root layout wrapper
- `components/editor/editor-shell.tsx` — Top-level component with state management

**Configuration:**
- `next.config.ts` — Next.js build settings
- `tsconfig.json` — TypeScript compiler options and path aliases (`@/*` → root)
- `eslint.config.mjs` — Linting rules
- `vitest.config.ts` — Test runner configuration

**Core Logic:**
- `lib/proposal/proposal-state.ts` — Main editor reducer (proposalEditorReducer)
- `lib/proposal/proposal-history.ts` — Undo/redo history wrapper
- `lib/proposal/proposal-geometry.ts` — Spatial math and GeoJSON builders
- `lib/proposal/proposal-stats.ts` — Metric computations

**Map Rendering:**
- `components/editor/toronto-map.tsx` — MapLibre canvas initialization and interaction logic
- `components/map/*.tsx` — Layer rendering components (TTC, GO, proposal, context)

**Sharing:**
- `components/sharing/share-modal.tsx` — Share UI and image export
- `lib/sharing/encode-proposal.ts` — Compress draft to URL
- `lib/sharing/decode-proposal.ts` — Decompress shared URL

**Baseline Data:**
- `lib/baseline/baseline-data.ts` — Loader functions
- `public/data/*.geojson` — Static GeoJSON files

## Naming Conventions

**Files:**
- **React components**: PascalCase (e.g., `EditorShell.tsx`, `LineList.tsx`)
- **Utility/pure modules**: camelCase (e.g., `proposal-geometry.ts`, `baseline-data.ts`)
- **Test files**: `*.test.ts` suffix
- **Type definition files**: `*-types.ts` suffix
- **Barrel exports**: `index.ts` to re-export module contents
- **Config files**: kebab-case with extensions (e.g., `next.config.ts`, `eslint.config.mjs`)

**Directories:**
- **Feature/domain-based grouping**: `components/editor/`, `lib/proposal/`
- **Subdomain nesting**: `components/editor/sidebar/` for sidebar-specific panels
- **Lower-case plural for collection dirs**: `components/`, `lib/`, `tests/`

**Variables & Functions:**
- **camelCase**: All variables, functions, and exports (e.g., `editorShellState`, `historyReducer`, `placeStation`)
- **UPPER_SNAKE_CASE**: Constants only (e.g., `DEFAULT_LINE_COLORS`, `MAX_HISTORY`, `SPEED_KMH`)
- **Type names**: PascalCase (e.g., `ProposalDraft`, `EditorShellState`, `DrawingSession`)
- **Action type discriminants**: camelCase (e.g., `"addLine"`, `"startDrawing"`, `"confirmDeletion"`)

## Where to Add New Code

**New Feature (Complete End-to-End):**
1. **Types**: Define in `lib/proposal/proposal-types.ts` or domain-specific `*-types.ts`
2. **State logic**: Add action and handler to `lib/proposal/proposal-state.ts`
3. **Tests**: Add test in `tests/proposal/proposal-state-*.test.ts`
4. **UI component**: Create in `components/editor/` or `components/editor/sidebar/`
5. **Export from barrel**: Update `lib/proposal/index.ts`

**New Component/Module:**
- **Editor UI component**: `components/editor/{feature-name}.tsx` (or in subdomain if related to sidebar/map)
- **Pure domain logic**: `lib/{domain}/{feature-name}.ts` (e.g., `lib/proposal/proposal-new-thing.ts`)
- **Tests for domain logic**: `tests/{domain}/proposal-new-thing.test.ts`

**Utilities (Shared Helpers):**
- **Geometry/math**: `lib/proposal/proposal-geometry.ts` (establish as canonical location for spatial math)
- **Stats/computation**: `lib/proposal/proposal-stats.ts` (extend for new metrics)
- **Geocoding/location**: `lib/geocoding/reverse-geocode.ts` (or new file in geocoding/)
- **Sharing/export**: `lib/sharing/{feature}.ts`

**Tests:**
- **Location**: Mirror the `lib/` structure under `tests/`
- **Naming**: `{what}.test.ts` (e.g., `proposal-geometry.test.ts`, `baseline-data.test.ts`)
- **Runner**: `npm run test` — Vitest will auto-discover

**Styles:**
- **Global CSS**: `app/globals.css` (main entry for Tailwind and design tokens)
- **Component-scoped styles**: Inline styles (preferred for consistent design tokens) or utility classes (Tailwind)
- **No CSS modules** currently in use

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes
- Committed: No (in `.gitignore`)

**`tests/`:**
- Purpose: Vitest test suites
- Generated: No (authored)
- Committed: Yes
- Run: `npm run test`

**`public/data/`:**
- Purpose: Static GeoJSON baseline networks and geography
- Generated: No (authored, should be committed)
- Committed: Yes
- Accessed: Via fetch requests from map components

**`.planning/`:**
- Purpose: Generated codebase analysis docs (ARCHITECTURE.md, STRUCTURE.md, etc)
- Generated: By GSD commands
- Committed: Yes (docs serve as reference)

**`.claude/`:**
- Purpose: GSD workflow configuration and product direction
- Generated: Partly (task state); mostly authored
- Committed: Yes

---

*Structure analysis: 2026-04-01*
