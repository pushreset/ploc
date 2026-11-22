import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CHARS, BY_ID, UNIVERSES, RARITY, CAP_H, buildKey, disposeKey, roll } from './chars.js';
import * as sfx from './audio.js';
import { BOARDS, BOARD_BY_ID, DEFAULT_LABELS, cells, outline, bounds } from './boards.js';
import { emojiImg, emojiHTML } from './emoji.js';
import { openConcert, concertOpen } from './concert.js';
import { openClaw, clawOpen, stepClaw } from './claw.js';
import { TUNING, NEEDS, FOODS, GAMES, CARE, CATS, AILMENTS, BY, rollNeed, tryItem, reward, neighbours } from './needs.js';

const $ = (s) => document.querySelector(s);
// AZERTY fallback (Firefox/Safari have no getLayoutMap); keydown below corrects labels to the layout really used
const LABEL = { ...DEFAULT_LABELS };
// digit keys keep showing 1-7 (AZERTY's unshifted & é " ' ( would just confuse)
navigator.keyboard?.getLayoutMap?.().then((m) => { for (const c in LABEL) if (m.get(c) && !c.startsWith('Digit')) LABEL[c] = m.get(c).toUpperCase(); hintKeys(); }).catch(() => {});
const DUP_BONUS = { common: 8, rare: 20, super: 50, secret: 150 };
const cost = () => Math.min(20 + S.opened * 10, 90);

// ---------- save ----------
const SAVE = 'ploc-save-v1';
function fresh() {
  const slots = Array(12).fill(null);
  ['guimauve', 'brioche', 'lumi', 'mousse'].forEach((id, k) => (slots[4 + k] = id));
  return { tokens: 0, opened: 0, presses: 0, owned: slots.filter(Boolean), boards: { classic: slots }, board: 'classic' };
}
let S;
try { S = JSON.parse(localStorage.getItem(SAVE)) || fresh(); } catch { S = fresh(); }
S.owned = (S.owned || []).filter((id) => BY_ID[id]);
S.know ||= {}; S.cures ||= {}; S.tips ||= {}; S.concert ||= { offset: 0, hitSounds: true, best: {} }; // what the player has learned about each figure + remedies
if (!S.boards) S.boards = { classic: S.slots || [] }; // saves from before multiple plates
const unlocked = (b) => S.opened >= b.at;
if (!BOARD_BY_ID[S.board] || !unlocked(BOARD_BY_ID[S.board])) S.board = 'classic';
// each plate keeps its own layout; the same figure may sit on several plates
function slotsFor(b) {
  const a = S.boards[b.id] || [];
  return (S.boards[b.id] = cells(b).map((_, i) => (BY_ID[a[i]] && S.owned.includes(a[i]) ? a[i] : null)));
}
S.slots = slotsFor(BOARD_BY_ID[S.board]); // always the current plate's array
let saveT;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(SAVE, JSON.stringify(S, (k, v) => (k === 'slots' ? undefined : v))); } catch {} }, 400); };

// ---------- renderer / scene ----------
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const BG = new THREE.Color('#f7e6ee');
const scene = new THREE.Scene();
scene.background = BG;
scene.fog = new THREE.Fog(BG, 14, 30);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const camBase = new THREE.Vector3(), camLook = new THREE.Vector3();

scene.add(new THREE.HemisphereLight('#fff6fb', '#e8c9d8', 1.1));
const sun = new THREE.DirectionalLight('#fff3e8', 2.2);
sun.position.set(3.5, 9, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 25 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun);

const desk = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#f4dde7', roughness: 0.95 }));
desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true;
scene.add(desk);

// ---------- keyboard plates ----------

const housingGeo = new RoundedBoxGeometry(0.62, 0.14, 0.62, 3, 0.04), housingMat = new THREE.MeshStandardMaterial({ color: '#e6c7d8', roughness: 0.6 });
const stemMat = new THREE.MeshPhysicalMaterial({ color: '#ff8fb8', roughness: 0.3, clearcoat: 1 });
const stemA = new THREE.BoxGeometry(0.2, 0.2, 0.06), stemB = new THREE.BoxGeometry(0.06, 0.2, 0.2);
const hitGeo = new THREE.BoxGeometry(1.08, 0.12, 1.08); // flat pad so empty slots are clickable without masking the row behind
const ring = new THREE.Mesh(new THREE.RingGeometry(0.56, 0.64, 48), new THREE.MeshBasicMaterial({ color: '#ff6f9f', transparent: true, opacity: 0.9 }));
ring.rotation.x = -Math.PI / 2; ring.visible = false;

// plate = the board's outline extruded with a soft bevel, plus a thinner coloured deck on top
function buildBoard(b) {
  const group = new THREE.Group(); scene.add(group);
  const poly = outline(b), shape = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
  const plateGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.36, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 4, curveSegments: 8 });
  const deckGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  const plate = new THREE.Mesh(plateGeo, new THREE.MeshPhysicalMaterial({ color: b.plate, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2 }));
  plate.rotation.x = -Math.PI / 2; plate.position.y = 0.07; plate.castShadow = plate.receiveShadow = true;
  const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({ color: b.deck, roughness: 0.7 }));
  deck.rotation.x = -Math.PI / 2; deck.position.y = 0.5; deck.scale.set(0.95, 0.95, 1); deck.receiveShadow = true;
  group.add(plate, deck);
  const slots = cells(b).map((c, i) => {
    const holder = new THREE.Group();
    holder.position.set(c.x, 0.53, -c.y);
    group.add(holder);
    const housing = new THREE.Mesh(housingGeo, housingMat); housing.position.y = 0.04; housing.receiveShadow = true; holder.add(housing);
    const mover = new THREE.Group(); holder.add(mover);
    const stem = new THREE.Group(); stem.add(new THREE.Mesh(stemA, stemMat), new THREE.Mesh(stemB, stemMat)); stem.position.y = 0.2;
    stem.children.forEach((m) => (m.castShadow = true));
    mover.add(stem);
    const hit = new THREE.Mesh(hitGeo); hit.visible = false; hit.position.y = 0.06; holder.add(hit); holder.userData.slot = i;
    return { i, code: c.code, r: c.r, c: c.c, holder, mover, stem, hit, key: null, def: null, down: 0, y: 0, v: 0, sq: 1, sv: 0, blink: 1 + Math.random() * 4, yaw: 0 };
  });
  const bb = bounds(poly);
  return { b, group, slots, W: bb.w, D: bb.d, cz: bb.cz, geos: [plateGeo, deckGeo], mats: [plate.material, deck.material] };
}
function disposeBoard(o) {
  o.slots.forEach((s) => { if (s.key) disposeKey(s.key); if (s.bubble) { s.bubble.material.map.dispose(); s.bubble.material.dispose(); } });
  o.geos.forEach((g) => g.dispose()); o.mats.forEach((m) => m.dispose());
  o.group.removeFromParent();
}
let cur = null, old = null, slide = 1, slideDir = 0, slots = [], hits = [];
const slotOf = (o) => { while (o && o.userData.slot === undefined) o = o.parent; return o?.userData.slot; };

