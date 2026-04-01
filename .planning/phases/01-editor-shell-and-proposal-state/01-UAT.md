---
status: complete
phase: 01-editor-shell-and-proposal-state
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md]
started: 2026-04-01T02:10:00Z
updated: 2026-04-01T02:26:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Full-screen editor shell renders at /
expected: Visit http://localhost:3000. The page shows a full-screen editor workspace — not the old "Repo Bootstrap" placeholder. The layout fills the viewport with a top toolbar, a dominant central map area, and a right sidebar panel.
result: pass

### 2. Toolbar shows labelled tool buttons
expected: The top toolbar displays four labelled buttons: "Select", "Draw Line", "Add Station", and "Inspect". Clicking one highlights it as the active tool (visual change on the clicked button).
result: pass

### 3. Baseline toggle switches between Today and Future committed
expected: The toolbar includes a baseline toggle with two buttons labelled exactly "Today" and "Future committed". "Today" is active by default (highlighted with accent colour). Clicking "Future committed" switches the active highlight to it.
result: pass

### 4. Map stage shows Toronto placeholder
expected: The central map area displays the heading "Toronto draft starts here" and body copy indicating this is the Phase 1 shell only. The surface should have a subtle grid/texture, not a flat white background.
result: pass

### 5. Sidebar collapses and expands
expected: The right sidebar starts expanded (~320px wide). There is a toggle control to collapse it to a narrow rail (~64px). Clicking the toggle again expands it back to full width.
result: pass

### 6. Shell uses TTC design tokens
expected: The shell uses the custom colour palette: warm off-white background (#F3EEE5), dark secondary colour (#18324A) on toolbar/sidebar, and orange accent (#D85A2A) on active states. The font should be IBM Plex Sans or a clean sans-serif fallback.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
