// Concert mini-game: notes fall in lanes, the creatures at the bottom play them when you hit in rhythm.
// Two sources: procedural songs (rhythm.js; a hit IS the melody, sung by that lane's creature) and
// pre-analysed YouTube videos (concert/analyze.py; music from the official player, we only keep timings).
import * as sfx from './audio.js';
import { generateSong, judge, grade, rewardFor, LANES, STYLES, MISS_WIN } from './rhythm.js';

const LANE_KEYS = { 3: ['KeyD', 'KeyF', 'KeyJ'], 4: ['KeyD', 'KeyF', 'KeyJ', 'KeyK'], 5: ['KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK'] };
const APPROACH = { easy: 2.0, normal: 1.6, hard: 1.3 }; // seconds a note takes to fall
const DIFF = { easy: 'Facile', normal: 'Normal', hard: 'Difficile' };
const TOUCH = matchMedia('(pointer: coarse)').matches;
const JCOL = { Parfait: '#ff6f9f', Bien: '#ffb347', OK: '#8fb8ff', Raté: '#b9a6b2' };

let H, root, cv, g, card, ytBox, st = null, yt = null, ytReady = null, ytBase = null;
const opts = { tab: 'gen', style: 'pop', seed: 'day', difficulty: 'normal', yt: null, replay: null };
const test = (window.__concert = { autoplay: false, fake: false, speed: 1, get state() { return st && { phase: st.phase, stats: st.stats, score: st.score, result: st.result, taps: st.taps }; } });
export const concertOpen = () => !!root?.classList.contains('on');

export function openConcert(host) {
  H = host; H.S.concert ||= { offset: 0, hitSounds: true, best: {} };
  if (!root) build();
  root.classList.add('on'); menu();
  requestAnimationFrame(frame);
}
function close() { stop(); st = null; root.classList.remove('on'); }

function build() {
  root = document.createElement('div'); root.id = 'concert';
  root.innerHTML = '<div class="yt"></div><canvas></canvas><button id="cquit" title="Quitter le morceau">✕</button><div class="ccard"></div>';
  document.body.appendChild(root);
  ytBox = root.querySelector('.yt'); cv = root.querySelector('canvas'); g = cv.getContext('2d'); card = root.querySelector('.ccard');
  root.querySelector('#cquit').onclick = () => menu(); // touch players have no Escape key
  const lane = (e) => { const L = layout(); return Math.floor((e.clientX - L.x0) / L.laneW); };
  cv.addEventListener('pointerdown', (e) => { const l = lane(e); if (st && l >= 0 && l < st.n) hit(l); });
  cv.addEventListener('pointerup', () => st?.held.fill(false));
  addEventListener('keydown', (e) => {
    if (!concertOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.code === 'Escape') return st?.phase === 'play' ? menu() : close();
    if (e.repeat || !st || st.phase !== 'play') return;
    const l = LANE_KEYS[st.n].indexOf(e.code); if (l >= 0) hit(l);
  }, true);
  addEventListener('keyup', (e) => { if (concertOpen() && st) { const l = LANE_KEYS[st.n].indexOf(e.code); if (l >= 0) st.held[l] = false; } }, true);
}

