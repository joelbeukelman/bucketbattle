import * as THREE from 'three';
import type { CharacterDef } from '@bb/schema';
import type { Dims, Rig } from '../rig';
import { add, box, cyl, dome, lump, mat, plaidMaterial, rng, shade } from '../geometry';
import { armCover, legCover } from './body';

const SIDES = ['Left', 'Right'] as const;
/** World Y → local Y inside the chest pivot (Spine2). */
const chestLocal = (d: Dims, y: number) => y - (d.hipY + d.torsoLen * 0.6);

export function buildHat(def: CharacterDef, d: Dims, rig: Rig) {
  const { kind, color, color2 } = def.hat;
  if (kind === 'none') return;
  const head = rig.Head;
  const m = mat(color, 'cloth');
  const { headH: h, headW: w, headD: dd, H } = d;
  const zs = dd / w;

  if (kind === 'snapback-back') {
    add(head, dome(w * 0.57, h * 0.42, dd * 0.6, 0.5, 9), m, [0, h * 0.62, -dd * 0.02]);
    add(head, box(w * 0.62, H * 0.009, dd * 0.5), m, [0, h * 0.66, -dd * 0.68], [-0.18, 0, 0]);
    add(head, box(w * 0.3, h * 0.08, H * 0.01), mat(shade(color, -0.06)), [0, h * 0.72, -dd * 0.55]);
    add(head, cyl(h * 0.03, h * 0.03, h * 0.02, { segments: 6 }), m, [0, h * 1.04, 0]);
  } else if (kind === 'beanie') {
    const body = cyl(w * 0.555, w * 0.565, h * 0.3, { anchor: 'bottom', segments: 9 });
    body.scale(1, 1, zs * 1.05);
    add(head, body, m, [0, h * 0.62, 0]);
    add(head, dome(w * 0.555, h * 0.24, dd * 0.58, 0.5, 9), m, [0, h * 0.92, 0]);
    const cuff = cyl(w * 0.585, w * 0.585, h * 0.14, { anchor: 'bottom', segments: 9 });
    cuff.scale(1, 1, zs * 1.05);
    add(head, cuff, mat(shade(color, -0.04), 'cloth'), [0, h * 0.6, 0]);
    if (color2) add(head, box(w * 0.22, h * 0.07, H * 0.006), mat(color2), [0, h * 0.67, dd * 0.6]);
  } else if (kind === 'cowboy') {
    const brim = cyl(w * 1.18, w * 1.2, H * 0.01, { segments: 12 });
    brim.scale(1, 1, 0.82);
    add(head, brim, m, [0, h * 0.8, 0]);
    add(head, box(w * 0.74, h * 0.44, dd * 0.74, { anchor: 'bottom', taperX: 0.82, taperZ: 0.72 }), m, [0, h * 0.8, 0]);
    add(head, box(w * 0.3, h * 0.08, dd * 0.55, { anchor: 'bottom' }), mat(shade(color, -0.07)), [0, h * 1.2, 0]);
    add(head, box(w * 0.76, h * 0.06, dd * 0.76, { anchor: 'bottom' }), mat(color2 ?? shade(color, -0.25)), [0, h * 0.82, 0]);
  } else if (kind === 'shako') {
    const body = cyl(w * 0.58, w * 0.5, h * 1.0, { anchor: 'bottom', segments: 10 });
    body.scale(1, 1, zs * 1.05);
    add(head, body, m, [0, h * 0.62, 0]);
    for (const y of [0.64, 1.45]) {
      const band = cyl(w * (0.51 + (y - 0.64) * 0.09), w * (0.51 + (y - 0.64) * 0.09), h * 0.07, { anchor: 'bottom', segments: 10 });
      band.scale(1.02, 1, zs * 1.08);
      add(head, band, mat(color2 ?? '#c9a227', 'metal'), [0, h * y, 0]);
    }
    add(head, box(w * 0.7, H * 0.01, dd * 0.38), mat('#111111', 'gloss'), [0, h * 0.64, dd * 0.55], [0.35, 0, 0]);
    add(head, cyl(h * 0.05, h * 0.03, h * 0.3, { anchor: 'bottom', segments: 5 }), mat(color2 ?? '#c9a227'), [0, h * 1.6, dd * 0.38]);
  } else if (kind === 'headband') {
    const band = cyl(w * 0.54, w * 0.54, h * 0.12, { segments: 10 });
    band.scale(1, 1, zs * 1.06);
    add(head, band, m, [0, h * 0.72, 0]);
  }
}

