// src/mythemes.js
import { boundsOf } from './geometry.js';

function daphneCos(rng) {
  const bulge = rng.range(8, 18), lean = rng.range(-6, 6);
  const strokes = [{
    width: 3,
    segments: [{ p0: { x: lean, y: -45 }, c1: { x: bulge, y: -20 }, c2: { x: -bulge, y: 10 }, p1: { x: lean * 0.5, y: 45 } }],
  }];
  const anchors = { shoulder: { x: lean, y: -45 }, chest: { x: bulge * 0.6, y: -22 }, hip: { x: lean * 0.5, y: 45 } };
  return { id: 'daphne-cos', strokes, anchors, bounds: boundsOf(strokes) };
}

function daphnePit(rng) {
  const r = rng.range(4, 7);
  const cup = (cx) => ({ p0: { x: cx - r, y: 0 }, c1: { x: cx - r, y: -r }, c2: { x: cx + r, y: -r }, p1: { x: cx + r, y: 0 } });
  const strokes = [{ width: 2, segments: [cup(-r)] }, { width: 2, segments: [cup(r)] }];
  const anchors = { attach: { x: 0, y: 0 } };
  return { id: 'daphne-pit', strokes, anchors, bounds: boundsOf(strokes) };
}

function bracosBranca(rng) {
  const nForks = rng.int(2, 3);
  const strokes = [{ width: 3, segments: [{ p0: { x: 0, y: 0 }, c1: { x: 2, y: -12 }, c2: { x: -2, y: -22 }, p1: { x: 0, y: -30 } }] }];
  const anchors = { base: { x: 0, y: 0 } };
  const tipNames = [];
  for (let i = 0; i < nForks; i++) {
    const len = rng.range(18, 30);
    const ang = (nForks === 1 ? 0 : i / (nForks - 1) - 0.5) * 1.2 + rng.range(-0.2, 0.2);
    const ex = Math.sin(ang) * len, ey = -30 - Math.cos(ang) * len;
    strokes.push({ width: 2, segments: [{ p0: { x: 0, y: -30 }, c1: { x: ex * 0.4, y: -30 - len * 0.3 }, c2: { x: ex * 0.8, y: ey + 5 }, p1: { x: ex, y: ey } }] });
    const name = 'tip' + i;
    anchors[name] = { x: ex, y: ey };
    tipNames.push(name);
  }
  return { id: 'bracos-branca', strokes, anchors, tipNames, bounds: boundsOf(strokes) };
}

function llorer(rng) {
  const n = rng.int(3, 6);
  const strokes = [];
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + rng.range(-0.8, 0.8);
    const len = rng.range(6, 12);
    const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
    strokes.push({ width: 1.5, segments: [{ p0: { x: 0, y: 0 }, c1: { x: ex * 0.3 - ey * 0.15, y: ey * 0.3 + ex * 0.15 }, c2: { x: ex * 0.7, y: ey * 0.7 }, p1: { x: ex, y: ey } }] });
  }
  const anchors = { base: { x: 0, y: 0 }, tipUp: { x: 0, y: -10 } };
  return { id: 'llorer', strokes, anchors, bounds: boundsOf(strokes) };
}

function apolloGest(rng) {
  const reach = rng.range(25, 40);
  const strokes = [{ width: 3, segments: [{ p0: { x: 0, y: 0 }, c1: { x: -reach * 0.4, y: -6 }, c2: { x: -reach * 0.8, y: 4 }, p1: { x: -reach, y: 0 } }] }];
  const anchors = { shoulder: { x: 0, y: 0 }, hand: { x: -reach, y: 0 } };
  return { id: 'apollo-gest', strokes, anchors, bounds: boundsOf(strokes) };
}

function apolloFallus(rng) {
  const len = rng.range(22, 34);
  const strokes = [{ width: 3, segments: [{ p0: { x: 0, y: 6 }, c1: { x: -len * 0.4, y: 10 }, c2: { x: -len * 0.8, y: 14 }, p1: { x: -len, y: 16 } }] }];
  const anchors = { root: { x: 0, y: 6 }, tip: { x: -len, y: 16 } };
  return { id: 'apollo-fallus', strokes, anchors, bounds: boundsOf(strokes) };
}

function riuPeneu(rng) {
  const n = rng.int(2, 3), w = rng.range(120, 180);
  const strokes = [];
  for (let i = 0; i < n; i++) {
    const y = i * 8;
    strokes.push({ width: 2, segments: [
      { p0: { x: -w / 2, y }, c1: { x: -w / 4, y: y - 5 }, c2: { x: 0, y: y + 5 }, p1: { x: w / 4, y } },
      { p0: { x: w / 4, y }, c1: { x: w * 0.4, y: y - 5 }, c2: { x: w / 2, y: y + 3 }, p1: { x: w / 2, y } },
    ] });
  }
  const anchors = { center: { x: 0, y: 0 } };
  return { id: 'riu-peneu', strokes, anchors, bounds: boundsOf(strokes) };
}

export const MYTHEMES = {
  'daphne-cos': daphneCos, 'daphne-pit': daphnePit, 'bracos-branca': bracosBranca,
  'llorer': llorer, 'apollo-gest': apolloGest, 'apollo-fallus': apolloFallus, 'riu-peneu': riuPeneu,
};

export const MYTHEME_ORDER = [
  'daphne-cos', 'daphne-pit', 'bracos-branca', 'llorer',
  'apollo-gest', 'apollo-fallus', 'riu-peneu',
];

export const MYTHEME_LABELS = {
  'daphne-cos': 'Cos de Dafne', 'daphne-pit': 'Pit', 'bracos-branca': 'Braços→branca',
  'llorer': 'Llorer', 'apollo-gest': "Gest d'Apol·lo", 'apollo-fallus': 'Fal·lus', 'riu-peneu': 'Riu Peneu',
};
