// src/mythemes.js
import { boundsOf } from './geometry.js';

// temperature scales how far each parameter strays from its centre value.
// 0 = identical shapes every time; 1 = baseline; >1 = wilder divergence.
const temp = (params) => (params && params.temperature != null ? params.temperature : 1);
const vary = (rng, mid, spread, params) => mid + rng.range(-1, 1) * spread * temp(params);

function daphneCos(rng, params) {
  // The dominant gesture in the Picasso plaque: a large reversed-J arc.
  // Back contour swings FAR LEFT then comes back toward centre at the base.
  // Front contour is a shorter stroke that stops mid-body — it does NOT
  // close back to the hip, preventing the crossing/loop that ruins the gesture.
  const hip = Math.max(8, vary(rng, 20, 5, params));
  const waist = Math.max(1, vary(rng, 4, 1.5, params));
  const sway = vary(rng, 0, 4, params);   // subtle lateral offset of the whole figure
  const strokes = [];

  // back contour: ONE smooth J-arc from shoulder to root — the dominant gesture.
  // Swings to maximum hip extent at mid-height, returns to near-centre at the base.
  strokes.push({ width: 3.5, segments: [
    { p0: { x: sway,   y: -52 },
      c1: { x: sway - waist, y: -22 },
      c2: { x: -hip,   y: -2 },
      p1: { x: -hip,   y: 16 } },
    { p0: { x: -hip,   y: 16 },
      c1: { x: -hip * 0.65, y: 34 },
      c2: { x: -hip * 0.15, y: 50 },
      p1: { x: vary(rng, 3, 4, params), y: 60 } },
  ] });

  // front contour: short chest/torso stroke on the RIGHT side.
  // Ends at y≈8, well above the y-range where the back arc swings back,
  // so the two strokes can NEVER cross.
  strokes.push({ width: 2.5, segments: [
    { p0: { x: sway + 3, y: -46 },
      c1: { x: waist + 7, y: -28 },
      c2: { x: waist + 5, y: -10 },
      p1: { x: waist,     y:  8 } },
  ] });

  const anchors = { shoulder: { x: sway, y: -50 }, chest: { x: waist + 3, y: -26 }, hip: { x: -hip, y: 16 } };
  return { id: 'daphne-cos', strokes, anchors, bounds: boundsOf(strokes) };
}

function daphnePit(rng, params) {
  const r = Math.max(3, vary(rng, 6, 1.5, params));
  // a SINGLE abstract mark — one short hooked curve, not an anatomical pair.
  // Reads as a sign for the breast, the way Picasso notes it with one stroke.
  const strokes = [
    { width: 2, segments: [
      { p0: { x: -r * 0.5, y: -r * 0.4 }, c1: { x: r * 0.25, y: -r * 0.2 }, c2: { x: r * 0.5, y: r * 0.5 }, p1: { x: r * 0.05, y: r * 0.75 } },
    ] },
  ];
  const anchors = { attach: { x: 0, y: 0 } };
  return { id: 'daphne-pit', strokes, anchors, bounds: boundsOf(strokes) };
}

function bracosBranca(rng, params) {
  // 1–3 arms raised from the shoulders, each forking into bare twigs (fingers -> branches).
  // angle convention: measured from straight-up; tip = (sin a, -cos a) * length.
  const strokes = [];
  const anchors = { base: { x: 0, y: 0 } };
  const tipNames = [];
  let t = 0;
  const nArms = rng.int(2, 3);
  const A = 0.55;  // max fan half-angle
  for (let a = 0; a < nArms; a++) {
    const ang = (nArms === 1 ? 0 : (a / (nArms - 1) - 0.5) * 2 * A) + vary(rng, 0, 0.16, params);
    const armLen = Math.max(16, vary(rng, 38, 9, params));
    const handX = Math.sin(ang) * armLen, handY = -Math.cos(ang) * armLen;
    // bare branch: shoulder -> raised tip, one clean line
    strokes.push({ width: 3, segments: [
      { p0: { x: 0, y: 0 }, c1: { x: handX * 0.3, y: handY * 0.35 + vary(rng, 0, 3, params) }, c2: { x: handX * 0.7, y: handY * 0.7 }, p1: { x: handX, y: handY } },
    ] });
    // at most a single small fork at the tip (often none) — keep it sparse
    const twigs = rng.int(0, 1);
    for (let i = 0; i < twigs; i++) {
      const tl = Math.max(5, vary(rng, 11, 3, params));
      const fa = ang + (i === 0 ? 0.4 : -0.4) + vary(rng, 0, 0.15, params);
      const ex = handX + Math.sin(fa) * tl, ey = handY - Math.cos(fa) * tl;
      strokes.push({ width: 1.5, segments: [
        { p0: { x: handX, y: handY }, c1: { x: handX + (ex - handX) * 0.4, y: handY + (ey - handY) * 0.4 }, c2: { x: ex, y: ey + 2 }, p1: { x: ex, y: ey } },
      ] });
    }
    // the branch tip itself is a laurel anchor (used only if the optional llorer is toggled on)
    const name = 'tip' + (t++);
    anchors[name] = { x: handX, y: handY };
    tipNames.push(name);
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
  // After the Picasso reference: a tall curved stroke rising to a hook at the top,
  // with diagonal sweeps reaching toward Daphne (the pursuit). No head.
  const h = Math.max(28, vary(rng, 52, 9, params));     // height of the standing stroke
  const reach = Math.max(18, vary(rng, 40, 8, params)); // how far the sweeps reach
  const hook = Math.max(4, vary(rng, 8, 2, params));    // size of the top hook
  const strokes = [];
  // tall body stroke rising on the right, ending in a small hook
  strokes.push({ width: 3, segments: [
    { p0: { x: 0, y: 0 }, c1: { x: 4, y: -h * 0.4 }, c2: { x: -2, y: -h * 0.8 }, p1: { x: 2, y: -h } },
    { p0: { x: 2, y: -h }, c1: { x: 2 + hook, y: -h - hook }, c2: { x: 2 + hook * 1.6, y: -h + hook * 0.4 }, p1: { x: 2 + hook * 0.6, y: -h + hook * 1.6 } },
  ] });
  // arm sweeping from shoulder DOWN-toward-Daphne (diagonal, not horizontal)
  // so it reads as a pursuit gesture, not a shelf.
  const sweepY = -h * 0.55;
  const hx = -reach, hy = sweepY + reach * 0.38;   // angled downward ~21°
  strokes.push({ width: 2.5, segments: [
    { p0: { x: 2, y: sweepY }, c1: { x: -reach * 0.4, y: sweepY + reach * 0.10 }, c2: { x: -reach * 0.8, y: sweepY + reach * 0.26 }, p1: { x: hx, y: hy } },
  ] });
  const finger = (fa) => ({ width: 1.6, segments: [
    { p0: { x: hx, y: hy },
      c1: { x: hx + Math.cos(fa) * 4, y: hy + Math.sin(fa) * 4 },
      c2: { x: hx + Math.cos(fa) * 8, y: hy + Math.sin(fa) * 8 },
      p1: { x: hx + Math.cos(fa) * 11, y: hy + Math.sin(fa) * 11 } }] });
  strokes.push(finger(Math.PI * 0.90 + vary(rng, 0, 0.1, params)));
  strokes.push(finger(Math.PI * 1.14 + vary(rng, 0, 0.1, params)));
  const anchors = { shoulder: { x: 0, y: sweepY }, hand: { x: hx, y: hy }, top: { x: 2, y: -h } };
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
  const n = 2, w = Math.max(80, vary(rng, 150, 25, params));  // always 2 lines, like the Picasso
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
