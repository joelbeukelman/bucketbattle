import * as THREE from 'three';
import type { CharacterDef } from '@bb/schema';
import type { Dims, Rig } from '../rig';
import { add, box, cyl, dome, lump, mat, rng, shade } from '../geometry';

/** Eye layout shared by the face, lids and sunglasses. */
export function eyeLayout(d: Dims) {
  const r = d.headH * 0.115;
  return { r, y: d.headH * 0.47, x: d.headW * 0.21, z: d.headD * 0.41 };
}

/**
 * Cover a range of the arm with a garment segment. 0 = shoulder, 1 = wrist; the range is
 * split across the upper-arm and forearm pivots so it bends with the pose.
 */
export function armCover(rig: Rig, d: Dims, side: 'Left' | 'Right', from: number, to: number, r0: number, r1: number, material: THREE.Material) {
  const total = d.upperArm + d.foreArm;
  const segs: [THREE.Group, number, number][] = [
    [rig[`${side}Arm`], 0, d.upperArm],
    [rig[`${side}ForeArm`], d.upperArm, total],
  ];
  coverSegments(segs, from * total, to * total, r0, r1, material);
}

/** Same for legs: 0 = hip, 1 = ankle. */
export function legCover(rig: Rig, d: Dims, side: 'Left' | 'Right', from: number, to: number, r0: number, r1: number, material: THREE.Material) {
  const total = d.thigh + d.shin;
  const segs: [THREE.Group, number, number][] = [
    [rig[`${side}UpLeg`], 0, d.thigh],
    [rig[`${side}Leg`], d.thigh, total],
  ];
  coverSegments(segs, from * total, to * total, r0, r1, material);
}

function coverSegments(segs: [THREE.Group, number, number][], a: number, b: number, r0: number, r1: number, material: THREE.Material) {
  const lerp = (x: number) => r0 + (r1 - r0) * ((x - a) / Math.max(1e-6, b - a));
  for (const [bone, s0, s1] of segs) {
    const lo = Math.max(a, s0);
    const hi = Math.min(b, s1);
    if (hi <= lo) continue;
    add(bone, cyl(lerp(lo), lerp(hi), hi - lo, { anchor: 'top', segments: 7 }), material, [0, -(lo - s0), 0]);
  }
}

/** Skin: limbs, hands, neck. Garments are layered on top by other builders. */
export function buildBody(def: CharacterDef, d: Dims, rig: Rig) {
  const skin = mat(def.skin);
  for (const side of ['Left', 'Right'] as const) {
    add(rig[`${side}Arm`], cyl(d.armR, d.armR * 0.9, d.upperArm, { anchor: 'top', segments: 6 }), skin);
    add(rig[`${side}Arm`], lump(d.armR * 1.2, d.armR * 1.2, d.armR * 1.2, { detail: 0 }), skin);
    add(rig[`${side}ForeArm`], cyl(d.armR * 0.9, d.armR * 0.72, d.foreArm, { anchor: 'top', segments: 6 }), skin);
    // Hand: palm + thumb, slightly cupped so silhouettes read at small sizes.
    add(rig[`${side}Hand`], box(d.armR * 2.1, d.hand * 0.7, d.armR * 1.3, { anchor: 'top', taperX: 1.15 }), skin);
    add(rig[`${side}Hand`], box(d.armR * 1.9, d.hand * 0.45, d.armR * 1.1, { anchor: 'top' }), skin, [0, -d.hand * 0.62, d.armR * 0.15], [0.25, 0, 0]);
    add(rig[`${side}Hand`], box(d.armR * 0.7, d.hand * 0.45, d.armR * 0.7, { anchor: 'top' }), skin, [(side === 'Left' ? -1 : 1) * d.armR * 0.9, -d.hand * 0.15, d.armR * 0.6], [0.4, 0, 0]);
    add(rig[`${side}UpLeg`], cyl(d.legR * 1.1, d.legR, d.thigh, { anchor: 'top', segments: 6 }), skin);
    add(rig[`${side}Leg`], cyl(d.legR, d.legR * 0.8, d.shin, { anchor: 'top', segments: 6 }), skin);
    add(rig[`${side}Leg`], lump(d.legR, d.legR, d.legR, { detail: 0 }), skin);
  }
  add(rig.Neck, cyl(d.armR * 1.15, d.armR * 1.3, d.neckLen + d.headH * 0.2, { anchor: 'bottom', segments: 6 }), skin, [0, -d.armR, 0]);
}

