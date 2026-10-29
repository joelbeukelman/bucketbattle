import type { Rect } from './types';

/**
 * The single world → map projection shared by the minimap and the full map (world-builder
 * skill: never duplicate this math). `rotation` (radians) lets the map turn to match the
 * camera's yaw so "up" on the map is "away from the camera" in 3D.
 */
export function createMapProjection(bounds: Rect, size: { w: number; h: number }, rotation = 0, padding = 8) {
  const cx = bounds.x + bounds.w / 2;
  const cz = bounds.z + bounds.d / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  // Fit the rotated bounds inside the map.
  const rw = Math.abs(bounds.w * cos) + Math.abs(bounds.d * sin);
  const rd = Math.abs(bounds.w * sin) + Math.abs(bounds.d * cos);
  const scale = Math.min((size.w - padding * 2) / rw, (size.h - padding * 2) / rd);

  const toMap = (x: number, z: number): [number, number] => {
    const dx = x - cx;
    const dz = z - cz;
    return [size.w / 2 + (dx * cos - dz * sin) * scale, size.h / 2 + (dx * sin + dz * cos) * scale];
  };
  const toWorld = (mx: number, my: number): [number, number] => {
    const dx = (mx - size.w / 2) / scale;
    const dy = (my - size.h / 2) / scale;
    return [cx + dx * cos + dy * sin, cz - dx * sin + dy * cos];
  };
  return { toMap, toWorld, scale, rotation };
}
export type MapProjection = ReturnType<typeof createMapProjection>;
