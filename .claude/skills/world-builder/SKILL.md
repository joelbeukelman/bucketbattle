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
- 3D and map both use `worldToMap()` from `packages/world`; never duplicate projection math.
- Encounters (`EncounterDef`) live in world data and reference a `MusicianDef` by ID.

## Adding a new tile/prop
1. Model in Blender per `asset-pipeline` skill → `assets/glb/`.
2. Register in the tile kit registry (`packages/world/src/kit.ts`) with footprint + rotations.
3. Add a gray-box fallback so worlds load before art exists.
4. Place in a test world; run `visual-review`.

## Done means
Schema validates, test world loads, perf within budget, map shows it correctly, `log-progress` run.
