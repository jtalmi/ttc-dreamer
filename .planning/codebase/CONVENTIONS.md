# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**
- React component files use PascalCase: `ShareModal.tsx`, `EditorShell.tsx` (in `components/`)
- Utility and library modules use kebab-case: `proposal-state.ts`, `proposal-geometry.ts`, `proposal-types.ts` (in `lib/`)
- Test files mirror source structure with `.test.ts` suffix: `proposal-history.test.ts` (in `tests/`)
- Type definition files use kebab-case with `-types` suffix: `proposal-types.ts`, `sharing-types.ts`

**Functions:**
- camelCase for all function names, including factory functions, reducers, and helpers
- Examples: `createInitialProposalDraft()`, `proposalEditorReducer()`, `deriveWaypointsFromStations()`, `findSnapTarget()`, `computeLineLength()`
- No naming prefix/suffix for async functions — async keyword is explicit

**Variables:**
- camelCase for all local variables, constants, and parameters
- Examples: `titleValue`, `shareUrl`, `baseState`, `stationMap`
- Tuples and coordinate pairs use short names: `[number, number]` for lng/lat, `s1`, `line1` in test helpers

**Types:**
- PascalCase for all TypeScript types, interfaces, and type aliases
- Examples: `ProposalDraft`, `ProposalLineDraft`, `ProposalStationDraft`, `SharePayload`, `DrawingSession`, `SnapResult`
- Type name suffix conventions: `Draft` for proposal editing state, `Action` for reducer actions
- Suffixes avoid redundancy: `type ProposalDraft` not `ProposalDraftType`

**Constants:**
- UPPER_SNAKE_CASE for exported constants and enumerations
- Examples: `DEFAULT_LINE_COLORS`, `EXTENDED_SWATCH_COLORS`, `SPEED_KMH`, `COST_PER_KM_M`, `RIDERSHIP_PER_STATION`

## Code Style

**Formatting:**
- 2-space indentation (enforced by project)
- Double quotes for all strings
- Semicolons required on all statements
- Trailing commas in multi-line objects, arrays, and function signatures

**Linting:**
- ESLint 9 with `eslint-config-next` rule sets
- ESLint config: `eslint.config.mjs`
- Rule sets: `core-web-vitals`, `typescript`
- Excludes from linting: `.next/`, `out/`, `build/`, `.claude/`, `.planning/`
- Run: `npm run lint`

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx
- Type checking: `npm run typecheck` via `tsc --noEmit`

## Import Organization

**Order:**
1. Type imports from external libraries: `import type { Metadata } from "next";`
2. Default imports from external libraries: `import { useState } from "react";`
3. Named imports from external libraries: `import { describe, it, expect } from "vitest";`
4. Type imports from local modules: `import type { ProposalDraft } from "@/lib/proposal/proposal-types";`
5. Default imports from local modules: `import EditorShell from "@/components/editor/editor-shell";`
6. Named imports from local modules: `import { createInitialProposalDraft } from "@/lib/proposal/proposal-state";`

**Path Aliases:**
- `@/*` maps to repository root via `tsconfig.json`
- Used in all imports from `lib/`, `components/`, `tests/`
- Examples: `@/lib/proposal/proposal-state`, `@/components/sharing/share-modal`, `@/tests/proposal/proposal-history.test.ts`

**Barrel Files:**
- Pattern established in `lib/` modules: each directory has `index.ts` that re-exports types and functions
- Examples: `lib/sharing/index.ts`, `lib/baseline/index.ts`, `lib/proposal/index.ts`
- Re-exports include type declarations with `export type { ... }` and function/constant exports with `export { ... }`
- Barrel imports are uncommented and serve as primary import source for module consumers

## Error Handling

**No custom error wrapper pattern established yet.**