/** Big faceted head with oversized ears, heavy-lidded eyes and a tiny mouth (C5). */
export function buildHead(def: CharacterDef, d: Dims, rig: Rig) {
  const head = rig.Head;
  const skin = mat(def.skin);
  const { headH: h, headW: w, headD: dd } = d;
  const skull = lump(w / 2, h / 2, dd / 2, {
    jitter: 0.07,
    seed: def.id.length,
    shape: (v) => {
      // Narrow toward the chin and flatten the face a touch.
      if (v.y < 0) {
        const k = 1 + (v.y / (h / 2)) * 0.32;
        v.x *= k;
        v.z *= 0.92 + 0.08 * k;
      }
      if (v.z > dd * 0.3) v.z = dd * 0.3 + (v.z - dd * 0.3) * 0.6;
    },
  });
  add(head, skull, skin, [0, h * 0.5, 0], [0, 0, 0], 'skull');

  const e = d.earScale;
  for (const sx of [1, -1]) {
    add(head, lump(h * 0.12 * e, h * 0.15 * e, h * 0.045, { detail: 0, jitter: 0.1 }), skin, [sx * (w * 0.5 + h * 0.07 * e), h * 0.44, -dd * 0.05], [0, sx * 0.35, 0]);
    add(head, lump(h * 0.07 * e, h * 0.09 * e, h * 0.02, { detail: 0 }), mat(shade(def.skin, -0.08)), [sx * (w * 0.5 + h * 0.075 * e), h * 0.44, -dd * 0.02], [0, sx * 0.35, 0]);
  }

  const eye = eyeLayout(d);
  const lidH = eye.r * 2.3 * def.face.lids;
  for (const sx of [1, -1]) {
    const ex = sx * eye.x;
    add(head, lump(eye.r * 0.95, eye.r * 1.1, eye.r * 0.45, { detail: 1 }), mat('#f4f1ea', 'gloss'), [ex, eye.y, eye.z]);
    add(head, lump(eye.r * 0.58, eye.r * 0.62, eye.r * 0.3, { detail: 1 }), mat('#141312', 'gloss'), [ex, eye.y - eye.r * 0.12, eye.z + eye.r * 0.28]);
    if (lidH > 0.0005) {
      add(head, box(eye.r * 2.25, lidH, eye.r * 1.15), skin, [ex, eye.y + eye.r * 1.12 - lidH / 2, eye.z + eye.r * 0.08]);
      add(head, box(eye.r * 2.25, eye.r * 0.12, eye.r * 1.2), mat('#2a1d18'), [ex, eye.y + eye.r * 1.12 - lidH, eye.z + eye.r * 0.1]);
    }
    add(head, box(eye.r * 2.1, eye.r * 0.4, eye.r * 0.5), mat(def.face.brows), [ex, eye.y + eye.r * 1.5, eye.z + eye.r * 0.05], [0, 0, sx * -0.07]);
  }
  add(head, lump(h * 0.045, h * 0.05, h * 0.055, { detail: 0 }), mat(shade(def.skin, -0.06)), [0, h * 0.32, dd * 0.42]);
  add(head, box(h * 0.12, h * 0.014, h * 0.02), mat('#3a2420'), [0, h * 0.2, dd * 0.37]);
  if (def.face.beard) {
    const hair = mat(def.hair.color);
    add(head, lump(h * 0.1, h * 0.08, h * 0.06, { detail: 0 }), hair, [0, h * 0.08, dd * 0.28]);
    for (const sx of [1, -1]) add(head, box(h * 0.04, h * 0.25, h * 0.08), hair, [sx * w * 0.32, h * 0.2, dd * 0.18], [0, 0, sx * 0.35]);
  }
}

/** Hair styles. Hats sit on top; hair shells are kept under the hat line. */
export function buildHair(def: CharacterDef, d: Dims, rig: Rig) {
  const { kind, color } = def.hair;
  if (kind === 'none') return;
  const head = rig.Head;
  const m = mat(color, 'cloth');
  const { headH: h, headW: w, headD: dd } = d;
  const r = rng(def.id + 'hair');
  // Cap shell over the top of the skull, tilted back to leave a forehead.
  add(head, dome(w * 0.535, h * 0.56, dd * 0.55, 0.5, 9), m, [0, h * 0.5, -dd * 0.02], [-0.22, 0, 0]);

  if (kind === 'twists') {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI - Math.PI / 2 + (r() - 0.5) * 0.3;
      add(head, box(h * 0.05, h * 0.09, h * 0.05), m, [Math.sin(a) * w * 0.38, h * (0.86 + r() * 0.08), Math.cos(a) * dd * 0.32], [r() - 0.5, 0, r() - 0.5]);
    }
  } else if (kind === 'long-straight') {
    add(head, box(w * 1.06, h * 0.95 + d.torsoLen * 0.75, dd * 0.32, { anchor: 'top' }), m, [0, h * 0.85, -dd * 0.33]);
    for (const sx of [1, -1]) add(head, box(w * 0.13, h * 0.75 + d.torsoLen * 0.7, dd * 0.6, { anchor: 'top' }), m, [sx * w * 0.44, h * 0.78, -dd * 0.06]);
  } else if (kind === 'dreads-up') {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const tilt = 0.5 + r() * 0.5;
      add(head, cyl(h * 0.05, h * 0.058, h * (0.36 + r() * 0.14), { anchor: 'bottom', segments: 5 }), m, [Math.sin(a) * w * 0.12, h * 1.0, Math.cos(a) * dd * 0.1], [Math.cos(a) * tilt, 0, -Math.sin(a) * tilt]);
    }
    add(head, cyl(h * 0.12, h * 0.13, h * 0.08, { segments: 7 }), mat(shade(color, 0.12)), [0, h * 1.0, 0]);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 1.6 - Math.PI * 0.8 + Math.PI;
      const front = Math.cos(a) > 0.2;
      add(head, cyl(h * 0.045, h * 0.04, h * (front ? 0.75 : 1.05), { anchor: 'top', segments: 5 }), m, [Math.sin(a) * w * 0.52, h * 0.68, Math.cos(a) * dd * 0.5], [Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12]);
    }
  } else if (kind === 'braids') {
    add(head, box(w * 1.0, h * 0.8 + d.torsoLen * 0.9, dd * 0.28, { anchor: 'top' }), m, [0, h * 0.82, -dd * 0.34]);
    for (const sx of [1, -1]) {
      for (let i = 0; i < 8; i++) {
        add(head, new THREE.OctahedronGeometry(h * 0.045, 0), m, [sx * w * 0.47, h * 0.45 - i * h * 0.085, dd * 0.02 + i * h * 0.004], [0, i * 0.4, 0]);
      }
      add(head, box(h * 0.05, h * 0.07, h * 0.05), mat('#c0392b'), [sx * w * 0.47, h * 0.45 - 8 * h * 0.085, dd * 0.04]);
    }
  }
}
