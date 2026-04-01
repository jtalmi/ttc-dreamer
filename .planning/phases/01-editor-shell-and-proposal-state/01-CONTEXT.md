# Phase 1: Editor Shell and Proposal State - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning
**Source:** Direct user instruction plus `docs/product/*`

<domain>
## Phase Boundary

Phase 1 delivers a desktop-first editor shell only: a full-screen map area placeholder, a visible toolbar scaffold, a collapsible sidebar scaffold, a proposal state shape that future phases can build on, and a `today` / `future_committed` baseline toggle shell. This phase does **not** implement real Toronto baseline data, GO context, neighbourhood labels, route drawing, station placement, stats, or sharing.

</domain>

<decisions>
## Implementation Decisions

### Scope Guardrails
- **D-01:** Keep Phase 1 narrow: app shell, full-screen map area, toolbar scaffold, collapsible sidebar scaffold, proposal state shape, and a baseline toggle shell only
- **D-02:** Do **not** start Phase 2 work or load real Toronto transit/context-layer data in this phase
- **D-03:** Treat the map surface as a Toronto-labelled placeholder stage, not a blank white canvas and not a real TTC data render

### Layout and Interaction
- **D-04:** The experience stays desktop-first and map-first; the map area is the dominant surface
- **D-05:** Core tools remain visible in a lightweight top toolbar rather than hidden in menus
- **D-06:** The sidebar scaffold must be collapsible and supportive, not the visual center of the screen
- **D-07:** Toolbar actions other than shell interactions may be present as scaffolds only; no real editing behavior is required yet

### Proposal Foundation
- **D-08:** Define a proposal state shape that is future-facing enough for lines, stations, segments, and interchanges, but do not implement those editing flows yet
- **D-09:** The baseline toggle is real UI state with exact values `today` and `future_committed`, but it only switches shell state in Phase 1
- **D-10:** The initial proposal state should assume the user is opening a preloaded Toronto sandbox shell, even though the real baseline dataset is deferred

### Claude's Discretion
- Exact file/component boundaries for the shell
- Whether the route stays a Server Component wrapping a Client Component shell
- The exact placeholder copy inside the map area and sidebar, as long as it stays Phase-1 scoped
- The exact future-facing proposal type names and internal reducer/helper shape

</decisions>

<specifics>
## Specific Ideas

- Use a top toolbar plus right-hand collapsible sidebar so the map stage stays wide on desktop
- Show Toronto-forward placeholder copy such as "Toronto map area" or "Toronto draft starts here" rather than neutral lorem ipsum
- Make the baseline toggle visibly selectable in the toolbar from day one, even if both modes point at placeholder content for now
- Show scaffold tool buttons with clear labels instead of icon-only controls in Phase 1

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `docs/product/gsd-idea.md` — One-line summary, v1 behavior, and milestone breakdown
- `docs/product/product-spec.md` — Phase-relevant editor shell, map setup, and explicit out-of-scope items
- `docs/product/phase-plan-notes.md` — Exact Phase 1 deliverables and the instruction not to slip into Phase 2 work
- `AGENTS.md` — Product priorities, UX defaults, and guardrails

### UI Direction
- `docs/product/ui-vision.md` — Map-first layout, low-friction interaction, and what to avoid visually

### Framework Constraints
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` — App Router layout/page conventions
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — Default Server Component behavior and narrow client boundaries
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — Tailwind 4/global CSS setup already used by the repo
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` — Metadata constraints for layout/page files

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/layout.tsx`: Root layout already imports `app/globals.css` and exports static metadata
- `app/page.tsx`: Current placeholder route is the correct place to swap in the editor shell
- `app/globals.css`: Tailwind 4 entrypoint already exists

### Established Patterns
- App Router files are TypeScript and use default component exports
- `Metadata` is typed with `import type { Metadata } from "next"` in `app/layout.tsx`
- No design system, shared components, or domain modules exist yet, so Phase 1 should establish the first real UI/domain patterns deliberately

### Integration Points
- The new editor shell will replace the placeholder body in `app/page.tsx`
- The proposal state module should live under `lib/` and feed the client-side shell component
- Visual tokens can extend `app/globals.css` without needing a separate styling framework

</code_context>

<deferred>
## Deferred Ideas

- Real TTC baseline rendering
- GO context rendering
- Neighbourhood, street, landmark, or station labels
- Bus/streetcar corridor layers
- New line, extension, or station editing behavior
- Interchange suggestions, snapping, and undo/redo
- Stats, inspectors, before/after comparison, or sharing flows

</deferred>

---

*Phase: 01-editor-shell-and-proposal-state*
*Context gathered: 2026-03-31*
