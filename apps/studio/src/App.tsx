import { useEffect, useState } from 'react';
import { characters, imagesFor, referenceUrls } from './data';
import { useCurrent, useStudio, type View } from './store';
import { Viewport, stats } from './Viewport';
import { Controls } from './Controls';
import type { Pose } from '@bb/characters';

const POSES: [Pose, string][] = [['apose', 'A-pose'], ['idle', 'Idle'], ['drum', 'Drumming']];
const VIEWS: [View, string][] = [['hero', 'Battle'], ['map', 'Map'], ['both', 'Both']];

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

function Stats() {
  const [s, setS] = useState({ ...stats });
  useEffect(() => {
    const t = setInterval(() => setS({ ...stats }), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="stats" title="Hero rendition budget: 15,000 triangles">
      {s.triangles.toLocaleString()} tris · {s.height.toFixed(2)} m
    </span>
  );
}

function Toolbar() {
  const { pose, view, turntable, refMode, refOpacity, set } = useStudio();
  return (
    <div className="toolbar">
      <Segmented label="Pose" value={pose} options={POSES} onChange={(pose) => set({ pose })} />
      <Segmented label="Rendition" value={view} options={VIEWS} onChange={(view) => set({ view })} />
      <button className={`toggle ${turntable ? 'on' : ''}`} aria-pressed={turntable} onClick={() => set({ turntable: !turntable })}>
        Turntable
      </button>
      <Segmented label="Reference" value={refMode} options={[['side', 'Ref beside'], ['overlay', 'Ref overlay'], ['off', 'No ref']]} onChange={(refMode) => set({ refMode })} />
      {refMode === 'overlay' && (
        <input className="opacity" type="range" min={0.1} max={0.9} step={0.05} value={refOpacity} aria-label="Overlay opacity" onChange={(e) => set({ refOpacity: Number(e.target.value) })} />
      )}
      <Stats />
    </div>
  );
}

function ReferencePanel() {
  const { def, dirty } = useCurrent();
  const { refImage, set, reset } = useStudio();
  const images = imagesFor(def.id);
  const main = refImage ?? (def.reference ? referenceUrls[def.reference] : images[0]?.url);
  const [status, setStatus] = useState('');

  const copyJson = async () => {
    const text = JSON.stringify(def, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied the character JSON.');
    } catch {
      setStatus('Copy failed. Select the JSON in your browser console instead.');
      console.log(text);
    }
  };
  const save = async () => {
    const res = await fetch('/__studio/save', { method: 'POST', body: JSON.stringify(def) });
    setStatus(res.ok ? `Saved to assets/data/characters/${def.id}.json` : `Not saved: ${await res.text()}`);
  };

  return (
    <aside className="ref">
      {main ? <img className="ref-main" src={main} alt={`${def.name} concept`} /> : <div className="ref-empty">No concept image yet. Send Claude a turnaround and it will appear here.</div>}
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((img) => (
            <button key={img.path} className={main === img.url ? 'on' : ''} onClick={() => set({ refImage: img.url })} title={img.label}>
              <img src={img.url} alt={img.label} />
            </button>
          ))}
        </div>
      )}

      <div className="actions">
        {import.meta.env.DEV && (
          <button className="primary" onClick={save} disabled={!dirty}>
            Save to repo
          </button>
        )}
        <button onClick={copyJson}>Copy JSON</button>
        <button onClick={reset} disabled={!dirty}>
          Discard edits
        </button>
      </div>
      {status && <p className="status">{status}</p>}
      {dirty && !import.meta.env.DEV && <p className="hint">You have unsaved edits in this browser. Tell Claude what you changed, or paste the copied JSON into the chat.</p>}

      <h3>Ask for changes</h3>
      <p className="hint">
        Describe a change in the chat, for example <em>"{def.name}: bigger ears, chain thicker, cuffs more orange"</em>. Claude edits{' '}
        <code>assets/data/characters/{def.id}.json</code> and republishes this page.
      </p>

      <h3>History</h3>
      <ol className="history">
        {def.history.map((h, i) => (
          <li key={i}>
            <time>{h.date}</time> {h.note}
          </li>
        ))}
      </ol>
    </aside>
  );
}

export function App() {
  const { selected, select, drafts, refMode, refOpacity, refImage } = useStudio();
  const { def } = useCurrent();
  const overlay = refImage ?? (def.reference ? referenceUrls[def.reference] : undefined);
  const [tab, setTab] = useState<'edit' | 'ref'>('edit');

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="eyebrow">Bucket Battle</span>
          <h1>Character Workshop</h1>
        </div>
        <nav className="chars" aria-label="Characters">
          {characters.map((c) => (
            <button key={c.id} className={c.id === selected ? 'on' : ''} onClick={() => select(c.id)}>
              {c.name}
              {drafts[c.id] && <span className="dot" title="Unsaved edits" />}
            </button>
          ))}
        </nav>
      </header>

      <div className={`main ref-${refMode}`}>
        <section className="stage">
          <Toolbar />
          <div className="canvas-wrap">
            <Viewport />
            {refMode === 'overlay' && overlay && <img className="overlay" src={overlay} alt="" style={{ opacity: refOpacity }} />}
          </div>
        </section>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')}>
            Edit
          </button>
          <button role="tab" aria-selected={tab === 'ref'} onClick={() => setTab('ref')}>
            Reference & history
          </button>
        </div>
        <div className={`panel panel-edit ${tab === 'edit' ? 'show' : ''}`}>
          <Controls />
        </div>
        {refMode !== 'off' || tab === 'ref' ? (
          <div className={`panel panel-ref ${tab === 'ref' ? 'show' : ''}`}>
            <ReferencePanel />
          </div>
        ) : null}
      </div>
    </div>
  );
}
