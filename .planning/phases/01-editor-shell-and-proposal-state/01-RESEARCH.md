# Phase 1: Editor Shell and Proposal State - Research

**Researched:** 2026-03-31
**Domain:** Next.js App Router shell planning for an interactive desktop editor
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Keep Phase 1 narrow: app shell, full-screen map area, toolbar scaffold, collapsible sidebar scaffold, proposal state shape, and a baseline toggle shell only
- Do **not** start Phase 2 work or load real Toronto transit/context-layer data in this phase
- Treat the map surface as a Toronto-labelled placeholder stage, not a blank white canvas and not a real TTC data render
- The experience stays desktop-first and map-first; the map area is the dominant surface
- Core tools remain visible in a lightweight top toolbar rather than hidden in menus
- The sidebar scaffold must be collapsible and supportive, not the visual center of the screen
- Toolbar actions other than shell interactions may be present as scaffolds only; no real editing behavior is required yet
- Define a proposal state shape that is future-facing enough for lines, stations, segments, and interchanges, but do not implement those editing flows yet
- The baseline toggle is real UI state with exact values `today` and `future_committed`, but it only switches shell state in Phase 1
- The initial proposal state should assume the user is opening a preloaded Toronto sandbox shell, even though the real baseline dataset is deferred

### Claude's Discretion
- Exact file/component boundaries for the shell
- Whether the route stays a Server Component wrapping a Client Component shell
- The exact placeholder copy inside the map area and sidebar, as long as it stays Phase-1 scoped
- The exact future-facing proposal type names and internal reducer/helper shape

### Deferred Ideas (OUT OF SCOPE)
- Real TTC baseline rendering
- GO context rendering
- Neighbourhood, street, landmark, or station labels
- Bus/streetcar corridor layers
- New line, extension, or station editing behavior
- Interchange suggestions, snapping, and undo/redo
- Stats, inspectors, before/after comparison, or sharing flows

</user_constraints>

<research_summary>
## Summary

Phase 1 should stay dependency-light and route almost all interactivity through a single narrow Client Component boundary. The current repo already has the right baseline for this: App Router, a root layout, Tailwind 4 wiring through `app/globals.css`, and static metadata in `app/layout.tsx`.

The standard Next.js 16 approach for this scope is: keep `app/page.tsx` as a Server Component, move interactive editor behavior into a client-only shell component, and keep state in repo-local TypeScript modules plus React state/reducer hooks rather than adding a global store or map library too early. The primary recommendation is to establish a future-facing proposal draft shape now and wire a UI-only `today` / `future_committed` toggle through that shared state, while keeping all Toronto data and real editing mechanics deferred.

**Primary recommendation:** Use `app/page.tsx` as a thin server wrapper around a client `EditorShell`, and keep Phase 1 state in `lib/proposal/*` plus `useReducer`, with no new dependencies.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for this phase:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Route shell, layout/page conventions, metadata | Already installed and documented locally; layouts/pages are Server Components by default |
| React | 19.2.4 | Client-side interactivity for the shell | Needed for toolbar state, sidebar collapse, and baseline toggle behavior |
| TypeScript | 5.x | Proposal state contracts and reducer helpers | Best fit for a future-facing editor model |
| Tailwind CSS | 4.x | Layout and shell styling | Already configured through `app/globals.css` and `postcss.config.mjs` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No additional UI kit | N/A | Keep Phase 1 narrow | Use while the shell is still scaffold-only |
| React `useReducer` | Built-in | Shared editor shell state | Use instead of external state packages for this initial phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React `useReducer` + local modules | Zustand or another store library | Useful later if state fans out widely, but unnecessary dependency for the initial shell |
| Placeholder map stage | A real map/canvas engine in Phase 1 | Would blur the Phase 1/Phase 2 boundary and invite real Toronto data too early |

**Installation:**
```bash
# No new packages recommended for Phase 1
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```text
app/
├── layout.tsx                  # Root layout and metadata
├── page.tsx                    # Thin server wrapper for the shell
└── globals.css                 # Global tokens and shell styling

components/
└── editor/
    ├── editor-shell.tsx        # Client orchestrator
    ├── editor-frame.tsx        # Presentational shell wrapper
    ├── top-toolbar.tsx         # Visible tool scaffold
    ├── baseline-toggle.tsx     # Today/Future committed control
    ├── map-stage.tsx           # Full-screen placeholder surface
    └── sidebar-shell.tsx       # Collapsible sidebar scaffold

lib/
└── proposal/
    ├── proposal-types.ts       # Draft proposal and shell types
    ├── proposal-state.ts       # Initial state + reducer/helpers
    └── index.ts                # Re-exports for the shell
```

### Pattern 1: Server Route, Client Shell
**What:** Keep `app/page.tsx` server-rendered and delegate interactive editor behavior to a client component.
**When to use:** Any time a page mostly renders static frame chrome but needs browser interactivity inside a bounded region.
**Example:**
```tsx
import { EditorShell } from "@/components/editor/editor-shell";

