import { describe, expect, it } from 'vitest';
import { WorldDef } from '@bb/schema';
import level01 from '../../../assets/data/worlds/level-01.json';
import { createMapProjection, generateLots, layoutWorld, resolveCircle, resolvePoint } from '../src';

const world = WorldDef.parse(level01);

describe('level-01 world data', () => {
  it('validates against the schema', () => {
    expect(world.blocks).toHaveLength(3);
    expect(world.blocks[0]).toHaveLength(4);
  });

  it('rejects a lot that overflows its block', () => {
    const bad = structuredClone(level01) as any;
    bad.blocks[0][1].lots[0].rect = [8, 0, 7, 6];
    expect(WorldDef.safeParse(bad).success).toBe(false);
  });
});

describe('generateLots', () => {
  it('is deterministic for the same seed', () => {
    const block = world.blocks[1]![0]!;
    expect(generateLots(block, world.blockSize)).toEqual(generateLots(block, world.blockSize));
  });

  it('covers every interior tile exactly once', () => {
    const [bw, bd] = world.blockSize;
    for (const row of world.blocks)
      for (const block of row) {
        const count = Array(bw * bd).fill(0);
        for (const { rect: [x, z, w, d] } of generateLots(block, world.blockSize))
          for (let j = z; j < z + d; j++) for (let i = x; i < x + w; i++) count[j * bw + i]++;
        expect(count.every((n) => n === 1)).toBe(true);
      }
  });

  it('respects maxStories (W11)', () => {
    const block = world.blocks[2]![1]!;
    for (const lot of generateLots(block, world.blockSize)) if (lot.kind === 'building') expect(lot.stories).toBeLessThanOrEqual(3);
  });
});

describe('layoutWorld', () => {
  const layout = layoutWorld(world);

  it('keeps every block inside the world bounds', () => {
    for (const b of layout.blocks) {
      expect(b.outer.x).toBeGreaterThanOrEqual(0);
      expect(b.outer.x + b.outer.w).toBeLessThanOrEqual(layout.bounds.w);
      expect(b.outer.z + b.outer.d).toBeLessThanOrEqual(layout.bounds.d);
    }
  });

  it('puts spawn and encounters on walkable ground, not inside buildings', () => {
    const points = [world.spawn.position, ...world.encounters.map((e) => e.position)].map((p) => resolvePoint(layout, p));
    for (const [x, z] of points) {
      const inside = layout.colliders.some((r) => x > r.x && x < r.x + r.w && z > r.z && z < r.z + r.d);
      expect(inside).toBe(false);
    }
  });

  it('places the school and music landmarks with roof signs (W10)', () => {
    const signs = layout.blocks.flatMap((b) => b.lots).flatMap((l) => (l.kind === 'building' && l.roofSign ? [l.roofSign] : []));
    expect(signs).toEqual(expect.arrayContaining(['SCHOOL', 'VINYL', 'HOME']));
  });
});

describe('resolveCircle', () => {
  const bounds = { x: 0, z: 0, w: 100, d: 100 };
  const wall = { x: 10, z: 10, w: 10, d: 10 };

  it('pushes a circle out of a rect edge', () => {
    const [x] = resolveCircle(9.8, 15, 0.5, [wall], bounds);
    expect(x).toBeCloseTo(9.5);
  });

  it('exits through the nearest edge when the centre is inside', () => {
    const [, z] = resolveCircle(15, 19, 0.5, [wall], bounds);
    expect(z).toBeCloseTo(20.5);
  });
});

describe('map projection', () => {
  it('round-trips world → map → world, with rotation', () => {
    const proj = createMapProjection({ x: 0, z: 0, w: 200, d: 100 }, { w: 160, h: 160 }, Math.PI / 4);
    const [mx, my] = proj.toMap(37, 81);
    const [x, z] = proj.toWorld(mx, my);
    expect(x).toBeCloseTo(37);
    expect(z).toBeCloseTo(81);
  });
});
