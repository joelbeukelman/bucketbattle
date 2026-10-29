---
name: log-progress
description: Record what was done in a Bucket Battle session — update docs/PROGRESS.md, write ADRs for decisions, and fold new conventions back into CLAUDE.md or skills. Use at the end of any meaningful chunk of work, before committing, or when the user says "log this", "wrap up", or "document progress".
---

# Log progress

1. **Gather** — `git status` / `git diff --stat` and recall the session: what was built,
   changed, decided, learned, or left broken.
2. **Write the entry** at the top of the dated section in `docs/PROGRESS.md`
   (below "Open questions", newest first):
   ```
   ## YYYY-MM-DD — Session N: <short theme>
   - Built/changed: … (file paths)
   - Decisions: … (link ADR if one was written)
   - Learned / gotchas: …
   - Screenshots: docs/progress/YYYY-MM-DD-*.png (if visual-review ran)
   ```
3. **Refresh "Next up"** — max 5 items, ordered, each small enough for one session.
4. **Decisions** — any choice between real alternatives (library, data shape,
   art direction, camera) gets `docs/decisions/ADR-NNNN-<slug>.md` using ADR-0001's format.
5. **Promote patterns** — if the same instruction was given twice, or a mistake
   was corrected, encode it:
   - project-wide rule → `CLAUDE.md` "Non-negotiables" or "Conventions"
   - visual rule → `docs/VISUAL_PRINCIPLES.md` (+ change log line)
   - workflow → the relevant `.claude/skills/*/SKILL.md` (or a new skill)
6. Keep `CLAUDE.md` under ~80 lines; move detail into docs.
7. Tell the user in 3–5 lines what was logged; offer to commit.