export default function Page() {
  return <EditorShell />;
}
```

### Pattern 2: Domain-First Shell State
**What:** Define proposal and shell types in `lib/proposal/*` before wiring UI behavior.
**When to use:** Before adding editing mechanics, stats, or sharing.
**Example:**
```ts
export type BaselineMode = "today" | "future_committed";

export type ProposalDraft = {
  baselineMode: BaselineMode;
  lines: ProposalLineDraft[];
  stations: ProposalStationDraft[];
};
```

### Pattern 3: Presentational Pieces + One Orchestrator
**What:** Keep toolbar, sidebar, and map stage presentational; let one client shell compose them with state.
**When to use:** When a narrow shell phase should stay easy to reason about and later phases will add behavior gradually.
**Example:**
```tsx
"use client";

const [state, dispatch] = useReducer(proposalEditorReducer, undefined, createInitialProposalDraft);
return <EditorFrame toolbar={...} map={...} sidebar={...} />;
```

### Anti-Patterns to Avoid
- **Starting a real map stack now:** pulls Phase 2 into Phase 1 and breaks the scope lock
- **Marking the whole route tree as client-only:** increases client JS when only the shell needs interactivity
- **Hard-coding shell strings/state inside multiple components:** creates duplicate sources of truth before editing even begins
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| App-level routing shell | Custom HTML document wrapper | Standard App Router `layout.tsx` + `page.tsx` files | Next.js already defines the required root layout model |
| State synchronization across shell pieces | Ad hoc prop strings duplicated in multiple components | A typed proposal state module plus a reducer | Keeps toggle/sidebar/tool state coherent from day one |
| Toolbar icons in Phase 1 | A bespoke icon system right away | Text-first scaffold buttons | Avoids unnecessary design-system scope before real tools exist |

**Key insight:** Phase 1 is about establishing clean boundaries, not building infrastructure that later phases may replace.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Letting Toronto data slip into the shell phase
**What goes wrong:** The implementation starts importing baseline lines, labels, or context layers before the shell is stable.
**Why it happens:** The product premise is so map-heavy that builders try to make it feel “real” immediately.
**How to avoid:** Keep the map stage explicitly placeholder-only in Phase 1 and defer all real data files.
**Warning signs:** New files start resembling baseline datasets or geo renderers.

### Pitfall 2: Building UI pieces without a shared proposal shape
**What goes wrong:** Baseline toggle, sidebar state, and tool state all live in separate local component states.
**Why it happens:** It feels faster for an empty scaffold.
**How to avoid:** Create the future-facing draft proposal and shell reducer first.
**Warning signs:** Multiple components each define their own `baselineMode` or `sidebarOpen` state.

### Pitfall 3: Letting the sidebar compete with the map
**What goes wrong:** The shell reads like a dashboard rather than an editor.
**Why it happens:** Sidebar content is easier to elaborate than map-stage composition.
**How to avoid:** Fix the focal point in the UI-SPEC and keep the sidebar narrow and collapsible.
**Warning signs:** The sidebar becomes wider than the map stage on desktop mockups.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from project and official local docs:

### Narrow client boundary for the shell
```tsx
// Source: Next.js local docs + current repo structure
import { EditorShell } from "@/components/editor/editor-shell";

export default function Page() {
  return <EditorShell />;
}
```

### Proposal draft state contract
```ts
// Source: Phase 1 planning recommendation
export type BaselineMode = "today" | "future_committed";

export type ProposalDraft = {
  baselineMode: BaselineMode;
  lines: ProposalLineDraft[];
  stations: ProposalStationDraft[];
};
```

### Tailwind/global CSS remains rooted in the app layout
```tsx
// Source: current repo + Next.js local CSS guide
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```
</code_examples>

<sota_updates>
## State of the Art (2024-2025)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Treating App Router pages as implicitly client-ish | App Router pages/layouts are Server Components by default | Current Next.js App Router model | Keep the client boundary narrow and explicit |
| Tailwind setup via older config-first patterns | Tailwind 4 setup through `@tailwindcss/postcss` + `@import 'tailwindcss'` | Current repo baseline | Phase 1 styling should extend the existing setup, not replace it |

**New tools/patterns to consider:**
- Narrow client islands for interactivity inside otherwise server-rendered routes
- Typed domain contracts early, even for UI shell phases, to avoid future editing rewrites

**Deprecated/outdated:**
- Treating the whole page as a client component by default when only the editor shell needs local state
- Pulling in a full design system or mapping stack before the shell contract is proven
</sota_updates>

<open_questions>
## Open Questions

1. **Should the shell reducer live in one file or separate files immediately?**
   - What we know: the phase is narrow and the state is still small
   - What's unclear: whether splitting actions/selectors now is useful
   - Recommendation: start with one `proposal-state.ts` file and split only after editing logic arrives

2. **How much visual atmosphere should the placeholder map stage have?**
   - What we know: the shell should feel Toronto-forward, not bland
   - What's unclear: whether the first pass should use only Tailwind utilities or extra CSS variables
   - Recommendation: add a few CSS variables in `app/globals.css` and keep the rest utility-based
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` - App Router root layout and page conventions
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` - Default Server Component model and `use client` boundary guidance
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` - Tailwind 4 and global CSS usage in the App Router
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` - Metadata remains in server-compatible layout/page files
- `docs/product/phase-plan-notes.md` - Exact Phase 1 scope
- `docs/product/product-spec.md` - Map shell and editing boundary requirements
- `docs/product/ui-vision.md` - Map-first layout direction
- `AGENTS.md` - Guardrails and technical defaults

### Secondary (MEDIUM confidence)
- `package.json` - Installed stack confirms no extra state/UI libraries are present
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` - Current shell integration points

### Tertiary (LOW confidence - needs validation)
- None
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Next.js 16 App Router shell composition
- Ecosystem: existing React/Tailwind stack only
- Patterns: server-wrapper/client-shell, local reducer state, presentational shell parts
- Pitfalls: Phase 2 leakage, duplicated shell state, dashboard drift

**Confidence breakdown:**
- Standard stack: HIGH - already installed and documented locally
- Architecture: HIGH - Phase 1 needs are simple and align with official App Router guidance
- Pitfalls: HIGH - directly driven by user constraints and project docs
- Code examples: HIGH - based on current repo structure and local official docs

**Research date:** 2026-03-31
**Valid until:** 2026-04-30
</metadata>

---

*Phase: 01-editor-shell-and-proposal-state*
*Research completed: 2026-03-31*
*Ready for planning: yes*
