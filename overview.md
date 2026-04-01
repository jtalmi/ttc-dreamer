# GSD Starter Kit for the Toronto Transit Sandbox

This document contains the starter docs, file structure, and implementation workflow to use GSD with a local IDE and Codex for the Toronto transit sandbox project.

---

## Recommended repo structure

```text
transit-sandbox/
  app/
  components/
  lib/
  public/
  styles/
  docs/
    product/
      gsd-idea.md
      product-spec.md
      ui-vision.md
      phase-plan-notes.md
  tests/
  e2e/
  README.md
  AGENTS.md
```

---

## File: docs/product/gsd-idea.md

```md
# Toronto Transit Sandbox

## One-line summary
A desktop-first web app for Toronto transit fans to create, edit, and share custom TTC rapid transit proposals on top of a preloaded Toronto transit map.

## What users do
Users open the current Toronto network, extend existing TTC lines, add branches, or create entirely new subway, LRT, or BRT lines. They place stations manually, name lines and stations, choose colors, and build anything from a single extension to an entire fantasy network.

## Primary audience
Toronto transit nerds and r/TTC-type users.

## Product goals
1. Let users quickly make a cool Toronto transit proposal.
2. Make the city itself prominent: neighbourhoods, streets, landmarks, TTC stations, GO context.
3. Produce something people want to share externally.
4. Be fun first, with enough transit logic to spark debate.

## Non-goals
1. Official planning-grade forecasting.
2. In-app public social network in v1.
3. Mobile-first creation.
4. Strict realism constraints.
5. LLM-driven map generation in v1.

## V1 product behavior
- Always start from a preloaded Toronto map.
- Toggle baseline between "Today" and "Future committed".
- Allow users to create a full proposal/map, not just a single line.
- Allow brand-new lines and extensions/branches of existing TTC lines.
- Keep existing baseline TTC infrastructure locked except for extensions/branches.
- Allow totally free placement of new endpoints.
- Allow freeform drawing with point editing after.
- Manual station placement.
- Light snapping/suggestions only.
- Shared stations can belong to multiple lines.
- Crossing lines do not auto-connect.
- If a station is placed near an existing station, suggest an interchange and let the user confirm.
- GO is visible and counts as context/connectivity, but is not editable in v1.

## Modes
Support subway/metro, LRT/light metro, and BRT.

## Stats in v1
Stats are expressive and directional, not authoritative.
Show them in a collapsible sidebar.
Preferred priority stats:
- speed / travel time
- average stop spacing
- estimated cost
- estimated ridership

Also acceptable light stats:
- station count
- line length
- connections/interchanges

## Sharing
- Export clean image
- Create unlisted share link
- Shared maps open in view mode first
- Viewer can make their own version as a copy
- Optional display name and map title
- No description required in v1

## UX tone
Nerdy, polished, playful, debate-provoking.

## Key differentiators
1. Much more Toronto-native context and vibe than generic fantasy transit map tools.
2. Easier/faster editing for TTC-style proposals.

## Suggested milestone breakdown
1. Foundation + map shell
2. Baseline network + layers
3. Line editing + station placement
4. Stats + inspectors + before/after toggle
5. Sharing + export + polish
```

---

## File: docs/product/product-spec.md

```md
# Product Spec — Toronto Transit Sandbox

## Summary
A desktop-first Toronto transit sandbox where users start from the real network, freely invent or extend lines, manually place stations, and create beautiful, shareable transit proposals with lightweight stats.

## Audience
Primary: Toronto transit nerds / r/TTC users.

## Product personality
1. Nerdy and satisfying
2. Polished / beautiful
3. Playful and memeable
4. Debate-provoking
5. Lightly civic-minded
6. Lightly game-like

## Core promise
Open Toronto's transit map and make the line you wish existed.

## V1 scope
### Map setup
- Preloaded Toronto transit map
- Toggle between Today and Future committed baseline
- No blank canvas start in v1
- No hard geographic boundary

### Editing
- Create brand-new lines
- Extend existing TTC lines from ends
- Add branches/spurs to existing lines
- Existing TTC infrastructure stays fixed otherwise
- Manual station placement
- Freehand draw with point cleanup
- Shared stations across multiple lines
- Suggested interchanges near existing stations, user confirms
- No auto-connection for line crossings
- Undo/redo and delete

### Modes
- Subway / metro
- LRT / light metro
- BRT

### Naming and styling
- Name new lines and stations
- Customize colors
- New lines get a default new color
- Existing TTC names are not editable in v1

### Context layers
- neighbourhood names
- major streets
- landmarks / destinations
- TTC station names
- GO station names
- major bus/streetcar corridors (toggleable)

### Stats
Live collapsible sidebar with per-line and proposal-level stats.
Priority metrics:
- speed / travel time
- average stop spacing
- estimated cost
- estimated ridership

### Sharing
- clean image export
- unlisted share link
- shared proposal view mode
- edit-as-copy
- optional display name
- optional map title

## Out of scope
- in-app comments/likes/profiles
- mobile-first editor
- realism constraints/warnings
- official transit forecasting
- GO editing
- rich text proposal rationale
- prompt-driven challenge mode

## Success signals
1. People make and share lots of maps externally
2. The app sparks debate on external communities
3. The project proves the concept for a richer v2
```

