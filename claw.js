// Claw machine mini-game: pick a coin (bronze/silver/gold = common/rare/super rare capsules), aim freely,
// close at the right moment. 3 tries per coin; grabs can slip so it's never a sure win.
// The capsule's top colour tells its set; a won capsule drops on the board and opens like a normal one.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as sfx from './audio.js';
import { CHARS, UNIVERSES, RARITY } from './chars.js';

export const CLAW = {
  aimTime: 12, moveSpeed: 1.5, dropSpeed: 1.1, liftSpeed: 1.3, carrySpeed: 1.2,
  grabRadius: 0.3,                  // claw centre ↔ capsule centre distance that still grips
  holdBase: 0.15, holdGain: 0.7,    // chance to keep holding = base + gain × grip (max 85 %)
  stock: 10, secretChance: 0.1,
  tiers: {
    bronze: { e: '🥉', name: 'Bronze', pct: 0.4, min: 10, rarity: 'common' },
    silver: { e: '🥈', name: 'Argent', pct: 0.65, min: 15, rarity: 'rare' },
    gold:   { e: '🥇', name: 'Or',     pct: 1, min: 20, rarity: 'super' },
  },
};
const R = 0.22;                                  // capsule radius
const PIT = { x: 1.12, z: 0.68 };                // half extents of the prize floor
const CHUTE = { x: 0.95, z: 0.5 };               // drop hole (front-right corner)
const inChute = (x, z) => x > 0.7 && z > 0.28;
const TOP = 2.15, HOME = { x: -0.85, z: 0.45 };  // claw hub height at rest / start position
const TOUCH = matchMedia('(pointer: coarse)').matches;

let H, root, scene, camera, st = null, built = false;
const capsules = [], keys = new Set();
const test = (window.__claw = { force: null, get state() { return st && { phase: st.phase, tries: st.tries, won: st.won.length, stock: capsules.map((c) => c.rarity), target: st.target && capsules.indexOf(st.target) }; }, aimAt: (i) => { const c = capsules[i]; if (st && c) { st.x = c.x; st.z = c.z; } }, capsules });
export const clawOpen = () => !!root?.classList.contains('on');

export function openClaw(host) {
  H = host;
  if (!built) build();
  root.classList.add('on'); document.body.classList.add('mini'); // hide the board HUD
  st = { phase: 'coins', tries: 0, won: [], x: HOME.x, z: HOME.z, y: TOP, open: 1, timer: 0 };
  coinsCard();
}
function close() {
  sfx.motor(false);
  root.classList.remove('on'); document.body.classList.remove('mini');
  const won = st?.won || []; st = null;
  H.onClose(won);
}

