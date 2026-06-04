// v2/src/ui.js
import { STROKE_ORDER, STROKE_CHARACTERS, STROKE_LABELS } from './strokes.js';

const CHARS = ['dafne','apollo','peneu'];
const CHAR_LABEL = { dafne:'Dafne', apollo:'Apol·lo', peneu:'Riu Peneu' };

export function setupUI(state, callbacks) {
  const root = document.getElementById('controls');
  root.innerHTML = '';

  const section = title => {
    const d = document.createElement('div'); d.className = 'group';
    const h = document.createElement('h3'); h.textContent = title;
    d.appendChild(h); root.appendChild(d); return d;
  };
  const btn = (parent, label, onClick) => {
    const b = document.createElement('button');
    b.innerHTML = label; b.onclick = onClick; parent.appendChild(b); return b;
  };

  // Distance dial
  const gDial = section('Distància del Picasso');
  const dialWrap = document.createElement('div'); dialWrap.className = 'dial-wrap';
  const spanL = document.createElement('span'); spanL.textContent = 'Exacte';
  const dial = document.createElement('input');
  dial.type = 'range'; dial.min = 0; dial.max = 100; dial.step = 1;
  dial.value = Math.round(state.distance * 100);
  dial.oninput = () => { state.distance = dial.value / 100; callbacks.rebuild(); };
  const spanR = document.createElement('span'); spanR.textContent = 'Màxim';
  dialWrap.append(spanL, dial, spanR);
  gDial.appendChild(dialWrap);

  // Main action buttons
  const gActions = section('Accions');
  const bRandom = btn(gActions, '🎲 Aleatori <kbd>A</kbd>', callbacks.random);
  bRandom.className = 'btn-primary';
  btn(gActions, '↺ Generar <kbd>espai</kbd>', callbacks.regenerate);

  // Grammar + render toggles
  const gMode = section('Mode');
  const bGram = btn(gMode, '', callbacks.toggleGrammar);

  // Per-stroke toggles grouped by character
  for (const char of CHARS) {
    const ids = STROKE_ORDER.filter(id => STROKE_CHARACTERS[id] === char);
    const g = section(CHAR_LABEL[char]);
    ids.forEach((id, i) => {
      const lbl = document.createElement('label'); lbl.className = 'toggle';
      const cb = document.createElement('input'); cb.type = 'checkbox';
      cb.checked = state.active[id] !== false;
      cb.onchange = () => { state.active[id] = cb.checked; callbacks.rebuild(); };
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(` ${i+1}. ${STROKE_LABELS[id]}`));
      g.appendChild(lbl);
    });
  }

  // Export
  const gExp = section('Exporta');
  btn(gExp, 'PNG <kbd>S</kbd>', callbacks.exportPNG);
  btn(gExp, 'SVG', callbacks.exportSVG);

  function refresh() {
    bGram.innerHTML = `Gramàtica: ${state.grammar === 'on' ? 'ON' : 'OFF'} <kbd>G</kbd>`;
  }
  refresh();

  window.addEventListener('keydown', e => {
    if (e.key === ' ') { e.preventDefault(); callbacks.regenerate(); }
    else if (e.key.toLowerCase() === 'a') callbacks.random();
    else if (e.key.toLowerCase() === 'g') callbacks.toggleGrammar();
    else if (e.key.toLowerCase() === 's') callbacks.exportPNG();
    else if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const id = STROKE_ORDER[idx];
      if (id) { state.active[id] = !state.active[id]; setupUI(state, callbacks); callbacks.rebuild(); }
    }
  });

  return { refresh };
}
