// src/ui.js
import { MYTHEME_ORDER, MYTHEME_LABELS } from './mythemes.js';

// callbacks: { regenerate, rebuild, exportPNG, exportSVG }
export function setupUI(state, callbacks) {
  const root = document.getElementById('controls');
  root.innerHTML = '';

  const group = (title) => {
    const g = document.createElement('div'); g.className = 'group';
    const h = document.createElement('h3'); h.textContent = title; g.appendChild(h);
    root.appendChild(g); return g;
  };
  const button = (parent, label, onClick) => {
    const b = document.createElement('button'); b.textContent = label;
    b.onclick = onClick; parent.appendChild(b); return b;
  };

  const gModes = group('Mode');
  const bGram = button(gModes, '', () => { state.mode = state.mode === 'on' ? 'off' : 'on'; refreshLabels(); callbacks.rebuild(); });
  const bRend = button(gModes, '', () => { state.renderMode = state.renderMode === 'multi' ? 'single' : 'multi'; refreshLabels(); callbacks.rebuild(); });

  const gMyth = group('Mitemes');
  for (const id of MYTHEME_ORDER) {
    const label = document.createElement('label'); label.className = 'toggle';
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = state.active[id];
    cb.onchange = () => { state.active[id] = cb.checked; callbacks.rebuild(); };
    label.appendChild(cb); label.appendChild(document.createTextNode(' ' + MYTHEME_LABELS[id]));
    gMyth.appendChild(label);
  }

  const gParams = group('Ajustos');
  const slider = (key, label, min, max, step) => {
    const wrap = document.createElement('div'); wrap.className = 'slider';
    const l = document.createElement('label'); l.textContent = label;
    const s = document.createElement('input'); s.type = 'range'; s.min = min; s.max = max; s.step = step; s.value = state.params[key];
    s.oninput = () => { state.params[key] = parseFloat(s.value); callbacks.rebuild(); };
    wrap.appendChild(l); wrap.appendChild(s); gParams.appendChild(wrap);
  };
  slider('count', 'Nombre de mitemes', 1, 7, 1);
  slider('jitter', 'Tremolor', 0, 8, 0.5);
  slider('scatter', 'Dispersió', 0, 80, 1);
  slider('scale', 'Escala', 1, 3.5, 0.1);

  const gActions = group('Accions');
  button(gActions, 'Generar (espai)', callbacks.regenerate);
  button(gActions, 'Exporta PNG (S)', callbacks.exportPNG);
  button(gActions, 'Exporta SVG', callbacks.exportSVG);

  function refreshLabels() {
    bGram.textContent = 'Gramàtica: ' + (state.mode === 'on' ? 'ON' : 'OFF');
    bRend.textContent = 'Render: ' + (state.renderMode === 'multi' ? 'multi-traç' : 'línia única');
  }
  refreshLabels();

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); callbacks.regenerate(); }
    else if (e.key === 'g' || e.key === 'G') callbacks.batch && callbacks.batch();
    else if (e.key === 's' || e.key === 'S') callbacks.exportPNG();
    else if (e.key === 'm' || e.key === 'M') bGram.click();
    else if (e.key === 'r' || e.key === 'R') bRend.click();
    else if (/^[1-7]$/.test(e.key)) {
      const id = MYTHEME_ORDER[parseInt(e.key, 10) - 1];
      state.active[id] = !state.active[id];
      setupUI(state, callbacks); callbacks.rebuild();
    }
  });
}
