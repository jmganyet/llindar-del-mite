// src/grammar.js
import { applyTransform } from './geometry.js';

export function placeON(rng, instances, params, canvas) {
  const { W, H } = canvas, S = params.scale, placed = [];
  const dCx = W * 0.40, dCy = H * 0.50;
  const cosT = { x: dCx, y: dCy, scale: S, rotation: 0 };
  const cos = instances['daphne-cos'];
  if (cos) placed.push({ id: 'daphne-cos', transform: cosT, mytheme: cos });

  if (instances['daphne-pit'] && cos) {
    const chest = applyTransform(cosT, cos.anchors.chest);
    placed.push({ id: 'daphne-pit', transform: { x: chest.x, y: chest.y, scale: S, rotation: 0 }, mytheme: instances['daphne-pit'] });
  }

  let armsT = null;
  const arms = instances['bracos-branca'];
  if (arms && cos) {
    const sh = applyTransform(cosT, cos.anchors.shoulder);
    armsT = { x: sh.x, y: sh.y, scale: S, rotation: rng.range(-0.1, 0.1) };
    placed.push({ id: 'bracos-branca', transform: armsT, mytheme: arms });
  }

  if (instances['llorer'] && arms && armsT) {
    for (const tn of arms.tipNames) {
      const tip = applyTransform(armsT, arms.anchors[tn]);
      placed.push({ id: 'llorer', transform: { x: tip.x, y: tip.y, scale: S * rng.range(0.8, 1.2), rotation: rng.range(-0.3, 0.3) }, mytheme: instances['llorer'] });
    }
  }

  if (instances['riu-peneu'])
    placed.push({ id: 'riu-peneu', transform: { x: W * 0.5, y: H * 0.85, scale: S, rotation: 0 }, mytheme: instances['riu-peneu'] });

  const aCx = W * 0.68, aCy = H * 0.45;
  if (instances['apollo-gest'])
    placed.push({ id: 'apollo-gest', transform: { x: aCx, y: aCy, scale: S, rotation: 0 }, mytheme: instances['apollo-gest'] });
  if (instances['apollo-fallus'])
    placed.push({ id: 'apollo-fallus', transform: { x: aCx, y: aCy + 10, scale: S, rotation: 0 }, mytheme: instances['apollo-fallus'] });

  return placed;
}

export function placeOFF(rng, instances, params, canvas) {
  const { W, H } = canvas, S = params.scale, placed = [];
  for (const id of Object.keys(instances)) {
    placed.push({
      id,
      transform: {
        x: rng.range(W * 0.15, W * 0.85), y: rng.range(H * 0.15, H * 0.85),
        scale: S * rng.range(0.7, 1.3), rotation: rng.range(-Math.PI, Math.PI),
      },
      mytheme: instances[id],
    });
  }
  return placed;
}
