import { HOME_STROKES } from './strokes.js';
import { resolveAnchor } from './variation.js';

const ANCHOR_RULES = {
  'dafne-cap':        {parent:'dafne-cos',  pAnchor:'top',   cAnchor:'base'},
  'dafne-branca-esq': {parent:'dafne-cos',  pAnchor:'top',   cAnchor:'base'},
  'dafne-branca-dre': {parent:'dafne-cos',  pAnchor:'top',   cAnchor:'base'},
  'dafne-pit':        {parent:'dafne-cos',  pAnchor:'chest', cAnchor:'base'},
  'dafne-cames':      {parent:'dafne-cos',  pAnchor:'hip',   cAnchor:'base'},
  'apollo-cos':       {parent:'apollo-cap', pAnchor:'base',  cAnchor:'top'},
  'apollo-brac':      {parent:'apollo-cos', pAnchor:'mid',   cAnchor:'base'},
  'apollo-fallus':    {parent:'apollo-cos', pAnchor:'base',  cAnchor:'base'},
  'apollo-cames':     {parent:'apollo-cos', pAnchor:'base',  cAnchor:'base'},
};

const MASTERS = ['dafne-cos','apollo-cap','peneu-onada-1','peneu-onada-2'];

function translate(variedStroke, dx, dy) {
  return {
    ...variedStroke,
    segments: variedStroke.segments.map(seg => ({
      p0:{x:seg.p0.x+dx,y:seg.p0.y+dy},
      c1:{x:seg.c1.x+dx,y:seg.c1.y+dy},
      c2:{x:seg.c2.x+dx,y:seg.c2.y+dy},
      p1:{x:seg.p1.x+dx,y:seg.p1.y+dy},
    })),
  };
}

function rotate(variedStroke, angle) {
  const pts = variedStroke.segments.flatMap(s=>[s.p0,s.c1,s.c2,s.p1]);
  const cx = pts.reduce((a,p)=>a+p.x,0)/pts.length;
  const cy = pts.reduce((a,p)=>a+p.y,0)/pts.length;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const rot = p => ({
    x: cx + (p.x-cx)*cos - (p.y-cy)*sin,
    y: cy + (p.x-cx)*sin + (p.y-cy)*cos,
  });
  return {
    ...variedStroke,
    segments: variedStroke.segments.map(seg => ({
      p0:rot(seg.p0), c1:rot(seg.c1), c2:rot(seg.c2), p1:rot(seg.p1),
    })),
  };
}

export function placeON(variedMap, rng, D) {
  const placed = {};
  const JITTER = 15;

  for (const id of MASTERS) {
    if (!variedMap[id]) continue;
    const dx = rng.range(-1,1) * D * JITTER;
    const dy = rng.range(-1,1) * D * JITTER;
    placed[id] = translate(variedMap[id], dx, dy);
  }

  for (const id of Object.keys(ANCHOR_RULES)) {
    if (!variedMap[id]) continue;
    const rule = ANCHOR_RULES[id];
    if (!placed[rule.parent]) continue;
    const parentPt = resolveAnchor(placed[rule.parent],
                       HOME_STROKES[rule.parent].anchorMap, rule.pAnchor);
    const childHomePt = resolveAnchor(variedMap[id],
                         HOME_STROKES[id].anchorMap, rule.cAnchor);
    placed[id] = translate(variedMap[id],
      parentPt.x - childHomePt.x,
      parentPt.y - childHomePt.y);
  }

  return placed;
}

export function placeOFF(variedMap, rng, canvas) {
  const placed = {};
  for (const id of Object.keys(variedMap)) {
    const pts = variedMap[id].segments.flatMap(s=>[s.p0,s.c1,s.c2,s.p1]);
    const cx = pts.reduce((a,p)=>a+p.x,0)/pts.length;
    const cy = pts.reduce((a,p)=>a+p.y,0)/pts.length;
    const newCx = rng.range(canvas.W*0.1, canvas.W*0.9);
    const newCy = rng.range(canvas.H*0.1, canvas.H*0.9);
    const angle = rng.range(-Math.PI, Math.PI);
    let s = translate(variedMap[id], newCx-cx, newCy-cy);
    s = rotate(s, angle);
    placed[id] = s;
  }
  return placed;
}
