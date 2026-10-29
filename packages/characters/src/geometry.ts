import * as THREE from 'three';

/**
 * Hard-faceted building blocks (C7): low segment counts, flat shading, and a little
 * deterministic jitter so surfaces read as hand-cut planes rather than perfect primitives.
 */

export type Anchor = 'bottom' | 'center' | 'top';

function anchorY(geo: THREE.BufferGeometry, h: number, anchor: Anchor) {
  if (anchor === 'bottom') geo.translate(0, h / 2, 0);
  if (anchor === 'top') geo.translate(0, -h / 2, 0);
  return geo;
}

/** Box with optional taper: top face scaled by (taperX, taperZ). */
export function box(w: number, h: number, d: number, opts: { anchor?: Anchor; taperX?: number; taperZ?: number } = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const { taperX = 1, taperZ = 1 } = opts;
  if (taperX !== 1 || taperZ !== 1) {
    const p = geo.attributes.position!;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) p.setXYZ(i, p.getX(i) * taperX, p.getY(i), p.getZ(i) * taperZ);
    }
  }
  return anchorY(geo, h, opts.anchor ?? 'center');
}

/** Low-segment cylinder; along Y. */
export function cyl(rTop: number, rBottom: number, h: number, opts: { anchor?: Anchor; segments?: number; open?: boolean } = {}) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, h, opts.segments ?? 7, 1, opts.open ?? false);
  return anchorY(geo, h, opts.anchor ?? 'center');
}

/** Faceted blob (icosahedron) scaled to radii, optionally jittered and shaped. */
export function lump(rx: number, ry: number, rz: number, opts: { detail?: number; jitter?: number; seed?: number; shape?: (v: THREE.Vector3) => void } = {}) {
  const geo = new THREE.IcosahedronGeometry(1, opts.detail ?? 1);
  const p = geo.attributes.position!;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (opts.jitter) {
      // Jitter keyed by position so the shared corners of neighbouring faces move together.
      const n = hash3(v.x, v.y, v.z, opts.seed ?? 1);
      v.multiplyScalar(1 + (n - 0.5) * opts.jitter);
    }
    v.set(v.x * rx, v.y * ry, v.z * rz);
    opts.shape?.(v);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Upper part of a sphere (caps, domes, hair shells). */
export function dome(rx: number, ry: number, rz: number, fraction = 0.5, segments = 8) {
  const geo = new THREE.SphereGeometry(1, segments, Math.max(3, Math.round(segments * 0.6)), 0, Math.PI * 2, 0, Math.PI * fraction);
  geo.scale(rx, ry, rz);
  return geo;
}

export function torus(r: number, tube: number, opts: { radial?: number; tubular?: number; arc?: number } = {}) {
  return new THREE.TorusGeometry(r, tube, opts.radial ?? 4, opts.tubular ?? 10, opts.arc ?? Math.PI * 2);
}

function hash3(x: number, y: number, z: number, seed: number) {
  const q = (n: number) => Math.round(n * 1000);
  let h = (q(x) * 73856093) ^ (q(y) * 19349663) ^ (q(z) * 83492791) ^ (seed * 2654435761);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Deterministic PRNG for part details (patch placement, camo blotches). */
export function rng(seed: string | number) {
  let a = typeof seed === 'number' ? seed : [...seed].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619), 2166136261);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const materials = new Map<string, THREE.Material>();
export type Finish = 'matte' | 'metal' | 'cloth' | 'gloss';

/** Shared flat-shaded materials, one per color + finish. */
export function mat(color: THREE.ColorRepresentation, finish: Finish = 'matte'): THREE.Material {
  const key = `${new THREE.Color(color).getHexString()}:${finish}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      flatShading: true,
      roughness: finish === 'metal' ? 0.35 : finish === 'gloss' ? 0.4 : finish === 'cloth' ? 0.95 : 0.8,
      metalness: finish === 'metal' ? 0.65 : 0,
    });
    materials.set(key, m);
  }
  return m;
}

/** Plaid / check texture (flannels). Nearest filtering keeps it crisp and pixel-honest. */
export function plaidMaterial(a: string, b: string): THREE.Material {
  const key = `plaid:${a}:${b}`;
  let m = materials.get(key);
  if (m) return m;
  if (typeof document === 'undefined') return mat(a, 'cloth');
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = b;
  ctx.fillRect(0, 0, 8, 8);
  ctx.fillRect(8, 8, 8, 8);
  ctx.globalAlpha = 0.45;
  ctx.fillRect(0, 8, 8, 8);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.fillRect(7, 0, 2, 16);
  ctx.fillRect(0, 7, 16, 2);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  m = new THREE.MeshStandardMaterial({ map: tex, flatShading: true, roughness: 0.95 });
  materials.set(key, m);
  return m;
}

export function shade(hex: string, lightness: number) {
  return `#${new THREE.Color(hex).offsetHSL(0, 0, lightness).getHexString()}`;
}

/** Add a mesh to a parent at a local position/rotation. Returns the mesh. */
export function add(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  name?: string,
) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}
