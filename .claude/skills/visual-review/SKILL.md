---
name: visual-review
description: Screenshot the running Bucket Battle game or studio and check it against docs/VISUAL_PRINCIPLES.md and the performance budget. Use after any change to rendering, models, lighting, camera, materials, UI, or the map view, and before calling visual work done.
---

# Visual review

1. Start the app in the background: `pnpm dev` (game on :5173).
2. Capture: `pnpm shots`, which runs `tools/screenshot.ts` and writes spawn / busker / occluded /
   overview / map at desktop 1440×900 and phone 390×844 to `docs/progress/<date>/`.
   Add a scene to that script when you change something it doesn't cover. It uses the
   dev-only `window.__bb` hook (`teleport`, `encounters`, `spawn`) from `apps/game/src/scene/Player.tsx`.
   Then **look at every image** with the Read tool before judging.
3. Run the checks, citing principle IDs:
   - **W1** grayscale copy still reads (convert with sharp/canvas).
   - **W2 / C1** squint/silhouette: blurred + black-fill pass — musicians findable?
   - **U2** controls in bottom third, ≥ 44 pt.
   - Compare against relevant `REF-NNN` images side by side.
4. Perf: `pnpm shots` prints `window.__bbStats` (draw calls, triangles). Compare to
   ARCHITECTURE §7 and flag anything over budget. Ignore its fps: headless Chromium renders in
   software (SwiftShader). Real fps needs a device.
5. Report: pass/fail per principle, screenshots, and concrete fixes. Don't
   silently "fix" a principle violation by changing the principle — ask.
