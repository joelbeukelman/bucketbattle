import type { BlockDef, BlockTheme, LandmarkKind, OpenFeature, StreetClass } from '@bb/schema';

/** Axis-aligned rectangle on the ground plane, metres. (x, z) is the min corner. */
export interface Rect {
  x: number;
  z: number;
  w: number;
  d: number;
}

export interface BuildingLot {
  kind: 'building';
  rect: Rect;
  stories: number;
  height: number;
  theme: BlockTheme;
  landmark?: LandmarkKind;
  roofSign?: string;
  /** 0..1, used by renderers to pick a palette variant. */
  tint: number;
  seed: number;
}

export interface OpenLot {
  kind: 'open';
  rect: Rect;
  feature: OpenFeature;
  seed: number;
}

export type ResolvedLot = BuildingLot | OpenLot;

export interface BlockLayout {
  row: number;
  col: number;
  def: BlockDef;
  /** Including sidewalk; this is the raised island (W3). */
  outer: Rect;
  /** Inside the sidewalk, where lots live. */
  interior: Rect;
  lots: ResolvedLot[];
}

export interface StreetLayout {
  axis: 'column' | 'row';
  index: number;
  class: StreetClass;
  /** Full length of the street across the world. */
  rect: Rect;
  width: number;
}

/** Thin ground decal: lane dash, center line or crosswalk stripe. */
export interface Marking extends Rect {
  kind: 'dash' | 'center' | 'crosswalk' | 'stopline';
}

export interface RoofProp {
  kind: 'ac' | 'vent' | 'tank' | 'antenna';
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** Bottom of the prop (roof height). */
  y: number;
}

export interface Tree {
  x: number;
  z: number;
  scale: number;
}

export interface WorldLayout {
  bounds: Rect;
  blocks: BlockLayout[];
  streets: StreetLayout[];
  intersections: Rect[];
  markings: Marking[];
  roofProps: RoofProp[];
  trees: Tree[];
  /** Solid footprints for collision (buildings). */
  colliders: Rect[];
}
