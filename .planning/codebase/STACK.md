# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript 5 - Application code, typed configuration, and React components in `app/`, `components/`, and `lib/`

**Secondary:**
- JavaScript (ES modules) - Tooling configuration in `eslint.config.mjs` and `postcss.config.mjs`
- CSS - Global styling entrypoint in `app/globals.css`

## Runtime

**Environment:**
- Node.js (version unspecified, inferred ^18+ from TypeScript and Next.js 16)

**Package Manager:**
- npm - `package-lock.json` present
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.2.1 - App Router web application framework, routing, and server rendering (`next.config.ts`)
- React 19.2.4 - Component model and JSX rendering
- React DOM 19.2.4 - Browser rendering companion for Next.js

**Testing:**
- Vitest 4.1.2 - Unit and integration test runner (`vitest.config.ts`)
  - Configured with Node environment
  - Excludes `.claude/worktrees/**` to avoid scanning agent worktrees
  - Path alias support for `@` mapping to repo root

**Build/Dev:**
- TypeScript 5 - Static type checking and compilation
- Tailwind CSS 4 - Utility-first styling with PostCSS integration
- @tailwindcss/postcss 4 - Tailwind PostCSS plugin for CSS processing
- ESLint 9 - Code linting with Next.js and TypeScript rule sets
- eslint-config-next 16.2.1 - Next.js-specific linting rules

## Key Dependencies

**Mapping & Geospatial:**
- maplibre-gl 5.21.1 - Open-source vector tile map rendering, primary mapping library
- react-map-gl 8.1.0 - React wrapper for maplibre-gl with component API
- @turf/turf 7.3.4 - Geospatial analysis library for geometry calculations (snapping, proximity detection)

**UI:**
- lucide-react 1.7.0 - Icon component library for React

**Type Support:**
- @types/node 20 - Node.js type definitions for server-side code
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions

## Configuration

**Environment:**
- NEXT_PUBLIC_MAPTILER_KEY - MapTiler Cloud API key (required for map tiles)
  - Defined in `.env.local` (not committed)
  - Example template: `.env.local.example`
  - Free plan available at https://cloud.maptiler.com

**Build:**
- `tsconfig.json` - TypeScript compiler options with strict mode enabled and path aliases (`@/*` → repo root)
- `next.config.ts` - Next.js configuration (currently minimal placeholder)
- `eslint.config.mjs` - ESLint configuration with Next.js core-web-vitals and TypeScript rule sets
  - Ignores: `.next/`, `out/`, `build/`, `.claude/`, `.planning/`
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS

## Platform Requirements

**Development:**
- Node.js 18+ (inferred from TypeScript 5 and Next.js 16)
- npm (lockfile-based dependency management)
- macOS, Linux, or Windows (platform-agnostic)

**Production:**
- Node.js 18+ runtime
- Standard Next.js hosting targets supported:
  - Node-based hosting (self-hosted)
  - Vercel (optimized for Next.js)
  - Docker containerization
- Not configured in repo code today — deployment target is not wired up

## Scripts

**Development:**
```bash
npm run dev       # Start Next.js dev server
npm run build     # Build for production
npm run start     # Run production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript type check
npm run test      # Run Vitest
```

---

*Stack analysis: 2026-04-01*
