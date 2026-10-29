import type { Rect } from './types';

/**
 * Push a circle (the player's footprint) out of solid rectangles and keep it in bounds.
 * Good enough for a walking character among static buildings; swap to Rapier when we
 * need dynamic bodies (see PROGRESS 2026-10-29, ADR-0001).
 */
export function resolveCircle(x: number, z: number, radius: number, solids: readonly Rect[], bounds: Rect): [number, number] {
  let px = x;
  let pz = z;
  for (const r of solids) {
    const cx = Math.max(r.x, Math.min(px, r.x + r.w));
    const cz = Math.max(r.z, Math.min(pz, r.z + r.d));
    const dx = px - cx;
    const dz = pz - cz;
    const dist2 = dx * dx + dz * dz;
    if (dist2 >= radius * radius) continue;
    if (dist2 > 1e-9) {
      const dist = Math.sqrt(dist2);
      px = cx + (dx / dist) * radius;
      pz = cz + (dz / dist) * radius;
    } else {
      // Centre is inside the rect: exit through the nearest edge.
      const exits = [
        [r.x - radius, pz, px - r.x],
        [r.x + r.w + radius, pz, r.x + r.w - px],
        [px, r.z - radius, pz - r.z],
        [px, r.z + r.d + radius, r.z + r.d - pz],
      ] as const;
      const best = exits.reduce((a, b) => (b[2] < a[2] ? b : a));
      px = best[0];
      pz = best[1];
    }
  }
  px = Math.max(bounds.x + radius, Math.min(px, bounds.x + bounds.w - radius));
  pz = Math.max(bounds.z + radius, Math.min(pz, bounds.z + bounds.d - radius));
  return [px, pz];
}
