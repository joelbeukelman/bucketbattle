---
name: character-studio
description: Conventions for the Bucket Battle Character & Model Studio — base rig, part slots, palettes, body params, animation preview, CharacterDef/MusicianDef JSON, GLB import validation and export. Use when working in apps/studio or packages/characters, or creating/editing a character, musician, or prop.
---

# Character & Model Studio

## Rules
- Two renditions (ADR-0002): `@map` (REF-004, C4) and `@hero` (REF-005, C5) meshes per part, on
  `rig.humanoid.map.v1` / `rig.humanoid.hero.v1`, which share Mixamo bone names. Parts bind to their rig;
  animations retarget across both. A new rig requires an ADR. Always show map + hero side by side.
- Slots: `head, hair, face, torso, legs, feet, hands, hat, accessory, instrument`.
  Part IDs: `part.<slot>.<name>`.
- Color through palette slots `skin/primary/secondary/accent` (principle C3); parts
  ship with a grayscale/mask texture, not baked colors.
- Saved output is **`CharacterDef` JSON** (source of truth) **plus** an optional
  merged, optimized GLB for the game. The game must be able to assemble from JSON alone.
- Studio viewport uses the **same lighting/material setup as the game** (import it
  from `packages/engine`) so what you see is what ships.
- Budgets: hero ≤ 15k tris, 1024 px atlas; map ≤ 2k tris, 128 px pixel atlas (nearest); ≤ 60 bones.
- **Faceted look is made here (C7).** Concept turnarounds are often smooth; the studio's mesh must
  be hard-faceted anyway: flat shading (`flatShading: true` / split normals), hero ≤ 15k tris, no smoothing
  groups. Image-to-3D results get decimated and flat-shaded before export. Compare against `char-01-rap-*`.
- Canonical silhouettes for the starter six: `docs/characters/ROSTER.md` + REF-005.

## Import (from Blender or generation tools)
Validator must check and report, not silently fix:
scale (height: hero 1.4–1.9 m, map 1.0–1.5 m — teens), Y-up, origin at feet, bone names match
rig, tri count, texture size, material count. Offer one-click fixes where safe
(re-center origin, rescale).

## Done means
Round-trip works (create → save JSON → reload → identical), exported GLB loads in
the game, silhouette check (C1) passes in `visual-review`, `log-progress` run.
