// src/engine.js
import { makeRng } from './rng.js';
import { panelOf } from './geometry.js';
import { MYTHEMES, MYTHEME_ORDER } from './mythemes.js';
import { placeON, placeOFF } from './grammar.js';
import { referencePlaced } from './reference.js';

export const CANVAS = { W: 900, H: 700 };
export const PANEL = panelOf(CANVAS.W, CANVAS.H);

const DEPENDS = {
  'daphne-pit': ['daphne-cos'],
  'bracos-branca': ['daphne-cos'],
  'llorer': ['bracos-branca'],
};

function closeDeps(ids, active) {
  const set = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...set]) {
      for (const dep of DEPENDS[id] || []) {
        if (active[dep] && !set.has(dep)) { set.add(dep); changed = true; }
      }
    }
  }
  return MYTHEME_ORDER.filter((id) => set.has(id));
}

export function defaultState() {
  return {
    seed: 1,
    // the very first composition is the exact Picasso reference; pressing
    // "generate" turns this off and the generative system takes over.
    reference: true,
    mode: 'on',
    renderMode: 'multi',
    // llorer (explicit laurel) is off by default — the bare branches carry the
    // transformation, matching the Picasso reference; it stays as an optional toggle.
    active: Object.fromEntries(MYTHEME_ORDER.map(id => [id, id !== 'llorer'])),
    params: { count: 7, jitter: 0, scatter: 0, scale: 1.6, temperature: 1 },
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
  // first load: the fixed, hand-traced Picasso reference
  if (state.reference) {
    return { seed: state.seed, mode: 'reference', renderMode: state.renderMode, jitter: 0, panel: PANEL, placed: referencePlaced(PANEL) };
  }
  const rng = makeRng(state.seed);
  let ids = MYTHEME_ORDER.filter(id => state.active[id]);
  // the number of mythemes present drifts around the slider value, scaled by
  // temperature (0 = exactly `count`); the slider stays the centre of the dial.
  const tmp = state.params.temperature != null ? state.params.temperature : 1;
  const span = Math.round(tmp * 1.5);
  let target = state.params.count + (span > 0 ? rng.int(-span, span) : 0);
  target = Math.max(1, Math.min(target, ids.length));
  ids = sampleSubset(rng, ids, target);
  ids = closeDeps(ids, state.active);

  const instances = {};
  for (const id of ids) instances[id] = MYTHEMES[id](rng, state.params);

  const place = state.mode === 'on' ? placeON : placeOFF;
  let placed = place(rng, instances, state.params, CANVAS, PANEL);
  placed = applyScatter(rng, placed, state.params);

  return { seed: state.seed, mode: state.mode, renderMode: state.renderMode, jitter: state.params.jitter, panel: PANEL, placed };
}
