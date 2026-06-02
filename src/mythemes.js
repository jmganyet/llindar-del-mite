// src/mythemes.js
import { boundsOf } from './geometry.js';

function daphneCos(rng) {
  const hip = rng.range(11, 16);      // hip outward swell
  const waist = rng.range(3, 6);      // waist pinch
  const headR = rng.range(4.5, 6);    // head radius
  const strokes = [];
  // back/spine contour: head -> shoulder -> waist (in) -> hip (out) -> leg merging into trunk/root
  strokes.push({ width: 3, segments: [
    { p0: { x: 0, y: -55 }, c1: { x: -waist, y: -42 }, c2: { x: -waist, y: -26 }, p1: { x: -waist * 0.5, y: -12 } },
    { p0: { x: -waist * 0.5, y: -12 }, c1: { x: -hip * 0.5, y: 2 }, c2: { x: -hip, y: 14 }, p1: { x: -hip * 0.6, y: 32 } },
    { p0: { x: -hip * 0.6, y: 32 }, c1: { x: -hip * 0.3, y: 44 }, c2: { x: -2, y: 52 }, p1: { x: 0, y: 60 } },
  ] });
  // front contour: throat -> bust -> belly -> back to hip
  strokes.push({ width: 2, segments: [
    { p0: { x: 0, y: -50 }, c1: { x: waist + 5, y: -38 }, c2: { x: waist + 3, y: -22 }, p1: { x: waist * 0.5, y: -12 } },
    { p0: { x: waist * 0.5, y: -12 }, c1: { x: hip * 0.7, y: 4 }, c2: { x: hip * 0.6, y: 22 }, p1: { x: -hip * 0.6, y: 32 } },
  ] });
  // head (small oval)
  strokes.push({ width: 2, segments: [
    { p0: { x: 0, y: -55 }, c1: { x: headR, y: -57 }, c2: { x: headR, y: -66 }, p1: { x: 0, y: -67 } },
    { p0: { x: 0, y: -67 }, c1: { x: -headR, y: -66 }, c2: { x: -headR, y: -57 }, p1: { x: 0, y: -55 } },
  ] });
  const anchors = { shoulder: { x: 0, y: -48 }, chest: { x: waist + 1, y: -28 }, hip: { x: -hip * 0.6, y: 32 }, head: { x: 0, y: -61 } };
  return { id: 'daphne-cos', strokes, anchors, bounds: boundsOf(strokes) };
}

function daphnePit(rng) {
  const r = rng.range(5, 7.5);
  // each breast: a rounded under-curve with a small nipple tick
  const breast = (cx, dir) => ([
    { p0: { x: cx - r * dir, y: -r * 0.4 }, c1: { x: cx - r * dir, y: r * 0.8 }, c2: { x: cx + r * dir, y: r * 0.8 }, p1: { x: cx + r * dir, y: -r * 0.2 } },
  ]);
  const strokes = [
    { width: 2, segments: breast(-r * 0.7, 1) },
    { width: 2, segments: breast(r * 1.0, 1) },
  ];
  const anchors = { attach: { x: 0, y: 0 } };
  return { id: 'daphne-pit', strokes, anchors, bounds: boundsOf(strokes) };
}

