# Progress Log

Newest first. Each entry: what changed, decisions made, open questions, next up.
Maintained by the `log-progress` skill.

## Next up
1. Phase 0: scaffold pnpm workspace (`apps/game`, `apps/studio`, `packages/schema|engine|world|characters|ui`), Vite + R3F, lint/test.
2. Phase 1 spike: gray-box themed block islands from a `WorldDef` JSON (`kit.nyc`), home spawn → corner bucket stage → school, iso follow camera (W5), tap-to-move, 2D minimap.
3. Studio spike: viewport in game lighting + reference-image overlay + procedural faceted primitives; block out the marching kid (hero) from REF-005.
4. Get turnarounds (front/side/back/3-4) for the six drummers from the user.
5. Get a reference for the level-1 corner bucket performer; confirm how futuristic the city is (W9).

## Open questions
See `docs/ARCHITECTURE.md` §9.

---

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
