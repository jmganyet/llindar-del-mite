import { makeRng } from './rng.js';
import { HOME_STROKES, STROKE_ORDER } from './strokes.js';
import { applyVariation } from './variation.js';
import { placeON, placeOFF } from './grammar.js';

export const CANVAS = { W: 380, H: 480 };

export function defaultState() {
  return {
    seed: 1,
    distance: 0,
    grammar: 'off',
    active: Object.fromEntries(STROKE_ORDER.map(id => [id, true])),
  };
}

export function buildComposition(state) {
  const rng = makeRng(state.seed);
  const D = state.distance;

  // Variation + placement run over ALL 13 strokes in fixed order so the
  // shared RNG stream is consumed identically regardless of which strokes
  // are active. Activar/desactivar un traç només afegeix o treu aquell
  // traç al final — la resta del dibuix queda idèntica (no es regenera).
  const variedMap = {};
  for (const id of STROKE_ORDER) {
    variedMap[id] = applyVariation(HOME_STROKES[id], rng, D);
  }

  const placedMap = state.grammar === 'on'
    ? placeON(variedMap, rng, D)
    : placeOFF(variedMap, rng, CANVAS);

  const placed = STROKE_ORDER
    .filter(id => state.active[id] !== false && placedMap[id])
    .map(id => placedMap[id]);

  return { seed: state.seed, distance: D, grammar: state.grammar, placed };
}
