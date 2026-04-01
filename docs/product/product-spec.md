# Product Spec - Toronto Transit Sandbox

## Summary

A desktop-first Toronto transit sandbox where users start from the real
network, freely invent or extend lines, manually place stations, and create
beautiful, shareable transit proposals with lightweight stats.

## Audience

Primary: Toronto transit nerds and r/TTC users.

## Product Personality

1. Nerdy and satisfying
2. Polished and beautiful
3. Playful and memeable
4. Debate-provoking
5. Lightly civic-minded
6. Lightly game-like

## Core Promise

Open Toronto's transit map and make the line you wish existed.

## V1 Scope

### Map Setup

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

### Naming and Styling

- Name new lines and stations
- Customize colors
- New lines get a default new color
- Existing TTC names are not editable in v1

### Context Layers

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

## Out of Scope

- in-app comments/likes/profiles
- mobile-first editor
- realism constraints/warnings
- official transit forecasting
- GO editing
- rich text proposal rationale
- prompt-driven challenge mode

## Success Signals

1. People make and share lots of maps externally.
2. The app sparks debate on external communities.
3. The project proves the concept for a richer v2.
