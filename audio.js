// All sounds synthesized with WebAudio: filtered noise bursts (the "click") + short pitched tones (the "thock"/"pop").
// Each universe has its own switch voice; release pitch walks a pentatonic scale so mashing keys stays musical.
let ctx, out, rev, noiseBuf, muted = false;
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const j = (x, a = 0.04) => x * (1 + (Math.random() - 0.5) * 2 * a); // tiny humanizing jitter

export function unlock() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    out = ctx.createGain(); out.gain.value = muted ? 0 : 0.8;
    out.connect(comp).connect(ctx.destination);
    // small soft room so clicks don't sound dry
    const len = ctx.sampleRate * 0.9, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2; }
    const conv = ctx.createConvolver(); conv.buffer = ir;
    rev = ctx.createGain(); rev.gain.value = 0.13;
    rev.connect(conv).connect(out);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
}
export const setMuted = (v) => { muted = v; if (out) out.gain.value = v ? 0 : 0.8; };
export const isMuted = () => muted;

function vca(t, peak, dur, attack = 0.002) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(j(peak, 0.1), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + dur);
  g.connect(out); g.connect(rev);
  return g;
}
function noise(t, f, q, type, peak, dur, attack) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  const bq = ctx.createBiquadFilter(); bq.type = type; bq.frequency.value = f; bq.Q.value = q;
  src.connect(bq).connect(vca(t, peak, dur, attack));
  src.start(t, Math.random() * 0.8, dur + 0.05);
}
function tone(t, wave, f0, f1, peak, dur, sweep = dur * 0.6) {
  const o = ctx.createOscillator(); o.type = wave;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
  o.connect(vca(t, peak, dur));
  o.start(t); o.stop(t + dur + 0.05);
}
// filtered saw pluck: the bright K-pop synth voice
function pluck(t, f, peak, dur) {
  for (const d of [1, 1.006]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * d;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 4;
    lp.frequency.setValueAtTime(5000, t); lp.frequency.exponentialRampToValueAtTime(500, t + dur);
    o.connect(lp).connect(vca(t, peak, dur));
    o.start(t); o.stop(t + dur + 0.05);
  }
}
// short synthetic miaow: pitch rises then falls through a soft lowpass
function meow(t, f) {
  const o = ctx.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(f * 0.9, t); o.frequency.linearRampToValueAtTime(f * 1.35, t + 0.08); o.frequency.linearRampToValueAtTime(f * 0.95, t + 0.22);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500;
  o.connect(lp).connect(vca(t, 0.14, 0.24, 0.02));
  o.start(t); o.stop(t + 0.3);
}
const note = (idx, base = 392) => base * 2 ** (PENTA[idx % PENTA.length] / 12);
const bell = (t, f, peak = 0.16, len = 0.9) =>
  [1, 2.76, 5.4].forEach((m, k) => tone(t, 'sine', f * m, f * m, peak * [1, 0.45, 0.22][k], len * [1, 0.5, 0.28][k], 0.01));

