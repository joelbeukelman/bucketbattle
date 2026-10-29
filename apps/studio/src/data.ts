import { CharacterDef } from '@bb/schema';

/**
 * Character files and concept crops, bundled at build time. In dev, editing a JSON file
 * (by hand or by Claude) hot-reloads the studio with the new model.
 */
const files = import.meta.glob('../../../assets/data/characters/*.json', { eager: true, import: 'default' });
const refs = import.meta.glob('../../../docs/references/images/char-*.jpg', { eager: true, query: '?url', import: 'default' });

export const characters: CharacterDef[] = Object.values(files)
  .map((raw) => CharacterDef.parse(raw))
  .sort((a, b) => a.id.localeCompare(b.id));

/** Concept images by repo-relative path (`docs/references/images/…`). */
export const referenceUrls: Record<string, string> = Object.fromEntries(
  Object.entries(refs).map(([path, url]) => [path.replace(/^(\.\.\/)+/, ''), url as string]),
);

/** Every concept image for a character (turnaround, front crop, A-pose, expressions…). */
export function imagesFor(id: string) {
  return Object.entries(referenceUrls)
    .filter(([path]) => path.includes(`/char-${id}-`))
    .map(([path, url]) => ({ path, url, label: path.split(`char-${id}-`)[1]!.replace('.jpg', '') }))
    .sort((a, b) => (a.label === 'front' ? -1 : b.label === 'front' ? 1 : a.label.localeCompare(b.label)));
}
