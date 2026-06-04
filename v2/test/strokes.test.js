import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME_STROKES, STROKE_ORDER, STROKE_CHARACTERS, STROKE_LABELS } from '../src/strokes.js';

test('all 13 strokes present in STROKE_ORDER', () => {
  assert.equal(STROKE_ORDER.length, 13);
});

test('HOME_STROKES has entry for every id in STROKE_ORDER', () => {
  for (const id of STROKE_ORDER) assert.ok(HOME_STROKES[id], `missing: ${id}`);
});

test('each stroke has valid segments with numeric bezier points', () => {
  for (const id of STROKE_ORDER) {
    const s = HOME_STROKES[id];
    assert.ok(s.segments.length >= 1, `${id} has no segments`);
    for (const seg of s.segments)
      for (const pt of ['p0','c1','c2','p1'])
        assert.ok(Number.isFinite(seg[pt].x) && Number.isFinite(seg[pt].y),
          `${id} seg.${pt} not finite`);
  }
});

test('each stroke has anchorMap with valid segIdx and point', () => {
  const VALID_POINTS = new Set(['p0','c1','c2','p1']);
  for (const id of STROKE_ORDER) {
    const s = HOME_STROKES[id];
    assert.ok(Object.keys(s.anchorMap).length >= 1, `${id} anchorMap empty`);
    for (const [name, ref] of Object.entries(s.anchorMap)) {
      const idx = ref.segIdx < 0 ? s.segments.length + ref.segIdx : ref.segIdx;
      assert.ok(idx >= 0 && idx < s.segments.length, `${id}.${name} bad segIdx`);
      assert.ok(VALID_POINTS.has(ref.point), `${id}.${name} bad point`);
    }
  }
});

test('STROKE_CHARACTERS covers all IDs with valid character', () => {
  const VALID = new Set(['dafne','apollo','peneu']);
  for (const id of STROKE_ORDER) assert.ok(VALID.has(STROKE_CHARACTERS[id]), id);
});

test('dafne has 6 strokes, apollo 5, peneu 2', () => {
  const counts = { dafne: 0, apollo: 0, peneu: 0 };
  for (const id of STROKE_ORDER) counts[STROKE_CHARACTERS[id]]++;
  assert.deepEqual(counts, { dafne: 6, apollo: 5, peneu: 2 });
});
