# Bucket Battle — Architecture Plan

_Status: proposed, v0.1 (2026-10-29). Update in place; record big changes as ADRs._

## 1. Summary

Bucket Battle is a browser-first 3D game built in TypeScript, packaged later as
an iOS app. The player explores a grid of city blocks, encounters street
musicians, and battles them in call-and-response rhythm/melody matching rounds
that scale in length, tempo, and complexity with player level.

We build it in this order:

| Phase | Deliverable | Outcome |
|---|---|---|
| 0 | Repo, tooling, schemas, docs/skills system | Every later step has a home and a convention |
| 1 | **World & Map** | Walkable 3D city grid from data, third-person controller, minimap + full map view, musician spawn points |
| 2 | **Character & Model Studio** | Web tool to assemble, color, pose and export characters/props from modular parts; imports Blender GLBs |
| 3 | Battle prototype | Call-and-response loop, audio timing, scoring (separate design pass first) |
| 4 | Progression | XP, levels, musician roster & difficulty curve, save data |
| 5 | iOS | Capacitor wrapper, touch controls, haptics, App Store build |

## 2. Stack (recommended)

| Concern | Choice | Why |
|---|---|---|
| Language / build | **TypeScript + Vite**, **pnpm workspaces** | Fast HMR, one repo for game + studio + shared packages |
| 3D | **Three.js** via **React Three Fiber** + **drei** | Largest ecosystem, glTF-native, R3F makes the studio's UI and 3D share a component model |
| Physics / collision | **Rapier** (`@react-three/rapier`) | WASM, fast, works on iOS; mostly used for character capsule vs. buildings |
| State | **Zustand** | Tiny, works inside and outside React (game loop can read it) |
| UI (studio + HUD) | React + CSS variables (design tokens) | Tokens shared with `VISUAL_PRINCIPLES.md` |
| Audio (battle, later) | **Tone.js** on Web Audio | Sample-accurate scheduling, transport/BPM — essential for matching play |
| Schemas | **Zod** | Runtime-validated JSON for worlds, characters, musicians; types for free |
| Asset processing | **glTF-Transform** CLI (meshopt + KTX2) | Shrinks GLBs for mobile |
| Testing | Vitest (logic), Playwright (screenshots / visual review) | |
| iOS | **Capacitor** (WKWebView) | Keeps the web build as the single source; native plugins for haptics, storage, audio session |

Alternative considered: Babylon.js (more batteries-included, heavier); Unity/Godot
(better native perf, but loses the JS/web workflow and the in-browser studio).
Revisit only if WebGL perf on iOS fails the budget in §7. → see `decisions/ADR-0001-stack.md`.

## 3. Repository layout

```
bucketbattle/
├─ apps/
│  ├─ game/            # the playable game (Vite + R3F)
│  └─ studio/          # Character & Model Studio (Vite + R3F + React UI)
├─ packages/
│  ├─ schema/          # Zod schemas + TS types: WorldDef, TileDef, CharacterDef, MusicianDef, BattleConfig
│  ├─ engine/          # shared runtime: asset loader/cache, input, camera rigs, game loop hooks
│  ├─ world/           # grid model, tile kit, block generator, instancing, map projection
│  ├─ characters/      # rig spec, part slots, assembly, materials/palettes, animation retargeting
│  ├─ ui/              # design tokens + shared React components
│  └─ audio/           # (phase 3) Tone.js wrappers, beat clock, pattern player
├─ assets/
│  ├─ source/          # .blend files (Git LFS)
│  ├─ glb/             # exported, processed GLBs (Git LFS)
│  └─ data/            # worlds/*.json, characters/*.json, musicians/*.json
├─ tools/              # CLI scripts: glb optimize, schema validate, thumbnail render
├─ docs/               # architecture, principles, references, ADRs, progress log
└─ .claude/skills/     # Claude's repeatable workflows
```

## 4. Phase 1 — World & Map

### 4.1 Data model
The city is a **grid of blocks**, each block a grid of **tiles** (e.g. 4 m cells).

```ts
WorldDef   { id, name, blockSize: [w,d] (tiles), blocks: BlockDef[][], spawn, encounters: EncounterDef[] }
BlockDef   { type: 'buildings'|'park'|'plaza'|'lot', seed, tiles?: TileRef[][], landmark? }
TileRef    { tileId: 'tile.road.straight', rot: 0|90|180|270, variant? }
EncounterDef { id, musicianId, position:[x,z], facing, radius, levelRequired }
```

- Roads/sidewalks/intersections are derived from the block grid (streets run
  between blocks), so authors place **blocks**, not every curb.
- Blocks can be hand-authored or generated from a `seed` by `packages/world`
  (facade picks, props, color variation) — deterministic so maps are stable.
- Landmarks (subway entrance, bodega, basketball court) are named tiles used for
  navigation and as musician "stages".

### 4.2 Rendering
- **Modular kit**: road, sidewalk, curb corner, crosswalk, facade segments
  (ground floor + repeatable upper floors + roof cap), props (hydrant, bench,
  lamp, trash can, bus stop). Each a small GLB made in Blender to the kit grid.
- **InstancedMesh** per tile/prop type → draw calls scale with *kinds*, not *counts*.
- **Chunking**: the world is split by block; only blocks within N of the player
  are mounted, far ones swap to a low-detail box LOD, beyond that culled + fog.
- Lighting: one directional "sun" with a tight shadow frustum following the
  player, baked AO in textures, emissive windows/streetlights for evening mood.

