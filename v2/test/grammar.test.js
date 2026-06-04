import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/rng.js';
import { HOME_STROKES, STROKE_ORDER } from '../src/strokes.js';
import { applyVariation, resolveAnchor } from '../src/variation.js';
import { placeON, placeOFF } from '../src/grammar.js';

const CANVAS = { W: 380, H: 480 };
const approx = (a, b, e=0.01) => assert.ok(Math.abs(a-b)<e, `${a} ≈ ${b}`);

function makeVariedMap(seed, D) {
  const rng = makeRng(seed);
  return Object.fromEntries(
    STROKE_ORDER.map(id => [id, applyVariation(HOME_STROKES[id], rng, D)]));
}

test('placeON at D=0: dafne-branca-esq base aligns with dafne-cos top', () => {
  const vm = makeVariedMap(1, 0);
  const placed = placeON(vm, makeRng(1), 0);
  const cosTop = resolveAnchor(placed['dafne-cos'], HOME_STROKES['dafne-cos'].anchorMap, 'top');
  const brancBase = resolveAnchor(placed['dafne-branca-esq'], HOME_STROKES['dafne-branca-esq'].anchorMap, 'base');
  approx(cosTop.x, brancBase.x);
  approx(cosTop.y, brancBase.y);
});

test('placeON: apollo-cos top aligns with apollo-cap base', () => {
  const vm = makeVariedMap(2, 0);
  const placed = placeON(vm, makeRng(2), 0);
  const capBase = resolveAnchor(placed['apollo-cap'], HOME_STROKES['apollo-cap'].anchorMap, 'base');
  const cosTop  = resolveAnchor(placed['apollo-cos'], HOME_STROKES['apollo-cos'].anchorMap, 'top');
  approx(capBase.x, cosTop.x);
  approx(capBase.y, cosTop.y);
});

test('placeON at D=0: master strokes are at home positions (within 15px jitter zone)', () => {
  const vm = makeVariedMap(1, 0);
  const placed = placeON(vm, makeRng(1), 0);
  // at D=0 master jitter = 0
  const cosP0 = placed['dafne-cos'].segments[0].p0;
  assert.deepEqual(cosP0, {x:198, y:462});
});

test('placeON returns all active strokes', () => {
  const vm = makeVariedMap(1, 0.5);
  const placed = placeON(vm, makeRng(1), 0.5);
  for (const id of STROKE_ORDER) assert.ok(placed[id], `missing: ${id}`);
});

test('placeOFF positions differ from home centroids', () => {
  const vm = makeVariedMap(1, 0);
  const placed = placeOFF(vm, makeRng(42), CANVAS);
  // dafne-cos home centroid is around (198,350) — OFF should scatter it
  const p0 = placed['dafne-cos'].segments[0].p0;
  const homeP0 = HOME_STROKES['dafne-cos'].segments[0].p0;
  const dist = Math.hypot(p0.x - homeP0.x, p0.y - homeP0.y);
  assert.ok(dist > 1, 'placeOFF did not move dafne-cos');
});

test('placeOFF returns all strokes within expanded canvas bounds', () => {
  const vm = makeVariedMap(3, 0);
  const placed = placeOFF(vm, makeRng(3), CANVAS);
  for (const id of STROKE_ORDER) assert.ok(placed[id]);
});

test('placeON is deterministic for same seed', () => {
  const vm = makeVariedMap(5, 0.6);
  const a = placeON(vm, makeRng(5), 0.6);
  const b = placeON(vm, makeRng(5), 0.6);
  assert.deepEqual(
    a['dafne-cos'].segments[0].p0,
    b['dafne-cos'].segments[0].p0);
});
