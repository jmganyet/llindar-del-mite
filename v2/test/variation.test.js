// v2/test/variation.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/rng.js';
import { HOME_STROKES, STROKE_ORDER } from '../src/strokes.js';
import { applyVariation, resolveAnchor } from '../src/variation.js';

test('D=0 produces segments identical to home', () => {
  const rng = makeRng(1);
  for (const id of STROKE_ORDER) {
    const v = applyVariation(HOME_STROKES[id], rng, 0);
    for (let i = 0; i < v.segments.length; i++) {
      const h = HOME_STROKES[id].segments[i], s = v.segments[i];
      assert.deepEqual(s.p0, h.p0); assert.deepEqual(s.p1, h.p1);
      assert.deepEqual(s.c1, h.c1); assert.deepEqual(s.c2, h.c2);
    }
  }
});

test('D=1 moves at least one c1/c2 on dafne-cos', () => {
  const v = applyVariation(HOME_STROKES['dafne-cos'], makeRng(7), 1);
  const h = HOME_STROKES['dafne-cos'];
  const moved = h.segments.some((seg, i) =>
    v.segments[i].c1.x !== seg.c1.x || v.segments[i].c2.y !== seg.c2.y);
  assert.ok(moved, 'no control points moved at D=1');
});

test('D=1 keeps p0/p1 endpoints unchanged', () => {
  const v = applyVariation(HOME_STROKES['dafne-cos'], makeRng(3), 1);
  for (let i = 0; i < v.segments.length; i++) {
    assert.deepEqual(v.segments[i].p0, HOME_STROKES['dafne-cos'].segments[i].p0);
    assert.deepEqual(v.segments[i].p1, HOME_STROKES['dafne-cos'].segments[i].p1);
  }
});

test('deterministic for same seed+D', () => {
  const a = applyVariation(HOME_STROKES['apollo-cos'], makeRng(5), 0.5);
  const b = applyVariation(HOME_STROKES['apollo-cos'], makeRng(5), 0.5);
  assert.deepEqual(a.segments, b.segments);
});

test('different seeds diverge', () => {
  const a = applyVariation(HOME_STROKES['dafne-cos'], makeRng(1), 0.8);
  const b = applyVariation(HOME_STROKES['dafne-cos'], makeRng(99), 0.8);
  assert.ok(a.segments[0].c1.x !== b.segments[0].c1.x
         || a.segments[0].c1.y !== b.segments[0].c1.y, 'seeds did not diverge');
});

test('resolveAnchor returns correct home point at D=0', () => {
  const v = applyVariation(HOME_STROKES['dafne-cos'], makeRng(1), 0);
  const top = resolveAnchor(v, HOME_STROKES['dafne-cos'].anchorMap, 'top');
  assert.deepEqual(top, {x:185, y:82}); // p1 of last segment
});

test('control point offsets stay within ±30px at D=1', () => {
  for (let seed = 0; seed < 20; seed++) {
    const v = applyVariation(HOME_STROKES['dafne-cos'], makeRng(seed), 1);
    for (let i = 0; i < v.segments.length; i++) {
      const h = HOME_STROKES['dafne-cos'].segments[i];
      assert.ok(Math.abs(v.segments[i].c1.x - h.c1.x) <= 30);
      assert.ok(Math.abs(v.segments[i].c1.y - h.c1.y) <= 30);
      assert.ok(Math.abs(v.segments[i].c2.x - h.c2.x) <= 30);
      assert.ok(Math.abs(v.segments[i].c2.y - h.c2.y) <= 30);
    }
  }
});
