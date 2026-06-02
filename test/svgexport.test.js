// test/svgexport.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, buildComposition, CANVAS } from '../src/engine.js';
import { toSVG } from '../src/svgexport.js';

const STYLE = { bg: '#c8a062', stroke: '#4a2c14' };

test('produces an svg with a background rect and paths', () => {
  const comp = buildComposition(defaultState());
  const svg = toSVG(comp, CANVAS, STYLE);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes(`width="${CANVAS.W}"`));
  assert.ok(svg.includes('<rect'));
  assert.ok(svg.includes('<path'));
  assert.ok(svg.includes(STYLE.stroke));
});

test('emits one path per stroke', () => {
  const comp = buildComposition(defaultState());
  const total = comp.placed.reduce((n, p) => n + p.mytheme.strokes.length, 0);
  const svg = toSVG(comp, CANVAS, STYLE);
  const count = (svg.match(/<path/g) || []).length;
  assert.equal(count, total);
});
