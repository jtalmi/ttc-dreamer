<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Working Rules

## Product Intent

This project is a desktop-first Toronto transit sandbox for creating and
sharing custom TTC rapid transit proposals.

## Product Priorities

1. Toronto-native context
2. Fast, satisfying editing
3. Polished visuals
4. Lightweight, descriptive stats
5. Shareable outputs

## Guardrails

- Do not optimize for realism over fun in v1.
- Do not add social/community features in v1 unless explicitly requested.
- Do not make mobile the primary creation target.
- Do not mutate baseline TTC infrastructure except through allowed
  extensions/branches.
- Keep scoring descriptive, not judgmental.

## UX Defaults

- Prefer map-first layouts.
- Prefer simple visible tools over hidden controls.
- Prefer manual station placement with optional snapping.
- Prefer unlisted sharing by default.

## Technical Defaults

- Keep phases small and shippable.
- Prefer incremental implementation.
- Add tests for domain logic and geometry helpers where practical.
- Avoid overengineering the data model for v1.
