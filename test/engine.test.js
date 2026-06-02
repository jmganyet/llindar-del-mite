// test/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, buildComposition, CANVAS } from '../src/engine.js';
import { MYTHEME_ORDER } from '../src/mythemes.js';

test('default state activates all mythemes in ON/multi', () => {
  const s = defaultState();
  assert.equal(s.mode, 'on');
  assert.equal(s.renderMode, 'multi');
  for (const id of MYTHEME_ORDER) assert.equal(s.active[id], true);
});

test('buildComposition is deterministic for the same state', () => {
  const s = defaultState();
  const a = buildComposition(s).placed.map(p => ({ id: p.id, t: p.transform }));
  const b = buildComposition(s).placed.map(p => ({ id: p.id, t: p.transform }));
  assert.deepEqual(a, b);
});

test('toggling a mytheme off removes it from the composition', () => {
  const s = defaultState();
  s.active['llorer'] = false;
  const comp = buildComposition(s);
  assert.ok(!comp.placed.some(p => p.id === 'llorer'));
});

test('count dial limits how many mythemes are drawn', () => {
  const s = defaultState();
  s.params.count = 3;
  const comp = buildComposition(s);
  const distinct = new Set(comp.placed.map(p => p.id));
  // The dial caps the random sample at `count`; dependency closure may add
  // active parents on top, so the rendered count can slightly exceed `count`
  // (coherent figures over an exact count) but stays below the full set.
  assert.ok(distinct.size >= 3, 'at least the sampled count is drawn');
  assert.ok(distinct.size < MYTHEME_ORDER.length, 'fewer than all mythemes');
});

test('composition carries seed, mode, renderMode and jitter', () => {
  const s = defaultState();
  s.params.jitter = 4;
  const comp = buildComposition(s);
  assert.equal(comp.seed, s.seed);
  assert.equal(comp.mode, 'on');
  assert.equal(comp.renderMode, 'multi');
  assert.equal(comp.jitter, 4);
});

test('changing seed changes the composition', () => {
  const s1 = defaultState(); s1.seed = 1;
  const s2 = defaultState(); s2.seed = 2;
  assert.notDeepEqual(
    buildComposition(s1).placed.map(p => p.transform),
    buildComposition(s2).placed.map(p => p.transform),
  );
});

test('CANVAS has expected dimensions', () => {
  assert.deepEqual(CANVAS, { W: 900, H: 700 });
});

test('compositions never render a child mytheme without its parent', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const s = defaultState(); s.seed = seed; s.params.count = 4;
    const ids = new Set(buildComposition(s).placed.map((p) => p.id));
    if (ids.has('llorer')) assert.ok(ids.has('bracos-branca'), `seed ${seed}: llorer without branch`);
    if (ids.has('bracos-branca')) assert.ok(ids.has('daphne-cos'), `seed ${seed}: branch without cos`);
    if (ids.has('daphne-pit')) assert.ok(ids.has('daphne-cos'), `seed ${seed}: pit without cos`);
  }
});
