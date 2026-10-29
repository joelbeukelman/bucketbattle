---
name: character-studio
description: Conventions for the Bucket Battle Character & Model Studio — base rig, part slots, palettes, body params, animation preview, CharacterDef/MusicianDef JSON, GLB import validation and export. Use when working in apps/studio or packages/characters, or creating/editing a character, musician, or prop.
---

# Character & Model Studio

## Rules
- One skeleton: `rig.humanoid.v1` (Mixamo bone names). All skinned parts bind to it;
  all animations target it. A new rig requires an ADR.
- Slots: `head, hair, face, torso, legs, feet, hands, hat, accessory, instrument`.
  Part IDs: `part.<slot>.<name>`.
- Color through palette slots `skin/primary/secondary/accent` (principle C3); parts
  ship with a grayscale/mask texture, not baked colors.
- Saved output is **`CharacterDef` JSON** (source of truth) **plus** an optional
  merged, optimized GLB for the game. The game must be able to assemble from JSON alone.
- Studio viewport uses the **same lighting/material setup as the game** (import it
  from `packages/engine`) so what you see is what ships.
- Budgets (ARCHITECTURE §7): ≤ 15k tris, ≤ 60 bones, one atlas per character.

## Import (from Blender or generation tools)
Validator must check and report, not silently fix:
scale (height 1.4–2.2 m for humanoids), Y-up, origin at feet, bone names match
rig, tri count, texture size, material count. Offer one-click fixes where safe
(re-center origin, rescale).

## Done means
Round-trip works (create → save JSON → reload → identical), exported GLB loads in
the game, silhouette check (C1) passes in `visual-review`, `log-progress` run.
