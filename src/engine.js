// src/engine.js
import { makeRng } from './rng.js';
import { MYTHEMES, MYTHEME_ORDER } from './mythemes.js';
import { placeON, placeOFF } from './grammar.js';

export const CANVAS = { W: 900, H: 700 };

export function defaultState() {
  return {
    seed: 1,
    mode: 'on',
    renderMode: 'multi',
    active: Object.fromEntries(MYTHEME_ORDER.map(id => [id, true])),
    params: { count: 7, jitter: 0, scatter: 0, scale: 2.2 },
  };
}

function sampleSubset(rng, ids, n) {
  const a = ids.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const chosen = new Set(a.slice(0, n));
  return ids.filter(id => chosen.has(id));
}

function applyScatter(rng, placed, params) {
  if (!params.scatter) return placed;
  return placed.map(p => ({
    ...p,
    transform: {
      ...p.transform,
      x: p.transform.x + rng.range(-1, 1) * params.scatter,
      y: p.transform.y + rng.range(-1, 1) * params.scatter,
    },
  }));
}

export function buildComposition(state) {
  const rng = makeRng(state.seed);
  let ids = MYTHEME_ORDER.filter(id => state.active[id]);
  ids = sampleSubset(rng, ids, Math.min(state.params.count, ids.length));

  const instances = {};
  for (const id of ids) instances[id] = MYTHEMES[id](rng, state.params);

  const place = state.mode === 'on' ? placeON : placeOFF;
  let placed = place(rng, instances, state.params, CANVAS);
  placed = applyScatter(rng, placed, state.params);

  return { seed: state.seed, mode: state.mode, renderMode: state.renderMode, jitter: state.params.jitter, placed };
}
