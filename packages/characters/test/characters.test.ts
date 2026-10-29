import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { CharacterDef } from '@bb/schema';
import { applyPose, buildCharacter } from '../src';

const dir = 'assets/data/characters';
const defs = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));

describe('character data', () => {
  it('has all seven starter characters', () => expect(defs).toHaveLength(7));
  it.each(defs.map((d) => [d.id, d]))('%s validates', (_, d) => expect(CharacterDef.safeParse(d).success).toBe(true));
});

describe('buildCharacter', () => {
  it.each(defs.map((d) => [d.id, d]))('%s builds within the hero and map budgets', (_, d) => {
    for (const pose of ['apose', 'drum'] as const) {
      const hero = buildCharacter(d, 'hero', pose);
      expect(hero.triangles).toBeLessThanOrEqual(15000);
      expect(hero.height).toBeGreaterThan(1.3);
      const map = buildCharacter(d, 'map', pose);
      expect(map.triangles).toBeLessThanOrEqual(15000);
      expect(map.height).toBeLessThan(hero.height);
    }
  });

  it('names pivots with Mixamo bone names', () => {
    const { root } = buildCharacter(defs[0]);
    expect(root.getObjectByName('mixamorigLeftForeArm')).toBeTruthy();
    expect(root.getObjectByName('mixamorigHead')).toBeTruthy();
  });

  it('poses do not drift over time', () => {
    const { rig } = buildCharacter(defs[1], 'hero', 'drum');
    const y0 = rig.Hips.position.y;
    for (let t = 0; t < 5; t += 0.1) applyPose(rig, 'drum', t);
    applyPose(rig, 'drum', 0);
    expect(rig.Hips.position.y).toBeCloseTo(y0);
  });
});
