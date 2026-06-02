// src/mythemes.js
import { boundsOf } from './geometry.js';

// temperature scales how far each parameter strays from its centre value.
// 0 = identical shapes every time; 1 = baseline; >1 = wilder divergence.
const temp = (params) => (params && params.temperature != null ? params.temperature : 1);
const vary = (rng, mid, spread, params) => mid + rng.range(-1, 1) * spread * temp(params);

function daphneCos(rng, params) {
  const hip = Math.max(6, vary(rng, 13, 4, params));     // hip outward swell
  const waist = Math.max(1, vary(rng, 4.5, 2, params));  // waist pinch
  const sway = vary(rng, 0, 5, params);                  // lateral sway of the figure
  const strokes = [];
  // back/spine contour: shoulder -> waist (in) -> hip (out) -> leg merging into trunk/root
  strokes.push({ width: 3, segments: [
    { p0: { x: sway, y: -52 }, c1: { x: -waist + sway, y: -40 }, c2: { x: -waist, y: -26 }, p1: { x: -waist * 0.5, y: -12 } },
    { p0: { x: -waist * 0.5, y: -12 }, c1: { x: -hip * 0.5, y: 2 }, c2: { x: -hip, y: 14 }, p1: { x: -hip * 0.6, y: 32 } },
    { p0: { x: -hip * 0.6, y: 32 }, c1: { x: -hip * 0.3, y: 44 }, c2: { x: -2, y: 52 }, p1: { x: vary(rng, 0, 4, params), y: 60 } },
  ] });
  // front contour: throat -> bust -> belly -> back to hip
  strokes.push({ width: 2, segments: [
    { p0: { x: sway, y: -48 }, c1: { x: waist + 5, y: -38 }, c2: { x: waist + 3, y: -22 }, p1: { x: waist * 0.5, y: -12 } },
    { p0: { x: waist * 0.5, y: -12 }, c1: { x: hip * 0.7, y: 4 }, c2: { x: hip * 0.6, y: 22 }, p1: { x: -hip * 0.6, y: 32 } },
  ] });
  const anchors = { shoulder: { x: sway, y: -50 }, chest: { x: waist + 1, y: -28 }, hip: { x: -hip * 0.6, y: 32 } };
  return { id: 'daphne-cos', strokes, anchors, bounds: boundsOf(strokes) };
}

function daphnePit(rng, params) {
  const r = Math.max(3, vary(rng, 6, 1.5, params));
  // each breast: a rounded under-curve
  const breast = (cx) => ([{ p0: { x: cx - r, y: -r * 0.4 }, c1: { x: cx - r, y: r * 0.8 }, c2: { x: cx + r, y: r * 0.8 }, p1: { x: cx + r, y: -r * 0.2 } }]);
  const strokes = [
    { width: 2, segments: breast(-r * 0.7) },
    { width: 2, segments: breast(r * 1.0) },
  ];
  const anchors = { attach: { x: 0, y: 0 } };
  return { id: 'daphne-pit', strokes, anchors, bounds: boundsOf(strokes) };
}

function bracosBranca(rng, params) {
  // two arms raised from the shoulders, each forking into bare twigs (fingers -> branches)
  const strokes = [];
  const anchors = { base: { x: 0, y: 0 } };
  const tipNames = [];
  let t = 0;
  for (let a = 0; a < 2; a++) {
    const side = a === 0 ? -1 : 1;
    const spread = Math.max(6, vary(rng, 19, 6, params));
    const rise = Math.max(16, vary(rng, 37, 8, params));
    const handX = side * spread, handY = -rise;
    // upper arm: shoulder -> elbow -> raised hand
    strokes.push({ width: 3, segments: [
      { p0: { x: 0, y: 0 }, c1: { x: side * spread * 0.3, y: -rise * 0.3 + vary(rng, 0, 4, params) }, c2: { x: side * spread * 0.7, y: -rise * 0.6 }, p1: { x: handX, y: handY } },
    ] });
    // bare twigs sprouting from the hand
    const twigs = rng.int(2, 3);
    for (let i = 0; i < twigs; i++) {
      const tl = Math.max(5, vary(rng, 12, 4, params));
      const ang = -Math.PI / 2 + side * 0.25 + (i - (twigs - 1) / 2) * 0.5 + vary(rng, 0, 0.25, params);
      const ex = handX + Math.cos(ang) * tl, ey = handY + Math.sin(ang) * tl;
      strokes.push({ width: 1.5, segments: [
        { p0: { x: handX, y: handY }, c1: { x: handX + (ex - handX) * 0.4, y: handY + (ey - handY) * 0.4 }, c2: { x: ex, y: ey + 2 }, p1: { x: ex, y: ey } },
      ] });
      const name = 'tip' + (t++);
      anchors[name] = { x: ex, y: ey };
      tipNames.push(name);
    }
  }
  return { id: 'bracos-branca', strokes, anchors, tipNames, bounds: boundsOf(strokes) };
}

