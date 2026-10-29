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
- **W3 Themed blocks split into lots, no visible repetition.** Each block is a
  raised island with one dominant theme (school, shops, houses, court, park…)
  that holds several **lots**, each with its own building or feature
  (REF-006/007). Open blocks (courts, skate parks, gardens, plazas) break up the
  built ones and serve as stages (REF-002/007). Variation comes from a seed:
  color, signage, props. — check: no two adjacent blocks share a theme +
  color variant; each block has ≥ 2 distinct lots.
- **W4 Mood lighting.** Warm low key light, long soft shadows, cool fill;
  emissive windows, neon and signs as accents with mild bloom. Rain/dusk is the
  signature mood; clear daylight (REF-003) is a supported variant. (REF-001, REF-002)
- **W5 Isometric-style fixed camera.** High angle (about 30–35° above the ground),
  looking along a diagonal, narrow-FOV perspective (≈ 20–25°) so the scene
  feels miniature, with pinch to zoom between a close view (REF-001) and an
  overview (REF-002). The player can't rotate it freely in v1. (REF-001, REF-002)
- **W6 Flat-shaded low-poly, no busy textures.** World surfaces are colored
  through palettes and vertex colors; painted detail only for graphic
  elements (checker trim, lane lines, signs, murals). Facades may use **one shared
  low-res trim sheet** for windows/brick courses. Detail comes from shape and
  props, not photo textures. Structural refs (REF-006–008) inform layout, not
  fidelity. (REF-001, REF-003, REF-008)
- **W7 Miniature post-processing, every effect optional.** Effects in order of
  cost: edge vignette → cloud shadows (projected texture, cheap) → bloom on
  emissives → screen-edge blur (tilt-shift) → subtle CRT/scanline. Each one
  can be switched off; the "clean" preset matches REF-003. (REF-001)
- **W8 Clouds frame the world.** Soft white clouds/fog at the screen edges and
  at the world's boundary. They hide where the world ends and areas still
  loading, and on the full map they mark undiscovered areas. (REF-002) On the
  full-map / district-select screen, a district is shown as a **diorama slab** with
  a soil edge on a neutral background. (REF-006)

- **W9 Handmade vs. machine-made [provisional].** The near-future city (NARRATIVE.md)
  is recognizable but has a layer of AI content: uniform glossy screens and
  ads playing "generated" music, delivery drones, identical chain storefronts. These
  stay **cool, uniform and clean**. Human music and its spaces (stages, street
  art, buskers, the player's performances) are **warm, saturated, imperfect,
  hand-painted**. This reinforces W2. — check: in a screenshot you can tell which
  elements are "human" and which are "AI".

- **W10 Roofs are the main surface.** The camera mostly sees roofs, so roofs get the
  detail: AC units, water tanks, antennas, skylights, rooftop gardens, and
  **readable roof signage** on landmarks (SCHOOL, VINYL). (REF-006/007) — check: at
  overview zoom you can name the school and the music landmarks from the roof alone.
- **W11 Low-rise core, tall edges.** Play areas are 1–5 stories; towers sit at
  district edges/background so they frame the area without hiding streets or
  the player. Anything taller than ~5 stories in front of the player fades out.
  (REF-006/008)
- **W12 Street hierarchy and crossings.** Wide avenues (4 lanes) and narrow
  streets (2 lanes), rectangular NYC-like blocks; crosswalks at every
  intersection, yellow center lines, traffic lights. (REF-007/008)

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
- **C7 Hard-faceted poly for every character, never smooth.** Kids, adults and NPCs alike:
  sharp angular low-poly with visible flat facets. No smooth or Pixar-style shading, glossy plastic,
  or subsurface skin. The rap turnaround (`char-01-rap-*`) is the style anchor. (User decision
  2026-10-29) — check: facets visible on face, clothes and shoes on the **in-game 3D model**.
  Concept art may be smoother: Midjourney won't reliably facet faces, so turnarounds are judged on
  outfit, proportions and consistency, and the faceted look is applied in 3D (low tri count, flat shading).
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
- 2026-10-29: C7 clarified: facets are enforced on the 3D model, not the concept art (user choice).
- 2026-10-29: C7 added: hard-faceted poly for all characters (user: "poly not smooth").
- 2026-10-29: initial provisional set.
- 2026-10-29: REF-006–008 added. Revised W3 (lots), W6 (trim sheet), W8 (diorama map); added W10–W12.
- 2026-10-29: W9 added (provisional) from the narrative premise.
- 2026-10-29: REF-001–005 added. Confirmed W1–W4, C1–C3, U2; added W5–W8, C4–C6, U4.
