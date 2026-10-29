import * as THREE from 'three';
import { CharacterDef, type Rendition } from '@bb/schema';
import { applyPose, buildRig, computeDims, type Pose, type Rig } from './rig';
import { buildBody, buildHair, buildHead } from './parts/body';
import { buildBottom, buildHat, buildShoes, buildSocks, buildTop } from './parts/wear';
import { buildAccessories, buildInstrument } from './parts/props';

export { applyPose, computeDims, BONES, type Pose, type Rig, type Dims } from './rig';

export interface BuiltCharacter {
  root: THREE.Group;
  rig: Rig;
  triangles: number;
  height: number;
  dispose: () => void;
}

/**
 * CharacterDef → hard-faceted, posable model (C7). Pure function of its inputs: the studio
 * rebuilds on every edit, the game builds once per character.
 */
export function buildCharacter(input: CharacterDef, rendition: Rendition = 'hero', pose: Pose = 'apose'): BuiltCharacter {
  const def = CharacterDef.parse(input);
  const d = computeDims(def, rendition);
  const { root, rig } = buildRig(d);
  root.name = `${def.id}@${rendition}`;
  buildBody(def, d, rig);
  buildHead(def, d, rig);
  buildHair(def, d, rig);
  buildHat(def, d, rig);
  buildTop(def, d, rig);
  buildBottom(def, d, rig);
  buildSocks(def, d, rig);
  buildShoes(def, d, rig);
  buildAccessories(def, d, rig);
  buildInstrument(def, d, rig, root, pose);
  applyPose(rig, pose, 0);

  let triangles = 0;
  const geometries = new Set<THREE.BufferGeometry>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      geometries.add(o.geometry);
      const g = o.geometry as THREE.BufferGeometry;
      triangles += (g.index ? g.index.count : g.attributes.position!.count) / 3;
    }
  });
  return {
    root,
    rig,
    triangles: Math.round(triangles),
    height: d.headBase + d.headH,
    dispose: () => geometries.forEach((g) => g.dispose()),
  };
}
