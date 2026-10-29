import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CURB_HEIGHT } from '@bb/world';
import { encounters } from '../world-data';
import { palette } from '../palette';
import { useGame } from '../store';

/**
 * Grey-box musicians. Only musicians are saturated (W2), with a pulsing ring + light pool
 * so they read at overview zoom. Real models arrive via the studio (ADR-0002).
 */
export function Encounters() {
  return (
    <>
      {encounters.map((e) => (
        <Busker key={e.id} id={e.id} x={e.at[0]} z={e.at[1]} facing={THREE.MathUtils.degToRad(e.facing)} />
      ))}
    </>
  );
}

function Busker({ id, x, z, facing }: { id: string; x: number; z: number; facing: number }) {
  const ring = useRef<THREE.Mesh>(null!);
  const body = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const near = useGame.getState().nearbyEncounter === id;
    const s = 1 + ((t * 0.8) % 1) * (near ? 1.4 : 0.8);
    ring.current.scale.set(s, s, s);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 1 - ((t * 0.8) % 1);
    // Drumming bob, on a ~100 bpm pulse.
    body.current.position.y = Math.abs(Math.sin(t * Math.PI * 1.67)) * 0.06;
  });
  return (
    <group position={[x, CURB_HEIGHT, z]} rotation-y={facing}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color={palette.accent} transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial color={palette.accent} transparent />
      </mesh>
      <group ref={body}>
        {/* Seated on an upturned bucket. */}
        <mesh position={[0, 0.25, -0.2]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.5, 10]} />
          <meshStandardMaterial color="#e0e0e0" flatShading />
        </mesh>
        <mesh position={[0, 0.85, -0.2]} castShadow>
          <capsuleGeometry args={[0.3, 0.4, 4, 8]} />
          <meshStandardMaterial color={palette.musician} flatShading />
        </mesh>
        <mesh position={[0, 1.42, -0.2]} castShadow>
          <boxGeometry args={[0.44, 0.4, 0.4]} />
          <meshStandardMaterial color="#8d5a3b" flatShading />
        </mesh>
        <mesh position={[0, 1.66, -0.2]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.16, 10]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
      </group>
      {/* Bucket kit in front of the performer, accent colors (C6). */}
      {[
        [-0.45, 0.45, 0.32, palette.musician],
        [0.45, 0.45, 0.28, palette.accent],
        [0, 0.6, 0.26, '#e0e0e0'],
      ].map(([bx, bz, r, c], i) => (
        <mesh key={i} position={[bx as number, 0.28, bz as number]} castShadow>
          <cylinderGeometry args={[r as number, (r as number) * 0.85, 0.56, 12]} />
          <meshStandardMaterial color={c as string} flatShading />
        </mesh>
      ))}
      <pointLight position={[0, 2.5, 0.5]} color="#ffb347" intensity={12} distance={9} />
    </group>
  );
}
