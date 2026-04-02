# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework

**Runner:**
- Vitest 4.1.2
- Config: `vitest.config.ts`
- Environment: Node.js
- Global test APIs enabled

**Assertion Library:**
- Vitest built-in expect API (no separate library needed)

**Run Commands:**
```bash
npm test                    # Run all tests once
npm test -- --watch        # Watch mode (not commonly used)
npm test -- --coverage     # Coverage report (coverage reporting not configured yet)
```

Test execution via `npm run test` runs: `vitest run`

## Test File Organization

**Location:**
- Co-located with source code is discouraged; separate `tests/` directory at repository root
- Mirror `lib/` structure: tests for `lib/proposal/` live in `tests/proposal/`
- Structure:
  - `tests/proposal/` → domain logic tests for proposal editor state and geometry
  - `tests/sharing/` → serialization and sharing URL encoding/decoding tests
  - `tests/geocoding/` → reverse geocoding helper tests

**Naming:**
- Test files use `.test.ts` suffix: `proposal-history.test.ts`, `proposal-geometry.test.ts`, `encode-proposal.test.ts`
- Test file names mirror source module names: source `proposal-state.ts` has tests in `proposal-state-*.test.ts` (split by feature area)

**Structure:**
```
tests/
├── proposal/
│   ├── proposal-history.test.ts
│   ├── proposal-state-addline.test.ts
│   ├── proposal-state-auto-interchange.test.ts
│   ├── proposal-state-confirm-interchange.test.ts
│   ├── proposal-state-inspect-element.test.ts
│   ├── proposal-state-movestation.test.ts
│   ├── proposal-geometry.test.ts
│   └── proposal-stats.test.ts
├── sharing/
│   ├── encode-proposal.test.ts
│   ├── decode-proposal.test.ts
│   ├── export-utils.test.ts
│   └── v1-share-fixture.test.ts
└── geocoding/
    └── reverse-geocode.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from "vitest";
import { functionUnderTest } from "@/lib/module/file";

describe("Feature or function name", () => {
  it("describes expected behavior in plain English", () => {
    // Arrange: set up test data
    const input = { /* ... */ };
    
    // Act: call the function
    const result = functionUnderTest(input);
    
    // Assert: verify the result
    expect(result).toBe(expectedValue);
  });
});
```

**Patterns Observed:**
- `describe()` groups related tests by feature or function
- `it()` statements use present tense to describe expected behavior
- Three-part test structure: Arrange, Act, Assert (AAA pattern)
- Setup helpers defined at top of test file to reduce duplication
- No before/after hooks (beforeEach, afterEach) used

**Example from `proposal-history.test.ts`:**
```typescript
describe("historyReducer — history-tracked actions", () => {
  it("starts with empty past and future", () => {
    const state = createInitialHistoryState();
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });

  it("pushes current draft to past when a history-tracked action is dispatched", () => {
    const initial = createInitialHistoryState();
    const before = initial.present.draft;
    const next = dispatchHistoryAction(initial, "line-1");

    expect(next.past).toHaveLength(1);
    expect(next.past[0]).toEqual(before);
  });
});
```

## Mocking

**Framework:** No explicit mocking library installed

**Patterns:**
- Manual mock objects created inline when needed
- Example from `proposal-geometry.test.ts`:
  ```typescript
  // A mock map that does a trivial identity projection
  const mockMap = {
    project: (lngLat: [number, number]) => ({ x: lngLat[0], y: lngLat[1] }),
  };
  ```

**What to Mock:**
- External map library references (MapRef, map projection)
- Large data structures not under test (use minimal fixtures instead)

**What NOT to Mock:**
- Domain logic functions — test them directly with real implementations
- State reducer functions — test full state transitions
- Pure utility functions — test with real inputs/outputs
- Encoding/decoding roundtrips — test with real data structures

## Fixtures and Factories

**Test Data:**
- Factory functions created at top of test file using `function make*()` pattern
- Examples:
  ```typescript
  function makeDraft(overrides: Partial<ProposalDraft> = {}): ProposalDraft {
    return {
      id: "draft-1",
      title: "Test Proposal",
      baselineMode: "today",
      lines: [],
      stations: [],
      ...overrides,
    };
  }

  function makeLine(overrides: Partial<ProposalLineDraft> = {}): ProposalLineDraft {
    return {
      id: "line-1",
      name: "Test Line",
      color: "#7B61FF",
      mode: "subway",
      waypoints: [],
      stationIds: [],
      ...overrides,
    };
  }
  ```