// ---------- menu ----------
const dateSeed = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
async function menu() {
  stop(); st = null;
  const list = await fetch('concert/index.json').then((r) => (r.ok ? r.json() : [])).catch(() => []);
  opts.yt ||= list[0]?.id;
  const B = (attr, val, label, on) => `<button data-${attr}="${val}" class="${on ? 'on' : ''}">${label}</button>`;
  const C = H.S.concert;
  card.innerHTML = `<h2>🎵 Concert</h2>
    <p class="sub">Tes figurines du plateau jouent ; tape quand les notes touchent la ligne.</p>
    <div class="tabs">${B('tab', 'gen', 'Morceaux générés', opts.tab === 'gen')}${B('tab', 'yt', 'YouTube', opts.tab === 'yt')}</div>
    ${opts.tab === 'gen' ? `
      <div class="row">${Object.entries(STYLES).map(([k, s]) => B('style', k, `${s.name} <small>${s.bpm} bpm</small>`, opts.style === k)).join('')}</div>
      <div class="row">${B('seed', 'day', 'Morceau du jour', opts.seed === 'day')}${B('seed', 'new', 'Nouveau morceau', opts.seed === 'new')}</div>`
    : list.length ? `<div class="list">${list.map((s) => B('yt', s.id, `<b>${s.title}</b><small>${s.channel} · ${fmt(s.duration)} · ${Math.round(s.bpm)} bpm${C.best[s.id] ? ` · meilleur ${C.best[s.id]}` : ''}</small>`, opts.yt === s.id)).join('')}</div>
      <label class="opt">Décalage <input type="range" min="-200" max="200" step="10" value="${C.offset}"> <span>${C.offset} ms</span></label>
      <label class="opt"><input type="checkbox" ${C.hitSounds ? 'checked' : ''}> petit clic des figurines</label>`
    : '<p class="sub">Aucune vidéo analysée : <code>uv run concert/analyze.py &lt;id&gt;</code></p>'}
    <div class="row">${Object.entries(DIFF).map(([k, n]) => B('diff', k, `${n} <small>${LANES[k]} couloirs</small>`, opts.difficulty === k)).join('')}</div>
    <div class="row"><button class="go">Jouer ▶</button><button class="quit">Quitter</button></div>
    <p class="sub">${TOUCH ? 'Touche les couloirs quand les notes arrivent sur les cercles · ✕ pour quitter' : `Touches ${Object.values(LANE_KEYS)[1].map((c) => c.slice(3)).join(' ')} (S… K en difficile) ou clique les couloirs · Échap pour quitter`}</p>`;
  const set = (k, v) => () => { opts[k] = v; opts.replay = null; sfx.unlock(); sfx.tick(); menu(); };
  card.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = set('tab', b.dataset.tab)));
  card.querySelectorAll('[data-style]').forEach((b) => (b.onclick = set('style', b.dataset.style)));
  card.querySelectorAll('[data-seed]').forEach((b) => (b.onclick = set('seed', b.dataset.seed)));
  card.querySelectorAll('[data-diff]').forEach((b) => (b.onclick = set('difficulty', b.dataset.diff)));
  card.querySelectorAll('[data-yt]').forEach((b) => (b.onclick = set('yt', b.dataset.yt)));
  const range = card.querySelector('input[type=range]');
  if (range) range.oninput = () => { C.offset = +range.value; range.nextElementSibling.textContent = `${C.offset} ms`; H.save(); };
  const chk = card.querySelector('input[type=checkbox]');
  if (chk) chk.onchange = () => { C.hitSounds = chk.checked; H.save(); };
  card.querySelector('.go').onclick = start;
  card.querySelector('.quit').onclick = close;
  card.classList.add('on');
}

// ---------- run ----------
const glyphs = {};
function glyph(kind) { // particle shape pre-rendered white, tinted by drawing over the note
  if (!glyphs[kind]) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.fillStyle = x.strokeStyle = '#fff'; x.translate(32, 32); H.drawParticle(x, kind); glyphs[kind] = c;
  }
  return glyphs[kind];
}
async function start() {
  sfx.unlock();
  const n = LANES[opts.difficulty], mus = H.musicians(n);
  mus.forEach((m) => { if (m.img) { m.im = new Image(); m.im.src = m.img; } });
  const base = { phase: 'play', mus, n, stats: { perfect: 0, good: 0, ok: 0, miss: 0 }, score: 0, combo: 0, maxCombo: 0, fx: [], bounce: Array(n).fill(0), held: Array(n).fill(false), fakeStart: performance.now() };
  if (opts.tab === 'gen') {
    const seed = opts.replay ?? (opts.seed === 'day' ? dateSeed() : (Math.random() * 1e9) | 0);
    opts.replay = seed;
    const song = generateSong(seed, opts.style, opts.difficulty);
    st = { ...base, kind: 'gen', song, title: song.title, id: `gen:${opts.style}:${seed}`, duration: song.duration, notes: song.notes.map((x) => ({ ...x })), t0: sfx.now() + 1.2, sched: -1 };
    st.timer = setInterval(schedule, 25);
  } else {
    if (!opts.yt) return;
    const data = await fetch(`concert/charts/${opts.yt}.json`).then((r) => r.json());
    st = { ...base, kind: 'yt', title: data.title, id: data.id, duration: data.duration, notes: data.charts[opts.difficulty].map(([t, lane]) => ({ t, lane })) };
    if (!test.fake) ytPlay(data.id);
  }
  card.classList.remove('on'); root.classList.add('playing');
}
function stop() {
  root?.classList.remove('playing');
  clearInterval(st?.timer);
  if (yt) { try { yt.destroy(); } catch {} yt = null; }
  ytBox.innerHTML = ''; ytBase = null;
}

