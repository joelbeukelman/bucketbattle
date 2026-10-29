# Progress Log

Newest first. Each entry: what changed, decisions made, open questions, next up.
Maintained by the `log-progress` skill.

## Next up
1. Play-test the grey box on a real iPhone (`pnpm dev`, open the Network URL) and check fps, zoom feel, and tap-to-move.
2. Studio spike: `apps/studio` with game lighting from a shared `packages/engine`, a reference-image overlay, faceted primitives; block out the busker (map rendition).
3. `CityKitDef` for `kit.nyc` (ADR-0003): move palette + theme→massing rules out of `apps/game/src/palette.ts`; add stoops, awnings, and fire escapes as the first kit pieces.
4. World detail pass: storefront awnings/signs on shop ground floors, more roof variety (W10), place the six school kids as locked markers near the school.
5. User: turnarounds via `docs/characters/PROMPTS.md`; a reference for the busker; confirm how futuristic the city is (W9).

## Open questions
See `docs/ARCHITECTURE.md` §9.

---

## 2026-10-29 — Session 2b: prompt matrix
- `docs/characters/prompt-kit.json` (styles, 5 sheets, 7 characters) → `pnpm prompts` (tools/build-prompts.ts) generates
  `PROMPT-MATRIX.md` (35 prompts, V7 syntax) and `prompt-matrix.html`, published as an Artifact run sheet:
  https://claude.ai/artifact/NPFQpoyCgdRGz1MpB1pot7
- Repo is **public**, so raw GitHub URLs of REF-004/005 work directly as `--sref`.
- Turnaround/A-pose/expressions now leave the instrument out; instrument has its own prop sheet. Map sheet uses a light `--oref` (`--ow 40`).

## 2026-10-29 — Session 2: grey-box city (level 1)
- Scaffolded pnpm workspace: `packages/schema` (Zod `WorldDef`, blocks, lots, streets, encounters,
  block-anchored `WorldPoint`), `packages/world` (layout, seeded lot generator, markings, roof props,
  trees, collision, shared map projection), `apps/game` (Vite + R3F + zustand). 11 Vitest tests.
- `assets/data/worlds/level-01.json` (`kit.nyc`): 4×3 blocks, avenues + streets; home → bucket corner (by the VINYL shop) → school + skate/court hub;
  towers on the back row (W11); park, garden, music store.
- Game: iso follow camera (W5, FOV 22°, pinch/scroll zoom, pulled back on portrait), WASD + tap-to-move, walking collision,
  step up onto block islands, busker encounter with pulsing ring + light (W2), A/B buttons, interact prompt,
  edge arrow (U4), minimap + full map from one renderer rotated to camera yaw with fog of war (W8), CSS cloud vignette,
  roof signs (W10), crosswalks/center lines/lane dashes (W12), shader cutaway so the player shows through buildings (W11).
- Perf: **23 draw calls, ~22k triangles** (budget 150 / 300k); JS bundle 290 KB gzipped.
- `pnpm shots` (tools/screenshot.ts) captures spawn/busker/occluded/overview/map at desktop + phone → `docs/progress/2026-10-29/`.
- Decision: ADR-0004, simple 2D circle-vs-rect collision instead of Rapier for now.
- Learned / gotchas:
  - Cutaway must only cut fragments with `t < len - radius`, or walls *behind* the player get holes (caught in visual review).
  - Headless Chromium uses SwiftShader: fps in `__bbStats` is meaningless there. Measure fps on a device.
  - Playwright must stay at the preinstalled version (1.63.0) to find `/opt/pw-browsers`.

## 2026-10-29 — Session 1d: structural map references
- Added REF-006 (diorama school district), REF-007 (voxel dense grid), REF-008 (low-poly avenues).
- Principles: W3 now "themed blocks split into lots"; W6 allows one shared facade trim sheet; W8 adds diorama slab
  for district select; new W10 roofs-first, W11 low-rise core / tall edges, W12 avenue/street hierarchy + crosswalks.
- ARCHITECTURE: `BlockDef.lots`, `LotDef`, `StreetDef`, music landmarks (vinyl shop, music store), height zoning, diorama district select.
- Decision: structural refs inform **layout**, not fidelity. Fidelity stays REF-001/002 flat low-poly (W6).
- Learned: all three refs put **school + skate park + courts** together. Use that as the level-1 hub layout.

## 2026-10-29 — Session 1c: narrative & cities
- New `docs/NARRATIVE.md`: near-future world where AI has commodified art; a kid discovers they can make and perform music.
- Level 1 = bucket street performer on a corner between home and school; each level brings a new drum + setting.
- ADR-0003 (proposed): shared city layout rules + per-city kits; first `kit.nyc` (fictional), later Tokyo/Dubai/London/Bangkok.
- Spawn moved to **home**; school becomes the first landmark. W9 handmade-vs-machine principle added (provisional).

## 2026-10-29 — Session 1b: first references
- Added REF-001–005 (3 world screens, 2 character sheets) with take/avoid notes.
- VISUAL_PRINCIPLES: confirmed W1–W4, C1–C3, U2; added W5 iso camera, W6 flat low-poly,
  W7 optional miniature post-processing, W8 cloud framing, C4/C5 map vs. hero styles, C6 instruments, U4 edge HUD.
- ADR-0002 (proposed): one CharacterDef, two renditions (map/hero), two rigs sharing bone names.
- ARCHITECTURE: themed block islands, school spawn, set pieces, iso camera, §5.4 concept→game workflow, Babylon tools as utilities only.
- New `docs/characters/ROSTER.md`: six drummers (rap, metal, country, jazz, marching, K-pop) mapped to REF-005 silhouettes.
- Learned: REF-005's six figures already line up with the six genres. Treat it as the canonical silhouette source.

## 2026-10-29 — Session 1: plan & memory system
- Repo was empty; added `CLAUDE.md`, architecture plan, provisional visual principles,
  references index, ADR-0001 (stack), and `.claude/skills/` workflows.
- Decision: TypeScript + Vite + Three.js/R3F + Rapier + Zustand + Zod; Capacitor for iOS (ADR-0001, proposed).
- Decision: data-first — worlds/characters/musicians are schema-validated JSON shared by game and studio.
- No code yet.