### 4.3 Player & camera
- Kinematic character capsule (Rapier) — WASD/joystick, run, interact.
- Third-person follow camera with collision pull-in; optional fixed isometric
  mode (likely the better fit for phones — decide from references).
- Interact prompt when inside an `EncounterDef.radius`.

### 4.4 Map view
- **Minimap**: 2D canvas/SVG drawn from `WorldDef` (not a second 3D render) —
  cheap, crisp, stylable. Shows player arrow, discovered musicians, landmarks.
- **Full map**: same renderer full-screen with pan/zoom, fog-of-war for
  undiscovered blocks, tap a musician to set a waypoint.
- A shared `worldToMap()` projection in `packages/world` so 3D and map always agree.

### 4.5 World editor (lightweight, inside studio)
A top-down grid painter to place block types, landmarks and encounter points,
saving `assets/data/worlds/*.json`. Same renderer as the game for preview.

## 5. Phase 2 — Character & Model Studio

**Purpose:** produce game-ready characters and props *without* needing a full
Blender round-trip for every variation — and accept Blender work when it exists.

### 5.1 Character system
- **One base skeleton** (Mixamo-compatible humanoid naming) so every character
  shares animations (idle, walk, run, perform loops, win/lose emotes).
- **Slot-based parts**, each a skinned GLB bound to that skeleton:
  `head, hair, face, torso, legs, feet, hands, hat, accessory, instrument`.
- **Body params** via morph targets / bone scales: height, build, head size
  (stylized proportions are a principle decision — see VISUAL_PRINCIPLES).
- **Materials** from palette slots (`skin, primary, secondary, accent`) rather
  than unique textures — keeps the art coherent and the files tiny.

```ts
CharacterDef { id, name, baseRig: 'rig.humanoid.v1', body: {height, build, ...},
               parts: { [slot]: { partId, colors: {primary,...} } },
               animations: string[], instrument?: InstrumentId }
MusicianDef  { id, character: CharacterDef|ref, style: 'bucket'|'sax'|..., tier, bpmRange, patternSet, dialogue }
```

### 5.2 Studio features (MVP → later)
**MVP**
1. Viewport with orbit camera, turntable, ground grid, game-matching lighting.
2. Part browser per slot (thumbnails), swap live.
3. Color/palette editor; body sliders.
4. Animation preview (idle/walk/perform) on the assembled character.
5. Save/load `CharacterDef` JSON; **export merged GLB** (GLTFExporter) for the game.
6. **Import GLB** from Blender → validates scale/origin/skeleton, registers as a part or prop.

**Later**
- Prop builder from primitives (kitbash boxes/cylinders with bevel + palette) — the "asset generation" stopgap for things not yet modeled.
- Hookup point for AI mesh/texture generation services (import results through the same validator).
- Thumbnail/sprite-sheet render for UI & map icons.
- Musician editor: attach a CharacterDef to a MusicianDef with tier, instrument, patterns.

### 5.3 Blender ↔ Studio contract
- Export GLB, Y-up, apply transforms, 1 unit = 1 m, origin at feet / base center.
- Naming: `part.<slot>.<name>`, `tile.<family>.<name>`, `prop.<family>.<name>`.
- Skinned parts must use `rig.humanoid.v1` bone names exactly.
- Studio's import validator enforces this and reports problems (details in `.claude/skills/asset-pipeline`).

## 6. Hooks for future battle system (define now, build later)
- `EncounterDef → MusicianDef → BattleConfig { rounds, bpm, patternLength, inputSet, timingWindowMs }`
- Difficulty is a **function of (musician tier, player level)** producing a
  `BattleConfig` — tuned in data, not code.
- Scene transition contract: world pauses, battle scene mounts with both
  characters, returns `BattleResult { won, score, xp }`.
- Audio latency matters most here; iOS needs an audio-session plugin and a
  calibration screen. Prototype early in phase 3.

## 7. Performance budget (iPhone 12-class, WKWebView, 60 fps target / 30 fps floor)
| Metric | Budget |
|---|---|
| Draw calls on screen | ≤ 150 |
| Triangles on screen | ≤ 300k |
| Character | ≤ 15k tris, 1 material atlas, ≤ 60 bones |
| Textures | 1024² atlases, KTX2/Basis compressed |
| Shadow maps | 1 × 2048, following player |
| Initial download | ≤ 25 MB, then stream per district |
| JS heap | ≤ 300 MB |

## 8. iOS path
1. Keep everything web-standard (WebGL2, Web Audio, no desktop-only APIs).
2. Add Capacitor in phase 5: `apps/game` builds into `ios/` WKWebView project.
3. Native plugins: Haptics, Preferences/Filesystem (saves), Audio session config, Status bar.
4. Touch controls designed from phase 1 (virtual joystick + tap-to-move) so we
   don't retrofit.
5. Escape hatch: if WebGL perf fails, the data-first design means the world /
   character JSON + GLBs can be loaded by a native engine later.

## 9. Open questions (answer with references)
- Art style: toon-shaded low-poly vs. chunky stylized (e.g. "Jet Set Radio"-ish) vs. something else?
- Camera: third-person over-the-shoulder vs. isometric vs. switchable?
- City setting: one real-inspired neighborhood (NYC? Philly?) or a fictional mash-up?
- Day/night cycle, or a fixed golden-hour/evening mood?
- Online features ever (leaderboards, shared characters)? Affects whether we add a backend.
