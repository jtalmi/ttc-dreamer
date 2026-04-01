# Pitfalls Research

**Domain:** Desktop-first transit map sandbox
**Researched:** 2026-03-31
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Treating v1 like an official planning tool

**What goes wrong:**
The app becomes realism-heavy, judgmental, and slow instead of playful and satisfying

**Why it happens:**
Transit products invite over-modeling, “correctness” debates, and complex forecasting ambitions

**How to avoid:**
Keep stats descriptive, not authoritative, and reject realism gates that block sketching

**Warning signs:**
Scope starts expanding into forecasting, warnings, or civic-analysis workflows

**Phase to address:**
Phase 4

---

### Pitfall 2: Letting the sidebar become the product

**What goes wrong:**
The editor feels like a cramped dashboard instead of a map-first sandbox

**Why it happens:**
It is easier to keep adding controls to a sidebar than to design clear on-canvas interactions

**How to avoid:**
Keep primary tools visible, keep the map dominant, and treat inspectors as support surfaces

**Warning signs:**
New features default to panels and forms before interaction design is solved

**Phase to address:**
Phase 1

---

### Pitfall 3: Building UI before defining the proposal model

**What goes wrong:**
Line editing, stats, undo/redo, and sharing all invent incompatible data shapes

**Why it happens:**
Map-heavy UIs tempt teams to start drawing first and formalize state later

**How to avoid:**
Establish proposal, line, station, segment, interchange, and baseline abstractions early

**Warning signs:**
Different components hold overlapping copies of route or station data

**Phase to address:**
Phase 1

---

### Pitfall 4: Over-automating editing

**What goes wrong:**
Automatic snapping, auto-connections, or realism nudges make the editor feel stubborn

**Why it happens:**
Assistive features often get treated as default behavior instead of optional guidance

**How to avoid:**
Keep automation light, explicit, and easy to ignore or reject

**Warning signs:**
Users lose the ability to place stations or crossings exactly where they want

**Phase to address:**
Phase 3

---

### Pitfall 5: Treating sharing as an afterthought

**What goes wrong:**
The app can create neat maps locally but fails the “people want to share this” success test

**Why it happens:**
Share flows often get deferred until the end without designing for exportable proposal state early

**How to avoid:**
Keep serialization and read-only viewing in mind before Phase 5, even if implementation waits

**Warning signs:**
Proposal state cannot be saved, exported, or reconstructed without editor-only context

**Phase to address:**
Phase 5

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding UI-only line state inside components | Faster early visuals | Makes stats/share/state reuse messy | Only for throwaway spikes, not roadmap work |
| Adding realism formulas before editing feels good | Impressive demo metrics | Distracts from core fun loop | Never for v1 |
| Treating Toronto context as decorative polish | Faster baseline delivery | Loses the product's main differentiator | Never for v1 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Future share persistence | Storing ad hoc blobs with unstable schema | Define proposal serialization deliberately before shipping links |
| Future export generation | Coupling export code tightly to live UI components | Generate from stable proposal data, not DOM assumptions |
| Future map/canvas layer | Picking a renderer before interaction needs are clear | Choose the rendering path during Phase 1 planning with the editing model in mind |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Recomputing all stats on every tiny pointer move | Dragging feels laggy | Separate core edits from heavier derived calculations | Once proposals gain many segments/stations |
| Rendering every layer with no visibility controls | Visual clutter and slow redraws | Keep optional layers toggleable and prioritize map clarity | As context layers expand in Phase 2 |
| Treating undo/redo as UI-only snapshots | Memory-heavy, inconsistent state recovery | Model edits as deliberate state transitions | As soon as editing complexity rises |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting unvalidated share payloads | Broken or unsafe shared views | Validate proposal schema at serialization and load boundaries |
| Letting display names/titles flow straight into exports | XSS or malformed output risk | Sanitize and encode all user-visible text |
| Exposing future secrets in repo config | Credential leakage | Keep integrations behind environment variables and document them explicitly |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hiding core tools in menus | Slower, less satisfying editing | Keep the main tools visible |
| TTC-clone visual design | App feels derivative instead of distinct | Use Toronto flavor without mimicking official TTC branding |
| Onboarding that blocks creation | Users bounce before drawing | Use a lightweight first-time overlay only |

## "Looks Done But Isn't" Checklist

- [ ] **Editor shell:** Often missing clear tool state and selection feedback — verify visible active-mode cues
- [ ] **Baseline layers:** Often missing Toronto-specific context depth — verify neighborhoods, streets, landmarks, and labels feel local enough
- [ ] **Stats:** Often missing the “descriptive, not judgmental” tone — verify copy avoids authoritative claims
- [ ] **Sharing:** Often missing read-only view-first behavior — verify shared links do not dump viewers into edit mode

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Dashboard-first layout | MEDIUM | Re-center the map, move secondary controls back to a collapsible sidebar, simplify chrome |
| UI-before-model architecture | HIGH | Extract proposal/state logic into domain modules, then rewire UI against those modules |
| Over-automated editing | MEDIUM | Convert automation into prompts, suggestions, or optional snapping cues |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Treating v1 like an official planning tool | Phase 4 | Stats language stays descriptive and lightweight |
| Sidebar becomes the product | Phase 1 | Map remains visually primary in the editor shell |
| Building UI before the proposal model | Phase 1 | Proposal abstractions exist before complex editing UI expands |
| Over-automating editing | Phase 3 | Manual placement and explicit confirmation still drive edits |
| Treating sharing as an afterthought | Phase 5 | A proposal can be exported/shared from stable serialized data |

## Sources

- `docs/product/gsd-idea.md`
- `docs/product/product-spec.md`
- `docs/product/ui-vision.md`
- `docs/product/phase-plan-notes.md`
- `AGENTS.md`

---
*Pitfalls research for: desktop-first transit map sandbox*
*Researched: 2026-03-31*
