import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { buildCharacter, applyPose, type Pose } from '@bb/characters';
import type { CharacterDef, Rendition } from '@bb/schema';
import { LIGHTING } from '@bb/engine';
import { useCurrent, useStudio } from './store';

/** Live stats for the toolbar, written by the model and read by the UI. */
export const stats = { triangles: 0, height: 0 };

function Model({ def, rendition, pose, x }: { def: CharacterDef; rendition: Rendition; pose: Pose; x: number }) {
  const built = useMemo(() => buildCharacter(def, rendition, pose), [def, rendition, pose]);
  useEffect(() => () => built.dispose(), [built]);
  useEffect(() => {
    if (rendition === 'hero' || x === 0) Object.assign(stats, { triangles: built.triangles, height: built.height });
  }, [built, rendition, x]);
  useFrame(({ clock }) => applyPose(built.rig, pose, clock.elapsedTime));
  return <primitive object={built.root} position={[x, 0, 0]} />;
}

function Stage() {
  const { def } = useCurrent();
  const pose = useStudio((s) => s.pose);
  const view = useStudio((s) => s.view);
  const turntable = useStudio((s) => s.turntable);
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (turntable) group.current.rotation.y += dt * 0.6;
  });
  const spread = def.body.height * 0.55;
  return (
    <group ref={group}>
      {view !== 'map' && <Model def={def} rendition="hero" pose={pose} x={view === 'both' ? -spread : 0} />}
      {view !== 'hero' && <Model def={def} rendition="map" pose={pose} x={view === 'both' ? spread : 0} />}
    </group>
  );
}

export function Viewport() {
  const { def } = useCurrent();
  const view = useStudio((s) => s.view);
  const h = def.body.height;
  const target: [number, number, number] = [0, h * (view === 'map' ? 0.38 : 0.5), 0];
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 30, position: [0, h * 0.62, h * (view === 'both' ? 3.4 : 2.5)], near: 0.05, far: 100 }}>
      <color attach="background" args={[LIGHTING.background]} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity]} />
      <directionalLight
        position={[LIGHTING.sun.offset[0] / 15, LIGHTING.sun.offset[1] / 15, Math.abs(LIGHTING.sun.offset[2]) / 10]}
        color={LIGHTING.sun.color}
        intensity={LIGHTING.sun.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[3, 2, -3]} color="#bcd0ff" intensity={0.6} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[3, 40]} />
        <meshStandardMaterial color="#bdb8ad" roughness={1} />
      </mesh>
      <Stage />
      <OrbitControls target={target} enablePan minDistance={0.6} maxDistance={12} makeDefault />
    </Canvas>
  );
}
