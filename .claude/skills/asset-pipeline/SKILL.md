---
name: asset-pipeline
description: Blender-to-game asset rules for Bucket Battle — export settings, naming, scale/origin, compression with glTF-Transform, Git LFS. Use when the user brings in a .blend/.glb/.fbx, asks how to export from Blender, or when optimizing/validating 3D assets.
---

# Asset pipeline

## Blender export checklist (tell the user exactly this)
- Units: metric, scale 1.0 (1 unit = 1 m). Apply all transforms (Ctrl+A).
- Origin: feet (characters) / base center (tiles, props). Facing −Y in Blender → +Z in game.
- Export **glTF 2.0 Binary (.glb)**, +Y Up, selected objects only, apply modifiers,
  include skin + animations for characters; no cameras/lights.
- Name the object/file by asset ID: `part.torso.hoodie.glb`, `tile.road.corner.glb`.
- Source `.blend` → `assets/source/`, exported `.glb` → `assets/glb/raw/`.

## Process
```bash
pnpm tools glb:optimize assets/glb/raw/<file>.glb   # meshopt + KTX2 via glTF-Transform → assets/glb/
pnpm tools glb:validate assets/glb/<file>.glb       # budget + naming + rig check
```
(Scripts live in `tools/`; create them the first time this skill runs and they don't exist.)

## Storage
`.blend`, `.glb`, `.png`, `.ktx2` tracked with Git LFS (`.gitattributes`).
