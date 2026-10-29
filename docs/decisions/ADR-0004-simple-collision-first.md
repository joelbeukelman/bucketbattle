# ADR-0004: Simple 2D collision now, Rapier when we need dynamic bodies

- Status: Accepted
- Date: 2026-10-29
- Amends: ADR-0001 (which listed Rapier for collision)

## Context
In the grey-box city the only collision is a walking player against static,
axis-aligned building footprints on flat ground (plus a small step up onto block
islands). Rapier adds a WASM module (~600 KB), async init, and a second source of
truth for the world geometry.

## Decision
Use `resolveCircle()` in `packages/world/src/collision.ts`: the player is a circle
pushed out of building rectangles from `WorldLayout.colliders`, then clamped to
the world bounds. It's pure TypeScript, unit-tested, and has zero runtime cost
worth measuring.

## Revisit when
Any of these arrive: moving vehicles or NPCs that push back, physics props
(cans, buckets), ramps or stairs with real height, or non-rectangular buildings.
Then add Rapier and feed it the same `colliders` data.