function setSlotKey(i, id) {
  const s = slots[i];
  if (s.key) disposeKey(s.key);
  S.slots[i] = id; save();
  s.def = id ? BY_ID[id] : null;
  s.key = id ? buildKey(s.def) : null;
  if (s.key) s.mover.add(s.key.group);
  s.stem.visible = !id;
}
// dir: -1/1 slides the new plate in from that side, 0 = instant
function showBoard(id, dir = 0) {
  releaseAll?.(); closeMenu?.(); sfx.purr(false);
  if (editing) toggleEdit();
  if (old) disposeBoard(old);
  old = cur;
  S.board = id; S.slots = slotsFor(BOARD_BY_ID[id]); save();
  cur = buildBoard(BOARD_BY_ID[id]);
  slots = cur.slots; hits = slots.map((s) => s.holder); // raycast the real meshes (cap + figure), not a bounding box
  S.slots.forEach((kid, i) => setSlotKey(i, kid));
  slide = dir && old ? 0 : 1; slideDir = dir;
  if (old && !dir) { disposeBoard(old); old = null; }
  resize(); hintKeys(); boardUI();
}
function stepBoard(dir) {
  const list = BOARDS.filter(unlocked);
  if (cap || list.length < 2) return;
  const k = list.findIndex((b) => b.id === S.board);
  showBoard(list[(k + dir + list.length) % list.length].id, dir);
  sfx.unlock(); sfx.ratchet();
}

