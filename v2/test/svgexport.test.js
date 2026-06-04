import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, buildComposition } from '../src/engine.js';
import { toSVG } from '../src/svgexport.js';

const STYLE = { bg: '#c8a062', stroke: '#4a2c14' };
const DISPLAY = { W: 760, H: 960, scale: 2 };

test('produces a valid SVG opening tag with display dimensions', () => {
  const svg = toSVG(buildComposition(defaultState()), DISPLAY, STYLE);
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes(`width="${DISPLAY.W}"`));
  assert.ok(svg.includes(`height="${DISPLAY.H}"`));
});

test('contains background rect with correct fill', () => {
  const svg = toSVG(buildComposition(defaultState()), DISPLAY, STYLE);
  assert.ok(svg.includes('<rect'));
  assert.ok(svg.includes(STYLE.bg));
});

test('contains at least one path per placed stroke', () => {
  const comp = buildComposition(defaultState());
  const svg = toSVG(comp, DISPLAY, STYLE);
  const pathCount = (svg.match(/<path/g) || []).length;
  assert.ok(pathCount >= comp.placed.length, `paths ${pathCount} < strokes ${comp.placed.length}`);
});

test('stroke color is applied to paths', () => {
  const svg = toSVG(buildComposition(defaultState()), DISPLAY, STYLE);
  assert.ok(svg.includes(STYLE.stroke));
});
