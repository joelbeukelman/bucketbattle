import * as THREE from 'three';
import type { CharacterDef, Rendition } from '@bb/schema';

/** Every measurement the part builders need, derived once from body params + rendition. */
export interface Dims {
  H: number;
  ankleY: number;
  kneeY: number;
  hipY: number;
  shoulderY: number;
  headBase: number;
  neckLen: number;
  headH: number;
  headW: number;
  headD: number;
  shoulderX: number;
  hipX: number;
  upperArm: number;
  foreArm: number;
  hand: number;
  thigh: number;
  shin: number;
  armR: number;
  legR: number;
  torsoW: number;
  torsoD: number;
  torsoLen: number;
  footL: number;
  footW: number;
  earScale: number;
}

/**
 * Hero = lanky teen, ~6.5 heads with an oversized head (C5). Map = chunky chibi, ~3 heads (C4).
 * Both use the same skeleton names, so animations retarget (ADR-0002).
 */
export function computeDims(def: CharacterDef, rendition: Rendition): Dims {
  const b = def.body;
  const hero = rendition === 'hero';
  const H = hero ? b.height : 0.62 * b.height + 0.15;
  const ankleY = H * (hero ? 0.07 : 0.08);
  const hipY = H * (hero ? 0.41 : 0.27) * b.legs;
  const torsoLen = H * (hero ? 0.2 : 0.2);
  const shoulderY = hipY + torsoLen;
  const neckLen = H * (hero ? 0.07 : 0.025);
  const headBase = shoulderY + neckLen;
  // The concepts have very big heads: about a quarter of standing height.
  const headH = H * (hero ? 0.27 : 0.42) * b.headScale;
  const armR = H * (hero ? 0.017 : 0.04) * b.build;
  const legR = H * (hero ? 0.02 : 0.045) * b.build;
  const shoulderX = H * (hero ? 0.085 : 0.12) * b.shoulders;
  const armLen = (shoulderY - hipY) * (hero ? 1.55 : 0.95);
  return {
    H,
    ankleY,
    kneeY: ankleY + (hipY - ankleY) * 0.5,
    hipY,
    shoulderY,
    headBase,
    neckLen,
    headH,
    headW: headH * 0.86,
    headD: headH * 0.8,
    shoulderX,
    hipX: shoulderX * 0.45,
    upperArm: armLen * 0.48,
    foreArm: armLen * 0.4,
    hand: armLen * 0.17,
    thigh: (hipY - ankleY) * 0.5,
    shin: (hipY - ankleY) * 0.5,
    armR,
    legR,
    torsoW: shoulderX * 2 + armR,
    torsoD: (shoulderX * 2 + armR) * 0.55,
    torsoLen,
    footL: H * (hero ? 0.19 : 0.2),
    footW: H * (hero ? 0.085 : 0.12),
    earScale: b.earScale,
  };
}

export const BONES = [
  'Hips', 'Spine', 'Spine2', 'Neck', 'Head',
  'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot',
] as const;
export type BoneName = (typeof BONES)[number];
export type Rig = Record<BoneName, THREE.Group>;

/**
 * Pivot hierarchy with Mixamo names (`mixamorig` prefix) so a later skinned export and
 * Mixamo animations line up. Character faces +Z, feet at y = 0, left side is +X.
 */
export function buildRig(d: Dims): { root: THREE.Group; rig: Rig } {
  const root = new THREE.Group();
  const world = new Map<THREE.Object3D, THREE.Vector3>([[root, new THREE.Vector3()]]);
  const rig = {} as Rig;
  const bone = (name: BoneName, parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const g = new THREE.Group();
    g.name = `mixamorig${name}`;
    const pw = world.get(parent)!;
    g.position.set(x - pw.x, y - pw.y, z - pw.z);
    g.userData.rest = g.position.clone();
    world.set(g, new THREE.Vector3(x, y, z));
    parent.add(g);
    rig[name] = g;
    return g;
  };
  const hips = bone('Hips', root, 0, d.hipY);
  const spine = bone('Spine', hips, 0, d.hipY + d.torsoLen * 0.1);
  const chest = bone('Spine2', spine, 0, d.hipY + d.torsoLen * 0.6);
  const neck = bone('Neck', chest, 0, d.shoulderY);
  bone('Head', neck, 0, d.headBase);
  for (const [side, sx] of [['Left', 1], ['Right', -1]] as const) {
    const armY = d.shoulderY - d.armR * 1.3;
    const arm = bone(`${side}Arm`, chest, sx * d.shoulderX, armY);
    const fore = bone(`${side}ForeArm`, arm, sx * d.shoulderX, armY - d.upperArm);
    bone(`${side}Hand`, fore, sx * d.shoulderX, armY - d.upperArm - d.foreArm);
    const up = bone(`${side}UpLeg`, hips, sx * d.hipX, d.hipY - d.legR * 0.5);
    const leg = bone(`${side}Leg`, up, sx * d.hipX, d.kneeY);
    bone(`${side}Foot`, leg, sx * d.hipX, d.ankleY);
  }
  return { root, rig };
}

export type Pose = 'apose' | 'idle' | 'drum';

/** Pose the pivots. `t` (seconds) animates idle breathing and the drum loop. */
export function applyPose(rig: Rig, pose: Pose, t = 0) {
  for (const b of BONES) {
    rig[b].rotation.set(0, 0, 0);
    rig[b].position.copy(rig[b].userData.rest as THREE.Vector3);
  }
  const breathe = Math.sin(t * 2) * 0.015;
  rig.Spine2.rotation.x = breathe;
  if (pose === 'apose') {
    rig.LeftArm.rotation.z = Math.PI / 4;
    rig.RightArm.rotation.z = -Math.PI / 4;
    rig.LeftUpLeg.rotation.z = 0.06;
    rig.RightUpLeg.rotation.z = -0.06;
  } else if (pose === 'idle') {
    rig.LeftArm.rotation.z = 0.12;
    rig.RightArm.rotation.z = -0.12;
    rig.LeftForeArm.rotation.x = -0.15;
    rig.RightForeArm.rotation.x = -0.15;
    rig.Head.rotation.y = Math.sin(t * 0.7) * 0.08;
  } else {
    // ~100 bpm alternating strokes.
    const beat = t * Math.PI * 1.67;
    const l = Math.max(0, Math.sin(beat));
    const r = Math.max(0, Math.sin(beat + Math.PI));
    rig.LeftArm.rotation.set(-0.5, 0, 0.25);
    rig.RightArm.rotation.set(-0.5, 0, -0.25);
    rig.LeftForeArm.rotation.set(-1.0 - l * 0.45, 0, -0.35);
    rig.RightForeArm.rotation.set(-1.0 - r * 0.45, 0, 0.35);
    rig.LeftHand.rotation.x = -l * 0.4;
    rig.RightHand.rotation.x = -r * 0.4;
    rig.Hips.position.y += Math.abs(Math.sin(beat)) * 0.005;
    rig.Head.rotation.x = Math.sin(beat * 2) * 0.04;
  }
}