function llorer(rng, params) {
  // foliage SUGGESTED by a few short gestural strokes radiating up — no drawn leaves
  const n = rng.int(3, 5);
  const strokes = [];
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + vary(rng, 0, 0.9, params);
    const len = Math.max(4, vary(rng, 9, 4, params));
    const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
    strokes.push({ width: 1.3, segments: [{ p0: { x: 0, y: 0 }, c1: { x: ex * 0.4, y: ey * 0.4 }, c2: { x: ex * 0.8, y: ey * 0.8 }, p1: { x: ex, y: ey } }] });
  }
  const anchors = { base: { x: 0, y: 0 }, tipUp: { x: 0, y: -10 } };
  return { id: 'llorer', strokes, anchors, bounds: boundsOf(strokes) };
}

function apolloGest(rng, params) {
  // Apollo as a leaning pursuer: torso+stride and an arm reaching left toward Daphne (no head)
  const reach = Math.max(20, vary(rng, 42, 8, params));
  const bodyH = Math.max(20, vary(rng, 35, 8, params));
  const strokes = [];
  // torso leaning forward into a stride/leg
  strokes.push({ width: 3, segments: [
    { p0: { x: 0, y: -bodyH }, c1: { x: 7, y: -bodyH * 0.5 }, c2: { x: 11, y: -4 }, p1: { x: 16, y: bodyH * 0.55 } },
  ] });
  // reaching arm toward Daphne (leftward)
  strokes.push({ width: 3, segments: [
    { p0: { x: 0, y: -bodyH * 0.78 }, c1: { x: -reach * 0.4, y: -bodyH * 0.78 - 5 }, c2: { x: -reach * 0.8, y: -bodyH * 0.42 }, p1: { x: -reach, y: -bodyH * 0.36 } },
  ] });
  const anchors = { shoulder: { x: 0, y: -bodyH * 0.78 }, hand: { x: -reach, y: -bodyH * 0.36 } };
  return { id: 'apollo-gest', strokes, anchors, bounds: boundsOf(strokes) };
}

function apolloFallus(rng, params) {
  // a long line straining from the groin toward Daphne (leftward)
  const len = Math.max(16, vary(rng, 32, 6, params));
  const strokes = [{ width: 3, segments: [{ p0: { x: 12, y: 0 }, c1: { x: -len * 0.3, y: 4 }, c2: { x: -len * 0.7, y: 9 }, p1: { x: -len, y: 11 } }] }];
  const anchors = { root: { x: 12, y: 0 }, tip: { x: -len, y: 11 } };
  return { id: 'apollo-fallus', strokes, anchors, bounds: boundsOf(strokes) };
}

function riuPeneu(rng, params) {
  const n = rng.int(2, 3), w = Math.max(80, vary(rng, 150, 30, params));
  const wob = Math.max(1, vary(rng, 5, 3, params));
  const strokes = [];
  for (let i = 0; i < n; i++) {
    const y = i * 8;
    strokes.push({ width: 2, segments: [
      { p0: { x: -w / 2, y }, c1: { x: -w / 4, y: y - wob }, c2: { x: 0, y: y + wob }, p1: { x: w / 4, y } },
      { p0: { x: w / 4, y }, c1: { x: w * 0.4, y: y - wob }, c2: { x: w / 2, y: y + wob * 0.6 }, p1: { x: w / 2, y } },
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
