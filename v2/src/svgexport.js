// v2/src/svgexport.js
const f = n => Math.round(n * 10) / 10;

export function toSVG(composition, display, style) {
  const { W, H, scale: S } = display;
  let paths = '';
  for (const pl of composition.placed) {
    let d = '';
    pl.segments.forEach((seg, i) => {
      const p0 = { x: seg.p0.x * S, y: seg.p0.y * S };
      const c1 = { x: seg.c1.x * S, y: seg.c1.y * S };
      const c2 = { x: seg.c2.x * S, y: seg.c2.y * S };
      const p1 = { x: seg.p1.x * S, y: seg.p1.y * S };
      if (i === 0) d += `M ${f(p0.x)} ${f(p0.y)} `;
      d += `C ${f(c1.x)} ${f(c1.y)}, ${f(c2.x)} ${f(c2.y)}, ${f(p1.x)} ${f(p1.y)} `;
    });
    paths += `<path d="${d.trim()}" fill="none" stroke="${style.stroke}" `
           + `stroke-width="${pl.strokeWidth * S}" stroke-linecap="round"/>\n`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" `
       + `viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${style.bg}"/>\n`
       + paths + `</svg>`;
}
