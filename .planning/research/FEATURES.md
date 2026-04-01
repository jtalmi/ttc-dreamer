# Feature Research

**Domain:** Desktop-first transit map sandbox
**Researched:** 2026-03-31
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Toronto baseline map context | The app promise starts from the city, not a blank canvas | MEDIUM | Must show TTC plus city cues immediately |
| Fast proposal editing tools | Users are here to sketch fantasy or debate-worthy networks quickly | HIGH | Editing friction will make the product feel dead on arrival |
| Manual station placement and route shaping | The docs explicitly prioritize user control over automation | HIGH | Avoid over-automating early |
| Lightweight descriptive stats | Transit nerds want feedback, but not planning-grade realism | MEDIUM | Keep language expressive, not judgmental |
| Shareable outputs | The concept succeeds only if maps can leave the app | HIGH | Image export and unlisted link are core v1 outcomes |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Toronto-native visual context | Makes the app feel culturally specific instead of generic | MEDIUM | Neighborhoods, streets, landmarks, GO context matter |
| Extensions and branches on top of a locked TTC baseline | Keeps proposals grounded without becoming rigid | HIGH | Core to the “TTC dreamer” fantasy |
| Optional interchange suggestion flow | Helps users without removing control | MEDIUM | Should be assistive, never automatic |
| View-first shared proposals with edit-as-copy | Encourages sharing without turning v1 into a social network | MEDIUM | Aligns with unlisted-by-default sharing |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Official-grade forecasting | Sounds authoritative and “serious” | Conflicts with the fun-first v1 goal and massively increases scope | Keep stats directional and playful |
| Public social feed inside the app | Seems like a natural sharing extension | Pulls the project toward moderation/community features the guardrails explicitly reject for v1 | Use unlisted links and external communities |
| Strict realism constraints and warnings | Appeals to power users | Makes the sandbox punitive and slows creation | Offer light suggestions only |
| Mobile-first editor | Broadens reach | Conflicts with the explicit desktop-first creation target | Keep mobile for viewing later if needed |

## Feature Dependencies

```text
Toronto baseline context
    └──requires──> map rendering foundation

Proposal editing
    └──requires──> proposal state model
                       └──requires──> clear line/station/segment abstractions

Descriptive stats
    └──requires──> proposal state model

Unlisted sharing
    └──requires──> stable proposal serialization

Interchange suggestions ──enhances──> manual station placement

Strict realism warnings ──conflicts──> fun-first sandbox editing
```

### Dependency Notes

- **Proposal editing requires a proposal state model:** Without typed line/station/segment structures, every later feature becomes brittle
- **Stats require the same model as editing:** The app should derive insights from proposal state instead of duplicating formulas in UI code
- **Sharing requires stable serialization:** Export and unlisted-link flows depend on a consistent proposal payload
- **Interchange suggestions enhance manual station placement:** Suggestions should help only after users can place stations directly

## MVP Definition

### Launch With (v1)

- [ ] Toronto baseline context with TTC and GO visibility — the map must feel local immediately
- [ ] Fast editing for lines, branches, stations, and styling — the core sandbox loop
- [ ] Lightweight descriptive stats and inspectors — makes proposals feel richer than drawings
- [ ] Unlisted sharing and image export — validates the “people want to share this” thesis

### Add After Validation (v1.x)

- [ ] Local or cloud persistence improvements — once editing workflows prove sticky
- [ ] More advanced onboarding or discoverability helpers — after observing where users get stuck

### Future Consideration (v2+)

- [ ] Prompt-driven challenges or generation — explicitly out of scope for v1
- [ ] In-app community/gallery features — only if external sharing proves enough demand
- [ ] GO editing or broader regional planning tools — after the TTC-focused sandbox feels complete

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Desktop editor shell | HIGH | MEDIUM | P1 |
| Toronto baseline layers | HIGH | MEDIUM | P1 |
| Proposal editing model and tools | HIGH | HIGH | P1 |
| Descriptive stats + inspectors | HIGH | MEDIUM | P1 |
| Unlisted sharing + image export | HIGH | HIGH | P1 |
| First-time onboarding polish | MEDIUM | LOW | P2 |
| Public community features | LOW for v1 | HIGH | P3 |

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Map context | Often generic or abstract | Often blank-canvas | Toronto-native by default |
| Editing | Can be powerful but fiddly | Can be easy but shallow | Fast, visible tools with manual control |
| Sharing | Static screenshots or public galleries | Mixed | Unlisted share links plus clean image export |

## Sources

- `docs/product/gsd-idea.md`
- `docs/product/product-spec.md`
- `docs/product/ui-vision.md`
- `docs/product/phase-plan-notes.md`
- `AGENTS.md`

---
*Feature research for: desktop-first transit map sandbox*
*Researched: 2026-03-31*
