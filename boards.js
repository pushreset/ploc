// Unlockable keyboard plates. Each one = a cell mask (which grid cells hold a key) + a normalized outline
// that is auto-scaled until every key fits inside it, so shapes never need hand-tuned sizes.
// Pure math (no three.js) so node can check it.
export const PITCH = 1.12;
const KEY_HALF = 0.6; // keycap half-size (0.47) + breathing room to the plate edge

const TAU = Math.PI * 2;
const ring = (n, f) => Array.from({ length: n }, (_, k) => f((k / n) * TAU));
const OUTLINES = {
  heart: () => ring(160, (t) => [16 * Math.sin(t) ** 3 / 16, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16]),
  cloud: () => ring(200, (t) => { const r = 1 + 0.08 * Math.cos(10 * t); return [1.75 * r * Math.cos(t), 0.95 * r * Math.sin(t)]; }),
  flower: () => ring(200, (t) => { const r = 1 + 0.14 * Math.cos(6 * t + Math.PI / 6); return [r * Math.cos(t), r * Math.sin(t)]; }),
  tree: () => {
    // round canopy + chunky trunk
    const cy = 0.3, tw = 0.32, a = Math.asin(tw), pts = [];
    for (let k = 0; k <= 120; k++) { const t = -Math.PI / 2 + a + (k / 120) * (TAU - 2 * a); pts.push([Math.cos(t), cy + Math.sin(t)]); }
    pts.push([-tw, -1.15], [tw, -1.15]);
    return pts;
  },
  cat: () => {
    // round head + two big triangle ears
    const el = (t) => [1.15 * Math.cos(t), 0.9 * Math.sin(t)], d = Math.PI / 180, pts = [];
    const arc = (a, b) => { for (let k = 0; k <= 30; k++) pts.push(el((a + ((b - a) * k) / 30) * d)); };
    arc(-90, 12); pts.push([1.2, 1.25]); arc(62, 118); pts.push([-1.2, 1.25]); arc(168, 270);
    return pts;
  },
};

export const BOARDS = [
  { id: 'classic', name: 'Classique', at: 0,  mask: ['XXXX', 'XXXX', 'XXXX'],              plate: '#fffafd', deck: '#f0d6e3' },
  { id: 'heart',   name: 'Cœur',      at: 5,  mask: ['XX.XX', 'XXXXX', '.XXX.', '..X..'],  plate: '#ffd3e2', deck: '#ffb0c9', outline: 'heart' },
  { id: 'cloud',   name: 'Nuage',     at: 10, mask: ['..XX...', '.XXXXX.', 'XXXXXXX'],     plate: '#f6f9ff', deck: '#d9e6fb', outline: 'cloud' },
  { id: 'flower',  name: 'Fleur',     at: 18, mask: ['.XX.', 'XXXX', 'XXXX', '.XX.'],      plate: '#fff2b8', deck: '#ffdd75', outline: 'flower' },
  { id: 'tree',    name: 'Arbre',     at: 28, mask: ['.XXX.', 'XXXXX', '.XXX.', '..X..'],  plate: '#d4efc8', deck: '#a9dc9a', outline: 'tree' },
  { id: 'cat',     name: 'Chat',      at: 40, mask: ['X...X', 'XXXXX', 'XXXXX', '.XXX.'],  plate: '#ece2fc', deck: '#d3c1f6', outline: 'cat' },
];
export const BOARD_BY_ID = Object.fromEntries(BOARDS.map((b) => [b.id, b]));

// physical key grid: mask cell (row, col) -> e.code, so the keyboard matches the plate's shape
const KEYROWS = [
  ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'],
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'],
];
// AZERTY fallback labels per code (browsers without getLayoutMap); keydown corrects them live
export const DEFAULT_LABELS = Object.fromEntries(KEYROWS.flatMap((row, r) =>
  row.map((code, c) => [code, [[...'1234567'], [...'AZERTYU'], [...'QSDFGHJ'], [...'WXCVBN,']][r][c]])));

// cells in reading order; x right, y = shape-space up (world -z), centered on the mask
export function cells(b) {
  const rows = b.mask.length, cols = Math.max(...b.mask.map((m) => m.length)), out = [];
  const r0 = KEYROWS.length - rows; // 3-row plates use Q/A/Z rows, 4-row plates add the digit row
  b.mask.forEach((line, r) => [...line].forEach((ch, c) => {
    if (ch === 'X') out.push({ r, c, x: (c - (cols - 1) / 2) * PITCH, y: ((rows - 1) / 2 - r) * PITCH, code: KEYROWS[r0 + r][c] });
  }));
  return out;
}

function inside([x, y], poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const probes = (cs) => cs.flatMap(({ x, y }) =>
  [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]].map(([dx, dy]) => [x + dx * KEY_HALF, y + dy * KEY_HALF]));
export const fits = (poly, cs) => probes(cs).every((p) => inside(p, poly));

function roundedRect(w, h, r) {
  const pts = [], q = (cx, cy, a0) => { for (let k = 0; k <= 8; k++) { const a = a0 + (k / 8) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  q(w / 2 - r, h / 2 - r, 0); q(-w / 2 + r, h / 2 - r, Math.PI / 2); q(-w / 2 + r, -h / 2 + r, Math.PI); q(w / 2 - r, -h / 2 + r, Math.PI * 1.5);
  return pts;
}

// smallest uniform scale (+ vertical shift) that wraps every key
const cache = {};
export function outline(b) {
  if (cache[b.id]) return cache[b.id];
  const cs = cells(b);
  if (!b.outline) {
    const xs = cs.map((c) => c.x), ys = cs.map((c) => c.y);
    const w = Math.max(...xs) - Math.min(...xs) + 2 * KEY_HALF + 0.3, h = Math.max(...ys) - Math.min(...ys) + 2 * KEY_HALF + 0.3; // +0.3 keeps corner keys clear of the rounded corners
    return (cache[b.id] = roundedRect(w, h, 0.3));
  }
  const base = OUTLINES[b.outline]();
  for (let s = 1; s < 12; s += 0.04)
    for (let k = 0; k <= 60; k++) {
      const dy = ((k % 2 ? 1 : -1) * Math.ceil(k / 2)) * 0.05; // try small shifts first
      const poly = base.map(([x, y]) => [x * s, y * s + dy]);
      if (fits(poly, cs)) return (cache[b.id] = poly);
    }
  throw new Error(`board ${b.id}: no fit`);
}
export const bounds = (poly) => ({
  w: Math.max(...poly.map((p) => p[0])) - Math.min(...poly.map((p) => p[0])),
  d: Math.max(...poly.map((p) => p[1])) - Math.min(...poly.map((p) => p[1])),
  cz: -(Math.max(...poly.map((p) => p[1])) + Math.min(...poly.map((p) => p[1]))) / 2, // world z of the plate's middle
});