// ---------- scene ----------
const M = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.4, ...extra });
function box(w, h, d, mat, p, r = 0.06, parent = scene) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.position.set(...p); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
let claw, hub, cable, carriage, bridge, prongs = [], ringMesh, reticle, lights = [];
function build() {
  built = true;
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#f7e6ee');
  scene.environment = H.environment; scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight('#fff6fb', '#e8c9d8', 1.1));
  const sun = new THREE.DirectionalLight('#fff3e8', 2); sun.position.set(1.5, 6, 3); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -2.5, right: 2.5, top: 3, bottom: -2, near: 1, far: 12 });
  sun.shadow.bias = -0.0005; scene.add(sun);
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);

  const body = M('#fde6c8'), pink = M('#ff9fbf'), mint = M('#7fd8c4'), glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: '#f4dde7', roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.1; floor.receiveShadow = true; scene.add(floor);
  box(3.1, 1.05, 2.1, body, [0, -0.55, 0], 0.18);                    // base cabinet
  box(2.5, 0.06, 1.55, M('#f6cfdc', { roughness: 0.8 }), [0, -0.03, 0], 0.02); // prize floor
  for (const x of [-1.42, 1.42]) for (const z of [-0.92, 0.92]) box(0.2, 2.9, 0.2, body, [x, 1.45, z], 0.08); // pillars
  box(2.7, 2.9, 0.06, M('#ffeef4'), [0, 1.45, -0.98], 0.02);          // back wall
  for (const [w, d, p] of [[2.7, 0.02, [0, 1.45, 0.96]], [0.02, 1.8, [-1.38, 1.45, 0]], [0.02, 1.8, [1.38, 1.45, 0]]]) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(w, 2.9, d), glass); g.position.set(...p); g.renderOrder = 5; scene.add(g);
  }
  // header with a kawaii face + marquee lights
  const head = box(3.2, 0.85, 2.15, body, [0, 3.3, 0], 0.22);
  box(2.2, 0.6, 0.06, M('#7a5a6a', { clearcoat: 1 }), [0, 3.3, 1.07], 0.2);
  const ink = new THREE.MeshStandardMaterial({ color: '#2b2233' }), white = M('#ffffff');
  for (const x of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), body); ear.scale.set(1, 1, 0.6); ear.position.set(x * 1.05, 3.85, 0.2); ear.castShadow = true; scene.add(ear);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 12), pink); inner.scale.set(1, 1, 0.4); inner.position.set(x * 1.05, 3.85, 0.33); scene.add(inner);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), white); eye.scale.set(0.8, 1.1, 0.4); eye.position.set(x * 0.42, 3.36, 1.11); scene.add(eye);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 10), pink); cheek.scale.set(1.4, 0.7, 0.3); cheek.position.set(x * 0.72, 3.22, 1.11); scene.add(cheek);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 20, Math.PI), white); smile.rotation.z = Math.PI; smile.position.set(0, 3.24, 1.11); scene.add(smile);
  for (let k = 0; k < 12; k++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshStandardMaterial({ color: '#fff3b0', emissive: new THREE.Color('#ffd84a'), emissiveIntensity: 0.8 }));
    l.position.set(-1.45 + (k * 2.9) / 11, 2.9, 1.09); scene.add(l); lights.push(l);
  }
  // control panel, coin slot, exit door
  const panel = box(3.0, 0.12, 0.62, M('#ffd3e0'), [0, 0.05, 1.32], 0.05); panel.rotation.x = 0.35;
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 12), M('#b8a0ac')); stick.position.set(-0.8, 0.22, 1.35); scene.add(stick);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), mint); knob.position.set(-0.8, 0.38, 1.35); knob.castShadow = true; scene.add(knob);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 24), mint); btn.position.set(0.75, 0.15, 1.32); btn.rotation.x = 0.35; scene.add(btn);
  box(0.12, 0.25, 0.04, M('#5a3e52'), [-1.05, -0.45, 1.06], 0.02);   // coin slot
  box(0.6, 0.45, 0.06, M('#5a3e52'), [CHUTE.x - 0.05, -0.55, 1.06], 0.08); // exit door frame
  box(0.5, 0.3, 0.07, mint, [CHUTE.x - 0.05, -0.6, 1.08], 0.06);
  for (const [w, d, p] of [[0.5, 0.02, [CHUTE.x, 0.25, 0.28]], [0.02, 0.45, [0.72, 0.25, 0.5]]]) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), glass); g.position.set(...p); g.renderOrder = 5; scene.add(g);
  }
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshBasicMaterial({ color: '#3a2a35' })); hole.rotation.x = -Math.PI / 2; hole.position.set(CHUTE.x, 0.005, CHUTE.z); scene.add(hole);

  // gantry + claw
  const metal = M('#ffcf6b', { metalness: 0.7, roughness: 0.25, sheen: 0 });
  for (const z of [-0.78, 0.78]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.6, 8), metal); r.rotation.z = Math.PI / 2; r.position.set(0, 2.72, z); scene.add(r); }
  bridge = box(0.12, 0.08, 1.7, metal, [0, 2.72, 0], 0.03);
  carriage = box(0.22, 0.14, 0.22, pink, [0, 2.62, 0], 0.05);
  cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), M('#5a3e52')); scene.add(cable);
  claw = new THREE.Group(); scene.add(claw);
  hub = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), metal); hub.castShadow = true; claw.add(hub);
  for (let k = 0; k < 3; k++) {
    const pivot = new THREE.Group(); pivot.rotation.y = (k / 3) * Math.PI * 2; claw.add(pivot);
    const hinge = new THREE.Group(); hinge.position.set(0.06, -0.05, 0); pivot.add(hinge);
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.2, 4, 8), metal); up.position.set(0.02, -0.12, 0); up.rotation.z = 0.15; up.castShadow = true; hinge.add(up);
    const hook = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.12, 4, 8), metal); hook.position.set(-0.01, -0.28, 0); hook.rotation.z = -0.7; hook.castShadow = true; hinge.add(hook);
    prongs.push(hinge);
  }
  ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 40), new THREE.MeshBasicMaterial({ color: '#ff6f6f', transparent: true, opacity: 0.85 }));
  ringMesh.rotation.x = Math.PI / 2; ringMesh.visible = false; claw.add(ringMesh);
  reticle = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.16, 32), new THREE.MeshBasicMaterial({ color: '#ff6f9f', transparent: true, opacity: 0.8, depthWrite: false }));
  reticle.rotation.x = -Math.PI / 2; scene.add(reticle);

  // HUD + input layer
  root = document.createElement('div'); root.id = 'claw';
  root.innerHTML = `<div class="ctouch"></div><div class="chud"><b class="ctries"></b><span class="ctimer"></span><span class="ctarget"></span></div>
    <button class="cquit" title="Quitter">✕</button><button class="caction"></button>
    <p class="chint">${TOUCH ? 'Glisse pour viser · le bouton pour descendre puis fermer' : 'Flèches / ZQSD pour viser · Espace pour descendre puis fermer'}</p><div class="ccard"></div>`;
  document.body.appendChild(root);
  root.querySelector('.cquit').onclick = close;
  root.querySelector('.caction').onclick = action;
  const touch = root.querySelector('.ctouch');
  let last = null;
  touch.addEventListener('pointerdown', (e) => { sfx.unlock(); last = [e.clientX, e.clientY]; touch.setPointerCapture(e.pointerId); if (st?.phase === 'drop') action(); });
  touch.addEventListener('pointermove', (e) => {
    if (!last || st?.phase !== 'aim') return;
    const k = 2.4 / Math.min(innerWidth, innerHeight);
    st.x += (e.clientX - last[0]) * k; st.z += (e.clientY - last[1]) * k; last = [e.clientX, e.clientY]; st.dragT = 0.15;
  });
  touch.addEventListener('pointerup', () => (last = null));
  addEventListener('keydown', (e) => {
    if (!clawOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.code === 'Escape') return close();
    if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat) action(); return; }
    keys.add(e.code);
  }, true);
  addEventListener('keyup', (e) => { if (clawOpen()) keys.delete(e.code); }, true);
}