/** Torso shell on the chest pivot spanning hips (minus drop) to shoulders. */
function torso(d: Dims, rig: Rig, material: THREE.Material, o: { w: number; dpt: number; drop: number; taper?: number; top?: number }) {
  const bottom = d.hipY - d.H * o.drop;
  const top = d.shoulderY + d.H * (o.top ?? 0.012);
  const h = top - bottom;
  return add(rig.Spine2, box(d.torsoW * o.w, h, d.torsoD * o.dpt, { anchor: 'bottom', taperX: o.taper ?? 0.9, taperZ: 0.92 }), material, [0, chestLocal(d, bottom), 0]);
}

/** A vertical strip down the chest front: the layer underneath an open shirt or jacket. */
function openFront(d: Dims, rig: Rig, color: string, o: { dpt: number; drop: number; width?: number }) {
  const bottom = d.hipY - d.H * o.drop;
  const h = d.shoulderY - bottom;
  add(rig.Spine2, box(d.torsoW * (o.width ?? 0.36), h, d.H * 0.01, { anchor: 'bottom' }), mat(color, 'cloth'), [0, chestLocal(d, bottom), (d.torsoD * o.dpt) / 2]);
}

function hoodAtNeck(d: Dims, rig: Rig, material: THREE.Material) {
  add(rig.Spine2, lump(d.headW * 0.4, d.headH * 0.16, d.headD * 0.32, { detail: 1, jitter: 0.1 }), material, [0, chestLocal(d, d.shoulderY) + d.headH * 0.05, -d.torsoD * 0.42]);
  add(rig.Spine2, new THREE.TorusGeometry(d.armR * 2.6, d.armR * 0.9, 4, 8), material, [0, chestLocal(d, d.shoulderY) + d.armR * 0.6, 0], [Math.PI / 2, 0, 0]);
}

function shoulderCaps(_d: Dims, rig: Rig, material: THREE.Material, r: number) {
  for (const side of SIDES) add(rig[`${side}Arm`], lump(r, r, r, { detail: 0 }), material);
}

