# Bucket Battle

A 3D street-music battle game. Walk a city block grid, find street musicians,
battle them in call-and-response rounds. Start with `CLAUDE.md` and `docs/`.

## Run it
```bash
pnpm install
pnpm dev          # http://localhost:5173 (also reachable from a phone on the same Wi-Fi)
```

**Controls:** WASD / arrows to walk (Shift to run), click or tap to walk to a spot,
scroll or pinch to zoom, **A** / E / Space to interact, **B** / M to open the map.

## Other commands
```bash
pnpm test             # world generation, schema, collision, map projection
pnpm typecheck
pnpm build
pnpm shots            # with `pnpm dev` running: screenshots → docs/progress/<date>/
```

## Layout
| Path | What |
|---|---|
| `apps/game` | The game (Vite + React Three Fiber) |
| `packages/schema` | Zod schemas: `WorldDef`, blocks, lots, encounters |
| `packages/world` | World layout, seeded block generator, collision, map projection |
| `assets/data/worlds` | World data: `level-01.json` is the bucket-corner level |
| `tools` | Screenshot / review scripts |
| `docs` | Architecture, visual principles, references, decisions, progress |
