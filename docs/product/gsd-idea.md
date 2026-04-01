# Toronto Transit Sandbox

## One-line Summary

A desktop-first web app for Toronto transit fans to create, edit, and share
custom TTC rapid transit proposals on top of a preloaded Toronto transit map.

## What Users Do

Users open the current Toronto network, extend existing TTC lines, add
branches, or create entirely new subway, LRT, or BRT lines. They place
stations manually, name lines and stations, choose colors, and build anything
from a single extension to an entire fantasy network.

## Primary Audience

Toronto transit nerds and r/TTC-type users.

## Product Goals

1. Let users quickly make a cool Toronto transit proposal.
2. Make the city itself prominent: neighbourhoods, streets, landmarks, TTC
   stations, GO context.
3. Produce something people want to share externally.
4. Be fun first, with enough transit logic to spark debate.

## Non-goals

1. Official planning-grade forecasting.
2. In-app public social network in v1.
3. Mobile-first creation.
4. Strict realism constraints.
5. LLM-driven map generation in v1.

## V1 Product Behavior

- Always start from a preloaded Toronto map.
- Toggle baseline between "Today" and "Future committed".
- Allow users to create a full proposal/map, not just a single line.
- Allow brand-new lines and extensions/branches of existing TTC lines.
- Keep existing baseline TTC infrastructure locked except for
  extensions/branches.
- Allow totally free placement of new endpoints.
- Allow freeform drawing with point editing after.
- Manual station placement.
- Light snapping and suggestions only.
- Shared stations can belong to multiple lines.
- Crossing lines do not auto-connect.
- If a station is placed near an existing station, suggest an interchange and
  let the user confirm.
- GO is visible and counts as context/connectivity, but is not editable in v1.

## Modes

Support subway/metro, LRT/light metro, and BRT.

## Stats in V1

Stats are expressive and directional, not authoritative. Show them in a
collapsible sidebar.

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

- Export clean image.
- Create unlisted share link.
- Shared maps open in view mode first.
- Viewer can make their own version as a copy.
- Optional display name and map title.
- No description required in v1.

## UX Tone

Nerdy, polished, playful, debate-provoking.

## Key Differentiators

1. Much more Toronto-native context and vibe than generic fantasy transit map
   tools.
2. Easier and faster editing for TTC-style proposals.

## Suggested Milestone Breakdown

1. Foundation and map shell
2. Baseline network and layers
3. Line editing and station placement
4. Stats, inspectors, and before/after toggle
5. Sharing, export, and polish
