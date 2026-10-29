import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CURB_HEIGHT, resolveCircle } from '@bb/world';
import { encounters, layout, spawn, world } from '../world-data';
import { live, useGame } from '../store';
import { palette } from '../palette';

const SPEED = 5.5; // m/s
const RADIUS = 0.4;
const keys = new Set<string>();

/** Grey-box player: capsule body + head, map-rendition scale (~1.3 m, C4). */
export function Player() {
  const ref = useRef<THREE.Group>(null!);
  const discoverTimer = useRef(0);

  useEffect(() => {
    live.player.x = spawn[0];
    live.player.z = spawn[1];
    live.player.heading = THREE.MathUtils.degToRad(world.spawn.facing);
    // Dev hook for tools/screenshot.ts (visual-review skill).
    if (import.meta.env.DEV) {
      (window as any).__bb = {
        teleport: (x: number, z: number) => Object.assign(live.player, { x, z }),
        encounters: encounters.map((e) => ({ id: e.id, at: e.at })),
        spawn,
      };
    }
    const down = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) useGame.getState().setTarget(null);
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const clear = () => keys.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = live.player;
    const { target, setTarget } = useGame.getState();

    // Keyboard moves relative to the camera: "up" walks away from the camera.
    const yaw = live.cameraYaw;
    const fwd = new THREE.Vector2(-Math.sin(yaw), -Math.cos(yaw));
    const right = new THREE.Vector2(Math.cos(yaw), -Math.sin(yaw));
    const dir = new THREE.Vector2();
    if (keys.has('w') || keys.has('arrowup')) dir.add(fwd);
    if (keys.has('s') || keys.has('arrowdown')) dir.sub(fwd);
    if (keys.has('d') || keys.has('arrowright')) dir.add(right);
    if (keys.has('a') || keys.has('arrowleft')) dir.sub(right);
    const run = keys.has('shift') ? 1.6 : 1;

    if (dir.lengthSq() === 0 && target) {
      dir.set(target[0] - p.x, target[1] - p.z);
      if (dir.length() < 0.3) {
        setTarget(null);
        dir.set(0, 0);
      }
    }

    let moving = false;
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(SPEED * run * dt);
      const before = [p.x, p.z];
      [p.x, p.z] = resolveCircle(p.x + dir.x, p.z + dir.y, RADIUS, layout.colliders, layout.bounds);
      moving = Math.hypot(p.x - before[0]!, p.z - before[1]!) > 1e-4;
      const want = Math.atan2(dir.x, dir.y);
      let delta = want - p.heading;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      p.heading += delta * Math.min(1, dt * 12);
      // Stuck against a wall while tap-moving: give up instead of grinding.
      if (!moving && target) setTarget(null);
    }

    // Step up onto block islands.
    const onBlock = layout.blocks.some((b) => p.x >= b.outer.x && p.x <= b.outer.x + b.outer.w && p.z >= b.outer.z && p.z <= b.outer.z + b.outer.d);
    const g = ref.current;
    const bob = moving ? Math.abs(Math.sin(performance.now() / 110)) * 0.08 : 0;
    g.position.set(p.x, (onBlock ? CURB_HEIGHT : 0) + bob, p.z);
    g.rotation.y = p.heading;

    // Nearest encounter in range drives the interact prompt.
    const near = encounters.find((e) => Math.hypot(e.at[0] - p.x, e.at[1] - p.z) <= e.radius);
    const nearId = near?.id ?? null;
    if (useGame.getState().nearbyEncounter !== nearId) useGame.getState().setNearby(nearId);

    // Reveal blocks around the player on the map (fog of war, W8).
    discoverTimer.current -= dt;
    if (discoverTimer.current <= 0) {
      discoverTimer.current = 0.5;
      const keysNear = layout.blocks
        .filter((b) => Math.hypot(b.outer.x + b.outer.w / 2 - p.x, b.outer.z + b.outer.d / 2 - p.z) < 60)
        .map((b) => `${b.row},${b.col}`);
      useGame.getState().discover(keysNear);
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.5, 4, 8]} />
        <meshStandardMaterial color={palette.player} flatShading />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.46, 0.42, 0.42]} />
        <meshStandardMaterial color="#e8c9a8" flatShading />
      </mesh>
      {/* Cap brim shows facing direction. */}
      <mesh position={[0, 1.4, 0.18]} castShadow>
        <boxGeometry args={[0.48, 0.08, 0.36]} />
        <meshStandardMaterial color={palette.player} />
      </mesh>
      <TargetMarker />
    </group>
  );
}

/** Small ring where a tap-to-move is heading. Rendered in world space. */
function TargetMarker() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    const t = useGame.getState().target;
    const m = ref.current;
    m.visible = !!t;
    if (t && m.parent) {
      m.position.set(t[0] - live.player.x, 0.05, t[1] - live.player.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), -m.parent.rotation.y);
      m.position.y = 0.2 - m.parent.position.y;
    }
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.35, 0.5, 24]} />
      <meshBasicMaterial color={palette.accent} transparent opacity={0.9} />
    </mesh>
  );
}
