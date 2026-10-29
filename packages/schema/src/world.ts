import { z } from 'zod';

/** Asset/entity IDs follow `<kind>.<family>.<name>` (CLAUDE.md conventions). */
export const AssetId = z.string().regex(/^[a-z]+(\.[a-z0-9-]+)+$/, 'expected <kind>.<family>.<name>');

/** Block themes are shared by every city; a city kit decides how each one looks (ADR-0003). */
export const BlockTheme = z.enum([
  'home',
  'houses',
  'apartments',
  'shops',
  'school',
  'towers',
  'park',
  'garden',
  'court',
  'skate',
  'plaza',
]);
export type BlockTheme = z.infer<typeof BlockTheme>;

export const OpenFeature = z.enum(['court', 'skate', 'garden', 'plaza', 'park']);
export type OpenFeature = z.infer<typeof OpenFeature>;

export const LandmarkKind = z.enum(['home', 'school', 'vinyl-shop', 'music-store']);
export type LandmarkKind = z.infer<typeof LandmarkKind>;

/** Rectangle in tiles, relative to the block interior (inside the sidewalk). [x, z, w, d] */
export const TileRect = z.tuple([z.number().int().min(0), z.number().int().min(0), z.number().int().min(1), z.number().int().min(1)]);
export type TileRect = z.infer<typeof TileRect>;

export const LotDef = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('building'),
    rect: TileRect,
    stories: z.number().int().min(1).max(40),
    landmark: LandmarkKind.optional(),
    /** Roof signage readable from the overview camera (W10). */
    roofSign: z.string().max(12).optional(),
  }),
  z.object({
    kind: z.literal('open'),
    rect: TileRect,
    feature: OpenFeature,
  }),
]);
export type LotDef = z.infer<typeof LotDef>;

export const BlockDef = z.object({
  theme: BlockTheme,
  seed: z.number().int(),
  /** Height zoning (W11). Generator never exceeds it. */
  maxStories: z.number().int().min(1).max(40).optional(),
  /** Authored lots are kept as-is; the generator fills the remaining space. */
  lots: z.array(LotDef).default([]),
});
export type BlockDef = z.infer<typeof BlockDef>;

export const StreetClass = z.enum(['avenue', 'street']);
export type StreetClass = z.infer<typeof StreetClass>;

/**
 * A point on the map in metres. Either absolute world (x, z), or anchored to a block:
 * `offset` is measured from that block's outer (sidewalk) min-x/min-z corner and may be
 * negative to reach into the surrounding street. Anchors survive street-width changes.
 */
export const WorldPoint = z.union([
  z.tuple([z.number(), z.number()]),
  z.object({ block: z.tuple([z.number().int().min(0), z.number().int().min(0)]), offset: z.tuple([z.number(), z.number()]) }),
]);
export type WorldPoint = z.infer<typeof WorldPoint>;

export const EncounterDef = z.object({
  id: z.string(),
  musicianId: AssetId,
  label: z.string(),
  position: WorldPoint,
  facing: z.number().default(0),
  radius: z.number().positive().default(4),
  levelRequired: z.number().int().min(0).default(0),
});
export type EncounterDef = z.infer<typeof EncounterDef>;

export const WorldDef = z
  .object({
    id: z.string(),
    name: z.string(),
    cityKit: AssetId,
    /** Metres per tile. Change only via ADR. */
    tileSize: z.number().positive().default(4),
    /** Block interior size in tiles (excluding sidewalk). */
    blockSize: z.tuple([z.number().int().min(2), z.number().int().min(2)]),
    /** Sidewalk width in metres around every block. */
    sidewalk: z.number().positive().default(3),
    /** Street class for each grid line: columns run along z, rows along x. Length = blocks + 1. */
    streets: z.object({ columns: z.array(StreetClass), rows: z.array(StreetClass) }),
    /** blocks[row][col] */
    blocks: z.array(z.array(BlockDef).min(1)).min(1),
    spawn: z.object({ position: WorldPoint, facing: z.number().default(0) }),
    encounters: z.array(EncounterDef).default([]),
  })
  .superRefine((w, ctx) => {
    const cols = w.blocks[0]!.length;
    if (w.blocks.some((r) => r.length !== cols)) ctx.addIssue({ code: 'custom', message: 'all block rows need the same length' });
    if (w.streets.columns.length !== cols + 1) ctx.addIssue({ code: 'custom', message: `streets.columns needs ${cols + 1} entries` });
    if (w.streets.rows.length !== w.blocks.length + 1) ctx.addIssue({ code: 'custom', message: `streets.rows needs ${w.blocks.length + 1} entries` });
    const [bw, bd] = w.blockSize;
    w.blocks.forEach((row, r) =>
      row.forEach((b, c) =>
        b.lots.forEach((lot, i) => {
          const [x, z, lw, ld] = lot.rect;
          if (x + lw > bw || z + ld > bd)
            ctx.addIssue({ code: 'custom', path: ['blocks', r, c, 'lots', i], message: 'lot exceeds block interior' });
        }),
      ),
    );
  });
export type WorldDef = z.infer<typeof WorldDef>;
export type WorldDefInput = z.input<typeof WorldDef>;