// ---------- capsules ----------
function capsuleMesh(uni, secret) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    secret ? M('#ffd25a', { metalness: 0.8, roughness: 0.25 }) : M(UNIVERSES[uni].cap, { roughness: 0.2, clearcoat: 1 }));
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#f6f1f5', { roughness: 0.55 }));
  const band = new THREE.Mesh(new THREE.TorusGeometry(R, 0.018, 8, 40), M('#ffffff')); band.rotation.x = Math.PI / 2;
  [top, bottom, band].forEach((m) => { m.castShadow = m.receiveShadow = true; g.add(m); });
  g.userData.top = top;
  return g;
}
function stock(tier) {
  capsules.splice(0).forEach((c) => c.g.removeFromParent());
  const rarity = CLAW.tiers[tier].rarity;
  const unis = Object.keys(UNIVERSES).filter((u) => u !== 'secret');
  const missing = (u) => CHARS.some((c) => c.uni === u && c.rarity === rarity && !H.S.owned.includes(c.id));
  const weights = unis.map((u) => (missing(u) ? 4 : 1)), total = weights.reduce((a, b) => a + b, 0);
  const pickUni = () => { let r = Math.random() * total; return unis.find((u, i) => (r -= weights[i]) < 0) || unis[0]; };
  const secretIn = tier === 'gold' && !H.S.owned.includes('nuage') && Math.random() < CLAW.secretChance;
  for (let k = 0; k < CLAW.stock; k++) {
    const secret = secretIn && k === 0, uni = secret ? 'secret' : pickUni();
    let x, z; do { x = (Math.random() * 2 - 1) * (PIT.x - R); z = (Math.random() * 2 - 1) * (PIT.z - R); } while (inChute(x, z));
    const g = capsuleMesh(uni, secret); g.rotation.set(Math.random() - 0.5, Math.random() * 6, Math.random() - 0.5);
    const c = { g, uni, rarity: secret ? 'secret' : rarity, x, z, y: 2.4 + k * 0.25, vy: 0, falling: true };
    scene.add(g); capsules.push(c);
  }
}
// rest height on the floor or on top of capsules already resting below
function restY(c) {
  let y = R;
  for (const o of capsules) {
    if (o === c || o.falling || o.held) continue;
    const d = Math.hypot(o.x - c.x, o.z - c.z);
    if (d < 2 * R * 0.95) y = Math.max(y, o.y + Math.sqrt((2 * R) ** 2 - d * d) * 0.92);
  }
  return y;
}