export function press(kind, idx = 0) {
  if (!ctx) return;
  const t = ctx.currentTime;
  switch (kind) {
    case 'bubble': noise(t, j(4200), 1, 'bandpass', 0.32, 0.025); tone(t, 'sine', j(240), 120, 0.45, 0.08); break;
    case 'soft':   noise(t, j(1300), 0.7, 'lowpass', 0.5, 0.05); tone(t, 'sine', j(150), 80, 0.5, 0.11); break;
    case 'bell':   noise(t, j(5200), 1.2, 'bandpass', 0.26, 0.02); tone(t, 'sine', j(210), 110, 0.4, 0.07); break;
    case 'wood':   noise(t, j(1900), 5, 'bandpass', 0.9, 0.035); tone(t, 'triangle', j(320), 230, 0.3, 0.05); break;
    case 'synth':  noise(t, j(3800), 1, 'bandpass', 0.3, 0.02); tone(t, 'sine', j(200), 70, 0.5, 0.09); break;
    case 'organ':  noise(t, j(1000), 0.8, 'lowpass', 0.4, 0.05); tone(t, 'sine', j(110), 90, 0.45, 0.1); break;
    case 'sparkle': noise(t, j(6000), 1, 'bandpass', 0.25, 0.015); tone(t, 'sine', j(260), 140, 0.35, 0.06); break;
    case 'squish': noise(t, j(900), 0.7, 'lowpass', 0.5, 0.06); tone(t, 'sine', j(140), 70, 0.5, 0.1); break;
    case 'meow':   noise(t, j(2500), 1, 'bandpass', 0.3, 0.02); tone(t, 'sine', j(180), 100, 0.4, 0.07); break;
    case 'squeak': noise(t, j(5000), 1.2, 'bandpass', 0.3, 0.015); tone(t, 'sine', j(260), 150, 0.35, 0.05); break;
    case 'drum':   noise(t, j(3000), 1, 'bandpass', 0.35, 0.02); tone(t, 'sine', j(180), 80, 0.5, 0.09); break;
    case 'koto':   noise(t, j(4500), 1, 'bandpass', 0.25, 0.02); tone(t, 'sine', j(200), 110, 0.4, 0.07); break;
    case 'wind':   noise(t, j(1800), 0.7, 'lowpass', 0.3, 0.05); tone(t, 'sine', j(160), 90, 0.35, 0.08); break;
    case 'servo':  noise(t, j(2500), 3, 'bandpass', 0.5, 0.02); tone(t, 'sine', j(120), 80, 0.4, 0.06); break;
    case 'jingle': noise(t, j(7000), 1, 'highpass', 0.2, 0.02); tone(t, 'sine', j(220), 120, 0.35, 0.06); break;
    case 'city':   noise(t, j(2000), 2, 'bandpass', 0.45, 0.03); tone(t, 'sine', j(180), 100, 0.4, 0.07); break;
    case 'fanfare': noise(t, j(3000), 1, 'bandpass', 0.3, 0.02); tone(t, 'sine', j(200), 110, 0.4, 0.07); break;
    case 'beep':   noise(t, j(2200), 1, 'bandpass', 0.4, 0.03); tone(t, 'sine', j(170), 90, 0.4, 0.07); break;
    case 'magic':  noise(t, j(5000), 1, 'highpass', 0.25, 0.02); tone(t, 'sine', j(220), 120, 0.35, 0.06); break;
    case 'bamboo': noise(t, j(1800), 4, 'bandpass', 0.6, 0.03); tone(t, 'triangle', j(300), 220, 0.3, 0.05); break;
    case 'juicy':  noise(t, j(1200), 0.7, 'lowpass', 0.5, 0.05); tone(t, 'sine', j(160), 80, 0.45, 0.09); break;
    case 'crunch': for (let k = 0; k < 3; k++) noise(t + k * 0.012, j(3500), 2, 'bandpass', 0.35, 0.012); tone(t, 'sine', j(150), 80, 0.35, 0.06); break;
    case 'water':  noise(t, j(900), 0.7, 'lowpass', 0.35, 0.05); tone(t, 'sine', j(150), 80, 0.4, 0.08); break;
    case 'whistle': case 'guitar': case 'cosmic': case 'harp': case 'arcade': case 'engine': case 'moo': case 'sizzle':
                   noise(t, j(2600), 1, 'bandpass', 0.35, 0.025); tone(t, 'sine', j(170), 90, 0.4, 0.07); break;
    case 'roar':   noise(t, j(900), 0.8, 'lowpass', 0.5, 0.06); tone(t, 'sine', j(120), 60, 0.55, 0.12); break;
    case 'hiss':   noise(t, j(4000), 1, 'bandpass', 0.3, 0.025); tone(t, 'sine', j(160), 90, 0.35, 0.06); break;
    default:       noise(t, j(3200), 1.1, 'bandpass', 0.45, 0.03); tone(t, 'sine', j(170), 90, 0.35, 0.07);
  }
}

