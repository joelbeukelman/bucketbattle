import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CURB_HEIGHT, type BuildingLot, type OpenLot } from '@bb/world';
import { layout } from '../world-data';
import { landmarkSign, openGround, palette, wallTint } from '../palette';
import { applyCutaway } from './cutaway';
import { fillInstances, unitBox, type BoxInstance } from './instancing';
import { useGame } from '../store';

/**
 * The whole grey-box city, built from WorldLayout. Everything repeated is instanced, so draw
 * calls scale with the number of *kinds* of things, not their count (ARCHITECTURE §4.2).
 */
export function City() {
  const setTarget = useGame((s) => s.setTarget);
  const lots = useMemo(() => layout.blocks.flatMap((b) => b.lots), []);
  const buildings = lots.filter((l): l is BuildingLot => l.kind === 'building');
  const opens = lots.filter((l): l is OpenLot => l.kind === 'open');
  const { bounds } = layout;

  return (
    <group
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        setTarget([e.point.x, e.point.z]);
      }}
    >
      {/* Asphalt everywhere; blocks sit on top as raised islands. */}
      <mesh rotation-x={-Math.PI / 2} position={[bounds.w / 2, 0, bounds.d / 2]} receiveShadow>
        <planeGeometry args={[bounds.w + 400, bounds.d + 400]} />
        <meshStandardMaterial color={palette.asphalt} roughness={0.95} />
      </mesh>
      <Boxes
        receiveShadow
        items={layout.blocks.map((b) => ({ x: b.outer.x + b.outer.w / 2, y: 0, z: b.outer.z + b.outer.d / 2, w: b.outer.w, h: CURB_HEIGHT, d: b.outer.d, color: palette.sidewalk }))}
      />
      <Boxes
        receiveShadow
        items={opens.map((l) => ({ ...center(l.rect), y: CURB_HEIGHT, h: 0.04, color: openGround[l.feature] }))}
      />
      <Buildings buildings={buildings} />
      <RoofProps />
      <OpenFeatures opens={opens} />
      <Markings />
      <Trees />
      {buildings.filter((b) => b.roofSign).map((b) => <RoofSign key={b.seed} lot={b} />)}
    </group>
  );
}

function center(r: { x: number; z: number; w: number; d: number }) {
  return { x: r.x + r.w / 2, z: r.z + r.d / 2, w: r.w, d: r.d };
}

function Boxes({ items, castShadow, receiveShadow, cutaway }: { items: BoxInstance[]; castShadow?: boolean; receiveShadow?: boolean; cutaway?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geometry = useMemo(() => unitBox(), []);
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    return cutaway ? applyCutaway(mat) : mat;
  }, [cutaway]);
  useLayoutEffect(() => fillInstances(ref.current, items), [items]);
  return <instancedMesh ref={ref} args={[geometry, material, Math.max(1, items.length)]} castShadow={castShadow} receiveShadow={receiveShadow} />;
}

function Buildings({ buildings }: { buildings: BuildingLot[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geometry = useMemo(() => unitBox(palette.roof), []);
  const material = useMemo(() => applyCutaway(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 })), []);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    fillInstances(
      ref.current,
      buildings.map((b) => {
        // Small seeded value shift per building so neighbours never match (W3).
        c.set(wallTint[b.theme]).offsetHSL(0, 0, (b.tint - 0.5) * 0.08);
        // Inset 0.3 m so neighbouring lots read as separate buildings.
        return { ...center(b.rect), w: b.rect.w - 0.6, d: b.rect.d - 0.6, y: CURB_HEIGHT, h: b.height, color: c.clone() };
      }),
    );
  }, [buildings]);
  return <instancedMesh ref={ref} args={[geometry, material, buildings.length]} castShadow receiveShadow />;
}

function RoofProps() {
  const items = useMemo(
    () =>
      layout.roofProps.map((p) => ({
        x: p.x + p.w / 2, z: p.z + p.d / 2, y: p.y + CURB_HEIGHT, w: p.w, d: p.d, h: p.h,
        color: p.kind === 'tank' ? '#8a6a52' : p.kind === 'antenna' ? '#55555a' : '#b8b8b8',
      })),
    [],
  );
  return <Boxes items={items} castShadow cutaway />;
}

