import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { live } from '../store';
import { LIGHTING } from '@bb/engine';
import { palette } from '../palette';

/**
 * W4: warm low key light with long shadows, cool sky fill. One 2048 shadow map that
 * follows the player (perf budget §7), so shadows stay crisp without covering the world.
 */
export function Lighting() {
  const sun = useRef<THREE.DirectionalLight>(null!);
  const offset = new THREE.Vector3(...LIGHTING.sun.offset);
  useFrame(() => {
    const { x, z } = live.player;
    sun.current.position.set(x + offset.x, offset.y, z + offset.z);
    sun.current.target.position.set(x, 0, z);
    sun.current.target.updateMatrixWorld();
  });
  return (
    <>
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity]} />
      <directionalLight
        ref={sun}
        color={LIGHTING.sun.color}
        intensity={LIGHTING.sun.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={200}
      />
      <fog attach="fog" args={[palette.background, 180, 420]} />
      <color attach="background" args={[palette.background]} />
    </>
  );
}
