/* PACE app: screens, flows and reactions. All data comes from Store; every action goes through Store and then afterOp(). */
(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const E = Store.eur, esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let S = Store.load();
const R = { tab: 'home', stack: [], cardsTab: 'pay', actFilter: 'all', actView: 'list', rwFilter: 'All', selCard: null, reveal: {}, month: 0, faq: -1 };

/* ---------- icons ---------- */
const IC = { home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z', card: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M7 15h4', star: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z', list: 'M4 6h16M4 12h16M4 18h10', pulse: 'M3 12h4l3-8 4 16 3-8h4', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1-4 4-6 8-6s7 2 8 6', bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4', plus: 'M12 5v14M5 12h14', swap: 'M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4', send: 'M5 12h14M13 6l6 6-6 6', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', eyeoff: 'M3 3l18 18M10 6.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.7M6.5 7A16 16 0 0 0 2 12s4 7 10 7a9.6 9.6 0 0 0 4-.9M10 10a3 3 0 0 0 4 4', lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3', snow: 'M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', flag: 'M5 21V4M5 4h11l-2 4 2 4H5', plane: 'M3 13l18-9-5 17-4-7-9-1z', cart: 'M3 4h3l2 11h10l2-8H7M10 20h.01M17 20h.01', dining: 'M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM17 9h2a2 2 0 0 1 0 5h-2M7 3v2M11 3v2M15 3v2', transport: 'M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2zM5 10h14M8 21l2-4M16 21l-2-4', bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2', bolt: 'M13 3L5 14h6l-1 7 8-11h-6z', play: 'M6 4l14 8-14 8z', cross: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z', income: 'M12 4v14M6 12l6 6 6-6', out: 'M12 20V6M6 12l6-6 6 6', save: 'M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM5 5h14v4H5zM12 12v5', settings: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 7a2 2 0 1 0 4 0 2 2 0 0 0-4 0M6 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0', chev: 'M9 6l6 6-6 6', back: 'M15 6l-6 6 6 6', close: 'M6 6l12 12M18 6L6 18', check: 'M5 12l5 5 9-10', copy: 'M8 8h11v12H8zM5 16V4h11', moon: 'M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z', sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5', sound: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11', help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01', tag: 'M3 12V4h8l10 10-8 8zM7.5 8h.01', cap: 'M4 15a8 8 0 0 1 16 0zM2 15h20M12 7V4', fork: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 7 0 8v10', spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z', trend: 'M3 17l6-6 4 4 8-8M15 7h6v6', gift: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-3 0-5-1-5-3s3-2 5 3c2-5 5-5 5-3s-2 3-5 3', target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01', wave: 'M3 12c3-6 6-6 9 0s6 6 9 0', edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4', trash: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13', tap: 'M9 11V5a2 2 0 0 1 4 0v6M13 11l6 1v4a5 5 0 0 1-5 5h-2a5 5 0 0 1-4-2l-3-4 2-1 3 2' };
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[n] || IC.info}"/></svg>`;
const ART = { cup: 'dining', bag: 'bag', play: 'play', tag: 'tag', train: 'transport', plane: 'plane', star: 'star', cap: 'cap', pin: 'star', cross: 'cross', fork: 'fork', spark: 'spark' };
const LOGO = (c1 = '#5B2BE0', c2 = '#FBFAF7', c3 = '#D9C9FF') => `<svg viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="116" fill="${c1}"/><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M170 388 L232 142 H300 C376 142 376 288 300 288 H206" stroke="${c2}" stroke-width="58"/><path d="M300 392 L346 346 L392 392" stroke="${c3}" stroke-width="40"/></g></svg>`;
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17l-5.7 3 1.1-6.3L2.8 9.2l6.4-.9z"/></svg>';
const PTS = n => `<span class="pts">${STAR}${Number(n).toLocaleString('en-IE')} pts</span>`;

/* ---------- helpers ---------- */
const hide = s => S.settings.hideBalances ? '€ ••••' : s;
const mon = c => hide(E(c));
const hm = ts => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const when = ts => { const k = Store.dayKey(ts), n = Date.now(); if (k === Store.dayKey(n)) return 'Today, ' + hm(ts); if (k === Store.dayKey(n - 864e5)) return 'Yesterday'; return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };
const dayLabel = ts => { const k = Store.dayKey(ts), n = Date.now(); if (k === Store.dayKey(n)) return 'Today'; if (k === Store.dayKey(n - 864e5)) return 'Yesterday'; return new Date(ts).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }); };
const parseEuro = v => { const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? Math.round(n * 100) : 0; };
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const stage = () => Store.stageFor(S);
const lvl = () => Store.levelFor(S.pts.life);
const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2);
const catIcon = t => ({ Groceries: 'cart', Dining: 'dining', Transport: 'transport', Shopping: 'bag', Bills: 'bolt', Entertainment: 'play', Health: 'cross', Travel: 'plane', Income: 'income', Transfers: 'swap', Savings: 'save', Rewards: 'star', add: 'plus', save: 'save', flag: 'flag', gift: 'gift', star: 'star' }[t] || 'swap');

/* ---------- sound ---------- */
let AC = null;
function tone(seq, vol = .05) {
  if (!S.settings.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    let t = AC.currentTime;
    seq.forEach(([f, d, type]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .72; });
  } catch (e) { }
}
const SND = { tap: [[620, .05]], ok: [[523, .09], [784, .16]], coin: [[988, .06], [1319, .18]], up: [[392, .1], [523, .1], [659, .1], [784, .1], [1047, .3]], err: [[196, .14, 'triangle'], [160, .2, 'triangle']], tog: [[440, .05]] };
const snd = n => tone(SND[n], n === 'tap' ? .025 : .05);

/* ---------- confetti ---------- */
function confetti(n = 90) {
  if (!S.settings.motion) return;
  const c = $('#fx'), x = c.getContext('2d'); c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; x.scale(devicePixelRatio, devicePixelRatio);
  const col = ['#6C3CF0', '#D9C9FF', '#FFFFFF', '#8C68FF', '#E8B94A'];
  const ps = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .45, vx: (Math.random() - .5) * 11, vy: -Math.random() * 13 - 3, r: Math.random() * 6 + 3, c: col[Math.floor(Math.random() * col.length)], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
  let f = 0; (function step() { x.clearRect(0, 0, innerWidth, innerHeight); ps.forEach(p => { p.vy += .32; p.x += p.vx; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); }); if (++f < 110) requestAnimationFrame(step); else x.clearRect(0, 0, innerWidth, innerHeight); })();
}

/* ---------- mascot glue ---------- */
const mas = (st, anim = 'idle', live = false, cls = '') => `<div class="mascot ${cls}" data-st="${st}" data-anim="${anim}" ${live ? 'data-live="1"' : ''} role="img" aria-label="Pip, your PACE mascot"></div>`;
function mountMascots(root = document) { $$('.mascot', root).forEach(el => { if (el._p) return; const p = Mascot.mount(el, { stage: +el.dataset.st, anim: el.dataset.anim }); }); }
function pipPlay(anim, next) { $$('.mascot[data-live]').forEach(el => { if (el._p) el._p.play(anim, next || 'idle'); }); }
const nightNow = () => { const h = new Date().getHours(); return h >= 23 || h < 6; };
const SAYS = ['Small steps add up.', 'Save a little today?', 'I am cheering for you!', 'Your goal is getting closer.', 'Need a hand with a goal?', 'Nice pace!'];
function say(t, ms = 3600) { const h = $('.sav'); if (!h) return; $('.bubble', h)?.remove(); const b = document.createElement('div'); b.className = 'bubble'; b.textContent = t; h.appendChild(b); setTimeout(() => b.remove(), ms); }

/* ---------- toasts ---------- */
function toast(msg, icon = 'check') { const w = $('#toasts'), t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(icon) + `<span>${esc(msg)}</span>`; w.appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2800); }

/* ---------- events from the store ---------- */
let celeQueue = [];
function afterOp(res, opts = {}) {
  (res.events || []).forEach(e => {
    if (e.type === 'error') { snd('err'); pipPlay('disappointed'); }
    if (e.type === 'paid') { snd('ok'); pipPlay('happy'); }
    if (e.type === 'saved') { snd('coin'); pipPlay('happy'); say('Nice! Every euro counts.'); }
    if (e.type === 'received') snd('coin');
    if (e.type === 'sad') pipPlay('disappointed');
    if (e.type === 'happy') pipPlay('happy');
    if (e.type === 'points' && !opts.quiet) toast('+' + e.n + ' points', 'star');
    if (e.type === 'milestone') { celeQueue.push({ kind: 'milestone', e }); }
    if (e.type === 'goalDone') { celeQueue.push({ kind: 'goal', e }); }
    if (e.type === 'levelup') celeQueue.push({ kind: 'stage', e });
    if (e.type === 'rewardsLevel') celeQueue.push({ kind: 'rlevel', e });
  });
  if (res.ok === false && res.error && !opts.silentError) toast(res.error, 'info');
  render();
  setTimeout(runCele, opts.delay || 250);
}
function runCele() {
  if (!celeQueue.length || $('#cele').classList.contains('on')) return;
  const stg = celeQueue.find(c => c.kind === 'stage');
  const q = celeQueue; celeQueue = [];
  let item = stg || q.find(c => c.kind === 'rlevel') || q.find(c => c.kind === 'goal') || q.find(c => c.kind === 'milestone');
  const el = $('#cele'); let h = '';
  if (item.kind === 'stage') {
    const n = item.e.stage; h = mas(n - 1, 'levelup', false, 'big') + `<h1>Pip evolved</h1><p class="muted" style="color:#d9c9ff">Pip is now <b>${esc(item.e.name)}</b>. Your savings unlocked a new stage.</p>`;
  } else if (item.kind === 'rlevel') {
    h = mas(stage(), 'celebrating', false, 'big') + `<h1>${esc(item.e.name)} unlocked</h1><p style="color:#d9c9ff">Your PACE Rewards card has a new look and new benefits.</p>`;
  } else if (item.kind === 'goal') {
    h = mas(stage(), 'celebrating', false, 'big') + `<h1>Goal reached</h1><p style="color:#d9c9ff">${esc(item.e.name)} is complete. Well done.</p>`;
  } else {
    h = mas(stage(), 'celebrating', false, 'big') + `<h1>${E(item.e.amount, { abs: true }).replace('.00', '')} saved</h1><p style="color:#d9c9ff">Milestone reached. Pip is proud of you.</p>`;
  }
  el.innerHTML = h + '<button class="btn" style="margin-top:18px;min-width:180px" data-act="closeCele">Continue</button>';
  el.classList.add('on'); mountMascots(el);
  const m = $('.mascot', el); if (m && m._p && item.kind === 'stage') m._p.nextStage = item.e.stage;
  confetti(item.kind === 'stage' ? 140 : 90); snd(item.kind === 'stage' || item.kind === 'rlevel' ? 'up' : 'ok');
}