// ---------- particles ----------
const TEX = {};
for (const kind of ['heart', 'star', 'leaf', 'crumb', 'bubble', 'note', 'bat', 'sparkle', 'paw', 'sakura', 'spore', 'gear', 'snow', 'pixel']) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const g = cv.getContext('2d'); g.fillStyle = g.strokeStyle = '#fff'; g.translate(32, 32);
  drawParticle(g, kind);
  TEX[kind] = new THREE.CanvasTexture(cv); TEX[kind].colorSpace = THREE.SRGBColorSpace;
}
// white particle shapes on a 64px canvas centred at 0,0 (also used by the Concert notes)
function drawParticle(g, kind) {
  if (kind === 'heart') { g.beginPath(); g.moveTo(0, 22); g.bezierCurveTo(-34, 0, -18, -26, 0, -10); g.bezierCurveTo(18, -26, 34, 0, 0, 22); g.fill(); }
  if (kind === 'star') { g.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 11 : 27; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); }
  if (kind === 'leaf') { g.rotate(0.6); g.beginPath(); g.ellipse(0, 0, 12, 26, 0, 0, Math.PI * 2); g.fill(); }
  if (kind === 'crumb') { g.beginPath(); g.arc(0, 0, 18, 0, Math.PI * 2); g.fill(); }
  if (kind === 'bubble') { g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 24, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(-9, -9, 6, 0, Math.PI * 2); g.fill(); }
  if (kind === 'note') { g.beginPath(); g.ellipse(-8, 16, 11, 8, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(1, -24, 5, 40); g.beginPath(); g.moveTo(6, -24); g.quadraticCurveTo(22, -16, 18, 0); g.quadraticCurveTo(16, -10, 6, -12); g.fill(); }
  if (kind === 'bat') {
    g.beginPath(); g.moveTo(0, -6);
    g.quadraticCurveTo(14, -18, 30, -8); g.quadraticCurveTo(24, -2, 22, 6); g.quadraticCurveTo(16, 0, 10, 8); g.quadraticCurveTo(5, 4, 0, 12);
    g.quadraticCurveTo(-5, 4, -10, 8); g.quadraticCurveTo(-16, 0, -22, 6); g.quadraticCurveTo(-24, -2, -30, -8); g.quadraticCurveTo(-14, -18, 0, -6); g.fill();
  }
  if (kind === 'sparkle') { g.beginPath(); g.moveTo(0, -28); for (const [a, b] of [[28, 0], [0, 28], [-28, 0], [0, -28]]) g.quadraticCurveTo(0, 0, a, b); g.fill(); }
  if (kind === 'paw') { g.beginPath(); g.ellipse(0, 10, 15, 12, 0, 0, Math.PI * 2); g.fill(); for (const [x, y] of [[-17, -8], [-6, -18], [6, -18], [17, -8]]) { g.beginPath(); g.arc(x, y, 6.5, 0, Math.PI * 2); g.fill(); } }
  if (kind === 'sakura') { g.beginPath(); g.ellipse(0, 4, 13, 24, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(-6, -24); g.lineTo(0, -14); g.lineTo(6, -24); g.fill(); g.globalCompositeOperation = 'source-over'; }
  if (kind === 'spore') { const rg = g.createRadialGradient(0, 0, 0, 0, 0, 28); rg.addColorStop(0, '#fff'); rg.addColorStop(0.35, 'rgba(255,255,255,.8)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(-32, -32, 64, 64); }
  if (kind === 'gear') { for (let k = 0; k < 8; k++) { g.save(); g.rotate((k / 8) * Math.PI * 2); g.fillRect(-5, -27, 10, 12); g.restore(); } g.beginPath(); g.arc(0, 0, 18, 0, Math.PI * 2); g.arc(0, 0, 7, 0, Math.PI * 2, true); g.fill(); }
  if (kind === 'pixel') g.fillRect(-18, -18, 36, 36);
  if (kind === 'snow') { g.lineWidth = 4; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { g.save(); g.rotate((k / 6) * Math.PI * 2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -26); g.moveTo(0, -15); g.lineTo(-7, -21); g.moveTo(0, -15); g.lineTo(7, -21); g.stroke(); g.restore(); } }
}
const parts = Array.from({ length: 160 }, () => {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
  sp.visible = false; sp.userData = { v: new THREE.Vector3(), life: 0 }; scene.add(sp);
  return sp;
});
let pi = 0;
function burst(kind, pos, n, color, power = 1) {
  for (let k = 0; k < n; k++) {
    const p = parts[pi++ % parts.length], u = p.userData;
    p.visible = true; p.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4));
    p.material.map = TEX[kind]; p.material.color.set(color); p.material.rotation = Math.random() * 6;
    u.v.set((Math.random() - 0.5) * 1.6 * power, (1.2 + Math.random() * 1.4) * power, (Math.random() - 0.5) * 1.6 * power);
    u.life = 1; u.max = 0.9 + Math.random() * 0.7; u.size = 0.11 + Math.random() * 0.09; u.spin = (Math.random() - 0.5) * 4;
    u.g = kind === 'snow' ? 0.35 : ['bubble', 'star', 'note', 'sparkle', 'bat', 'spore', 'sakura'].includes(kind) ? -0.6 : 2.2; // light things drift up, crumbs/leaves fall
  }
}
function updateParticles(dt) {
  for (const p of parts) {
    const u = p.userData; if (!p.visible) continue;
    u.life -= dt / u.max; if (u.life <= 0) { p.visible = false; continue; }
    u.v.y -= u.g * dt; u.v.multiplyScalar(1 - 1.6 * dt);
    p.position.addScaledVector(u.v, dt);
    p.material.rotation += u.spin * dt;
    p.material.opacity = Math.min(1, u.life * 3);
    p.scale.setScalar(u.size * (0.7 + 0.5 * (1 - u.life)));
  }
}
const tmpV = new THREE.Vector3();
const keyTop = (i) => slots[i].holder.getWorldPosition(tmpV).add(new THREE.Vector3(0, 1.0, 0)).clone();

// ---------- presses ----------
const kindOf = (s) => (s.def ? UNIVERSES[s.def.uni].sound : 'plain');
let presses = 0;
function press(i) {
  const s = slots[i];
  if (s.down++ > 0) return;
  sfx.press(kindOf(s), s.def ? s.def.idx : i);
  s.v -= 1.5; s.sv -= 4;
  const id = s.def?.id;
  if (!id || !sulk[id]) S.tokens += 1 + (id ? Math.floor(know(id).hearts / 2) : 0); // sulking figures give nothing; loved ones give more
  S.presses++; save();
  if (id && needs[id]) needPress(s, needs[id]);
  navigator.vibrate?.(6);
  hud(true);
  if (++presses === 10) $('#hint').classList.add('gone');
}
function release(i) {
  const s = slots[i];
  if (s.down === 0 || --s.down > 0) return;
  sfx.release(kindOf(s), s.def ? s.def.idx : i);
  const n = s.def && needs[s.def.id];
  if (n?.type === 'massage' && n.holding) { n.holding = false; n.hold = 0; sfx.purr(false); }
  s.sv += 3.5;
  const U = s.def ? UNIVERSES[s.def.uni] : null;
  burst(U ? U.particle : 'bubble', keyTop(i), 2 + ((Math.random() * 2) | 0), U ? U.pcolor : '#ffffff');
}
function releaseAll() { pointers.clear(); slots.forEach((s, i) => { if (s.down) { s.down = 1; release(i); } }); }

// ---------- capsule ----------
const CAP_R = 0.55, capPos = new THREE.Vector3();
let cap = null;
// opt.free + opt.def: a capsule won at the claw machine (set + rarity already decided)
function buy(opt = {}) {
  if (cap || editing || (!opt.free && S.tokens < cost())) return;
  sfx.unlock();
  if (!opt.free) S.tokens -= cost();
  S.opened++;
  const def = opt.def || roll(S.owned);
  const g = new THREE.Group(); g.position.set(capPos.x, 6, capPos.z);
  const shell = opt.def ? new THREE.Color(def.rarity === 'secret' ? '#ffd25a' : UNIVERSES[def.uni].cap) : new THREE.Color().setHSL(Math.random(), 0.8, 0.78);
  const top = new THREE.Mesh(new THREE.SphereGeometry(CAP_R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: shell, roughness: 0.2, clearcoat: 1, sheen: 0.5, transparent: true }));
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(CAP_R, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }));
  const band = new THREE.Mesh(new THREE.TorusGeometry(CAP_R, 0.035, 12, 64), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.3, clearcoat: 1, transparent: true }));
  band.rotation.x = Math.PI / 2;
  // stripes on the lid so the twist is readable
  for (let k = 0; k < 6; k++) {
    const st = new THREE.Mesh(new THREE.SphereGeometry(CAP_R * 1.005, 6, 12, (k / 6) * Math.PI * 2, 0.18, 0.15, Math.PI / 2 - 0.15), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.25, clearcoat: 1, transparent: true }));
    top.add(st);
  }
  top.castShadow = bottom.castShadow = true;
  const key = buildKey(def);
  key.group.scale.setScalar(0.55); key.group.position.y = -0.4;
  const hit = new THREE.Mesh(new THREE.SphereGeometry(0.8)); hit.visible = false;
  g.add(top, bottom, band, key.group, hit);
  scene.add(g);
  cap = { def, g, top, bottom, band, key, hit, state: 'drop', y: 6, vy: 0, clicks: 0, rot: 0, rotV: 0, rotT: 0, wob: 0, wobV: 0, sq: 1, sv: 0, t: 0 };
  hud();
}
function capsuleClick() {
  if (!cap) return;
  if (cap.state === 'idle') {
    cap.clicks++; cap.rotT += Math.PI / 3; cap.wobV += (Math.random() < 0.5 ? -1 : 1) * 5; cap.sv -= 3;
    sfx.ratchet();
    if (cap.clicks >= 3) openCapsule();
  } else if (cap.state === 'reveal') store();
}
function openCapsule() {
  const { def } = cap;
  cap.state = 'opening'; cap.t = 0; cap.g.rotation.set(0, 0, 0);
  cap.topV = new THREE.Vector3((Math.random() - 0.5) * 2, 5.5, -1.2);
  cap.dup = S.owned.includes(def.id);
  if (cap.dup) S.tokens += DUP_BONUS[def.rarity]; else S.owned.push(def.id);
  save(); hud();
  sfx.crack(def.rarity);
  const U = UNIVERSES[def.uni], c = cap.g.position.clone().add(new THREE.Vector3(0, 0.4, 0));
  const extra = { common: 0, rare: 8, super: 16, secret: 30 }[def.rarity];
  burst('bubble', c, 10, '#ffffff', 1.6); burst(U.particle, c, 12 + extra, U.pcolor, 1.8);
  if (def.rarity !== 'common') burst('star', c, extra, RARITY[def.rarity].color, 2.2);
  setTimeout(() => showBanner(def, cap?.dup), 350);
  const nb = BOARDS.find((b) => b.at === S.opened); // this capsule reached a plate threshold
  if (nb) setTimeout(() => { toast(`Nouveau plateau : ${nb.name} !  ← → pour changer`); boardUI(); $('#next').classList.add('pulse'); sfx.crack('rare'); }, 1300);
}
function store() {
  hideBanner();
  const empty = S.slots.indexOf(null);
  if (cap.dup || empty < 0) {
    if (!cap.dup) toast('Rangée dans la boîte — bouton « Ranger » pour l’équiper');
    cap.state = 'vanish'; cap.t = 0;
    return;
  }
  cap.state = 'fly'; cap.t = 0; cap.target = empty;
  scene.attach(cap.key.group);
  cap.from = cap.key.group.position.clone(); cap.fromS = cap.key.group.scale.x;
  cap.to = slots[empty].mover.getWorldPosition(new THREE.Vector3());
}
function removeCapsule() {
  if (cap.key.group.parent) disposeKey(cap.key);
  cap.g.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  cap.g.removeFromParent();
  cap = null; hud();
}
const spring = (x, v, target, k, d, dt) => { v += (-k * (x - target) - d * v) * dt; return [x + v * dt, v]; };
function updateCapsule(dt, time) {
  if (!cap) return;
  const c = cap; c.t += dt;
  [c.rot, c.rotV] = spring(c.rot, c.rotV, c.rotT, 140, 14, dt); c.top.rotation.y = c.rot;
  [c.wob, c.wobV] = spring(c.wob, c.wobV, 0, 160, 6, dt);
  [c.sq, c.sv] = spring(c.sq, c.sv, 1, 300, 10, dt);
  if (c.state === 'drop') {
    c.vy -= 30 * dt; c.y += c.vy * dt;
    if (c.y < CAP_R) {
      c.y = CAP_R;
      if (Math.abs(c.vy) > 2) { sfx.thud(Math.min(1, Math.abs(c.vy) / 12)); c.wobV += c.vy * 0.4; c.sv += c.vy * 0.25; c.vy = -c.vy * 0.38; }
      else { c.vy = 0; c.state = 'idle'; }
    }
  }
  if (c.state === 'drop' || c.state === 'idle') {
    c.g.position.y = c.y + (c.state === 'idle' ? Math.sin(time * 2.4) * 0.03 : 0);
    c.g.rotation.z = c.wob * 0.25; c.g.rotation.x = c.wob * 0.1;
    c.g.scale.set(2 - c.sq, c.sq, 2 - c.sq);
  }
  if (c.state === 'opening' || c.state === 'reveal') {
    c.g.scale.setScalar(1);
    if (c.top.visible) {
      c.topV.y -= 14 * dt; c.top.position.addScaledVector(c.topV, dt); c.top.rotation.x += 5 * dt; c.band.position.y += c.topV.y * dt * 0.6;
      const fade = Math.max(0, 1 - c.t / 0.9);
      c.top.traverse((o) => o.material && (o.material.opacity = fade)); c.band.material.opacity = fade;
      c.bottom.material.opacity = 0.45 * fade; c.bottom.scale.setScalar(Math.max(0.01, fade));
      if (fade === 0) c.top.visible = c.bottom.visible = c.band.visible = false;
    }
    const k = c.key.group;
    k.scale.setScalar(THREE.MathUtils.damp(k.scale.x, 1.2, 7, dt));
    k.position.y = THREE.MathUtils.damp(k.position.y, 0.75 + Math.sin(time * 2) * 0.06, 6, dt);
    k.rotation.y += dt * (c.state === 'opening' ? 6 * Math.max(0.15, 1 - c.t) : 0.9);
    if (c.state === 'opening' && c.t > 1) c.state = 'reveal';
  }
  if (c.state === 'fly') {
    const u = Math.min(1, c.t / 0.55), e = u * u * (3 - 2 * u), k = c.key.group;
    k.position.lerpVectors(c.from, c.to, e); k.position.y += Math.sin(Math.PI * e) * 1.4;
    k.scale.setScalar(THREE.MathUtils.lerp(c.fromS, 1, e));
    k.rotation.y = THREE.MathUtils.lerp(k.rotation.y % (Math.PI * 2), 0, e);
    if (u === 1) {
      const i = c.target; setSlotKey(i, c.def.id);
      slots[i].v -= 3; slots[i].sv -= 5; sfx.place();
      burst(UNIVERSES[c.def.uni].particle, keyTop(i), 8, UNIVERSES[c.def.uni].pcolor);
      removeCapsule();
    }
  }
  if (c.state === 'vanish') {
    const k = c.key.group; k.scale.setScalar(Math.max(0.001, k.scale.x - dt * 5)); k.rotation.y += dt * 10;
    if (k.scale.x <= 0.001) { sfx.tick(); removeCapsule(); }
  }
}

