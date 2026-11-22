// Concert mini-game: procedural songs + shared judging. Pure (no audio, no DOM) so node can test it.
// A song = drums + bass + pad chords scheduled by concert.js, and a melody whose notes ARE the chart:
// the player performs the tune, each hit sung by the creature of that lane.
export const LANES = { easy: 3, normal: 4, hard: 5 };
export const STYLES = {
  pop:   { name: 'Pop',   bpm: 118, swing: 0 },
  lofi:  { name: 'Lo-fi', bpm: 96,  swing: 0.16 },
  disco: { name: 'Disco', bpm: 124, swing: 0 },
};
export const JUDGE = [
  { win: 0.045, label: 'Parfait', pts: 300, acc: 1 },
  { win: 0.09, label: 'Bien', pts: 200, acc: 0.7 },
  { win: 0.14, label: 'OK', pts: 100, acc: 0.4 },
];
export const MISS_WIN = JUDGE[JUDGE.length - 1].win;
export const judge = (dt) => JUDGE.find((j) => Math.abs(dt) <= j.win) || null;

export function grade({ perfect = 0, good = 0, ok = 0, miss = 0 }) {
  const total = perfect + good + ok + miss || 1;
  const acc = (perfect + good * 0.7 + ok * 0.4) / total;
  return { acc, letter: acc >= 0.95 ? 'S' : acc >= 0.85 ? 'A' : acc >= 0.7 ? 'B' : 'C' };
}
export const rewardFor = (letter, difficulty) =>
  Math.round({ S: 100, A: 70, B: 45, C: 20 }[letter] * { easy: 0.6, normal: 1, hard: 1.3 }[difficulty]);

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // two octaves of major pentatonic (semitones from the key)
const PROGS = [[0, 4, 5, 3], [5, 3, 0, 4], [0, 5, 3, 4], [3, 4, 2, 5], [0, 3, 4, 3]]; // scale degrees: I–V–vi–IV, vi–IV–I–V…
// one-bar rhythms on a 16-step grid; every one keeps steps 0 and 8 so easier difficulties still have notes
const RHYTHMS = [
  [0, 4, 6, 8, 12], [0, 2, 4, 8, 10, 12], [0, 4, 8, 10, 14], [0, 3, 6, 8, 12], [0, 4, 6, 8, 12, 14],
  [0, 2, 4, 6, 8, 12], [0, 3, 4, 8, 11, 12], [0, 4, 7, 8, 12, 15], [0, 6, 8, 10, 12, 14], [0, 2, 8, 12, 13, 14],
];
const NAMES = ['Bonbon', 'Nuage', 'Pastel', 'Ploc', 'Câlin', 'Bulle', 'Doudou', 'Paillette', 'Guimauve', 'Clic'];
const triad = (deg) => [0, 2, 4].map((k) => MAJOR[(deg + k) % 7] + ((deg + k) >= 7 ? 12 : 0));

// sections: [name, bars]; melody lives in A/B, intro/outro breathe
const FORM = [['intro', 2], ['A', 8], ['B', 8], ['A', 8], ['B', 4], ['outro', 2]];