// ---------- flow ----------
function price(tier) { const t = CLAW.tiers[tier]; return Math.max(t.min, Math.round(H.cost() * t.pct)); }
function coinsCard() {
  st.phase = 'coins'; hud();
  const card = root.querySelector('.ccard');
  card.innerHTML = `<h2>🕹️ Machine à pince</h2><p class="sub">Une pièce = 3 essais. Plus la pièce est chère, plus les capsules sont rares. La couleur du haut indique le set.</p>
    <div class="coins">${Object.entries(CLAW.tiers).map(([k, t]) => `<button data-tier="${k}" ${H.S.tokens < price(k) ? 'disabled' : ''}>
      <span class="e">${t.e}</span><b>${t.name} · ${price(k)} ✦</b><small style="color:${RARITY[t.rarity].color}">${RARITY[t.rarity].label}s</small></button>`).join('')}</div>
    <p class="sub">Tu as ${H.S.tokens} ✦${st.won.length ? ` · ${st.won.length} capsule(s) gagnée(s), elles t’attendent sur le plateau` : ''}</p>
    <div class="row"><button class="cq">Quitter</button></div>`;
  card.querySelectorAll('[data-tier]').forEach((b) => (b.onclick = () => insert(b.dataset.tier)));
  card.querySelector('.cq').onclick = close;
  card.classList.add('on');
}
function insert(tier) {
  const p = price(tier);
  if (H.S.tokens < p) return;
  H.spend(p); sfx.unlock(); sfx.coin();
  st.tier = tier; st.tries = 3;
  root.querySelector('.ccard').classList.remove('on');
  stock(tier);
  startTry();
}
function startTry() {
  Object.assign(st, { phase: 'aim', timer: CLAW.aimTime, open: 1, held: null, target: null });
  hud();
}
function action() {
  if (!st) return;
  if (st.phase === 'aim') { st.phase = 'drop'; sfx.motor(true); hud(); }
  else if (st.phase === 'drop') closeClaw(false);
}
function idealY(c) { return c ? c.y + 0.3 : R + 0.08; } // hub height where the prong tips wrap the capsule's equator
function timingQ() { return Math.max(0, 1 - Math.abs(st.y - idealY(st.target)) / 0.32); }
function closeClaw(bumped) {
  st.phase = 'close'; st.t = 0; sfx.motor(false); sfx.clack();
  const c = st.target, d = c ? Math.hypot(c.x - st.x, c.z - st.z) : 9;
  const grip = c ? Math.max(0, 1 - d / CLAW.grabRadius) * (bumped ? 0.35 : timingQ()) : 0;
  st.grip = test.force === 'perfect' ? 1 : test.force === 'miss' ? 0 : grip;
  st.holdRoll = () => test.force === 'perfect' || (test.force !== 'miss' && Math.random() < CLAW.holdBase + CLAW.holdGain * st.grip);
}
function endTry() {
  st.tries--;
  if (st.tries > 0) return startTry();
  st.phase = 'over'; hud();
  const card = root.querySelector('.ccard');
  card.innerHTML = `<h2>${st.won.length ? '🎉 Bravo !' : 'Pas de chance…'}</h2>
    <p class="sub">${st.won.length ? `${st.won.length} capsule(s) gagnée(s) : elles tomberont sur ton plateau.` : 'Les 3 essais sont passés. Encore une pièce ?'}</p>
    <div class="row"><button class="again">Remettre une pièce</button><button class="cq">Quitter</button></div>`;
  card.querySelector('.again').onclick = coinsCard;
  card.querySelector('.cq').onclick = close;
  card.classList.add('on');
}
function hud() {
  const T = st && CLAW.tiers[st.tier];
  root.querySelector('.ctries').textContent = st?.tries ? `${T.e} ${'●'.repeat(st.tries)}${'○'.repeat(3 - st.tries)}` : '';
  const btn = root.querySelector('.caction');
  btn.textContent = st?.phase === 'aim' ? 'Descendre ⬇' : st?.phase === 'drop' ? 'Fermer !' : '';
  btn.style.display = st && ['aim', 'drop'].includes(st.phase) ? '' : 'none';
}

