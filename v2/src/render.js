// v2/src/render.js
// Canvas is 760×960; home coords are 380×480 → scale(2) applied here.
const SCALE = 2;

export function drawComposition(p, comp, style) {
  p.push();
  p.background(style.bg);
  p.noFill();
  p.stroke(style.stroke);
  p.strokeCap(p.ROUND);
  p.randomSeed(comp.seed);
  p.scale(SCALE);

  for (const pl of comp.placed) {
    const jitter = comp.distance * 1.5; // max 1.5px tremolor at D=1 (home space)
    p.strokeWeight(pl.strokeWidth);
    for (const seg of pl.segments) {
      const j = () => p.random(-1, 1) * jitter;
      p.bezier(
        seg.p0.x + j(), seg.p0.y + j(),
        seg.c1.x, seg.c1.y,
        seg.c2.x, seg.c2.y,
        seg.p1.x + j(), seg.p1.y + j(),
      );
    }
  }

  p.pop();
  // Seed label (unscaled)
  p.push();
  p.noStroke();
  p.fill(style.stroke);
  p.textSize(11);
  const label = `seed ${comp.seed} · ${comp.grammar} · D ${comp.distance.toFixed(2)}`;
  p.text(label, 10, 952);
  p.pop();
}