export function generateSong(seed, styleId = 'pop', difficulty = 'normal') {
  const r = rng(seed), pick = (a) => a[Math.floor(r() * a.length)];
  const style = STYLES[styleId], step = 60 / style.bpm / 4, bar = step * 16;
  const key = Math.floor(r() * 7) - 3; // semitones around C
  const freq = (semi, oct = 0) => 261.63 * 2 ** ((key + semi) / 12 + oct);
  const progs = { A: pick(PROGS), B: pick(PROGS) };
  // each section owns 2 motif bars: bar 1 & 3 reuse the first, bar 2 the second, bar 4 is a cadence variation
  const motifs = { A: [pick(RHYTHMS), pick(RHYTHMS)], B: [pick(RHYTHMS), pick(RHYTHMS)] };
  const swingAt = (s) => (s % 4 === 2 ? style.swing * step * 2 : 0);
  const ev = { kick: [], snare: [], hat: [], bass: [], chords: [] }, melody = [];
  let t0 = 0, idx = 5;
  const phraseCache = {}; // repeated sections replay the exact same melody: that's what makes it catchy

  for (const [sec, bars] of FORM) {
    for (let b = 0; b < bars; b++) {
      const T = t0 + b * bar, prog = progs[sec] || progs.A, deg = prog[b % 4], chord = triad(deg);
      const quiet = sec === 'intro' || sec === 'outro';
      // drums
      const kicks = styleId === 'disco' ? [0, 4, 8, 12] : styleId === 'lofi' ? [0, 7, 10] : [0, 8, 10];
      if (!(sec === 'outro' && b > 0)) kicks.forEach((s) => (s === 0 || !quiet) && ev.kick.push(T + s * step + swingAt(s)));
      if (!quiet) [4, 12].forEach((s) => ev.snare.push(T + s * step));
      for (let s = 0; s < 16; s += 2) {
        if (sec === 'outro') break;
        if (styleId === 'disco') ev.hat.push([T + s * step, s % 4 === 2]);
        else if (!(quiet && s % 4)) ev.hat.push([T + s * step + swingAt(s), false]);
      }
      // bass + chords
      const root = MAJOR[deg];
      const bassSteps = styleId === 'disco' ? [0, 2, 4, 6, 8, 10, 12, 14] : styleId === 'lofi' ? [0, 10] : [0, 6, 8, 14];
      if (!quiet) bassSteps.forEach((s, k) => ev.bass.push([T + s * step + swingAt(s), freq(root, styleId === 'disco' && k % 2 ? -1 : -2), step * (styleId === 'lofi' ? 6 : 1.8)]));
      ev.chords.push([T, chord.map((c) => freq(c, -1)), bar * (sec === 'outro' ? 2 : 1)]);
      // melody
      if (quiet) continue;
      const cacheKey = `${sec}:${b}`;
      if (!phraseCache[cacheKey]) {
        const m = motifs[sec], rhythm = b % 4 === 3 ? (b === bars - 1 ? [0, 4, 8] : pick(RHYTHMS)) : m[b % 2];
        const notes = [];
        for (const s of rhythm) {
          if (s % 4 === 0) { // strong beats land on a chord tone near the current note
            const tones = PENTA.map((p, i) => [i, p]).filter(([, p]) => chord.includes(p % 12) || chord.includes((p % 12) + 12));
            if (tones.length) idx = tones.reduce((best, [i]) => (Math.abs(i - idx) < Math.abs(best - idx) ? i : best), tones[0][0]);
          } else idx += pick([-2, -1, -1, 1, 1, 2]);
          idx = Math.max(2, Math.min(PENTA.length - 2, idx));
          notes.push([s, idx]);
        }
        phraseCache[cacheKey] = notes;
      }
      for (const [s, i] of phraseCache[cacheKey]) melody.push({ t: T + s * step + swingAt(s), s, idx: i, f: freq(PENTA[i]) });
    }
    t0 += bars * bar;
  }

  // difficulty thins the same tune: easy = beats, normal = 8ths, hard = everything
  const keep = { easy: (s) => s % 4 === 0, normal: (s) => s % 2 === 0, hard: () => true }[difficulty];
  const n = LANES[difficulty];
  const lo = Math.min(...melody.map((m) => m.idx)), hi = Math.max(...melody.map((m) => m.idx));
  const notes = melody.filter((m) => keep(m.s)).map((m) => ({ t: m.t, lane: Math.round(((m.idx - lo) / Math.max(1, hi - lo)) * (n - 1)), f: m.f }));
  return {
    title: `${pick(NAMES)} ${style.name} n°${seed % 1000}`,
    bpm: style.bpm, style: styleId, difficulty, lanes: n, duration: t0, events: ev, notes,
  };
}
