// src/singleline.js
export function singleLinePath(placed) {
  const pts = placed.map(p => ({ x: p.transform.x, y: p.transform.y }));
  if (pts.length < 2) return pts;
  const remaining = pts.slice().sort((a, b) => a.x - b.x);
  const path = [remaining.shift()];
  while (remaining.length) {
    const last = path[path.length - 1];
    let bi = 0, bd = Infinity;
    remaining.forEach((p, i) => {
      const d = (p.x - last.x) ** 2 + (p.y - last.y) ** 2;
      if (d < bd) { bd = d; bi = i; }
    });
    path.push(remaining.splice(bi, 1)[0]);
  }
  return path;
}
