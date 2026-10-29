# Midjourney Prompt Kit — characters

Prompts that produce the concept art the studio pipeline needs (ARCHITECTURE §5.4):
**turnarounds** for modeling and image-to-3D, an **A-pose** for rigging, a **map
rendition** (C4), an **expression sheet** for battle, and an **instrument sheet**.

## How to use
1. **Style references.** Upload `images/ref-005-characters-battle-scale-drummers.jpg`
   (hero style) and `images/ref-004-characters-map-scale.jpg` (map style) to
   Midjourney and copy their image URLs into `<HERO_SREF>` / `<MAP_SREF>`. (Raw GitHub
   URLs only work if the repo is public.)
2. **Keep one character consistent.** Once you like a character's first image,
   use it as the character/omni reference (`--cref` or `--oref`, depending on your
   Midjourney version) for that character's other sheets.
3. **Build a prompt** from the shared **style block** + the **character block** + the
   **sheet block**. Ready-to-paste prompts for the first character are at the bottom.
4. **Save the results** to `docs/references/images/char-<id>-<sheet>.png` and tell
   Claude. The `add-reference` skill files them and checks them against C1–C6.

## Style blocks
**HERO** (battle + studio, REF-005, C5):
> low-poly faceted 3D game character, visible flat-shaded polygon planes, lanky
> teenager about 6.5 heads tall, thin limbs, large ears, big dark heavy-lidded eyes,
> deadpan expression, oversized shoes and headwear, clothing patterns painted as
> flat textures, soft even studio lighting, plain neutral gray background

**MAP** (navigation, REF-004, C4):
> chunky blocky low-poly 3D game character with crisp pixel-art textures, about 4
> heads tall, oversized sneakers, simple readable silhouette, saturated outfit colors,
> plain muted teal background

## Sheet blocks
| Sheet | Text | Params |
|---|---|---|
| **Turnaround** | `character turnaround sheet, same character shown four times: front view, three-quarter view, side profile, back view, full body, neutral standing pose, evenly spaced, orthographic` | `--ar 16:9 --style raw --sref <HERO_SREF> --no text, labels, perspective distortion, cropped feet` |
| **A-pose** | `full body A-pose, arms angled 45 degrees down and away from the body, legs slightly apart, front view and side view side by side, orthographic, for 3D rigging` | `--ar 3:2 --style raw --sref <HERO_SREF> --no text, instrument, props` |
| **Map rendition** | `turnaround sheet, front, three-quarter and back view, full body, holding their instrument` | `--ar 16:9 --style raw --sref <MAP_SREF> --no text` |
| **Expressions** | `expression sheet, head and shoulders, six panels: neutral deadpan, focused concentration, smug grin, surprised, triumphant cheer, defeated slump` | `--ar 3:2 --style raw --sref <HERO_SREF> --no text` |
| **Instrument** | `prop sheet of the instrument only, front, side and top views, low-poly faceted, painted flat textures, plain gray background` | `--ar 16:9 --style raw --sref <HERO_SREF> --no hands, people, text` |

## Character blocks
Skin tones follow REF-005 to keep the cast consistent; change them freely.

**00 · Bucket Busker (level 1 opener)**. *Placeholder design; replace if you have a reference.*
> near-future street performer drumming on upturned plastic paint buckets, beanie
> with a handmade patch, oversized thrifted work jacket covered in hand-painted
> doodles, cargo pants, taped-up sneakers, drumsticks wrapped in grip tape, a small
> stack of buckets and a cymbal made from a hubcap, warm handmade feel

**01 · Rap**
> teen drummer, medium brown skin, short twists, backward dark-navy snapback,
> thick gold chain, oversized slate-blue hoodie with orange arm stripes, black
> shorts, tall white socks with red stripes, chunky gray and yellow sneakers, small
> red snare drum held at the waist, drumsticks

**02 · Metal**
> tall lanky teen drummer, very long straight black hair covering the ears, black
> oversized tee with a bright multicolor graphic, ripped light-blue jeans, black
> sneakers, watch, drumsticks crossed in an X in front of the body

**03 · Country**
> teen drummer, deep brown skin, tan cowboy hat, red and navy plaid button-up shirt
> over a mint undershirt, rolled light jeans, mustard work boots with socks showing,
> orange snare drum on a strap, drumsticks

**04 · Jazz**
> small teen drummer, light tan skin, black hair in two braided pigtails, purple
> beret, white short-sleeve collared shirt, black high-waisted shorts with
> suspenders, striped knee socks, brown shoes, purple wristband, wire brushes and a snare

**05 · Marching**
> teen marching-band drummer, medium brown skin, very tall dark-green shako hat with
> red and gold bands, dark-green military band jacket with gold frogging and a white
> diagonal sash, black trousers with a red stripe, black shoes, large orange marching
> snare on a harness, gold-tipped sticks

**06 · K-pop**
> teen drummer, light skin, messy sandy dreadlocks, white headband, bright 90s
> colorblock jacket in teal, pink and yellow over a lilac knit sweater, olive shorts,
> striped socks, red and teal high-top sneakers, small backpack, drumsticks mid-twirl,
> practice pad

## Ready-to-paste: 01 · Rap
**Hero turnaround**
```
low-poly faceted 3D game character, visible flat-shaded polygon planes, lanky teenager about 6.5 heads tall, thin limbs, large ears, big dark heavy-lidded eyes, deadpan expression, oversized shoes and headwear, clothing patterns painted as flat textures, soft even studio lighting, plain neutral gray background, teen drummer, medium brown skin, short twists, backward dark-navy snapback, thick gold chain, oversized slate-blue hoodie with orange arm stripes, black shorts, tall white socks with red stripes, chunky gray and yellow sneakers, small red snare drum held at the waist, drumsticks, character turnaround sheet, same character shown four times: front view, three-quarter view, side profile, back view, full body, neutral standing pose, evenly spaced, orthographic --ar 16:9 --style raw --sref <HERO_SREF> --no text, labels, perspective distortion, cropped feet
```
**Map rendition**
```
chunky blocky low-poly 3D game character with crisp pixel-art textures, about 4 heads tall, oversized sneakers, simple readable silhouette, saturated outfit colors, plain muted teal background, teen drummer, medium brown skin, short twists, backward dark-navy snapback, thick gold chain, oversized slate-blue hoodie with orange arm stripes, black shorts, tall white socks, chunky gray and yellow sneakers, small red snare drum, turnaround sheet, front, three-quarter and back view, full body, holding their instrument --ar 16:9 --style raw --sref <MAP_SREF> --no text
```

## Priority order
1. Hero turnaround for all seven. This unblocks modeling and image-to-3D.
2. A-pose for all seven.
3. Map rendition, then instrument sheets, then expressions.
