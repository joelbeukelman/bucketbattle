# References

Inspiration the user provided, and what we decided to take from each. Images live
in `docs/references/images/` (named `ref-NNN-short-name.ext`).

Each entry is added with the `add-reference` skill. Keep the format:

```
### REF-NNN — <title>
- Source: <link or images/ref-NNN-....png>
- Area: world | characters | ui | gameplay | audio | mood
- Take: <what we want from it, concrete>
- Avoid: <what we explicitly don't want from it>
- Principles touched: W2, C1 (new or changed)
```

## Index
| ID | Title | Area |
|---|---|---|
| REF-001 | Iso close-up: taxi garage with neon sign | world, mood |
| REF-002 | Iso city overview in rain, with HUD | world, ui, mood |
| REF-003 | Clean iso snow/industrial scene | world |
| REF-004 | Character sheet: map-scale kids | characters |
| REF-005 | Character sheet: battle-scale drummers | characters |
| REF-006 | Diorama: school district slab | world (structure) |
| REF-007 | Voxel-style dense grid | world (structure) |
| REF-008 | Low-poly grid with avenues | world (structure) |

---

### REF-001 — Iso close-up: taxi garage with neon sign
- Source: `images/ref-001-iso-taxi-garage-closeup.png` (user, 2026-10-29)
- Area: world, mood
- Observed: fixed high camera at roughly 30–35° above the ground, looking along a
  diagonal (isometric-style). Flat-shaded low-poly with no surface texture
  except painted details (checker trim, lane dashes). Warm low sun, long soft
  shadows, plus big drifting **cloud shadows** across the ground. Neon/emissive
  accents (cyan roof trim, glowing sign) with bloom. A **blur + white cloud
  vignette** on the edges of the screen (tilt-shift feel). Faint scanline/RGB-split
  "CRT" overlay. Streets are dark desaturated asphalt; the building sits on a
  raised light concrete pad. Planted medians with chunky low-poly trees and flowers.
- Take: camera angle; flat-shaded low-poly; emissive signage as accent; raised
  building pads; cloud shadows; edge blur/vignette.
- Avoid: CRT overlay at full strength (hurts readability on phones). Make it optional and subtle.
- Principles touched: W1, W4, W5 (new), W6 (new), W7 (new)

### REF-002 — Iso city overview in rain, with HUD
- Source: `images/ref-002-iso-city-map-rain-hud.png` (user, 2026-10-29)
- Area: world, ui, mood
- Observed: the **main navigation canvas**, zoomed out from REF-001. A road grid
  with each block a **raised "island"** with a curb edge, and each block has one
  theme: park with a pond, cemetery, basketball court, skate spot, brick
  apartment with helipad, small houses, gas station. Set pieces break up the
  grid: a river with a barge, a **drawbridge**, an **elevated train track**
  crossing diagonally. Rain, wet road reflections, lit windows, autumn trees.
  The play area is framed by **soft white clouds** at the screen edges. People are
  tiny (~1 m, roughly 20–30 px tall). HUD: money top-left, pause top-right, a
  **yellow off-screen arrow** pointing to an objective, and B/A buttons bottom-right
  with a radial meter around A.
- Take: one theme per block; landmark set pieces; clouds that frame the play area
  (they also hide where the world ends and areas still loading); off-screen
  objective arrow; HUD only on the top and bottom edges, with big thumb buttons.
- Avoid: covering the street with the HUD. Our musicians must stay readable at this zoom.
- Principles touched: W2, W3, W5, W8 (new), U2, U4 (new)

### REF-003 — Clean iso snow/industrial scene
- Source: `images/ref-003-iso-snow-industrial-clean.png` (user, 2026-10-29)
- Area: world
- Observed: same camera family, bright daylight, very clean flat colors and crisp
  shadows, no post effects. High prop density (shovels, fences, a snowmobile, crowds
  of tiny figures), and a few strong saturated accents (red silos, yellow
  house) against a mostly white/gray base.
- Take: a "clean" look with post effects off, which is our baseline for low-end
  devices; dense small props; a mostly neutral scene with a few saturated accents.
  It also suggests seasonal/district palette swaps are possible.
- Avoid: an all-white value range. City streets need the darker asphalt from REF-001/002.
- Principles touched: W2, W3, W6

### REF-004 — Character sheet: map-scale kids
- Source: `images/ref-004-characters-map-scale.jpg` (user, 2026-10-29)
- Area: characters
- Observed: blocky low-poly figures with **pixel-art textures** (hard pixel
  edges on clothes, faces, logos). Chunky proportions (about 4–4.5 heads tall),
  big chunky sneakers, and **headwear that defines the silhouette** (headband,
  cap with headphones, bun). Saturated outfit colors on a muted teal backdrop.
  Instruments are drawn at full size and readable (bass, drum kit, sticks).
- Take: the **map rendition** style. Low-res pixel textures with nearest
  filtering (cheap and on-style), simplified blocky meshes, and silhouettes
  that read from headwear and instrument alone.
- Avoid: fine detail that disappears at 20–30 px tall.
- Principles touched: C1, C2, C4 (new), C6 (new)

### REF-005 — Character sheet: battle-scale drummers
- Source: `images/ref-005-characters-battle-scale-drummers.jpg` (user, 2026-10-29)
- Area: characters
- Observed: **faceted low-poly** with visible flat planes and no smoothing.
  Lanky teen proportions (about 6–6.5 heads tall), thin limbs, **large ears**, big
  dark eyes under heavy lids, flat deadpan expressions. Oversized hats and shoes.
  Patterns (plaid, stripes, shirt graphics) are painted into textures, not
  modeled. Soft studio lighting on neutral gray. The six figures map almost
  one-to-one onto our genres: cap + gold chain (**rap**), long hair + black
  graphic tee + ripped jeans (**metal**), cowboy hat + plaid (**country**), beret +
  suspenders (**jazz**), shako + uniform + slung snare (**marching**), headband +
  bright 90s colorblock jacket (**K-pop**).
