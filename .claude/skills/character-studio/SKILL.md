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

## Where the code lives
- Schema: `packages/schema/src/character.ts` (`CharacterDef`, part kind enums). New part kind = add to the enum + a builder branch.
- Builder: `packages/characters/src/` — `rig.ts` (proportions per rendition, Mixamo-named pivots, poses),
  `parts/body.ts` (skin, head, face, hair), `parts/wear.ts` (hats, tops, bottoms, socks, shoes),
  `parts/props.ts` (accessories, instruments), `geometry.ts` (faceted primitives, flat-shaded materials).
- Data: `assets/data/characters/<id>.json` (one per character). Tests: `packages/characters/test/`.
- Studio app: `apps/studio` (`pnpm studio` → :5174). Dev "Save to repo" writes the JSON via `/__studio/save`.
- Live link (Artifact): https://claude.ai/artifact/MFTEEDnycEzCvnRYUyRdbe

## Change-by-chat loop (user asks "Rap: bigger ears, thicker chain")
1. Edit `assets/data/characters/<id>.json` (data-only change) or the builder (new shape/kind). Prepend a
   `history` entry: `{ "date": "YYYY-MM-DD", "note": "<what changed, in the user's words>" }`.
2. `pnpm test` (schema + budgets), then with `pnpm studio` running: `pnpm studio:shots <name>` and **look at**
   `docs/progress/studio/<name>-hero.png` next to the concept. Fix until it matches the request.
3. `pnpm studio:publish`, then republish `apps/studio/dist/artifact.html` to the live link with `root: apps/studio/dist`
   and `files` = the list in `apps/studio/dist/artifact-files.json` (asset names are content-hashed; pass `null`
   for the previous build's paths so they don't pile up).
4. Commit + push. Tell the user what changed and anything you couldn't match.
- Builder changes affect every character: run shots for all seven, not just the one asked about.
- If the user edited in the live page, they'll paste JSON or describe it; merge into the file, don't overwrite blindly.

## Import (from Blender or generation tools)
Validator must check and report, not silently fix:
scale (height: hero 1.4–1.9 m, map 1.0–1.5 m — teens), Y-up, origin at feet, bone names match
rig, tri count, texture size, material count. Offer one-click fixes where safe
(re-center origin, rescale).

## Done means
Round-trip works (create → save JSON → reload → identical), exported GLB loads in
the game, silhouette check (C1) passes in `visual-review`, `log-progress` run.
