/* PACE data layer: one centralized, persisted, simulated financial model. No real money, no real credentials.
   Money is stored as integer cents. Points are a separate balance and are never mixed with euros.
   Every operation returns { ok, error?, events[], tx? } and mutates state in one place so balances stay consistent.
   To go live, replace the functions in `Store` with calls to an authorized banking / payments provider API. */
const Store = (() => {
  const KEY = 'pace.v1';
  const MILESTONES = [10000, 50000, 100000, 250000, 500000, 1000000]; // cents: 100, 500, 1000, 2500, 5000, 10000
  const STAGE_AT = [0, 50000, 100000, 250000, 500000]; // total savings (cents) for mascot stages 1..5
  const LEVELS = [
    { id: 'member', name: 'Member', min: 0, mult: 1.0, perks: ['Earn points on eligible spending', 'Weekly challenges', 'Daily check-in'] },
    { id: 'silver', name: 'Silver', min: 1000, mult: 1.1, perks: ['10% more points on spending', 'Silver rewards unlocked', 'Priority support chat'] },
    { id: 'gold', name: 'Gold', min: 3000, mult: 1.2, perks: ['20% more points on spending', 'Gold partner offers', 'Free virtual cards'] },
    { id: 'platinum', name: 'Platinum', min: 7500, mult: 1.35, perks: ['35% more points on spending', 'Platinum vouchers', 'Travel card without fees (demo)'] },
    { id: 'elite', name: 'Elite', min: 15000, mult: 1.5, perks: ['50% more points on spending', 'Elite-only rewards', 'Early access to new PACE features'] }
  ];
  const STAGE_NAMES = ['Beginner', 'Growing', 'Active', 'Advanced', 'Elite'];
  const CATS = ['Groceries', 'Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Income', 'Transfers', 'Savings'];
  const CONTACTS = [
    { id: 'c1', name: 'Maja Kovač', hue: 262 }, { id: 'c2', name: 'Luka Novak', hue: 210 }, { id: 'c3', name: 'Ana Horvat', hue: 320 },
    { id: 'c4', name: 'Tim Zupan', hue: 160 }, { id: 'c5', name: 'Eva Krajnc', hue: 30 }
  ];
  const MERCHANTS = [
    { id: 'm1', name: 'Greenleaf Market', cat: 'Groceries', online: false }, { id: 'm2', name: 'Café Linde', cat: 'Dining', online: false },
    { id: 'm3', name: 'Metro Move', cat: 'Transport', online: false }, { id: 'm4', name: 'Pixel & Co', cat: 'Shopping', online: true },
    { id: 'm5', name: 'Volt Energy', cat: 'Bills', online: true }, { id: 'm6', name: 'Streamly', cat: 'Entertainment', online: true },
    { id: 'm7', name: 'Aero Air', cat: 'Travel', online: true }, { id: 'm8', name: 'Vita Pharmacy', cat: 'Health', online: false },
    { id: 'm9', name: 'Shopline Online', cat: 'Shopping', online: true }, { id: 'm10', name: 'Harbor Bistro', cat: 'Dining', online: false }
  ];
  const CATALOG = [
    { id: 'r1', name: 'Café Linde voucher', kind: 'Gift voucher', pts: 500, desc: 'A 5 euro voucher for any drink or pastry at Café Linde.', stock: 40, art: 'cup', min: 0 },
    { id: 'r2', name: 'Greenleaf Market 10 euro', kind: 'Gift voucher', pts: 1000, desc: 'Ten euros off your next grocery shop at Greenleaf Market.', stock: 25, art: 'bag', min: 0 },
    { id: 'r3', name: 'Streamly 1 month', kind: 'Digital reward', pts: 1400, desc: 'One month of Streamly Standard, delivered as a code.', stock: 12, art: 'play', min: 0 },
    { id: 'r4', name: '15% off Pixel & Co', kind: 'Discount', pts: 700, desc: 'A single-use 15% discount on anything from Pixel & Co.', stock: 60, art: 'tag', min: 0 },
    { id: 'r5', name: 'Metro Move day pass', kind: 'Partner offer', pts: 900, desc: 'Unlimited rides for one day with Metro Move.', stock: 30, art: 'train', min: 1 },
    { id: 'r6', name: 'Aero Air lounge pass', kind: 'Partner offer', pts: 3200, desc: 'One lounge visit at a partner airport (demo partner).', stock: 8, art: 'plane', min: 2 },
    { id: 'r7', name: 'PACE Plus, 1 month', kind: 'Premium benefit', pts: 2000, desc: 'A month of PACE Plus: extra virtual cards and custom card designs.', stock: 99, art: 'star', min: 1 },
    { id: 'r8', name: 'PACE Cap', kind: 'Merchandise', pts: 2500, desc: 'A violet PACE cap with the stride mark. Ships anywhere in the EU (demo).', stock: 15, art: 'cap', min: 1 },
    { id: 'r9', name: 'Pip enamel pin', kind: 'Merchandise', pts: 1200, desc: 'A collectible pin of Pip at the Active stage.', stock: 3, art: 'pin', min: 0 },
    { id: 'r10', name: 'Vita Pharmacy 10 euro', kind: 'Gift voucher', pts: 1100, desc: 'Ten euros off health and care products.', stock: 20, art: 'cross', min: 0 },
    { id: 'r11', name: 'Platinum dinner offer', kind: 'Partner offer', pts: 6000, desc: 'Two-course dinner for two at Harbor Bistro.', stock: 5, art: 'fork', min: 3 },
    { id: 'r12', name: 'Pip stage skin: Aurora', kind: 'Digital reward', pts: 1800, desc: 'A purely cosmetic Aurora glow for Pip. Unlocks at Gold.', stock: 99, art: 'spark', min: 2 }
  ];
  const DESIGNS = ['violet', 'white', 'black', 'lavender', 'metal'];
  const DEFAULT_RULES = { blockCents: 1000, ptsPerBlock: 5, milestoneBonus: 250, goalBonus: 250, challengeBonus: 100, dailyBonus: 10, dailyCap: 300, maxEligibleCents: 20000, minEligibleCents: 200 };
  const CHALLENGES = [
    { id: 'save25', name: 'Save 25 euros this week', desc: 'Move at least 25 euros into your savings goals.', target: 2500, unit: 'eur' },
    { id: 'cards3', name: 'Use your card 3 times', desc: 'Make three card payments at merchants.', target: 3, unit: 'n' },
    { id: 'checkin', name: 'Open PACE on 3 different days', desc: 'Check in with the daily bonus on three days.', target: 3, unit: 'n' }
  ];

  /* ---------- helpers ---------- */
  const DAY = 86400000;
  const cents = v => Math.round(v * 100);
  const eur = (c, opt = {}) => { const s = (Math.abs(c) / 100).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); return (c < 0 && !opt.abs ? '-' : '') + '€' + s; };
  const weekKey = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const dayKey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const monthStart = (ts, off = 0) => { const d = new Date(ts); return new Date(d.getFullYear(), d.getMonth() + off, 1).getTime(); };
  let rngState = 7;
  const rnd = () => { rngState = (rngState * 1664525 + 1013904223) % 4294967296; return rngState / 4294967296; };
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- state ---------- */
  let S = null;
  const listeners = [];
  const mem = {};
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] || null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } } };
  const uid = () => 'x' + (S.seq = (S.seq || 0) + 1).toString(36) + Math.floor(rnd() * 1e5).toString(36);
  const refNo = () => 'PC-' + String(Math.floor(100000 + rnd() * 899999)) + '-' + String((S.seq = (S.seq || 0) + 1) % 1000).padStart(3, '0');
  const save = () => { try { ls.set(KEY, JSON.stringify(S)); } catch (e) { } listeners.forEach(f => f(S)); };
  const sub = f => listeners.push(f);

  function cardNumbers(last4, i) { const a = 5300 + i * 7; return `${a} 0${(i * 37 + 11) % 100} 00${(i * 53 + 7) % 100} ${last4}`.replace(/\s0(\d)(\d)/, ' 0$1$2'); }

  function seed(now) {
    now = now || Date.now(); rngState = 7;
    const st = {
      v: 1, seq: 0, createdAt: now,
      user: { name: 'Alex Morgan', first: 'Alex', email: 'alex.morgan@example.demo', phone: '+386 00 000 000', memberId: 'PACE-4821-0093', joined: now - 410 * DAY, city: 'Ljubljana (demo)' },
      settings: { theme: 'system', sound: true, motion: true, hideBalances: false, privacy: { analytics: false, personalised: false, shareContacts: false }, security: { biometric: true, twoStep: true, lockOnExit: false }, notif: { payments: true, rewards: true, savings: true, weekly: true } },
      accounts: { chk: { id: 'chk', name: 'Checking Account', type: 'Everyday', ident: 'SI56 0000 0000 4821 (demo)', bal: 485000 }, sav: { id: 'sav', name: 'PACE Savings', type: 'Family Savings', ident: 'SAV 0093 2210 (demo)', target: 500000 } },
      pts: { avail: 0, life: 0, redeemed: 0 },
      goals: [
        { id: 'g1', name: 'Family Savings', icon: 'home', target: 500000, saved: 0, primary: true, locked: false, created: now - 300 * DAY },
        { id: 'g2', name: 'Travel', icon: 'plane', target: 150000, saved: 0, locked: false, created: now - 200 * DAY },
        { id: 'g3', name: 'Emergency fund', icon: 'shield', target: 300000, saved: 0, locked: false, created: now - 260 * DAY },
        { id: 'g4', name: 'Long-term Vault', icon: 'lock', target: 1000000, saved: 0, locked: true, created: now - 100 * DAY }
      ],
      milestones: [], tx: [], cards: [], redemptions: [], notifs: [], claims: {}, checkins: [], stock: {}, rules: clone(DEFAULT_RULES), lastStage: 1, lastLevel: 'member', welcomed: false
    };
    S = st;
    // cards
    const mk = (id, name, kind, design, last4, extra) => Object.assign({ id, name, kind, design, last4, exp: '09/29', status: 'active', acct: 'chk', limits: { perTx: 100000, monthly: 300000 }, online: kind !== 'physical' || true, intl: false, contactless: true, atm: kind === 'physical', def: false, created: now - 300 * DAY }, extra);
    st.cards = [
      mk('k1', 'Main Debit Card', 'physical', 'violet', '4821', { def: true, intl: false }),
      mk('k2', 'Virtual Card', 'virtual', 'lavender', '7710', { atm: false, contactless: false }),
      mk('k3', 'Online Shopping', 'virtual', 'black', '3365', { atm: false, contactless: false, limits: { perTx: 25000, monthly: 80000 } }),
      mk('k4', 'Travel Card', 'physical', 'metal', '9042', { intl: true, limits: { perTx: 150000, monthly: 500000 } }),
      mk('k5', 'Weekend Card', 'physical', 'white', '1157', { online: false, limits: { perTx: 20000, monthly: 40000 } })
    ];
    st.cards.forEach((c, i) => { c.full = cardNumbers(c.last4, i); c.cvv = String(100 + i * 111).slice(0, 3); });
    // savings history (monthly deposits that sum to 1,600 euros)
    const dep = [[150, 'g1', 100], [118, 'g3', 120], [92, 'g1', 250], [70, 'g2', 90], [57, 'g1', 300], [40, 'g3', 100], [31, 'g1', 250], [20, 'g2', 130], [9, 'g1', 210], [4, 'g3', 50]];
    // sums: g1 1110, g2 220, g3 270  => 1600
    dep.forEach(([d, g, v]) => { const goal = st.goals.find(x => x.id === g); goal.saved += cents(v); st.tx.push({ id: uid(), ref: refNo(), ts: now - d * DAY - 36e5 * 3, type: 'savings', title: 'To ' + goal.name, sub: 'Checking to PACE Savings', amount: -cents(v), acct: 'chk', to: 'sav', goalId: g, cat: 'Savings', method: 'Transfer', status: 'completed', icon: 'save' }); });
    // regular income and spending for ~5 months
    const add = (d, title, amount, cat, type, method, extra) => st.tx.push(Object.assign({ id: uid(), ref: refNo(), ts: now - d * DAY - Math.floor(rnd() * 8) * 36e5, type, title, sub: cat, amount, acct: 'chk', cat, method, status: 'completed', icon: cat }, extra || {}));
    for (let m = 0; m < 6; m++) {
      const base = m * 30 + 3;
      if (base < 170) { add(base + 0, 'Salary · Nordlicht GmbH', cents(2450), 'Income', 'in', 'Bank transfer'); }
      if (m % 2 === 0 && base + 9 < 170) add(base + 9, 'Freelance · Studio Mica', cents(180 + Math.floor(rnd() * 160)), 'Income', 'in', 'Bank transfer');
      add(base + 2, 'Volt Energy', -cents(54 + Math.floor(rnd() * 20)), 'Bills', 'card', 'Card ••4821', { cardId: 'k1', merchantId: 'm5' });
      add(base + 6, 'Streamly', -cents(9.99), 'Entertainment', 'card', 'Card ••3365', { cardId: 'k3', merchantId: 'm6' });
      add(base + 12, 'Rent · Stanovanje', -cents(780), 'Bills', 'out', 'Bank transfer');
      for (let k = 0; k < 4; k++) add(base + k * 6 + 1, 'Greenleaf Market', -cents(22 + Math.floor(rnd() * 46)), 'Groceries', 'card', 'Card ••4821', { cardId: 'k1', merchantId: 'm1' });
      for (let k = 0; k < 3; k++) add(base + k * 8 + 3, k % 2 ? 'Harbor Bistro' : 'Café Linde', -cents(6 + Math.floor(rnd() * 34)), 'Dining', 'card', 'Card ••4821', { cardId: 'k1', merchantId: k % 2 ? 'm10' : 'm2' });
      add(base + 5, 'Metro Move', -cents(18 + Math.floor(rnd() * 14)), 'Transport', 'card', 'Card ••4821', { cardId: 'k1', merchantId: 'm3' });
      if (m % 2) add(base + 14, 'Pixel & Co', -cents(30 + Math.floor(rnd() * 70)), 'Shopping', 'card', 'Card ••3365', { cardId: 'k3', merchantId: 'm4' });
      if (m % 3 === 1) add(base + 17, 'Vita Pharmacy', -cents(12 + Math.floor(rnd() * 18)), 'Health', 'card', 'Card ••4821', { cardId: 'k1', merchantId: 'm8' });
    }
    add(24, 'Maja Kovač', -cents(35), 'Transfers', 'out', 'PACE pay', { contactId: 'c1' });
    add(16, 'Luka Novak', cents(20), 'Transfers', 'in', 'PACE pay', { contactId: 'c2' });
    add(11, 'Aero Air', -cents(214), 'Travel', 'card', 'Card ••9042', { cardId: 'k4', merchantId: 'm7' });
    // keep only past
    st.tx = st.tx.filter(t => t.ts <= now && t.ts > now - 175 * DAY);
    st.tx.sort((a, b) => b.ts - a.ts);
    // milestones reached with dates
    [[10000, 150], [50000, 70], [100000, 31]].forEach(([a, d]) => { st.milestones.push({ amount: a, at: now - d * DAY }); });
    // points: spending points from seed spending, milestone bonuses, then a founding bonus so lifetime lands on 3,180
    let life = 0;
    const ptsTx = [];
    st.tx.slice().reverse().forEach(t => { if (t.type === 'card' && t.amount < 0) { const p = spendPoints(st, -t.amount, t.cat, 'card', null, 1.0, true); if (p > 0) { life += p; ptsTx.push({ id: uid(), ref: refNo(), ts: t.ts + 1000, type: 'reward_earn', title: 'Points · ' + t.title, sub: 'Eligible spending', amount: 0, pts: p, acct: 'pts', cat: 'Rewards', method: 'Points', status: 'completed', icon: 'star' }); } } });
    st.milestones.forEach(m => { life += st.rules.milestoneBonus; ptsTx.push({ id: uid(), ref: refNo(), ts: m.at, type: 'reward_earn', title: 'Milestone bonus · ' + eur(m.amount, { abs: true }).replace('.00', ''), sub: 'Savings milestone', amount: 0, pts: st.rules.milestoneBonus, acct: 'pts', cat: 'Rewards', method: 'Points', status: 'completed', icon: 'flag' }); });
    if (life < 3180) { const b = 3180 - life; life += b; ptsTx.push({ id: uid(), ref: refNo(), ts: now - 400 * DAY, type: 'reward_earn', title: 'Welcome and founding bonus', sub: 'Thanks for joining PACE', amount: 0, pts: b, acct: 'pts', cat: 'Rewards', method: 'Points', status: 'completed', icon: 'gift' }); }
    const red = CATALOG[0];
    ptsTx.push({ id: uid(), ref: refNo(), ts: now - 21 * DAY, type: 'reward_redeem', title: 'Redeemed · ' + red.name, sub: 'Rewards marketplace', amount: 0, pts: -red.pts, acct: 'pts', cat: 'Rewards', method: 'Points', status: 'completed', icon: 'gift' });
    st.redemptions.push({ id: uid(), rid: red.id, name: red.name, pts: red.pts, ts: now - 21 * DAY, code: 'PACE-CAFE-4KQ7' });
    st.stock[red.id] = 1;
    st.pts = { avail: life - red.pts, life, redeemed: red.pts };
    st.tx = st.tx.concat(ptsTx).sort((a, b) => b.ts - a.ts);
    st.lastStage = stageFor(st); st.lastLevel = levelFor(st.pts.life).id;
    st.notifs = [
      { id: uid(), ts: now - 2 * 36e5, kind: 'weekly', title: 'Your weekly summary is ready', body: 'See where your money went this week.', read: false },
      { id: uid(), ts: now - DAY, kind: 'reward', title: 'New rewards available', body: 'The Streamly 1 month reward just came back in stock.', read: false },
      { id: uid(), ts: now - 3 * DAY, kind: 'milestone', title: 'Savings milestone reached', body: 'You saved your first 1,000 euros. Pip is Active now.', read: true },
      { id: uid(), ts: now - 5 * DAY, kind: 'received', title: 'Money received', body: 'Luka Novak sent you 20.00 euros.', read: true }
    ];
    // make the seeded notification dates sensible: the received one matches the seeded transfer
    return st;
  }

  /* ---------- derived ---------- */
  const savingsTotal = (s = S) => s.goals.reduce((a, g) => a + g.saved, 0);
  const stageFor = (s = S) => { const t = savingsTotal(s); let st = 1; STAGE_AT.forEach((a, i) => { if (t >= a) st = i + 1; }); return st; };
  const levelFor = pts => { let l = LEVELS[0]; LEVELS.forEach(x => { if (pts >= x.min) l = x; }); return l; };
  const levelIndex = id => LEVELS.findIndex(l => l.id === id);
  const nextMilestone = (s = S) => { const t = savingsTotal(s); return MILESTONES.find(m => m > t) || null; };
  const prevMilestone = (s = S) => { const t = savingsTotal(s); let p = 0; MILESTONES.forEach(m => { if (m <= t) p = m; }); return p; };
  function spendPoints(s, amountCents, cat, kind, now, mult, ignoreCap) {
    const r = s.rules;
    if (!['card', 'merchant', 'online'].includes(kind)) return 0;
    if (['Income', 'Transfers', 'Savings'].includes(cat)) return 0;
    if (amountCents < r.minEligibleCents) return 0;
    const eligible = Math.min(amountCents, r.maxEligibleCents);
    let p = Math.floor(Math.floor(eligible / r.blockCents) * r.ptsPerBlock * (mult || 1));
    if (!ignoreCap && now) {
      const today = dayKey(now); const used = s.tx.filter(t => t.type === 'reward_earn' && t.spendPts && dayKey(t.ts) === today).reduce((a, t) => a + t.pts, 0);
      p = Math.max(0, Math.min(p, r.dailyCap - used));
    }
    return p;
  }
  const cardMonthSpend = (cardId, now = Date.now(), s = S) => s.tx.filter(t => t.cardId === cardId && t.amount < 0 && t.status === 'completed' && t.ts >= monthStart(now)).reduce((a, t) => a - t.amount, 0);
  const goalById = id => S.goals.find(g => g.id === id);
  const cardById = id => S.cards.find(c => c.id === id);
  const isUnlocked = g => !g.locked || g.saved >= g.target;

  function notify(kind, title, body, ts) {
    const pref = { payment: 'payments', received: 'payments', card: 'payments', reward: 'rewards', level: 'rewards', milestone: 'savings', goal: 'savings', weekly: 'weekly' }[kind];
    if (pref && S.settings.notif[pref] === false) return;
    S.notifs.unshift({ id: uid(), ts: ts || Date.now(), kind, title, body, read: false });
    if (S.notifs.length > 60) S.notifs.length = 60;
  }
  function pushTx(t, now) {
    const tx = Object.assign({ id: uid(), ref: refNo(), ts: now || Date.now(), status: 'completed' }, t);
    S.tx.unshift(tx); return tx;
  }
  function addPoints(n, title, sub, icon, now, spend) {
    if (n <= 0) return null;
    S.pts.avail += n; S.pts.life += n;
    const t = pushTx({ type: 'reward_earn', title, sub, amount: 0, pts: n, acct: 'pts', cat: 'Rewards', method: 'Points', icon: icon || 'star', spendPts: !!spend }, now);
    return t;
  }
  function checkLevel(events, now) {
    const l = levelFor(S.pts.life);
    if (levelIndex(l.id) > levelIndex(S.lastLevel)) {
      S.lastLevel = l.id; events.push({ type: 'rewardsLevel', level: l.id, name: l.name });
      notify('level', 'New membership level: ' + l.name, 'Your PACE Rewards card has a new look and new benefits.', now);
    }
  }
  function checkSavings(events, now, beforeTotal) {
    const total = savingsTotal();
    MILESTONES.forEach(m => {
      if (total >= m && !S.milestones.some(x => x.amount === m)) {
        S.milestones.push({ amount: m, at: now });
        events.push({ type: 'milestone', amount: m });
        addPoints(S.rules.milestoneBonus, 'Milestone bonus · ' + eur(m, { abs: true }).replace('.00', ''), 'Savings milestone', 'flag', now);
        notify('milestone', 'Savings milestone reached', 'You passed ' + eur(m, { abs: true }).replace('.00', '') + ' in savings. +' + S.rules.milestoneBonus + ' points.', now);
        events.push({ type: 'points', n: S.rules.milestoneBonus });
      }
    });
    const st = stageFor();
    if (st > S.lastStage) { S.lastStage = st; events.push({ type: 'levelup', stage: st, name: STAGE_NAMES[st - 1] }); notify('milestone', 'Pip evolved: ' + STAGE_NAMES[st - 1], 'Your savings unlocked a new stage for Pip.', now); }
  }

  /* ---------- operations ---------- */
  const fail = (error, extra) => Object.assign({ ok: false, error, events: [{ type: 'error' }] }, extra);
  const valid = c => Number.isInteger(c) && c > 0;

  function pay({ type, recipient, amount, source, note, category }, now = Date.now()) {
    const ev = [];
    if (!valid(amount)) return fail('Enter an amount greater than zero.');
    if (amount > 5000000) return fail('The maximum amount for one payment is 50,000 euros.');
    if (!recipient) return fail('Choose who you are paying.');
    if (!['contact', 'merchant', 'online', 'card'].includes(type)) return fail('Unknown payment type.');
    let card = null;
    if (type === 'card' || type === 'online') { if (!source || source === 'chk') return fail('Choose a card for this payment type.'); }
    if (source && source !== 'chk') {
      card = cardById(source); if (!card) return fail('That card was not found.');
    }
    const m = MERCHANTS.find(x => x.id === recipient), c = CONTACTS.find(x => x.id === recipient);
    const title = (m || c || {}).name; if (!title) return fail('That recipient was not found.');
    const cat = (m && m.cat) || category || 'Transfers';
    const decline = reason => {
      const t = pushTx({ type: type === 'contact' ? 'out' : 'card', title, sub: 'Declined: ' + reason, amount: 0, attempted: -amount, acct: 'chk', cat, method: card ? 'Card ••' + card.last4 : 'PACE pay', status: 'declined', icon: cat, cardId: card && card.id }, now);
      notify('payment', 'Payment declined', reason, now); save();
      return { ok: false, error: reason, tx: t, events: [{ type: 'error' }] };
    };
    if (card) {
      if (card.status === 'frozen') return decline('This card is frozen. Unfreeze it to pay.');
      if (card.status === 'closed') return decline('This card is closed.');
      if (type === 'online' && !card.online) return decline('Online payments are turned off for this card.');
      if (m && m.cat === 'Travel' && type === 'online' && !card.intl && false) return decline('International payments are off.');
      if (amount > card.limits.perTx) return decline('Over the per-payment limit of ' + eur(card.limits.perTx) + '.');
      if (cardMonthSpend(card.id, now) + amount > card.limits.monthly) return decline('This would pass the monthly limit of ' + eur(card.limits.monthly) + '.');
    }
    if (type === 'online' && !m.online && false) return fail('That merchant does not take online payments.');
    if (amount > S.accounts.chk.bal) return decline('Not enough money in Checking. Balance ' + eur(S.accounts.chk.bal) + '.');
    S.accounts.chk.bal -= amount;
    const kind = type === 'contact' ? 'out' : 'card';
    const tx = pushTx({ type: kind, title, sub: note || cat, amount: -amount, acct: 'chk', cat, method: card ? 'Card ••' + card.last4 : 'PACE pay', icon: cat, cardId: card && card.id, merchantId: m && m.id, contactId: c && c.id, payKind: type, balAfter: S.accounts.chk.bal }, now);
    ev.push({ type: 'paid' });
    notify('payment', 'Payment successful', 'You paid ' + eur(amount) + ' to ' + title + '.', now);
    const mult = levelFor(S.pts.life); const p = spendPoints(S, amount, cat, type === 'contact' ? 'contact' : type, now, mult.mult);
    if (p > 0) { addPoints(p, 'Points · ' + title, 'Eligible spending', 'star', now, true); tx.pointsEarned = p; ev.push({ type: 'points', n: p }); checkLevel(ev, now); }
    save(); return { ok: true, tx, events: ev };
  }
  function requestMoney({ from, amount, note }, now = Date.now()) {
    if (!valid(amount)) return fail('Enter an amount greater than zero.');
    const c = CONTACTS.find(x => x.id === from); if (!c) return fail('Choose who to request from.');
    const tx = pushTx({ type: 'request', title: 'Request to ' + c.name, sub: note || 'Waiting for ' + c.name.split(' ')[0], amount: amount, acct: 'chk', cat: 'Transfers', method: 'PACE pay', status: 'pending', icon: 'Transfers', contactId: c.id }, now);
    save(); return { ok: true, tx, events: [{ type: 'requested' }] };
  }
  function settleRequest(id, now = Date.now()) {
    const t = S.tx.find(x => x.id === id && x.type === 'request' && x.status === 'pending'); if (!t) return fail('That request is no longer pending.');
    t.status = 'completed'; t.type = 'in'; t.title = t.title.replace('Request to ', ''); t.sub = 'Request paid'; t.ts = now; S.accounts.chk.bal += t.amount; t.balAfter = S.accounts.chk.bal;
    notify('received', 'Money received', t.title + ' sent you ' + eur(t.amount) + '.', now); save(); return { ok: true, tx: t, events: [{ type: 'received' }] };
  }
  function addMoney({ amount, method }, now = Date.now()) {
    if (!valid(amount)) return fail('Enter an amount greater than zero.');
    if (amount > 2000000) return fail('Demo top-ups are limited to 20,000 euros at a time.');
    S.accounts.chk.bal += amount;
    const tx = pushTx({ type: 'in', title: 'Added money', sub: method || 'Linked bank (demo)', amount, acct: 'chk', cat: 'Income', method: method || 'Linked bank (demo)', icon: 'add', balAfter: S.accounts.chk.bal }, now);
    notify('received', 'Money added', eur(amount) + ' was added to Checking (simulated).', now); save(); return { ok: true, tx, events: [{ type: 'received' }] };
  }
  function toGoal(goalId, amount, opts = {}, now = Date.now()) {
    const g = goalById(goalId); if (!g) return fail('That savings goal was not found.');
    if (!valid(amount)) return fail('Enter an amount greater than zero.');
    if (amount > S.accounts.chk.bal) return fail('Not enough money in Checking. Balance ' + eur(S.accounts.chk.bal) + '.');
    if (g.locked && !g.committed && !opts.consent) return fail('Tick the box to confirm you understand this is a locked commitment.');
    const before = savingsTotal(), wasDone = g.saved >= g.target;
    S.accounts.chk.bal -= amount; g.saved += amount; if (g.locked && !g.committed) { g.committed = now; }
    const tx = pushTx({ type: 'savings', title: 'To ' + g.name, sub: 'Checking to PACE Savings', amount: -amount, acct: 'chk', to: 'sav', goalId: g.id, cat: 'Savings', method: 'Transfer', icon: 'save', balAfter: S.accounts.chk.bal }, now);
    const ev = [{ type: 'saved', goal: g.id }];
    if (!wasDone && !g.completedAt && g.saved >= g.target) { g.completedAt = now; ev.push({ type: 'goalDone', goal: g.id, name: g.name }); addPoints(S.rules.goalBonus, 'Goal completed · ' + g.name, 'Savings goal', 'flag', now); ev.push({ type: 'points', n: S.rules.goalBonus }); notify('goal', 'Goal completed: ' + g.name, 'You reached ' + eur(g.target) + '. +' + S.rules.goalBonus + ' points.', now); }
    checkSavings(ev, now, before); checkLevel(ev, now);
    save(); return { ok: true, tx, events: ev };
  }
  function fromGoal(goalId, amount, now = Date.now()) {
    const g = goalById(goalId); if (!g) return fail('That savings goal was not found.');
    if (!valid(amount)) return fail('Enter an amount greater than zero.');
    if (!isUnlocked(g)) return fail('This is a locked commitment. You can withdraw once it reaches ' + eur(g.target) + '.');
    if (amount > g.saved) return fail('This goal only holds ' + eur(g.saved) + '.');
    g.saved -= amount; S.accounts.chk.bal += amount;
    const tx = pushTx({ type: 'transfer', title: 'From ' + g.name, sub: 'PACE Savings to Checking', amount: amount, acct: 'chk', from: 'sav', goalId: g.id, cat: 'Transfers', method: 'Transfer', icon: 'save', balAfter: S.accounts.chk.bal }, now);
    save(); return { ok: true, tx, events: [{ type: 'withdrawn' }, { type: 'sad' }] };
  }
  function moveBetweenGoals(fromId, toId, amount, now = Date.now()) {
    const a = goalById(fromId), b = goalById(toId); if (!a || !b || a === b) return fail('Choose two different goals.');
    if (!valid(amount)) return fail('Enter an amount greater than zero.');
    if (!isUnlocked(a)) return fail(a.name + ' is a locked commitment.');
    if (amount > a.saved) return fail(a.name + ' only holds ' + eur(a.saved) + '.');
    if (b.locked && !b.committed) return fail('Commit to ' + b.name + ' with a deposit from Checking first.');
    const before = savingsTotal(), done = b.saved >= b.target; a.saved -= amount; b.saved += amount;
    const ev = [{ type: 'saved' }];
    if (!done && !b.completedAt && b.saved >= b.target) { b.completedAt = now; ev.push({ type: 'goalDone', goal: b.id, name: b.name }); addPoints(S.rules.goalBonus, 'Goal completed · ' + b.name, 'Savings goal', 'flag', now); }
    const tx = pushTx({ type: 'transfer', title: a.name + ' to ' + b.name, sub: 'Between savings goals', amount: 0, moved: amount, acct: 'sav', cat: 'Savings', method: 'Transfer', icon: 'save' }, now);
    checkSavings(ev, now, before); checkLevel(ev, now); save(); return { ok: true, tx, events: ev };
  }
  function createGoal({ name, target, icon, locked }, now = Date.now()) {
    name = String(name || '').trim().slice(0, 28); if (!name) return fail('Give the goal a name.');
    if (!valid(target) || target > 100000000) return fail('Enter a target between 1 and 1,000,000 euros.');
    if (S.goals.length >= 10) return fail('You can have up to 10 goals.');
    const g = { id: uid(), name, icon: icon || 'flag', target, saved: 0, locked: !!locked, created: now };
    S.goals.push(g); save(); return { ok: true, goal: g, events: [{ type: 'happy' }] };
  }
  function editGoal(id, patch) {
    const g = goalById(id); if (!g) return fail('Goal not found.');
    if (patch.name !== undefined) { const n = String(patch.name).trim().slice(0, 28); if (!n) return fail('Give the goal a name.'); g.name = n; }
    if (patch.target !== undefined) { if (!valid(patch.target)) return fail('Enter a valid target.'); if (g.locked && g.committed && patch.target < g.target) return fail('A committed goal can only be raised.'); g.target = patch.target; }
    save(); return { ok: true, events: [] };
  }
  function deleteGoal(id) {
    const g = goalById(id); if (!g) return fail('Goal not found.');
    if (g.primary) return fail('Your main savings goal cannot be deleted.');
    if (!isUnlocked(g) && g.saved > 0) return fail('A locked commitment with money in it cannot be deleted.');
    if (g.saved > 0) { S.accounts.chk.bal += g.saved; pushTx({ type: 'transfer', title: 'From ' + g.name, sub: 'Goal closed', amount: g.saved, acct: 'chk', from: 'sav', cat: 'Transfers', method: 'Transfer', icon: 'save', balAfter: S.accounts.chk.bal }); }
    S.goals = S.goals.filter(x => x.id !== id); save(); return { ok: true, events: [] };
  }
  function setSavingsTarget(target) { if (!valid(target)) return fail('Enter a valid target.'); S.accounts.sav.target = target; const p = S.goals.find(g => g.primary); if (p) p.target = target; save(); return { ok: true, events: [] }; }

  function redeem(rid, now = Date.now()) {
    const r = CATALOG.find(x => x.id === rid); if (!r) return fail('That reward was not found.');
    const used = S.stock[rid] || 0; if (used >= r.stock) return fail('This reward is out of stock.');
    if (levelIndex(levelFor(S.pts.life).id) < r.min) return fail('Reach ' + LEVELS[r.min].name + ' to unlock this reward.');
    if (S.pts.avail < r.pts) return fail('You need ' + (r.pts - S.pts.avail).toLocaleString('en-IE') + ' more points.');
    S.pts.avail -= r.pts; S.pts.redeemed += r.pts; S.stock[rid] = used + 1;
    const code = 'PACE-' + r.id.toUpperCase() + '-' + Math.floor(1000 + rnd() * 8999);
    const red = { id: uid(), rid, name: r.name, pts: r.pts, ts: now, code }; S.redemptions.unshift(red);
    const tx = pushTx({ type: 'reward_redeem', title: 'Redeemed · ' + r.name, sub: 'Rewards marketplace', amount: 0, pts: -r.pts, acct: 'pts', cat: 'Rewards', method: 'Points', icon: 'gift' }, now);
    notify('reward', 'Reward redeemed', r.name + ' is yours. Code ' + code + '.', now); save();
    return { ok: true, tx, redemption: red, events: [{ type: 'redeemed' }] };
  }
  function weekProgress(id, now = Date.now()) {
    const wk = weekKey(now), start = new Date(wk + 'T00:00:00').getTime();
    if (id === 'save25') return S.tx.filter(t => t.type === 'savings' && t.ts >= start && t.status === 'completed').reduce((a, t) => a - t.amount, 0);
    if (id === 'cards3') return S.tx.filter(t => t.type === 'card' && t.status === 'completed' && t.amount < 0 && t.ts >= start).length;
    if (id === 'checkin') return S.checkins.filter(d => d >= wk).length;
    return 0;
  }
  function challengeState(now = Date.now()) {
    const wk = weekKey(now);
    return CHALLENGES.map(c => { const prog = Math.min(c.target, weekProgress(c.id, now)); return Object.assign({}, c, { prog, done: prog >= c.target, claimed: !!(S.claims[wk] && S.claims[wk][c.id]) }); });
  }
  function claimChallenge(id, now = Date.now()) {
    const c = challengeState(now).find(x => x.id === id); if (!c) return fail('Unknown challenge.');
    if (!c.done) return fail('Not finished yet.'); if (c.claimed) return fail('Already collected this week.');
    const wk = weekKey(now); (S.claims[wk] = S.claims[wk] || {})[id] = now;
    addPoints(S.rules.challengeBonus, 'Challenge · ' + c.name, 'Weekly challenge', 'flag', now);
    const ev = [{ type: 'points', n: S.rules.challengeBonus }, { type: 'happy' }]; checkLevel(ev, now);
    notify('reward', 'Challenge complete', '+' + S.rules.challengeBonus + ' points for “' + c.name + '”.', now); save(); return { ok: true, events: ev };
  }
  function dailyCheckin(now = Date.now()) {
    const d = dayKey(now); if (S.checkins.includes(d)) return fail('You already collected today. Come back tomorrow.');
    S.checkins.push(d); if (S.checkins.length > 60) S.checkins.shift();
    addPoints(S.rules.dailyBonus, 'Daily check-in', 'Daily bonus', 'star', now);
    const ev = [{ type: 'points', n: S.rules.dailyBonus }, { type: 'happy' }]; checkLevel(ev, now); save(); return { ok: true, events: ev };
  }

  /* cards */
  function cardPatch(id, patch) {
    const c = cardById(id); if (!c) return fail('Card not found.');
    if (patch.name !== undefined) { const n = String(patch.name).trim().slice(0, 24); if (!n) return fail('Give the card a name.'); c.name = n; }
    if (patch.design !== undefined) { if (!DESIGNS.includes(patch.design)) return fail('Unknown design.'); c.design = patch.design; }
    ['online', 'intl', 'contactless', 'atm'].forEach(k => { if (patch[k] !== undefined) c[k] = !!patch[k]; });
    save(); return { ok: true, events: [] };
  }
  function setLimits(id, perTx, monthly) {
    const c = cardById(id); if (!c) return fail('Card not found.');
    if (!valid(perTx) || !valid(monthly)) return fail('Limits must be greater than zero.');
    if (perTx > monthly) return fail('The per-payment limit cannot be higher than the monthly limit.');
    if (monthly > 2000000) return fail('The highest monthly limit in the demo is 20,000 euros.');
    c.limits = { perTx, monthly }; save(); return { ok: true, events: [] };
  }
  function freeze(id, now = Date.now()) {
    const c = cardById(id); if (!c) return fail('Card not found.'); if (c.status === 'closed') return fail('This card is closed.');
    c.status = c.status === 'frozen' ? 'active' : 'frozen';
    notify('card', c.status === 'frozen' ? 'Card frozen' : 'Card unfrozen', c.name + ' ••' + c.last4 + (c.status === 'frozen' ? ' is frozen. Payments are blocked.' : ' works again.'), now);
    save(); return { ok: true, status: c.status, events: [{ type: c.status === 'frozen' ? 'sad' : 'happy' }] };
  }
  function setDefault(id) { const c = cardById(id); if (!c) return fail('Card not found.'); if (c.status !== 'active') return fail('Only an active card can be the default.'); S.cards.forEach(x => x.def = false); c.def = true; save(); return { ok: true, events: [{ type: 'happy' }] }; }
  function addCard({ name, design, kind }, now = Date.now()) {
    if (S.cards.filter(c => c.status !== 'closed').length >= 8) return fail('You can have up to 8 cards.');
    const n = String(name || '').trim().slice(0, 24) || 'Custom Card'; const i = S.cards.length;
    const last4 = String(1000 + Math.floor(rnd() * 8999));
    const c = { id: uid(), name: n, kind: kind === 'physical' ? 'physical' : 'virtual', design: DESIGNS.includes(design) ? design : 'violet', last4, exp: '11/30', status: 'active', acct: 'chk', limits: { perTx: 50000, monthly: 150000 }, online: true, intl: false, contactless: kind === 'physical', atm: kind === 'physical', def: false, created: now, full: cardNumbers(last4, i + 3), cvv: String(200 + Math.floor(rnd() * 700)) };
    S.cards.push(c); notify('card', 'New card created', n + ' ••' + last4 + ' is ready (demo).', now); save(); return { ok: true, card: c, events: [{ type: 'happy' }] };
  }
  function closeCard(id) { const c = cardById(id); if (!c) return fail('Card not found.'); if (c.def) return fail('Choose another default card first.'); c.status = 'closed'; save(); return { ok: true, events: [] }; }

  /* settings */
  function setting(path, value) { const p = path.split('.'); let o = S.settings; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = value; save(); }
  function markRead(id) { if (id === 'all') S.notifs.forEach(n => n.read = true); else { const n = S.notifs.find(x => x.id === id); if (n) n.read = true; } save(); }
  function setRule(k, v) { if (!(k in S.rules) || !(v >= 0)) return fail('Invalid rule.'); S.rules[k] = v; save(); return { ok: true, events: [] }; }

  /* analytics (all from real records) */
  function spendByCategory(now = Date.now(), off = 0) {
    const a = monthStart(now, off), b = monthStart(now, off + 1), m = {};
    S.tx.forEach(t => { if (t.status === 'completed' && t.amount < 0 && t.acct === 'chk' && t.type !== 'savings' && t.ts >= a && t.ts < b) m[t.cat] = (m[t.cat] || 0) - t.amount; });
    return Object.entries(m).map(([cat, v]) => ({ cat, v })).sort((x, y) => y.v - x.v);
  }
  function monthSeries(now = Date.now(), n = 6) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const a = monthStart(now, -i), b = monthStart(now, -i + 1); let inc = 0, exp = 0, pts = 0, saved = 0;
      S.tx.forEach(t => {
        if (t.ts < a || t.ts >= b || t.status !== 'completed') return;
        if (t.acct === 'chk' && t.type === 'in') inc += t.amount;
        if (t.acct === 'chk' && t.amount < 0 && t.type !== 'savings') exp -= t.amount;
        if (t.type === 'savings') saved -= t.amount; if (t.type === 'transfer' && t.from === 'sav') saved -= t.amount;
        if (t.type === 'reward_earn') pts += t.pts;
      });
      out.push({ label: new Date(a).toLocaleString('en', { month: 'short' }), start: a, inc, exp, pts, saved });
    }
    // savings balance at month end, reconstructed backwards from the current total
    let bal = savingsTotal();
    for (let i = n - 1; i >= 0; i--) { out[i].balance = bal; bal -= out[i].saved; }
    return out;
  }
  function savingsPace(now = Date.now()) {
    const dep = S.tx.filter(t => t.type === 'savings' && t.ts > now - 90 * DAY).reduce((a, t) => a - t.amount, 0);
    return dep / 3; // cents per month
  }
  function eta(goal, now = Date.now()) {
    const left = goal.target - goal.saved; if (left <= 0) return { done: true };
    const pace = savingsPace(now); if (pace <= 0) return { none: true };
    const months = left / pace; return { months, date: now + months * 30.4 * DAY };
  }

  /* ---------- lifecycle ---------- */
  function load(now) {
    let raw = ls.get(KEY), st = null;
    try { st = raw && JSON.parse(raw); } catch (e) { st = null; }
    if (!st || st.v !== 1 || !st.accounts) { S = null; st = seed(now); } else S = st;
    S = st; return S;
  }
  function reset(now) { S = seed(now); save(); return S; }
  const get = () => S;
  const stale = () => { /* test hook */ };

  return { KEY, MILESTONES, STAGE_AT, LEVELS, STAGE_NAMES, CATS, CONTACTS, MERCHANTS, CATALOG, DESIGNS, CHALLENGES, DEFAULT_RULES,
    eur, cents, weekKey, dayKey, monthStart, load, reset, get, save, sub, seed, savingsTotal, stageFor, levelFor, levelIndex, nextMilestone, prevMilestone,
    spendPoints, cardMonthSpend, goalById, cardById, isUnlocked, pay, requestMoney, settleRequest, addMoney, toGoal, fromGoal, moveBetweenGoals, createGoal, editGoal, deleteGoal, setSavingsTarget,
    redeem, challengeState, claimChallenge, dailyCheckin, cardPatch, setLimits, freeze, setDefault, addCard, closeCard, setting, markRead, setRule,
    spendByCategory, monthSeries, savingsPace, eta, notify };
})();
if (typeof module !== 'undefined') module.exports = Store;
