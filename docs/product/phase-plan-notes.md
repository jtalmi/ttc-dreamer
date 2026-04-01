# Initial Phase Notes

## Phase 1 - App Shell and Map Foundation

Goal: boot a usable desktop editor shell.

Deliverables:

- app shell
- full-screen map view
- toolbar scaffold
- collapsible sidebar scaffold
- local state model for proposal/map
- baseline Today/Future committed toggle shell

## Phase 2 - Toronto Baseline and Context Layers

Goal: make the map feel meaningfully Toronto-native.

Deliverables:

- TTC baseline rendering
- GO rendering as context
- neighbourhood labels
- major streets
- TTC + GO station labels
- landmarks layer
- toggleable bus/streetcar corridor layer

## Phase 3 - Editing Core

Goal: make proposal creation fun.

Deliverables:

- create new line
- extend existing line
- branch existing line
- manual stations
- shared stations/interchanges
- line naming and coloring
- undo/redo/delete

## Phase 4 - Stats and Inspectors

Goal: make proposals feel richer than drawings.

Deliverables:

- line inspector
- station inspector
- live sidebar stats
- simple metric formulas
- before/after toggle

## Phase 5 - Sharing and Polish

Goal: make outputs externally shareable.

Deliverables:

- map title
- optional display name
- image export
- unlisted share link
- shared view mode
- edit-as-copy flow
- onboarding overlay/tooltips

## Early Data Model Concepts

- Proposal
- Line
- Station
- Segment
- Interchange
- LayerVisibility
- BaselineMode (`today` / `future_committed`)

## Definition of a Good First Milestone

You know the setup worked if a future implementation can:

1. open the editor
2. see Toronto baseline context
3. create a new line
4. place stations
5. rename and recolor that line
6. save progress locally
7. inspect basic stats in the sidebar
