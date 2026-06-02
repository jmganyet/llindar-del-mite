// src/svgexport.js
import { transformSegment } from './geometry.js';

const f = (n) => Math.round(n * 100) / 100;

export function toSVG(composition, canvas, style) {
  const { W, H } = canvas;
  let paths = '';
  for (const pl of composition.placed) {
    for (const stroke of pl.mytheme.strokes) {
      let d = '';
      stroke.segments.forEach((seg, i) => {
        const s = transformSegment(pl.transform, seg);
        if (i === 0) d += `M ${f(s.p0.x)} ${f(s.p0.y)} `;
        d += `C ${f(s.c1.x)} ${f(s.c1.y)}, ${f(s.c2.x)} ${f(s.c2.y)}, ${f(s.p1.x)} ${f(s.p1.y)} `;
      });
      paths += `<path d="${d.trim()}" fill="none" stroke="${style.stroke}" stroke-width="${stroke.width}" stroke-linecap="round"/>\n`;
    }
  }
  const p = composition.panel;
  const frame = p
    ? `<rect x="${f(p.x)}" y="${f(p.y)}" width="${f(p.w)}" height="${f(p.h)}" rx="10" fill="none" stroke="${style.stroke}" stroke-width="2"/>\n`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${style.bg}"/>\n${frame}${paths}</svg>`;
}
