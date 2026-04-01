# Codebase Concerns

**Analysis Date:** 2026-03-31

## Tech Debt

**Scaffold-only application shell:**
- Issue: The app layer is still a neutral placeholder rather than the TTC sandbox described in `docs/product/`
- Why: The repo was intentionally bootstrapped before running GSD planning
- Impact: There is no reusable editor UI, domain model, map rendering, or sharing logic to build on yet
- Fix approach: Follow the generated roadmap starting with Phase 1 instead of layering ad hoc features onto `app/page.tsx`

**Empty implementation directories:**
- Issue: `components/`, `lib/`, `tests/`, and `e2e/` exist but contain no patterns yet
- Why: Structure was reserved up front to keep future additions organized
- Impact: New work can easily invent inconsistent patterns if Phase 1 does not establish them deliberately
- Fix approach: Use Phase 1 planning to set conventions for editor components, proposal state, and tests

## Known Bugs

**No product behavior beyond placeholder page:**
- Symptoms: Visiting `/` only shows a bootstrap message instead of any TTC editor behavior
- Trigger: Any normal app usage
- Workaround: None; this is an expected pre-implementation state
- Root cause: Product phases have not been executed yet

## Security Considerations

**Future unlisted sharing and export flows:**
- Risk: Proposal titles, author names, and share payloads will become user-generated content that needs validation and safe serialization
- Current mitigation: Sharing is not implemented yet
- Recommendations: Add input validation, safe export generation, and explicit access controls when Phase 5 begins

**Future secrets and external services:**
- Risk: Auth, storage, or analytics could be introduced without a clear environment-variable contract
- Current mitigation: No integrations exist yet, and `.env*` is ignored by `.gitignore`
- Recommendations: Define environment requirements in source control before adding any external service

## Performance Bottlenecks

**Map rendering does not exist yet:**
- Problem: The likely future hotspots are not measurable because the editor canvas is not implemented
- Measurement: None yet
- Cause: Early scaffold phase
- Improvement path: Treat route rendering, geometry updates, and live stats recomputation as the first profiling targets once Phase 2 and Phase 3 land

## Fragile Areas

**Next.js 16 API drift risk:**
- Why fragile: `AGENTS.md` explicitly warns that this Next.js version differs from older conventions
- Common failures: Writing outdated App Router patterns or deprecated APIs
- Safe modification: Read the relevant docs under `node_modules/next/dist/docs/` before making framework-level changes
- Test coverage: No automated framework regression coverage yet

**Source-of-truth split between docs and generated planning:**
- Why fragile: Product constraints live in `AGENTS.md` and `docs/product/*`, while future work should be driven from `.planning/*`
- Common failures: Implementing features that ignore Toronto-first guardrails or v1 scope boundaries
- Safe modification: Keep planning artifacts aligned with the human-authored docs before starting execution
- Test coverage: Not applicable; this is a process fragility

## Scaling Limits

**Application maturity:**
- Current capacity: Static placeholder page only
- Limit: The repo cannot support real editing, persistence, or sharing yet
- Symptoms at limit: Any feature request beyond the bootstrap page requires new architecture rather than small edits
- Scaling path: Establish the editor shell, proposal state, and map layers before optimizing anything

## Dependencies at Risk

**`next@16.2.1`:**
- Risk: Breaking changes versus older Next.js conventions
- Impact: Incorrect examples or stale assumptions can waste implementation time or break builds
- Migration plan: Use local Next.js docs in `node_modules/next/dist/docs/` as the authoritative framework reference

**Repo-local GSD snapshot in `.claude/`:**
- Risk: The planning workflow is a checked-in local bundle, so its expectations can diverge from upstream GSD over time
- Impact: Future contributors may assume behavior from a different GSD version
- Migration plan: Treat the checked-in `.claude/` files as authoritative for this repo unless explicitly upgraded

## Missing Critical Features

**Toronto map and baseline layers:**
- Problem: There is no TTC or GO rendering yet
- Current workaround: Product intent is documented only in markdown
- Blocks: Any meaningful proposal editing or Toronto-native presentation
- Implementation complexity: High

**Proposal editing model:**
- Problem: There is no line/station/segment/interchange state model yet
- Current workaround: None
- Blocks: Drawing, naming, stats, undo/redo, and sharing
- Implementation complexity: High

**Automated tests:**
- Problem: There is no domain or UI test coverage
- Current workaround: Manual lint/typecheck/build validation
- Blocks: Safe iteration on geometry logic and editor interactions
- Implementation complexity: Medium

## Test Coverage Gaps

**All domain logic:**
- What's not tested: Proposal state transitions, geometry helpers, stats formulas, interchange suggestions
- Risk: Core editing behavior could regress silently once implemented
- Priority: High
- Difficulty to test: Low to medium once the domain layer exists

**All user flows:**
- What's not tested: Editor shell, baseline toggles, map interactions, sharing flows
- Risk: UI regressions will rely entirely on manual checks
- Priority: High
- Difficulty to test: Medium

---
*Concerns audit: 2026-03-31*
*Update as issues are fixed or new ones discovered*
