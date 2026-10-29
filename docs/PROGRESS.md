# Progress Log

Newest first. Each entry: what changed, decisions made, open questions, next up.
Maintained by the `log-progress` skill.

## Next up
1. Iterate characters by chat in the Character Workshop (https://claude.ai/artifact/MFTEEDnycEzCvnRYUyRdbe), one change request at a time.
2. Map rendition: pixel-art textures (C4) instead of flat colors; tune chibi proportions against REF-004.
3. Export: skinned GLB per character (GLTFExporter + real SkinnedMesh bound to the Mixamo-named pivots), then drop the busker model into the game at the bucket corner.
4. Marching turnaround (user) → crop → match the model.
5. Play-test the grey-box city on a phone; confirm how futuristic the city is (W9).

## Open questions
See `docs/ARCHITECTURE.md` §9.

---

## 2026-10-29 — Session 3: Character Workshop
- `packages/schema/src/character.ts`: `CharacterDef` (body proportions, skin, face, one kind + colors per slot, accessories, instrument, reference, history).
- `packages/characters`: procedural hard-faceted builder (C7) with Mixamo-named pivot rig, A-pose / idle / drumming poses,
  hero + map renditions from the same data (ADR-0002). ~2.8k tris per hero model (budget 15k).
- `assets/data/characters/*.json`: all seven characters matched to their front crops (Marching from the brief).
- `apps/studio`: Character Workshop — character strip, live viewport (pose, battle/map/both, turntable), reference beside/overlay,
  controls for every slot and color, drafts in the browser, dev "Save to repo", Copy JSON, history.
- `packages/engine`: shared lighting preset used by game and studio.
- Tools: `pnpm studio`, `pnpm studio:shots`, `pnpm studio:publish`. Live link published as an Artifact.
- Process: compared every model against its concept, fixed head size (now ~27% of height), eye size, chunky shoes, U-shaped chain, thicker dreads.
- Gotcha: Vite configs run in plain Node and can't import workspace TS packages; load them with `server.ssrLoadModule`.

## 2026-10-29 — Session 2f: round-2 turnarounds
- New turnarounds for Busker, Metal, Country, Jazz, K-pop (outfits consistent, faces still mostly smooth); front crops made for all; looks updated from the images.
- Decision (user): **facets come from 3D**. Concept art is judged on outfit/proportions/consistency; the studio enforces flat shading + tri budget (C7 clarified, character-studio skill updated).
- Decision (user): Country keeps the beard, chain and earrings.
- Only Marching still needs a turnaround.

## 2026-10-29 — Session 2e: poly, not smooth
- User decision: every character is hard-faceted poly (new principle C7). Busker images were smooth/Pixar-like.
- Moved smooth images (busker set, metal/country/jazz turnarounds + crops) to `docs/references/images/explore/` as outfit references; only Rap and the busker instrument stay accepted.
- Prompts: rap front crop is now the faceted `--sref` (single figure, so no lineup leak) on turnaround, A-pose and expressions with `--sw 250`;
  style text says "sharp angular mesh, visible flat facets, no smooth surfaces"; `--no smooth shading, pixar style, plastic, glossy, subsurface skin, realistic`.

## 2026-10-29 — Session 2d: fixing A-pose / expression prompts
- Problem: A-pose and expression prompts returned the same lineup image as the turnaround.
- Cause: every reference (REF-005 group shot, rap turnaround `--sref`, 4-view turnaround `--oref`) showed several figures in a row; Midjourney copied that layout.
- Fix: `tools/crop-fronts.py` crops a single front figure per turnaround (`char-<id>-front.jpg`), used as the only reference for follow-ups;
  A-pose and expressions no longer use the group-shot `--sref`. Each prompt now makes one image: A-pose = front + side, expressions = 6 close-ups (77 prompts total).
- Skill `add-reference` now covers character sheets: review, crop, update `have`, regenerate, push, republish.

## 2026-10-29 — Session 2c: first character images
- Added 5 turnarounds (busker, rap, metal, country, jazz) + rap map version as `docs/references/images/char-*.jpg`; reviewed in references README.
- prompt-kit.json: `look`/`identity` rewritten to match the accepted images; `have` lists what's in the repo; `note` holds review notes.
- Prompts reworked: sheet instruction first, short `identity` for follow-ups, rap turnaround as a second `--sref` to keep the faceted look,
  repo turnaround URLs filled in automatically as `--oref`, map sheet leads with chibi proportions + `--ow 25` + `--no tall, lanky`.
- V8 mode now uses an image prompt (turnaround URL first, `--iw`) instead of manual attaching.
- Learned: Midjourney drifts to smooth shading without a faceted image in `--sref`; turnarounds often swap outfit pieces between views, so always check consistency before accepting.

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
