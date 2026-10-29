import { useEffect, type CSSProperties } from 'react';
import { encounters, world } from '../world-data';
import { live, useGame } from '../store';
import { MapView } from './MapView';
import './hud.css';

/** U4: stats on the top edge, actions bottom-right in thumb reach (U2), world in the middle. */
export function Hud() {
  const nearby = useGame((s) => s.nearbyEncounter);
  const mapOpen = useGame((s) => s.mapOpen);
  const toast = useGame((s) => s.toast);
  const encounter = encounters.find((e) => e.id === nearby);

  const interact = () => {
    if (!encounter) return;
    useGame.getState().showToast(`${encounter.label}: battle arrives in Phase 3`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'e' || k === ' ') interact();
      if (k === 'm' || k === 'b') useGame.getState().toggleMap();
      if (k === 'escape') useGame.getState().toggleMap(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-chip">{world.name}</div>
        <div className="hud-minimap">
          <MapView size={window.innerWidth < 500 ? 104 : 150} />
        </div>
      </div>

      <div className="hud-arrow" ref={(el) => void (live.arrow = el)} />

      {encounter && (
        <div className="hud-prompt">
          <strong>{encounter.label}</strong> is playing. Tap <span className="key">A</span> to battle
        </div>
      )}
      {toast && <div className="hud-toast">{toast}</div>}

      <div className="hud-buttons">
        <button className="hud-btn hud-btn-b" onPointerDown={(e) => (e.stopPropagation(), useGame.getState().toggleMap())} aria-label="Map">
          B
        </button>
        <button
          className="hud-btn hud-btn-a"
          style={{ '--glow': encounter ? 1 : 0 } as CSSProperties}
          disabled={!encounter}
          onPointerDown={(e) => (e.stopPropagation(), interact())}
          aria-label="Battle"
        >
          A
        </button>
      </div>

      {mapOpen && (
        <div className="hud-fullmap" onPointerDown={() => useGame.getState().toggleMap(false)}>
          <div className="hud-fullmap-card" onPointerDown={(e) => e.stopPropagation()}>
            <MapView size={Math.min(window.innerWidth, window.innerHeight) - 64} full />
            <p>Tap the map to walk there · B / M to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
