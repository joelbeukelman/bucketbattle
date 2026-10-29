import type { BlockDef, BlockTheme, LotDef, OpenFeature } from '@bb/schema';
import { createRng, hashSeed, type Rng } from './rng';

type TileLot = LotDef;

const OPEN_THEMES: Partial<Record<BlockTheme, OpenFeature>> = {
  park: 'park',
  garden: 'garden',
  court: 'court',
  skate: 'skate',
  plaza: 'plaza',
};

/** Story ranges per theme for generated buildings (capped by BlockDef.maxStories, W11). */
const STORIES: Partial<Record<BlockTheme, [number, number]>> = {
  home: [2, 3],
  houses: [2, 3],
  shops: [2, 4],
  apartments: [4, 6],
  school: [3, 4],
  towers: [9, 16],
};

/** Lot frontage widths in tiles, per theme. */
const FRONTAGE: Partial<Record<BlockTheme, [number, number]>> = {
  home: [2, 3],
  houses: [2, 3],
  shops: [2, 3],
  apartments: [3, 4],
  school: [3, 5],
  towers: [3, 5],
};

/**
 * Fill a block's interior with lots. Authored lots are kept; every free tile is
 * covered by a generated lot so blocks never have holes. Deterministic per seed.
 */
export function generateLots(block: BlockDef, blockSize: readonly [number, number]): TileLot[] {
  const [bw, bd] = blockSize;
  const rng = createRng(hashSeed('lots', block.seed));
  const used: boolean[][] = Array.from({ length: bd }, () => Array<boolean>(bw).fill(false));
  for (const lot of block.lots) mark(used, lot.rect);

  const out: TileLot[] = [...block.lots];
  const openFeature = OPEN_THEMES[block.theme];
  for (const [x, z, w, d] of freeRects(used)) {
    if (openFeature) out.push({ kind: 'open', feature: openFeature, rect: [x, z, w, d] });
    else out.push(...subdivide(block, [x, z, w, d], rng));
  }
  return out;
}

/** Split a free rectangle into street-facing building lots (back-to-back when deep enough). */
function subdivide(block: BlockDef, [x, z, w, d]: [number, number, number, number], rng: Rng): TileLot[] {
  const lots: TileLot[] = [];
  const alongX = w >= d;
  const length = alongX ? w : d;
  const depth = alongX ? d : w;
  const depthSplits = depth >= 4 ? [Math.floor(depth / 2), depth - Math.floor(depth / 2)] : [depth];
  const [fMin, fMax] = FRONTAGE[block.theme] ?? [2, 3];
  const [sMin, sMax] = STORIES[block.theme] ?? [2, 4];
  const cap = block.maxStories ?? 40;

  let offDepth = 0;
  for (const dd of depthSplits) {
    let offLen = 0;
    while (offLen < length) {
      const remaining = length - offLen;
      let span = Math.min(rng.int(fMin, fMax), remaining);
      // Avoid leaving a sliver narrower than the minimum frontage.
      if (remaining - span > 0 && remaining - span < fMin) span = remaining;
      const rect: [number, number, number, number] = alongX
        ? [x + offLen, z + offDepth, span, dd]
        : [x + offDepth, z + offLen, dd, span];
      lots.push({ kind: 'building', rect, stories: Math.min(cap, rng.int(sMin, sMax)) });
      offLen += span;
    }
    offDepth += dd;
  }
  return lots;
}

function mark(used: boolean[][], [x, z, w, d]: readonly number[]) {
  for (let j = z!; j < z! + d!; j++) for (let i = x!; i < x! + w!; i++) used[j]![i] = true;
}

/** Greedy maximal rectangles over the unused tiles. */
function freeRects(used: boolean[][]): [number, number, number, number][] {
  const rects: [number, number, number, number][] = [];
  const bd = used.length;
  const bw = used[0]?.length ?? 0;
  for (let z = 0; z < bd; z++) {
    for (let x = 0; x < bw; x++) {
      if (used[z]![x]) continue;
      let w = 0;
      while (x + w < bw && !used[z]![x + w]) w++;
      let d = 1;
      while (z + d < bd && used[z + d]!.slice(x, x + w).every((u) => !u)) d++;
      mark(used, [x, z, w, d]);
      rects.push([x, z, w, d]);
    }
  }
  return rects;
}
