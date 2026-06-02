// test/geometry.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTransform, transformSegment, cubicPoint, resolveAnchor, boundsOf } from '../src/geometry.js';

const approx = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} ~ ${b}`);

test('applyTransform translates and scales', () => {
  const p = applyTransform({ x: 10, y: 5, scale: 2, rotation: 0 }, { x: 1, y: 1 });
  approx(p.x, 12); approx(p.y, 7);
});

test('applyTransform rotates 90deg', () => {
  const p = applyTransform({ x: 0, y: 0, scale: 1, rotation: Math.PI / 2 }, { x: 1, y: 0 });
  approx(p.x, 0); approx(p.y, 1);
});

test('cubicPoint endpoints', () => {
  const seg = { p0: { x: 0, y: 0 }, c1: { x: 0, y: 1 }, c2: { x: 1, y: 1 }, p1: { x: 1, y: 0 } };
  const a = cubicPoint(seg, 0), b = cubicPoint(seg, 1);
  approx(a.x, 0); approx(b.x, 1);
});

test('resolveAnchor composes transform and anchor', () => {
  const placed = { transform: { x: 5, y: 0, scale: 1, rotation: 0 }, mytheme: { anchors: { tip: { x: 2, y: 3 } } } };
  const p = resolveAnchor(placed, 'tip');
  approx(p.x, 7); approx(p.y, 3);
});

test('boundsOf covers all control points', () => {
  const strokes = [{ width: 1, segments: [{ p0: { x: -1, y: 0 }, c1: { x: 0, y: -5 }, c2: { x: 0, y: 5 }, p1: { x: 3, y: 0 } }] }];
  const b = boundsOf(strokes);
  assert.deepEqual(b, { minX: -1, minY: -5, maxX: 3, maxY: 5 });
});
