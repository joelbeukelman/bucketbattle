# Starter Roster — six middle-school drummers

**Level 1 opener:** the corner bucket performer between home and school (see
`docs/NARRATIVE.md`). First pass: patched beanie, mustard patch-covered bomber, camo cargos (`char-00-busker-turnaround.jpg`).

**Canonical looks** now come from the accepted turnaround images (see `docs/references/README.md` → Character sheets)
and the descriptions in `prompt-kit.json`. This table is the design intent; the images win where they differ.

Design brief for the first six musicians. Silhouettes come from REF-005 (hero)
and are simplified per REF-004 (map). Names are placeholders. Once
`packages/schema` exists, each becomes a `CharacterDef` + `MusicianDef` in
`assets/data/`.

| # | Genre | Silhouette hooks (C1) | Palette (primary / secondary / accent) | Drum | Battle flavor (later) |
|---|---|---|---|---|---|
| 1 | **Rap** | backward snapback, gold chain, oversized hoodie with orange patterned cuffs, shorts + striped tube socks, chunky yellow sneakers | slate blue / orange / gold | short snare at the waist (bucket variant?) | boom-bap groove, syncopated snare/kick |
| 2 | **Metal** | very long straight black hair, black beanie, square sunglasses, black graphic tee, ripped teal jeans, wristbands | black / denim / hot multicolor graphic | sticks only, then a double-bucket "kit" | fast 16ths, double-kick bursts |
| 3 | **Country** | cowboy hat, red plaid shirt, rolled jeans, boots | red plaid / denim / mustard | snare on a strap | train beat, shuffles |
| 4 | **Jazz** | purple knit beanie, two long braids, white tee, suspenders, cuffed shorts, striped socks, suede boots | white / black / purple | brushes + snare | swing ride patterns, ghost notes |
| 5 | **Marching** | tall shako hat with plume band, military jacket, white sash | forest green / black / gold | big slung marching snare | rudiments: flams, rolls, paradiddles |
| 6 | **K-pop** | white headband, messy curls, 90s colorblock jacket, backpack, hi-tops | teal / pink / yellow | sticks + practice pad, choreographed stick tricks | tight, quantized pop patterns with call-and-response breaks |

## Open
- ~~Buckets vs. drums~~: answered. Level 1 is a **bucket street performer** on a
  corner (separate from the six kids; age and look TBD). Each later level brings a new drum
  type and setting, so the six kids' drums above stand, and each kid becomes a
  level with its own instrument and stage.
- Map each kid to a level order + stage (court, subway, rooftop, school band room…).
- The player character: one more kid built in the character builder, who
  starts at home and walks past the bucket corner toward school.
- More views per character (front, side, back, 3/4, T-pose) would help both
  modeling and AI image-to-3D. See ARCHITECTURE §5.4.
