import type { StreetClass, WorldDef, WorldPoint } from '@bb/schema';
import { generateLots } from './generate';
import { createRng, hashSeed } from './rng';
import type { BlockLayout, Marking, Rect, ResolvedLot, RoofProp, StreetLayout, Tree, WorldLayout } from './types';

export const STREET_WIDTH: Record<StreetClass, number> = { avenue: 16, street: 10 };
export const STORY_HEIGHT = 3.2;
export const CURB_HEIGHT = 0.15;

/** Turn a WorldDef into metres: streets, block islands, lots, markings, props. Pure + deterministic. */
export function layoutWorld(world: WorldDef): WorldLayout {
  const { tileSize: tile, sidewalk } = world;
  const [bwTiles, bdTiles] = world.blockSize;
  const blockW = bwTiles * tile + sidewalk * 2;
  const blockD = bdTiles * tile + sidewalk * 2;
  const rows = world.blocks.length;
  const cols = world.blocks[0]!.length;

  // Street positions along each axis: street, block, street, block, …, street.
  const colStreetX = offsets(world.streets.columns, blockW);
  const rowStreetZ = offsets(world.streets.rows, blockD);
  const width = colStreetX.end;
  const depth = rowStreetZ.end;
  const bounds: Rect = { x: 0, z: 0, w: width, d: depth };

  const streets: StreetLayout[] = [
    ...world.streets.columns.map((cls, i): StreetLayout => {
      const w = STREET_WIDTH[cls];
      return { axis: 'column', index: i, class: cls, width: w, rect: { x: colStreetX.starts[i]!, z: 0, w, d: depth } };
    }),
    ...world.streets.rows.map((cls, i): StreetLayout => {
      const w = STREET_WIDTH[cls];
      return { axis: 'row', index: i, class: cls, width: w, rect: { x: 0, z: rowStreetZ.starts[i]!, w: width, d: w } };
    }),
  ];

  const intersections: Rect[] = [];
  for (const c of streets.filter((s) => s.axis === 'column'))
    for (const r of streets.filter((s) => s.axis === 'row'))
      intersections.push({ x: c.rect.x, z: r.rect.z, w: c.width, d: r.width });

  const blocks: BlockLayout[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const def = world.blocks[r]![c]!;
      const outer: Rect = { x: colStreetX.starts[c]! + STREET_WIDTH[world.streets.columns[c]!], z: rowStreetZ.starts[r]! + STREET_WIDTH[world.streets.rows[r]!], w: blockW, d: blockD };
      const interior: Rect = { x: outer.x + sidewalk, z: outer.z + sidewalk, w: bwTiles * tile, d: bdTiles * tile };
      const lots = generateLots(def, world.blockSize).map((lot, i): ResolvedLot => {
        const [lx, lz, lw, ld] = lot.rect;
        const rect = { x: interior.x + lx * tile, z: interior.z + lz * tile, w: lw * tile, d: ld * tile };
        const seed = hashSeed(def.seed, i);
        if (lot.kind === 'open') return { kind: 'open', rect, feature: lot.feature, seed };
        return {
          kind: 'building',
          rect,
          stories: lot.stories,
          height: lot.stories * STORY_HEIGHT,
          theme: def.theme,
          landmark: lot.landmark,
          roofSign: lot.roofSign,
          tint: createRng(seed).next(),
          seed,
        };
      });
      blocks.push({ row: r, col: c, def, outer, interior, lots });
    }
  }

  const roofProps: RoofProp[] = [];
  const trees: Tree[] = [];
  const colliders: Rect[] = [];
  for (const b of blocks) {
    for (const lot of b.lots) {
      if (lot.kind === 'building') {
        colliders.push(lot.rect);
        roofProps.push(...roofPropsFor(lot.rect, lot.height, lot.stories, lot.seed, !!lot.roofSign));
      } else if (lot.feature === 'park' || lot.feature === 'garden' || lot.feature === 'plaza') {
        trees.push(...treesFor(lot.rect, lot.feature, lot.seed));
      }
    }
    trees.push(...sidewalkTrees(b, sidewalk));
  }

  return { bounds, blocks, streets, intersections, markings: markingsFor(streets, intersections), roofProps, trees, colliders };
}

/** Resolve a WorldPoint (absolute or block-anchored) to world metres. */
export function resolvePoint(layout: WorldLayout, p: WorldPoint): [number, number] {
  if (Array.isArray(p)) return [p[0], p[1]];
  const [row, col] = p.block;
  const b = layout.blocks.find((bl) => bl.row === row && bl.col === col);
  if (!b) throw new Error(`no block at [${row}, ${col}]`);
  return [b.outer.x + p.offset[0], b.outer.z + p.offset[1]];
}

function offsets(classes: StreetClass[], blockSpan: number) {
  const starts: number[] = [];
  let cursor = 0;
  classes.forEach((cls, i) => {
    starts.push(cursor);
    cursor += STREET_WIDTH[cls] + (i < classes.length - 1 ? blockSpan : 0);
  });
  return { starts, end: cursor };
}