/* ---------- charts ---------- */
const nice = v => { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); const f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const k = c => c >= 100000 ? (c / 100000).toFixed(c % 100000 ? 1 : 0) + 'k' : String(Math.round(c / 100));
function groupedBars(series) {
  const W = 340, H = 170, L = 30, B = 22, T = 10, max = nice(Math.max(1, ...series.flatMap(s => [s.inc, s.exp]))), n = series.length, cw = (W - L) / n, bw = Math.min(16, cw / 3);
  let g = ''; for (let i = 0; i <= 3; i++) { const y = T + (H - T - B) * (1 - i / 3); g += `<line class="grid" x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 3}" text-anchor="end">${k(max * i / 3)}</text>`; }
  series.forEach((s, i) => {
    const x0 = L + cw * i + cw / 2; const hh = v => (H - T - B) * v / max;
    g += `<rect x="${x0 - bw - 1}" y="${H - B - hh(s.inc)}" width="${bw}" height="${Math.max(1, hh(s.inc))}" rx="4" fill="var(--chart1)" data-tip="${s.label} income ${E(s.inc)}"/>`;
    g += `<rect x="${x0 + 1}" y="${H - B - hh(s.exp)}" width="${bw}" height="${Math.max(1, hh(s.exp))}" rx="4" fill="var(--chart2)" data-tip="${s.label} expenses ${E(s.exp)}"/>`;
    g += `<text x="${x0}" y="${H - 6}" text-anchor="middle">${s.label}</text>`;
  });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Income and expenses by month">${g}</svg><div class="tip"></div></div><div class="legend" style="margin-top:6px"><span><i style="background:var(--chart1)"></i>Income</span><span><i style="background:var(--chart2)"></i>Expenses</span></div>`;
}
function areaLine(series, key, fmt) {
  const W = 340, H = 150, L = 30, B = 22, T = 14, vals = series.map(s => s[key]), max = nice(Math.max(1, ...vals)), n = series.length, step = (W - L - 14) / Math.max(1, n - 1);
  const pts = vals.map((v, i) => [L + 7 + step * i, T + (H - T - B) * (1 - v / max)]);
  let g = ''; for (let i = 0; i <= 3; i++) { const y = T + (H - T - B) * (1 - i / 3); g += `<line class="grid" x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 3}" text-anchor="end">${k(max * i / 3)}</text>`; }
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
  g += `<path d="${d}L${pts[n - 1][0]} ${H - B}L${pts[0][0]} ${H - B}Z" fill="var(--chart1)" opacity=".13"/><path d="${d}" fill="none" stroke="var(--chart1)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach((p, i) => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === n - 1 ? 5 : 3}" fill="var(--chart1)" stroke="var(--surface)" stroke-width="2"/><circle cx="${p[0]}" cy="${p[1]}" r="14" fill="transparent" data-tip="${series[i].label}: ${fmt(vals[i])}"/><text x="${p[0]}" y="${H - 6}" text-anchor="middle">${series[i].label}</text>`; });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart over six months">${g}</svg><div class="tip"></div></div>`;
}
function simpleBars(series, key, fmt) {
  const W = 340, H = 140, L = 30, B = 22, T = 10, max = nice(Math.max(1, ...series.map(s => s[key]))), n = series.length, cw = (W - L) / n, bw = Math.min(22, cw / 2);
  let g = ''; for (let i = 0; i <= 2; i++) { const y = T + (H - T - B) * (1 - i / 2); g += `<line class="grid" x1="${L}" x2="${W}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 3}" text-anchor="end">${Math.round(max * i / 2)}</text>`; }
  series.forEach((s, i) => { const x0 = L + cw * i + cw / 2, h = (H - T - B) * s[key] / max; g += `<rect x="${x0 - bw / 2}" y="${H - B - h}" width="${bw}" height="${Math.max(1, h)}" rx="5" fill="var(--chart1)" data-tip="${s.label}: ${fmt(s[key])}"/><text x="${x0}" y="${H - 6}" text-anchor="middle">${s.label}</text>`; });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Points earned per month">${g}</svg><div class="tip"></div></div>`;
}
function catBars(rows) {
  if (!rows.length) return `<p class="muted small">No spending recorded this month yet.</p>`;
  const max = rows[0].v, total = rows.reduce((a, r) => a + r.v, 0);
  return `<div class="chart">` + rows.map(r => `<div class="cat" data-tip="${r.cat}: ${E(r.v)} (${Math.round(r.v / total * 100)}%)"><span class="row" style="gap:7px">${ic(catIcon(r.cat)).replace('class="ic ', 'style="width:16px;height:16px" class="ic ')}${r.cat}</span><div class="bar"><i style="width:${Math.max(4, r.v / max * 100)}%"></i></div><b class="num">${E(r.v)}</b></div>`).join('') + `<div class="tip"></div></div>`;
}

/* ---------- components ---------- */
const bgStride = '<svg class="bg" viewBox="0 0 200 200" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"><path d="M40 190L82 30H120C168 30 168 120 120 120H70" opacity=".5"/></svg>';
function AccountCard() {
  const a = S.accounts.chk;
  return `<section class="acct" aria-label="Checking account">${bgStride}
  <button class="row" style="width:100%;text-align:left;display:block" data-act="open" data-to="account"><div class="lab">${ic('card').replace('class="ic', 'style="width:18px;height:18px" class="ic')}${esc(a.name)} <span class="pill" style="background:rgba(255,255,255,.18);color:#fff">${esc(a.type)}</span></div>
  <div class="big num">${mon(a.bal)}</div><div class="id">${esc(a.ident)}</div></button>
  <div class="qa"><button data-act="sheet" data-s="addMoney">${ic('plus')}Add money</button><button data-act="flow" data-t="transfer">${ic('swap')}Transfer</button><button data-act="flow" data-t="contact">${ic('send')}Pay</button><button data-act="open" data-to="account">${ic('info')}Details</button></div></section>`;
}
function SavingsProgress(total, target, big) { const p = Math.min(100, total / target * 100); return `<div class="bar ${big ? 'thick' : ''}" role="progressbar" aria-valuenow="${Math.round(p)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>`; }
function SavingsCard() {
  const total = Store.savingsTotal(S), target = S.accounts.sav.target, left = Math.max(0, target - total), st = stage(), nm = Store.nextMilestone(S);
  return `<section class="sav" aria-label="PACE Savings">
  <div class="txt"><div class="row between"><span class="muted small" style="font-weight:700">${esc(S.accounts.sav.name)}</span></div>
  <div class="big num">${mon(total)} <span style="font-size:14px;font-weight:700" class="muted">saved</span></div>
  <div class="muted" style="font-weight:600">${left > 0 ? mon(left) + ' to next goal' : 'Goal reached'}</div></div>
  <button class="mas" data-act="tapPip" aria-label="Pip">${mas(st, nightNow() ? 'sleeping' : 'idle', true)}</button>
  <div class="prog">${SavingsProgress(total, target, true)}
    <div class="row between small"><span class="stage pill">Level ${st} · ${Store.STAGE_NAMES[st - 1]}</span><span class="muted" style="font-weight:600">${nm ? 'Next: ' + E(nm, { abs: true }).replace('.00', '') : 'All milestones reached'}</span></div>
    <button class="btn block" data-act="open" data-to="savings">Open savings</button></div></section>`;
}
function TransactionRow(t, opt = {}) {
  const pts = t.type === 'reward_earn' || t.type === 'reward_redeem';
  const inc = !pts && t.amount > 0, dec = t.status === 'declined', pend = t.status === 'pending';
  const amount = pts ? `<span class="pts" style="${t.pts < 0 ? 'background:var(--surface2);color:var(--ink2)' : ''}">${STAR}${t.pts > 0 ? '+' : ''}${t.pts}</span>` : dec ? `<span class="amt dec">${E(t.attempted || 0, { abs: true })}</span>` : t.moved ? `<span class="amt">${mon(t.moved)}</span>` : `<span class="amt ${inc ? 'in' : ''}">${inc ? '+' : ''}${mon(t.amount)}</span>`;
  const sub = dec ? t.sub : `${t.cat === 'Rewards' ? 'Rewards' : esc(t.cat)} · ${when(t.ts)}${pend ? ' · Pending' : ''}`;
  return `<button class="tx" data-act="tx" data-id="${t.id}"><div class="ib ${inc ? 'in' : ''} ${dec ? 'bad' : ''}">${ic(catIcon(t.icon === t.cat || !IC[t.icon] ? t.cat : t.icon))}</div><div class="grow"><div class="t">${esc(t.title)}</div><div class="s">${sub}</div></div><div>${amount}${pend ? '<div class="small faint" style="text-align:right">Pending</div>' : ''}</div></button>`;
}
function pcard(c, sel) {
  const num = R.reveal[c.id] ? c.full : '•••• •••• •••• ' + c.last4;
  return `<button class="pcard cd-${c.design} ${c.status === 'frozen' ? 'frozen' : ''} ${sel ? 'sel' : ''}" data-act="selCard" data-id="${c.id}" aria-label="${esc(c.name)} ending ${c.last4}">
  <div class="top"><div><div style="font-weight:700;font-size:14px">${esc(c.name)}</div><div class="chip-ic"></div></div><div style="text-align:right;opacity:.9"><div style="width:30px;margin-left:auto">${LOGO('transparent', 'currentColor', 'currentColor').replace('<rect width="512" height="512" rx="116" fill="transparent"/>', '')}</div><div style="font-size:10px;letter-spacing:.12em;font-weight:700;margin-top:4px">${c.kind === 'virtual' ? 'VIRTUAL' : 'DEBIT'}</div></div></div>
  <div class="pn">${num}</div>
  <div class="meta"><div>CARDHOLDER<b>${esc(S.user.name.toUpperCase())}</b></div><div>EXPIRES<b>${R.reveal[c.id] ? c.exp : '••/••'}</b></div>${R.reveal[c.id] ? `<div>CVV<b>${c.cvv}</b></div>` : ''}</div>
  ${c.status === 'frozen' ? '<div class="stamp">FROZEN</div>' : c.status === 'closed' ? '<div class="stamp">CLOSED</div>' : ''}</button>`;
}
function RewardsCard(compact) {
  const L = lvl(), idx = Store.levelIndex(L.id), nx = Store.LEVELS[idx + 1];
  const deco = `<svg class="deco" viewBox="0 0 200 200" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M40 190L82 30H120C168 30 168 120 120 120H70"/></svg>`;
  const rings = idx >= 2 ? `<svg class="rings" viewBox="0 0 300 200" preserveAspectRatio="none" fill="none" stroke="#fff" stroke-width="1.2">${Array.from({ length: idx + 2 }, (_, i) => `<circle cx="260" cy="40" r="${40 + i * 30}"/>`).join('')}</svg>` : '';
  return `<div class="rcard rc-${L.id}" aria-label="PACE Rewards card">${deco}${rings}
  <div class="row between"><div class="row" style="gap:8px"><div style="width:26px">${LOGO('rgba(255,255,255,.18)', '#fff', '#fff')}</div><b style="font:800 15px var(--display);letter-spacing:.04em">PACE Rewards</b></div><span class="lv">${L.name}</span></div>
  <div><div style="opacity:.8;font-size:12px;font-weight:700;letter-spacing:.08em">POINTS · NOT MONEY</div><div class="pb num">${S.pts.avail.toLocaleString('en-IE')}</div></div>
  <div class="col" style="gap:8px"><div class="lvl-dots">${Store.LEVELS.map((l, i) => `<i class="${i <= idx ? 'on' : ''}"></i>`).join('')}</div>
  <div class="row between" style="font-size:12px"><div><div style="opacity:.75">MEMBER</div><b style="font:700 13.5px var(--display)">${esc(S.user.name.toUpperCase())}</b></div><div style="text-align:right"><div style="opacity:.75">ID</div><b style="font:700 13.5px var(--display);letter-spacing:.06em">${esc(S.user.memberId)}</b></div></div></div></div>`;
}
function PointsProgress() {
  const L = lvl(), idx = Store.levelIndex(L.id), nx = Store.LEVELS[idx + 1], life = S.pts.life;
  const p = nx ? (life - L.min) / (nx.min - L.min) * 100 : 100;
  return `<div class="col" style="gap:8px"><div class="bar thick"><i style="width:${p}%"></i></div><div class="row between small"><span class="muted"><b>${life.toLocaleString('en-IE')}</b> lifetime pts</span><span class="muted">${nx ? `${(nx.min - life).toLocaleString('en-IE')} pts to ${nx.name}` : 'Top level reached'}</span></div></div>`;
}
function RewardItem(r) {
  const used = S.stock[r.id] || 0, left = r.stock - used, locked = Store.levelIndex(lvl().id) < r.min, can = S.pts.avail >= r.pts && !locked && left > 0;
  return `<button class="rw ${locked || left <= 0 ? 'lock' : ''}" data-act="reward" data-id="${r.id}"><div class="art">${ic(ART[r.art] || 'gift')}</div><div class="bd"><span class="faint small" style="font-weight:700">${r.kind}</span><div style="font-weight:700;line-height:1.2">${esc(r.name)}</div><div class="row between" style="margin-top:auto;padding-top:6px">${PTS(r.pts)}<span class="small ${left <= 3 ? '' : 'faint'}" style="${left <= 3 && left > 0 ? 'color:var(--warn);font-weight:700' : ''}">${left <= 0 ? 'Out of stock' : locked ? 'Unlocks at ' + Store.LEVELS[r.min].name : left <= 3 ? left + ' left' : can ? 'Available' : ''}</span></div></div></button>`;
}
function NotificationItem(n) {
  const icn = { payment: 'check', received: 'income', milestone: 'flag', goal: 'flag', reward: 'gift', level: 'star', card: 'card', weekly: 'pulse' }[n.kind] || 'bell';
  return `<button class="tx" data-act="readNotif" data-id="${n.id}"><div class="ib">${ic(icn)}</div><div class="grow"><div class="t" style="white-space:normal;${n.read ? 'font-weight:600;color:var(--ink2)' : ''}">${esc(n.title)}</div><div class="s" style="white-space:normal">${esc(n.body)}</div><div class="s">${when(n.ts)}</div></div>${n.read ? '' : '<span class="pill">New</span>'}</button>`;
}
const switchEl = (on, act, data = '') => `<button class="sw" role="switch" aria-checked="${on}" data-act="${act}" ${data}></button>`;
const setRow = (icn, title, sub, right, attrs) => `<div class="setrow" ${attrs && attrs.includes('data-act') ? 'role="button" tabindex="0"' : ''} ${attrs || ''}><div class="ib">${ic(icn)}</div><div class="grow"><div style="font-weight:650">${title}</div>${sub ? `<div class="small faint">${sub}</div>` : ''}</div>${right === undefined ? ic('chev') : right}</div>`;

