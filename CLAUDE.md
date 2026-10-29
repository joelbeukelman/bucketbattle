# Bucket Battle — Working Memory

> Read this first every session. Keep it short; details live in `docs/`.

## What we're building
A 3D game where the player walks a city block grid, finds street musicians
(bucket drummers, sax players, beatboxers…), and battles them in back-and-forth
**call-and-response matching** rounds that get longer, faster and more complex as
the player levels up.

**Current phase: 0–2 — foundations.** World + map view, and the Character & Model
Studio (a stopgap between Blender and asset generation). Battle mechanics are
*not* being built yet — only the interfaces they will plug into.

## Where things are
| Need | File |
|---|---|
| System architecture, stack, module boundaries | `docs/ARCHITECTURE.md` |
| Look & feel rules (the "visual constitution") | `docs/VISUAL_PRINCIPLES.md` |
| Reference links/screenshots + what we took from each | `docs/references/README.md` |
| Why we chose X over Y | `docs/decisions/ADR-*.md` |
| Character roster & design briefs | `docs/characters/ROSTER.md` |
| What happened, session by session; what's next | `docs/PROGRESS.md` |
| Repeatable workflows | `.claude/skills/*/SKILL.md` |

## Non-negotiables
1. **Data-first.** Worlds, characters and musicians are JSON/TS data validated by
   schemas in `packages/schema`. Renderers read data; tools write data.
2. **One unit = one metre, Y-up, character origin at the feet.** Everywhere.
3. **Mobile budget is the real budget.** Design for an iPhone 12 in a WKWebView
   (see perf budget in ARCHITECTURE.md). Desktop is the easy case.
4. **The game and the studio share code**, never copy it. If the studio needs
   something the game also needs, it goes in a `packages/*` module.
5. **Visual decisions trace back to a reference or a principle.** If a new look
   isn't covered by `VISUAL_PRINCIPLES.md`, propose an addition — don't improvise silently.

## Session ritual
- **Start:** read `docs/PROGRESS.md` → "Next up" and any open questions.
- **When the user shares a link or screenshot:** run the `add-reference` skill.
- **After visual work:** run the `visual-review` skill (screenshot + check against principles).
- **End of a working chunk:** run the `log-progress` skill. Record decisions as ADRs.

## Conventions
- TypeScript strict, ES modules, pnpm workspaces.
- File names `kebab-case.ts`; React components `PascalCase.tsx`.
- Asset IDs: `<kind>.<family>.<name>` e.g. `tile.road.straight`, `part.torso.hoodie`.
- Commit messages: imperative, scoped — `world: add corner tile`, `studio: color picker for parts`.