/** Rooftop clutter (W10): AC units, vents, antennas, and NYC water tanks on taller buildings. */
function roofPropsFor(r: Rect, height: number, stories: number, seed: number, hasSign: boolean): RoofProp[] {
  const rng = createRng(hashSeed('roof', seed));
  const props: RoofProp[] = [];
  const margin = 1;
  const area = r.w * r.d;
  const count = Math.min(6, Math.max(1, Math.round(area / 40)));
  for (let i = 0; i < count; i++) {
    const kind = rng.pick(['ac', 'ac', 'vent', 'antenna'] as const);
    const w = kind === 'antenna' ? 0.15 : rng.range(0.8, 1.6);
    const d = kind === 'antenna' ? 0.15 : rng.range(0.8, 1.6);
    const h = kind === 'antenna' ? rng.range(2, 4) : kind === 'vent' ? 0.6 : rng.range(0.6, 1.1);
    // Keep the front strip clear when the building has a roof sign.
    const zMin = r.z + margin + (hasSign ? r.d * 0.45 : 0);
    props.push({ kind, w, d, h, y: height, x: rng.range(r.x + margin, r.x + r.w - margin - w), z: rng.range(zMin, Math.max(zMin, r.z + r.d - margin - d)) });
  }
  if (stories >= 4 && rng.chance(0.6)) {
    props.push({ kind: 'tank', w: 2, d: 2, h: 3.2, y: height, x: rng.range(r.x + margin, r.x + r.w - margin - 2), z: r.z + r.d - margin - 2 });
  }
  return props;
}

function treesFor(r: Rect, feature: string, seed: number): Tree[] {
  const rng = createRng(hashSeed('trees', seed));
  const density = feature === 'park' ? 1 / 30 : feature === 'garden' ? 1 / 45 : 1 / 80;
  const count = Math.round(r.w * r.d * density);
  return Array.from({ length: count }, () => ({
    x: rng.range(r.x + 2, r.x + r.w - 2),
    z: rng.range(r.z + 2, r.z + r.d - 2),
    scale: rng.range(0.8, 1.3),
  }));
}

/** Street trees along the long sidewalks, gently varied per block. */
function sidewalkTrees(b: BlockLayout, sidewalk: number): Tree[] {
  const rng = createRng(hashSeed('street-trees', b.def.seed));
  if (b.def.theme === 'towers' || rng.chance(0.3)) return [];
  const trees: Tree[] = [];
  const spacing = 10;
  for (const z of [b.outer.z + sidewalk / 2, b.outer.z + b.outer.d - sidewalk / 2]) {
    for (let x = b.outer.x + 6; x < b.outer.x + b.outer.w - 4; x += spacing) {
      if (rng.chance(0.75)) trees.push({ x: x + rng.range(-1, 1), z, scale: rng.range(0.55, 0.75) });
    }
  }
  return trees;
}

/** Lane dashes and center lines between intersections; crosswalks on every side of every intersection (W12). */
function markingsFor(streets: StreetLayout[], intersections: Rect[]): Marking[] {
  const out: Marking[] = [];
  const line = 0.2;
  for (const s of streets) {
    const along = s.axis === 'column' ? 'z' : 'x';
    const crossing = intersections
      .filter((i) => (s.axis === 'column' ? i.x === s.rect.x : i.z === s.rect.z))
      .map((i) => (along === 'z' ? [i.z, i.z + i.d] : [i.x, i.x + i.w]) as [number, number])
      .sort((a, b) => a[0] - b[0]);
    const center = s.axis === 'column' ? s.rect.x + s.width / 2 : s.rect.z + s.width / 2;
    for (let k = 0; k < crossing.length - 1; k++) {
      const from = crossing[k]![1] + 3.5;
      const to = crossing[k + 1]![0] - 3.5;
      if (to <= from) continue;
      // Double yellow center line.
      for (const off of [-0.2, 0.2]) out.push(seg(s.axis, center + off - line / 2, from, to, line, 'center'));
      // White lane dashes on avenues (4 lanes → dashes at quarter widths).
      if (s.class === 'avenue') {
        for (const off of [-s.width / 4, s.width / 4]) {
          for (let p = from; p + 3 < to; p += 7) out.push(seg(s.axis, center + off - line / 2, p, p + 3, line, 'dash'));
        }
      }
    }
  }
  for (const i of intersections) {
    // Zebra stripes on all four approaches.
    const stripe = 0.5;
    const len = 3;
    for (let x = i.x + 0.5; x + stripe <= i.x + i.w - 0.5; x += stripe * 2) {
      out.push({ kind: 'crosswalk', x, z: i.z - len - 0.3, w: stripe, d: len });
      out.push({ kind: 'crosswalk', x, z: i.z + i.d + 0.3, w: stripe, d: len });
    }
    for (let z = i.z + 0.5; z + stripe <= i.z + i.d - 0.5; z += stripe * 2) {
      out.push({ kind: 'crosswalk', x: i.x - len - 0.3, z, w: len, d: stripe });
      out.push({ kind: 'crosswalk', x: i.x + i.w + 0.3, z, w: len, d: stripe });
    }
  }
  return out;
}

function seg(axis: 'column' | 'row', across: number, from: number, to: number, thickness: number, kind: Marking['kind']): Marking {
  return axis === 'column'
    ? { kind, x: across, z: from, w: thickness, d: to - from }
    : { kind, x: from, z: across, w: to - from, d: thickness };
}
