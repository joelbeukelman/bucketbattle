# ADR-0001: Web stack and iOS path

- Status: Proposed
- Date: 2026-10-29

## Context
We need a 3D walkable city, an in-browser character/model studio, precise audio
timing for future battles, and an eventual iOS app. The user prefers a JS environment.

## Decision
TypeScript + Vite in a pnpm monorepo; Three.js through React Three Fiber (+ drei);
Rapier for collision; Zustand for state; Zod for data schemas; Tone.js for audio
(phase 3); glTF/GLB as the only runtime 3D format; Capacitor to ship iOS.

## Options considered
| Option | Pros | Cons |
|---|---|---|
| **Three.js + R3F** (chosen) | Huge ecosystem, glTF-native, React for studio UI, light | Must assemble our own engine pieces |
| Babylon.js | Batteries included (physics, inspector, GUI) | Heavier bundle, less React synergy |
| PlayCanvas | Great mobile perf, editor | Editor is cloud-hosted; less code-first |
| Unity / Godot | Native perf, mature tooling | Leaves JS; studio can't be a web tool sharing code |

## Consequences
- Easier: one codebase for game + studio; quick iteration; web demos shareable by link.
- Harder: we own performance discipline (instancing, LOD, texture compression) and
  iOS audio latency. Mitigated by the budget in ARCHITECTURE §7 and an early audio spike.
- Revisit if: a phase-1 gray-box city misses 30 fps on an iPhone 12 in WKWebView.