// ---------- needs (tamagotchi layer) ----------
const needs = {}, sulk = {}; // by figure id: needs follow the figure across plates; in-session only
let spawnT = 3, greet = 2, checkT = 0.5, menuSlot = null;
const know = (id) => (S.know[id] ||= { foods: [], games: [], hearts: 0 });
const heart = (id, d) => { const k = know(id); k.hearts = Math.max(0, Math.min(5, k.hearts + d)); };
const slotOfId = (id) => slots.find((x) => x.def?.id === id);
const EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function giveNeed(s, force, extra) {
  const id = s.def.id;
  const others = BOARDS.filter(unlocked).map((b) => b.id).filter((b) => b !== S.board);
  needs[id] = Object.assign(rollNeed({ id, owned: S.owned, boards: others }, Math.random, force), extra);
  if (!S.tips[needs[id].type]) { S.tips[needs[id].type] = 1; save(); toast(`${s.def.name} : ${NEEDS[needs[id].type].tip}`); }
  sfx.tick();
  return needs[id];
}
function needPress(s, n) {
  if (n.type === 'calin') {
    if (n.left > 0) { n.left--; if (!n.left) n.settle = TUNING.settle; }
    else { n.left = n.n; n.settle = null; n.tries++; fail(s, 'Oups, un câlin de trop ! On recommence.'); }
  }
  if (n.type === 'massage') { n.holding = true; n.hold = 0; sfx.purr(true); }
  if (n.type === 'dodo') { n.quiet = 0; n.tries++; fail(s, 'Chut… il dormait ! 😴'); }
}
function fail(s, msg) { sfx.nope(); s.anim = { type: 'shake', t: 0, dur: 0.5 }; s.bubbleSig = ''; if (msg) toast(msg); }
function satisfy(id, anim) {
  const n = needs[id]; if (!n) return;
  delete needs[id];
  const r = reward(n); S.tokens += r; heart(id, 1);
  if (n.type === 'faim' && !know(id).foods.includes(n.want)) know(id).foods.push(n.want);
  if (n.type === 'jeu' && !know(id).games.includes(n.want)) know(id).games.push(n.want);
  save(); hud(true); sfx.yay();
  const s = slotOfId(id);
  if (!s) return toast(`${BY_ID[id].name} : merci ! +${r} ✦`);
  burst('heart', keyTop(s.i), 8, '#ff86b0', 1.4); floatText(s, `+${r} ✦`);
  s.anim = anim || { type: 'joy', t: 0, dur: 0.7 }; s.sv -= 3;
  if (s.anim.item) s.anim.sp = emojiSprite(s, s.anim.item);
}
function give(i, item) {
  const s = slots[i], id = s.def?.id, n = id && needs[id];
  closeMenu();
  if (!n) return;
  if (tryItem(n, item)) {
    if (n.type === 'malade' && !(S.cures[n.ail] ||= []).includes(item)) S.cures[n.ail].push(item);
    const type = n.type === 'faim' ? 'eat' : n.type === 'jeu' ? BY[item].anim : 'heal';
    satisfy(id, { type, t: 0, dur: 1.6, item: BY[item].e });
  } else if (n.type === 'faim') fail(s, n.tries === 1 ? `Non merci… indice : plutôt ${CATS[BY[n.want].cat].name.toLowerCase()} ${CATS[BY[n.want].cat].e}` : 'Toujours pas… regarde la silhouette dans sa bulle !');
  else if (n.type === 'jeu') fail(s, 'Pas envie… regarde la silhouette dans sa bulle !');
  else fail(s, `Ça ne soigne pas ${AILMENTS[n.ail].name.toLowerCase()}…`);
}

function emojiSprite(s, e) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  emoji(cv.getContext('2d'), e, 64, 64, 96);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false, fog: false }));
  sp.renderOrder = 11; sp.scale.setScalar(0.38); sp.position.set(0.3, 0.95, 0.35); s.holder.add(sp);
  return sp;
}
function floatText(s, txt) {
  const v = s.holder.localToWorld(new THREE.Vector3(0, 1.3, 0)).project(camera);
  const el = document.createElement('div'); el.className = 'float'; el.textContent = txt;
  el.style.left = `${((v.x + 1) / 2) * innerWidth}px`; el.style.top = `${((1 - v.y) / 2) * innerHeight}px`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1300);
}