export function buildTop(def: CharacterDef, d: Dims, rig: Rig) {
  const t = def.top;
  const m = mat(t.color, 'cloth');
  const c2 = t.color2 ?? shade(t.color, -0.1);
  const R = d.armR;
  const rand = rng(def.id + 'top');

  if (t.kind === 'hoodie') {
    torso(d, rig, m, { w: 1.3, dpt: 1.5, drop: 0.055, taper: 0.9 });
    add(rig.Spine2, box(d.torsoW * 0.75, d.torsoLen * 0.28, d.H * 0.012), mat(shade(t.color, -0.025), 'cloth'), [0, chestLocal(d, d.hipY + d.torsoLen * 0.05), d.torsoD * 0.76]);
    hoodAtNeck(d, rig, m);
    shoulderCaps(d, rig, m, R * 2.6);
    for (const side of SIDES) {
      armCover(rig, d, side, 0, 0.6, R * 2.5, R * 2.4, m);
      armCover(rig, d, side, 0.6, 0.97, R * 2.45, R * 2.1, mat(c2, 'cloth'));
      // Cuff pattern blotches (the rap kid's navy-on-orange print).
      if (t.color3) for (let i = 0; i < 5; i++) {
        const a = rand() * Math.PI * 2;
        add(rig[`${side}ForeArm`], box(R * 1.1, R * 1.4, R * 0.5), mat(t.color3), [Math.sin(a) * R * 2.2, -(d.foreArm * (0.15 + rand() * 0.6)), Math.cos(a) * R * 2.2], [0, a, 0]);
      }
    }
  } else if (t.kind === 'tee') {
    torso(d, rig, m, { w: 1.18, dpt: 1.32, drop: t.color3 ? 0.09 : 0.035, taper: 0.95 });
    shoulderCaps(d, rig, m, R * 2.2);
    for (const side of SIDES) armCover(rig, d, side, 0, 0.36, R * 2.3, R * 2.1, m);
    if (t.color2) {
      const yMid = chestLocal(d, d.hipY + d.torsoLen * 0.5);
      add(rig.Spine2, box(d.torsoW * 0.66, d.torsoLen * 0.45, d.H * 0.006), mat(t.color2), [0, yMid, d.torsoD * 0.67]);
      if (t.color3) {
        add(rig.Spine2, box(d.torsoW * 0.5, d.torsoLen * 0.16, d.H * 0.008), mat(t.color3), [d.torsoW * 0.04, yMid + d.torsoLen * 0.1, d.torsoD * 0.675]);
        add(rig.Spine2, box(d.torsoW * 0.18, d.torsoLen * 0.13, d.H * 0.008), mat('#e8d33a'), [-d.torsoW * 0.12, yMid - d.torsoLen * 0.08, d.torsoD * 0.675]);
      }
    }
  } else if (t.kind === 'flannel-open') {
    const plaid = plaidMaterial(t.color, c2);
    torso(d, rig, plaid, { w: 1.22, dpt: 1.35, drop: 0.05, taper: 0.92 });
    openFront(d, rig, t.under ?? '#2ec4b6', { dpt: 1.36, drop: 0.035 });
    shoulderCaps(d, rig, plaid, R * 2.3);
    for (const side of SIDES) {
      armCover(rig, d, side, 0, 0.9, R * 2.4, R * 2.3, plaid);
      armCover(rig, d, side, 0.82, 0.92, R * 2.5, R * 2.5, mat(shade(c2, -0.05), 'cloth'));
    }
    for (const sx of [1, -1]) add(rig.Spine2, box(d.torsoW * 0.2, d.torsoLen * 0.12, d.H * 0.012), plaid, [sx * d.torsoW * 0.16, chestLocal(d, d.shoulderY), d.torsoD * 0.62], [0.2, 0, sx * 0.5]);
  } else if (t.kind === 'bomber') {
    torso(d, rig, m, { w: 1.38, dpt: 1.6, drop: 0.035, taper: 0.88 });
    openFront(d, rig, t.under ?? '#1f4d3a', { dpt: 1.61, drop: 0.035, width: 0.3 });
    const hemY = chestLocal(d, d.hipY - d.H * 0.035);
    add(rig.Spine2, box(d.torsoW * 1.4, d.H * 0.028, d.torsoD * 1.62, { anchor: 'bottom' }), mat(c2, 'cloth'), [0, hemY, 0]);
    if (t.under) hoodAtNeck(d, rig, mat(t.under, 'cloth'));
    shoulderCaps(d, rig, m, R * 2.8);
    for (const side of SIDES) {
      armCover(rig, d, side, 0, 0.9, R * 2.8, R * 2.5, m);
      armCover(rig, d, side, 0.9, 1.0, R * 2.1, R * 2.0, mat(c2, 'cloth'));
      if (t.color3) add(rig[`${side}Arm`], box(R * 1.6, d.upperArm * 0.35, R * 0.5), mat(t.color3), [(side === 'Left' ? 1 : -1) * R * 2.6, -d.upperArm * 0.4, 0], [0, Math.PI / 2, 0]);
    }
  } else if (t.kind === 'colorblock-jacket') {
    torso(d, rig, m, { w: 1.3, dpt: 1.5, drop: 0.04, taper: 0.9 });
    openFront(d, rig, t.under ?? '#c2357a', { dpt: 1.51, drop: 0.03, width: 0.34 });
    hoodAtNeck(d, rig, m);
    const sleeves = mat(c2, 'cloth');
    shoulderCaps(d, rig, sleeves, R * 2.6);
    for (const side of SIDES) {
      armCover(rig, d, side, 0, 0.88, R * 2.6, R * 2.4, sleeves);
      armCover(rig, d, side, 0.55, 0.88, R * 2.65, R * 2.45, mat(t.color3 ?? shade(c2, -0.3), 'cloth'));
      armCover(rig, d, side, 0.88, 0.97, R * 1.9, R * 1.8, mat(t.color3 ?? '#1f2a44', 'cloth'));
    }
  } else if (t.kind === 'band-jacket') {
    torso(d, rig, m, { w: 1.14, dpt: 1.28, drop: 0.06, taper: 0.95, top: 0.02 });
    const gold = mat(t.color2 ?? '#c9a227', 'metal');
    for (let i = 0; i < 4; i++) {
      add(rig.Spine2, box(d.torsoW * 0.6, d.H * 0.008, d.H * 0.008), gold, [0, chestLocal(d, d.shoulderY - d.torsoLen * (0.2 + i * 0.17)), d.torsoD * 0.65]);
    }
    add(rig.Spine2, cyl(R * 2.6, R * 2.8, d.neckLen * 0.6, { anchor: 'bottom', segments: 8 }), m, [0, chestLocal(d, d.shoulderY), 0]);
    add(rig.Spine2, cyl(R * 2.65, R * 2.65, d.H * 0.006, { segments: 8 }), gold, [0, chestLocal(d, d.shoulderY) + d.neckLen * 0.6, 0]);
    for (const side of SIDES) {
      add(rig[`${side}Arm`], box(R * 3.4, d.H * 0.012, R * 2.8), gold, [0, R * 1.2, 0]);
      armCover(rig, d, side, 0, 0.94, R * 2.0, R * 1.85, m);
      armCover(rig, d, side, 0.88, 0.95, R * 1.95, R * 1.95, gold);
    }
  }
}