// audio-clock lookahead: backing band scheduled ~120 ms ahead so it never stutters
function schedule() {
  if (!st || st.kind !== 'gen' || test.fake) return;
  const ev = st.song.events, from = st.sched, to = sfx.now() + 0.12 - st.t0, lofi = st.song.style === 'lofi';
  if (to <= from) return;
  const at = (t) => st.t0 + t, win = (t) => t > from && t <= to;
  for (const t of ev.kick) if (win(t)) sfx.kick(at(t));
  for (const t of ev.snare) if (win(t)) sfx.snare(at(t), lofi);
  for (const [t, o] of ev.hat) if (win(t)) sfx.hat(at(t), o);
  for (const [t, f, d] of ev.bass) if (win(t)) sfx.bass(at(t), f, d);
  for (const [t, fs, d] of ev.chords) if (win(t)) sfx.pad(at(t), fs, d, lofi);
  st.sched = to;
}

// ---------- clocks ----------
function clock() {
  if (test.fake) return ((performance.now() - st.fakeStart) / 1000) * test.speed - 1.2;
  if (st.kind === 'gen') return sfx.now() - st.t0 - sfx.latency();
  return ytTime() + H.S.concert.offset / 1000;
}
function loadYT() {
  return (ytReady ||= new Promise((res) => {
    if (window.YT?.Player) return res();
    window.onYouTubeIframeAPIReady = res;
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
  }));
}
async function ytPlay(id) {
  await loadYT();
  ytBox.innerHTML = '<div id="ytp"></div>';
  yt = new YT.Player('ytp', {
    videoId: id, width: '100%', height: '100%',
    playerVars: { autoplay: 1, controls: 0, disablekb: 1, rel: 0, playsinline: 1, modestbranding: 1 },
    events: {
      onReady: (e) => e.target.playVideo(),
      onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) finish(); },
    },
  });
  // autoplay can be refused: offer a direct tap to start
  setTimeout(() => { if (st?.kind === 'yt' && yt?.getPlayerState?.() !== 1 && st.phase === 'play') toastPlay(); }, 2500);
}
function toastPlay() {
  card.innerHTML = '<h2>▶</h2><div class="row"><button class="go">Lancer la vidéo</button></div>';
  card.querySelector('.go').onclick = () => { yt?.playVideo(); card.classList.remove('on'); };
  card.classList.add('on');
}
// media time from the iframe, interpolated with performance.now and re-anchored when it drifts > 40 ms
function ytTime() {
  const perf = performance.now() / 1000;
  if (!yt?.getPlayerState || yt.getPlayerState() !== 1) { ytBase = null; return st.lastT ?? -1; } // ads / buffering / pause freeze the notes
  if (!ytBase || perf - ytBase.check > 0.5) {
    const media = yt.getCurrentTime();
    if (!ytBase || Math.abs(ytBase.media + (perf - ytBase.perf) - media) > 0.04) ytBase = { perf, media, check: perf };
    else ytBase.check = perf;
  }
  return (st.lastT = ytBase.media + (perf - ytBase.perf));
}

