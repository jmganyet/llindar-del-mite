// v2/src/sketch.js
import { defaultState, buildComposition, CANVAS } from './engine.js';
import { drawComposition } from './render.js';
import { setupUI } from './ui.js';
import { toSVG } from './svgexport.js';

const DISPLAY = { W: 760, H: 960, scale: 2 };
const STYLE = { bg: '#c8a062', stroke: '#4a2c14' };

const state = defaultState();
let comp = buildComposition(state);
let ui;

const sketch = p => {
  p.setup = () => {
    const c = p.createCanvas(DISPLAY.W, DISPLAY.H);
    c.parent('canvas-holder');
    p.noLoop();
    ui = setupUI(state, { regenerate, random, rebuild, toggleGrammar, exportPNG, exportSVG });
    redraw();
  };
  p.draw = () => drawComposition(p, comp, STYLE);

  function redraw() { comp = buildComposition(state); p.redraw(); }
  function rebuild() { redraw(); }
  function regenerate() { state.seed = Math.floor(Math.random() * 1e9); redraw(); }
  function random() {
    state.seed = Math.floor(Math.random() * 1e9);
    state.distance = Math.random();
    const dial = document.querySelector('input[type=range]');
    if (dial) dial.value = Math.round(state.distance * 100);
    redraw();
  }
  function toggleGrammar() {
    state.grammar = state.grammar === 'on' ? 'off' : 'on';
    if (ui) ui.refresh();
    redraw();
  }
  function exportPNG() { p.saveCanvas('llindar-v2-' + state.seed, 'png'); }
  function exportSVG() {
    const blob = new Blob([toSVG(comp, DISPLAY, STYLE)], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'llindar-v2-' + state.seed + '.svg';
    a.click();
  }
};

new p5(sketch);
