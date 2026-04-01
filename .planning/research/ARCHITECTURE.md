# Architecture Research

**Domain:** Desktop-first transit map sandbox
**Researched:** 2026-03-31
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Toolbar  │  Map Canvas  │  Sidebar / Inspectors  │  Share │
├─────────────────────────────────────────────────────────────┤
│                     Interaction Layer                       │
├─────────────────────────────────────────────────────────────┤
│   Tool state   │   edit actions   │   selection logic      │
├─────────────────────────────────────────────────────────────┤
│                       Domain Layer                          │
│  Proposal  │  Line  │  Station  │  Segment  │ Interchange  │
├─────────────────────────────────────────────────────────────┤
│                 Derived Insights / Persistence              │
│  stats formulas  │  serialization  │  local/share storage   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Map canvas | Visualize baseline + proposal geometry | Route-level UI plus focused canvas/map rendering module |
| Tool state | Track active editing mode and selection | Client-side UI state tied to visible toolbar controls |
| Proposal model | Represent lines, stations, segments, interchanges, baseline mode | Typed domain modules in `lib/` |
| Inspectors/stats | Derive readable feedback from proposal state | Selector/derivation helpers feeding sidebar components |
| Sharing/export | Convert proposal state into portable outputs | Serialization helpers plus a lightweight share route later |

## Recommended Project Structure

```text
app/
├── page.tsx                # Desktop editor route
├── share/[id]/page.tsx     # Read-only shared view when Phase 5 arrives
└── globals.css             # Base styles

components/
├── editor/                 # Map canvas, toolbar, sidebar shell
├── inspectors/             # Line and station detail panels
└── sharing/                # Share/export UI

lib/
├── proposal/               # Proposal, line, station, segment, interchange models
├── stats/                  # Derived descriptive metrics
├── baseline/               # TTC/GO/context-layer data and transforms
└── sharing/                # Serialization and share payload helpers
```

### Structure Rationale

- **`components/editor/`:** Keeps the map-first workspace cohesive without mixing it into route files
- **`lib/proposal/` and `lib/stats/`:** Protects domain logic from becoming trapped inside React components
- **`lib/baseline/`:** Makes Toronto-specific baseline/context data explicit and reusable
- **`components/inspectors/`:** Supports a sidebar that grows without turning into a generic dashboard blob

## Architectural Patterns

### Pattern 1: Domain-First Editor State

**What:** Build line/station/segment/interchange structures before polishing UI interactions
**When to use:** Immediately in Phase 1 and Phase 3
**Trade-offs:** Slightly more upfront design, much lower rewrite risk later

**Example:**
```typescript
type BaselineMode = "today" | "future_committed";

type Proposal = {
  id: string;
  baselineMode: BaselineMode;
  lines: ProposalLine[];
  stations: ProposalStation[];
};
```

### Pattern 2: Derived Stats, Not Authoritative Simulation

**What:** Compute lightweight descriptive metrics from proposal state instead of pretending to run a full transit model
**When to use:** Phase 4 and later
**Trade-offs:** Lower realism, much better fit for v1 scope and product tone

### Pattern 3: Assistive, Explicit Editing

**What:** Suggestions (snapping, interchange prompts) should appear as opt-in helpers rather than automatic mutations
**When to use:** Phase 3 editing flows
**Trade-offs:** Slightly more user interaction, much better alignment with manual control

## Data Flow

### Request Flow

```text
[User opens editor]
    ↓
[Route loads baseline + editor shell]
    ↓
[Toolbar action / pointer input]
    ↓
[Edit action updates proposal model]
    ↓
[Map canvas + sidebar selectors re-render]
    ↓
[Optional serialize/export/share output]
```

### State Management

```text
[Proposal state]
    ↓ (selectors)
[Canvas / Sidebar / Toolbar]
    ←→ [Edit actions + tool mode]
    ↓
[Derived stats / serialization]
```

### Key Data Flows

1. **Baseline switch:** User changes today/future mode, baseline layers re-render, stats and comparison context update
2. **Line edit:** Tool input mutates proposal geometry, then canvas and inspectors refresh from the same source model
3. **Share/export:** Current proposal state is serialized into an image or share payload without duplicating data models

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single Next.js app with client-side editing is sufficient |
| 1k-100k users | Optimize share persistence, serialization, and heavy rendering paths first |
| 100k+ users | Separate share/view workloads or asset generation if usage proves it necessary |

### Scaling Priorities

1. **First bottleneck:** Rendering and recalculating large proposal graphs in the editor
2. **Second bottleneck:** Share/export generation once proposals are stored or rendered server-side

## Anti-Patterns

### Anti-Pattern 1: Dashboard-First Layout

**What people do:** Let stats and settings dominate the screen
**Why it's wrong:** It conflicts with the explicit map-first UX goal
**Do this instead:** Keep the canvas primary and make the sidebar supportive

### Anti-Pattern 2: Mixing Domain Logic Into Route Components

**What people do:** Encode proposal math and editing rules directly in page/component files
**Why it's wrong:** Makes geometry, stats, and sharing impossible to test cleanly
**Do this instead:** Keep proposal and stats logic in `lib/` modules

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Optional future share storage | Minimal API/storage boundary | Needed only when unlisted links require persistence |
| Optional future export pipeline | Client-first or lightweight server generation | Keep it narrow and phase-gated |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `components/editor` ↔ `lib/proposal` | Direct typed calls/selectors | Keep UI thin |
| `lib/proposal` ↔ `lib/stats` | Pure function derivations | Avoid duplicating formulas |
| `lib/baseline` ↔ editor UI | Read-only baseline data adapters | Baseline network should stay locked except allowed extensions |

## Sources

- `docs/product/gsd-idea.md`
- `docs/product/product-spec.md`
- `docs/product/ui-vision.md`
- `docs/product/phase-plan-notes.md`
- `AGENTS.md`

---
*Architecture research for: desktop-first transit map sandbox*
*Researched: 2026-03-31*