export function release(kind, idx = 0) {
  if (ctx) voice(kind, j(note(idx), 0.01), ctx.currentTime);
}
// a creature's "release" voice at any pitch / time: the Concert mini-game sings melodies with it
export function voice(kind, f, t = ctx?.currentTime) {
  if (!ctx) return;
  switch (kind) {
    case 'bubble': tone(t, 'sine', f * 0.9, f * 2.1, 0.32, 0.09, 0.05); noise(t, 7000, 1, 'highpass', 0.07, 0.01); break;
    case 'soft':   noise(t, j(800), 0.8, 'bandpass', 0.25, 0.07); tone(t, 'sine', f * 0.5, f * 0.45, 0.2, 0.12); break;
    case 'bell':   noise(t, 6500, 1, 'highpass', 0.05, 0.01); bell(t, f * 2); break;
    case 'wood':   tone(t, 'sine', f, f, 0.28, 0.22, 0.01); tone(t, 'sine', f * 4, f * 4, 0.05, 0.05, 0.01); noise(t, j(2600), 6, 'bandpass', 0.3, 0.02); break;
    case 'synth':  pluck(t, f, 0.07, 0.2); tone(t, 'sine', f * 0.5, f * 0.5, 0.15, 0.12, 0.01); break;
    case 'organ':  tone(t, 'sine', f * 0.5, f * 0.5, 0.16, 0.45, 0.01); tone(t, 'sine', f * 1.5, f * 1.5, 0.05, 0.35, 0.01);
                   tone(t, 'sawtooth', j(170), 130, 0.025, 0.09); break; // tiny coffin-lid creak
    case 'sparkle': tone(t, 'sine', f * 1.5, f * 3, 0.15, 0.06, 0.04); bell(t, f * 3, 0.09, 0.5); bell(t + 0.05, f * 4, 0.05, 0.3); break;
    case 'squish': tone(t, 'sine', f * 0.7, f * 0.35, 0.25, 0.08, 0.06); noise(t, j(1500), 2, 'bandpass', 0.15, 0.04); break; // wet little plop
    case 'meow':   meow(t, f * 1.2); break;
    case 'squeak': tone(t, 'sine', f * 3, f * 4, 0.1, 0.06, 0.03); tone(t + 0.06, 'sine', f * 3.6, f * 4.4, 0.06, 0.04, 0.03); break;
    case 'drum':   tone(t, 'sine', f * 0.5, f * 0.42, 0.35, 0.16, 0.04); noise(t, j(900), 1.5, 'bandpass', 0.18, 0.03); break; // bongo
    case 'koto':   tone(t, 'triangle', f * 1.02, f, 0.2, 0.7, 0.03); tone(t, 'sine', f * 2, f * 2, 0.07, 0.35, 0.01); tone(t, 'sine', f * 3, f * 3, 0.03, 0.2, 0.01); break;
    case 'wind':   noise(t, j(1200), 0.5, 'bandpass', 0.12, 0.3, 0.08); bell(t + 0.04, f * 2 * (1 + Math.random() * 0.12), 0.06, 0.7); break;
    case 'servo':  tone(t, 'sawtooth', f * 0.5, f * 0.8, 0.05, 0.12, 0.1); tone(t + 0.08, 'sine', f * 2, f * 2, 0.07, 0.05, 0.01); break; // whirr + beep
    case 'jingle': for (let k = 0; k < 3; k++) bell(t + k * 0.03, f * 3 * (1 + k * 0.06), 0.05, 0.25); noise(t, 8000, 1, 'highpass', 0.1, 0.05); break;
    case 'city':   bell(t, f * 1.5, 0.1, 0.6); break; // shop doorbell
    case 'fanfare': pluck(t, f, 0.06, 0.3); pluck(t + 0.08, f * 1.5, 0.05, 0.25); break;
    case 'beep':   tone(t, 'square', f * 0.75, f * 0.75, 0.05, 0.12, 0.01); tone(t, 'square', f * 0.94, f * 0.94, 0.04, 0.12, 0.01); break; // honk
    case 'magic':  for (let k = 0; k < 4; k++) bell(t + k * 0.05, f * 4 * (1 - k * 0.12), 0.05, 0.4); noise(t, 3000, 0.5, 'bandpass', 0.08, 0.25, 0.05); break;
    case 'bamboo': tone(t, 'sine', f * 0.5, f * 0.5, 0.3, 0.12, 0.01); noise(t, j(1200), 8, 'bandpass', 0.25, 0.03); break;
    case 'juicy':  tone(t, 'sine', f, f * 2.2, 0.2, 0.07, 0.04); noise(t, 6000, 1, 'highpass', 0.08, 0.08); break; // pop + fizz
    case 'crunch': noise(t, j(5000), 2, 'bandpass', 0.3, 0.015); noise(t + 0.02, j(4000), 2, 'bandpass', 0.25, 0.015); break;
    case 'water':  tone(t, 'sine', f * 0.8, f * 2, 0.25, 0.06, 0.03); noise(t, j(1500), 3, 'bandpass', 0.06, 0.04); break; // droplet
    case 'whistle': tone(t, 'sine', f * 2, f * 2.3, 0.12, 0.12, 0.03); noise(t, f * 2, 8, 'bandpass', 0.06, 0.1); break; // referee trill
    case 'guitar': pluck(t, f * 0.5, 0.09, 0.45); tone(t, 'triangle', f, f, 0.05, 0.3, 0.01); break;
    case 'cosmic': tone(t, 'sine', f * 1.5, f * 3, 0.1, 0.4, 0.3); tone(t + 0.12, 'sine', f * 3, f * 1.5, 0.05, 0.35, 0.3); break; // space sweep
    case 'harp':   [1, 1.25, 1.5, 2].forEach((m, k) => tone(t + k * 0.04, 'triangle', f * m, f * m, 0.08, 0.5, 0.01)); break;
    case 'roar':   tone(t, 'sawtooth', f * 0.3, f * 0.2, 0.06, 0.25, 0.2); noise(t, 500, 0.6, 'lowpass', 0.15, 0.2, 0.03); break; // tiny kaiju growl
    case 'arcade': tone(t, 'square', f, f, 0.05, 0.05, 0.01); tone(t + 0.05, 'square', f * 1.5, f * 1.5, 0.05, 0.07, 0.01); break; // 8-bit blip
    case 'engine': tone(t, 'sawtooth', f * 0.25, f * 0.4, 0.07, 0.2, 0.15); noise(t, 400, 1, 'lowpass', 0.1, 0.15); break; // vroom
    case 'hiss':   noise(t, j(6000), 1, 'highpass', 0.12, 0.18, 0.03); break;
    case 'moo':    tone(t, 'sawtooth', f * 0.35, f * 0.3, 0.05, 0.3, 0.25); tone(t, 'sine', f * 0.7, f * 0.6, 0.08, 0.3, 0.25); break;
    case 'sizzle': for (let k = 0; k < 4; k++) noise(t + k * 0.03, j(7000), 2, 'bandpass', 0.07, 0.02); tone(t, 'sine', f, f * 1.2, 0.06, 0.06, 0.04); break;
    default:       noise(t, j(5200), 1.5, 'bandpass', 0.22, 0.018);
  }
}

