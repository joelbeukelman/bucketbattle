import { z } from 'zod';

/**
 * A character is data: proportions + palette + one choice per part slot (CLAUDE.md non-negotiable 1).
 * `packages/characters` turns it into a hard-faceted mesh (C7) in either rendition (ADR-0002).
 * Colors are hex strings. Part kinds are closed enums so a typo fails validation, not silently.
 */
const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'expected #rrggbb');

export const HairKind = z.enum(['none', 'buzz', 'twists', 'long-straight', 'dreads-up', 'braids']);
export const HatKind = z.enum(['none', 'snapback-back', 'beanie', 'cowboy', 'shako', 'headband']);
export const TopKind = z.enum(['hoodie', 'tee', 'flannel-open', 'bomber', 'colorblock-jacket', 'band-jacket']);
export const BottomKind = z.enum(['shorts', 'baggy-shorts', 'skinny-jeans', 'cargo-pants', 'trousers']);
export const SockKind = z.enum(['none', 'tube', 'striped']);
export const ShoeKind = z.enum(['chunky-sneakers', 'hi-tops', 'work-boots', 'dress-shoes']);
export const AccessoryKind = z.enum(['chain', 'sunglasses', 'backpack', 'suspenders', 'wristbands', 'earrings', 'sash', 'patches']);
export const InstrumentKind = z.enum(['none', 'snare', 'marching-snare', 'bucket-stack', 'double-bucket', 'practice-pad']);

export const CharacterDef = z.object({
  id: z.string().regex(/^\d{2}-[a-z0-9-]+$/),
  name: z.string(),
  genre: z.string(),
  body: z.object({
    /** Standing height of the hero rendition in metres (teens ~1.4–1.9). */
    height: z.number().min(1.2).max(2.1),
    /** 1 = default big stylized head; >1 bigger. */
    headScale: z.number().min(0.7).max(1.5).default(1),
    /** Limb thickness multiplier. Lanky kids are < 1. */
    build: z.number().min(0.6).max(1.6).default(1),
    shoulders: z.number().min(0.7).max(1.4).default(1),
    /** Leg share of height multiplier. */
    legs: z.number().min(0.8).max(1.25).default(1),
    earScale: z.number().min(0.5).max(1.8).default(1),
  }),
  skin: Hex,
  face: z
    .object({
      brows: Hex.default('#1d1a19'),
      /** 0 = wide open, 1 = eyes half covered (the deadpan heavy-lid look). */
      lids: z.number().min(0).max(1).default(0.45),
      beard: z.boolean().default(false),
    })
    .default({}),
  hair: z.object({ kind: HairKind, color: Hex }),
  hat: z.object({ kind: HatKind, color: Hex, color2: Hex.optional() }),
  top: z.object({ kind: TopKind, color: Hex, color2: Hex.optional(), color3: Hex.optional(), under: Hex.optional() }),
  bottom: z.object({ kind: BottomKind, color: Hex, color2: Hex.optional() }),
  socks: z.object({ kind: SockKind, color: Hex, color2: Hex.optional(), color3: Hex.optional() }),
  shoes: z.object({ kind: ShoeKind, color: Hex, color2: Hex.optional(), sole: Hex.optional() }),
  accessories: z.array(z.object({ kind: AccessoryKind, color: Hex, color2: Hex.optional() })).default([]),
  instrument: z.object({ kind: InstrumentKind, color: Hex, color2: Hex.optional() }),
  /** Concept image this model is matched against in the studio (repo-relative). */
  reference: z.string().optional(),
  /** Change log, newest first. Claude appends an entry for every requested change. */
  history: z.array(z.object({ date: z.string(), note: z.string() })).default([]),
});
export type CharacterDef = z.infer<typeof CharacterDef>;
export type CharacterDefInput = z.input<typeof CharacterDef>;
export type Rendition = 'hero' | 'map';