- Take: the **hero rendition** style used in battle and in the studio:
  proportions, facial style, faceting, painted patterns, and the genre-to-silhouette
  mapping above.
- Avoid: the facial expressions are all the same. Battle needs a few
  expression/emote variants per character.
- Principles touched: C1, C2, C3, C5 (new)

### REF-006 — Diorama: school district slab
- Source: `images/ref-006-diorama-school-district.jpg` (user, 2026-10-29; "structural map reference")
- Area: world (structure)
- Observed: one neighborhood cut out as a **diorama slab** with a soil
  cross-section edge on a neutral background. A large brick **school** with
  lettering and a clock, a front plaza and a monument, next to a **skate park +
  graffiti court**. Music landmarks: **"VINYL SHOP"** and a music store with
  signage. Mostly 2–5 story brick walk-ups and storefronts with awnings, a few
  towers at the back, red-roof houses at the edge, community garden plots and a
  tennis court near the front. **Rooftops are full of detail**: AC units, water
  tanks, antennas, satellite dishes. Graffiti/murals on many walls. Blocks are
  split into **several lots** with separate buildings. Lots of greenery.
- Take: the diorama slab as the **full-map / district-select view**; a school +
  skate + court cluster as the level-1 hub; music landmarks; rooftop clutter;
  blocks split into lots; murals as the "human-made" layer (W9).
- Avoid: realistic textures and dense detail at this fidelity. We keep the
  REF-001/002 flat low-poly look.
- Principles touched: W3 (revised), W6 (revised), W8 (revised), W10–W12 (new)

### REF-007 — Voxel-style dense grid
- Source: `images/ref-007-voxel-dense-grid.jpg` (user, 2026-10-29; "structural map reference")
- Area: world (structure)
- Observed: very high, close to top-down iso camera over a dense grid. A
  **school with its name on the roof**, a skate park right next to it, several
  courts (basketball, tennis, soccer) used as open blocks, vinyl/record shops on
  corners. **Crosswalks at every intersection**, traffic lights, a yellow center
  line. Warm brick/terracotta base with a few pastel accent buildings (teal,
  lilac). Roofs mix flat with clutter and pitched with dark or terracotta tiles.
  Voxel-like chunky props and tiny people.
- Take: rhythm of the street grid; open court blocks as breathing room and
  natural stages for musicians; signage on roofs so you can tell what a building
  is from above; a few pastel buildings as accents among the brick.
- Avoid: everything packed equally dense. The player needs clear walking routes and open space at stages.
- Principles touched: W3, W10, W12

### REF-008 — Low-poly grid with avenues
- Source: `images/ref-008-lowpoly-avenues-grid.jpg` (user, 2026-10-29; "structural map reference")
- Area: world (structure)
- Observed: **street hierarchy**: wide multi-lane avenues and narrower side
  streets, with large rectangular blocks. Tall towers at the edges and corners;
  the middle is low-rise (school, courts, skate park, shops). Clean low-poly with
  flat colors, close to our target look. Red-dirt planters, mixed tree types
  including palms.
- Take: avenue vs. street hierarchy (NYC-like); tall buildings around the edges with
  a low-rise core so sightlines stay open; this look is close to our target fidelity.
- Avoid: palm trees and red dirt in `kit.nyc`. Save them for other city kits (Dubai/LA-like).
- Principles touched: W11, W12

---

## Character sheets (generated from `docs/characters/PROMPT-MATRIX.md`)
Canonical designs once accepted. Review notes live in `docs/characters/prompt-kit.json` (`note`)
and show on the run sheet. The descriptions in prompt-kit.json were rewritten to match these images.

| File | Character | Review |
|---|---|---|
| `images/char-01-rap-turnaround.jpg` | Rap | ✅ Best match to C5 (hard facets, ears, eyes, chunky shoes). Used as an extra style reference for everyone. |
| `images/char-01-rap-map.jpg` | Rap (map) | ⚠️ Pixel textures fit C4, but proportions are still lanky; kit props drawn separately. Re-run with the chibi-first prompt. |
| `images/char-00-busker-turnaround.jpg` | Bucket Busker | ⚠️ Inconsistent between views (jacket, beanie), no back view, smoother than C5. Re-roll. |
| `images/char-00-busker-apose-front.jpg` | Bucket Busker | ✅ Clean front A-pose, outfit matches the turnaround. Usable for rigging. |
| `images/char-00-busker-expressions-*.jpg` | Bucket Busker | ✅ focused, surprised, triumphant, defeated read clearly (full body, not close-ups). ⚠️ neutral is off-model (green vest). Smug still missing. |
| `images/char-00-busker-instrument.jpg` | Bucket Busker | ⚠️ Faceted and on-palette, but reads as a barrel with a hose more than stacked paint buckets. |
| `images/char-02-metal-turnaround.jpg` | Metal | ✅ Strong silhouette (C1). Smoother than C5, two side views instead of a back. |
| `images/char-03-country-turnaround.jpg` | Country | ✅ Front, back, side. Undershirt switches orange/teal; teal is canonical. |
| `images/char-04-jazz-turnaround.jpg` | Jazz | ⚠️ Headwear changes (beanie vs headband), no side view. Purple beanie is canonical. Re-roll. |

Learned: single-figure front crops as `--oref` fixed the lineup problem; the busker A-pose and expressions came back as one figure each.

Learned: Midjourney drifts toward smooth "Pixar" shading unless a faceted image is in `--sref`. Adding the rap
turnaround as a second style reference is the fix.