function bracosBranca(rng) {
  // two arms raised from the shoulders, each forking into twigs (fingers -> branches)
  const strokes = [];
  const anchors = { base: { x: 0, y: 0 } };
  const tipNames = [];
  let t = 0;
  for (let a = 0; a < 2; a++) {
    const side = a === 0 ? -1 : 1;
    const spread = rng.range(15, 24);
    const rise = rng.range(30, 44);
    const handX = side * spread, handY = -rise;
    // upper arm: shoulder -> elbow -> raised hand
    strokes.push({ width: 3, segments: [
      { p0: { x: 0, y: 0 }, c1: { x: side * spread * 0.3, y: -rise * 0.3 }, c2: { x: side * spread * 0.7, y: -rise * 0.6 }, p1: { x: handX, y: handY } },
    ] });
    // twigs sprouting from the hand
    const twigs = rng.int(2, 3);
    for (let i = 0; i < twigs; i++) {
      const tl = rng.range(9, 15);
      const ang = -Math.PI / 2 + side * 0.25 + (i - (twigs - 1) / 2) * 0.5;
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

function llorer(rng) {
  // a denser spray of leaf-shaped lenses radiating mostly upward
  const n = rng.int(5, 8);
  const strokes = [];
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + rng.range(-1.0, 1.0);
    const len = rng.range(7, 13);
    const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len;
    const nx = -Math.sin(ang), ny = Math.cos(ang);   // unit normal
    const w = len * 0.28;                              // leaf half-width
    // two arcs from base to tip forming a leaf
    strokes.push({ width: 1.2, segments: [{ p0: { x: 0, y: 0 }, c1: { x: ex * 0.3 + nx * w, y: ey * 0.3 + ny * w }, c2: { x: ex * 0.7 + nx * w, y: ey * 0.7 + ny * w }, p1: { x: ex, y: ey } }] });
    strokes.push({ width: 1.2, segments: [{ p0: { x: 0, y: 0 }, c1: { x: ex * 0.3 - nx * w, y: ey * 0.3 - ny * w }, c2: { x: ex * 0.7 - nx * w, y: ey * 0.7 - ny * w }, p1: { x: ex, y: ey } }] });
  }
  const anchors = { base: { x: 0, y: 0 }, tipUp: { x: 0, y: -10 } };
  return { id: 'llorer', strokes, anchors, bounds: boundsOf(strokes) };
}

function apolloGest(rng) {
  // Apollo as a leaning pursuer: head, torso+leg, and an arm reaching left toward Daphne
  const reach = rng.range(36, 48);
  const headR = rng.range(4.5, 6);
  const bodyH = rng.range(30, 40);
  const strokes = [];
  // head (oval atop the torso)
  strokes.push({ width: 2, segments: [
    { p0: { x: 0, y: -bodyH }, c1: { x: headR, y: -bodyH - headR }, c2: { x: headR, y: -bodyH - headR * 2.3 }, p1: { x: 0, y: -bodyH - headR * 2.3 } },
    { p0: { x: 0, y: -bodyH - headR * 2.3 }, c1: { x: -headR, y: -bodyH - headR * 2.3 }, c2: { x: -headR, y: -bodyH - headR }, p1: { x: 0, y: -bodyH } },
  ] });
  // torso leaning forward into a stride/leg
  strokes.push({ width: 3, segments: [
    { p0: { x: 0, y: -bodyH }, c1: { x: 7, y: -bodyH * 0.5 }, c2: { x: 11, y: -4 }, p1: { x: 16, y: bodyH * 0.55 } },
  ] });
  // reaching arm toward Daphne (leftward)
  strokes.push({ width: 3, segments: [
    { p0: { x: 0, y: -bodyH * 0.72 }, c1: { x: -reach * 0.4, y: -bodyH * 0.72 - 5 }, c2: { x: -reach * 0.8, y: -bodyH * 0.42 }, p1: { x: -reach, y: -bodyH * 0.36 } },
  ] });
  const anchors = { shoulder: { x: 0, y: -bodyH * 0.72 }, hand: { x: -reach, y: -bodyH * 0.36 }, head: { x: 0, y: -bodyH - headR } };
  return { id: 'apollo-gest', strokes, anchors, bounds: boundsOf(strokes) };
}

function apolloFallus(rng) {
  // a long line straining from the groin toward Daphne (leftward)
  const len = rng.range(26, 38);
  const strokes = [{ width: 3, segments: [{ p0: { x: 12, y: 0 }, c1: { x: -len * 0.3, y: 4 }, c2: { x: -len * 0.7, y: 9 }, p1: { x: -len, y: 11 } }] }];
  const anchors = { root: { x: 12, y: 0 }, tip: { x: -len, y: 11 } };
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
