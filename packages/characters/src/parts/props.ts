import * as THREE from 'three';
import type { CharacterDef } from '@bb/schema';
import type { Dims, Pose, Rig } from '../rig';
import { add, box, cyl, mat, rng, shade, torus } from '../geometry';
import { eyeLayout } from './body';

const chestLocal = (d: Dims, y: number) => y - (d.hipY + d.torsoLen * 0.6);
const PATCH_COLORS = ['#d94a4a', '#3aa6a6', '#e6c84a', '#ece8df', '#8a5cc2', '#4f7d3a', '#e07b2e'];

export function buildAccessories(def: CharacterDef, d: Dims, rig: Rig) {
  const rand = rng(def.id + 'acc');
  for (const a of def.accessories) {
    const m = mat(a.color, a.kind === 'chain' || a.kind === 'earrings' ? 'metal' : 'matte');
    if (a.kind === 'chain') {
      // Heavy chain: a closed loop round the back of the neck that hangs in a U down the chest.
      const top = chestLocal(d, d.shoulderY + d.H * 0.008);
      const low = chestLocal(d, d.shoulderY - d.torsoLen * 0.5);
      const fz = d.torsoD * 0.82;
      const pts = [
        [0, top + d.H * 0.01, -d.torsoD * 0.25], [-d.torsoW * 0.2, top, 0], [-d.torsoW * 0.24, top - d.torsoLen * 0.18, fz * 0.92],
        [0, low, fz], [d.torsoW * 0.24, top - d.torsoLen * 0.18, fz * 0.92], [d.torsoW * 0.2, top, 0],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
      add(rig.Spine2, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 28, d.H * 0.017, 4, true), m);
      if (a.color2) add(rig.Spine2, box(d.H * 0.025, d.H * 0.032, d.H * 0.01), mat(a.color2, 'metal'), [0, low - d.H * 0.02, fz + d.H * 0.006]);
    } else if (a.kind === 'sunglasses') {
      const e = eyeLayout(d);
      for (const sx of [1, -1]) add(rig.Head, box(e.r * 2.4, e.r * 1.6, e.r * 0.35), m, [sx * e.x, e.y + e.r * 0.15, e.z + e.r * 0.6]);
      add(rig.Head, box(e.x * 2, e.r * 0.3, e.r * 0.3), m, [0, e.y + e.r * 0.6, e.z + e.r * 0.6]);
    } else if (a.kind === 'backpack') {
      const y = chestLocal(d, d.hipY + d.torsoLen * 0.15);
      add(rig.Spine2, box(d.torsoW * 0.9, d.torsoLen * 0.78, d.torsoD * 0.62, { anchor: 'bottom', taperX: 0.92 }), m, [0, y, -d.torsoD * 1.05]);
      add(rig.Spine2, box(d.torsoW * 0.6, d.torsoLen * 0.25, d.torsoD * 0.2, { anchor: 'bottom' }), mat(a.color2 ?? shade(a.color, 0.1)), [0, y + d.torsoLen * 0.05, -d.torsoD * 1.4]);
      for (const sx of [1, -1]) add(rig.Spine2, box(d.H * 0.014, d.torsoLen * 0.8, d.H * 0.01, { anchor: 'top' }), mat(a.color2 ?? shade(a.color, -0.1)), [sx * d.torsoW * 0.3, chestLocal(d, d.shoulderY + d.H * 0.01), d.torsoD * 0.72]);
    } else if (a.kind === 'suspenders') {
      for (const sx of [1, -1]) for (const sz of [1, -1]) {
        add(rig.Spine2, box(d.H * 0.012, d.torsoLen * 1.05, d.H * 0.006, { anchor: 'top' }), m, [sx * d.torsoW * 0.22, chestLocal(d, d.shoulderY + d.H * 0.012), sz * d.torsoD * 0.67]);
      }
    } else if (a.kind === 'wristbands') {
      for (const side of ['Left', 'Right'] as const) {
        for (let i = 0; i < 4; i++) {
          const c = i % 2 === 0 ? a.color : (a.color2 ?? PATCH_COLORS[Math.floor(rand() * PATCH_COLORS.length)]!);
          add(rig[`${side}ForeArm`], cyl(d.armR * 1.55, d.armR * 1.55, d.H * 0.009, { segments: 8 }), mat(c), [0, -d.foreArm * (0.8 + i * 0.05), 0]);
        }
      }
    } else if (a.kind === 'earrings') {
      for (const sx of [1, -1]) add(rig.Head, torus(d.headH * 0.04, d.headH * 0.012, { radial: 4, tubular: 8 }), m, [sx * (d.headW * 0.5 + d.headH * 0.07 * d.earScale), d.headH * 0.3, 0], [0, Math.PI / 2, 0]);
    } else if (a.kind === 'sash') {
      add(rig.Spine2, box(d.H * 0.035, d.torsoLen * 1.35, d.torsoD * 1.4), m, [0, chestLocal(d, d.hipY + d.torsoLen * 0.55), 0], [0, 0, 0.7]);
    } else if (a.kind === 'patches') {
      const targets: [THREE.Object3D, number, number, number][] = [];
      for (let i = 0; i < 6; i++) {
        targets.push([rig.Spine2, (rand() - 0.5) * d.torsoW * 1.0, chestLocal(d, d.hipY + d.torsoLen * (0.15 + rand() * 0.7)), d.torsoD * 0.81]);
      }
      for (const side of ['Left', 'Right'] as const) targets.push([rig[`${side}Arm`], (side === 'Left' ? 1 : -1) * d.armR * 2.7, -d.upperArm * 0.5, 0]);
      for (const [parent, x, y, z] of targets) {
        const s = d.H * (0.025 + rand() * 0.02);
        const onArm = parent !== rig.Spine2;
        add(parent, box(onArm ? s * 0.3 : s * 1.3, s, onArm ? s * 1.3 : s * 0.25), mat(PATCH_COLORS[Math.floor(rand() * PATCH_COLORS.length)]!), [x, y, z], [0, 0, (rand() - 0.5) * 0.4]);
      }
    }
  }
}

