// node check.mjs — headless smoke test: load, press keys, open a capsule, screenshot each stage, fail on console errors.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(`${process.env.HOME}/.dev-browser/package.json`);
const { chromium } = require('playwright-core');
const CHROME = process.env.CHROME_PATH ||
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const dir = path.dirname(new URL(import.meta.url).pathname);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const f = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(f, (err, buf) => { res.writeHead(err ? 404 : 200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(buf); });
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

{ // ids unique + every set has 3 common · 2 rare · 1 super (parsed from the table: chars.js needs three.js)
  const src = fs.readFileSync(path.join(dir, 'chars.js'), 'utf8');
  const rows = [...src.matchAll(/^  \['([a-z0-9]+)',\s*'[^']*',\s*'([a-z]+)',\s*'([a-z]+)'/gm)].map((m) => m.slice(1));
  const ids = rows.map((r) => r[0]), dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) { console.error('duplicate ids', dup); process.exit(1); }
  const per = {}; rows.forEach(([, u, r]) => ((per[u] ||= {})[r] = (per[u][r] || 0) + 1));
  for (const [u, c] of Object.entries(per)) if (u !== 'secret' && (c.common !== 3 || c.rare !== 2 || c.super !== 1)) { console.error('bad rarity split', u, c); process.exit(1); }
  console.log(`${ids.length} figures, ${Object.keys(per).length} sets`);
}
{ // concert: deterministic songs, sane charts, judging thresholds, analysed YouTube charts
  const Rh = await import('./rhythm.js');
  const assert = (await import('node:assert/strict')).default;
  for (const style of Object.keys(Rh.STYLES)) {
    assert.deepEqual(Rh.generateSong(42, style, 'hard').notes, Rh.generateSong(42, style, 'hard').notes);
    const [e, n, h] = ['easy', 'normal', 'hard'].map((d) => Rh.generateSong(42, style, d));
    assert.ok(e.notes.length < n.notes.length && n.notes.length < h.notes.length, `${style} density`);
    assert.ok(h.duration > 55 && h.duration < 82, `${style} duration ${h.duration}`);
    for (const s of [e, n, h]) s.notes.forEach((x, i) => { assert.ok(x.lane >= 0 && x.lane < s.lanes); if (i) assert.ok(x.t >= s.notes[i - 1].t); });
  }
  assert.equal(Rh.judge(0.03).label, 'Parfait'); assert.equal(Rh.judge(-0.08).label, 'Bien'); assert.equal(Rh.judge(0.13).label, 'OK'); assert.equal(Rh.judge(0.2), null);
  assert.equal(Rh.grade({ perfect: 10 }).letter, 'S');
  for (const f of fs.readdirSync(path.join(dir, 'concert/charts'))) {
    const song = JSON.parse(fs.readFileSync(path.join(dir, 'concert/charts', f)));
    const lens = ['easy', 'normal', 'hard'].map((d) => song.charts[d].length);
    assert.ok(lens[0] < lens[1] && lens[1] <= lens[2], `${f} density ${lens}`);
    for (const d of ['easy', 'normal', 'hard']) song.charts[d].forEach(([t, lane], i, a) => { assert.ok(t >= 0 && t < song.duration && lane < song.lanes[d]); if (i) assert.ok(t > a[i - 1][0]); });
  }
}
{ // needs rules: stable tastes, refusal then success, hint level, each need type rollable
  const N = await import('./needs.js');
  const assert = (await import('node:assert/strict')).default;
  assert.deepEqual(N.prefs('guimauve'), N.prefs('guimauve'));
  const p = N.prefs('guimauve'), wrong = N.FOODS.find((f) => !p.foods.includes(f.id)).id;
  const n = N.rollNeed({ id: 'guimauve' }, Math.random, 'faim');
  assert.ok(p.foods.includes(n.want));
  assert.equal(N.tryItem(n, wrong), false); assert.equal(n.tries, 1);
  assert.equal(N.tryItem(n, n.want), true); assert.equal(N.reward(n), 22);
  const sick = N.rollNeed({ id: 'x' }, Math.random, 'malade');
  assert.equal(N.tryItem(sick, N.AILMENTS[sick.ail].cures[0]), true);
  for (const t of Object.keys(N.NEEDS)) assert.equal(N.rollNeed({ id: 'a', owned: ['a', 'b'], boards: ['heart'] }, Math.random, t).type, t);
  assert.ok(N.neighbours([{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }], ['a', 'b', 'c'], 'a', 'b'));
  assert.ok(!N.neighbours([{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }], ['a', 'b', 'c'], 'a', 'c'));
}
{
  const { BOARDS, outline, cells, fits } = await import('./boards.js');
  for (const b of BOARDS) if (!fits(outline(b), cells(b))) { console.error(`board ${b.id}: keys outside outline`); process.exit(1); }
}
const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
const run = async (name, viewport) => {
  const page = await browser.newPage({ viewport });
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(url);
  await page.waitForFunction(() => window.__game, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  fs.mkdirSync(path.join(dir, 'shots'), { recursive: true });
  const shot = (n) => page.screenshot({ path: path.join(dir, 'shots', `${name}-${n}.png`) });
  await shot('idle');

  for (const k of ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyQ']) { await page.keyboard.down(k); await page.waitForTimeout(30); await page.keyboard.up(k); }
  await page.keyboard.down('KeyS'); await page.waitForTimeout(60); await shot('pressed'); await page.keyboard.up('KeyS');
  const t = await page.evaluate(() => window.__game.S.tokens);
  if (t < 6) errors.push(`${name}: tokens ${t} < 6 after presses`);

  // picking: the front-bottom edge of a back-row cap must hit that key, not the row in front
  await page.evaluate(() => window.__game.setSlotKey(9, 'guimauve'));
  for (const i of [5, 9]) {
    const [x, y] = await page.evaluate((i) => window.__game.screenOf(i, 0.41, 0.3), i);
    await page.mouse.move(x, y); await page.mouse.down();
    const got = await page.evaluate(() => window.__game.slots.findIndex((s) => s.down));
    await page.mouse.up();
    if (got !== i) errors.push(`${name}: click on cap ${i} edge pressed ${got}`);
  }
  await page.evaluate(() => window.__game.addTokens(500));
  await page.click('#buy');
  await page.waitForFunction(() => window.__game.cap?.state === 'idle', null, { timeout: 30000 })
    .catch(async (e) => { throw new Error(`${name}: capsule not idle: ${await page.evaluate(() => JSON.stringify({ s: window.__game.cap?.state, y: window.__game.cap?.y, vy: window.__game.cap?.vy, tok: window.__game.S.tokens, dis: document.querySelector('#buy').disabled }))}`); });
  await shot('capsule');
  for (let i = 0; i < 3; i++) { await page.evaluate(() => window.__game.capsuleClick()); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.__game.cap?.state === 'reveal', null, { timeout: 20000 });
  await page.waitForTimeout(300);
  await shot('reveal');
  await page.evaluate(() => window.__game.capsuleClick());
  await page.waitForFunction(() => !window.__game.cap, null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await shot('placed');

  await page.click('#albumBtn'); await page.waitForFunction(() => ![...document.querySelectorAll('#album img')].some((i) => !i.src), null, { timeout: 900000 }); // 301 thumbnails on a software renderer await shot('album');
  await page.keyboard.press('Escape');
  await page.click('#edit'); await page.keyboard.press('KeyQ'); await page.waitForTimeout(300); await shot('edit');
  if (name === 'desk') {
    // every figure, to eyeball the new sets' parts (hair, fangs, capes, glasses…)
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.__game.unlockAll());
    await page.setViewportSize({ width: 1280, height: 2600 });
    await page.click('#albumBtn'); await page.waitForFunction(() => ![...document.querySelectorAll('#album img')].some((i) => !i.src), null, { timeout: 900000 }); // 301 thumbnails on a software renderer await shot('album-all');
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1280, height: 800 });
    // needs: hugs (exact count), wrong then right dish, massage (hold), bubbles + menu screenshots
    await page.evaluate(() => window.__game.showBoard('classic'));
    const tok = () => page.evaluate(() => window.__game.S.tokens);
    const gone = (i) => page.waitForFunction((i) => !window.__game.needs[window.__game.slots[i].def.id], i, { timeout: 90000 });
    let t0 = await tok();
    await page.evaluate(() => window.__game.forceNeed(4, 'calin', { n: 3, left: 3 }));
    for (let k = 0; k < 3; k++) await page.evaluate(() => { window.__game.press(4); window.__game.release(4); });
    await gone(4);
    if ((await tok()) - t0 < 15) errors.push('needs: hugs gave no bonus');
    await page.evaluate(() => window.__game.forceNeed(5, 'faim', { want: 'pizza' }));
    await page.evaluate(() => window.__game.give(5, 'glace'));
    if (!(await page.evaluate(() => window.__game.needs[window.__game.slots[5].def.id]?.tries === 1))) errors.push('needs: wrong dish accepted');
    t0 = await tok();
    await page.evaluate(() => window.__game.give(5, 'pizza'));
    if ((await tok()) - t0 !== 22) errors.push(`needs: dish reward ${(await tok()) - t0} != 22`);
    await page.evaluate(() => { window.__game.forceNeed(6, 'massage'); window.__game.press(6); });
    await gone(6); await page.evaluate(() => window.__game.release(6));
    await page.evaluate(() => {
      const g = window.__game;
      g.forceNeed(4, 'faim', { tries: 2 }); g.forceNeed(5, 'ami', { friend: 'mousse' }); g.forceNeed(6, 'malade', { ail: 'rhume' }); g.forceNeed(7, 'calin');
      g.forceNeed(9, 'dodo');
    });
    await page.waitForTimeout(1500); await shot('needs-bubbles');
    await page.evaluate(() => window.__game.openMenu(6)); await page.waitForTimeout(400); await shot('needs-menu');
    await page.keyboard.press('Escape');
    // concert: generated song and analysed YouTube chart, autoplayed on the fake clock
    await page.evaluate(() => Object.assign(window.__concert, { fake: true, autoplay: true, speed: 6 }));
    let before = await tok();
    await page.click('#concertBtn'); await page.waitForSelector('.ccard.on .go'); await shot('concert-menu');
    await page.click('.ccard .go');
    await page.waitForFunction(() => window.__concert.state?.phase === 'play' && window.__concert.state.score > 0, null, { timeout: 60000 });
    await shot('concert-play');
    await page.waitForFunction(() => window.__concert.state?.phase === 'results', null, { timeout: 240000 });
    await shot('concert-results');
    const res = await page.evaluate(() => window.__concert.state.result);
    if (res.letter !== 'S') errors.push(`concert: autoplay graded ${res.letter}`);
    if ((await tok()) - before < res.stars) errors.push('concert: stars not credited');
    await page.click('.ccard .menu'); await page.waitForSelector('[data-tab="yt"]'); await page.click('[data-tab="yt"]');
    await page.waitForSelector('.ccard [data-yt]'); await shot('concert-yt-menu');
    await page.evaluate(() => (window.__concert.speed = 12));
    await page.click('.ccard .go');
    await page.waitForFunction(() => window.__concert.state?.phase === 'play' && window.__concert.state.score > 0, null, { timeout: 60000 });
    await shot('concert-yt-play');
    await page.waitForFunction(() => window.__concert.state?.phase === 'results', null, { timeout: 300000 });
    await page.click('.ccard .quit');
    await page.evaluate(() => Object.assign(window.__concert, { fake: false, autoplay: false, speed: 1 }));
    // claw machine: coin tiers fill the right rarities, a forced perfect grab wins THAT capsule's set, a forced miss doesn't
    await page.evaluate(() => window.__game.addTokens(400));
    await page.click('#clawBtn'); await page.waitForSelector('#claw .ccard.on [data-tier]'); await shot('claw-coins');
    before = await tok();
    await page.click('#claw [data-tier="bronze"]');
    if ((await tok()) >= before) errors.push('claw: coin not charged');
    let cs = await page.evaluate(() => window.__claw.state);
    if (cs.tries !== 3 || cs.stock.some((r) => r !== 'common')) errors.push(`claw: bronze stock ${cs.stock} tries ${cs.tries}`);
    await page.waitForFunction(() => window.__claw.capsules.every((c) => !c.falling), null, { timeout: 60000 }); // let the pile settle
    const pick = await page.evaluate(() => { const C = window.__claw.capsules, c = C.reduce((a, b) => (b.y > a.y ? b : a)); window.__claw.aimAt(C.indexOf(c)); window.__claw.force = 'perfect'; return { uni: c.uni, i: C.indexOf(c) }; });
    await page.waitForFunction((i) => window.__claw.state.target === i, pick.i, { timeout: 20000 });
    await shot('claw-aim');
    await page.click('#claw .caction');
    await page.waitForFunction(() => window.__claw.state.won === 1, null, { timeout: 120000 });
    await shot('claw-win');
    await page.evaluate(() => (window.__claw.force = 'miss'));
    await page.waitForFunction(() => window.__claw.state.phase === 'aim' && window.__claw.state.tries === 2, null, { timeout: 120000 });
    await page.evaluate(() => window.__claw.aimAt(0));
    await page.click('#claw .caction');
    await page.waitForFunction(() => window.__claw.state.tries === 1 && window.__claw.state.phase === 'aim', null, { timeout: 120000 });
    if ((await page.evaluate(() => window.__claw.state.won)) !== 1) errors.push('claw: forced miss still won');
    await page.click('#claw .cquit');
    await page.waitForFunction(() => window.__game.cap?.state === 'idle', null, { timeout: 60000 });
    const prize = await page.evaluate(() => window.__game.cap.def);
    if (prize.uni !== pick.uni || prize.rarity !== 'common') errors.push(`claw: prize ${prize.uni}/${prize.rarity}, aimed ${pick.uni}/common`);
    for (let i = 0; i < 3; i++) await page.evaluate(() => window.__game.capsuleClick());
    await page.waitForFunction(() => window.__game.cap?.state === 'reveal', null, { timeout: 30000 });
    await page.evaluate(() => window.__game.capsuleClick());
    await page.waitForFunction(() => !window.__game.cap, null, { timeout: 30000 });
    await page.click('#clawBtn'); await page.waitForSelector('#claw [data-tier="gold"]');
    await page.click('#claw [data-tier="gold"]');
    cs = await page.evaluate(() => window.__claw.state);
    if (cs.stock.some((r) => r !== 'super' && r !== 'secret')) errors.push(`claw: gold stock ${cs.stock}`);
    await page.waitForTimeout(1200); await shot('claw-gold');
    await page.evaluate(() => (window.__claw.force = null));
    await page.click('#claw .cquit');
    // every plate: switch, screenshot, keys must map to distinct codes
    await page.evaluate(() => window.__game.unlockBoards());
    for (const id of ['classic', 'heart', 'cloud', 'flower', 'tree', 'cat']) {
      await page.evaluate((id) => window.__game.showBoard(id), id);
      await page.waitForTimeout(900); await shot(`board-${id}`);
      const codes = await page.evaluate(() => window.__game.slots.map((s) => s.code));
      if (new Set(codes).size !== codes.length || codes.includes(undefined)) errors.push(`board ${id}: bad key codes ${codes}`);
    }
    await page.evaluate(() => window.__game.showBoard('classic'));
    const sets = [['sora', 'hana', 'gobi', 'yuna', 'dokki', 'aurore', 'nocturne', 'chauvette', 'spectre', 'citrouille', 'comtesse', 'minuit'],
      ['stella', 'coco', 'lila', 'licorne', 'caramel', 'diva', 'sora', 'aurore', 'nocturne', 'minuit', 'comtesse', 'yuna']];
    for (const [k, ids] of sets.entries()) {
      await page.evaluate((ids) => ids.forEach((id, i) => window.__game.setSlotKey(i, id)), ids);
      await page.waitForTimeout(500); await shot(`newsets-${k}`);
    }
  }
  await page.close();
};
await run('desk', { width: 1280, height: 800 });
await run('phone', { width: 390, height: 780 });
// touch: emulated phone (portrait + landscape) — taps on keys, bubbles, the concert lanes
for (const [name, viewport] of [['touch-portrait', { width: 390, height: 844 }], ['touch-landscape', { width: 844, height: 390 }]]) {
  const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  await page.goto(url);
  await page.waitForFunction(() => window.__game, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  const shot = (n) => page.screenshot({ path: path.join(dir, 'shots', `${name}-${n}.png`) });
  if (!(await page.evaluate(() => matchMedia('(pointer: coarse)').matches))) errors.push(`${name}: not seen as a touch device`);
  const tok = () => page.evaluate(() => window.__game.S.tokens);
  const t0 = await tok();
  const [kx, ky] = await page.evaluate(() => window.__game.screenOf(5, 0.41, 0.3));
  await page.touchscreen.tap(kx, ky); await page.waitForTimeout(200);
  if ((await tok()) <= t0) errors.push(`${name}: tapping a key gave no star`);
  await page.evaluate(() => window.__game.forceNeed(5, 'faim'));
  await page.waitForTimeout(800);
  const [bx, by] = await page.evaluate(() => window.__game.screenOf(5, 1.55, 0));
  await page.touchscreen.tap(bx, by); await page.waitForTimeout(300);
  if (!(await page.evaluate(() => document.querySelector('#care').classList.contains('on')))) errors.push(`${name}: tapping a bubble did not open the menu`);
  await shot('board');
  await page.touchscreen.tap(10, viewport.height / 2); // close the card
  await page.tap('#concertBtn'); await page.waitForSelector('.ccard.on .go');
  await page.evaluate(() => Object.assign(window.__concert, { fake: true, autoplay: false, speed: 1 }));
  await page.tap('.ccard .go');
  await page.waitForFunction(() => window.__concert.state?.phase === 'play', null, { timeout: 20000 });
  await page.touchscreen.tap(viewport.width / 2, viewport.height * 0.8); await page.waitForTimeout(200);
  if (!(await page.evaluate(() => window.__concert.state.taps > 0))) errors.push(`${name}: tapping a lane did nothing`);
  if (!(await page.isVisible('#cquit'))) errors.push(`${name}: no on-screen quit button during the concert`);
  await page.evaluate(() => Object.assign(window.__concert, { autoplay: true, speed: 4 }));
  await page.waitForFunction(() => window.__concert.state?.score > 2000, null, { timeout: 60000 });
  await shot('concert');
  await page.tap('#cquit'); await page.waitForSelector('.ccard.on .go');
  await ctx.close();
}
// preview page: all sets, then one set
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => errors.push(`preview: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`preview: ${m.text()}`));
  await page.goto(url + 'preview.html#all');
  await page.waitForFunction(() => window.__preview, null, { timeout: 20000 });
  await page.waitForTimeout(1500); await page.screenshot({ path: path.join(dir, 'shots', 'preview-all.png') });
  for (const u of ['neon', 'meca', 'tortues', 'halloween', 'princesses', 'blocs', 'dekotora', 'peluches', 'fossiles', 'brochettes', 'chasseuses']) {
    await page.evaluate((u) => window.__preview.show(u), u);
    await page.waitForTimeout(1000); await page.screenshot({ path: path.join(dir, 'shots', `preview-${u}.png`) });
  }
  await page.close();
}
await browser.close(); server.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('ok');
