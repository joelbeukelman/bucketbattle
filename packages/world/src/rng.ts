/** Deterministic PRNG (mulberry32). Same seed → same block, forever (world-builder skill). */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!,
    chance: (p: number) => next() < p,
  };
}
export type Rng = ReturnType<typeof createRng>;

/** Stable sub-seed so adding one consumer doesn't reshuffle another. */
export function hashSeed(...parts: (number | string)[]): number {
  let h = 2166136261;
  for (const p of parts.join('|')) h = Math.imul(h ^ p.charCodeAt(0), 16777619);
  return h >>> 0;
}
