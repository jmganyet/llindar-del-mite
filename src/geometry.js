// src/geometry.js
export function applyTransform(t, p) {
  const s = t.scale ?? 1, r = t.rotation ?? 0, fx = t.flipX ? -1 : 1;
  const cos = Math.cos(r), sin = Math.sin(r);
  const x = p.x * s * fx, y = p.y * s;
  return { x: t.x + x * cos - y * sin, y: t.y + x * sin + y * cos };
}

export function transformSegment(t, seg) {
  return {
    p0: applyTransform(t, seg.p0), c1: applyTransform(t, seg.c1),
    c2: applyTransform(t, seg.c2), p1: applyTransform(t, seg.p1),
  };
}

export function cubicPoint(seg, u) {
  const mu = 1 - u;
  const a = mu * mu * mu, b = 3 * mu * mu * u, c = 3 * mu * u * u, d = u * u * u;
  return {
    x: a * seg.p0.x + b * seg.c1.x + c * seg.c2.x + d * seg.p1.x,
    y: a * seg.p0.y + b * seg.c1.y + c * seg.c2.y + d * seg.p1.y,
  };
}

// the square leather panel the scene is drawn inside (centred inset of the canvas)
export function panelOf(W, H) {
  const s = Math.min(W, H) * 0.78;
  return { x: (W - s) / 2, y: (H - s) / 2, w: s, h: s };
}

export function resolveAnchor(placed, name) {
  return applyTransform(placed.transform, placed.mytheme.anchors[name]);
}

export function boundsOf(strokes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes) for (const seg of s.segments)
    for (const p of [seg.p0, seg.c1, seg.c2, seg.p1]) {
      if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
    }
  return { minX, minY, maxX, maxY };
}
