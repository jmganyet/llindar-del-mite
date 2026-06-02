// test/mythemes.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/rng.js';
import { MYTHEMES, MYTHEME_ORDER } from '../src/mythemes.js';

const PARAMS = { count: 7, jitter: 0, scatter: 0, scale: 2.2 };

test('registry has all seven mythemes in order', () => {
  assert.deepEqual(MYTHEME_ORDER, [
    'daphne-cos', 'daphne-pit', 'bracos-branca', 'llorer',
    'apollo-gest', 'apollo-fallus', 'riu-peneu',
  ]);
  for (const id of MYTHEME_ORDER) assert.equal(typeof MYTHEMES[id], 'function');
});

test('each mytheme returns valid structure with bounds and anchors', () => {
  for (const id of MYTHEME_ORDER) {
    const m = MYTHEMES[id](makeRng(1), PARAMS);
    assert.equal(m.id, id);
    assert.ok(m.strokes.length > 0, `${id} has strokes`);
    assert.ok(Object.keys(m.anchors).length > 0, `${id} has anchors`);
    assert.ok(m.bounds.maxX >= m.bounds.minX);
  }
});

test('deterministic for same seed', () => {
  const a = MYTHEMES['bracos-branca'](makeRng(5), PARAMS);
  const b = MYTHEMES['bracos-branca'](makeRng(5), PARAMS);
  assert.deepEqual(a, b);
});

test('varies across seeds', () => {
  const a = MYTHEMES['llorer'](makeRng(1), PARAMS);
  const b = MYTHEMES['llorer'](makeRng(99), PARAMS);
  assert.notDeepEqual(a.strokes, b.strokes);
});

test('bracos-branca exposes tipNames matching anchors', () => {
  const m = MYTHEMES['bracos-branca'](makeRng(2), PARAMS);
  assert.ok(m.tipNames.length >= 2);
  for (const tn of m.tipNames) assert.ok(m.anchors[tn], `anchor ${tn} exists`);
});

test('daphne-cos has shoulder and chest anchors', () => {
  const m = MYTHEMES['daphne-cos'](makeRng(1), PARAMS);
  assert.ok(m.anchors.shoulder && m.anchors.chest);
});

test('llorer leaves grow upward (negative y anchor)', () => {
  const m = MYTHEMES['llorer'](makeRng(1), PARAMS);
  assert.ok(m.anchors.tipUp.y < m.anchors.base.y);
});
