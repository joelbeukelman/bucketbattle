---
name: visual-review
description: Screenshot the running Bucket Battle game or studio and check it against docs/VISUAL_PRINCIPLES.md and the performance budget. Use after any change to rendering, models, lighting, camera, materials, UI, or the map view, and before calling visual work done.
---

# Visual review

1. Start the app (`pnpm --filter game dev` or `--filter studio dev`).
2. Capture with Playwright (Chromium is preinstalled; `require('playwright')`):
   - desktop 1440×900 and phone 390×844 viewports
   - the scenes affected (spawn point, an intersection, a musician, map view, studio turntable)
   - save to `docs/progress/YYYY-MM-DD-<scene>-<viewport>.png`
3. Run the checks, citing principle IDs:
   - **W1** grayscale copy still reads (convert with sharp/canvas).
   - **W2 / C1** squint/silhouette: blurred + black-fill pass — musicians findable?
   - **U2** controls in bottom third, ≥ 44 pt.
   - Compare against relevant `REF-NNN` images side by side.
4. Perf: read `renderer.info` (draw calls, triangles) via an exposed
   `window.__bbStats`; compare to ARCHITECTURE §7. Flag anything over budget.
5. Report: pass/fail per principle, screenshots, and concrete fixes. Don't
   silently "fix" a principle violation by changing the principle — ask.
