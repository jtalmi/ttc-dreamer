# Technology Stack

**Analysis Date:** 2026-03-31

## Languages

**Primary:**
- TypeScript 5 - Application code and typed configuration in `app/layout.tsx`, `app/page.tsx`, `next.config.ts`, and `tsconfig.json`

**Secondary:**
- JavaScript (ES modules) - Tooling configuration in `eslint.config.mjs` and `postcss.config.mjs`
- CSS - Global styling entrypoint in `app/globals.css`
- Markdown - Product direction and workflow definitions in `docs/product/` and `.claude/`

## Runtime

**Environment:**
- Node.js - Required to run `next`, `eslint`, and TypeScript tooling via `package.json`
- Browser runtime - Served by Next.js for the eventual editor UI, though the current app is a static scaffold

**Package Manager:**
- npm - `package-lock.json` is present, and scripts are declared in `package.json`

## Frameworks

**Core:**
- Next.js 16.2.1 - App Router web application framework
- React 19.2.4 - UI rendering model used by the route components
- React DOM 19.2.4 - Browser/server rendering companion for React

**Testing:**
- No dedicated unit, integration, or E2E test framework is installed yet

**Build/Dev:**
- TypeScript 5 - Static typing and editor tooling
- Tailwind CSS 4 - Utility-first styling, imported through `app/globals.css`
- `@tailwindcss/postcss` - Tailwind PostCSS integration configured in `postcss.config.mjs`
- ESLint 9 with `eslint-config-next` 16.2.1 - Linting and framework rules

## Key Dependencies

**Critical:**
- `next@16.2.1` - Defines the routing, rendering, metadata, and build model
- `react@19.2.4` - Component model for the application shell
- `react-dom@19.2.4` - Required for Next.js rendering
- `tailwindcss@^4` - Styling system foundation
- `eslint-config-next@16.2.1` - Keeps the repo aligned with Next.js conventions

**Infrastructure:**
- `typescript@^5` - Type checking through `npm run typecheck`
- `@types/node`, `@types/react`, `@types/react-dom` - Development-time type support

## Configuration

**Environment:**
- No project-specific environment variables are declared yet
- `.env*` files are ignored by `.gitignore`, so future secrets are expected to live outside git

**Build:**
- `next.config.ts` - Next.js configuration entrypoint
- `tsconfig.json` - Strict TypeScript and path alias configuration
- `eslint.config.mjs` - ESLint rules and ignore list
- `postcss.config.mjs` - Tailwind/PostCSS integration

## Platform Requirements

**Development:**
- Any platform that can run Node.js and npm
- No database, Docker, or external service is required for the current scaffold

**Production:**
- No deployment target is configured yet
- The stack is compatible with standard Next.js hosting targets such as Node-based hosting or Vercel, but that is not wired up in repo code today

---
*Stack analysis: 2026-03-31*
*Update after major dependency changes*
