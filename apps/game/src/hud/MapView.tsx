import { useEffect, useMemo, useRef } from 'react';
import { createMapProjection } from '@bb/world';
import { encounters, layout } from '../world-data';
import { landmarkSign, openGround, palette, wallTint } from '../palette';
import { live, useGame } from '../store';

/**
 * One 2D map renderer for both the minimap and the full map (ARCHITECTURE §4.4). Drawn from
 * WorldLayout, not a second 3D render. Rotated to the camera yaw so map-up = screen-up,
 * which turns the grid into the same diamond the player sees in 3D.
 */
export function MapView({ size, full = false }: { size: number; full?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const discovered = useGame((s) => s.discovered);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const proj = useMemo(() => createMapProjection(layout.bounds, { w: size, h: size }, live.cameraYaw, full ? 24 : 6), [size, full]);

  // Static layer: redrawn only when the discovered set changes.
  const staticLayer = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const poly = (r: { x: number; z: number; w: number; d: number }, fill: string) => {
      const pts = [proj.toMap(r.x, r.z), proj.toMap(r.x + r.w, r.z), proj.toMap(r.x + r.w, r.z + r.d), proj.toMap(r.x, r.z + r.d)];
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    };
    poly(layout.bounds, palette.asphalt);
    for (const b of layout.blocks) {
      poly(b.outer, palette.sidewalk);
      for (const lot of b.lots) {
        if (lot.kind === 'open') poly(lot.rect, openGround[lot.feature]);
        else poly({ x: lot.rect.x + 0.4, z: lot.rect.z + 0.4, w: lot.rect.w - 0.8, d: lot.rect.d - 0.8 }, lot.landmark ? landmarkSign[lot.landmark]! : shade(wallTint[lot.theme], lot.stories));
      }
      // Fog of war: undiscovered blocks are under cloud (W8).
      if (!discovered.has(`${b.row},${b.col}`)) poly({ x: b.outer.x - 6, z: b.outer.z - 6, w: b.outer.w + 12, d: b.outer.d + 12 }, 'rgba(246,243,236,0.92)');
    }
    if (full) {
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (const lot of layout.blocks.flatMap((b) => b.lots)) {
        if (lot.kind !== 'building' || !lot.roofSign) continue;
        const [x, y] = proj.toMap(lot.rect.x + lot.rect.w / 2, lot.rect.z + lot.rect.d / 2);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 3;
        ctx.strokeText(lot.roofSign, x, y - 10);
        ctx.fillText(lot.roofSign, x, y - 10);
      }
    }
    return c;
  }, [proj, discovered, size, dpr, full]);

  useEffect(() => {
    let raf = 0;
    const ctx = canvas.current!.getContext('2d')!;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(staticLayer, 0, 0, size, size);
      const pulse = (performance.now() / 600) % 1;
      for (const e of encounters) {
        const [x, y] = proj.toMap(e.at[0], e.at[1]);
        ctx.beginPath();
        ctx.arc(x, y, 4 + pulse * (full ? 12 : 6), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,210,63,${1 - pulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, full ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = palette.musician;
        ctx.fill();
      }
      const { x, z, heading } = live.player;
      const [px, py] = proj.toMap(x, z);
      ctx.save();
      ctx.translate(px, py);
      // Heading is measured in world xz; rotate it into map space.
      ctx.rotate(-heading + proj.rotation + Math.PI);
      ctx.beginPath();
      const s = full ? 9 : 6;
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.7, s * 0.7);
      ctx.lineTo(0, s * 0.3);
      ctx.lineTo(-s * 0.7, s * 0.7);
      ctx.closePath();
      ctx.fillStyle = palette.player;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [staticLayer, proj, size, dpr, full]);

  return (
    <canvas
      ref={canvas}
      width={size * dpr}
      height={size * dpr}
      style={{ width: size, height: size, display: 'block' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!full) return useGame.getState().toggleMap(true);
        // Tap on the full map sets a walking target.
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const [wx, wz] = proj.toWorld(e.clientX - rect.left, e.clientY - rect.top);
        useGame.getState().setTarget([wx, wz]);
        useGame.getState().toggleMap(false);
      }}
    />
  );
}

function shade(hex: string, stories: number) {
  // Taller = darker on the map, a cheap height cue.
  const n = parseInt(hex.slice(1), 16);
  const k = Math.max(0.55, 1 - stories * 0.03);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}