- Factories accept optional `overrides` parameter to customize test data
- Minimal defaults: factories set required fields, tests override for specific scenarios
- Helper functions for common state setup: `makeStateWithOneLine()` in `proposal-state-auto-interchange.test.ts`

**Location:**
- Fixtures and factories live at top of test file, just below imports
- No separate fixture directory; inline factories keep test context together

## Coverage

**Requirements:** No coverage target enforced (not configured in `vitest.config.ts`)

**View Coverage:**
- Coverage reporting not configured yet
- Use manual test runs to verify behavior

## Test Types

**Unit Tests:**
- Scope: Pure functions, domain logic reducers, geometry helpers
- Approach: Test individual functions with known inputs and verify outputs
- Examples: `dist2D()`, `buildProposalLinesGeoJSON()`, `computeLineLength()`
- Located in: `tests/proposal/proposal-geometry.test.ts`, `tests/proposal/proposal-stats.test.ts`

**Integration Tests:**
- Scope: State reducer action chains, full workflow sequences
- Approach: Build initial state, dispatch multiple actions, verify final state
- Example: `proposal-state-addline.test.ts` tests both single-action and multi-step workflows
- Located in: `tests/proposal/proposal-state-*.test.ts` (14+ files covering different action types)

**Serialization/Deserialization Tests:**
- Scope: Roundtrip encoding and decoding of proposal data
- Approach: Encode a payload, decode it, verify structural equality
- Examples: `encode-proposal.test.ts` includes Unicode and emoji roundtrips
- Located in: `tests/sharing/*.test.ts`

**E2E Tests:**
- Not yet implemented; no E2E framework installed
- Future direction: Playwright MCP config exists (`.playwright-mcp/`) suggesting future E2E testing

## Common Patterns

**Async Testing:**
- No async tests currently present in test suite
- Async support available via `async () => { ... }` pattern (standard in Vitest)
- Not needed for pure functions and sync reducers

**Error Testing:**
```typescript
// Pattern from validation tests
it("returns null when validation fails", () => {
  const invalid = { invalid: "data" };
  const result = isValidSharePayload(invalid);
  expect(result).toBeNull();
});
```

- Functions that fail validation return `null` (not throw)
- Tests verify null return value when invalid data is provided
- Example: `decode-proposal.test.ts` tests invalid payload shapes

**State Mutation Testing:**
```typescript
// Pattern from history tests — verify state is immutable
it("does nothing when past is empty", () => {
  const initial = createInitialHistoryState();
  const next = historyReducer(initial, { type: "undo" });
  expect(next).toBe(initial); // referential equality — no new object created
});
```

- Tests verify that reducers return the same object reference when no change occurs
- Tests use `.toBe()` for referential equality checks
- Tests verify that new objects are created when state does change using `.toEqual()`

**Array/Object Equality:**
```typescript
// Pattern from proposal state tests
expect(next.draft.lines[0].parentLineId).toBe("ttc-42");          // primitive equality
expect(next.past[0]).toEqual(before);                              // deep equality
expect(result!.position).toEqual([-79.38, 43.65]);                 // coordinate equality
```

- `.toBe()` for primitive values and referential equality
- `.toEqual()` for deep object/array comparisons

**Custom Assertions:**
```typescript
// Pattern from geometry tests
expect(dist2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);   // floating point tolerance
expect(result).not.toBeNull();                                     // null checks with .not
expect(state.past).toHaveLength(1);                                // array length
expect(merged?.lineIds).toContain("l1");                           // array membership
```

- `.toBeCloseTo(value)` for floating-point comparisons
- `.not.toBeNull()` for existence checks
- `.toHaveLength()` for array/string length
- `.toContain()` for array membership

**Test Statistics:**
- Test Files: 13 passed
- Total Tests: 156 passed
- Execution Time: ~528ms
- No tests skipped or marked as pending

---

*Testing analysis: 2026-04-01*
