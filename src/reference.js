// src/reference.js
// A FIXED, hand-authored reproduction of the Picasso plaque ("Dafnis i Febus").
// This is what the app shows on first load — the exact reference — before the
// generative system produces variations. Strokes are traced from the relief and
// grouped by mytheme: Daphne (left "K" figure), Apollo (right antler figure),
// Peneu (the river, two wavy lines at the base).
//
// Local coordinate space: x right, y DOWN (same as the mytheme vocabulary).
// Roughly [-46..46] × [-50..48]; placed centred in the clay plaque.
import { boundsOf } from './geometry.js';

// Catmull-Rom → cubic Bézier, so a polyline of points becomes a smooth incised
// curve passing through every point.
function smooth(width, pts) {
  const segments = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1];
    const pm = pts[i - 1] || p0, pn = pts[i + 2] || p1;
    segments.push({
      p0,
      c1: { x: p0.x + (p1.x - pm.x) / 6, y: p0.y + (p1.y - pm.y) / 6 },
      c2: { x: p1.x - (pn.x - p0.x) / 6, y: p1.y - (pn.y - p0.y) / 6 },
      p1,
    });
  }
  return { width, segments };
}
const P = (x, y) => ({ x, y });

// --- Daphne: the left "K" figure (body + raised arm + long leg sweep) ---------
function daphneRef() {
  const strokes = [
    // vertical trunk / spine, leaning slightly, down toward the river
    smooth(3.2, [P(-6, -36), P(-8, -18), P(-9, 0), P(-10, 16)]),
    // raised arm forking up to the right
    smooth(2.6, [P(-7, -26), P(0, -31), P(9, -37)]),
    // small branch ticking up-left off the trunk
    smooth(2.2, [P(-8, -22), P(-12, -18), P(-15, -14)]),
    // mid branch reaching right (shorter, toward centre)
    smooth(2.4, [P(-8, -8), P(0, -8), P(8, -8)]),
    // long leg sweeping down to the lower-left corner
    smooth(3.0, [P(-9, -3), P(-26, 7), P(-44, 17)]),
  ];
  return { id: 'daphne-ref', strokes, anchors: { c: P(0, 0) }, bounds: boundsOf(strokes) };
}

// --- Apollo: the right figure (antler top + body + reaching arm + curl) -------
function apolloRef() {
  const strokes = [
    // upper diagonal from centre up to the antler junction
    smooth(2.6, [P(16, -40), P(25, -31), P(34, -24)]),
    // antler / wishbone top: stem then two short, narrow tips
    smooth(3.0, [P(34, -24), P(39, -35), P(42, -45)]),
    smooth(2.0, [P(42, -45), P(40, -49)]),
    smooth(2.0, [P(42, -45), P(45, -42)]),
    // body / leg descending to the river
    smooth(3.0, [P(34, -23), P(32, -2), P(29, 18)]),
    // curl / hook off the body
    smooth(2.2, [P(34, -16), P(38, -10), P(37, -5), P(33, -6), P(35, -2)]),
    // two reaching arms sweeping down-right (clear of Daphne's mid branch)
    smooth(2.4, [P(2, -13), P(16, -6), P(30, 0)]),
    smooth(2.2, [P(7, -3), P(20, 3), P(32, 8)]),
  ];
  return { id: 'apollo-ref', strokes, anchors: { c: P(0, 0) }, bounds: boundsOf(strokes) };
}

// --- Peneu: the river, two wavy lines at the base -----------------------------
function peneuRef() {
  const strokes = [
    smooth(2.6, [P(-45, 39), P(-20, 37), P(10, 40), P(41, 38)]),
    smooth(2.4, [P(-44, 47), P(-15, 45), P(15, 47), P(39, 46)]),
    // little tent where the trunk meets the ground
    smooth(2.0, [P(-16, 39), P(-11, 34), P(-6, 39)]),
  ];
  return { id: 'peneu-ref', strokes, anchors: { c: P(0, 0) }, bounds: boundsOf(strokes) };
}

// Build the fixed placed[] for the reference, centred in the plaque.
export function referencePlaced(panel) {
  const cx = panel.x + panel.w / 2;
  const cy = panel.y + panel.h * 0.5;
  const scale = (panel.w * 0.80) / 100;   // local ±50 → fills ~80% of the plaque (breathing room)
  const t = { x: cx, y: cy, scale, rotation: 0, flipX: false };
  return [
    { id: 'daphne-ref', transform: t, mytheme: daphneRef() },
    { id: 'apollo-ref', transform: t, mytheme: apolloRef() },
    { id: 'peneu-ref', transform: t, mytheme: peneuRef() },
  ];
}