// capsule voices
export function ratchet() {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (let k = 0; k < 4; k++) { noise(t + k * 0.035, j(6000), 2, 'bandpass', 0.22, 0.008); tone(t + k * 0.035, 'sine', j(1100), 900, 0.05, 0.015); }
}
export function thud(v = 1) {
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(t, 'sine', j(130), 70, 0.5 * v, 0.12); noise(t, 900, 0.7, 'lowpass', 0.25 * v, 0.04);
}
export function crack(rarity = 'common') {
  if (!ctx) return;
  const t = ctx.currentTime;
  noise(t, 2500, 0.8, 'lowpass', 0.6, 0.12); tone(t, 'sine', 160, 60, 0.6, 0.2);
  tone(t + 0.02, 'sine', 500, 1400, 0.3, 0.12, 0.06); // the big pop
  const n = { common: 3, rare: 4, super: 6, secret: 9 }[rarity];
  for (let k = 0; k < n; k++) bell(t + 0.12 + k * 0.075, note(k + 2, 523), 0.12, 0.8);
}
export function place() {
  if (!ctx) return;
  const t = ctx.currentTime;
  noise(t, 3000, 1, 'bandpass', 0.5, 0.03); tone(t, 'sine', 200, 100, 0.45, 0.08);
  noise(t + 0.06, 5000, 1.4, 'bandpass', 0.25, 0.02);
}
export function tick() {
  if (!ctx) return;
  noise(ctx.currentTime, 5500, 2, 'bandpass', 0.2, 0.012);
}

