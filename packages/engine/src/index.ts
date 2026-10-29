/**
 * Shared look settings for game and studio, so what the studio shows is what ships
 * (character-studio skill). W4: warm key light, cool sky fill.
 */
export const LIGHTING = {
  hemisphere: { sky: '#dce6f2', ground: '#8c8170', intensity: 1.1 },
  sun: { color: '#ffdcae', intensity: 2.4, offset: [-40, 55, 30] as const },
  background: '#d9d4ca',
} as const;
