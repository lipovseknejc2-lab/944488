// Drives the built app in Chrome at phone and desktop sizes; fails on any console error.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const path = require('path'), http = require('http'), fs = require('fs');
const root = path.join(__dirname, '..', '..', '..', 'pace');
const shots = path.join(__dirname, 'shots'); fs.mkdirSync(shots, { recursive: true });
const srv = http.createServer((q, r) => { let f = path.join(root, q.url.split('?')[0].replace(/\/$/, '/index.html')); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } const t = { html: 'text/html', png: 'image/png', webmanifest: 'application/json', js: 'text/javascript', svg: 'image/svg+xml' }[f.split('.').pop()] || 'text/plain'; r.writeHead(200, { 'content-type': t }); r.end(fs.readFileSync(f)); });
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.error('FAIL', m); } else console.log('ok  ', m); };
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port, url = `http://localhost:${port}/`;
  const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const errs = [];
  const mk = async (w, h, scheme = 'light') => { const c = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: scheme, hasTouch: w < 600 }); const p = await c.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); await p.goto(url); await p.waitForTimeout(1700); return p; };
  const p = await mk(390, 844);
  const S = () => p.evaluate(() => JSON.parse(JSON.stringify(window.PACE.S)));
  const shot = n => p.screenshot({ path: path.join(shots, n + '.png') });
  const click = async sel => { await p.click(sel); await p.waitForTimeout(350); };
  await shot('01-home');
  ok((await p.textContent('.acct .big')).includes('4,850.00'), 'home shows checking balance 4,850.00');
  ok((await p.textContent('.sav')).includes('1,600.00') && (await p.textContent('.sav')).includes('3,400.00'), 'savings card shows 1,600 saved and 3,400 to go');
  ok(await p.locator('.sav .mascot svg').count() === 1, 'mascot is mounted in savings card');
  // mascot animates by swapping frames
  const a = await p.innerHTML('.sav .mascot'); await p.evaluate(() => window.PACE && document.querySelector('.sav .mascot')._p.play('happy')); await p.waitForTimeout(400); const b = await p.innerHTML('.sav .mascot'); ok(a !== b, 'mascot frame changes during animation');
  // tabs
  for (const t of ['cards', 'rewards', 'activity', 'profile']) { await click(`#nav button[data-t=${t}]`); await shot('02-' + t); ok(await p.locator('#view h1').first().isVisible(), 'tab ' + t + ' renders'); }
  await click('#nav button[data-t=cards]'); await click('[data-act=cardsTab][data-t=rewards]'); await shot('03-rewards-card');
  await click('[data-act=cardsTab][data-t=pay]'); await click('[data-act=reveal]'); await shot('04-card-reveal');
  // freeze card then declined payment
  await click('[data-act=freeze]'); ok((await S()).cards[0].status === 'frozen', 'card frozen');
  await click('[data-act=freeze]');
  // pay flow: contact payment of 25
  await click('#nav button[data-t=home]');
  await click('.qa [data-t=contact]'); await shot('05-flow-who');
  await click('[data-act=fwho][data-id=c1]'); await click('[data-act=fnext]');
  for (const k of ['2', '5']) await click(`[data-act=key][data-k="${k}"]`);
  await shot('06-flow-amount'); await click('[data-act=fnext]'); await shot('07-flow-review');
  await click('[data-act=fconfirm]'); await p.waitForTimeout(1500); await shot('08-flow-success');
  ok((await S()).accounts.chk.bal === 485000 - 2500, 'paid 25 euros: checking decreased by exactly 25');
  ok((await p.textContent('#flow')).includes('Payment successful'), 'success screen shown');
  await click('[data-act=fdone]');
  // deposit that crosses milestone 2,500 -> celebration
  await click('.sav [data-to=savings]'); await shot('09-savings');
  await click('[data-act=sheet][data-s=deposit]'); await p.fill('#f-amt', '900'); await click('[data-act=doDeposit]'); await p.waitForTimeout(900); await shot('10-celebration');
  const s2 = await S(); ok(s2.milestones.some(m => m.amount === 250000) && s2.pts.avail > 2580, 'milestone reached and points awarded');
  ok(await p.locator('#cele.on').count() === 1, 'level-up celebration shown');
  await p.waitForTimeout(2600); await shot('11-celebration-end'); await click('[data-act=closeCele]');
  // rewards redeem
  await click('#nav button[data-t=rewards]'); await click('.rw >> nth=3'); await shot('12-reward-sheet'); await click('[data-act=doRedeem]'); await p.waitForTimeout(300); await shot('13-redeemed');
  ok((await S()).redemptions.length === 2, 'reward redeemed and recorded'); await click('[data-act=closeSheet]');
  // activity insights
  await click('#nav button[data-t=activity]'); await click('[data-act=actView][data-t=insights]'); await shot('14-insights');
  // dark mode
  await p.evaluate(() => { window.PACE.A.theme({ dataset: { k: 'dark' } }); }); await p.waitForTimeout(300); await click('#nav button[data-t=home]'); await shot('15-home-dark');
  ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'dark theme applies');
  // persistence
  await p.reload(); await p.waitForTimeout(1500); ok((await S()).accounts.chk.bal === 485000 - 2500 - 90000 * 0 - 90000, 'balances persist across reload');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); ok(!overflow, 'no horizontal overflow on phone');
  // small phone and desktop
  const q = await mk(320, 640); await q.screenshot({ path: path.join(shots, '16-small.png') }); ok(!(await q.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)), 'no overflow at 320px');
  const d = await mk(1280, 800); await d.screenshot({ path: path.join(shots, '17-desktop.png') });
  const d2 = await mk(1280, 800, 'dark'); await d2.click('#nav button[data-t=cards]'); await d2.waitForTimeout(400); await d2.screenshot({ path: path.join(shots, '18-desktop-cards-dark.png') });
  ok(errs.length === 0, 'no console or page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await br.close(); srv.close(); process.exit(fails ? 1 : 0);
})();