/** Simple massing for open lots: skate ramps, court lines/hoops, garden beds, plaza benches. */
function OpenFeatures({ opens }: { opens: OpenLot[] }) {
  const items = useMemo(() => {
    const out: BoxInstance[] = [];
    const y = CURB_HEIGHT + 0.04;
    for (const l of opens) {
      const { x, z, w, d } = center(l.rect);
      if (l.feature === 'skate') {
        out.push({ x: x - w / 4, z, y, w: 4, h: 1.2, d: d * 0.5, color: '#8f8c86', rotationY: 0 });
        out.push({ x: x + w / 4, z: z - d / 4, y, w: 6, h: 0.6, d: 3, color: '#8f8c86' });
        out.push({ x: x + w / 4, z: z + d / 4, y, w: 2, h: 0.9, d: 6, color: '#8f8c86' });
      } else if (l.feature === 'court') {
        out.push({ x, z, y, w: w - 4, h: 0.02, d: 0.15, color: palette.paint });
        out.push({ x: x - w / 2 + 2.5, z, y, w: 0.3, h: 3.2, d: 0.3, color: '#ececec' });
        out.push({ x: x + w / 2 - 2.5, z, y, w: 0.3, h: 3.2, d: 0.3, color: '#ececec' });
        // Fence posts frame the court.
        for (const fz of [l.rect.z + 0.5, l.rect.z + l.rect.d - 0.5]) out.push({ x, z: fz, y, w: w - 1, h: 2.2, d: 0.08, color: '#6d6f73' });
      } else if (l.feature === 'garden') {
        for (let i = 0; i < 6; i++) out.push({ x: l.rect.x + 4 + (i % 3) * (w - 8) / 2, z: l.rect.z + 5 + Math.floor(i / 3) * (d - 10), y, w: 5, h: 0.4, d: 2.5, color: '#7a5b45' });
      } else if (l.feature === 'plaza') {
        out.push({ x, z, y, w: 2, h: 3, d: 2, color: '#d08a6a' });
        out.push({ x, z: z + 5, y, w: 4, h: 0.45, d: 0.8, color: '#7b6a5a' });
      }
    }
    return out;
  }, [opens]);
  return <Boxes items={items} castShadow receiveShadow />;
}

function Markings() {
  const items = useMemo(
    () => layout.markings.map((m) => ({ x: m.x + m.w / 2, z: m.z + m.d / 2, y: 0.01, w: m.w, d: m.d, h: 0.01, color: m.kind === 'center' ? palette.center : palette.paint })),
    [],
  );
  return <Boxes items={items} receiveShadow />;
}

function Trees() {
  const trunks = useRef<THREE.InstancedMesh>(null!);
  const canopies = useRef<THREE.InstancedMesh>(null!);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.15, 0.2, 1, 5).translate(0, 0.5, 0), []);
  const canopyGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  useLayoutEffect(() => {
    const y = CURB_HEIGHT;
    fillInstances(trunks.current, layout.trees.map((t) => ({ x: t.x, z: t.z, y, w: t.scale, h: 2 * t.scale, d: t.scale })));
    fillInstances(
      canopies.current,
      layout.trees.map((t, i) => ({ x: t.x, z: t.z, y: y + 3 * t.scale, w: 1.6 * t.scale, h: 1.5 * t.scale, d: 1.6 * t.scale, rotationY: i, color: new THREE.Color(palette.canopy).offsetHSL((i % 5) * 0.01, 0, ((i * 7) % 5) * 0.02 - 0.04) })),
    );
  }, []);
  return (
    <>
      <instancedMesh ref={trunks} args={[trunkGeo, undefined, layout.trees.length]} castShadow>
        <meshStandardMaterial color={palette.trunk} />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[canopyGeo, undefined, layout.trees.length]} castShadow>
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
    </>
  );
}

/** Roof signage readable from the overview camera (W10). Canvas texture, no font download. */
function RoofSign({ lot }: { lot: BuildingLot }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = landmarkSign[lot.landmark ?? ''] ?? '#333';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lot.roofSign ?? '', 256, 68);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [lot]);
  const material = useMemo(() => applyCutaway(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 })), [texture]);
  const w = Math.min(lot.rect.w - 1.5, 12);
  // Text runs along x and reads upright for a camera looking from +x+z.
  return (
    <mesh material={material} position={[lot.rect.x + lot.rect.w / 2, lot.height + CURB_HEIGHT + 0.06, lot.rect.z + 1 + w / 8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, w / 4]} />
    </mesh>
  );
}
