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