// comic bubble drawn on a canvas; redrawn only when what it shows changes
function bubbleFor(s) {
  if (!s.bubble) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 224;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false, fog: false }));
    sp.scale.set(0.86, 0.75, 1); sp.renderOrder = 10; sp.userData.slot = s.i;
    s.holder.add(sp); s.bubble = sp; s.bubbleCv = cv; s.bubbleSig = '';
  }
  return s.bubble;
}
const imgs = {};
function thumbImg(id) {
  if (!imgs[id]) { imgs[id] = new Image(); imgs[id].onload = () => slots.forEach((s) => (s.bubbleSig = '')); imgs[id].src = thumb(id); }
  return imgs[id];
}
// Fluent 3D image when available (bubbles redraw once it loads), system emoji font otherwise; dark = silhouette hint
const redrawBubbles = () => slots.forEach((s) => (s.bubbleSig = ''));
function emoji(g, e, x, y, size, dark) {
  const im = emojiImg(e, redrawBubbles), d = Math.round(size * 1.15);
  const c = document.createElement('canvas'); c.width = c.height = Math.round(size * 1.4); const h = c.getContext('2d');
  if (im) h.drawImage(im, (c.width - d) / 2, (c.height - d) / 2, d, d);
  else { h.font = `${size}px ${EMOJI}`; h.textAlign = 'center'; h.textBaseline = 'middle'; h.fillText(e, c.width / 2, c.height / 2); }
  if (dark) { h.globalCompositeOperation = 'source-in'; h.fillStyle = '#5a3e52'; h.fillRect(0, 0, c.width, c.height); }
  g.drawImage(c, x - c.width / 2, y - c.height / 2);
}
// warm the cache so the first bubble / animation already has its picture
[...FOODS, ...GAMES, ...CARE, ...Object.values(NEEDS), ...Object.values(AILMENTS), ...Object.values(CATS), { e: '💢' }].forEach((x) => emojiImg(x.e));
function drawBubble(s) {
  const id = s.def.id, n = needs[id], sk = !n && sulk[id];
  const sig = sk ? 'sulk' : [n.type, n.left, n.tries, Math.floor((n.hold || 0) * 8), n.type === 'dodo' ? Math.ceil(TUNING.sleep - n.quiet) : 0, Math.ceil((1 - n.t / TUNING.life) * 16), imgs[n.friend]?.complete].join();
  if (sig === s.bubbleSig) return;
  s.bubbleSig = sig;
  const g = s.bubbleCv.getContext('2d');
  g.clearRect(0, 0, 256, 224);
  // body + tail as ONE outline, so the stroke runs around the tail with no seam
  const [x, y, w, h, r, tx, tw] = [14, 10, 228, 160, 42, 128, 18];
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.lineTo(tx + tw, y + h); g.lineTo(tx, y + h + 36); g.lineTo(tx - tw, y + h);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.lineWidth = 8; g.lineJoin = 'round'; g.strokeStyle = sk ? '#ff9b9b' : '#f3bdd3'; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#5a3e52';
  if (sk) { emoji(g, '💢', 128, 92, 96); }
  else {
    const f = 1 - n.t / TUNING.life;
    g.fillStyle = f > 0.5 ? '#8ed98a' : f > 0.25 ? '#ffc65c' : '#ff7a7a';
    g.beginPath(); g.roundRect(54, 150, 148 * f, 10, 5); g.fill(); g.fillStyle = '#5a3e52';
    const T = n.type;
    if (T === 'faim' || T === 'jeu') {
      const w = BY[n.want], showSil = T === 'faim' ? n.tries >= 2 : n.tries >= 1;
      emoji(g, NEEDS[T].e, showSil ? 82 : 128, 86, showSil ? 76 : 92);
      if (showSil) emoji(g, w.e, 180, 86, 70, true);
      if (T === 'faim' && n.tries >= 1) emoji(g, CATS[w.cat].e, 208, 36, 40);
    } else if (T === 'calin') {
      emoji(g, '👆', 86, 86, 78); g.font = 'bold 64px Nunito, ui-rounded, system-ui, sans-serif'; g.fillText(`×${n.left}`, 178, 90);
    } else if (T === 'massage') {
      emoji(g, '💆', 128, 86, 80);
      g.beginPath(); g.arc(128, 86, 58, -Math.PI / 2, -Math.PI / 2 + (n.hold / TUNING.massage) * Math.PI * 2);
      g.lineWidth = 9; g.strokeStyle = '#ff6f9f'; g.stroke();
    } else if (T === 'dodo') {
      emoji(g, '😴', 86, 86, 78); g.font = 'bold 60px Nunito, ui-rounded, system-ui, sans-serif'; g.fillText(Math.ceil(TUNING.sleep - n.quiet), 180, 90);
    } else if (T === 'malade') {
      emoji(g, AILMENTS[n.ail].e, 128, 86, 96);
    } else if (T === 'ami') {
      emoji(g, '💞', 58, 86, 56);
      const im = thumbImg(n.friend); if (im.complete) g.drawImage(im, 92, 22, 128, 128);
    } else if (T === 'voyage') {
      emoji(g, '🗺️', 58, 86, 56);
      const b = BOARD_BY_ID[n.board], poly = outline(b), xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
      const k = Math.min(110 / (Math.max(...xs) - Math.min(...xs)), 100 / (Math.max(...ys) - Math.min(...ys)));
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      g.beginPath(); poly.forEach(([x, y], j) => g[j ? 'lineTo' : 'moveTo'](160 + (x - cx) * k, 84 - (y - cy) * k)); g.closePath();
      g.fillStyle = b.deck; g.fill(); g.lineWidth = 5; g.strokeStyle = b.plate === '#fffafd' ? '#e6bfd0' : b.plate; g.stroke();
    }
  }
  s.bubble.material.map.needsUpdate = true;
}

function updateNeeds(dt, time) {
  if ((spawnT -= dt) <= 0) {
    spawnT = greet > 0 ? 2.5 : TUNING.spawnMin + Math.random() * (TUNING.spawnMax - TUNING.spawnMin);
    if (greet > 0) greet--; // 1-2 figures greet the player with a need right after loading
    const placed = slots.filter((x) => x.def), free = placed.filter((x) => !needs[x.def.id] && !sulk[x.def.id]);
    const capN = Math.min(TUNING.maxActive, 1 + Math.floor(placed.length / 4));
    if (Object.keys(needs).length < capN && free.length && !cap) giveNeed(free[(Math.random() * free.length) | 0]);
  }
  for (const id in sulk) if ((sulk[id] -= dt) <= 0) delete sulk[id];
  for (const id in needs) {
    const n = needs[id], s = slotOfId(id);
    if ((n.t += dt) >= TUNING.life) {
      delete needs[id]; sulk[id] = TUNING.sulk; heart(id, -1); save();
      if (n.type === 'massage') sfx.purr(false);
      sfx.nope(); toast(`${BY_ID[id].name} boude 💢 (ses clics ne rapportent rien pendant 1 min)`);
      continue;
    }
    if (n.type === 'calin' && n.settle != null && (n.settle -= dt) <= 0) satisfy(id);
    if (n.type === 'massage' && s?.down && n.holding && (n.hold += dt) >= TUNING.massage) { sfx.purr(false); satisfy(id); }
    if (n.type === 'dodo' && s && (n.quiet += dt) >= TUNING.sleep) satisfy(id);
    if (n.type === 'malade' && s && n.ail === 'rhume' && (n.sneezeT = (n.sneezeT ?? 2) - dt) <= 0) {
      n.sneezeT = 5 + Math.random() * 4; sfx.sneeze(); burst('bubble', keyTop(s.i), 5, '#c8f0b0', 1.4);
    }
  }
  if ((checkT -= dt) <= 0) { // friend / trip needs are met by rearranging plates
    checkT = 0.5;
    for (const id in needs) {
      const n = needs[id];
      if (n.type === 'ami' && BOARDS.some((b) => S.boards[b.id] && neighbours(cells(b), S.boards[b.id], id, n.friend))) satisfy(id);
      else if (n.type === 'voyage' && S.boards[n.board]?.includes(id)) satisfy(id);
    }
  }
  for (const s of slots) {
    const id = s.def?.id;
    if (!id || (!needs[id] && !sulk[id])) { if (s.bubble) s.bubble.visible = false; continue; }
    const b = bubbleFor(s); b.visible = true; b.position.set(0, 1.55 + Math.sin(time * 2 + s.i) * 0.04, 0);
    drawBubble(s);
  }
}