**Observed patterns:**
- Type safety via TypeScript strict mode catches errors at compile time
- Validation functions use guard clauses with early returns: `if (typeof parsed !== "object" || parsed === null) return null;` in `decode-proposal.ts`
- Null coalescing in validation: `const p = parsed as Record<string, unknown>; if (p["v"] !== 1 && p["v"] !== 2) return null;`
- Try/catch blocks used around async operations that may fail (e.g., clipboard writes, map exports)
- Error logging uses `console.error()` with context prefix: `console.error("[ShareModal] Export failed:", err);`
- No thrown custom errors; validation returns null instead of throwing

## Logging

**Framework:** `console` (no logging library installed)

**Patterns:**
- `console.error()` used for error reporting with context prefix in brackets
- Examples: `console.error("[ShareModal] Export failed:", err);`, `console.error("[ShareModal] Clipboard write failed:", err);`
- Error prefix format: `[ComponentOrModuleName] Context description`
- No logging for normal control flow; logging is reserved for unexpected failures
- No structured logging or log levels implemented

## Comments

**When to Comment:**
- JSDoc comments on public functions and type definitions explain intent and parameters
- Inline comments explain non-obvious decisions, workarounds, or complex logic
- Comments are sparse — code readability is preferred over narration

**JSDoc/TSDoc Pattern:**
```typescript
/**
 * Derives [lng, lat] waypoints from an ordered list of station IDs.
 * Iterates stationIds in order, looks up each station by id in the stations array,
 * and collects their positions. Skips any stationId not found.
 */
export function deriveWaypointsFromStations(
  stationIds: string[],
  stations: ProposalStationDraft[],
): [number, number][] {
```

- Parameter descriptions included when function purpose isn't self-documenting
- Return type is explicit, no separate `@returns` block needed for simple cases
- Comments explain "why" (e.g., "Skips any stationId not found") not "what" (e.g., "iterating stationIds")

## Function Design

**Size:**
- Keep functions small and single-purpose
- Example: `dist2D()` computes distance between two 2D points only
- Geometry helpers in `lib/proposal/proposal-geometry.ts` are pure, deterministic, and testable

**Parameters:**
- Type all parameters explicitly
- Use tuple types for coordinates: `[number, number]` for lng/lat pairs
- Avoid parameter objects when 2-3 parameters suffice; use objects for 4+ parameters
- Example simple: `dist2D(a: {x: number, y: number}, b: {x: number, y: number}): number`
- Example complex with object: `proposalEditorReducer(state: EditorShellState, action: EditorShellAction): EditorShellState`

**Return Values:**
- Explicit return types are required
- Functions return `null` when validation fails (not `undefined` or thrown errors)
- Functions return new objects (immutable pattern) rather than mutating input
- Example: `const draft = { ...v1.draft, lines: [...v1.draft.lines], stations: [...v1.draft.stations] };` in `decode-proposal.ts`

**Component Functions (React):**
- Component props are typed inline with `Readonly<{ ... }>` wrapper
- Example from `share-modal.tsx`:
  ```typescript
  type ShareModalProps = Readonly<{
    draft: ProposalDraft;
    mapRef: MapRef | null;
    onTitleChange: (title: string) => void;
    onClose: () => void;
  }>;
  ```
- Destructure props in function signature
- All event handlers use camelCase: `handleTitleChange()`, `handleExport()`, `handleCreateLink()`

## Module Design

**Exports:**
- Default exports used for React components: `export default function Home() { ... }` in `app/page.tsx`
- Named exports used for utility functions and types: `export function createInitialProposalDraft() { ... }`
- Barrel files combine both patterns: `export type { ... }` and `export { ... }`

**Module Structure:**
- Type definitions grouped at top of files or in dedicated `-types.ts` files
- Helper functions grouped by domain (e.g., geometry helpers, stat computation, encoding/decoding)
- Comments indicate module purpose at the top: `// Pure geometry helpers for the proposal editor. All functions are deterministic and have no side effects.`

**Readonly Pattern:**
- Immutable structures preferred where possible
- Props wrapped in `Readonly<{ ... }>` to prevent accidental mutation
- State objects spread when modified: `{ ...state, field: newValue }`
- Array operations use spread to avoid mutation: `[...array, newItem]`

---

*Convention analysis: 2026-04-01*
