@AGENTS.md

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Toronto Transit Sandbox**

Toronto Transit Sandbox is a desktop-first web app for Toronto transit fans to create, edit, and share custom TTC rapid transit proposals on top of a preloaded Toronto map. Users start from the current or future-committed baseline, extend or branch TTC lines, invent entirely new subway, LRT, or BRT ideas, and shape a full fantasy network that still feels unmistakably local.

**Core Value:** Make it fast and satisfying for Toronto transit nerds to sketch a TTC-flavoured proposal they want to share.

### Constraints

- **Product**: Toronto-native context must stay prominent — it is one of the core differentiators
- **Product**: Keep scoring descriptive, not judgmental — v1 is not an official planning tool
- **UX**: Desktop-first creation and map-first layout — editing should prioritize large-screen composition
- **UX**: Prefer visible tools and manual placement with light snapping — user control matters more than automation
- **Domain**: Baseline TTC infrastructure may only change through allowed extensions and branches — preserves the “what if” sandbox framing
- **Domain**: GO is visible but not editable in v1 — it provides context rather than a second editing surface
- **Delivery**: Keep phases small and shippable — the roadmap should avoid giant “build everything” phases
- **Technical**: Add tests for domain logic and geometry helpers where practical — those areas will become correctness hotspots quickly
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5 - Application code and typed configuration in `app/layout.tsx`, `app/page.tsx`, `next.config.ts`, and `tsconfig.json`
- JavaScript (ES modules) - Tooling configuration in `eslint.config.mjs` and `postcss.config.mjs`
- CSS - Global styling entrypoint in `app/globals.css`
- Markdown - Product direction and workflow definitions in `docs/product/` and `.claude/`
## Runtime
- Node.js - Required to run `next`, `eslint`, and TypeScript tooling via `package.json`
- Browser runtime - Served by Next.js for the eventual editor UI, though the current app is a static scaffold
- npm - `package-lock.json` is present, and scripts are declared in `package.json`
## Frameworks
- Next.js 16.2.1 - App Router web application framework
- React 19.2.4 - UI rendering model used by the route components
- React DOM 19.2.4 - Browser/server rendering companion for React
- No dedicated unit, integration, or E2E test framework is installed yet
- TypeScript 5 - Static typing and editor tooling
- Tailwind CSS 4 - Utility-first styling, imported through `app/globals.css`
- `@tailwindcss/postcss` - Tailwind PostCSS integration configured in `postcss.config.mjs`
- ESLint 9 with `eslint-config-next` 16.2.1 - Linting and framework rules
## Key Dependencies
- `next@16.2.1` - Defines the routing, rendering, metadata, and build model
- `react@19.2.4` - Component model for the application shell
- `react-dom@19.2.4` - Required for Next.js rendering
- `tailwindcss@^4` - Styling system foundation
- `eslint-config-next@16.2.1` - Keeps the repo aligned with Next.js conventions
- `typescript@^5` - Type checking through `npm run typecheck`
- `@types/node`, `@types/react`, `@types/react-dom` - Development-time type support
## Configuration
- No project-specific environment variables are declared yet
- `.env*` files are ignored by `.gitignore`, so future secrets are expected to live outside git
- `next.config.ts` - Next.js configuration entrypoint
- `tsconfig.json` - Strict TypeScript and path alias configuration
- `eslint.config.mjs` - ESLint rules and ignore list
- `postcss.config.mjs` - Tailwind/PostCSS integration
## Platform Requirements
- Any platform that can run Node.js and npm
- No database, Docker, or external service is required for the current scaffold
- No deployment target is configured yet
- The stack is compatible with standard Next.js hosting targets such as Node-based hosting or Vercel, but that is not wired up in repo code today
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- App Router reserved filenames for routes and layouts (`app/page.tsx`, `app/layout.tsx`)
- Kebab-case markdown files for product docs (`docs/product/gsd-idea.md`, `docs/product/ui-vision.md`)
- Conventional ecosystem config filenames at repo root (`next.config.ts`, `eslint.config.mjs`)
- PascalCase for React component functions (`Home`, `RootLayout`)
- camelCase for config variables (`nextConfig`, `eslintConfig`)
- No distinct naming pattern for async handlers yet because none exist
- camelCase for local variables
- Object literals use concise descriptive keys (`title`, `description`)
- No constant naming pattern is established yet beyond framework defaults
- `import type` is preferred for type-only imports (`Metadata` in `app/layout.tsx`)
- Inline `Readonly<{ ... }>` typing is used for component props
## Code Style
- 2-space indentation
- Double quotes for strings
- Semicolons are required
- Trailing commas appear in multi-line objects and arrays
- ESLint 9 via `eslint.config.mjs`
- Next.js core-web-vitals and TypeScript rule sets are enabled
- Run: `npm run lint`
## Import Organization
- Small files use minimal grouping without extra blank sections
- Type-only imports are spelled with `import type`
- `@/*` maps to the repo root via `tsconfig.json`
- The alias is configured but not yet used in current source files
## Error Handling
- Rely on TypeScript, ESLint, and Next.js defaults for the current scaffold
- No custom error classes or result wrappers are established yet
- Build-time validation is the main guardrail before runtime
- Type issues should fail `npm run typecheck`
- Lint issues should fail `npm run lint`
- No app-level user-facing error patterns are defined yet
## Logging
- No logging library is configured
- No committed `console` patterns are established in the current scaffold
## Comments
- Comments are sparse and used for intent, not narration
- Existing comments in config files explain why ignores or placeholders exist
- Not used in the current scaffold
- No TODO pattern is established yet
## Function Design
- Current functions are small, single-purpose React components or config exports
- Props are typed inline and wrapped in `Readonly` for React components
- No broader parameter conventions are established yet
- Components return JSX directly
- Config files export plain objects
## Module Design
- Default exports are used for route components and top-level config objects
- Named exports are used for metadata alongside default component export in `app/layout.tsx`
- None yet
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Single-page web scaffold rendered from `app/page.tsx`
- Planning and workflow logic lives alongside product code under `.claude/`
- No persistent state, API routes, database layer, or domain modules yet
- Product direction is intentionally specified in `docs/product/` before feature implementation begins
## Layers
- Purpose: Define what the product is supposed to become before implementation
- Contains: `AGENTS.md`, `docs/product/gsd-idea.md`, `docs/product/product-spec.md`, `docs/product/ui-vision.md`, `docs/product/phase-plan-notes.md`
- Depends on: Human-authored product decisions
- Used by: GSD planning artifacts and future implementation work
- Purpose: Provide the local GSD command definitions, templates, and workflow logic
- Contains: `.claude/commands/gsd/*.md`, `.claude/get-shit-done/workflows/*.md`, `.claude/get-shit-done/templates/*.md`, `.claude/get-shit-done/bin/*.cjs`
- Depends on: Node.js runtime and repo-local markdown/json assets
- Used by: Project initialization, codebase mapping, phase planning, and later execution workflows
- Purpose: Serve the current web UI scaffold
- Contains: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Depends on: Next.js, React, Tailwind CSS
- Used by: Browser requests to `/`
- Purpose: Hold future shared UI, domain logic, tests, and assets
- Contains: `components/`, `lib/`, `tests/`, `e2e/`, `public/`, `styles/`
- Depends on: Future feature work
- Used by: Planned TTC editor implementation
## Data Flow
- None today beyond framework-managed render state
- No client components, local storage, server actions, or backend persistence are present
## Key Abstractions
- Purpose: Define a route's rendered output
- Examples: `Home` in `app/page.tsx`, `RootLayout` in `app/layout.tsx`
- Pattern: File-based App Router entrypoints with default exports
- Purpose: Capture product intent and workflow state outside source code
- Examples: `docs/product/*.md`, `.planning/*.md`, `.claude/get-shit-done/templates/*.md`
- Pattern: Markdown-first planning and orchestration
- Purpose: Reserve stable locations for future implementation slices
- Examples: `components/`, `lib/`, `tests/`, `e2e/`
- Pattern: Empty top-level folders established before product code exists
## Entry Points
- Location: `app/page.tsx`
- Triggers: Browser request to `/`
- Responsibilities: Render the placeholder landing screen
- Location: `app/layout.tsx`
- Triggers: Every App Router render
- Responsibilities: Define metadata and wrap page content
- Location: `.claude/get-shit-done/bin/gsd-tools.cjs`
- Triggers: Local workflow commands invoked through shell-based helper calls
- Responsibilities: Initialize config, inspect state, and manage generated planning files
## Error Handling
- Type errors are caught by `tsc --noEmit`
- Lint issues are caught by `npm run lint`
- No app-level error boundaries or custom error classes exist yet
## Cross-Cutting Concerns
- No structured logging layer exists
- TypeScript strict mode in `tsconfig.json`
- Next.js/ESLint rule bundles in `eslint.config.mjs`
- Not implemented
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
