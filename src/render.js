// src/render.js
import { transformSegment } from './geometry.js';
import { singleLinePath } from './singleline.js';

const jit = (p, comp) => p.random(-1, 1) * (comp.jitter || 0);

export function drawComposition(p, comp, style) {
  p.push();
  p.background(style.bg);
  p.noFill();
  p.stroke(style.stroke);
  p.strokeCap(p.ROUND);
  p.randomSeed(comp.seed);

  if (comp.renderMode === 'single') {
    const path = singleLinePath(comp.placed);
    p.strokeWeight(3);
    p.beginShape();
    if (path.length) p.curveVertex(path[0].x, path[0].y);
    for (const pt of path) p.curveVertex(pt.x + jit(p, comp), pt.y + jit(p, comp));
    if (path.length) p.curveVertex(path[path.length - 1].x, path[path.length - 1].y);
    p.endShape();
  } else {
    for (const pl of comp.placed) {
      for (const stroke of pl.mytheme.strokes) {
        p.strokeWeight(stroke.width);
        for (const seg of stroke.segments) {
          const s = transformSegment(pl.transform, seg);
          p.bezier(
            s.p0.x + jit(p, comp), s.p0.y + jit(p, comp),
            s.c1.x, s.c1.y, s.c2.x, s.c2.y,
            s.p1.x + jit(p, comp), s.p1.y + jit(p, comp),
          );
        }
      }
    }
  }
  p.pop();
}
