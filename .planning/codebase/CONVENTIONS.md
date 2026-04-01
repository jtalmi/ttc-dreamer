# Coding Conventions

**Analysis Date:** 2026-03-31

## Naming Patterns

**Files:**
- App Router reserved filenames for routes and layouts (`app/page.tsx`, `app/layout.tsx`)
- Kebab-case markdown files for product docs (`docs/product/gsd-idea.md`, `docs/product/ui-vision.md`)
- Conventional ecosystem config filenames at repo root (`next.config.ts`, `eslint.config.mjs`)

**Functions:**
- PascalCase for React component functions (`Home`, `RootLayout`)
- camelCase for config variables (`nextConfig`, `eslintConfig`)
- No distinct naming pattern for async handlers yet because none exist

**Variables:**
- camelCase for local variables
- Object literals use concise descriptive keys (`title`, `description`)
- No constant naming pattern is established yet beyond framework defaults

**Types:**
- `import type` is preferred for type-only imports (`Metadata` in `app/layout.tsx`)
- Inline `Readonly<{ ... }>` typing is used for component props

## Code Style

**Formatting:**
- 2-space indentation
- Double quotes for strings
- Semicolons are required
- Trailing commas appear in multi-line objects and arrays

**Linting:**
- ESLint 9 via `eslint.config.mjs`
- Next.js core-web-vitals and TypeScript rule sets are enabled
- Run: `npm run lint`

## Import Organization

**Order:**
1. External packages and type imports
2. Relative local imports such as `./globals.css`

**Grouping:**
- Small files use minimal grouping without extra blank sections
- Type-only imports are spelled with `import type`

**Path Aliases:**
- `@/*` maps to the repo root via `tsconfig.json`
- The alias is configured but not yet used in current source files

## Error Handling

**Patterns:**
- Rely on TypeScript, ESLint, and Next.js defaults for the current scaffold
- No custom error classes or result wrappers are established yet
- Build-time validation is the main guardrail before runtime

**Error Types:**
- Type issues should fail `npm run typecheck`
- Lint issues should fail `npm run lint`
- No app-level user-facing error patterns are defined yet

## Logging

**Framework:**
- No logging library is configured

**Patterns:**
- No committed `console` patterns are established in the current scaffold

## Comments

**When to Comment:**
- Comments are sparse and used for intent, not narration
- Existing comments in config files explain why ignores or placeholders exist

**JSDoc/TSDoc:**
- Not used in the current scaffold

**TODO Comments:**
- No TODO pattern is established yet

## Function Design

**Size:**
- Current functions are small, single-purpose React components or config exports

**Parameters:**
- Props are typed inline and wrapped in `Readonly` for React components
- No broader parameter conventions are established yet

**Return Values:**
- Components return JSX directly
- Config files export plain objects

## Module Design

**Exports:**
- Default exports are used for route components and top-level config objects
- Named exports are used for metadata alongside default component export in `app/layout.tsx`

**Barrel Files:**
- None yet

---
*Convention analysis: 2026-03-31*
*Update when patterns change*
