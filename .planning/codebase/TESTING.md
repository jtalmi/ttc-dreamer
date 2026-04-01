# Testing Patterns

**Analysis Date:** 2026-03-31

## Test Framework

**Runner:**
- No dedicated test runner is configured yet
- Validation currently relies on framework/tooling commands instead of test suites

**Assertion Library:**
- None configured

**Run Commands:**
```bash
npm run lint       # Lint source with Next.js/ESLint rules
npm run typecheck  # Run TypeScript without emitting output
npm run build      # Verify the app compiles through the production build
```

## Test File Organization

**Location:**
- `tests/` exists for future unit/integration tests
- `e2e/` exists for future end-to-end coverage

**Naming:**
- No test naming convention is established yet because both directories are empty

**Structure:**
```text
tests/   # currently empty
e2e/     # currently empty
```

## Test Structure

**Suite Organization:**
- No existing test suites to infer from

**Patterns:**
- The repo currently treats linting, type checking, and build validation as the minimum pre-feature quality gate
- `AGENTS.md` explicitly says to add tests for domain logic and geometry helpers where practical once those modules exist

## Mocking

**Framework:**
- None configured

**Patterns:**
- None established

**What to Mock:**
- To be defined when real integrations and stateful modules are introduced

**What NOT to Mock:**
- Pure domain and geometry helpers should eventually be tested directly

## Fixtures and Factories

**Test Data:**
- None yet

**Location:**
- None yet

## Coverage

**Requirements:**
- No numeric coverage target is configured
- Current expectation is pragmatic: add tests where domain logic or geometry becomes non-trivial

**Configuration:**
- No coverage tooling is installed

**View Coverage:**
```bash
# Not available yet
```

## Test Types

**Unit Tests:**
- Not implemented yet
- Best future fit: geometry helpers, stats calculations, and proposal state transitions in `lib/`

**Integration Tests:**
- Not implemented yet
- Best future fit: editor state wiring and sharing/export flows

**E2E Tests:**
- Not implemented yet
- Best future fit: core proposal-building flows in `e2e/`

## Common Patterns

**Async Testing:**
- Not established

**Error Testing:**
- Not established

**Snapshot Testing:**
- Not established

---
*Testing analysis: 2026-03-31*
*Update when test patterns change*