// action card: food (category, then dish), games, remedies; other needs just explain themselves
const care = $('#care');
function openMenu(i, cat) {
  const s = slots[i], id = s.def?.id, n = id && needs[id];
  if (!n) return sulk[id] && toast(`${s.def.name} boude… attends un peu 💢`);
  const k = know(id), btn = (x, liked) => `<button data-item="${x.id}">${emojiHTML(x.e, 36)}<span>${x.name}</span>${liked ? '<i>❤</i>' : ''}</button>`;
  let body;
  if (n.type === 'faim' && !cat) body = Object.entries(CATS).map(([c, x]) => `<button data-cat="${c}">${emojiHTML(x.e, 36)}<span>${x.name}</span></button>`).join('');
  else if (n.type === 'faim') body = FOODS.filter((f) => f.cat === cat).map((f) => btn(f, k.foods.includes(f.id))).join('') + '<button data-back>↩<span>Retour</span></button>';
  else if (n.type === 'jeu') body = GAMES.map((g) => btn(g, k.games.includes(g.id))).join('');
  else if (n.type === 'malade') body = CARE.map((c) => btn(c, (S.cures[n.ail] || []).includes(c.id))).join('');
  else {
    const extra = n.type === 'ami' ? ` (${BY_ID[n.friend].name})` : n.type === 'voyage' ? ` (${BOARD_BY_ID[n.board].name})` : '';
    return toast(`${s.def.name} : ${NEEDS[n.type].tip}${extra}`);
  }
  const title = { faim: cat ? CATS[cat].name : 'Sucré ou salé ?', jeu: 'À quoi jouer ?', malade: `${AILMENTS[n.ail]?.name} : quel remède ?` }[n.type];
  care.innerHTML = `<p>${s.def.name} · ${title}</p><div>${body}</div>`;
  care.querySelectorAll('[data-item]').forEach((b) => (b.onclick = () => give(i, b.dataset.item)));
  care.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => { sfx.tick(); openMenu(i, b.dataset.cat); }));
  care.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => openMenu(i)));
  const v = s.holder.localToWorld(new THREE.Vector3(0, 1.55, 0)).project(camera);
  $('#toast').classList.remove('on'); // the card replaces any tip that would cover it
  care.classList.add('on'); menuSlot = i;
  const w = care.offsetWidth, h = care.offsetHeight;
  care.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, ((v.x + 1) / 2) * innerWidth - w / 2))}px`;
  care.style.top = `${Math.max(8, ((1 - v.y) / 2) * innerHeight - h - 50)}px`;
  sfx.tick();
}
function closeMenu() { const was = care.classList.contains('on'); care.classList.remove('on'); menuSlot = null; return was; }

// ---------- input ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), mouse = { x: 0, y: 0, seen: false };
function pick(e, objs, deep = false) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObjects(objs, deep)[0]?.object;
}
const pointers = new Map(); // pointerId -> slot, so a finger can roll across keys
const bubbles = () => slots.filter((s) => s.bubble?.visible).map((s) => s.bubble);
canvas.addEventListener('pointerdown', (e) => {
  sfx.unlock();
  const hadMenu = closeMenu();
  const hb = bubbles().length && pick(e, bubbles());
  if (hb) return openMenu(hb.userData.slot);
  if (hadMenu) return; // a click outside the card just closes it
  if (cap && pick(e, [cap.hit])) return capsuleClick();
  const i = slotOf(pick(e, hits, true)); if (i === undefined) return;
  if (editing) return select(i);
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, i); press(i);
});
canvas.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = -(e.clientY / innerHeight) * 2 + 1; mouse.seen = true;
  const cur = pointers.get(e.pointerId);
  if (cur === undefined) { canvas.style.cursor = (cap && pick(e, [cap.hit])) || (bubbles().length && pick(e, bubbles())) || pick(e, hits, true) ? 'pointer' : 'default'; return; }
  const i = slotOf(pick(e, hits, true));
  if (i !== undefined && i !== cur) { release(cur); pointers.set(e.pointerId, i); press(i); }
});
const up = (e) => { const i = pointers.get(e.pointerId); if (i !== undefined) { pointers.delete(e.pointerId); release(i); } };
canvas.addEventListener('pointerup', up);
canvas.addEventListener('pointercancel', up);
addEventListener('blur', releaseAll);
document.addEventListener('click', (e) => e.target.closest('button')?.blur());
document.addEventListener('gesturestart', (e) => e.preventDefault()); // iOS ignores user-scalable=no: block pinch-zoom // keep Space for the game, not the last clicked button
addEventListener('keydown', (e) => {
  if (concertOpen() || clawOpen()) return; // the concert overlay handles its own keys
  if (e.metaKey || e.ctrlKey || e.altKey) return; // browser shortcuts (reload, close tab…) stay usable
  // swallow every other key, repeats included, so Firefox's type-ahead find / quick find (' and /) never steal focus
  if (e.key !== 'Tab' && !/^F\d+$/.test(e.key)) e.preventDefault();
  if (e.repeat) return;
  sfx.unlock();
  if (e.code in LABEL && /^\p{L}$/u.test(e.key) && LABEL[e.code] !== e.key.toUpperCase()) { LABEL[e.code] = e.key.toUpperCase(); hintKeys(); }
  const i = slots.findIndex((s) => s.code === e.code);
  if (i >= 0) { editing ? select(i) : press(i); }
  else if (e.code === 'Space' || e.code === 'Enter') { cap ? capsuleClick() : buy(); }
  else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') stepBoard(e.code === 'ArrowLeft' ? -1 : 1);
  else if (e.code === 'Escape') { closeAlbum(); closeMenu(); if (editing) toggleEdit(); }
});
addEventListener('keyup', (e) => { if (concertOpen() || clawOpen()) return; const i = slots.findIndex((s) => s.code === e.code); if (i >= 0 && !editing) release(i); });

// ---------- HUD ----------
const tokensEl = $('#tokens b'), buyBtn = $('#buy'), albumBtn = $('#albumBtn'), editBtn = $('#edit');
function hud(bump) {
  tokensEl.textContent = S.tokens;
  buyBtn.innerHTML = `Capsule <span>${cost()} ✦</span>`;
  buyBtn.disabled = !!cap || editing || S.tokens < cost();
  editBtn.disabled = !!cap;
  $('#prev').disabled = $('#next').disabled = !!cap || BOARDS.filter(unlocked).length < 2;
  albumBtn.innerHTML = `Album <span>${S.owned.length}/${CHARS.length}</span>`;
  if (bump) { const t = $('#tokens'); t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump'); }
}
function hintKeys() {
  const rows = [...new Set(slots.map((s) => s.r))];
  $('#hint .keys').textContent = rows.map((r) => slots.filter((s) => s.r === r).map((s) => LABEL[s.code]).join(' ')).join(' · ');
}
// plate name + one dot per plate (locked ones show how many capsules they need)
function boardUI() {
  const b = BOARD_BY_ID[S.board], next = BOARDS.find((x) => !unlocked(x));
  $('#plate').innerHTML = `<b>${b.name}</b><span class="dots">${BOARDS.map((x) =>
    `<i class="${x.id === S.board ? 'cur' : unlocked(x) ? 'on' : ''}" title="${unlocked(x) ? x.name : `${x.name} : ${x.at} capsules`}"></i>`).join('')}</span>
    ${next ? `<small>Prochain : ${next.name} · ${S.opened}/${next.at} capsules</small>` : '<small>Tous les plateaux débloqués !</small>'}`;
  hud();
}
$('#prev').onclick = () => stepBoard(-1);
$('#next').onclick = (e) => { e.currentTarget.classList.remove('pulse'); stepBoard(1); };
buyBtn.onclick = () => buy();
// claw machine: prizes wait in a queue and drop on the board one after another
const pendingCaps = [];
function rollFrom(uni, rarity) {
  const pool = CHARS.filter((c) => c.uni === uni && c.rarity === rarity), missing = pool.filter((c) => !S.owned.includes(c.id));
  const from = missing.length ? missing : pool;
  return from[(Math.random() * from.length) | 0];
}
$('#clawBtn').onclick = () => {
  releaseAll(); closeMenu(); if (editing) toggleEdit();
  openClaw({
    S, renderer, environment: scene.environment, cost,
    spend: (n) => { S.tokens -= n; save(); hud(); },
    onClose: (won) => { won.forEach((w) => pendingCaps.push(rollFrom(w.uni, w.rarity))); hud(); },
  });
};
// Concert: the current plate's figures are the band (neutral switches fill missing lanes)
$('#concertBtn').onclick = () => {
  releaseAll(); closeMenu(); if (editing) toggleEdit();
  openConcert({
    S, save,
    drawParticle,
    musicians: (n) => {
      const band = slots.filter((s) => s.def).slice(0, n).map((s) => {
        const U = UNIVERSES[s.def.uni];
        return { id: s.def.id, name: s.def.name, kind: U.sound, idx: s.def.idx, particle: U.particle, color: U.cap, accent: U.pcolor, img: thumb(s.def.id) };
      });
      while (band.length < n) band.push({ name: 'Switch', kind: 'plain', idx: band.length, particle: 'bubble', color: '#f3d6e4', accent: '#ff8fb8', img: null });
      return band;
    },
    onReward: ({ stars, hearts }) => { S.tokens += stars; hearts.forEach((id) => heart(id, 1)); save(); hud(true); },
  });
};
$('#mute').onclick = (e) => { sfx.setMuted(!sfx.isMuted()); e.currentTarget.textContent = sfx.isMuted() ? '🔇' : '🔊'; };

const banner = $('#banner');
function showBanner(def, dup) {
  if (!cap) return;
  const R = RARITY[def.rarity];
  banner.innerHTML = `<div class="chip" style="background:${R.color}">${R.label}</div>
    <h2>${def.name}</h2><div class="uni">${UNIVERSES[def.uni].name}</div>
    <div class="state">${dup ? `Déjà dans ta collection · +${DUP_BONUS[def.rarity]} ✦` : 'Nouveau !'}</div>
    <button>${dup ? 'OK' : 'Ranger'}</button>`;
  banner.querySelector('button').onclick = () => cap?.state === 'reveal' && store();
  banner.classList.add('on');
}
const hideBanner = () => banner.classList.remove('on');
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

// thumbnails from a tiny second renderer, cached as data URLs
let thumbR, tScene, tCam;
const thumbs = {};
// fill <img data-id> a few per frame: rendering 43 thumbnails at once froze the page for seconds
function fillThumbs(el) {
  const imgs = [...el.querySelectorAll('img[data-id]')];
  const step = () => {
    const t0 = performance.now();
    while (imgs.length && (performance.now() - t0 < 12 || thumbs[imgs[0].dataset.id])) { const im = imgs.shift(); im.src = thumb(im.dataset.id); }
    if (imgs.length) requestAnimationFrame(step);
  };
  step();
}
function thumb(id) {
  if (thumbs[id]) return thumbs[id];
  if (!thumbR) {
    thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbR.setSize(128, 128); thumbR.toneMapping = THREE.NeutralToneMapping;
    tScene = new THREE.Scene();
    tScene.environment = new THREE.PMREMGenerator(thumbR).fromScene(new RoomEnvironment(), 0.04).texture;
    tScene.environmentIntensity = 0.6;
    tScene.add(new THREE.HemisphereLight('#fff6fb', '#e8c9d8', 1.2));
    const d = new THREE.DirectionalLight('#fff3e8', 2); d.position.set(2, 4, 3); tScene.add(d);
    tCam = new THREE.PerspectiveCamera(30, 1, 0.1, 20); tCam.position.set(0, 1.25, 2.4); tCam.lookAt(0, 0.45, 0);
  }
  const k = buildKey(BY_ID[id]);
  tScene.add(k.group); thumbR.render(tScene, tCam);
  thumbs[id] = thumbR.domElement.toDataURL();
  disposeKey(k);
  return thumbs[id];
}

// edit mode: pick a slot, then a figure from the tray (swap if it's already placed)
let editing = false, selected = null;
const tray = $('#tray');
function toggleEdit() {
  if (cap) return;
  editing = !editing; selected = null; ring.removeFromParent(); ring.visible = false;
  releaseAll();
  editBtn.classList.toggle('on', editing);
  tray.classList.toggle('on', editing);
  if (editing) renderTray();
  hud();
}
editBtn.onclick = toggleEdit;
function select(i) {
  selected = i; slots[i].holder.add(ring); ring.position.y = 0.02; ring.visible = true;
  slots[i].v -= 0.8; sfx.tick(); renderTray();
}
const ORDER = Object.keys(UNIVERSES);
function renderTray() {
  const owned = [...S.owned].sort((a, b) => ORDER.indexOf(BY_ID[a].uni) - ORDER.indexOf(BY_ID[b].uni) || BY_ID[a].idx - BY_ID[b].idx);
  tray.innerHTML = `<p>${selected === null ? 'Choisis une place sur le clavier…' : `Place <b>${LABEL[slots[selected].code]}</b> : choisis une figurine`}</p>
    <div class="row"><button class="item empty" data-id="">Vider</button>${owned.map((id) => {
      const at = S.slots.indexOf(id);
      return `<button class="item${at === selected ? ' sel' : ''}" data-id="${id}"><img data-id="${id}" alt=""><span>${BY_ID[id].name}</span>${at >= 0 ? `<i>${LABEL[slots[at].code]}</i>` : ''}</button>`;
    }).join('')}</div>`;
  tray.querySelectorAll('.item').forEach((b) => (b.onclick = () => assign(b.dataset.id || null)));
  fillThumbs(tray);
}
function assign(id) {
  if (selected === null) return toast('Choisis d’abord une place sur le clavier');
  const from = id ? S.slots.indexOf(id) : -1, cur = S.slots[selected];
  if (from === selected) return;
  if (from >= 0) { setSlotKey(from, cur); slots[from].v -= 2; }
  setSlotKey(selected, id);
  slots[selected].v -= 3; slots[selected].sv -= 4; sfx.place();
  renderTray();
}

// album
const album = $('#album');
albumBtn.onclick = () => {
  album.innerHTML = `<div class="sheet"><header><h2>Album</h2><span>${S.owned.length}/${CHARS.length}</span>
    <select class="jump"><option value="">Aller au set…</option>${ORDER.map((u) => `<option value="${u}">${UNIVERSES[u].name}</option>`).join('')}</select><button class="x">✕</button></header>
    ${ORDER.map((u) => {
      const list = CHARS.filter((c) => c.uni === u), got = list.filter((c) => S.owned.includes(c.id)).length;
      if (u === 'secret' && !got) return `<section id="sec-${u}"><h3>??? <small>0/1</small></h3><div class="grid"><div class="cell mystery">?</div></div></section>`;
      return `<section id="sec-${u}"><h3 style="--u:${UNIVERSES[u].cap}">${UNIVERSES[u].name} <small>${got}/${list.length}</small></h3><div class="grid">${list.map((c) => {
        const own = S.owned.includes(c.id);
        const k = S.know[c.id], likes = own && k ? `<b class="likes">${'❤'.repeat(k.hearts)} ${[...k.foods, ...k.games].map((x) => emojiHTML(BY[x].e, 14)).join('')}</b>` : '';
        return `<div class="cell${own ? '' : ' locked'}"><img data-id="${c.id}" alt=""><span>${own ? c.name : '???'}</span>${likes}<i style="background:${RARITY[c.rarity].color}" title="${RARITY[c.rarity].label}"></i></div>`;
      }).join('')}</div></section>`;
    }).join('')}
    <footer>${S.presses} clics · ${S.opened} capsules ouvertes</footer></div>`;
  album.classList.add('on');
  fillThumbs(album);
  album.querySelector('.x').onclick = closeAlbum;
  const jump = album.querySelector('.jump'); // 50 sets: jump instead of scrolling forever
  jump.onchange = () => jump.value && album.querySelector(`#sec-${jump.value}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
};
const closeAlbum = () => album.classList.remove('on');
album.addEventListener('pointerdown', (e) => e.target === album && closeAlbum());

