# ADR-0003: One shared city layout system, per-city kits

- Status: Proposed
- Date: 2026-10-29

## Context
The first city is fictional and based on NYC. Later cities follow the
characters' backgrounds (Tokyo, Dubai, London, Bangkok…). We don't want a new
world system per city.

## Decision
- **Shared layout rules**: block grid, streets between blocks, block themes
  (`home`, `school`, `park`, `court`, `shops`, `corner-stage`…), set-piece slots
  and encounter rules are the same in every city.
- **Per-city kit**: a `CityKitDef` maps each block theme / set piece to that city's
  tiles, facades, props, palette and ambience: NYC brownstones + elevated train;
  Tokyo narrow alleys + vending machines; Dubai towers + desert light; and so on.
- `WorldDef` gains `cityKit: 'kit.nyc'`. Asset IDs include the city when the
  asset is city-specific: `tile.nyc.brownstone`, `prop.tokyo.vending-machine`;
  shared assets stay generic: `prop.common.hydrant`.
- Each city may override lighting/weather presets (W4) and its palette.
- Characters and musicians carry a `homeCity` so outfits and stages can fit the setting.

## Consequences
- A new city mostly means a new kit plus a new world layout, with no engine changes.
- Block themes must be general enough to translate across cultures. Review
  this list before the second city.