// --- needs voices ---
let purrNodes = null;
// low triangle with a fast amplitude wobble = a purr; held for as long as the massage lasts
export function purr(on) {
  if (!ctx) return;
  const t = ctx.currentTime;
  if (on && !purrNodes) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 52;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 24;
    const depth = ctx.createGain(); depth.gain.value = 0.5;
    const g = ctx.createGain(); g.gain.value = 0;
    const amp = ctx.createGain(); amp.gain.value = 0.5;
    lfo.connect(depth).connect(amp.gain);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    o.connect(amp).connect(lp).connect(g); g.connect(out);
    g.gain.linearRampToValueAtTime(0.35, t + 0.15);
    o.start(); lfo.start();
    purrNodes = { o, lfo, g };
  } else if (!on && purrNodes) {
    const { o, lfo, g } = purrNodes; purrNodes = null;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.15);
    o.stop(t + 0.2); lfo.stop(t + 0.2);
  }
}
export function nom() {
  if (!ctx) return;
  const t = ctx.currentTime;
  noise(t, j(700), 0.8, 'lowpass', 0.4, 0.05); tone(t, 'sine', j(320), 200, 0.18, 0.06);
}
export function yay() {
  if (!ctx) return;
  const t = ctx.currentTime;
  [0, 2, 4, 7, 9].forEach((k, i) => bell(t + i * 0.06, note(k, 784), 0.1, 0.6));
}
export function nope() {
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(t, 'sine', 340, 310, 0.2, 0.1); tone(t + 0.13, 'sine', 270, 240, 0.2, 0.14);
}
export function sneeze() {
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(t, 'sine', 500, 700, 0.06, 0.18, 0.18); noise(t + 0.2, 2800, 0.7, 'bandpass', 0.3, 0.22, 0.02);
}

// --- Concert backing band (all schedulable at an audio time t) ---
export const now = () => ctx?.currentTime ?? 0;
export const latency = () => (ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0);
export function kick(t) {
  const o = ctx.createOscillator(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  o.connect(vca(t, 0.7, 0.28, 0.003)); o.start(t); o.stop(t + 0.35);
  noise(t, 3000, 1, 'bandpass', 0.08, 0.01);
}
export function snare(t, soft) {
  if (soft) { noise(t, 1500, 0.8, 'bandpass', 0.18, 0.12); return; }
  for (let k = 0; k < 3; k++) noise(t + k * 0.011, 1600, 0.9, 'bandpass', 0.22, k === 2 ? 0.16 : 0.012); // clap = 3 quick bursts
}
export const hat = (t, open) => noise(t, 8500, 1, 'highpass', open ? 0.07 : 0.05, open ? 0.2 : 0.035);
export function bass(t, f, dur) {
  const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
  o.connect(lp).connect(vca(t, 0.32, dur, 0.008)); o.start(t); o.stop(t + dur + 0.05);
}
export function pad(t, freqs, dur, soft) {
  for (const f of freqs) for (const d of [1, 1.004]) {
    const o = ctx.createOscillator(); o.type = soft ? 'triangle' : 'sawtooth'; o.frequency.value = f * d;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = soft ? 900 : 1400;
    o.connect(lp).connect(vca(t, soft ? 0.035 : 0.022, dur, 0.08)); o.start(t); o.stop(t + dur + 0.1);
  }
}
export const miss = () => ctx && tone(ctx.currentTime, 'sine', 140, 90, 0.12, 0.08);

// --- claw machine ---
export function coin() {
  if (!ctx) return;
  const t = ctx.currentTime;
  bell(t, 1568, 0.12, 0.35); bell(t + 0.07, 2093, 0.1, 0.5); noise(t, 6000, 2, 'bandpass', 0.15, 0.03);
}
let motorNodes = null;
export function motor(on) { // low filtered buzz while the gantry moves
  if (!ctx) return;
  const t = ctx.currentTime;
  if (on && !motorNodes) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 78;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.06, t + 0.08);
    o.connect(lp).connect(g); g.connect(out); o.start();
    motorNodes = { o, g };
  } else if (!on && motorNodes) {
    const { o, g } = motorNodes; motorNodes = null;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + 0.1); o.stop(t + 0.12);
  }
}
export function clack() {
  if (!ctx) return;
  const t = ctx.currentTime;
  noise(t, 2500, 3, 'bandpass', 0.5, 0.03); tone(t, 'triangle', 420, 300, 0.2, 0.05);
}
