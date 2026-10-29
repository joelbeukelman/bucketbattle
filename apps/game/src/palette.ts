import type { BlockTheme, OpenFeature } from '@bb/schema';

/**
 * Grey-box palette. Grey-box ≠ random: values follow W1 (dark asphalt, light pads),
 * W2 (only musicians are saturated), W10 (roofs darker than walls so roofs read).
 * Move into packages/ui tokens + the kit.nyc CityKitDef when real art lands.
 */
export const palette = {
  background: '#d9d4ca',
  asphalt: '#3d3f44',
  sidewalk: '#bdb8ad',
  lotGround: '#a9a499',
  roof: '#77767a',
  center: '#e3c04a',
  paint: '#e8e5dc',
  trunk: '#6b5444',
  canopy: '#64805a',
  player: '#2fc6b8',
  musician: '#ff7a1a',
  accent: '#ffd23f',
} as const;

export const wallTint: Record<BlockTheme, string> = {
  home: '#d3c3b2',
  houses: '#cfc2b3',
  apartments: '#c4b7aa',
  shops: '#cbc4ba',
  school: '#c79d80',
  towers: '#a4a9ae',
  park: '#c9c6bf',
  garden: '#c9c6bf',
  court: '#c9c6bf',
  skate: '#c9c6bf',
  plaza: '#c9c6bf',
};

export const openGround: Record<OpenFeature, string> = {
  park: '#7f9b6c',
  garden: '#8ea672',
  court: '#5c8a73',
  skate: '#a19e98',
  plaza: '#c2bbad',
};

export const landmarkSign: Record<string, string> = {
  school: '#2f4b7c',
  'vinyl-shop': '#c2185b',
  'music-store': '#6a1b9a',
  home: '#3d6b4f',
};
