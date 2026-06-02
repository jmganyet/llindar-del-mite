// test/singleline.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { singleLinePath } from '../src/singleline.js';

const placed = (x, y) => ({ transform: { x, y } });

test('returns every point exactly once', () => {
  const input = [placed(5, 0), placed(0, 0), placed(10, 0)];
  const path = singleLinePath(input);
  assert.equal(path.length, 3);
  assert.deepEqual(path.map(p => p.x).sort((a, b) => a - b), [0, 5, 10]);
});

test('starts at the leftmost point', () => {
  const path = singleLinePath([placed(5, 0), placed(0, 0), placed(10, 0)]);
  assert.equal(path[0].x, 0);
});

test('handles fewer than two points', () => {
  assert.deepEqual(singleLinePath([]), []);
  assert.equal(singleLinePath([placed(3, 3)]).length, 1);
});

test('chooses nearest neighbour ordering', () => {
  const path = singleLinePath([placed(0, 0), placed(100, 0), placed(10, 0)]);
  assert.deepEqual(path.map(p => p.x), [0, 10, 100]);
});
