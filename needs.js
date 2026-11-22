// Tamagotchi-style needs: data tables + rules only (no three.js), so node can test them.
// Difficulty comes from learning: every figure has hidden favourite dishes and games, and the remedies must be discovered.
export const TUNING = { spawnMin: 20, spawnMax: 35, life: 120, sulk: 60, maxActive: 3, hugMin: 4, hugMax: 9, massage: 3, sleep: 12, settle: 1.1 };

export const CATS = { sucre: { e: '🍬', name: 'Sucré' }, sale: { e: '🧂', name: 'Salé' } };
export const FOODS = [
  { id: 'glace', e: '🍦', name: 'Glace', cat: 'sucre' },
  { id: 'painchoc', e: '🥐', name: 'Pain au chocolat', cat: 'sucre' },
  { id: 'cookie', e: '🍪', name: 'Cookie', cat: 'sucre' },
  { id: 'cupcake', e: '🧁', name: 'Cupcake', cat: 'sucre' },
  { id: 'fraise', e: '🍓', name: 'Fraise', cat: 'sucre' },
  { id: 'pizza', e: '🍕', name: 'Pizza', cat: 'sale' },
  { id: 'onigiri', e: '🍙', name: 'Onigiri', cat: 'sale' },
  { id: 'frites', e: '🍟', name: 'Frites', cat: 'sale' },
  { id: 'bretzel', e: '🥨', name: 'Bretzel', cat: 'sale' },
  { id: 'fromage', e: '🧀', name: 'Fromage', cat: 'sale' },
];
export const GAMES = [
  { id: 'balancoire', e: '🛝', name: 'Toboggan', anim: 'swing' },
  { id: 'balle', e: '⚽', name: 'Balle', anim: 'bounce' },
  { id: 'bulles', e: '🫧', name: 'Bulles', anim: 'bubbles' },
  { id: 'yoyo', e: '🪀', name: 'Yoyo', anim: 'spin' },
  { id: 'danse', e: '💃', name: 'Danse', anim: 'wiggle' },
  { id: 'cache', e: '🙈', name: 'Cache-cache', anim: 'hide' },
];
export const CARE = [
  { id: 'echarpe', e: '🧣', name: 'Écharpe' },
  { id: 'tisane', e: '🍵', name: 'Tisane' },
  { id: 'sirop', e: '💊', name: 'Sirop' },
  { id: 'compresse', e: '🧊', name: 'Compresse' },
  { id: 'pansement', e: '🩹', name: 'Pansement' },
  { id: 'bisou', e: '💋', name: 'Bisou' },
];
export const AILMENTS = {
  rhume: { e: '🤧', name: 'Rhume', cures: ['echarpe', 'tisane'] },
  fievre: { e: '🤒', name: 'Fièvre', cures: ['sirop', 'compresse'] },
  bobo: { e: '🤕', name: 'Bobo', cures: ['pansement', 'bisou'] },
};
export const NEEDS = {
  faim:    { e: '🍽️', weight: 3,   reward: 30, tip: 'A faim ! Appuie sur sa bulle pour choisir un plat.' },
  jeu:     { e: '🎲', weight: 3,   reward: 30, tip: 'Veut jouer ! Appuie sur sa bulle pour choisir un jeu.' },
  calin:   { e: '👆', weight: 2,   reward: 15, tip: 'Veut des câlins : appuie exactement le nombre indiqué, puis arrête.' },
  massage: { e: '💆', weight: 2,   reward: 20, tip: 'Veut un massage : maintiens sa touche 3 secondes.' },
  dodo:    { e: '😴', weight: 2,   reward: 20, tip: 'Veut dormir : ne le touche plus jusqu’à la fin du compte à rebours.' },
  malade:  { e: '🤒', weight: 1.5, reward: 40, tip: 'Est malade ! Appuie sur sa bulle pour le soigner.' },
  ami:     { e: '💞', weight: 1,   reward: 50, tip: 'Veut être à côté de son ami : utilise « Ranger ».' },
  voyage:  { e: '🗺️', weight: 1,   reward: 40, tip: 'Veut visiter un autre plateau : pose-le dessus avec « Ranger ».' },
};
export const BY = Object.fromEntries([...FOODS, ...GAMES, ...CARE].map((x) => [x.id, x]));

function hash(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const pick2 = (list, h) => { const a = h % list.length; let b = (h >>> 8) % (list.length - 1); if (b >= a) b++; return [list[a].id, list[b].id]; };
// hidden tastes, stable per figure without saving anything
export const prefs = (id) => ({ foods: pick2(FOODS, hash(id)), games: pick2(GAMES, hash(`${id}#games`)) });

const rint = (a, b, rand) => a + Math.floor(rand() * (b - a + 1));
const any = (list, rand) => list[Math.floor(rand() * list.length)];

// ctx: { id, owned: [ids], boards: [other unlocked board ids] }
export function rollNeed({ id, owned = [], boards = [] }, rand = Math.random, force) {
  const ok = Object.keys(NEEDS).filter((t) => (t !== 'ami' || owned.length > 1) && (t !== 'voyage' || boards.length));
  let type = force;
  if (!type) {
    let r = rand() * ok.reduce((s, t) => s + NEEDS[t].weight, 0);
    type = ok.find((t) => (r -= NEEDS[t].weight) < 0) || ok[0];
  }
  const n = { type, t: 0, tries: 0 };
  const p = prefs(id);
  if (type === 'faim') n.want = any(p.foods, rand);
  if (type === 'jeu') n.want = any(p.games, rand);
  if (type === 'calin') n.left = n.n = rint(TUNING.hugMin, TUNING.hugMax, rand);
  if (type === 'massage') n.hold = 0;
  if (type === 'dodo') n.quiet = 0;
  if (type === 'malade') n.ail = any(Object.keys(AILMENTS), rand);
  if (type === 'ami') n.friend = any(owned.filter((o) => o !== id), rand);
  if (type === 'voyage') n.board = any(boards, rand);
  return n;
}

// give a dish / game / remedy; a miss raises the hint level (food: category, then the dish's silhouette)
export function tryItem(need, item) {
  const ok = need.type === 'malade' ? AILMENTS[need.ail].cures.includes(item) : item === need.want;
  if (!ok) need.tries++;
  return ok;
}
export const reward = (need) => Math.max(8, NEEDS[need.type].reward - 8 * need.tries);

// adjacency on a plate: cells = [{r, c}], arr = figure id per cell
export function neighbours(cells, arr, a, b) {
  const i = arr.indexOf(a), j = arr.indexOf(b);
  return i >= 0 && j >= 0 && Math.abs(cells[i].r - cells[j].r) + Math.abs(cells[i].c - cells[j].c) === 1;
}
