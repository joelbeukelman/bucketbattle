import { create } from 'zustand';

interface GameState {
  /** Tap-to-move destination (world x, z) or null. */
  target: [number, number] | null;
  nearbyEncounter: string | null;
  mapOpen: boolean;
  discovered: Set<string>;
  toast: string | null;
  setTarget: (t: [number, number] | null) => void;
  setNearby: (id: string | null) => void;
  toggleMap: (open?: boolean) => void;
  discover: (keys: string[]) => void;
  showToast: (msg: string) => void;
}

export const useGame = create<GameState>((set, get) => ({
  target: null,
  nearbyEncounter: null,
  mapOpen: false,
  discovered: new Set(),
  toast: null,
  setTarget: (target) => set({ target }),
  setNearby: (nearbyEncounter) => set({ nearbyEncounter }),
  toggleMap: (open) => set({ mapOpen: open ?? !get().mapOpen }),
  discover: (keys) => {
    const cur = get().discovered;
    if (keys.every((k) => cur.has(k))) return;
    set({ discovered: new Set([...cur, ...keys]) });
  },
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => get().toast === toast && set({ toast: null }), 2500);
  },
}));

/**
 * Per-frame values live outside React state so the render loop never triggers re-renders.
 * The scene writes, HUD canvases read in their own rAF loops.
 */
export const live = {
  player: { x: 0, z: 0, heading: 0 },
  cameraYaw: Math.PI / 4,
  arrow: null as HTMLDivElement | null,
};
