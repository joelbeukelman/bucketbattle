# Visual Principles — the "visual constitution"

Every visual choice should trace to a principle here or a reference in
`docs/references/README.md`. Principles marked **[provisional]** are my starting
hypotheses and must be confirmed or replaced once references arrive.

Format for each principle: **rule** — why — how to check it.

## World
- **W1 Readable streets at a glance [provisional].** Roads, sidewalks and
  building bases have distinct value (light/dark), not just hue — why: phones,
  sunlight, small screens — check: grayscale screenshot still reads.
- **W2 Musicians pop from the background [provisional].** Environment is lower
  saturation; musicians and their stages carry the saturated accents and/or a
  rim light — check: squint test on a screenshot finds every musician.
- **W3 Repeating kit, not repeating look [provisional].** Modular tiles are fine;
  visible repetition is not — vary color, signage, props per block via seed.
- **W4 Mood lighting [provisional].** Warm key light, cool shadows, emissive
  windows/signs as accent.

## Characters
- **C1 Silhouette first [provisional].** Each musician is identifiable by
  silhouette alone (hat, instrument, posture) — check: black-fill render.
- **C2 Stylized proportions [provisional].** Slightly oversized heads/hands for
  expressiveness at small sizes. Exact ratios TBD from references.
- **C3 Palette slots over unique textures.** Parts are colored through
  `skin/primary/secondary/accent` — keeps the cast coherent and files small.

## UI (HUD, map, studio)
- **U1 Tokens only.** Colors, radii, spacing, type come from `packages/ui` tokens.
- **U2 Thumb-reachable.** Primary game controls in the bottom third, ≥ 44 pt targets.
- **U3 Map matches the world.** Map colors are derived from the world's palette.

## Change log
- 2026-10-29 — initial provisional set, awaiting references.
