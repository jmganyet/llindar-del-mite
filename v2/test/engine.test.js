import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, buildComposition, CANVAS } from '../src/engine.js';
import { STROKE_ORDER } from '../src/strokes.js';

test('CANVAS is 380×480', () => {
  assert.deepEqual(CANVAS, { W: 380, H: 480 });
});

test('defaultState activates all 13 strokes', () => {
  const s = defaultState();
  assert.equal(Object.keys(s.active).length, 13);
  for (const id of STROKE_ORDER) assert.equal(s.active[id], true);
  assert.equal(s.grammar, 'off');
  assert.equal(s.distance, 0);
});

test('buildComposition is deterministic for same state', () => {
  const s = defaultState();
  const a = buildComposition(s).placed.map(p => p.segments[0].p0);
  const b = buildComposition(s).placed.map(p => p.segments[0].p0);
  assert.deepEqual(a, b);
});

test('at D=0 grammar ON: dafne-cos p0 is exactly home', () => {
  const s = defaultState(); s.grammar = 'on'; // seed=1, D=0, grammar=on
  const comp = buildComposition(s);
  const placed = Object.fromEntries(comp.placed.map(p => [p.id, p]));
  assert.deepEqual(placed['dafne-cos'].segments[0].p0, {x:198, y:462});
});

test('toggling a stroke off removes it from placed', () => {
  const s = defaultState();
  s.active['dafne-pit'] = false;
  const comp = buildComposition(s);
  assert.ok(!comp.placed.some(p => p.id === 'dafne-pit'));
});

test('D=1 produces different placement than D=0', () => {
  const s0 = defaultState(); s0.distance = 0;
  const s1 = defaultState(); s1.distance = 1;
  const p0 = buildComposition(s0).placed[0].segments[0].c1;
  const p1 = buildComposition(s1).placed[0].segments[0].c1;
  assert.ok(p0.x !== p1.x || p0.y !== p1.y);
});

test('grammar OFF produces different placement than ON for same seed', () => {
  const sOn  = defaultState(); sOn.grammar  = 'on';
  const sOff = defaultState(); sOff.grammar = 'off';
  const on  = buildComposition(sOn).placed[0].segments[0].p0;
  const off = buildComposition(sOff).placed[0].segments[0].p0;
  assert.ok(on.x !== off.x || on.y !== off.y);
});

test('composition carries seed, distance, grammar', () => {
  const s = defaultState(); s.seed = 42; s.distance = 0.7; s.grammar = 'off';
  const comp = buildComposition(s);
  assert.equal(comp.seed, 42);
  assert.equal(comp.distance, 0.7);
  assert.equal(comp.grammar, 'off');
});
