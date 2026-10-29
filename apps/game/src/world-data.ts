import { WorldDef } from '@bb/schema';
import { layoutWorld, resolvePoint } from '@bb/world';
import level01 from '../../../assets/data/worlds/level-01.json';

/** The active world, validated once at startup. Data-first: the scene only reads this. */
export const world = WorldDef.parse(level01);
export const layout = layoutWorld(world);
export const spawn = resolvePoint(layout, world.spawn.position);
export const encounters = world.encounters.map((e) => ({ ...e, at: resolvePoint(layout, e.position) }));