// ---------- per-frame ----------
export function stepClaw(dt, time) {
  const r = H.renderer;
  camera.aspect = innerWidth / innerHeight;
  const far = Math.max(1, 0.72 / camera.aspect); // portrait: just enough to fit the machine's width
  camera.position.set(Math.sin(time * 0.3) * 0.08, 2.6 + far * 0.4, 7 * far); camera.lookAt(0, 1.55, 0); camera.updateProjectionMatrix(); // whole machine, header face included
  lights.forEach((l, k) => (l.material.emissiveIntensity = (st?.phase === 'win' ? Math.sin(time * 20 + k) : Math.sin(time * 3 + k * 0.8)) * 0.5 + 0.6));

  // capsules fall / settle
  for (const c of capsules) {
    if (c.held) { c.x = st.x; c.z = st.z; c.y = st.y - 0.3; }
    else if (c.falling) {
      c.vy -= 9.8 * dt; c.y += c.vy * dt;
      const ry = c.won ? -0.8 : restY(c);
      if (c.y <= ry) {
        c.y = ry;
        if (Math.abs(c.vy) > 1.6 && !c.won) { c.vy = -c.vy * 0.3; sfx.thud(Math.min(0.5, Math.abs(c.vy) / 10)); } else { c.vy = 0; c.falling = false; }
      }
    }
    c.g.position.set(c.x, c.y, c.z);
    const top = c.g.userData.top.material, aimed = c === st?.target && ['aim', 'drop'].includes(st?.phase);
    top.emissive?.set(aimed ? (c.rarity === 'secret' ? '#ffd25a' : UNIVERSES[c.uni].cap) : '#000000');
    top.emissiveIntensity = aimed ? 0.35 + Math.sin(time * 8) * 0.15 : 0;
  }

  if (st) {
    const s = st;
    if (s.phase === 'aim') {
      let mx = 0, mz = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) mx--; if (keys.has('ArrowRight') || keys.has('KeyD')) mx++;
      if (keys.has('ArrowUp') || keys.has('KeyW')) mz--; if (keys.has('ArrowDown') || keys.has('KeyS')) mz++;
      s.x += mx * CLAW.moveSpeed * dt; s.z += mz * CLAW.moveSpeed * dt;
      s.dragT = Math.max(0, (s.dragT || 0) - dt);
      sfx.motor(!!(mx || mz || s.dragT));
      s.x = THREE.MathUtils.clamp(s.x, -PIT.x + 0.1, PIT.x - 0.1); s.z = THREE.MathUtils.clamp(s.z, -PIT.z + 0.1, PIT.z - 0.1);
      // the capsule under the claw (closest, then highest) is the target
      let best = null;
      for (const c of capsules) {
        if (c.falling || c.won) continue;
        const d = Math.hypot(c.x - s.x, c.z - s.z);
        if (d < 0.32 && (!best || c.y - d > best.y - Math.hypot(best.x - s.x, best.z - s.z))) best = c;
      }
      s.target = best;
      if ((s.timer -= dt) <= 0) action();
    }
    if (s.phase === 'drop') {
      s.y -= CLAW.dropSpeed * dt;
      const floorY = s.target ? s.target.y + 0.14 : R - 0.05; // hits the capsule top / the floor
      if (s.y <= floorY) { s.y = floorY; closeClaw(true); }
    }
    if (s.phase === 'close') {
      s.open = Math.max(0, s.open - dt * 3.5);
      if (s.open === 0) {
        s.phase = 'lift';
        if (s.target && s.grip > 0.05 && s.holdRoll()) { s.target.held = true; s.held = s.target; }
        else if (s.target) s.target.vy = 1.2, s.target.falling = true; // jiggles back down
        sfx.motor(true);
      }
    }
    if (s.phase === 'lift') {
      s.y = Math.min(TOP, s.y + CLAW.liftSpeed * dt);
      if (s.y === TOP) { s.phase = s.held ? 'carry' : 'home'; s.checked = false; }
    }
    if (s.phase === 'carry' || s.phase === 'home') {
      const to = s.phase === 'carry' ? CHUTE : HOME, dx = to.x - s.x, dz = to.z - s.z, d = Math.hypot(dx, dz), step = CLAW.carrySpeed * dt;
      if (s.phase === 'carry' && !s.checked && d < s.startD / 2) { // second chance to slip, halfway to the chute
        s.checked = true;
        if (!s.holdRoll()) { const c = s.held; c.held = false; c.falling = true; c.vy = 0; c.x = THREE.MathUtils.clamp(c.x, -PIT.x + R, PIT.x - R); s.held = null; s.phase = 'home'; sfx.nope(); }
      }
      s.startD ??= d;
      if (d <= step) {
        s.x = to.x; s.z = to.z;
        if (s.phase === 'carry') { // release over the chute
          const c = s.held; c.held = false; c.won = true; c.falling = true; c.vy = 0; s.held = null; s.open = 1;
          s.won.push({ uni: c.uni, rarity: c.rarity }); s.phase = 'win'; s.t = 0; sfx.motor(false); sfx.yay();
        } else { s.startD = null; s.open = 1; sfx.motor(false); endTry(); }
      } else { s.x += (dx / d) * step; s.z += (dz / d) * step; }
    }
    if (s.phase === 'win' && (s.t += dt) > 1.4) {
      const c = capsules.find((x) => x.won); if (c) { c.g.removeFromParent(); capsules.splice(capsules.indexOf(c), 1); }
      s.phase = 'home'; s.startD = null;
    }
    // drop timing ring: red → green as the prongs reach the capsule
    ringMesh.visible = s.phase === 'drop';
    if (ringMesh.visible) ringMesh.material.color.setHSL(0.33 * timingQ(), 0.8, 0.6);
    const tm = root.querySelector('.ctimer'), tg = root.querySelector('.ctarget');
    tm.textContent = s.phase === 'aim' ? `${Math.ceil(s.timer)} s` : '';
    const t = s.target, U = t && (t.rarity === 'secret' ? { name: '???' } : UNIVERSES[t.uni]);
    tg.innerHTML = t && ['aim', 'drop'].includes(s.phase) ? `🎯 <i style="background:${t.rarity === 'secret' ? '#ffd25a' : UNIVERSES[t.uni].cap}"></i>${U.name} · ${RARITY[t.rarity].label}` : '';
  }

  // claw rig follows state
  const x = st?.x ?? HOME.x, z = st?.z ?? HOME.z, y = st?.y ?? TOP, open = st?.open ?? 1;
  bridge.position.x = x; carriage.position.set(x, 2.62, z);
  claw.position.set(x, y, z);
  cable.position.set(x, (2.56 + y) / 2, z); cable.scale.y = 2.56 - y;
  prongs.forEach((p) => (p.rotation.z = 0.08 + open * 0.55));
  const under = st?.target && ['aim', 'drop'].includes(st.phase) ? st.target.y + R + 0.01 : 0.01;
  reticle.position.set(x, under, z); reticle.visible = !!st && ['aim', 'drop'].includes(st.phase);

  r.render(scene, camera);
}
