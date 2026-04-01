# Architecture

**Analysis Date:** 2026-03-31

## Pattern Overview

**Overall:** Docs-driven Next.js App Router scaffold with embedded GSD planning workflows

**Key Characteristics:**
- Single-page web scaffold rendered from `app/page.tsx`
- Planning and workflow logic lives alongside product code under `.claude/`
- No persistent state, API routes, database layer, or domain modules yet
- Product direction is intentionally specified in `docs/product/` before feature implementation begins

## Layers

**Product Direction Layer:**
- Purpose: Define what the product is supposed to become before implementation
- Contains: `AGENTS.md`, `docs/product/gsd-idea.md`, `docs/product/product-spec.md`, `docs/product/ui-vision.md`, `docs/product/phase-plan-notes.md`
- Depends on: Human-authored product decisions
- Used by: GSD planning artifacts and future implementation work

**Planning Workflow Layer:**
- Purpose: Provide the local GSD command definitions, templates, and workflow logic
- Contains: `.claude/commands/gsd/*.md`, `.claude/get-shit-done/workflows/*.md`, `.claude/get-shit-done/templates/*.md`, `.claude/get-shit-done/bin/*.cjs`
- Depends on: Node.js runtime and repo-local markdown/json assets
- Used by: Project initialization, codebase mapping, phase planning, and later execution workflows

**Application Shell Layer:**
- Purpose: Serve the current web UI scaffold
- Contains: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Depends on: Next.js, React, Tailwind CSS
- Used by: Browser requests to `/`

**Expansion Layer (Empty Placeholders):**
- Purpose: Hold future shared UI, domain logic, tests, and assets
- Contains: `components/`, `lib/`, `tests/`, `e2e/`, `public/`, `styles/`
- Depends on: Future feature work
- Used by: Planned TTC editor implementation

## Data Flow

**HTTP Request to Home Page:**

1. Developer runs `npm run dev`, `npm run build`, or `npm run start` from `package.json`
2. Next.js boots the App Router using `app/layout.tsx` as the root shell
3. Request for `/` resolves to `app/page.tsx`
4. The page returns a static scaffold message about initializing GSD planning
5. Tailwind utilities are loaded through `app/globals.css`
6. HTML is returned with no app-specific data fetching or mutations

**State Management:**
- None today beyond framework-managed render state
- No client components, local storage, server actions, or backend persistence are present

## Key Abstractions

**Route Component:**
- Purpose: Define a route's rendered output
- Examples: `Home` in `app/page.tsx`, `RootLayout` in `app/layout.tsx`
- Pattern: File-based App Router entrypoints with default exports

**Planning Artifact:**
- Purpose: Capture product intent and workflow state outside source code
- Examples: `docs/product/*.md`, `.planning/*.md`, `.claude/get-shit-done/templates/*.md`
- Pattern: Markdown-first planning and orchestration

**Repo Scaffold Directory:**
- Purpose: Reserve stable locations for future implementation slices
- Examples: `components/`, `lib/`, `tests/`, `e2e/`
- Pattern: Empty top-level folders established before product code exists

## Entry Points

**Web App Root:**
- Location: `app/page.tsx`
- Triggers: Browser request to `/`
- Responsibilities: Render the placeholder landing screen

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every App Router render
- Responsibilities: Define metadata and wrap page content

**Workflow CLI Helpers:**
- Location: `.claude/get-shit-done/bin/gsd-tools.cjs`
- Triggers: Local workflow commands invoked through shell-based helper calls
- Responsibilities: Initialize config, inspect state, and manage generated planning files

## Error Handling

**Strategy:** Defer to framework defaults and build-time validation

**Patterns:**
- Type errors are caught by `tsc --noEmit`
- Lint issues are caught by `npm run lint`
- No app-level error boundaries or custom error classes exist yet

## Cross-Cutting Concerns

**Logging:**
- No structured logging layer exists

**Validation:**
- TypeScript strict mode in `tsconfig.json`
- Next.js/ESLint rule bundles in `eslint.config.mjs`

**Authentication:**
- Not implemented

---
*Architecture analysis: 2026-03-31*
*Update when major patterns change*
