// v2/src/variation.js
const MAX_CURVE = 30;

export function applyVariation(homeStroke, rng, D) {
  const segments = homeStroke.segments.map(seg => ({
    p0: { ...seg.p0 },
    c1: { x: seg.c1.x + rng.range(-1, 1) * D * MAX_CURVE,
          y: seg.c1.y + rng.range(-1, 1) * D * MAX_CURVE },
    c2: { x: seg.c2.x + rng.range(-1, 1) * D * MAX_CURVE,
          y: seg.c2.y + rng.range(-1, 1) * D * MAX_CURVE },
    p1: { ...seg.p1 },
  }));
  return { id: homeStroke.id, character: homeStroke.character,
           strokeWidth: homeStroke.strokeWidth, segments };
}

export function resolveAnchor(variedStroke, anchorMap, name) {
  const { segIdx, point } = anchorMap[name];
  const seg = variedStroke.segments[
    segIdx < 0 ? variedStroke.segments.length + segIdx : segIdx];
  return { ...seg[point] };
}
