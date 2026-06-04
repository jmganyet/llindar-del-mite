// 13 home bezier paths traced from Picasso CE00056 (Dafnis i Febus)
// Coordinate space: 380×480 (matches SVG tracing session)
// Note: leg endpoints reach y≈498, slightly beyond the 480 frame — intentional,
// mirrors Picasso where legs extend to the composition edge. p5 clips naturally.

export const STROKE_ORDER = [
  'dafne-cos','dafne-cap','dafne-branca-esq','dafne-branca-dre','dafne-pit','dafne-cames',
  'apollo-cap','apollo-cos','apollo-brac','apollo-fallus','apollo-cames',
  'peneu-onada-1','peneu-onada-2',
];

export const STROKE_CHARACTERS = {
  'dafne-cos':'dafne','dafne-cap':'dafne','dafne-branca-esq':'dafne',
  'dafne-branca-dre':'dafne','dafne-pit':'dafne','dafne-cames':'dafne',
  'apollo-cap':'apollo','apollo-cos':'apollo','apollo-brac':'apollo',
  'apollo-fallus':'apollo','apollo-cames':'apollo',
  'peneu-onada-1':'peneu','peneu-onada-2':'peneu',
};

export const STROKE_LABELS = {
  'dafne-cos':'Cos','dafne-cap':'Cap','dafne-branca-esq':'Branca ←',
  'dafne-branca-dre':'Branca →','dafne-pit':'Pit','dafne-cames':'Cames',
  'apollo-cap':'Cap','apollo-cos':'Cos','apollo-brac':'Braç',
  'apollo-fallus':'Fal·lus','apollo-cames':'Cames',
  'peneu-onada-1':'Onada sup.','peneu-onada-2':'Onada inf.',
};

export const HOME_STROKES = {
  'dafne-cos': {
    id:'dafne-cos', character:'dafne', strokeWidth:3.5,
    segments:[
      {p0:{x:198,y:462},c1:{x:240,y:444},c2:{x:258,y:406},p1:{x:235,y:350}},
      {p0:{x:235,y:350},c1:{x:212,y:294},c2:{x:162,y:268},p1:{x:170,y:204}},
      {p0:{x:170,y:204},c1:{x:177,y:153},c2:{x:202,y:128},p1:{x:185,y:82}},
    ],
    anchorMap:{
      top:   {segIdx:-1,point:'p1'},
      chest: {segIdx:1, point:'p1'},
      hip:   {segIdx:0, point:'p0'},
    },
  },
  'dafne-cap': {
    id:'dafne-cap', character:'dafne', strokeWidth:2.2,
    segments:[
      {p0:{x:178,y:74},c1:{x:180,y:62},c2:{x:191,y:59},p1:{x:194,y:70}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'} },
  },
  'dafne-branca-esq': {
    id:'dafne-branca-esq', character:'dafne', strokeWidth:2.8,
    segments:[
      {p0:{x:185,y:82},c1:{x:170,y:60},c2:{x:150,y:40},p1:{x:118,y:12}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'}, tip:{segIdx:-1,point:'p1'} },
  },
  'dafne-branca-dre': {
    id:'dafne-branca-dre', character:'dafne', strokeWidth:2.8,
    segments:[
      {p0:{x:185,y:82},c1:{x:198,y:56},c2:{x:215,y:38},p1:{x:238,y:14}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'}, tip:{segIdx:-1,point:'p1'} },
  },
  'dafne-pit': {
    id:'dafne-pit', character:'dafne', strokeWidth:2.2,
    segments:[
      {p0:{x:196,y:244},c1:{x:203,y:228},c2:{x:220,y:226},p1:{x:222,y:242}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'} },
  },
  'dafne-cames': {
    id:'dafne-cames', character:'dafne', strokeWidth:2.5,
    segments:[
      {p0:{x:198,y:462},c1:{x:180,y:474},c2:{x:163,y:487},p1:{x:146,y:498}},
      {p0:{x:215,y:455},c1:{x:228,y:470},c2:{x:240,y:484},p1:{x:248,y:498}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'} },
  },
  'apollo-cap': {
    id:'apollo-cap', character:'apollo', strokeWidth:3.0,
    segments:[
      {p0:{x:312,y:106},c1:{x:311,y:120},c2:{x:310,y:138},p1:{x:312,y:158}},
    ],
    anchorMap:{ top:{segIdx:0,point:'p0'}, base:{segIdx:-1,point:'p1'} },
  },
  'apollo-cos': {
    id:'apollo-cos', character:'apollo', strokeWidth:3.2,
    segments:[
      {p0:{x:310,y:164},c1:{x:309,y:195},c2:{x:308,y:228},p1:{x:310,y:268}},
    ],
    anchorMap:{
      top: {segIdx:0, point:'p0'},
      mid: {segIdx:0, point:'c1'},
      base:{segIdx:-1,point:'p1'},
    },
  },
  'apollo-brac': {
    id:'apollo-brac', character:'apollo', strokeWidth:2.5,
    segments:[
      {p0:{x:308,y:218},c1:{x:290,y:228},c2:{x:268,y:236},p1:{x:246,y:248}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'}, tip:{segIdx:-1,point:'p1'} },
  },
  'apollo-fallus': {
    id:'apollo-fallus', character:'apollo', strokeWidth:2.5,
    segments:[
      {p0:{x:310,y:280},c1:{x:328,y:279},c2:{x:344,y:279},p1:{x:362,y:280}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'} },
  },
  'apollo-cames': {
    id:'apollo-cames', character:'apollo', strokeWidth:2.2,
    segments:[
      {p0:{x:310,y:295},c1:{x:320,y:325},c2:{x:326,y:358},p1:{x:328,y:392}},
      {p0:{x:294,y:300},c1:{x:280,y:332},c2:{x:270,y:362},p1:{x:264,y:395}},
    ],
    anchorMap:{ base:{segIdx:0,point:'p0'} },
  },
  'peneu-onada-1': {
    id:'peneu-onada-1', character:'peneu', strokeWidth:2.5,
    segments:[
      {p0:{x:48,y:462}, c1:{x:80,y:452}, c2:{x:100,y:472},p1:{x:134,y:462}},
      {p0:{x:134,y:462},c1:{x:168,y:452},c2:{x:188,y:472},p1:{x:222,y:462}},
      {p0:{x:222,y:462},c1:{x:256,y:452},c2:{x:276,y:472},p1:{x:308,y:462}},
      {p0:{x:308,y:462},c1:{x:328,y:457},c2:{x:348,y:462},p1:{x:368,y:458}},
    ],
    anchorMap:{ center:{segIdx:1,point:'p1'} },
  },
  'peneu-onada-2': {
    id:'peneu-onada-2', character:'peneu', strokeWidth:2.0,
    segments:[
      {p0:{x:52,y:478}, c1:{x:84,y:468}, c2:{x:104,y:488},p1:{x:138,y:478}},
      {p0:{x:138,y:478},c1:{x:172,y:468},c2:{x:192,y:488},p1:{x:226,y:478}},
      {p0:{x:226,y:478},c1:{x:260,y:468},c2:{x:280,y:488},p1:{x:312,y:478}},
      {p0:{x:312,y:478},c1:{x:332,y:473},c2:{x:350,y:476},p1:{x:368,y:472}},
    ],
    anchorMap:{ center:{segIdx:1,point:'p1'} },
  },
};
