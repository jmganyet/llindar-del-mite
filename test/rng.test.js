// test/rng.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRng } from '../src/rng.js';

test('same seed produces same sequence', () => {
  const a = makeRng(42), b = makeRng(42);
  for (let i = 0; i < 5; i++) assert.equal(a.next(), b.next());
});

test('different seeds diverge', () => {
  const a = makeRng(1), b = makeRng(2);
  assert.notEqual(a.next(), b.next());
});

test('range stays within bounds', () => {
  const r = makeRng(7);
  for (let i = 0; i < 100; i++) {
    const v = r.range(10, 20);
    assert.ok(v >= 10 && v < 20);
  }
});

test('int is inclusive and integral', () => {
  const r = makeRng(3);
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const v = r.int(2, 4);
    assert.ok(Number.isInteger(v) && v >= 2 && v <= 4);
    seen.add(v);
  }
  assert.deepEqual([...seen].sort(), [2, 3, 4]);
});
