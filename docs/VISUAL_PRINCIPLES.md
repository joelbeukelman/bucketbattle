# Visual Principles — the "visual constitution"

Every visual choice should trace to a principle here or a reference in
`docs/references/README.md`. Principles marked **[provisional]** are still
hypotheses waiting for a reference.

Format for each principle: **rule** — why — how to check it.

## World
- **W1 Readable streets at a glance.** Dark, low-saturation asphalt; light raised
  block pads and curbs; lane dashes in pale yellow. Value contrast, not hue, separates
  street from block. (REF-001, REF-002) — check: grayscale screenshot still reads.
- **W2 Musicians pop from the background.** The environment stays muted with
  sparing accents. Musicians and their stage spot carry saturated color plus a
  marker (light pool or icon) at map zoom. (REF-002, REF-003) — check: squint
  test on a phone-size screenshot finds every musician.
- **W3 One theme per block, no visible repetition.** Each block is a themed
  island (park, court, school, shops, houses, lot…). Variation comes from a seed:
  color, signage, props. (REF-002) — check: no two adjacent blocks share a theme
  and color variant.
- **W4 Mood lighting.** Warm low key light, long soft shadows, cool fill;
  emissive windows, neon and signs as accents with mild bloom. Rain/dusk is the
  signature mood; clear daylight (REF-003) is a supported variant. (REF-001, REF-002)
- **W5 Isometric-style fixed camera.** High angle (about 30–35° above the ground),
  looking along a diagonal, narrow-FOV perspective (≈ 20–25°) so the scene
  feels miniature, with pinch to zoom between a close view (REF-001) and an
  overview (REF-002). The player can't rotate it freely in v1. (REF-001, REF-002)
- **W6 Flat-shaded low-poly, no busy textures.** World surfaces are colored
  through palettes and vertex colors; painted detail only for graphic
  elements (checker trim, lane lines, signs). (REF-001, REF-003)
- **W7 Miniature post-processing, every effect optional.** Effects in order of
  cost: edge vignette → cloud shadows (projected texture, cheap) → bloom on
  emissives → screen-edge blur (tilt-shift) → subtle CRT/scanline. Each one
  can be switched off; the "clean" preset matches REF-003. (REF-001)
- **W8 Clouds frame the world.** Soft white clouds/fog at the screen edges and
  at the world's boundary. They hide where the world ends and areas still
  loading, and on the full map they mark undiscovered areas. (REF-002)

## Characters
- **C1 Silhouette first.** Each musician is identifiable by silhouette alone:
  headwear + hair + instrument + footwear. (REF-004, REF-005) — check: black-fill render.
- **C2 Two renditions of one character.** Every character exists as a **map
  rendition** (REF-004) and a **hero rendition** (REF-005), with the same outfit,
  palette and silhouette features. See ADR-0002. — check: side-by-side render; you
  can tell who's who.
- **C3 Palette slots over unique textures.** Parts are colored through
  `skin/primary/secondary/accent` (+ `pattern` for plaid/stripes). Keeps the cast
  coherent and files small.
- **C4 Map rendition = chunky + pixel texture.** About 4–4.5 heads tall, blocky
  meshes, oversized sneakers/headwear, small textures (64–128 px) with nearest
  filtering, no smoothing. (REF-004)
- **C5 Hero rendition = lanky faceted teen.** About 6–6.5 heads tall, thin limbs,
  large ears, big dark heavy-lidded eyes, visible flat facets, oversized hats
  and shoes, patterns painted into textures. (REF-005)
- **C6 Instruments read at every scale.** Instruments (drums, sticks, buckets) are
  slightly oversized compared with real life and use the character's accent color.
  (REF-004, REF-005)

## UI (HUD, map, studio)
- **U1 Tokens only.** Colors, radii, spacing, type come from `packages/ui` tokens.
- **U2 Thumb-reachable.** Primary controls in the bottom third, ≥ 44 pt targets;
  big round glossy action buttons. (REF-002)
- **U3 Map matches the world.** Map colors are derived from the world's palette.
- **U4 HUD on the edges, world in the middle.** Stats top corners, actions bottom;
  objectives off-screen are shown with an edge arrow in the accent yellow. (REF-002)

## Change log
- 2026-10-29: initial provisional set.
- 2026-10-29: REF-001–005 added. Confirmed W1–W4, C1–C3, U2; added W5–W8, C4–C6, U4.
