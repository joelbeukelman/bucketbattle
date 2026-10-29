---
name: world-builder
description: Conventions for building the Bucket Battle city — WorldDef/BlockDef data, modular tile kit, instancing, chunking, encounters, and the minimap/full map. Use when adding or changing tiles, blocks, districts, landmarks, musician spawn points, the player controller/camera, or map rendering.
---

# World builder

## Rules
- The world is **data** (`assets/data/worlds/*.json`, schema `packages/schema` `WorldDef`).
  Never hard-code layout in components.
- Grid: block = `blockSize` tiles; tile = 4 m (change only via ADR). Streets are
  derived between blocks — author blocks, not curbs.
- Every tile/prop has an ID `tile.<family>.<name>` / `prop.<family>.<name>` and a
  GLB in `assets/glb/` that snaps to the 4 m grid with origin at base center.
- Render repeated things with `InstancedMesh` (one per tile/prop kind per chunk).
- Generated variation must be **seeded and deterministic** — same seed, same block.
- 3D and map both use `createMapProjection()` from `packages/world`; never duplicate projection math.
- Encounters (`EncounterDef`) live in world data and reference a `MusicianDef` by ID.

## Where the code lives
- Schema: `packages/schema/src/world.ts` (`WorldDef`, `BlockDef`, `LotDef`, `WorldPoint`…)
- Layout (metres, streets, markings, roof props, trees, colliders): `packages/world/src/layout.ts`
- Seeded lot generator (themes → lots): `packages/world/src/generate.ts`
- Map projection (minimap + full map): `packages/world/src/map.ts`
- Level data: `assets/data/worlds/*.json`; tests: `packages/world/test/`
- Renderer: `apps/game/src/scene/City.tsx` (instanced), grey-box palette `apps/game/src/palette.ts`

## Editing a level
1. Edit the JSON. Prefer block-anchored points (`{ "block": [row, col], "offset": [x, z] }`) for
   spawn/encounters so they survive street-width changes.
2. `pnpm test` (validates schema, full lot coverage, spawn/encounters not inside buildings).
3. `pnpm dev` + `pnpm shots`, then `visual-review`.

## Adding a new tile/prop
1. Model in Blender per `asset-pipeline` skill → `assets/glb/`.
2. Register it in the city kit (`CityKitDef`, ADR-0003; not built yet, so create it when the first real asset lands).
3. Add a gray-box fallback so worlds load before art exists.
4. Place in a test world; run `visual-review`.

## Done means
Schema validates, test world loads, perf within budget, map shows it correctly, `log-progress` run.