export function buildBottom(def: CharacterDef, d: Dims, rig: Rig) {
  const b = def.bottom;
  const m = mat(b.color, 'cloth');
  const L = d.legR;
  const rand = rng(def.id + 'bottom');
  const widen = b.kind === 'baggy-shorts' || b.kind === 'cargo-pants' ? 1.15 : b.kind === 'skinny-jeans' ? 0.95 : 1.05;
  add(rig.Hips, box(d.torsoW * 1.02 * widen, d.H * 0.075, d.torsoD * 1.15 * widen, { anchor: 'top', taperX: 1.05 }), m, [0, d.H * 0.02, 0]);

  const spec: Record<typeof b.kind, [number, number, number]> = {
    shorts: [0.6, 2.4, 2.25],
    'baggy-shorts': [0.66, 2.85, 2.7],
    'skinny-jeans': [1.0, 1.45, 1.2],
    'cargo-pants': [0.97, 2.2, 1.95],
    trousers: [1.0, 1.75, 1.6],
  };
  const [to, r0, r1] = spec[b.kind];
  for (const side of SIDES) {
    legCover(rig, d, side, 0, to, L * r0, L * r1, m);
    const sx = side === 'Left' ? 1 : -1;
    if (b.kind === 'cargo-pants') {
      add(rig[`${side}UpLeg`], box(L * 1.2, d.thigh * 0.3, L * 1.6), mat(shade(b.color, -0.06), 'cloth'), [sx * L * 2.1, -d.thigh * 0.6, 0]);
      legCover(rig, d, side, 0.9, 0.97, L * 2.05, L * 2.05, mat(shade(b.color, -0.04), 'cloth'));
    }
    if (b.kind === 'trousers' && b.color2) {
      add(rig[`${side}UpLeg`], box(L * 0.4, d.thigh, L * 0.6, { anchor: 'top' }), mat(b.color2), [sx * L * 1.72, 0, 0]);
      add(rig[`${side}Leg`], box(L * 0.4, d.shin, L * 0.6, { anchor: 'top' }), mat(b.color2), [sx * L * 1.62, 0, 0]);
    }
    if (b.color2 && (b.kind === 'skinny-jeans' || b.kind === 'cargo-pants')) {
      // Rips (jeans) or camo blotches (cargos).
      const n = b.kind === 'skinny-jeans' ? 2 : 6;
      for (let i = 0; i < n; i++) {
        const bone = rand() < 0.5 ? rig[`${side}UpLeg`] : rig[`${side}Leg`];
        const len = bone === rig[`${side}UpLeg`] ? d.thigh : d.shin;
        const a = (rand() - 0.5) * (b.kind === 'skinny-jeans' ? 0.8 : Math.PI * 2);
        const rr = L * (b.kind === 'skinny-jeans' ? 1.4 : 2.05);
        add(bone, box(L * 0.9, len * 0.12, L * 0.3), mat(b.color2, 'cloth'), [Math.sin(a) * rr, -len * (0.25 + rand() * 0.5), Math.cos(a) * rr], [0, a, 0]);
      }
    }
    if (b.kind === 'shorts' || b.kind === 'baggy-shorts') legCover(rig, d, side, to - 0.04, to, L * r1 * 1.02, L * r1 * 1.02, mat(shade(b.color, -0.05), 'cloth'));
  }
}

