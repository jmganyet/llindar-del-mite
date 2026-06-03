// src/render.js
import { transformSegment, cubicPoint } from './geometry.js';
import { singleLinePath } from './singleline.js';

const jit = (p, comp) => p.random(-1, 1) * (comp.jitter || 0);

// Palette defaults — model the physical object: a gilt wooden frame, a terracotta
// field, a raised (embossed) clay plaque, and an incised drawing whose grooves
// catch a shadow on one side and a highlight on the other. Callers may override
// any key via `style`.
function palette(style) {
  return {
    frame: style.frame || '#b8902f',     // gilt wooden frame
    frameEdge: style.frameEdge || '#8c6a1e',
    field: style.field || style.bg || '#c2693f', // terracotta field behind the plaque
    plaque: style.plaque || '#c87a52',    // raised clay plaque face
    ink: style.stroke || '#5a3320',       // incised groove (shadowed side)
    inkHi: style.inkHi || '#e0a877',      // highlit lip of the groove
  };
}

// taper profile across a whole stroke (ductus): the reed enters thin, presses
// to a belly just past the start, then lifts to a fine tail — asymmetric, like
// a hand drawing into clay. s in [0,1].
const taper = (s) => {
  const belly = Math.pow(Math.sin(Math.PI * Math.pow(s, 0.82)), 0.5);
  return 0.14 + 0.86 * belly;
};

// sample one stroke (all its segments) into a single polyline of points
function strokePolyline(transform, stroke, steps = 18) {
  const pts = [];
  stroke.segments.forEach((seg, i) => {
    const s = transformSegment(transform, seg);
    const start = i === 0 ? 0 : 1;
    for (let k = start; k <= steps; k++) pts.push(cubicPoint(s, k / steps));
  });
  return pts;
}

// draw a stroke as an incised groove: a light lip offset up-left, then the dark
// groove on top, both with calligraphic taper.
function incise(p, comp, transform, stroke, pal) {
  const pts = strokePolyline(transform, stroke);
  if (pts.length < 2) return;
  const base = stroke.width;
  const passes = [
    { col: pal.inkHi, dx: -0.8, dy: -0.8, mul: 0.9, a: 150 },
    { col: pal.ink, dx: 0, dy: 0, mul: 1, a: 255 },
  ];
  for (const pass of passes) {
    const c = p.color(pass.col); c.setAlpha(pass.a);
    p.stroke(c);
    for (let i = 1; i < pts.length; i++) {
      const s = (i - 0.5) / (pts.length - 1);
      p.strokeWeight(base * taper(s) * pass.mul + 0.2);
      const j1 = jit(p, comp), j2 = jit(p, comp);
      p.line(pts[i - 1].x + pass.dx + j1, pts[i - 1].y + pass.dy + j2,
             pts[i].x + pass.dx + j1, pts[i].y + pass.dy + j2);
    }
  }
}

// the raised clay plaque: soft drop shadow + highlight lip + flat face, no ink outline
function drawPlaque(p, panel, pal) {
  p.noStroke();
  const r = 4;  // sharp corners like pressed clay, not a rounded card
  const sh = p.color(0, 0, 0, 60); p.fill(sh);
  p.rect(panel.x + 4, panel.y + 5, panel.w, panel.h, r);            // drop shadow
  const hi = p.color(255, 255, 255, 60); p.fill(hi);
  p.rect(panel.x - 2, panel.y - 2, panel.w, panel.h, r);            // highlight lip
  p.fill(pal.plaque);
  p.rect(panel.x, panel.y, panel.w, panel.h, r);                    // face
}

export function drawComposition(p, comp, style) {
  const pal = palette(style);
  p.push();
  p.background(pal.field);
  p.noFill();
  p.strokeCap(p.ROUND);
  p.strokeJoin(p.ROUND);
  p.randomSeed(comp.seed);

  // gilt frame — thick, like the Picasso original (~14% of canvas height each side)
  if (style.frame !== false) {
    const fw = Math.round(Math.min(p.width, p.height) * 0.13);
    p.noStroke(); p.fill(pal.frame);
    p.rect(0, 0, p.width, fw); p.rect(0, p.height - fw, p.width, fw);
    p.rect(0, 0, fw, p.height); p.rect(p.width - fw, 0, fw, p.height);
    p.stroke(pal.frameEdge); p.strokeWeight(1); p.noFill();
    p.rect(fw, fw, p.width - 2 * fw, p.height - 2 * fw);
  }

  if (comp.panel) drawPlaque(p, comp.panel, pal);

  // clip all drawing to the plaque — strokes cannot exit the clay boundary
  if (comp.panel) {
    const { x, y, w, h } = comp.panel;
    p.drawingContext.save();
    p.drawingContext.beginPath();
    p.drawingContext.rect(x, y, w, h);
    p.drawingContext.clip();
  }

  if (comp.renderMode === 'single') {
    const path = singleLinePath(comp.placed);
    if (path.length) {
      // taper a single continuous incised line
      const stroke = { width: 3, segments: [] };
      for (let i = 0; i < path.length - 1; i++)
        stroke.segments.push({ p0: path[i], c1: path[i], c2: path[i + 1], p1: path[i + 1] });
      incise(p, comp, { x: 0, y: 0, scale: 1, rotation: 0 }, stroke, pal);
    }
  } else {
    for (const pl of comp.placed)
      for (const stroke of pl.mytheme.strokes)
        incise(p, comp, pl.transform, stroke, pal);
  }

  if (comp.panel) p.drawingContext.restore();
  p.pop();
}
