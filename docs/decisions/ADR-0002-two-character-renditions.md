# ADR-0002: One character definition, two renditions (map + hero)

- Status: Proposed
- Date: 2026-10-29

## Context
The user wants a small, chunky style for map navigation (REF-004) and a larger,
detailed, lanky style for battle and the character builder (REF-005). The
proportions are very different (about 4 vs about 6.5 heads tall), so a single
mesh scaled down won't work. Both must still read as the same character.

## Decision
- A `CharacterDef` describes **identity**: genre, palette, outfit choices (as
  semantic part IDs like `hat.cowboy`, `top.plaid-shirt`), instrument, body params.
- Each semantic part has **two meshes**: `part.<slot>.<name>@map` and
  `part.<slot>.<name>@hero`. The studio and game pick the rendition by context.
- Two rigs that share the **same bone names** (`rig.humanoid.map.v1`,
  `rig.humanoid.hero.v1`), so animations are authored once and retargeted onto
  both. Map animations can be a smaller set (idle, walk, perform loop).
- Budgets: map ≤ 2k tris, 1 tiny pixel-art atlas (128 px, nearest filtering);
  hero ≤ 15k tris, 1 atlas at 1024 px.
- Battle and studio load hero assets; the world loads map assets only, and
  preloads the hero version of a musician when the player gets near.

## Alternatives
| Option | Why not |
|---|---|
| One mesh, scaled per view | Proportions differ too much; map version would be unreadable |
| Map rendition as 2D sprites | Breaks the 3D isometric look and dynamic lighting (W4) |
| Fully separate characters per view | Doubles authoring, the two drift apart, breaks C2 |

## Consequences
- Each outfit part is authored twice. Mitigation: the map version can often be
  generated from the hero version (decimate + pixel-bake) in the studio.
- The studio needs a side-by-side "map / hero" preview (also the C2 check).