// ---------- play ----------
function hit(lane, at) { // `at` lets autoplay strike exactly on time (tests run at a few fps)
  if (!st || st.phase !== 'play') return;
  const now = at ?? clock(), m = st.mus[lane];
  st.bounce[lane] = 1; st.held[lane] = true; st.taps = (st.taps || 0) + 1;
  let best = null;
  for (const n of st.notes) {
    if (n.t - now > MISS_WIN) break;
    if (n.done || n.lane !== lane || Math.abs(n.t - now) > MISS_WIN) continue;
    if (!best || Math.abs(n.t - now) < Math.abs(best.t - now)) best = n;
  }
  if (!best) { sfx.tick(); return; } // ghost taps are free: no combo break
  const j = judge(now - best.t);
  best.done = true;
  st.stats[{ Parfait: 'perfect', Bien: 'good', OK: 'ok' }[j.label]]++;
  st.combo++; st.maxCombo = Math.max(st.maxCombo, st.combo);
  st.score += j.pts * Math.min(4, 1 + Math.floor(st.combo / 10));
  navigator.vibrate?.(10);
  if (st.kind === 'gen') sfx.voice(m.kind, best.f); // the hit IS the melody, in the creature's voice
  else if (H.S.concert.hitSounds) sfx.tick();
  st.fx.push({ lane, text: j.label, at: performance.now() });
}
function finish() {
  if (!st || st.phase !== 'play') return;
  st.phase = 'results'; stop();
  const { acc, letter } = grade(st.stats), C = H.S.concert;
  const order = ['C', 'B', 'A', 'S'], prev = C.best[st.id];
  let stars = rewardFor(letter, opts.difficulty);
  if (letter === 'S' && prev !== 'S') stars += 50; // first S on this song
  if (!prev || order.indexOf(letter) > order.indexOf(prev)) C.best[st.id] = letter;
  const hearts = ['S', 'A', 'B'].includes(letter) ? st.mus.filter((m) => m.id).map((m) => m.id) : [];
  H.onReward({ stars, hearts });
  st.result = { letter, acc, stars };
  sfx.yay();
  card.innerHTML = `<div class="grade g${letter}">${letter}</div><h2>${st.title}</h2>
    <p class="sub">${DIFF[opts.difficulty]} · précision ${Math.round(acc * 100)} % · combo max ${st.maxCombo}</p>
    <div class="stats"><span style="color:${JCOL.Parfait}">Parfait ${st.stats.perfect}</span><span style="color:${JCOL.Bien}">Bien ${st.stats.good}</span><span style="color:${JCOL.OK}">OK ${st.stats.ok}</span><span>Raté ${st.stats.miss}</span></div>
    <p class="score">${st.score.toLocaleString('fr-FR')} pts · <b>+${stars} ✦</b>${hearts.length ? ' · ❤ +1 pour les musiciens' : ''}</p>
    <div class="row"><button class="go">Rejouer</button><button class="menu">Menu</button><button class="quit">Quitter</button></div>`;
  card.querySelector('.go').onclick = start;
  card.querySelector('.menu').onclick = () => { opts.replay = null; menu(); };
  card.querySelector('.quit').onclick = close;
  card.classList.add('on');
}

