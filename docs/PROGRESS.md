# Progress Log

Newest first. Each entry: what changed, decisions made, open questions, next up.
Maintained by the `log-progress` skill.

## Next up
1. Collect references from the user → `add-reference` → firm up VISUAL_PRINCIPLES (art style, camera).
2. Phase 0: scaffold pnpm workspace (`apps/game`, `apps/studio`, `packages/schema|engine|world|characters|ui`), Vite + R3F, lint/test.
3. Phase 1 spike: grid of gray-box blocks from a `WorldDef` JSON, walking capsule, follow camera, 2D minimap.

## Open questions
See `docs/ARCHITECTURE.md` §9.

---

## 2026-10-29 — Session 1: plan & memory system
- Repo was empty; added `CLAUDE.md`, architecture plan, provisional visual principles,
  references index, ADR-0001 (stack), and `.claude/skills/` workflows.
- Decision: TypeScript + Vite + Three.js/R3F + Rapier + Zustand + Zod; Capacitor for iOS (ADR-0001, proposed).
- Decision: data-first — worlds/characters/musicians are schema-validated JSON shared by game and studio.
- No code yet.