---

## File: docs/product/ui-vision.md

```md
# UI Vision — Toronto Transit Sandbox

## Principles
1. Map first
2. City is prominent, transit is the hero
3. Low friction, low ceremony
4. Manual control where it matters
5. Sidebar supports, it does not dominate

## Layout
- Full-screen desktop editor
- Primary canvas centered on map
- Simple top or side toolbar
- Collapsible stats / inspector sidebar
- Minimal onboarding overlay first time only

## Visual direction
- Toronto-flavoured but clearly its own thing
- Geographic/stylized base map
- Neighbourhoods, streets, landmarks visible
- Transit lines bold and legible above everything else

## Interaction model
- Drop users straight into editor
- Tool-driven interaction: select, draw line, add station, move/edit, delete
- Quick freehand route creation followed by cleanup
- Manual station placement with optional snapping cues

## Shared map view
- Open in read-only mode first
- Clear button to make a copy and edit
- Surface title, optional author name, and key stats

## Things to avoid
- Overly realistic planning UI
- Dense enterprise dashboards
- Too many onboarding steps
- Visual style that feels like a TTC clone
```

---

## File: docs/product/phase-plan-notes.md

```md
# Initial Phase Notes

## Phase 1 — App shell and map foundation
Goal: boot a usable desktop editor shell.

Deliverables:
- app shell
- full-screen map view
- toolbar scaffold
- collapsible sidebar scaffold
- local state model for proposal/map
- baseline Today/Future committed toggle shell

## Phase 2 — Toronto baseline and context layers
Goal: make the map feel meaningfully Toronto-native.

Deliverables:
- TTC baseline rendering
- GO rendering as context
- neighbourhood labels
- major streets
- TTC + GO station labels
- landmarks layer
- toggleable bus/streetcar corridor layer

## Phase 3 — Editing core
Goal: make proposal creation fun.

Deliverables:
- create new line
- extend existing line
- branch existing line
- manual stations
- shared stations/interchanges
- line naming and coloring
- undo/redo/delete

## Phase 4 — Stats and inspectors
Goal: make proposals feel richer than drawings.

Deliverables:
- line inspector
- station inspector
- live sidebar stats
- simple metric formulas
- before/after toggle

## Phase 5 — Sharing and polish
Goal: make outputs externally shareable.

Deliverables:
- map title
- optional display name
- image export
- unlisted share link
- shared view mode
- edit-as-copy flow
- onboarding overlay/tooltips
```

---

## File: AGENTS.md

```md
# Agent Working Rules

## Product intent
This project is a desktop-first Toronto transit sandbox for creating and sharing custom TTC rapid transit proposals.

## Product priorities
1. Toronto-native context
2. Fast, satisfying editing
3. Polished visuals
4. Lightweight, descriptive stats
5. Shareable outputs

## Guardrails
- Do not optimize for realism over fun in v1.
- Do not add social/community features in v1 unless explicitly requested.
- Do not make mobile the primary creation target.
- Do not mutate baseline TTC infrastructure except through allowed extensions/branches.
- Keep scoring descriptive, not judgmental.

## UX defaults
- Prefer map-first layouts
- Prefer simple visible tools over hidden controls
- Prefer manual station placement with optional snapping
- Prefer unlisted sharing by default

## Technical defaults
- Keep phases small and shippable
- Prefer incremental implementation
- Add tests for domain logic and geometry helpers where practical
- Avoid overengineering the data model for v1
```

---

## Suggested implementation workflow with GSD + Codex

1. Install GSD for Codex.
2. Put the four product docs above into your repo before project init.
3. Start Codex in the repo.
4. Use GSD to initialize the project from `docs/product/gsd-idea.md`.
5. Run the discuss → ui → plan → execute loop one phase at a time.
6. Keep each phase small.
7. Use shared docs as the source of truth; when product direction changes, update the product docs first.

### Recommended first five phases

1. App shell + map canvas
2. Baseline Toronto data + layers
3. Core line editing + stations
4. Stats + inspector
5. Share/export flow

---

## What to ask Codex/GSD to build first

Start with Phase 1 focused only on:

* app shell
* full-screen map canvas
* toolbar scaffold
* collapsible sidebar scaffold
* proposal state shape
* baseline toggle shell

Do not ask for stats, sharing, or advanced geometry in the same phase.

---

## Suggested data model concepts for early implementation

* Proposal
* Line
* Station
* Segment
* Interchange
* LayerVisibility
* BaselineMode (today / future committed)

Keep these simple at first. Avoid premature GIS complexity.

---

## Definition of a good first milestone

You know the setup worked if you can:

1. open the editor,
2. see Toronto baseline context,
3. create a new line,
4. place stations,
5. rename/color that line,
6. save progress locally,
7. inspect basic stats in the sidebar.

```
```
