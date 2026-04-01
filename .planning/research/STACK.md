# Stack Research

**Domain:** Desktop-first transit map sandbox
**Researched:** 2026-03-31
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.1 | Application shell, routing, deployment-friendly web runtime | Already installed in the repo and suitable for a shareable editor/viewer split |
| React | 19.2.4 | Interactive editor UI | Required for the map-first editing surface and inspector/sidebar flows |
| TypeScript | 5.x | Domain modeling and safer geometry/stat logic | The proposal, station, segment, and interchange model will benefit from explicit types |
| Tailwind CSS | 4.x | Fast UI composition and visual system | Matches the current scaffold and supports a custom Toronto-forward design system without heavy setup |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Repo-local domain modules in `lib/` | N/A | Proposal, line, station, segment, and stat logic | Start in Phase 1 before adding rendering complexity |
| Browser storage adapter | TBD during Phase 1 | Local persistence for works-in-progress if retained in scope | Introduce once the proposal model exists |
| Map/canvas rendering choice | TBD during Phase 1 planning | Toronto base map and proposal visualization | Choose after Phase 1 clarifies the editing interaction model |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint with `eslint-config-next` | Guardrail for framework usage | Already configured in `eslint.config.mjs` |
| TypeScript strict mode | Catch model and wiring errors early | Already enabled in `tsconfig.json` |
| GSD planning workflow | Phase-based delivery discipline | Checked into `.claude/` and now backed by `.planning/` artifacts |

## Installation

```bash
# Core
npm install next react react-dom

# Supporting
# TBD during phase planning once the map/rendering approach is selected

# Dev dependencies
npm install -D typescript tailwindcss @tailwindcss/postcss eslint eslint-config-next
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js App Router | Pure client-side SPA | Only if the project abandons shareable routes and wants a client-only bundle, which the current docs do not suggest |
| Tailwind CSS 4 | Hand-written global CSS system | Reasonable for a very small UI, but slower to scale across toolbar, sidebar, inspector, and share view surfaces |
| Repo-local typed domain model | Ad hoc component state only | Avoid unless the project stays toy-sized; editor features and stats will become brittle quickly without a shared model |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Mobile-first UI assumptions | Conflicts with the explicit desktop-first creation target in `AGENTS.md` and `docs/product/` | Design desktop-first and add mobile viewing later if needed |
| Realism-heavy planning tools in v1 | Conflicts with the fun-first product intent | Keep stats descriptive and the editing flow playful |
| Building features before the state model | Will make editing, stats, and sharing inconsistent | Establish proposal data structures early in Phase 1 |

## Stack Patterns by Variant

**If the editor remains mostly local-first in v1:**
- Keep state and persistence on the client initially
- Because the first validation goal is fast proposal creation, not multi-user sync

**If unlisted sharing requires server persistence in Phase 5:**
- Add only the smallest backend/storage layer needed for saved proposal payloads
- Because v1 does not need a full social platform or account system

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@16.2.1` | `react@19.2.4` | Current repo baseline |
| `tailwindcss@^4` | `@tailwindcss/postcss` | Current PostCSS setup |

## Sources

- `docs/product/gsd-idea.md` — Product shape and v1 feature set
- `docs/product/product-spec.md` — Scope boundaries and editor behaviors
- `docs/product/ui-vision.md` — UI direction and interaction model
- `docs/product/phase-plan-notes.md` — Proposed delivery sequence
- `AGENTS.md` — Product guardrails and technical defaults
- `package.json` — Installed framework/runtime choices

---
*Stack research for: desktop-first transit map sandbox*
*Researched: 2026-03-31*
