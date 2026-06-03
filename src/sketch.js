// src/sketch.js
import { defaultState, buildComposition, CANVAS } from './engine.js';
import { drawComposition } from './render.js';
import { setupUI } from './ui.js';
import { toSVG } from './svgexport.js';

const style = { bg: '#c8a062', stroke: '#4a2c14' };
const state = defaultState();
let comp = buildComposition(state);
let batchMode = false;

const sketch = (p) => {
  p.setup = () => {
    const c = p.createCanvas(CANVAS.W, CANVAS.H);
    c.parent('canvas-holder');
    p.noLoop();
    setupUI(state, {
      regenerate, rebuild, reference: showReference,
      exportPNG: () => p.saveCanvas('llindar-' + state.seed, 'png'),
      exportSVG,
      batch,
    });
    draw();
    window.__rendered = true;   // signal for the headless harness
  };

  function draw() {
    if (batchMode) { drawBatch(); return; }
    drawComposition(p, comp, style);
    p.push(); p.noStroke(); p.fill(style.stroke); p.textSize(12);
    const label = state.reference ? 'referència Picasso' : `seed ${state.seed} · ${state.mode}`;
    p.text(`${label} · ${state.renderMode}`, 12, CANVAS.H - 12); p.pop();
  }

  function drawBatch() {
    p.background(style.bg);
    const cols = 3, rows = 3, w = CANVAS.W / cols, h = CANVAS.H / rows;
    for (let i = 0; i < cols * rows; i++) {
      const s = { ...state, seed: state.seed + i + 1 };
      const c = buildComposition(s);
      const pg = p.createGraphics(CANVAS.W, CANVAS.H);
      // draw into an offscreen at full size, then scale into the cell
      drawCompositionInto(pg, c);
      p.image(pg, (i % cols) * w, Math.floor(i / cols) * h, w, h);
      pg.remove();
    }
  }

  function drawCompositionInto(pg, c) {
    pg.push(); drawComposition(pg, c, style); pg.pop();
  }

  function rebuild() { batchMode = false; comp = buildComposition(state); draw(); }
  function regenerate() { batchMode = false; state.reference = false; state.seed = Math.floor(Math.random() * 1e9); rebuild(); }
  function showReference() { batchMode = false; state.reference = true; rebuild(); }
  function batch() { batchMode = true; draw(); }
  function exportSVG() {
    const blob = new Blob([toSVG(comp, CANVAS, style)], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'llindar-' + state.seed + '.svg';
    a.click();
  }
};

new p5(sketch);
