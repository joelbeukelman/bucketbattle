import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';

declare global {
  interface Window {
    __bbStats?: { calls: number; triangles: number; fps: number };
  }
}

/** Exposes renderer stats for the visual-review skill (checks against ARCHITECTURE §7). */
export function Stats() {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, dt) => {
    acc.current.frames++;
    acc.current.time += dt;
    if (acc.current.time < 1) return;
    window.__bbStats = { calls: gl.info.render.calls, triangles: gl.info.render.triangles, fps: Math.round(acc.current.frames / acc.current.time) };
    acc.current = { frames: 0, time: 0 };
  });
  return null;
}
