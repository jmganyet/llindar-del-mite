// src/grammar.js
import { applyTransform } from './geometry.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// MODE ON: two coherent characters. Position, mirroring, per-figure tilt and
// scale all vary, but the myth relations are always preserved:
//   - Apollo sits opposite Daphne and reaches toward her (pursuit)
//   - arms grow from the shoulders and fork upward into laurel (transformation)
//   - the river lies at the base
export function placeON(rng, instances, params, canvas) {
  const { W, H } = canvas, S = params.scale, placed = [];
  const tmp = params.temperature != null ? params.temperature : 1;

  // --- compositional layout (varies) ---
  const dir = rng.next() < 0.5 ? 1 : -1;          // +1: Daphne left / Apollo right; -1: swapped
  const cx = W * 0.5 + rng.range(-1, 1) * W * 0.05 * tmp;
  const cy = clamp(H * 0.44 + rng.range(-1, 1) * H * 0.05 * tmp, H * 0.34, H * 0.50);
  const gap = clamp(0.20 + Math.abs(rng.range(0, 0.12) * tmp), 0.18, 0.40) * W;
  const daphneX = clamp(cx - dir * gap / 2, W * 0.18, W * 0.82);
  const apolloX = clamp(cx + dir * gap / 2, W * 0.18, W * 0.82);

  const sD = S * (1 + rng.range(-0.12, 0.12) * tmp);
  const sA = S * (1 + rng.range(-0.12, 0.12) * tmp);
  const tiltD = rng.range(-0.18, 0.18) * tmp;     // Daphne's lean
  const tiltA = rng.range(-0.14, 0.14) * tmp;     // Apollo's lean
  const daphneFlip = rng.next() < 0.5;            // her own facing (relations hold either way)
  const apolloFlip = apolloX < daphneX;           // flip so his reach points toward Daphne

  const daphneBase = { x: daphneX, y: cy, scale: sD, rotation: tiltD, flipX: daphneFlip };
  const apolloBase = { x: apolloX, y: cy + 6, scale: sA, rotation: tiltA, flipX: apolloFlip };

  // --- Daphne cluster (attached via anchors, so coherent under any base transform) ---
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

  // --- river: always at the base ---
  if (instances['riu-peneu'])
    placed.push({ id: 'riu-peneu', transform: { x: W * 0.5 + rng.range(-1, 1) * W * 0.04 * tmp, y: H * 0.86, scale: S, rotation: 0 }, mytheme: instances['riu-peneu'] });

  return placed;
}

// MODE OFF: still two character-attempts (Daphne's mythemes cluster on one side,
// Apollo's on the other), but the INTERNAL syntax of each is broken — mythemes are
// scattered and mis-oriented within their cluster instead of attached at the right
// anchors. You read "two figures", but neither resolves.
export function placeOFF(rng, instances, params, canvas) {
  const { W, H } = canvas, S = params.scale, placed = [];
  const dir = rng.next() < 0.5 ? 1 : -1;
  const daphneX = W * 0.5 - dir * W * 0.16;
  const apolloX = W * 0.5 + dir * W * 0.16;
  const cy = H * 0.45;
  const R = 52;  // how far a mytheme drifts from its cluster centre

  const place = (id, cxp) => {
    if (!instances[id]) return;
    placed.push({
      id,
      transform: {
        x: clamp(cxp + rng.range(-1, 1) * R, W * 0.16, W * 0.84),
        y: clamp(cy + rng.range(-1, 1) * R, H * 0.16, H * 0.84),
        scale: S * (0.8 + rng.range(0, 0.5)),
        rotation: rng.range(-Math.PI, Math.PI),
        flipX: rng.next() < 0.5,
      },
      mytheme: instances[id],
    });
  };

  for (const id of ['daphne-cos', 'daphne-pit', 'bracos-branca', 'llorer']) place(id, daphneX);
  for (const id of ['apollo-gest', 'apollo-fallus']) place(id, apolloX);
  if (instances['riu-peneu'])
    placed.push({ id: 'riu-peneu', transform: { x: clamp(W * 0.5 + rng.range(-1, 1) * 60, W * 0.16, W * 0.84), y: H * (0.58 + rng.range(0, 0.22)), scale: S, rotation: rng.range(-0.4, 0.4) }, mytheme: instances['riu-peneu'] });

  return placed;
}
