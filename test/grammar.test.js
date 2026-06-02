// test/grammar.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/rng.js';
import { MYTHEMES, MYTHEME_ORDER } from '../src/mythemes.js';
import { placeON, placeOFF } from '../src/grammar.js';
import { resolveAnchor } from '../src/geometry.js';

const PARAMS = { count: 7, jitter: 0, scatter: 0, scale: 2.2 };
const CANVAS = { W: 900, H: 700 };

function allInstances(seed) {
  const rng = makeRng(seed);
  const inst = {};
  for (const id of MYTHEME_ORDER) inst[id] = MYTHEMES[id](rng, PARAMS);
  return inst;
}

test('placeON places every active mytheme (laurel once per branch tip)', () => {
  const inst = allInstances(1);
  const placed = placeON(makeRng(1), inst, PARAMS, CANVAS);
  const ids = placed.map(p => p.id);
  for (const id of MYTHEME_ORDER) assert.ok(ids.includes(id), `${id} placed`);
  const laurels = placed.filter(p => p.id === 'llorer').length;
  assert.equal(laurels, inst['bracos-branca'].tipNames.length);
});

test('Apollo is on the opposite (right) side of Daphne', () => {
  const inst = allInstances(1);
  const placed = placeON(makeRng(1), inst, PARAMS, CANVAS);
  const apollo = placed.find(p => p.id === 'apollo-gest');
  const daphne = placed.find(p => p.id === 'daphne-cos');
  assert.ok(apollo.transform.x > daphne.transform.x, 'apollo right of daphne');
});

test('Apollo hand points toward Daphne (leftward)', () => {
  const inst = allInstances(1);
  const placed = placeON(makeRng(1), inst, PARAMS, CANVAS);
  const apollo = placed.find(p => p.id === 'apollo-gest');
  const hand = resolveAnchor(apollo, 'hand');
  assert.ok(hand.x < apollo.transform.x, 'hand reaches left toward daphne');
});

test('arms attach at the shoulder of the body', () => {
  const inst = allInstances(1);
  const placed = placeON(makeRng(1), inst, PARAMS, CANVAS);
  const cos = placed.find(p => p.id === 'daphne-cos');
  const arms = placed.find(p => p.id === 'bracos-branca');
  const shoulder = resolveAnchor(cos, 'shoulder');
  const armBase = resolveAnchor(arms, 'base');
  assert.ok(Math.hypot(shoulder.x - armBase.x, shoulder.y - armBase.y) < 1e-6);
});

test('each laurel sits at a branch tip and grows above its base', () => {
  const inst = allInstances(1);
  const placed = placeON(makeRng(1), inst, PARAMS, CANVAS);
  const arms = placed.find(p => p.id === 'bracos-branca');
  const tips = arms.mytheme.tipNames.map(tn => resolveAnchor(arms, tn));
  for (const lau of placed.filter(p => p.id === 'llorer')) {
    const base = resolveAnchor(lau, 'base');
    const near = tips.some(t => Math.hypot(t.x - base.x, t.y - base.y) < 1e-6);
    assert.ok(near, 'laurel base coincides with a branch tip');
    const up = resolveAnchor(lau, 'tipUp');
    assert.ok(up.y < base.y, 'laurel grows upward');
  }
});

test('river sits near the bottom', () => {
  const inst = allInstances(1);
  const placed = placeON(makeRng(1), inst, PARAMS, CANVAS);
  const river = placed.find(p => p.id === 'riu-peneu');
  const maxY = Math.max(...placed.map(p => p.transform.y));
  assert.equal(river.transform.y, maxY);
});

test('placeON is deterministic for the same seed', () => {
  const p1 = placeON(makeRng(1), allInstances(1), PARAMS, CANVAS).map(p => p.transform);
  const p2 = placeON(makeRng(1), allInstances(1), PARAMS, CANVAS).map(p => p.transform);
  assert.deepEqual(p1, p2);
});