// ---------- layout ----------
function resize() {
  if (!cur) return;
  const w = innerWidth, h = innerHeight, a = w / h, { W, D, cz } = cur;
  renderer.setSize(w, h);
  camera.aspect = a; camera.updateProjectionMatrix();
  const landscape = a > 1.15;
  // capsule sits beside the plate on wide screens, below it on tall ones; bigger plates pull the camera back
  let k;
  if (landscape) { k = Math.max(1, (W + 2.6) / 7.6, D / 4.4); capPos.set(W / 2 + 1.2, 0, cz + 0.5); camLook.set(0.75 * k, 0.3, cz + 0.35); }
  else { k = Math.max(1, 0.9 / a) * Math.max(1, W / 5.2, D / 4.6); capPos.set(0, 0, cz + D / 2 + 1.1); camLook.set(0, 0.3, cz + 0.8); }
  camBase.set(0, 7.6 * k, 7.0 * k).add(camLook);
  scene.fog.near = 14 * k; scene.fog.far = 30 * k;
}
addEventListener('resize', resize);

// success / refusal animations on top of the idle pose
const CHAR_Y = CAP_H - 0.01;
function animate(s, dt) {
  const a = s.anim, ch = s.key.char; a.t += dt;
  const u = a.t / a.dur;
  if (u >= 1) {
    s.anim = null; ch.position.set(0, CHAR_Y, 0); ch.rotation.z = 0;
    if (a.sp) { a.sp.removeFromParent(); a.sp.material.map.dispose(); a.sp.material.dispose(); }
    return;
  }
  const top = keyTop(s.i);
  if (a.type === 'shake') ch.rotation.y += Math.sin(a.t * 40) * 0.5 * (1 - u);
  if (a.type === 'eat') {
    ch.scale.y *= 1 - 0.18 * Math.abs(Math.sin(a.t * 11));
    if (a.sp) a.sp.scale.setScalar(0.38 * (1 - u * 0.9));
    if (Math.floor((a.t * 11) / Math.PI) > (a.bites || 0)) { a.bites = (a.bites || 0) + 1; sfx.nom(); burst('crumb', top, 3, '#f4d6a8', 0.8); }
  }
  if (a.type === 'swing') ch.rotation.z = Math.sin(a.t * 7) * 0.45 * (1 - u);
  if (a.type === 'bounce') { ch.position.y = CHAR_Y + Math.abs(Math.sin(a.t * 9)) * 0.22 * (1 - u); if (a.sp) a.sp.position.y = 0.95 + Math.abs(Math.cos(a.t * 9)) * 0.3; }
  if (a.type === 'spin') ch.rotation.y += u * Math.PI * 6;
  if (a.type === 'wiggle') { ch.rotation.z = Math.sin(a.t * 16) * 0.3; ch.position.x = Math.sin(a.t * 8) * 0.05; }
  if (a.type === 'hide') ch.scale.multiplyScalar(1 - 0.85 * Math.sin(Math.PI * u));
  if (a.type === 'bubbles' && Math.floor(a.t * 4) > (a.puffs || 0)) { a.puffs = (a.puffs || 0) + 1; burst('bubble', top, 3, '#dff3ff', 1); }
  if (a.type === 'heal' || a.type === 'joy') {
    ch.position.y = CHAR_Y + Math.sin(Math.PI * u) * 0.15;
    if (a.type === 'heal' && Math.floor(a.t * 5) > (a.puffs || 0)) { a.puffs = (a.puffs || 0) + 1; burst('sparkle', top, 2, '#fff1a8', 1); }
  }
}

