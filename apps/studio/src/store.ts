import { create } from 'zustand';
import type { CharacterDef, Rendition } from '@bb/schema';
import type { Pose } from '@bb/characters';
import { characters } from './data';

export type View = Rendition | 'both';
const DRAFT_KEY = 'bb-workshop-drafts-v1';

interface Draft {
  /** The file contents the draft started from. If the file changes, the file wins. */
  base: string;
  def: CharacterDef;
}

function loadDrafts(): Record<string, Draft> {
  try {
    const all = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as Record<string, Draft>;
    // Drop drafts whose file has since changed (e.g. Claude edited it).
    return Object.fromEntries(Object.entries(all).filter(([id, d]) => JSON.stringify(characters.find((c) => c.id === id)) === d.base));
  } catch {
    return {};
  }
}

interface State {
  selected: string;
  drafts: Record<string, Draft>;
  pose: Pose;
  view: View;
  turntable: boolean;
  refMode: 'side' | 'overlay' | 'off';
  refOpacity: number;
  refImage: string | null;
  select: (id: string) => void;
  update: (fn: (def: CharacterDef) => void) => void;
  reset: () => void;
  set: (p: Partial<Pick<State, 'pose' | 'view' | 'turntable' | 'refMode' | 'refOpacity' | 'refImage'>>) => void;
}

export const useStudio = create<State>((set, get) => ({
  selected: characters.find((c) => c.id === '01-rap')?.id ?? characters[0]!.id,
  drafts: loadDrafts(),
  pose: 'apose',
  view: 'hero',
  turntable: false,
  refMode: 'side',
  refOpacity: 0.45,
  refImage: null,
  select: (selected) => set({ selected, refImage: null }),
  update: (fn) => {
    const { selected, drafts } = get();
    const file = characters.find((c) => c.id === selected)!;
    const def = structuredClone(drafts[selected]?.def ?? file);
    fn(def);
    const next = { ...drafts, [selected]: { base: JSON.stringify(file), def } };
    set({ drafts: next });
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  },
  reset: () => {
    const { selected, drafts } = get();
    const next = { ...drafts };
    delete next[selected];
    set({ drafts: next });
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
  },
  set: (p) => set(p),
}));

/** The character as currently edited (draft if any, else the file). */
export function useCurrent(): { def: CharacterDef; dirty: boolean } {
  const selected = useStudio((s) => s.selected);
  const draft = useStudio((s) => s.drafts[selected]);
  const file = characters.find((c) => c.id === selected)!;
  return { def: draft?.def ?? file, dirty: !!draft };
}
