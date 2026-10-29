---
name: add-reference
description: Ingest an inspiration link or screenshot for Bucket Battle into docs/references and turn it into concrete visual/structural principles. Use whenever the user shares a URL, image, video, or game/art example "for reference", "inspiration", or "this is the vibe".
---

# Add a reference

1. **Capture**
   - Image: save to `docs/references/images/ref-NNN-<short-name>.<ext>` (next free NNN).
   - Link: fetch it if reachable; note title. If it can't be fetched, record the
     URL and ask the user for a screenshot or a sentence on what they like.
2. **Look closely and describe objectively** (what's actually there):
   palette & value range, lighting, proportions, poly/texture style, camera angle &
   FOV, UI layout, density of props, how characters stand out.
3. **Ask, if unclear, which part they mean** — "the lighting or the character style?"
   One short question, not a survey.
4. **Write the entry** in `docs/references/README.md` (format at top of that file),
   including **Take** and **Avoid**.
5. **Update principles** in `docs/VISUAL_PRINCIPLES.md`:
   - confirm a **[provisional]** rule (remove the tag), revise it, or add a new
     numbered rule; cite `REF-NNN`; add a change-log line.
   - When references conflict, list the conflict under ARCHITECTURE §9 and ask.
6. Summarize back to the user: what you extracted and which principles changed.
