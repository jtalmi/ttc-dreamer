# Codebase Structure

**Analysis Date:** 2026-03-31

## Directory Layout

```text
ttc-dreamer/
├── .claude/            # Local GSD workflow assets, templates, commands, hooks
├── .next/              # Generated Next.js build/dev output
├── app/                # App Router entrypoints and global CSS
├── components/         # Reserved for shared React components (currently empty)
├── docs/               # Product direction and planning inputs
│   └── product/        # Human-authored product source-of-truth docs
├── e2e/                # Reserved for end-to-end tests (currently empty)
├── lib/                # Reserved for domain logic and helpers (currently empty)
├── public/             # Reserved for static assets (currently empty)
├── styles/             # Reserved for additional style assets (currently empty)
├── tests/              # Reserved for unit/integration tests (currently empty)
├── AGENTS.md           # Project guardrails and product priorities
├── CLAUDE.md           # Repo-level agent bootstrap file
├── README.md           # Project overview and intended workflow
├── next.config.ts      # Next.js configuration
├── package.json        # Scripts and dependencies
├── package-lock.json   # npm lockfile
├── postcss.config.mjs  # Tailwind/PostCSS wiring
└── tsconfig.json       # TypeScript compiler configuration
```

## Directory Purposes

**`.claude/`:**
- Purpose: Bundle the local GSD system used by this repo
- Contains: Slash-command definitions, workflow markdown, templates, hooks, and CLI helpers
- Key files: `.claude/commands/gsd/new-project.md`, `.claude/commands/gsd/map-codebase.md`, `.claude/get-shit-done/bin/gsd-tools.cjs`
- Subdirectories: `commands/`, `get-shit-done/`, `agents/`, `hooks/`

**`app/`:**
- Purpose: Next.js App Router entrypoints
- Contains: Route files and global CSS
- Key files: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Subdirectories: None today

**`docs/product/`:**
- Purpose: Human-authored product source of truth
- Contains: Idea, spec, UI vision, and initial phase notes
- Key files: `docs/product/gsd-idea.md`, `docs/product/product-spec.md`, `docs/product/ui-vision.md`, `docs/product/phase-plan-notes.md`
- Subdirectories: None

**`components/`, `lib/`, `tests/`, `e2e/`, `public/`, `styles/`:**
- Purpose: Reserved implementation locations for later phases
- Contains: Currently empty directories
- Key files: None yet
- Subdirectories: None yet

## Key File Locations

**Entry Points:**
- `app/page.tsx` - Home route placeholder
- `app/layout.tsx` - Root HTML wrapper and metadata
- `package.json` - Runtime scripts (`dev`, `build`, `start`, `lint`, `typecheck`)

**Configuration:**
- `next.config.ts` - Next.js config
- `tsconfig.json` - TypeScript config and `@/*` path alias
- `eslint.config.mjs` - Lint rules and ignore list
- `postcss.config.mjs` - Tailwind/PostCSS config
- `.gitignore` - Ignored files and folders

**Core Logic:**
- There is no domain logic module yet; future product logic is expected to land in `lib/` and `components/`

**Testing:**
- `tests/` - Intended unit/integration test location
- `e2e/` - Intended browser/end-to-end test location

**Documentation:**
- `README.md` - Repo overview and intended workflow
- `AGENTS.md` - Guardrails and product priorities
- `docs/product/` - Source product documents
- `.claude/` - Workflow and template documentation

## Naming Conventions

**Files:**
- App Router reserved names such as `layout.tsx` and `page.tsx`
- Kebab-case markdown docs in `docs/product/`
- Root config files follow ecosystem defaults (`next.config.ts`, `eslint.config.mjs`)

**Directories:**
- Lowercase top-level directories
- Flat reserved folders for shared code (`components/`, `lib/`, `tests/`, `e2e/`)

**Special Patterns:**
- `.claude/commands/gsd/{command}.md` for workflow entrypoints
- `.claude/get-shit-done/{templates,workflows,references}/` for GSD internals

## Where to Add New Code

**New Feature:**
- Primary code: `app/` for route-level UI and `components/` for reusable editor pieces
- Tests: `tests/` for domain helpers and `e2e/` for UI flows
- Config if needed: top-level config files or future feature-local config in `lib/`

**New Component/Module:**
- Implementation: `components/`
- Types and helpers: `lib/`
- Tests: `tests/`

**New Route/Command:**
- Route definition: `app/`
- Local workflow command changes: `.claude/commands/gsd/`
- Tests: `e2e/` or `tests/`, depending on scope

**Utilities:**
- Shared helpers: `lib/`
- Source-of-truth docs: `docs/product/`

## Special Directories

**`.next/`:**
- Purpose: Generated development/build output
- Source: Next.js compiler and dev server
- Committed: No, ignored by `.gitignore`

**`.planning/`:**
- Purpose: Generated GSD planning artifacts
- Source: Local GSD workflows
- Committed: Intended to be tracked by config, but not yet present before initialization

---
*Structure analysis: 2026-03-31*
*Update when directory structure changes*
