import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { encounters } from '../world-data';
import { live } from '../store';
import { cutawayUniforms } from './cutaway';

/** W5: fixed isometric-style follow camera. Narrow FOV, high pitch, pinch/scroll zoom. */
export const CAMERA = { fov: 22, pitch: THREE.MathUtils.degToRad(35), yaw: Math.PI / 4, minDist: 60, maxDist: 260, startDist: 110 };

export function CameraRig() {
  const { camera, gl, size } = useThree();
  const dist = useRef(CAMERA.startDist);
  const focus = useRef(new THREE.Vector3(live.player.x, 0, live.player.z));
  const tmp = useRef(new THREE.Vector3());

  useEffect(() => {
    const el = gl.domElement;
    const clamp = (d: number) => THREE.MathUtils.clamp(d, CAMERA.minDist, CAMERA.maxDist);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dist.current = clamp(dist.current * Math.exp(e.deltaY * 0.001));
    };
    let pinch = 0;
    const span = (t: TouchList) => Math.hypot(t[0]!.clientX - t[1]!.clientX, t[0]!.clientY - t[1]!.clientY);
    const onTouchStart = (e: TouchEvent) => e.touches.length === 2 && (pinch = span(e.touches));
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinch) return;
      const s = span(e.touches);
      dist.current = clamp(dist.current * (pinch / s));
      pinch = s;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const p = live.player;
    focus.current.lerp(tmp.current.set(p.x, 0, p.z), 1 - Math.exp(-dt * 6));
    // Portrait phones see less width at the same FOV; pull back so the street stays in view.
    const d = dist.current * (size.width < size.height ? 1.45 : 1);
    const { pitch, yaw } = CAMERA;
    camera.position.set(
      focus.current.x + d * Math.cos(pitch) * Math.sin(yaw),
      d * Math.sin(pitch),
      focus.current.z + d * Math.cos(pitch) * Math.cos(yaw),
    );
    camera.lookAt(focus.current.x, 1, focus.current.z);
    live.cameraYaw = yaw;

    cutawayUniforms.uBBCamera.value.copy(camera.position);
    cutawayUniforms.uBBPlayer.value.set(p.x, 1, p.z);

    updateEdgeArrow(camera, size);
  });
  return null;
}

const ndc = new THREE.Vector3();
/** U4: point at the nearest off-screen musician from the screen edge. */
function updateEdgeArrow(camera: THREE.Camera, size: { width: number; height: number }) {
  const el = live.arrow;
  if (!el) return;
  const e = encounters[0];
  if (!e) return void (el.style.display = 'none');
  ndc.set(e.at[0], 1.5, e.at[1]).project(camera);
  const onScreen = Math.abs(ndc.x) < 0.9 && Math.abs(ndc.y) < 0.85 && ndc.z < 1;
  if (onScreen) return void (el.style.display = 'none');
  const behind = ndc.z > 1;
  let ax = behind ? -ndc.x : ndc.x;
  let ay = behind ? -ndc.y : ndc.y;
  const k = 0.88 / Math.max(Math.abs(ax), Math.abs(ay));
  ax *= k;
  ay *= k;
  const x = ((ax + 1) / 2) * size.width;
  const y = ((1 - ay) / 2) * size.height;
  el.style.display = 'block';
  el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${Math.atan2(-ay, ax)}rad)`;
}
