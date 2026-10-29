import type { ReactNode } from 'react';
import {
  AccessoryKind, BottomKind, HairKind, HatKind, InstrumentKind, ShoeKind, SockKind, TopKind,
  type CharacterDef,
} from '@bb/schema';
import { useCurrent, useStudio } from './store';

type Slot = 'hair' | 'hat' | 'top' | 'bottom' | 'socks' | 'shoes' | 'instrument';
const KINDS: Record<Slot, readonly string[]> = {
  hair: HairKind.options,
  hat: HatKind.options,
  top: TopKind.options,
  bottom: BottomKind.options,
  socks: SockKind.options,
  shoes: ShoeKind.options,
  instrument: InstrumentKind.options,
};
/** Which color fields each slot uses, with labels people recognize. */
const COLORS: Record<Slot, [string, string][]> = {
  hair: [['color', 'Color']],
  hat: [['color', 'Color'], ['color2', 'Trim / patch']],
  top: [['color', 'Body'], ['color2', 'Secondary'], ['color3', 'Accent'], ['under', 'Layer under']],
  bottom: [['color', 'Color'], ['color2', 'Stripe / rips / camo']],
  socks: [['color', 'Color'], ['color2', 'Stripe 1'], ['color3', 'Stripe 2']],
  shoes: [['color', 'Upper'], ['color2', 'Accent'], ['sole', 'Sole']],
  instrument: [['color', 'Shell'], ['color2', 'Rims / second']],
};
const SLOT_LABEL: Record<Slot, string> = { hair: 'Hair', hat: 'Hat', top: 'Top', bottom: 'Bottom', socks: 'Socks', shoes: 'Shoes', instrument: 'Instrument' };

const BODY: [keyof CharacterDef['body'], string, number, number, number][] = [
  ['height', 'Height (m)', 1.2, 2.1, 0.01],
  ['headScale', 'Head size', 0.7, 1.5, 0.01],
  ['earScale', 'Ear size', 0.5, 1.8, 0.01],
  ['build', 'Limb thickness', 0.6, 1.6, 0.01],
  ['shoulders', 'Shoulder width', 0.7, 1.4, 0.01],
  ['legs', 'Leg length', 0.8, 1.25, 0.01],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="section" open>
      <summary>{title}</summary>
      <div className="section-body">{children}</div>
    </details>
  );
}

function ColorField({ id, label, value, onChange, optional }: { id: string; label: string; value?: string; onChange: (v: string | undefined) => void; optional?: boolean }) {
  return (
    <div className="color-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="color" value={value ?? '#888888'} onChange={(e) => onChange(e.target.value)} className={value ? '' : 'unset'} />
      {optional && value && (
        <button className="clear" onClick={() => onChange(undefined)} aria-label={`Clear ${label}`}>
          ×
        </button>
      )}
    </div>
  );
}

export function Controls() {
  const { def } = useCurrent();
  const update = useStudio((s) => s.update);

  return (
    <div className="controls">
      <Section title="Body">
        {BODY.map(([key, label, min, max, step]) => (
          <div className="slider" key={key}>
            <label htmlFor={`body-${key}`}>
              {label} <output>{def.body[key].toFixed(2)}</output>
            </label>
            <input id={`body-${key}`} type="range" min={min} max={max} step={step} value={def.body[key]} onChange={(e) => update((d) => void (d.body[key] = Number(e.target.value)))} />
          </div>
        ))}
        <div className="row">
          <ColorField id="skin" label="Skin" value={def.skin} onChange={(v) => update((d) => void (d.skin = v!))} />
          <ColorField id="brows" label="Brows" value={def.face.brows} onChange={(v) => update((d) => void (d.face.brows = v!))} />
        </div>
        <div className="slider">
          <label htmlFor="lids">
            Heavy lids <output>{def.face.lids.toFixed(2)}</output>
          </label>
          <input id="lids" type="range" min={0} max={1} step={0.01} value={def.face.lids} onChange={(e) => update((d) => void (d.face.lids = Number(e.target.value)))} />
        </div>
        <label className="check">
          <input type="checkbox" checked={def.face.beard} onChange={(e) => update((d) => void (d.face.beard = e.target.checked))} /> Beard
        </label>
      </Section>

      {(Object.keys(KINDS) as Slot[]).map((slot) => {
        const part = def[slot] as Record<string, string | undefined>;
        return (
          <Section title={SLOT_LABEL[slot]} key={slot}>
            <select id={`${slot}-kind`} aria-label={`${SLOT_LABEL[slot]} style`} value={part.kind} onChange={(e) => update((d) => void ((d[slot] as Record<string, string>).kind = e.target.value))}>
              {KINDS[slot].map((k) => (
                <option key={k} value={k}>
                  {k.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
            <div className="row wrap">
              {COLORS[slot].map(([field, label]) => (
                <ColorField
                  key={field}
                  id={`${slot}-${field}`}
                  label={label}
                  value={part[field]}
                  optional={field !== 'color'}
                  onChange={(v) =>
                    update((d) => {
                      const p = d[slot] as Record<string, string | undefined>;
                      if (v === undefined) delete p[field];
                      else p[field] = v;
                    })
                  }
                />
              ))}
            </div>
          </Section>
        );
      })}

      <Section title="Accessories">
        {AccessoryKind.options.map((kind) => {
          const idx = def.accessories.findIndex((a) => a.kind === kind);
          const a = def.accessories[idx];
          return (
            <div className="row acc" key={kind}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={idx >= 0}
                  onChange={(e) =>
                    update((d) => {
                      if (e.target.checked) d.accessories.push({ kind, color: kind === 'chain' || kind === 'earrings' ? '#d4a52a' : '#222222' });
                      else d.accessories = d.accessories.filter((x) => x.kind !== kind);
                    })
                  }
                />
                {kind}
              </label>
              {a && <ColorField id={`acc-${kind}`} label="Color" value={a.color} onChange={(v) => update((d) => void (d.accessories[idx]!.color = v!))} />}
              {a && <ColorField id={`acc-${kind}-2`} label="Second" value={a.color2} optional onChange={(v) => update((d) => {
                const x = d.accessories[idx]!;
                if (v === undefined) delete x.color2;
                else x.color2 = v;
              })} />}
            </div>
          );
        })}
      </Section>
    </div>
  );
}