export function buildSocks(def: CharacterDef, d: Dims, rig: Rig) {
  const s = def.socks;
  if (s.kind === 'none') return;
  for (const side of SIDES) {
    legCover(rig, d, side, 0.62, 1.0, d.legR * 1.3, d.legR * 1.2, mat(s.color, 'cloth'));
    const stripes = s.kind === 'striped' ? [s.color2, s.color3, s.color2, s.color3] : [s.color2, s.color2];
    stripes.forEach((c, i) => {
      if (c) legCover(rig, d, side, 0.64 + i * 0.035, 0.66 + i * 0.035, d.legR * 1.34, d.legR * 1.34, mat(c, 'cloth'));
    });
  }
}

export function buildShoes(def: CharacterDef, d: Dims, rig: Rig) {
  const s = def.shoes;
  const upper = mat(s.color);
  const accent = mat(s.color2 ?? shade(s.color, -0.2));
  const sole = mat(s.sole ?? '#f2efe8');
  const { footL: fl, footW: fw, ankleY: ay, H } = d;
  for (const side of SIDES) {
    const foot = rig[`${side}Foot`];
    const ground = -ay;
    const z = fl * 0.22;
    if (s.kind === 'chunky-sneakers') {
      const sh = ay * 0.42;
      add(foot, box(fw * 1.22, sh, fl * 1.08, { anchor: 'bottom' }), sole, [0, ground, z]);
      add(foot, box(fw * 1.24, sh * 0.35, fl * 1.1, { anchor: 'bottom' }), accent, [0, ground + sh * 0.35, z]);
      add(foot, box(fw * 1.0, ay * 0.95, fl * 0.9, { anchor: 'bottom', taperX: 0.85, taperZ: 0.7 }), upper, [0, ground + sh, z - fl * 0.03]);
      add(foot, box(fw * 1.02, ay * 0.55, fl * 0.32, { anchor: 'bottom', taperZ: 0.6 }), accent, [0, ground + sh, z + fl * 0.32]);
      for (let i = 0; i < 3; i++) add(foot, box(fw * 0.55, H * 0.004, H * 0.006), mat('#f4f1ea'), [0, ground + sh + ay * 0.8 - i * ay * 0.08, z + fl * 0.05 + i * fl * 0.08], [0.5, 0, 0]);
    } else if (s.kind === 'hi-tops') {
      add(foot, box(fw * 1.05, ay * 0.32, fl * 1.02, { anchor: 'bottom' }), sole, [0, ground, z]);
      add(foot, box(fw * 0.98, ay * 0.9, fl * 0.95, { anchor: 'bottom', taperZ: 0.75 }), upper, [0, ground + ay * 0.32, z]);
      add(foot, cyl(fw * 0.5, fw * 0.55, ay * 1.6, { anchor: 'bottom', segments: 7 }), upper, [0, ground + ay * 0.32, -fl * 0.05]);
      add(foot, box(fw * 1.0, ay * 0.6, fl * 0.38, { anchor: 'bottom' }), accent, [0, ground + ay * 0.32, z + fl * 0.3]);
      add(foot, cyl(fw * 0.56, fw * 0.56, ay * 0.25, { anchor: 'bottom', segments: 7 }), accent, [0, ground + ay * 1.75, -fl * 0.05]);
    } else if (s.kind === 'work-boots') {
      add(foot, box(fw * 1.12, ay * 0.32, fl * 1.05, { anchor: 'bottom' }), sole, [0, ground, z]);
      add(foot, lump(fw * 0.55, ay * 0.6, fl * 0.32, { detail: 0 }), upper, [0, ground + ay * 0.6, z + fl * 0.24]);
      add(foot, box(fw * 1.02, ay * 1.0, fl * 0.75, { anchor: 'bottom', taperZ: 0.85 }), upper, [0, ground + ay * 0.32, z - fl * 0.08]);
      add(foot, cyl(fw * 0.52, fw * 0.56, ay * 1.9, { anchor: 'bottom', segments: 7 }), upper, [0, ground + ay * 0.32, -fl * 0.05]);
      for (let i = 0; i < 4; i++) add(foot, box(fw * 0.5, H * 0.004, H * 0.006), accent, [0, ground + ay * (0.9 + i * 0.3), z + fl * 0.02 - i * fl * 0.04]);
    } else {
      add(foot, box(fw * 0.95, ay * 0.25, fl * 0.95, { anchor: 'bottom' }), sole, [0, ground, z]);
      add(foot, box(fw * 0.9, ay * 0.7, fl * 0.9, { anchor: 'bottom', taperZ: 0.7 }), upper, [0, ground + ay * 0.25, z]);
    }
  }
}
