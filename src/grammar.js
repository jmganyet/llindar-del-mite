// src/grammar.js
import { applyTransform, panelOf } from './geometry.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// MODE ON: two coherent characters laid out COMPACTLY inside the square panel,
// close together (Apollo's reach almost touches Daphne), river just beneath —
// after the Picasso reference. Position, mirroring, per-figure tilt and scale all
// vary, but the myth relations are always preserved:
//   - Apollo sits opposite Daphne and reaches toward her (pursuit)
//   - arms grow from the shoulders and fork upward into laurel (transformation)
//   - the river lies at the base
export function placeON(rng, instances, params, canvas, panelArg) {
  const { W, H } = canvas, S = params.scale, placed = [];
  const tmp = params.temperature != null ? params.temperature : 1;
  const panel = panelArg || panelOf(W, H);
  const pcx = panel.x + panel.w / 2;

  // --- compact layout (varies) ---
  const dir = rng.next() < 0.5 ? 1 : -1;                       // +1: Daphne left / Apollo right
  const gap = panel.w * clamp(0.22 + Math.abs(rng.range(0, 0.06) * tmp), 0.18, 0.34);
  const cx = pcx + rng.range(-1, 1) * panel.w * 0.04 * tmp;
  const cy = panel.y + panel.h * 0.46 + rng.range(-1, 1) * panel.h * 0.04 * tmp;
  const inset = (f) => [panel.x + panel.w * f, panel.x + panel.w * (1 - f)];
  const [lo, hi] = inset(0.16);
  const daphneX = clamp(cx - dir * gap / 2, lo, hi);
  const apolloX = clamp(cx + dir * gap / 2, lo, hi);

  const sD = S * (1 + rng.range(-0.10, 0.10) * tmp);
  const sA = S * (1 + rng.range(-0.10, 0.10) * tmp);
  const tiltD = rng.range(-0.16, 0.16) * tmp;
  const tiltA = rng.range(-0.12, 0.12) * tmp;
  const daphneFlip = rng.next() < 0.5;
  const apolloFlip = apolloX < daphneX;                        // face toward Daphne

  const daphneBase = { x: daphneX, y: cy, scale: sD, rotation: tiltD, flipX: daphneFlip };
  const apolloBase = { x: apolloX, y: cy + 6, scale: sA, rotation: tiltA, flipX: apolloFlip };

  // --- Daphne cluster (attached via anchors → coherent under any base transform) ---
  const cos = instances['daphne-cos'];
  if (cos) placed.push({ id: 'daphne-cos', transform: daphneBase, mytheme: cos });

  if (instances['daphne-pit'] && cos) {
    const chest = applyTransform(daphneBase, cos.anchors.chest);
    placed.push({ id: 'daphne-pit', transform: { x: chest.x, y: chest.y, scale: sD, rotation: tiltD, flipX: daphneFlip }, mytheme: instances['daphne-pit'] });
  }

  let armsT = null;
  const arms = instances['bracos-branca'];
  if (arms && cos) {
    const sh = applyTransform(daphneBase, cos.anchors.shoulder);
    armsT = { x: sh.x, y: sh.y, scale: sD, rotation: tiltD + rng.range(-0.08, 0.08) * tmp, flipX: daphneFlip };
    placed.push({ id: 'bracos-branca', transform: armsT, mytheme: arms });
  }

  if (instances['llorer'] && arms && armsT) {
    for (const tn of arms.tipNames) {
      const tip = applyTransform(armsT, arms.anchors[tn]);
      placed.push({ id: 'llorer', transform: { x: tip.x, y: tip.y, scale: sD * (0.8 + rng.range(0, 0.4)), rotation: tiltD + rng.range(-0.3, 0.3), flipX: daphneFlip }, mytheme: instances['llorer'] });
    }
  }

  // --- Apollo cluster ---
  if (instances['apollo-gest'])
    placed.push({ id: 'apollo-gest', transform: apolloBase, mytheme: instances['apollo-gest'] });
  if (instances['apollo-fallus']) {
    const root = applyTransform(apolloBase, { x: 0, y: 0 });
    placed.push({ id: 'apollo-fallus', transform: { x: root.x, y: root.y + 8, scale: sA, rotation: tiltA, flipX: apolloFlip }, mytheme: instances['apollo-fallus'] });
  }

  // --- river: always at the base, just beneath the figures, inside the panel ---
  if (instances['riu-peneu'])
    placed.push({ id: 'riu-peneu', transform: { x: pcx + rng.range(-1, 1) * panel.w * 0.03 * tmp, y: panel.y + panel.h * 0.9, scale: S, rotation: 0 }, mytheme: instances['riu-peneu'] });

  return placed;
}

// MODE OFF: still two character-attempts — Daphne's mythemes form a TIGHT cluster
// on one side, Apollo's on the other — but the INTERNAL syntax of each is broken:
// mythemes are scattered and mis-oriented within their cluster instead of attached
// at the right anchors. You read "two figures", but neither resolves.
export function placeOFF(rng, instances, params, canvas, panelArg) {
  const { W, H } = canvas, S = params.scale, placed = [];
  const panel = panelArg || panelOf(W, H);
  const pcx = panel.x + panel.w / 2, pcy = panel.y + panel.h * 0.46;
  const dir = rng.next() < 0.5 ? 1 : -1;
  const gap = panel.w * 0.24;
  const daphneX = pcx - dir * gap / 2, apolloX = pcx + dir * gap / 2;
  const R = panel.w * 0.06;  // tight scatter → each cluster still reads as one figure-attempt
  const [lo, hi] = [panel.x + panel.w * 0.1, panel.x + panel.w * 0.9];
  const [tlo, thi] = [panel.y + panel.h * 0.1, panel.y + panel.h * 0.9];

  const place = (id, cxp) => {
    if (!instances[id]) return;
    placed.push({
      id,
      transform: {
        x: clamp(cxp + rng.range(-1, 1) * R, lo, hi),
        y: clamp(pcy + rng.range(-1, 1) * R, tlo, thi),
        scale: S * (0.85 + rng.range(0, 0.35)),
        rotation: rng.range(-Math.PI, Math.PI),
        flipX: rng.next() < 0.5,
      },
      mytheme: instances[id],
    });
  };

  for (const id of ['daphne-cos', 'daphne-pit', 'bracos-branca', 'llorer']) place(id, daphneX);
  for (const id of ['apollo-gest', 'apollo-fallus']) place(id, apolloX);
  if (instances['riu-peneu'])
    placed.push({ id: 'riu-peneu', transform: { x: clamp(pcx + rng.range(-1, 1) * 40, lo, hi), y: panel.y + panel.h * (0.78 + rng.range(0, 0.12)), scale: S, rotation: rng.range(-0.3, 0.3) }, mytheme: instances['riu-peneu'] });

  return placed;
}