/** One upturned bucket (wider at the ground), lip ring on the bottom edge. */
function bucket(parent: THREE.Object3D, d: Dims, color: string, x: number, y: number, z: number, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const h = d.H * 0.13 * scale;
  add(g, cyl(d.H * 0.072 * scale, d.H * 0.088 * scale, h, { anchor: 'bottom', segments: 10 }), mat(color, 'gloss'));
  add(g, cyl(d.H * 0.092 * scale, d.H * 0.092 * scale, h * 0.08, { anchor: 'bottom', segments: 10 }), mat(shade(color, -0.12), 'gloss'));
  add(g, cyl(d.H * 0.074 * scale, d.H * 0.074 * scale, h * 0.06, { anchor: 'bottom', segments: 10 }), mat(shade(color, -0.08), 'gloss'), [0, h * 0.62, 0]);
  parent.add(g);
  return h;
}

/**
 * Instruments sit on the ground beside the character in A-pose / idle (sheet-style), and in
 * front at playing height for the drum pose. Sticks appear in the hands only when playing.
 */
export function buildInstrument(def: CharacterDef, d: Dims, rig: Rig, root: THREE.Object3D, pose: Pose) {
  const ins = def.instrument;
  if (ins.kind === 'none') return;
  const playing = pose === 'drum';
  const g = new THREE.Group();
  g.name = 'instrument';
  root.add(g);
  const side = d.torsoW * 1.6 + d.H * 0.1;
  const rim = mat(ins.color2 ?? '#c8c8c8', 'metal');
  const headSkin = mat('#efe9dc');

  const drum = (r: number, h: number, y: number) => {
    add(g, cyl(r, r, h, { anchor: 'bottom', segments: 12 }), mat(ins.color, 'gloss'), [0, y, 0]);
    for (const yy of [y, y + h - h * 0.12]) add(g, cyl(r * 1.04, r * 1.04, h * 0.12, { anchor: 'bottom', segments: 12 }), rim, [0, yy, 0]);
    add(g, cyl(r * 0.98, r * 0.98, h * 0.02, { anchor: 'bottom', segments: 12 }), headSkin, [0, y + h, 0]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add(g, box(d.H * 0.006, h * 0.8, d.H * 0.006), rim, [Math.sin(a) * r * 1.05, y + h / 2, Math.cos(a) * r * 1.05]);
    }
  };

  if (ins.kind === 'snare' || ins.kind === 'marching-snare') {
    const r = d.H * (ins.kind === 'snare' ? 0.085 : 0.1);
    const h = d.H * (ins.kind === 'snare' ? 0.055 : 0.085);
    if (playing) {
      g.position.set(0, d.hipY - h * 0.5, d.torsoD * 0.9 + r);
      drum(r, h, 0);
    } else {
      g.position.set(side, 0, 0.05);
      drum(r, h, 0);
    }
  } else if (ins.kind === 'bucket-stack' || ins.kind === 'double-bucket') {
    if (playing) g.position.set(0, 0, d.torsoD + d.H * 0.13);
    else g.position.set(side, 0, 0.05);
    if (ins.kind === 'bucket-stack') {
      const h1 = bucket(g, d, ins.color, 0, 0, 0, 1.1);
      bucket(g, d, ins.color2 ?? shade(ins.color, 0.2), d.H * 0.2, 0, -d.H * 0.04, 0.85);
      bucket(g, d, ins.color2 ?? shade(ins.color, 0.2), 0, h1, 0, 0.8);
      add(g, cyl(d.H * 0.08, d.H * 0.08, d.H * 0.01, { segments: 10 }), mat('#d8c27a', 'metal'), [-d.H * 0.17, d.H * 0.25, 0], [0.2, 0, 0.1]);
      add(g, cyl(d.H * 0.005, d.H * 0.005, d.H * 0.25, { anchor: 'bottom', segments: 5 }), mat('#666666', 'metal'), [-d.H * 0.17, 0, 0]);
    } else {
      bucket(g, d, ins.color, -d.H * 0.1, 0, 0);
      bucket(g, d, ins.color2 ?? ins.color, d.H * 0.1, 0, 0);
    }
  } else if (ins.kind === 'practice-pad') {
    const y = playing ? d.hipY : d.H * 0.32;
    g.position.set(playing ? 0 : side, 0, playing ? d.torsoD + d.H * 0.06 : 0.05);
    add(g, cyl(d.H * 0.006, d.H * 0.01, y, { anchor: 'bottom', segments: 5 }), mat('#333333', 'metal'));
    add(g, cyl(d.H * 0.055, d.H * 0.055, d.H * 0.014, { anchor: 'bottom', segments: 10 }), mat(ins.color), [0, y, 0]);
    add(g, cyl(d.H * 0.045, d.H * 0.045, d.H * 0.006, { anchor: 'bottom', segments: 10 }), mat(ins.color2 ?? '#2a2a2a'), [0, y + d.H * 0.014, 0]);
  }

  if (playing) {
    for (const s of ['Left', 'Right'] as const) {
      add(rig[`${s}Hand`], cyl(d.H * 0.006, d.H * 0.008, d.H * 0.24, { anchor: 'bottom', segments: 5 }), mat('#d9b47c'), [0, -d.hand * 0.6, d.armR], [1.35, 0, 0]);
    }
  }
}
