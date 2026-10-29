import * as THREE from 'three';

export interface BoxInstance {
  /** Centre of the box base on the ground (x, y, z) and full size. */
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color?: THREE.ColorRepresentation;
  rotationY?: number;
}

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const up = new THREE.Vector3(0, 1, 0);
const pos = new THREE.Vector3();
const scl = new THREE.Vector3();
const col = new THREE.Color();

/** Write box placements into an InstancedMesh whose geometry is a unit box sitting on y=0. */
export function fillInstances(mesh: THREE.InstancedMesh, items: readonly BoxInstance[]) {
  items.forEach((it, i) => {
    q.setFromAxisAngle(up, it.rotationY ?? 0);
    m.compose(pos.set(it.x, it.y, it.z), q, scl.set(it.w, it.h, it.d));
    mesh.setMatrixAt(i, m);
    if (it.color !== undefined) mesh.setColorAt(i, col.set(it.color));
  });
  mesh.count = items.length;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

/** Unit box with its base on y=0. Optionally darker top face (roofs read from above, W10). */
export function unitBox(topColor?: THREE.ColorRepresentation): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  if (topColor !== undefined) {
    const top = new THREE.Color(topColor);
    const colors = new Float32Array(g.attributes.position!.count * 3).fill(1);
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z; 4 vertices each. +y is the roof.
    for (let v = 8; v < 12; v++) colors.set([top.r, top.g, top.b], v * 3);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }
  return g;
}