/* ---------- screens ---------- */
const SC = {};
function header() {
  const unread = S.notifs.filter(n => !n.read).length;
  return `<div class="hdr"><div class="logo logo-h">${LOGO()}<span>PACE</span></div><div class="grow"></div><div class="row"><button class="iconbtn" data-act="open" data-to="notifs" aria-label="Notifications">${ic('bell')}${unread ? '<span class="badge"></span>' : ''}</button><button class="avatar" data-act="tab" data-t="profile" aria-label="Profile">${initials(S.user.name)}</button></div></div>`;
}
SC.home = () => {
  const recent = S.tx.filter(t => t.type !== 'reward_earn' && t.type !== 'reward_redeem').slice(0, 5);
  const claim = Store.challengeState().filter(c => c.done && !c.claimed).length + (S.checkins.includes(Store.dayKey(Date.now())) ? 0 : 1);
  return `<div class="screen">${header()}
  <div style="margin-bottom:16px"><div class="muted" style="font-weight:600">${greet()}, ${esc(S.user.first)}</div><h1>Your money. Your progress.</h1></div>
  <div class="ov"><div><small>Checking</small><b>${mon(S.accounts.chk.bal)}</b></div><div><small>Savings</small><b>${mon(Store.savingsTotal(S))}</b></div><div><small>Points</small><b class="pt">${S.pts.avail.toLocaleString('en-IE')}</b></div></div>
  <div class="home-grid"><div>${AccountCard()}${SavingsCard()}</div>
  <div><div class="sec" style="margin-top:0"><div class="head"><h2>Quick actions</h2></div><div class="tiles">
  <button class="tile" data-act="flow" data-t="transfer"><span class="ib">${ic('swap')}</span>Transfer</button><button class="tile" data-act="flow" data-t="contact"><span class="ib">${ic('send')}</span>Pay</button>
  <button class="tile" data-act="sheet" data-s="addMoney"><span class="ib">${ic('plus')}</span>Add money</button><button class="tile" data-act="tab" data-t="cards"><span class="ib">${ic('card')}</span>Cards</button>
  <button class="tile" data-act="collect"><span class="ib">${ic('gift')}${claim ? `<span class="dot">${claim}</span>` : ''}</span>Rewards</button></div></div>
  <div class="sec"><div class="head"><h2>Recent activity</h2><button class="link" data-act="tab" data-t="activity">View all</button></div><div class="list">${recent.map(t => TransactionRow(t)).join('')}</div></div></div></div></div>`;
};
SC.account = () => {
  const a = S.accounts.chk, ser = Store.monthSeries(Date.now(), 6), cur = ser[5];
  const rows = S.tx.filter(t => t.acct === 'chk' && t.type !== 'reward_earn' && t.type !== 'reward_redeem').slice(0, 8);
  return `<div class="screen">${back('Home')}<div class="acct">${bgStride}<div class="lab">${esc(a.name)}</div><div class="big num">${mon(a.bal)}</div><div class="id">${esc(a.ident)}</div>
  <div class="qa"><button data-act="sheet" data-s="addMoney">${ic('plus')}Add money</button><button data-act="flow" data-t="transfer">${ic('swap')}Transfer</button><button data-act="flow" data-t="contact">${ic('send')}Pay</button><button data-act="flow" data-t="request">${ic('income')}Request</button></div></div>
  <div class="sec"><h2>Account details</h2><div class="card">
  <div class="kv"><span>Account type</span><span>${esc(a.type)}</span></div><div class="kv"><span>Account number</span><span>${esc(a.ident)}</span></div><div class="kv"><span>Currency</span><span>Euro (EUR)</span></div><div class="kv"><span>Linked cards</span><span>${S.cards.filter(c => c.status !== 'closed').length}</span></div><div class="kv"><span>Opened</span><span>${new Date(S.user.joined).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span></div></div></div>
  <div class="sec"><div class="head"><h2>This month</h2></div><div class="card col"><div class="row between"><div><div class="small faint" style="font-weight:700">MONEY IN</div><div class="num" style="font-size:22px;font-weight:800;color:var(--good)">${mon(cur.inc)}</div></div><div style="text-align:right"><div class="small faint" style="font-weight:700">MONEY OUT</div><div class="num" style="font-size:22px;font-weight:800">${mon(cur.exp)}</div></div></div>${catBars(Store.spendByCategory(Date.now(), 0).slice(0, 5))}</div></div>
  <div class="sec"><div class="head"><h2>Transactions</h2><button class="link" data-act="tab" data-t="activity">See all</button></div><div class="list">${rows.map(t => TransactionRow(t)).join('')}</div></div></div>`;
};
const back = (label = 'Back') => `<button class="back" data-act="back">${ic('back')}${label}</button>`;
function ETA(g) { const e = Store.eta(g); if (e.done) return 'Completed'; if (e.none) return 'Add a deposit to see an estimate'; return 'On track for ' + new Date(e.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); }
SC.savings = () => {
  const total = Store.savingsTotal(S), target = S.accounts.sav.target, st = stage(), nm = Store.nextMilestone(S), pct = Math.min(100, total / target * 100);
  const pace = Store.savingsPace(Date.now()), left = Math.max(0, target - total), months = pace > 0 ? left / pace : null;
  const eta = left <= 0 ? 'Goal reached' : months == null ? 'Add a deposit to see an estimate' : 'Estimated ' + new Date(Date.now() + months * 30.4 * 864e5).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const nextStageAt = Store.STAGE_AT[st];
  return `<div class="screen">${back('Home')}<div class="title-row"><h1>PACE Savings</h1><button class="btn soft sm" data-act="sheet" data-s="newGoal">${ic('plus')}New goal</button></div>
  <div class="sav"><div class="txt"><div class="muted small" style="font-weight:700">Total saved</div><div class="big num">${mon(total)}</div><div class="muted" style="font-weight:600">${pct.toFixed(0)}% of ${mon(target)}</div></div>
  <button class="mas" data-act="tapPip">${mas(st, nightNow() ? 'sleeping' : 'idle', true)}</button>
  <div class="prog">${SavingsProgress(total, target, true)}<div class="row between small"><span class="muted"><b>${mon(left)}</b> remaining</span><span class="muted">${eta}</span></div>
  <div class="row between small"><span class="pill">Level ${st} · ${Store.STAGE_NAMES[st - 1]}</span><span class="muted" style="font-weight:600">${nextStageAt ? 'Next stage at ' + E(nextStageAt, { abs: true }).replace('.00', '') : 'Pip is fully evolved'}</span></div>
  <div class="row" style="gap:8px"><button class="btn grow" data-act="sheet" data-s="deposit">Deposit</button><button class="btn ghost grow" data-act="sheet" data-s="withdraw">Withdraw</button></div></div></div>
  <div class="sec"><div class="head"><h2>Goals</h2><span class="small faint">${S.goals.length} goals</span></div><div class="list">${S.goals.map(g => { const p = Math.min(100, g.saved / g.target * 100); return `<button class="tx" data-act="goal" data-id="${g.id}"><div class="ib">${ic(g.locked ? 'lock' : IC[g.icon] ? g.icon : 'flag')}</div><div class="grow"><div class="row between"><span class="t">${esc(g.name)}</span><b class="num">${mon(g.saved)}</b></div><div class="bar" style="margin:7px 0 4px"><i style="width:${p}%"></i></div><div class="s">${g.completedAt ? 'Completed' : p.toFixed(0) + '% of ' + mon(g.target)}${g.locked && g.saved < g.target ? ' · Locked commitment' : ''}</div></div></button>`; }).join('')}</div></div>
  <div class="sec"><div class="head"><h2>Milestones</h2></div><div class="card ladder">${Store.MILESTONES.map(m => { const done = S.milestones.find(x => x.amount === m); const nxt = m === nm; return `<div class="ms ${done ? 'on' : ''}"><div class="dotm">${done ? ic('check').replace('class="ic', 'style="width:15px;height:15px" class="ic') : ''}</div><div class="grow"><b class="num">${E(m, { abs: true }).replace('.00', '')}</b><div class="small faint">${done ? 'Reached ' + new Date(done.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : nxt ? E(m - total, { abs: true }) + ' to go' : 'Locked'}</div></div>${PTS(S.rules.milestoneBonus).replace('pts', 'bonus')}</div>`; }).join('')}</div></div>
  <div class="sec"><div class="head"><h2>Pip's stages</h2></div><div class="card"><div class="stage-row">${[1, 2, 3, 4, 5].map(n => `<div class="${st >= n ? 'on' : ''} ${st === n ? 'cur' : ''}">${mas(n, 'idle')}<div>${Store.STAGE_NAMES[n - 1]}</div><div style="font-weight:600">${E(Store.STAGE_AT[n - 1], { abs: true }).replace('.00', '')}</div></div>`).join('')}</div><p class="small muted" style="margin-top:12px">Pip grows as your total savings pass each stage. Moving money back out never takes points you already earned.</p></div></div>
  <div class="sec"><div class="card col"><div class="row">${ic('lock')}<h3>About the Long-term Vault</h3></div><p class="muted small">The Vault is optional. When you deposit into it you confirm a commitment: the money stays put until the Vault reaches its target of ${E(S.goals.find(g => g.locked)?.target || 1000000, { abs: true }).replace('.00', '')}. Every other goal can be withdrawn at any time. The lock is shown on the goal, on the deposit screen and here.</p></div></div></div>`;
};
SC.goal = () => { };
SC.cards = () => {
  const open = S.cards.filter(c => c.status !== 'closed');
  if (!R.selCard || !open.find(c => c.id === R.selCard)) R.selCard = (open.find(c => c.def) || open[0]).id;
  const sel = Store.cardById(R.selCard);
  const body = R.cardsTab === 'rewards' ? SC.rewardsCardPage() : `<div class="cards-scroll" id="cs">${open.map(c => pcard(c, c.id === sel.id)).join('')}<button class="pcard" style="background:var(--surface);color:var(--accent);border:2px dashed var(--lav);align-items:center;justify-content:center;gap:8px;box-shadow:none" data-act="sheet" data-s="addCard">${ic('plus')}<b>Add a card</b></button></div>${cardPanel(sel)}`;
  return `<div class="screen">${header()}<h1 style="margin-bottom:12px">Cards</h1><div class="seg" role="tablist"><button aria-pressed="${R.cardsTab === 'pay'}" data-act="cardsTab" data-t="pay">Payment cards</button><button aria-pressed="${R.cardsTab === 'rewards'}" data-act="cardsTab" data-t="rewards">Rewards card</button></div><div style="margin-top:16px">${body}</div></div>`;
};
function cardPanel(c) {
  const spent = Store.cardMonthSpend(c.id, Date.now(), S), pct = Math.min(100, spent / c.limits.monthly * 100);
  const tg = (k, t, icn) => setRow(icn, t, '', switchEl(c[k], 'cardTog', `data-k="${k}" data-id="${c.id}"`), '');
  return `<div class="col" style="gap:14px"><div class="row" style="gap:8px"><button class="btn ${c.status === 'frozen' ? '' : 'soft'} grow" data-act="freeze" data-id="${c.id}">${ic('snow')}${c.status === 'frozen' ? 'Unfreeze' : 'Freeze'}</button><button class="btn soft grow" data-act="reveal" data-id="${c.id}">${ic(R.reveal[c.id] ? 'eyeoff' : 'eye')}${R.reveal[c.id] ? 'Hide' : 'Show'} details</button></div>
  ${R.reveal[c.id] ? '<p class="small faint">Demo details only. These are fictional numbers and cannot be used to pay anywhere.</p>' : ''}
  <div class="card"><div class="row between"><h3>Spending this month</h3><span class="pill ${c.status === 'frozen' ? 'warn' : 'good'}">${c.status === 'frozen' ? 'Frozen' : 'Active'}</span></div><div class="row between" style="margin:10px 0 6px"><b class="num" style="font-size:22px">${mon(spent)}</b><span class="muted small">of ${mon(c.limits.monthly)}</span></div><div class="bar thick"><i style="width:${pct}%"></i></div><div class="small faint" style="margin-top:8px">Per-payment limit ${mon(c.limits.perTx)}</div><button class="btn soft block" style="margin-top:12px" data-act="sheet" data-s="limits" data-id="${c.id}">Set spending limits</button></div>
  <div class="list">${tg('online', 'Online payments', 'cart')}${tg('intl', 'International payments', 'plane')}${tg('contactless', 'Contactless', 'wave')}${tg('atm', 'ATM withdrawals', 'out')}</div>
  <div class="list">${setRow('card', 'Linked account', S.accounts.chk.name, '<span class="muted small">' + mon(S.accounts.chk.bal) + '</span>', 'data-act="open" data-to="account"')}${setRow('edit', 'Rename card', esc(c.name), undefined, `data-act="sheet" data-s="rename" data-id="${c.id}"`)}${setRow('spark', 'Change appearance', c.design[0].toUpperCase() + c.design.slice(1), undefined, `data-act="sheet" data-s="design" data-id="${c.id}"`)}${setRow('check', c.def ? 'Default payment card' : 'Set as default', c.def ? 'Used first when you pay' : 'Use this card first when you pay', c.def ? '<span class="pill good">Default</span>' : undefined, c.def ? '' : `data-act="setDef" data-id="${c.id}"`)}${setRow('trash', 'Close this card', 'Closed cards cannot be reopened', undefined, `data-act="closeCard" data-id="${c.id}"`)}</div></div>`;
}
SC.rewardsCardPage = () => {
  const L = lvl(), idx = Store.levelIndex(L.id), hist = S.tx.filter(t => t.type === 'reward_earn' || t.type === 'reward_redeem').slice(0, 6);
  return `<div class="col" style="gap:16px">${RewardsCard()}<div class="card col"><h3>Progress</h3>${PointsProgress()}</div>
  <div class="card"><h3 style="margin-bottom:6px">Your benefits · ${L.name}</h3>${L.perks.map(p => `<div class="ms on"><div class="dotm">${ic('check').replace('class="ic', 'style="width:15px;height:15px" class="ic')}</div><div>${p}</div></div>`).join('')}</div>
  <div class="card"><h3 style="margin-bottom:6px">All levels</h3>${Store.LEVELS.map((l, i) => `<div class="kv"><span><b style="color:var(--ink)">${l.name}</b></span><span>${l.min.toLocaleString('en-IE')} pts · ×${l.mult.toFixed(2)}</span></div>`).join('')}</div>
  <div class="sec" style="margin-top:0"><div class="head"><h2>Rewards history</h2><button class="link" data-act="tab" data-t="rewards">Marketplace</button></div><div class="list">${hist.map(t => TransactionRow(t)).join('')}</div></div></div>`;
};
SC.rewards = () => {
  const L = lvl(), kinds = ['All', ...new Set(Store.CATALOG.map(r => r.kind))], chs = Store.challengeState(), today = Store.dayKey(Date.now()), got = S.checkins.includes(today);
  const items = Store.CATALOG.filter(r => R.rwFilter === 'All' || r.kind === R.rwFilter);
  return `<div class="screen">${header()}<h1 style="margin-bottom:12px">Rewards</h1>
  <div class="card col"><div class="hero-pts"><div><div class="small faint" style="font-weight:700">AVAILABLE POINTS · NOT MONEY</div><div class="num" style="font-size:40px;font-weight:800;color:var(--accent);line-height:1.1">${S.pts.avail.toLocaleString('en-IE')}</div></div><span class="pill">${L.name}</span></div>
  <div class="row" style="gap:20px"><div><div class="small faint">Lifetime earned</div><b class="num">${S.pts.life.toLocaleString('en-IE')}</b></div><div><div class="small faint">Redeemed</div><b class="num">${S.pts.redeemed.toLocaleString('en-IE')}</b></div><div><div class="small faint">Next level</div><b>${Store.LEVELS[Store.levelIndex(L.id) + 1]?.name || 'Top'}</b></div></div>${PointsProgress()}
  <button class="btn ${got ? 'ghost' : ''} block" data-act="daily" ${got ? 'disabled' : ''}>${got ? 'Daily bonus collected' : 'Collect daily bonus +' + S.rules.dailyBonus + ' pts'}</button></div>
  <div class="sec"><div class="head"><h2>Weekly challenges</h2><span class="small faint">Resets Monday</span></div><div class="list">${chs.map(c => `<div class="tx"><div class="ib">${ic(c.id === 'save25' ? 'save' : c.id === 'cards3' ? 'card' : 'target')}</div><div class="grow"><div class="t" style="white-space:normal">${c.name}</div><div class="bar" style="margin:7px 0 4px"><i style="width:${c.prog / c.target * 100}%"></i></div><div class="s">${c.unit === 'eur' ? E(c.prog, { abs: true }) + ' of ' + E(c.target, { abs: true }) : c.prog + ' of ' + c.target}</div></div>${c.claimed ? '<span class="pill good">Collected</span>' : `<button class="btn sm ${c.done ? '' : 'ghost'}" data-act="claim" data-id="${c.id}" ${c.done ? '' : 'disabled'}>+${S.rules.challengeBonus}</button>`}</div>`).join('')}</div></div>
  <div class="sec"><div class="head"><h2>Marketplace</h2></div><div class="chips">${kinds.map(k => `<button class="chip" aria-pressed="${R.rwFilter === k}" data-act="rwFilter" data-k="${k}">${k}</button>`).join('')}</div><div class="shop">${items.map(RewardItem).join('')}</div></div>
  <div class="sec"><div class="head"><h2>How you earn points</h2><button class="link" data-act="sheet" data-s="rules">Rules</button></div><div class="card col small muted"><div>Every <b>${E(S.rules.blockCents, { abs: true }).replace('.00', '')}</b> of eligible card spending earns <b>${S.rules.ptsPerBlock} pts</b>, times your level bonus (${lvl().name} ×${lvl().mult.toFixed(2)}).</div><div>Savings milestone <b>+${S.rules.milestoneBonus}</b> · Goal completed <b>+${S.rules.goalBonus}</b> · Weekly challenge <b>+${S.rules.challengeBonus}</b> · Daily bonus <b>+${S.rules.dailyBonus}</b></div><div>Payments to contacts, transfers, top-ups and savings deposits never earn spending points, and spending points stop at ${S.rules.dailyCap} per day. We do not reward spending for its own sake.</div></div></div>
  ${S.redemptions.length ? `<div class="sec"><div class="head"><h2>Your redemptions</h2></div><div class="list">${S.redemptions.slice(0, 5).map(r => `<div class="tx"><div class="ib">${ic('gift')}</div><div class="grow"><div class="t">${esc(r.name)}</div><div class="s">${when(r.ts)} · Code ${r.code}</div></div>${PTS(r.pts)}</div>`).join('')}</div></div>` : ''}</div>`;
};
const FILT = { all: () => true, in: t => (t.type === 'in' || (t.type === 'transfer' && t.amount > 0)) && t.status !== 'declined', out: t => (t.type === 'out' || t.type === 'card') && t.amount < 0, tr: t => t.type === 'savings' || t.type === 'transfer' || t.type === 'request', card: t => t.type === 'card', rw: t => t.type === 'reward_earn' || t.type === 'reward_redeem' };
SC.activity = () => {
  const f = R.actFilter, list = S.tx.filter(FILT[f]);
  const filters = [['all', 'All'], ['in', 'Incoming'], ['out', 'Outgoing'], ['tr', 'Transfers'], ['card', 'Card'], ['rw', 'Rewards']];
  let h = '', last = '';
  list.slice(0, 80).forEach(t => { const d = dayLabel(t.ts); if (d !== last) { if (last) h += '</div>'; h += `<div class="day">${d}</div><div class="list">`; last = d; } h += TransactionRow(t); }); if (last) h += '</div>';
  return `<div class="screen">${header()}<h1 style="margin-bottom:12px">Activity</h1><div class="seg"><button aria-pressed="${R.actView === 'list'}" data-act="actView" data-t="list">Transactions</button><button aria-pressed="${R.actView === 'insights'}" data-act="actView" data-t="insights">Insights</button></div>
  ${R.actView === 'insights' ? insights() : `<div class="chips" style="margin-top:14px">${filters.map(([k, l]) => `<button class="chip" aria-pressed="${f === k}" data-act="filter" data-k="${k}">${l}</button>`).join('')}</div>${list.length ? h : `<div class="empty">${mas(stage(), 'thinking', false)}<h3>Nothing here yet</h3><p class="muted small">Transactions that match this filter will show up here.</p></div>`}`}</div>`;
};
function insights() {
  const ser = Store.monthSeries(Date.now(), 6), cat = Store.spendByCategory(Date.now(), R.month), cur = ser[5], prev = ser[4];
  const delta = prev.exp ? Math.round((cur.exp - prev.exp) / prev.exp * 100) : 0;
  const mlab = new Date(Store.monthStart(Date.now(), R.month)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  return `<div class="col" style="margin-top:14px;gap:14px"><div class="card col"><div class="row between"><h3>Spending by category</h3><div class="row" style="gap:6px"><button class="iconbtn" style="width:32px;height:32px;border-radius:10px" data-act="month" data-d="-1" aria-label="Previous month">${ic('back')}</button><button class="iconbtn" style="width:32px;height:32px;border-radius:10px" data-act="month" data-d="1" ${R.month >= 0 ? 'disabled style="opacity:.4;width:32px;height:32px;border-radius:10px"' : ''} aria-label="Next month">${ic('chev')}</button></div></div><div class="small muted">${mlab} · ${E(cat.reduce((a, c) => a + c.v, 0))} spent${R.month === 0 && prev.exp ? ` · ${delta > 0 ? '+' : ''}${delta}% vs last month` : ''}</div>${catBars(cat)}</div>
  <div class="card col"><h3>Income and expenses</h3>${groupedBars(ser)}</div>
  <div class="card col"><div class="row between"><h3>Savings growth</h3><b class="num" style="color:var(--accent)">${mon(Store.savingsTotal(S))}</b></div>${areaLine(ser, 'balance', v => E(v))}</div>
  <div class="card col"><div class="row between"><h3>Points earned</h3><span class="small muted">${S.pts.life.toLocaleString('en-IE')} lifetime</span></div>${simpleBars(ser, 'pts', v => v + ' pts')}</div></div>`;
}
SC.profile = () => {
  const L = lvl();
  return `<div class="screen">${header()}<div class="col" style="align-items:center;text-align:center;gap:6px;margin:6px 0 20px"><div class="avatar" style="width:76px;height:76px;font-size:26px">${initials(S.user.name)}</div><h1>${esc(S.user.name)}</h1><div class="muted small">${esc(S.user.memberId)}</div><div class="row" style="gap:6px"><span class="pill">${L.name} member</span><span class="pill good">Demo account</span></div></div>
  <div class="list">${setRow('user', 'Personal details', 'Demo information', undefined, 'data-act="open" data-to="details"')}${setRow('card', 'Accounts and preferences', 'Default payment, balances', undefined, 'data-act="open" data-to="prefs"')}${setRow('card', 'Card management', S.cards.filter(c => c.status !== 'closed').length + ' cards', undefined, 'data-act="tab" data-t="cards"')}${setRow('bell', 'Notifications', 'Choose what you hear about', undefined, 'data-act="open" data-to="notifprefs"')}</div>
  <div class="list" style="margin-top:14px">${setRow('shield', 'Security', 'Sign-in and device lock', undefined, 'data-act="open" data-to="security"')}${setRow('lock', 'Privacy', 'Data and sharing', undefined, 'data-act="open" data-to="privacy"')}${setRow(S.settings.theme === 'dark' ? 'moon' : 'sun', 'Appearance', { system: 'Follows your device', light: 'Light', dark: 'Dark' }[S.settings.theme], undefined, 'data-act="open" data-to="appearance"')}${setRow('sound', 'Sound and motion', S.settings.sound ? 'Sound on' : 'Sound off', undefined, 'data-act="open" data-to="sound"')}</div>
  <div class="list" style="margin-top:14px">${setRow('help', 'Help and support', 'FAQ and contact', undefined, 'data-act="open" data-to="help"')}${setRow('info', 'About PACE', 'Version 1.0 · Demo', undefined, 'data-act="open" data-to="about"')}</div>
  <button class="btn danger block" style="margin-top:18px" data-act="sheet" data-s="resetDemo">Reset demo data</button></div>`;
};
SC.notifs = () => `<div class="screen">${back('Back')}<div class="title-row"><h1>Notifications</h1><button class="link" data-act="readAll">Mark all read</button></div>${S.notifs.length ? `<div class="list">${S.notifs.map(NotificationItem).join('')}</div>` : `<div class="empty">${mas(stage(), 'sleeping')}<h3>All quiet</h3><p class="muted small">New activity shows up here.</p></div>`}</div>`;
const sub = (title, inner) => `<div class="screen">${back('Profile')}<h1 style="margin-bottom:16px">${title}</h1>${inner}</div>`;
SC.details = () => sub('Personal details', `<div class="card"><div class="kv"><span>Name</span><span>${esc(S.user.name)}</span></div><div class="kv"><span>Email</span><span>${esc(S.user.email)}</span></div><div class="kv"><span>Phone</span><span>${esc(S.user.phone)}</span></div><div class="kv"><span>City</span><span>${esc(S.user.city)}</span></div><div class="kv"><span>Member ID</span><span>${esc(S.user.memberId)}</span></div></div><p class="small faint" style="margin-top:12px">All details are fictional demo data. PACE never asks for real personal information in this version.</p>`);
SC.prefs = () => sub('Accounts and preferences', `<div class="list">${setRow('eye', 'Hide balances', 'Show dots instead of amounts', switchEl(S.settings.hideBalances, 'setting', 'data-k="hideBalances"'), '')}${setRow('card', 'Default card', esc((S.cards.find(c => c.def) || {}).name || 'None'), undefined, 'data-act="tab" data-t="cards"')}${setRow('target', 'Main savings target', mon(S.accounts.sav.target), undefined, 'data-act="sheet" data-s="target"')}${setRow('info', 'Currency', 'Euro (EUR)', '', '')}</div>`);
SC.notifprefs = () => sub('Notifications', `<div class="list">${[['payments', 'Payments and money received', 'bell'], ['rewards', 'Rewards and levels', 'gift'], ['savings', 'Savings milestones', 'flag'], ['weekly', 'Weekly summary', 'pulse']].map(([k, t, i]) => setRow(i, t, '', switchEl(S.settings.notif[k], 'setting', `data-k="notif.${k}"`), '')).join('')}</div>`);
SC.security = () => sub('Security', `<div class="list">${setRow('lock', 'Face or fingerprint', 'Unlock PACE with your device', switchEl(S.settings.security.biometric, 'setting', 'data-k="security.biometric"'), '')}${setRow('shield', 'Two-step sign in', 'Extra check on new devices', switchEl(S.settings.security.twoStep, 'setting', 'data-k="security.twoStep"'), '')}${setRow('lock', 'Lock when leaving the app', '', switchEl(S.settings.security.lockOnExit, 'setting', 'data-k="security.lockOnExit"'), '')}</div><p class="small faint" style="margin-top:12px">These switches are part of the demo. Real security is provided by the banking partner when PACE connects to a regulated provider. PACE will never ask you for your password or full card number.</p>`);
SC.privacy = () => sub('Privacy', `<div class="list">${setRow('pulse', 'Share usage analytics', 'Help improve PACE', switchEl(S.settings.privacy.analytics, 'setting', 'data-k="privacy.analytics"'), '')}${setRow('gift', 'Personalised offers', '', switchEl(S.settings.privacy.personalised, 'setting', 'data-k="privacy.personalised"'), '')}${setRow('user', 'Find me by phone number', '', switchEl(S.settings.privacy.shareContacts, 'setting', 'data-k="privacy.shareContacts"'), '')}</div><p class="small faint" style="margin-top:12px">Everything in this demo is stored only on this device, in your browser.</p>`);
SC.appearance = () => sub('Appearance', `<div class="seg3">${[['system', 'System', 'settings'], ['light', 'Light', 'sun'], ['dark', 'Dark', 'moon']].map(([k, t, i]) => `<button class="opt" style="flex-direction:column;padding:16px 8px" aria-pressed="${S.settings.theme === k}" data-act="theme" data-k="${k}"><div class="ib">${ic(i)}</div><b>${t}</b></button>`).join('')}</div>`);
SC.sound = () => sub('Sound and motion', `<div class="list">${setRow('sound', 'Sound effects', 'Soft tones for payments and rewards', switchEl(S.settings.sound, 'setting', 'data-k="sound"'), '')}${setRow('wave', 'Animations', 'Confetti and Pip celebrations', switchEl(S.settings.motion, 'setting', 'data-k="motion"'), '')}</div>`);
const FAQ = [['Is this real money?', 'No. PACE is a simulated bank. Balances, payments and cards are demo data stored on your device. Nothing moves money anywhere.'], ['What are points?', 'Points are a separate rewards balance. They are never euros and never mix with your Checking or Savings balances.'], ['How do I get points?', 'Eligible card spending, savings milestones, completed goals, weekly challenges and a small daily bonus. Payments to friends and transfers between your own accounts do not earn spending points.'], ['What is the Long-term Vault?', 'An optional savings goal that locks money until the target is reached. You confirm the commitment before depositing.'], ['How does Pip grow?', 'Pip evolves through five stages as your total savings pass 5, 10, 25 and 50 hundred euros thresholds shown on the Savings page.'], ['Why was my payment declined?', 'A frozen card, a card limit, a switched-off online setting or too little money in Checking. The activity entry says which.']];
SC.help = () => sub('Help and support', `<div class="list">${FAQ.map((f, i) => `<div class="setrow" role="button" tabindex="0" data-act="faq" data-i="${i}"><div class="grow"><div style="font-weight:650">${f[0]}</div>${R.faq === i ? `<p class="small muted" style="margin-top:6px">${f[1]}</p>` : ''}</div>${ic(R.faq === i ? 'close' : 'plus')}</div>`).join('')}</div><button class="btn soft block" style="margin-top:14px" data-act="support">Contact support (demo)</button>`);
SC.about = () => sub('About PACE', `<div class="card col" style="align-items:center;text-align:center"><div style="width:84px">${LOGO()}</div><h2>PACE</h2><div class="small faint" style="letter-spacing:.18em;font-weight:700">YOUR MONEY. YOUR PROGRESS.</div>${mas(stage(), 'greeting', true)}<p class="small muted">PACE is a gamified digital banking concept. It runs in a simulated financial environment: no real money moves and no real card or bank credentials are collected. To go live, the data layer connects to a regulated banking and payments provider through authorised APIs.</p><div class="small faint">Version 1.0 · Pip stage ${stage()}</div></div>`);

/* ---------- routing / render ---------- */
const TABS = [['home', 'Home', 'home'], ['cards', 'Cards', 'card'], ['rewards', 'Rewards', 'star'], ['activity', 'Activity', 'list'], ['profile', 'Profile', 'user']];
function NavigationBar() { return `<div class="brand">${LOGO()}PACE</div>` + TABS.map(([k, l, i]) => `<button data-act="tab" data-t="${k}" ${R.tab === k && !R.stack.length ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></button>`).join(''); }
function render() {
  const v = $('#view'), top = R.stack[R.stack.length - 1], keep = v.scrollTop;
  const fn = top ? SC[top] : SC[R.tab];
  v.innerHTML = fn();
  $('#nav').innerHTML = NavigationBar();
  mountMascots(v);
  document.documentElement.dataset.theme = S.settings.theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : S.settings.theme;
  $('meta[name=theme-color]').content = document.documentElement.dataset.theme === 'dark' ? '#0F0C17' : '#F6F4F9';
  document.body.classList.toggle('noanim', !S.settings.motion);
  if (renderKeep) { v.scrollTop = keep; renderKeep = false; }
  if (SH.name) { /* keep open sheet */ }
}
let renderKeep = false;
const go = n => { R.stack.push(n); $('#view').scrollTop = 0; render(); snd('tap'); };
const goTab = t => { R.tab = t; R.stack = []; $('#view').scrollTop = 0; render(); snd('tap'); };

/* ---------- sheets ---------- */
const SH = { name: null, data: null };
function openSheet(name, data = {}) { SH.name = name; SH.data = data; const s = $('#sheet'); s.innerHTML = '<div class="grab"></div><div class="body">' + SHEETS[name](data) + '</div>'; $('#scrim').classList.add('on'); s.classList.add('on'); mountMascots(s); if (name === 'deposit') lockBox(); const f = $('input', s); if (f && !data.noFocus) setTimeout(() => f.focus({ preventScroll: true }), 350); snd('tap'); }
function closeSheet() { SH.name = null; $('#sheet').classList.remove('on'); $('#scrim').classList.remove('on'); }
const fld = (id, label, attrs = '', extra = '') => `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" ${attrs}>${extra}</div>`;
const goalSelect = (id, sel, filter) => `<div class="field"><label for="${id}">Savings goal</label><select class="input" id="${id}">${S.goals.filter(filter || (() => true)).map(g => `<option value="${g.id}" ${g.id === sel ? 'selected' : ''}>${esc(g.name)} · ${E(g.saved)}${g.locked ? ' · locked' : ''}</option>`).join('')}</select></div>`;
const errBox = '<div id="err"></div>';
const setErr = m => { const e = $('#err'); if (e) e.innerHTML = m ? `<div class="err" role="alert">${esc(m)}</div>` : ''; };
const SHEETS = {
  addMoney: () => `<h2 style="margin:6px 0 4px">Add money</h2><p class="muted small" style="margin-bottom:14px">Simulated top-up from a linked bank. No real money moves.</p>${fld('f-amt', 'Amount (EUR)', 'inputmode="decimal" placeholder="100.00" autocomplete="off"')}<div class="chips">${[20, 50, 100, 250].map(v => `<button class="chip" data-act="fill" data-v="${v}">€${v}</button>`).join('')}</div>${errBox}<button class="btn block" style="margin-top:8px" data-act="doAdd">Add to Checking</button>`,
  deposit: d => `<h2 style="margin:6px 0 4px">Deposit to savings</h2><p class="muted small" style="margin-bottom:14px">From Checking · ${mon(S.accounts.chk.bal)} available</p>${goalSelect('f-goal', d.goal || 'g1')}${fld('f-amt', 'Amount (EUR)', 'inputmode="decimal" placeholder="50.00" autocomplete="off"')}<div id="lockbox"></div><div class="chips">${[25, 50, 100, 250].map(v => `<button class="chip" data-act="fill" data-v="${v}">€${v}</button>`).join('')}</div>${errBox}<button class="btn block" style="margin-top:8px" data-act="doDeposit">Deposit</button>`,
  withdraw: d => `<h2 style="margin:6px 0 4px">Withdraw to Checking</h2><p class="muted small" style="margin-bottom:14px">Locked commitments can be withdrawn once they reach their target.</p>${goalSelect('f-goal', d.goal || 'g1', g => Store.isUnlocked(g))}${fld('f-amt', 'Amount (EUR)', 'inputmode="decimal" placeholder="50.00" autocomplete="off"')}${errBox}<button class="btn block" style="margin-top:8px" data-act="doWithdraw">Withdraw</button>`,
  newGoal: () => `<h2 style="margin:6px 0 14px">New savings goal</h2>${fld('f-name', 'Name', 'maxlength="28" placeholder="New car, Travel, Emergency fund" autocomplete="off"')}${fld('f-amt', 'Target (EUR)', 'inputmode="decimal" placeholder="2000" autocomplete="off"')}<label class="row" style="gap:10px;margin:4px 0 12px"><input type="checkbox" id="f-lock" style="width:20px;height:20px;accent-color:var(--accent)"><span><b>Make it a locked commitment</b><div class="small faint">Optional. Money stays locked until the target is reached.</div></span></label>${errBox}<button class="btn block" data-act="doNewGoal">Create goal</button>`,
  goal: d => { const g = Store.goalById(d.id); if (!g) return ''; const p = Math.min(100, g.saved / g.target * 100); const hist = S.tx.filter(t => t.goalId === g.id).slice(0, 5); return `<div class="row between" style="margin:6px 0 10px"><h2>${esc(g.name)}</h2>${g.locked && g.saved < g.target ? '<span class="pill warn">Locked commitment</span>' : g.completedAt ? '<span class="pill good">Completed</span>' : ''}</div><div class="card col"><div class="row between"><b class="num" style="font-size:26px">${mon(g.saved)}</b><span class="muted">of ${mon(g.target)}</span></div><div class="bar thick"><i style="width:${p}%"></i></div><div class="small muted">${p.toFixed(0)}% · ${ETA(g)}</div></div>
  ${g.locked ? `<p class="small muted" style="margin:12px 0">${g.saved < g.target ? 'This is an optional commitment. Money you deposit stays locked until the balance reaches ' + mon(g.target) + '.' : 'Target reached. The lock is open and you can withdraw.'}</p>` : ''}
  <div class="row" style="gap:8px;margin:14px 0"><button class="btn grow" data-act="sheet" data-s="deposit" data-goal="${g.id}">Deposit</button><button class="btn ghost grow" data-act="sheet" data-s="withdraw" data-goal="${g.id}" ${Store.isUnlocked(g) ? '' : 'disabled'}>Withdraw</button></div>
  ${hist.length ? `<div class="list">${hist.map(t => TransactionRow(t)).join('')}</div>` : ''}<div class="row" style="gap:8px;margin-top:14px"><button class="btn soft grow" data-act="sheet" data-s="editGoal" data-id="${g.id}">${ic('edit')}Edit</button>${g.primary ? '' : `<button class="btn danger grow" data-act="delGoal" data-id="${g.id}">${ic('trash')}Delete</button>`}</div>`; },
  editGoal: d => { const g = Store.goalById(d.id); return `<h2 style="margin:6px 0 14px">Edit goal</h2>${fld('f-name', 'Name', `maxlength="28" value="${esc(g.name)}"`)}${fld('f-amt', 'Target (EUR)', `inputmode="decimal" value="${(g.target / 100).toFixed(0)}"`)}${errBox}<button class="btn block" data-act="doEditGoal" data-id="${g.id}">Save</button>`; },
  target: () => `<h2 style="margin:6px 0 14px">Main savings target</h2>${fld('f-amt', 'Target (EUR)', `inputmode="decimal" value="${(S.accounts.sav.target / 100).toFixed(0)}"`)}${errBox}<button class="btn block" data-act="doTarget">Save</button>`,
  rename: d => `<h2 style="margin:6px 0 14px">Rename card</h2>${fld('f-name', 'Card name', `maxlength="24" value="${esc(Store.cardById(d.id).name)}"`)}${errBox}<button class="btn block" data-act="doRename" data-id="${d.id}">Save</button>`,
  design: d => `<h2 style="margin:6px 0 14px">Card appearance</h2><div class="cards-scroll" style="padding-top:2px">${Store.DESIGNS.map(k => pcard(Object.assign({}, Store.cardById(d.id), { design: k, status: 'active' }), Store.cardById(d.id).design === k).replace('data-act="selCard"', `data-act="pickDesign" data-k="${k}" data-id="${d.id}"`)).join('')}</div>`,
  limits: d => { const c = Store.cardById(d.id); return `<h2 style="margin:6px 0 4px">Spending limits</h2><p class="muted small" style="margin-bottom:14px">${esc(c.name)} ••${c.last4}</p>${fld('f-tx', 'Per payment (EUR)', `inputmode="decimal" value="${c.limits.perTx / 100}"`)}${fld('f-mo', 'Per month (EUR)', `inputmode="decimal" value="${c.limits.monthly / 100}"`)}${errBox}<button class="btn block" data-act="doLimits" data-id="${d.id}">Save limits</button>`; },
  addCard: () => `<h2 style="margin:6px 0 14px">Add a card</h2>${fld('f-name', 'Card name', 'maxlength="24" placeholder="Custom Card" autocomplete="off"')}<div class="seg" style="margin-bottom:12px"><button aria-pressed="true" data-act="kindPick" data-k="virtual" id="kv">Virtual</button><button aria-pressed="false" data-act="kindPick" data-k="physical" id="kp">Physical</button></div><div class="field"><label>Design</label><div class="chips">${Store.DESIGNS.map((k, i) => `<button class="chip" data-act="designPick" data-k="${k}" aria-pressed="${i === 0}">${k}</button>`).join('')}</div></div>${errBox}<button class="btn block" data-act="doAddCard">Create card</button>`,
  reward: d => { const r = Store.CATALOG.find(x => x.id === d.id), used = S.stock[r.id] || 0, locked = Store.levelIndex(lvl().id) < r.min; return `<div class="col" style="align-items:center;text-align:center;gap:8px"><div class="rw" style="width:100%;pointer-events:none"><div class="art" style="aspect-ratio:2/1">${ic(ART[r.art] || 'gift')}</div></div><span class="faint small" style="font-weight:700">${r.kind}</span><h2>${esc(r.name)}</h2><p class="muted">${esc(r.desc)}</p>${PTS(r.pts)}<div class="small faint">${r.stock - used} available · You have ${S.pts.avail.toLocaleString('en-IE')} pts${locked ? ' · Unlocks at ' + Store.LEVELS[r.min].name : ''}</div>${errBox}<button class="btn block" data-act="doRedeem" data-id="${r.id}" ${S.pts.avail < r.pts || locked || r.stock - used <= 0 ? 'disabled' : ''}>Redeem for ${r.pts.toLocaleString('en-IE')} points</button></div>`; },
  redeemed: d => `<div class="col" style="align-items:center;text-align:center;gap:8px">${mas(stage(), 'celebrating', false)}<h2>It is yours</h2><p class="muted">${esc(d.name)}</p><div class="card" style="width:100%"><div class="small faint">Your code</div><b class="num" style="font-size:24px;letter-spacing:.08em">${d.code}</b></div><p class="small faint">Demo code. ${d.pts.toLocaleString('en-IE')} points were deducted.</p><button class="btn block" data-act="closeSheet">Done</button></div>`,
  rules: () => `<h2 style="margin:6px 0 4px">Points rules</h2><p class="muted small" style="margin-bottom:14px">Demo values you can change. They apply to new activity.</p>${[['ptsPerBlock', 'Points per spending block', 1], ['blockCents', 'Spending block (EUR)', 100], ['milestoneBonus', 'Savings milestone bonus', 1], ['goalBonus', 'Goal completed bonus', 1], ['challengeBonus', 'Weekly challenge bonus', 1], ['dailyBonus', 'Daily bonus', 1], ['dailyCap', 'Spending points cap per day', 1]].map(([k, l, d]) => fld('r-' + k, l, `inputmode="numeric" value="${S.rules[k] / d}"`)).join('')}${errBox}<button class="btn block" data-act="doRules">Save rules</button><button class="btn ghost block" style="margin-top:8px" data-act="defRules">Restore defaults</button>`,
  resetDemo: () => `<h2 style="margin:6px 0 8px">Reset demo data?</h2><p class="muted" style="margin-bottom:16px">This puts every balance, card, goal and point back to the starting demo values.</p><div class="row" style="gap:8px"><button class="btn ghost grow" data-act="closeSheet">Cancel</button><button class="btn danger grow" data-act="doReset">Reset</button></div>`,
  tx: d => { const t = S.tx.find(x => x.id === d.id); if (!t) return ''; const pts = t.type === 'reward_earn' || t.type === 'reward_redeem'; const amt = pts ? `${t.pts > 0 ? '+' : ''}${t.pts} points` : t.status === 'declined' ? E(t.attempted || 0, { abs: true }) : t.moved ? E(t.moved) : E(t.amount); return `<div class="col" style="align-items:center;gap:4px;margin:6px 0 14px"><div class="tx" style="width:auto;padding:0"><div class="ib" style="width:56px;height:56px;border-radius:18px">${ic(catIcon(t.cat))}</div></div><h2>${esc(t.title)}</h2><div class="num" style="font-size:32px;font-weight:800;${t.amount > 0 && !pts ? 'color:var(--good)' : ''}">${pts ? amt : t.amount > 0 && !t.moved ? '+' + (S.settings.hideBalances ? '€ ••••' : amt) : (S.settings.hideBalances ? '€ ••••' : amt)}</div><span class="pill ${t.status === 'completed' ? 'good' : t.status === 'declined' ? 'bad' : 'warn'}">${t.status[0].toUpperCase() + t.status.slice(1)}</span></div><div class="card"><div class="kv"><span>Date</span><span>${new Date(t.ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div><div class="kv"><span>Category</span><span>${esc(t.cat)}</span></div><div class="kv"><span>Payment method</span><span>${esc(t.method)}</span></div><div class="kv"><span>Account</span><span>${t.acct === 'pts' ? 'Rewards points' : t.acct === 'sav' ? 'PACE Savings' : 'Checking Account'}</span></div><div class="kv"><span>Reference</span><span>${t.ref}</span></div>${t.sub && t.status === 'declined' ? `<div class="kv"><span>Reason</span><span>${esc(t.sub)}</span></div>` : ''}${t.pointsEarned ? `<div class="kv"><span>Points earned</span><span>+${t.pointsEarned}</span></div>` : ''}</div>${t.status === 'pending' ? `<button class="btn block" style="margin-top:14px" data-act="settle" data-id="${t.id}">Simulate: they paid</button>` : ''}`; },
  support: () => `<div class="col" style="align-items:center;text-align:center;gap:8px">${mas(stage(), 'greeting', false)}<h2>Support is a demo here</h2><p class="muted">In the live product this opens a chat with a real person. For now, Pip says hi.</p><button class="btn block" data-act="closeSheet">Okay</button></div>`
};

/* ---------- payment flow ---------- */
const F = { on: false, step: 1, type: null, rcpt: null, dir: 'toGoal', rcpt2: null, amt: '', src: 'chk', note: '', busy: false, res: null, steps: [] };
const PTYPES = [['contact', 'Pay a contact', 'Send money to a friend', 'send'], ['merchant', 'Pay a merchant', 'Shops and services', 'bag'], ['online', 'Online payment', 'Pay with a card online', 'cart'], ['card', 'Card payment', 'Pay in store with a card', 'card'], ['transfer', 'Transfer between my accounts', 'Checking and Savings goals', 'swap'], ['request', 'Request money', 'Ask a contact to pay you', 'income']];
const stepsFor = t => t === 'request' ? ['type', 'who', 'amount', 'review'] : t === 'transfer' ? ['type', 'who', 'amount', 'review'] : t === 'contact' ? ['type', 'who', 'amount', 'review'] : ['type', 'who', 'amount', 'source', 'review'];
function openFlow(t) { Object.assign(F, { on: true, type: t || null, step: 1, rcpt: null, dir: 'toGoal', rcpt2: null, amt: '', src: (S.cards.find(c => c.def && c.status === 'active') || {}).id || 'chk', note: '', busy: false, res: null }); F.steps = t ? stepsFor(t) : ['type']; if (t) F.step = 2; $('#flow').classList.add('on'); drawFlow(); snd('tap'); }
function closeFlow() { F.on = false; $('#flow').classList.remove('on'); render(); }
const amtC = () => parseEuro(F.amt || '0');
function recipientOK() { return F.type === 'transfer' ? (F.dir === 'goalToGoal' ? F.rcpt && F.rcpt2 && F.rcpt !== F.rcpt2 : !!F.rcpt) : !!F.rcpt; }
function drawFlow() {
  const el = $('#flow'), cur = F.steps[F.step - 1] || 'type', total = F.steps.length;
  if (F.res) { el.innerHTML = flowResult(); mountMascots(el); return; }
  if (F.busy) { el.innerHTML = `<div class="fb" style="display:grid;place-items:center;text-align:center"><div class="col" style="gap:16px"><div class="spinner"></div><h2>Processing payment</h2><p class="muted small">Simulated, no real money is moving.</p></div></div>`; return; }
  let body = '', foot = '', title = 'New payment';
  if (cur === 'type') { title = 'What would you like to do?'; body = `<div class="col">${PTYPES.map(([k, t, s, i]) => `<button class="opt" data-act="ftype" data-t="${k}"><div class="ib">${ic(i)}</div><div><div style="font-weight:700">${t}</div><div class="small faint">${s}</div></div></button>`).join('')}</div>`; }
  if (cur === 'who') {
    if (F.type === 'transfer') {
      title = 'Move money';
      const dirs = [['toGoal', 'Checking to a goal'], ['fromGoal', 'A goal to Checking'], ['goalToGoal', 'Goal to goal']];
      body = `<div class="chips">${dirs.map(([k, l]) => `<button class="chip" aria-pressed="${F.dir === k}" data-act="fdir" data-k="${k}">${l}</button>`).join('')}</div><div class="day" style="margin-top:6px">${F.dir === 'toGoal' ? 'To which goal?' : 'From which goal?'}</div><div class="col">${S.goals.filter(g => F.dir === 'toGoal' || Store.isUnlocked(g)).map(g => `<button class="opt" aria-pressed="${F.rcpt === g.id}" data-act="fwho" data-id="${g.id}"><div class="ib">${ic(g.locked ? 'lock' : IC[g.icon] ? g.icon : 'flag')}</div><div class="grow"><b>${esc(g.name)}</b><div class="small faint">${E(g.saved)} of ${E(g.target)}${g.locked ? ' · locked commitment' : ''}</div></div></button>`).join('')}</div>${F.dir === 'goalToGoal' ? `<div class="day">To which goal?</div><div class="col">${S.goals.filter(g => g.id !== F.rcpt && (!g.locked || g.committed)).map(g => `<button class="opt" aria-pressed="${F.rcpt2 === g.id}" data-act="fwho2" data-id="${g.id}"><div class="ib">${ic(IC[g.icon] ? g.icon : 'flag')}</div><div class="grow"><b>${esc(g.name)}</b></div></button>`).join('')}</div>` : ''}`;
    } else if (F.type === 'contact' || F.type === 'request') {
      title = F.type === 'request' ? 'Request from' : 'Who are you paying?';
      body = `<div class="col">${Store.CONTACTS.map(c => `<button class="opt" aria-pressed="${F.rcpt === c.id}" data-act="fwho" data-id="${c.id}"><div class="avatar" style="background:hsl(${c.hue} 55% 48%);width:42px;height:42px">${initials(c.name)}</div><b>${c.name}</b></button>`).join('')}</div>`;
    } else {
      title = F.type === 'online' ? 'Which online shop?' : 'Which merchant?';
      body = `<div class="col">${Store.MERCHANTS.filter(m => F.type !== 'online' || m.online).map(m => `<button class="opt" aria-pressed="${F.rcpt === m.id}" data-act="fwho" data-id="${m.id}"><div class="ib">${ic(catIcon(m.cat))}</div><div><b>${m.name}</b><div class="small faint">${m.cat}</div></div></button>`).join('')}</div>`;
    }
    foot = `<button class="btn block" data-act="fnext" ${recipientOK() ? '' : 'disabled'}>Continue</button>`;
  }
  if (cur === 'amount') {
    title = 'How much?'; const a = amtC();
    body = `<div class="amount num" aria-live="polite">€${F.amt || '0'}</div><div class="center small faint" style="text-align:center">${F.type === 'transfer' ? '' : 'Checking balance ' + mon(S.accounts.chk.bal)}</div><div class="keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(k => `<button data-act="key" data-k="${k}" aria-label="${k === 'del' ? 'Delete' : k}">${k === 'del' ? ic('back') : k}</button>`).join('')}</div>`;
    foot = `<button class="btn block" data-act="fnext" ${a > 0 ? '' : 'disabled'}>Continue</button>`;
  }
  if (cur === 'source') {
    title = 'Pay with'; const needCard = F.type === 'online' || F.type === 'card';
    body = `<div class="col">${needCard ? '' : `<button class="opt" aria-pressed="${F.src === 'chk'}" data-act="fsrc" data-id="chk"><div class="ib">${ic('card')}</div><div class="grow"><b>Checking Account</b><div class="small faint">${mon(S.accounts.chk.bal)}</div></div></button>`}${S.cards.filter(c => c.status !== 'closed').map(c => `<button class="opt" aria-pressed="${F.src === c.id}" data-act="fsrc" data-id="${c.id}" ${c.status === 'frozen' ? 'style="opacity:.55"' : ''}><div class="ib">${ic('card')}</div><div class="grow"><b>${esc(c.name)}</b><div class="small faint">••${c.last4}${c.status === 'frozen' ? ' · Frozen' : ' · limit ' + E(c.limits.perTx) + ' per payment'}</div></div>${c.def ? '<span class="pill">Default</span>' : ''}</button>`).join('')}</div>`;
    foot = `<button class="btn block" data-act="fnext" ${F.src === 'chk' && needCard ? 'disabled' : ''}>Continue</button>`;
  }
  if (cur === 'review') {
    title = 'Review'; const a = amtC(), rn = reviewNames(), card = F.src !== 'chk' ? Store.cardById(F.src) : null;
    const m = Store.MERCHANTS.find(x => x.id === F.rcpt); const est = (F.type === 'merchant' || F.type === 'online' || F.type === 'card') && m ? Store.spendPoints(S, a, m.cat, F.type, Date.now(), lvl().mult) : 0;
    body = `<div class="col" style="align-items:center;text-align:center;margin:4px 0 12px"><div class="small faint" style="font-weight:700">${F.type === 'request' ? 'YOU ARE REQUESTING' : 'YOU ARE SENDING'}</div><div class="num" style="font-size:44px;font-weight:800">${E(a)}</div></div>
    <div class="card"><div class="kv"><span>${F.type === 'request' ? 'From' : 'To'}</span><span>${esc(rn.to)}</span></div>${F.type === 'request' ? '' : `<div class="kv"><span>From</span><span>${esc(rn.from || (card ? card.name + ' ••' + card.last4 : 'Checking Account'))}</span></div>`}<div class="kv"><span>Fee</span><span>€0.00</span></div>${est ? `<div class="kv"><span>Points you will earn</span><span>+${est} pts</span></div>` : ''}<div class="kv"><span>Date</span><span>${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span></div></div>
    <div class="field" style="margin-top:14px"><label for="f-note">Note (optional)</label><input class="input" id="f-note" maxlength="60" value="${esc(F.note)}" placeholder="Add a note"></div><p class="small faint">This is a simulated payment. No real money moves.</p><div id="err"></div>`;
    foot = `<button class="btn block" data-act="fconfirm">${F.type === 'request' ? 'Send request' : 'Confirm and pay'}</button>`;
  }
  el.innerHTML = `<div class="fh"><button class="iconbtn" data-act="fback" aria-label="Back">${ic(F.step > 1 ? 'back' : 'close')}</button><b>${title}</b><span style="width:42px"></span></div><div class="steps">${F.steps.map((s, i) => `<i class="${i < F.step ? 'on' : ''}"></i>`).join('')}</div><div class="fb">${body}</div>${foot ? `<div class="ff">${foot}</div>` : ''}`;
}
function reviewNames() {
  if (F.type === 'transfer') { const a = Store.goalById(F.rcpt), b = Store.goalById(F.rcpt2); return F.dir === 'toGoal' ? { to: a.name + ' (Savings)', from: 'Checking Account' } : F.dir === 'fromGoal' ? { to: 'Checking Account', from: a.name + ' (Savings)' } : { to: b.name, from: a.name }; }
  const c = Store.CONTACTS.find(x => x.id === F.rcpt), m = Store.MERCHANTS.find(x => x.id === F.rcpt); return { to: (c || m).name };
}
function flowResult() {
  const r = F.res, ok = r.ok, t = r.tx;
  if (!ok) return `<div class="fb" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;justify-content:center">${mas(stage(), 'disappointed', false)}<h1>Payment not made</h1><p class="muted">${esc(r.error)}</p><p class="small faint">Nothing was taken from your account.</p></div><div class="ff col"><button class="btn block" data-act="fretry">Change payment</button><button class="btn ghost block" data-act="fdone">Close</button></div>`;
  const pts = t && t.pointsEarned;
  return `<div class="fb" style="text-align:center"><svg class="ok-ring" viewBox="0 0 104 104"><circle cx="52" cy="52" r="48"/><path d="M32 54l14 14 27-30"/></svg><h1 style="margin-top:10px">${F.type === 'request' ? 'Request sent' : 'Payment successful'}</h1><div class="num" style="font-size:38px;font-weight:800;margin:4px 0">${E(amtC())}</div><div style="width:120px;margin:-6px auto 4px">${mas(stage(), 'happy', false)}</div>
  <div class="card" style="text-align:left"><div class="kv"><span>${F.type === 'request' ? 'From' : 'To'}</span><span>${esc(reviewNames().to)}</span></div><div class="kv"><span>Date</span><span>${new Date(t.ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div><div class="kv"><span>Reference</span><span>${t.ref}</span></div><div class="kv"><span>Checking balance</span><span>${E(S.accounts.chk.bal)}</span></div>${F.type === 'transfer' && F.dir !== 'fromGoal' ? `<div class="kv"><span>Savings total</span><span>${E(Store.savingsTotal(S))}</span></div>` : ''}${pts ? `<div class="kv"><span>Points earned</span><span>+${pts} pts</span></div>` : ''}</div></div><div class="ff col"><button class="btn block" data-act="fdone">Done</button><button class="btn ghost block" data-act="fview" data-id="${t.id}">View in activity</button></div>`;
}
function runFlow() {
  F.note = ($('#f-note') || {}).value || F.note; F.busy = true; drawFlow();
  setTimeout(() => {
    const a = amtC(); let res;
    if (F.type === 'request') res = Store.requestMoney({ from: F.rcpt, amount: a, note: F.note });
    else if (F.type === 'transfer') res = F.dir === 'toGoal' ? Store.toGoal(F.rcpt, a, { consent: true }) : F.dir === 'fromGoal' ? Store.fromGoal(F.rcpt, a) : Store.moveBetweenGoals(F.rcpt, F.rcpt2, a);
    else res = Store.pay({ type: F.type, recipient: F.rcpt, amount: a, source: F.type === 'contact' ? 'chk' : F.src, note: F.note });
    S = Store.get(); F.busy = false; F.res = res; if (res.tx && !res.tx.ts) res.tx.ts = Date.now();
    drawFlow(); (res.events || []).forEach(e => { if (e.type === 'error') snd('err'); else if (e.type === 'paid' || e.type === 'saved' || e.type === 'requested' || e.type === 'withdrawn') snd('ok'); });
    if (res.ok) { confetti(40); afterOpDeferred(res); } else render();
  }, 1100);
}
let deferred = [];
function afterOpDeferred(res) { deferred.push(res); }

/* ---------- actions ---------- */
const val = id => ($('#' + id) || {}).value;
const A = {
  tab: el => goTab(el.dataset.t), open: el => go(el.dataset.to), back: () => { R.stack.pop(); render(); snd('tap'); },
  flow: el => openFlow(el.dataset.t), sheet: el => openSheet(el.dataset.s, { id: el.dataset.id, goal: el.dataset.goal }),
  closeSheet: () => closeSheet(), closeCele: () => { $('#cele').classList.remove('on'); setTimeout(runCele, 250); },
  tx: el => openSheet('tx', { id: el.dataset.id, noFocus: true }), goal: el => openSheet('goal', { id: el.dataset.id, noFocus: true }),
  tapPip: () => { const m = $('.mascot[data-live]'); if (!m || !m._p) return; const list = ['greeting', 'happy', 'thinking', 'training', 'celebrating']; const a = list[(m._n = ((m._n || 0) + 1)) % list.length]; pipPlay(a); say(SAYS[Math.floor(Math.random() * SAYS.length)]); snd('tap'); },
  collect: () => { goTab('rewards'); const r = Store.dailyCheckin(); if (r.ok) afterOp(r); },
  daily: () => afterOp(Store.dailyCheckin()), claim: el => afterOp(Store.claimChallenge(el.dataset.id)),
  cardsTab: el => { R.cardsTab = el.dataset.t; render(); snd('tap'); }, selCard: el => { R.selCard = el.dataset.id; const sc = $('#cs'), x = sc ? sc.scrollLeft : 0; renderKeep = true; render(); const n = $('#cs'); if (n) n.scrollLeft = x; snd('tap'); },
  freeze: el => { const r = Store.freeze(el.dataset.id); afterOp(r); toast(r.status === 'frozen' ? 'Card frozen' : 'Card unfrozen', r.status === 'frozen' ? 'snow' : 'check'); },
  reveal: el => { R.reveal[el.dataset.id] = !R.reveal[el.dataset.id]; renderKeep = true; render(); snd('tog'); },
  cardTog: el => { Store.cardPatch(el.dataset.id, { [el.dataset.k]: el.getAttribute('aria-checked') !== 'true' }); S = Store.get(); renderKeep = true; render(); snd('tog'); },
  setDef: el => { afterOp(Store.setDefault(el.dataset.id)); toast('Default card updated'); },
  closeCard: el => { const r = Store.closeCard(el.dataset.id); afterOp(r); if (r.ok) toast('Card closed', 'check'); },
  pickDesign: el => { Store.cardPatch(el.dataset.id, { design: el.dataset.k }); closeSheet(); afterOp({ events: [{ type: 'happy' }] }); },
  rwFilter: el => { R.rwFilter = el.dataset.k; renderKeep = true; render(); }, reward: el => openSheet('reward', { id: el.dataset.id, noFocus: true }),
  filter: el => { R.actFilter = el.dataset.k; renderKeep = true; render(); }, actView: el => { R.actView = el.dataset.t; render(); },
  month: el => { R.month = Math.min(0, R.month + (+el.dataset.d)); renderKeep = true; render(); },
  readNotif: el => { Store.markRead(el.dataset.id); renderKeep = true; render(); }, readAll: () => { Store.markRead('all'); renderKeep = true; render(); },
  setting: el => { Store.setting(el.dataset.k, el.getAttribute('aria-checked') !== 'true'); S = Store.get(); renderKeep = true; render(); snd('tog'); },
  theme: el => { Store.setting('theme', el.dataset.k); render(); },
  faq: el => { R.faq = R.faq === +el.dataset.i ? -1 : +el.dataset.i; renderKeep = true; render(); }, support: () => openSheet('support', { noFocus: true }),
  fill: el => { const i = $('#f-amt'); i.value = el.dataset.v; i.dispatchEvent(new Event('input')); },
  settle: el => { const r = Store.settleRequest(el.dataset.id); closeSheet(); afterOp(r); },
  doAdd: () => { const r = Store.addMoney({ amount: parseEuro(val('f-amt')) }); if (!r.ok) return setErr(r.error), snd('err'); closeSheet(); afterOp(r); toast('Added to Checking'); },
  doDeposit: () => { const g = Store.goalById(val('f-goal')); const r = Store.toGoal(g.id, parseEuro(val('f-amt')), { consent: !!($('#f-consent') || {}).checked }); if (!r.ok) return setErr(r.error), snd('err'); closeSheet(); afterOp(r); toast('Deposited to ' + g.name, 'save'); },
  doWithdraw: () => { const r = Store.fromGoal(val('f-goal'), parseEuro(val('f-amt'))); if (!r.ok) return setErr(r.error), snd('err'); closeSheet(); afterOp(r); toast('Moved to Checking'); },
  doNewGoal: () => { const r = Store.createGoal({ name: val('f-name'), target: parseEuro(val('f-amt')), locked: $('#f-lock').checked }); if (!r.ok) return setErr(r.error), snd('err'); closeSheet(); afterOp(r); toast('Goal created', 'flag'); },
  doEditGoal: el => { const r = Store.editGoal(el.dataset.id, { name: val('f-name'), target: parseEuro(val('f-amt')) }); if (!r.ok) return setErr(r.error); closeSheet(); afterOp(r); },
  delGoal: el => { const r = Store.deleteGoal(el.dataset.id); if (!r.ok) { toast(r.error, 'info'); snd('err'); return; } closeSheet(); afterOp(r); toast('Goal deleted'); },
  doTarget: () => { const r = Store.setSavingsTarget(parseEuro(val('f-amt'))); if (!r.ok) return setErr(r.error); closeSheet(); afterOp(r); },
  doRename: el => { const r = Store.cardPatch(el.dataset.id, { name: val('f-name') }); if (!r.ok) return setErr(r.error); closeSheet(); afterOp(r); },
  doLimits: el => { const r = Store.setLimits(el.dataset.id, parseEuro(val('f-tx')), parseEuro(val('f-mo'))); if (!r.ok) return setErr(r.error), snd('err'); closeSheet(); afterOp(r); toast('Limits saved'); },
  kindPick: el => { $$('#sheet .seg button').forEach(b => b.setAttribute('aria-pressed', b === el)); }, designPick: el => { $$('#sheet .chip[data-act=designPick]').forEach(b => b.setAttribute('aria-pressed', b === el)); },
  doAddCard: () => { const kind = $('#kp').getAttribute('aria-pressed') === 'true' ? 'physical' : 'virtual', d = $('#sheet .chip[aria-pressed=true]').dataset.k; const r = Store.addCard({ name: val('f-name'), design: d, kind }); if (!r.ok) return setErr(r.error); R.selCard = r.card.id; closeSheet(); afterOp(r); toast('Card created'); },
  doRedeem: el => { const r = Store.redeem(el.dataset.id); if (!r.ok) return setErr(r.error), snd('err'); snd('up'); confetti(70); S = Store.get(); render(); openSheet('redeemed', { name: r.redemption.name, code: r.redemption.code, pts: r.redemption.pts, noFocus: true }); },
  doRules: () => { const m = { ptsPerBlock: 1, blockCents: 100, milestoneBonus: 1, goalBonus: 1, challengeBonus: 1, dailyBonus: 1, dailyCap: 1 }; for (const k in m) { const v = Math.round(parseFloat(String(val('r-' + k)).replace(',', '.')) * m[k]); const r = Store.setRule(k, k === 'blockCents' ? Math.max(100, v) : v); if (!r.ok) return setErr(r.error); } closeSheet(); afterOp({ events: [] }); toast('Rules saved'); },
  defRules: () => { Object.assign(S.rules, Store.DEFAULT_RULES); Store.save(); closeSheet(); render(); toast('Defaults restored'); },
  doReset: () => { S = Store.reset(); R.stack = []; R.tab = 'home'; closeSheet(); render(); toast('Demo data reset'); },
  /* payment flow */
  ftype: el => { F.type = el.dataset.t; F.steps = stepsFor(F.type); F.step = 2; F.rcpt = null; if (F.type === 'online' || F.type === 'card') { const c = S.cards.find(x => x.def && x.status === 'active') || S.cards.find(x => x.status === 'active'); F.src = c ? c.id : 'chk'; } else F.src = 'chk'; drawFlow(); snd('tap'); },
  fdir: el => { F.dir = el.dataset.k; F.rcpt = null; F.rcpt2 = null; drawFlow(); }, fwho: el => { F.rcpt = el.dataset.id; if (F.rcpt === F.rcpt2) F.rcpt2 = null; drawFlow(); snd('tap'); }, fwho2: el => { F.rcpt2 = el.dataset.id; drawFlow(); snd('tap'); },
  fsrc: el => { F.src = el.dataset.id; drawFlow(); snd('tap'); }, fnext: () => { F.step++; drawFlow(); snd('tap'); },
  fback: () => { if (F.step > 1 && !(F.steps.length && F.step === 2 && F.type && F.steps[0] === 'type' && false)) { F.step--; if (F.step < 1) F.step = 1; drawFlow(); } else closeFlow(); },
  key: el => { const k = el.dataset.k; if (k === 'del') F.amt = F.amt.slice(0, -1); else if (k === '.') { if (!F.amt.includes('.')) F.amt = (F.amt || '0') + '.'; } else if (!(F.amt.includes('.') && F.amt.split('.')[1].length >= 2) && F.amt.replace('.', '').length < 8) F.amt = (F.amt === '0' ? '' : F.amt) + k; drawFlow(); snd('tap'); },
  fconfirm: () => runFlow(), fdone: () => { const r = F.res; closeFlow(); if (r) { const rs = deferred.splice(0); rs.forEach(x => afterOp(x, { quiet: false })); } }, fretry: () => { F.res = null; F.step = F.steps.indexOf('review') + 1; drawFlow(); },
  fview: el => { const id = el.dataset.id; A.fdone(); setTimeout(() => { goTab('activity'); openSheet('tx', { id, noFocus: true }); }, 50); }
};
let renderKeepGlobal = false;
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) { if (e.target.id === 'scrim') closeSheet(); return; }
  const f = A[t.dataset.act]; if (f) { e.preventDefault(); f(t, e); }
});
document.addEventListener('input', e => {
  if (SH.name === 'deposit' && (e.target.id === 'f-amt' || e.target.id === 'f-goal')) lockBox();
});
document.addEventListener('change', e => { if (SH.name === 'deposit' && e.target.id === 'f-goal') lockBox(); });
function lockBox() { const g = Store.goalById(val('f-goal')), b = $('#lockbox'); if (!b) return; b.innerHTML = g && g.locked && !g.committed ? `<label class="row" style="gap:10px;margin:4px 0 12px;align-items:flex-start"><input type="checkbox" id="f-consent" style="width:20px;height:20px;accent-color:var(--accent);margin-top:2px"><span class="small"><b>This is a locked commitment.</b> I understand this money cannot be withdrawn until ${esc(g.name)} reaches ${E(g.target)}.</span></label>` : g && g.locked ? `<p class="small muted" style="margin:4px 0 10px">Locked commitment: withdrawals open at ${E(g.target)}.</p>` : ''; }
document.addEventListener('keydown', e => { const t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('div[data-act]')) { e.preventDefault(); t.click(); } if (e.key === 'Escape') { if (F.on) closeFlow(); else closeSheet(); } });
/* chart tooltips */
document.addEventListener('pointermove', chartTip); document.addEventListener('pointerdown', chartTip);
function chartTip(e) { const c = e.target.closest && e.target.closest('.chart'); $$('.chart .tip').forEach(t => { if (!c || t.parentNode !== c) t.style.opacity = 0; }); if (!c) return; const d = e.target.closest('[data-tip]'), tip = $('.tip', c); if (!d) { tip.style.opacity = 0; return; } const r = c.getBoundingClientRect(); tip.textContent = d.dataset.tip; tip.style.left = Math.min(Math.max(70, e.clientX - r.left), r.width - 70) + 'px'; tip.style.top = (e.clientY - r.top) + 'px'; tip.style.opacity = 1; }
matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.settings.theme === 'system') render(); });

/* ---------- life: Pip does small things now and then ---------- */
setInterval(() => { if (document.hidden || SH.name || F.on || $('#cele').classList.contains('on')) return; const m = $('.mascot[data-live]'); if (!m || !m._p || m._p.anim !== 'idle') return; if (nightNow()) return; if (Math.random() < .55) pipPlay(['thinking', 'greeting', 'happy', 'training'][Math.floor(Math.random() * 4)]); }, 15000);

/* ---------- boot ---------- */
function boot() {
  $('#nav').innerHTML = NavigationBar();
  const sp = $('#splash'); sp.querySelector('.mascot').dataset.st = '3'; mountMascots(sp); sp.querySelector('.mascot')._p.play('greeting', 'idle');
  render();
  setTimeout(() => sp.classList.add('off'), 1150);
  // welcome and weekly summary once per day
  const k = Store.dayKey(Date.now()); if (S.lastOpen !== k) { S.lastOpen = k; Store.save(); }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
}
window.PACE = { A, R, render, get S() { return S; }, openFlow, F, goTab };
boot();
})();