// ---------- loop ----------
const clock = new THREE.Clock(), lookP = new THREE.Vector3(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1);
const camPos = new THREE.Vector3(), camAt = new THREE.Vector3();
let camInit = false;
function frame() {
  const dt = Math.min(clock.getDelta(), 1 / 30), time = clock.elapsedTime;
  if (clawOpen()) { stepClaw(dt, time); requestAnimationFrame(frame); return; } // the machine has its own scene
  if (concertOpen()) { requestAnimationFrame(frame); return; } // board frozen (and not rendered) while the concert runs
  // camera eases to each plate's framing; gentle parallax instead of orbit controls (orbit drag would fight key presses)
  const target = tmpV.set(camBase.x + mouse.x * 0.35, camBase.y + mouse.y * 0.2, camBase.z);
  if (!camInit) { camPos.copy(target); camAt.copy(camLook); camInit = true; }
  camPos.lerp(target, 1 - Math.exp(-5 * dt)); camAt.lerp(camLook, 1 - Math.exp(-5 * dt));
  camera.position.copy(camPos); camera.lookAt(camAt);
  if (slide < 1) {
    slide = Math.min(1, slide + dt * 2.4);
    const e = slide * slide * (3 - 2 * slide);
    cur.group.position.x = slideDir * 16 * (1 - e);
    if (old) old.group.position.x = -slideDir * 16 * e;
    if (slide === 1 && old) { disposeBoard(old); old = null; }
  }
  if (mouse.seen) { ray.setFromCamera(ndc.set(mouse.x, mouse.y), camera); ray.ray.intersectPlane(plane, lookP); }

  if (!cap && pendingCaps.length && !editing) buy({ free: true, def: pendingCaps.shift() });
  updateNeeds(dt, time);
  for (const s of slots) {
    [s.y, s.v] = spring(s.y, s.v, s.down ? -0.13 : 0, 900, 30, dt);
    [s.sq, s.sv] = spring(s.sq, s.sv, 1, 420, 12, dt);
    s.mover.position.y = s.y;
    if (!s.key) continue;
    const breath = 1 + Math.sin(time * 1.8 + s.i) * 0.012, wide = 1 + (1 - s.sq) * 0.6;
    s.key.char.scale.set(wide, s.sq * breath, wide);
    s.blink -= dt;
    const shut = s.blink < 0;
    if (s.blink < -0.12) s.blink = 2 + Math.random() * 5;
    for (const e of s.key.eyes) e.scale.y = shut ? 0.006 : e.userData.sy;
    // figures turn to watch the cursor
    let yaw = 0;
    if (mouse.seen) { const wp = s.holder.getWorldPosition(tmpV); yaw = THREE.MathUtils.clamp(Math.atan2(lookP.x - wp.x, lookP.z - wp.z), -0.7, 0.7); }
    s.yaw = THREE.MathUtils.damp(s.yaw, yaw, 5, dt);
    s.key.char.rotation.y = s.yaw;
    for (const m of s.key.glow) m.emissiveIntensity = 0.25 + Math.sin(time * 2 + s.i) * 0.12;
    // sick figures turn a little green
    const head = s.key.char.children[0].material, sick = needs[s.def.id]?.type === 'malade';
    if (sick) { head.emissive.setHex(0x6fcf5a); head.emissiveIntensity = 0.25 + Math.sin(time * 3) * 0.08; s.tinted = true; }
    else if (s.tinted) { head.emissive.setHex(0x000000); s.tinted = false; }
    if (s.anim) animate(s, dt);
  }
  if (ring.visible) ring.scale.setScalar(1 + Math.sin(time * 5) * 0.03);
  updateCapsule(dt, time);
  updateParticles(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
showBoard(S.board);
hud();
frame();

// test hook for check.mjs
window.__game = { S, get slots() { return slots; }, get pending() { return pendingCaps.length; }, needs, forceNeed: (i, type, extra) => giveNeed(slots[i], type, extra), give, openMenu, setSlotKey, showBoard, unlockBoards: () => { S.opened = Math.max(S.opened, 40); boardUI(); }, unlockAll: () => { S.owned = CHARS.map((c) => c.id); hud(); }, press, release, buy, capsuleClick, get cap() { return cap; }, addTokens: (n) => { S.tokens += n; hud(); },
  screenOf: (i, y, z) => { const v = slots[i].holder.localToWorld(new THREE.Vector3(0, y, z)).project(camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; } };