// ---------- render ----------
function layout() {
  // proportional to the height so a phone in landscape still has room for notes to fall
  const n = st?.n || 4, laneW = Math.min(118, (innerWidth - 32) / n), bottom = Math.min(190, innerHeight * 0.28);
  return { n, laneW, x0: (innerWidth - laneW * n) / 2, hitY: innerHeight - bottom, topY: Math.min(86, innerHeight * 0.17), bottom };
}
function frame() {
  if (!concertOpen()) return;
  requestAnimationFrame(frame);
  const dpr = Math.min(devicePixelRatio, 2);
  if (cv.width !== innerWidth * dpr || cv.height !== innerHeight * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, innerWidth, innerHeight);
  if (!st) return;
  const now = clock();
  if (st.phase === 'play') {
    if (test.autoplay) for (const n of st.notes) { if (n.t > now) break; if (!n.done) hit(n.lane, n.t); }
    for (const n of st.notes) {
      if (n.t > now) break;
      if (!n.done && now - n.t > MISS_WIN) { n.done = n.missed = true; st.stats.miss++; st.combo = 0; st.fx.push({ lane: n.lane, text: 'Raté', at: performance.now() }); }
    }
    const last = st.notes.at(-1)?.t ?? 0;
    if (now > (st.kind === 'gen' ? Math.max(last + 1.5, st.duration + 0.5) : last + 3)) finish();
  }
  draw(now);
}
function draw(now) {
  const { n, laneW, x0, hitY, topY, bottom } = layout(), speed = (hitY - topY) / APPROACH[opts.difficulty], r = laneW * 0.3;
  // lanes
  for (let l = 0; l < n; l++) {
    const m = st.mus[l], x = x0 + l * laneW;
    g.fillStyle = m.color + (st.held[l] ? 'cc' : '66'); g.beginPath(); g.roundRect(x + 4, topY - 30, laneW - 8, hitY - topY + bottom * 0.55, 22); g.fill();
    g.strokeStyle = '#ffffffcc'; g.lineWidth = 4; g.beginPath(); g.arc(x + laneW / 2, hitY, r + 4 + st.bounce[l] * 6, 0, Math.PI * 2); g.stroke();
  }
  // notes
  for (const nt of st.notes) {
    const dy = (nt.t - now) * speed;
    if (dy > hitY - topY + 40) break;
    if ((nt.done && !nt.missed) || dy < -60) continue;
    const m = st.mus[nt.lane], x = x0 + nt.lane * laneW + laneW / 2, y = hitY - dy;
    g.globalAlpha = nt.missed ? 0.25 : 1;
    g.fillStyle = m.accent; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#ffffff55'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.35, r * 0.35, 0, Math.PI * 2); g.fill();
    g.drawImage(glyph(m.particle), x - r * 0.55, y - r * 0.55, r * 1.1, r * 1.1);
    g.globalAlpha = 1;
  }
  // musicians: bounce + squash on each hit
  const keys = LANE_KEYS[n];
  for (let l = 0; l < n; l++) {
    const m = st.mus[l], x = x0 + l * laneW + laneW / 2, b = st.bounce[l], s = Math.min(92, laneW * 0.85, bottom * 0.5);
    st.bounce[l] *= 0.86;
    g.save(); g.translate(x, hitY + bottom * 0.42 - b * 10); g.scale(1 + b * 0.14, 1 - b * 0.16);
    if (m.im?.complete && m.im.naturalWidth) g.drawImage(m.im, -s / 2, -s / 2, s, s);
    else { g.fillStyle = m.accent; g.beginPath(); g.arc(0, 0, s * 0.3, 0, Math.PI * 2); g.fill(); }
    g.restore();
    if (bottom < 120) continue; // very short screens: no room for labels
    g.fillStyle = '#5a3e52'; g.font = '600 12px Nunito, ui-rounded, system-ui, sans-serif'; g.textAlign = 'center';
    g.fillText(TOUCH ? m.name : `${keys[l].slice(3)} · ${m.name}`, x, hitY + bottom * 0.7);
  }
  // judgements
  st.fx = st.fx.filter((f) => performance.now() - f.at < 600);
  for (const f of st.fx) {
    const k = (performance.now() - f.at) / 600;
    g.globalAlpha = 1 - k; g.fillStyle = JCOL[f.text]; g.font = '800 18px Nunito, ui-rounded, system-ui, sans-serif'; g.textAlign = 'center';
    g.fillText(f.text, x0 + f.lane * laneW + laneW / 2, hitY - r - 14 - k * 24);
  }
  g.globalAlpha = 1;
  // HUD
  g.textAlign = 'left'; g.fillStyle = '#5a3e52'; g.font = '700 15px Nunito, ui-rounded, system-ui, sans-serif';
  g.fillText(st.title.length > 46 ? `${st.title.slice(0, 45)}…` : st.title, 18, 30);
  g.textAlign = 'right'; g.font = '800 22px Nunito, ui-rounded, system-ui, sans-serif'; g.fillStyle = '#ff6f9f';
  g.fillText(st.score.toLocaleString('fr-FR'), innerWidth - 72, 34); // clear of the ✕ button
  if (st.combo > 2) {
    g.textAlign = 'center'; g.font = '30px "Cherry Bomb One", Nunito, ui-rounded, system-ui, sans-serif'; g.fillStyle = '#5a3e52cc';
    g.fillText(`${st.combo} combo · ×${Math.min(4, 1 + Math.floor(st.combo / 10))}`, innerWidth / 2, 62);
  }
  const p = Math.max(0, Math.min(1, now / (st.duration || 1)));
  g.fillStyle = '#ffffff99'; g.beginPath(); g.roundRect(18, 42, 200, 6, 3); g.fill();
  g.fillStyle = '#ff6f9f'; g.beginPath(); g.roundRect(18, 42, 200 * p, 6, 3); g.fill();
  if (now < 0) { g.textAlign = 'center'; g.font = '72px "Cherry Bomb One", Nunito, ui-rounded, system-ui, sans-serif'; g.fillStyle = '#ff6f9f'; g.fillText(Math.ceil(-now), innerWidth / 2, innerHeight / 2 - 40); }
}
