/* PACE mascot "Pip": drawn frame by frame.
   Every frame is its own SVG drawing built from a pose table: body geometry (width, height) is redrawn,
   limbs are redrawn at new angles, eyes and mouths are swapped for separately drawn shapes.
   Nothing is bitmap-scaled and the outline width, eye size and purple details stay constant. */
const Mascot = (() => {
  const INK = '#251656', BODY = '#F4F1FA', BELLY = '#FFFFFF', PURPLE = '#6C3CF0', LAV = '#D9C9FF', DEEP = '#3A1C9E',
        EYE = '#241A3B', GOLD = '#E8B94A';
  const CX = 120, GROUND = 238, OUT = 3;
  const STAGES = [
    { n: 'Beginner', w: 118, h: 104, L: 4, arm: 17, r: 0 },
    { n: 'Growing', w: 114, h: 116, L: 10, arm: 23, r: 0 },
    { n: 'Active', w: 110, h: 128, L: 18, arm: 29, r: 0 },
    { n: 'Advanced', w: 112, h: 134, L: 24, arm: 35, r: 0 },
    { n: 'Elite', w: 112, h: 140, L: 28, arm: 40, r: 0 }
  ];
  const D = { dy: 0, sx: 0, sy: 0, lean: 0, lg: 1, fl: [0, 0], fr: [0, 0], sp: 0, aL: 10, aR: 10, bL: 0, bR: 0,
    eyes: 'open', mouth: 'smile', gx: 0, gy: 0, bwL: null, bwR: null, buL: 0, buR: 0, cr: 0, fx: [], st: 0, sil: 0, tilt: 0, hold: null };

  const f1 = n => Math.round(n * 10) / 10;
  const P = (d, o = '') => `<path d="${d}" ${o}/>`;
  const rot = (a, x, y, inner) => a ? `<g transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})">${inner}</g>` : inner;

  function bodyPath(cx, top, bb, w) {
    const h = bb - top, hw = w / 2;
    return `M${cx} ${f1(top)}C${f1(cx + w * .43)} ${f1(top)} ${f1(cx + hw)} ${f1(top + h * .26)} ${f1(cx + hw)} ${f1(top + h * .58)}` +
      `C${f1(cx + hw)} ${f1(top + h * .9)} ${f1(cx + w * .31)} ${f1(bb)} ${cx} ${f1(bb)}` +
      `C${f1(cx - w * .31)} ${f1(bb)} ${f1(cx - hw)} ${f1(top + h * .9)} ${f1(cx - hw)} ${f1(top + h * .58)}` +
      `C${f1(cx - hw)} ${f1(top + h * .26)} ${f1(cx - w * .43)} ${f1(top)} ${cx} ${f1(top)}Z`;
  }
  const leaf = (len, wid) => `M0 0C${wid} ${-len * .3} ${wid * .7} ${-len * .82} 0 ${-len}C${-wid * .7} ${-len * .82} ${-wid} ${-len * .3} 0 0Z`;

  /* ---------- parts ---------- */
  function crest(stage, x, y, sway, w) {
    const st = `fill="${PURPLE}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"`;
    const t = (a, len, wid, ox = 0) => `<g transform="translate(${ox} 0) rotate(${a})"><path d="${leaf(len, wid)}" ${st}/></g>`;
    let g = '';
    if (stage === 1) g = t(0, 24, 9);
    else if (stage === 2) g = t(-14, 21, 8, -6) + t(8, 28, 10, 3);
    else if (stage === 3) g = t(-28, 22, 8, -9) + t(26, 22, 8, 9) + t(0, 33, 11);
    else if (stage === 4) g = t(-40, 24, 8, -12) + t(-18, 32, 9, -5) + t(18, 32, 9, 5) + t(40, 24, 8, 12) + t(0, 40, 12);
    else g = t(-54, 22, 7, -16) + t(-32, 31, 8, -9) + t(-11, 40, 9, -3) + t(11, 40, 9, 3) + t(32, 31, 8, 9) + t(54, 22, 7, 16) + t(0, 48, 12);
    const hl = stage >= 3 ? `<path d="M${-3} ${-8}Q${-5} ${-20} ${-1} ${-30}" stroke="${LAV}" stroke-width="3" stroke-linecap="round" fill="none"/>` : '';
    return `<g transform="translate(${f1(x)} ${f1(y + 3)})">${rot(sway, 0, 0, g + hl)}</g>`;
  }
  function eye(kind, x, y, gx, gy, side) {
    const sw = `stroke="${EYE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    const shine = (px, py, s = 1) => `<circle cx="${f1(px - 3 * s)}" cy="${f1(py - 4 * s)}" r="${3.2 * s}" fill="#fff"/><circle cx="${f1(px + 3)}" cy="${f1(py + 4)}" r="1.6" fill="#fff"/>`;
    const px = x + gx, py = y + gy;
    switch (kind) {
      case 'open': return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="10.5" fill="${EYE}"/>${shine(px + 0, py)}`.replace(`cx="${f1(x)}" cy="${f1(y)}"`, `cx="${f1(x + gx * .5)}" cy="${f1(y + gy * .5)}"`);
      case 'wide': return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="9.5" ry="12" fill="${EYE}"/>${shine(x, y, 1.15)}`;
      case 'sadeye': return `<ellipse cx="${f1(x)}" cy="${f1(y + 1)}" rx="8" ry="10.5" fill="${EYE}"/><circle cx="${f1(x - 2)}" cy="${f1(y - 3)}" r="4.4" fill="#fff"/><circle cx="${f1(x + 3)}" cy="${f1(y + 4)}" r="2" fill="#fff"/>`;
      case 'half': return `<path d="M${x - 8} ${y - 1}A8 9.5 0 0 0 ${x + 8} ${y - 1}Z" fill="${EYE}"/><path d="M${x - 8.5} ${y - 1}H${x + 8.5}" ${sw}/><circle cx="${f1(x - 2.5)}" cy="${f1(y + 3)}" r="2.2" fill="#fff"/>`;
      case 'blink': return `<path d="M${x - 8} ${y + 1}H${x + 8}" ${sw}/>`;
      case 'closed': return `<path d="M${x - 8} ${y - 1}Q${x} ${y + 7} ${x + 8} ${y - 1}" ${sw}/>`;
      case 'happy': return `<path d="M${x - 8} ${y + 4}Q${x} ${y - 9} ${x + 8} ${y + 4}" ${sw}/>`;
      case 'squint': { const d = side < 0 ? 1 : -1; return `<path d="M${x - 7 * d} ${y - 7}L${x + 6 * d} ${y}L${x - 7 * d} ${y + 7}" ${sw}/>`; }
      case 'star': return `<path d="M${x} ${y - 13}L${x + 3.6} ${y - 3.6}L${x + 13} ${y}L${x + 3.6} ${y + 3.6}L${x} ${y + 13}L${x - 3.6} ${y + 3.6}L${x - 13} ${y}L${x - 3.6} ${y - 3.6}Z" fill="${PURPLE}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
      case 'up': return `<ellipse cx="${f1(x + gx * .5)}" cy="${f1(y - 2)}" rx="8" ry="10.5" fill="${EYE}"/><circle cx="${f1(x + gx * .5 - 2)}" cy="${f1(y - 6)}" r="3.4" fill="#fff"/><circle cx="${f1(x + gx * .5 + 3)}" cy="${f1(y + 3)}" r="1.5" fill="#fff"/>`;
    }
    return '';
  }
  function brow(a, x, y, side) {
    if (a === null || a === undefined) return '';
    const ang = a * side * -1; // positive a = inner end up
    return `<g transform="rotate(${ang} ${x} ${y})"><path d="M${x - 7} ${y}H${x + 7}" stroke="${EYE}" stroke-width="3.4" stroke-linecap="round"/></g>`;
  }
  function mouth(kind, x, y) {
    const sw = `stroke="${EYE}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    const tongue = (cx, cy, rx) => `<path d="M${cx - rx} ${cy}Q${cx} ${cy - rx * .9} ${cx + rx} ${cy}Q${cx} ${cy + rx * .55} ${cx - rx} ${cy}Z" fill="#F08AB2"/>`;
    switch (kind) {
      case 'smile': return `<path d="M${x - 8} ${y}Q${x} ${y + 8} ${x + 8} ${y}" ${sw}/>`;
      case 'tiny': return `<path d="M${x - 4.5} ${y + 1}Q${x} ${y + 5} ${x + 4.5} ${y + 1}" ${sw}/>`;
      case 'smirk': return `<path d="M${x - 7} ${y + 2}Q${x + 1} ${y + 7} ${x + 8} ${y - 2}" ${sw}/>`;
      case 'flat': return `<path d="M${x - 6} ${y + 2}H${x + 6}" ${sw}/>`;
      case 'sad': return `<path d="M${x - 7} ${y + 5}Q${x} ${y - 3} ${x + 7} ${y + 5}" ${sw}/>`;
      case 'wobble': return `<path d="M${x - 8} ${y + 3}Q${x - 4} ${y - 1} ${x} ${y + 3}Q${x + 4} ${y + 7} ${x + 8} ${y + 3}" ${sw}/>`;
      case 'o': return `<ellipse cx="${x}" cy="${y + 3}" rx="4.4" ry="5" fill="${EYE}"/>`;
      case 'grin': return `<path d="M${x - 11} ${y - 2}Q${x} ${y + 2} ${x + 11} ${y - 2}Q${x + 9} ${y + 13} ${x} ${y + 13}Q${x - 9} ${y + 13} ${x - 11} ${y - 2}Z" fill="${EYE}" stroke="${EYE}" stroke-width="2" stroke-linejoin="round"/><clipPath id="c${Math.round(x)}${Math.round(y)}g"><path d="M${x - 11} ${y - 2}Q${x} ${y + 2} ${x + 11} ${y - 2}Q${x + 9} ${y + 13} ${x} ${y + 13}Q${x - 9} ${y + 13} ${x - 11} ${y - 2}Z"/></clipPath><g clip-path="url(#c${Math.round(x)}${Math.round(y)}g)">${tongue(x, y + 12, 6)}</g>`;
      case 'cheer': return `<path d="M${x - 14} ${y - 3}Q${x} ${y + 2} ${x + 14} ${y - 3}Q${x + 12} ${y + 16} ${x} ${y + 16}Q${x - 12} ${y + 16} ${x - 14} ${y - 3}Z" fill="${EYE}" stroke="${EYE}" stroke-width="2" stroke-linejoin="round"/><clipPath id="c${Math.round(x)}${Math.round(y)}c"><path d="M${x - 14} ${y - 3}Q${x} ${y + 2} ${x + 14} ${y - 3}Q${x + 12} ${y + 16} ${x} ${y + 16}Q${x - 12} ${y + 16} ${x - 14} ${y - 3}Z"/></clipPath><g clip-path="url(#c${Math.round(x)}${Math.round(y)}c)">${tongue(x, y + 15, 8)}<path d="M${x - 11} ${y - 2}H${x + 11}" stroke="#fff" stroke-width="3"/></g>`;
      case 'pant': return `<path d="M${x - 8} ${y}Q${x} ${y + 3} ${x + 8} ${y}Q${x + 6} ${y + 9} ${x} ${y + 9}Q${x - 6} ${y + 9} ${x - 8} ${y}Z" fill="${EYE}" stroke="${EYE}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'yawn': return `<ellipse cx="${x}" cy="${y + 6}" rx="7.5" ry="10" fill="${EYE}"/><ellipse cx="${x}" cy="${y + 11}" rx="4.6" ry="3.6" fill="#F08AB2"/>`;
      case 'sleep': return `<ellipse cx="${x}" cy="${y + 3}" rx="3.4" ry="2.6" fill="${EYE}"/>`;
      case 'sleepbig': return `<ellipse cx="${x}" cy="${y + 4}" rx="4.4" ry="4" fill="${EYE}"/>`;
    }
    return '';
  }
  function sparkle(x, y, s, col = PURPLE) {
    return `<path d="M${x} ${y - s}Q${x + s * .18} ${y - s * .18} ${x + s} ${y}Q${x + s * .18} ${y + s * .18} ${x} ${y + s}Q${x - s * .18} ${y + s * .18} ${x - s} ${y}Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${col}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  function limb(x1, y1, a, bend, len, side, stage, band) {
    const rad = d => d * Math.PI / 180;
    const l1 = len * .56, l2 = len * .5;
    const dirx = s => side * Math.sin(rad(s)), diry = s => Math.cos(rad(s));
    const ex = x1 + dirx(a) * l1, ey = y1 + diry(a) * l1;
    const a2 = a + bend * (side < 0 ? 1 : -1) * -1;
    const hx = ex + dirx(a2) * l2, hy = ey + diry(a2) * l2;
    const pts = `M${f1(x1)} ${f1(y1)}L${f1(ex)} ${f1(ey)}L${f1(hx)} ${f1(hy)}`;
    let g = `<path d="${pts}" stroke="${INK}" stroke-width="${12 + OUT * 2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
      `<path d="${pts}" stroke="${BODY}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    if (band) { const bx = hx - dirx(a2) * 6, by = hy - diry(a2) * 6; g += `<path d="M${f1(bx - dirx(a2) * 3)} ${f1(by - diry(a2) * 3)}L${f1(bx + dirx(a2) * 3)} ${f1(by + diry(a2) * 3)}" stroke="${PURPLE}" stroke-width="12.5" stroke-linecap="butt"/>`; }
    return { g, hx, hy, a2 };
  }
  function foot(x, y, stage, flip) {
    const sneaker = stage >= 2;
    const rx = stage === 1 ? 13 : 15, ry = stage === 1 ? 7 : 8;
    let g = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${PURPLE}" stroke="${INK}" stroke-width="${OUT}"/>`;
    if (sneaker) g += `<path d="M${f1(x - rx + 3)} ${f1(y + ry - 3)}Q${f1(x)} ${f1(y + ry + 0.5)} ${f1(x + rx - 3)} ${f1(y + ry - 3)}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
    if (stage >= 4) g += `<path d="M${f1(x - 4)} ${f1(y - 3)}H${f1(x + 5)}" stroke="${LAV}" stroke-width="2.4" stroke-linecap="round"/>`;
    return g;
  }
  function fxLayer(list, X) {
    let g = '';
    list.forEach(e => {
      const [k, a, b, c] = Array.isArray(e) ? e : [e];
      if (k === 'sweat') g += `<path d="M${X.cx + X.hw - 4 + (a || 0)} ${X.top + 14 + (b || 0)}q5 9 0 13q-5 -4 0 -13z" fill="#BFE3FF" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
      if (k === 'tear') g += `<path d="M${X.cx - 22 + (a || 0)} ${X.top + X.h * .44 + 12 + (b || 0)}q4 8 0 11q-4 -3 0 -11z" fill="#BFE3FF" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
      if (k === 'zzz') {
        const n = a || 1; let z = '';
        for (let i = 0; i < n; i++) { const s = 9 + i * 4, zx = X.cx + X.hw - 6 + i * 11, zy = X.top - 4 - i * 17; z += `<path d="M${zx} ${zy}h${s}l${-s} ${s}h${s}" stroke="${PURPLE}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`; }
        g += z;
      }
      if (k === 'dust') { const d = a || 0; g += [-1, 1].map(s => `<circle cx="${CX + s * (46 + d * 5)}" cy="${GROUND - 3 - d * 1.5}" r="${6 - d * .8}" fill="#E7E1F5"/><circle cx="${CX + s * (60 + d * 7)}" cy="${GROUND - 1 - d}" r="${4 - d * .5}" fill="#E7E1F5"/>`).join(''); }
      if (k === 'sparkles') { const t = a || 0; [[-62, -18, 9], [66, -34, 11], [-48, -62, 7], [56, -78, 8], [0, -92, 10]].forEach((p, i) => { const s = p[2] * (.6 + .4 * Math.sin(t + i)); g += sparkle(CX + p[0], X.top + 40 + p[1] - ((t * 3 + i * 5) % 14), s, i % 2 ? LAV : PURPLE); }); }
      if (k === 'burst') { const r0 = a || 20, r1 = r0 + (b || 24); let l = ''; for (let i = 0; i < 12; i++) { const an = i * 30 * Math.PI / 180; l += `<path d="M${f1(CX + Math.cos(an) * r0)} ${f1(X.mid + Math.sin(an) * r0)}L${f1(CX + Math.cos(an) * r1)} ${f1(X.mid + Math.sin(an) * r1)}" stroke="${i % 2 ? LAV : PURPLE}" stroke-width="5" stroke-linecap="round"/>`; } g += l; }
      if (k === 'ring') g += `<ellipse cx="${CX}" cy="${X.mid}" rx="${a}" ry="${a * 1.05}" fill="none" stroke="${LAV}" stroke-width="${b || 5}"/>`;
      if (k === 'think') { const n = a || 3; const dots = [[X.cx + X.hw + 4, X.top + 30, 4], [X.cx + X.hw + 14, X.top + 12, 6], [X.cx + X.hw + 12, X.top - 24, 17]]; dots.slice(0, n).forEach((d, i) => { g += `<circle cx="${d[0]}" cy="${d[1]}" r="${d[2]}" fill="#fff" stroke="${INK}" stroke-width="2.4"/>`; }); if (n >= 3) g += `<path d="M${X.cx + X.hw + 7} ${X.top - 30}q0 -6 5 -6t5 5q0 4 -5 7v3" stroke="${PURPLE}" stroke-width="3.2" stroke-linecap="round" fill="none"/><circle cx="${X.cx + X.hw + 12}" cy="${X.top - 14}" r="1.9" fill="${PURPLE}"/>`; }
      if (k === 'heart') g += `<path d="M${CX + (a || 50)} ${X.top + 10 + (b || 0)}c-8 -9 -19 2 -9 11l9 8l9 -8c10 -9 -1 -20 -9 -11z" fill="${PURPLE}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
      if (k === 'dumbbell') { const bx = a, by = b; g += `<g transform="translate(${f1(bx)} ${f1(by)})"><path d="M-24 0H24" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M-24 0H24" stroke="#8D86A3" stroke-width="4" stroke-linecap="round"/><rect x="-33" y="-12" width="11" height="24" rx="4" fill="${PURPLE}" stroke="${INK}" stroke-width="2.6"/><rect x="22" y="-12" width="11" height="24" rx="4" fill="${PURPLE}" stroke="${INK}" stroke-width="2.6"/></g>`; }
      if (k === 'speed') g += [0, 1, 2].map(i => `<path d="M${CX + (a || 58)} ${X.top + 34 + i * 22}h${22 - i * 5}" stroke="${LAV}" stroke-width="4" stroke-linecap="round"/>`).join('');
      if (k === 'note') g += `<path d="M${CX + 54} ${X.top + 22}v-18l12 -3v16" stroke="${PURPLE}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="${CX + 52}" cy="${X.top + 24}" r="4" fill="${PURPLE}"/><circle cx="${CX + 64}" cy="${X.top + 21}" r="4" fill="${PURPLE}"/>`;
      if (k === 'lines') g += [-1, 1].map(s => `<path d="M${CX + s * 70} ${X.top + 40}l${s * 10} -10M${CX + s * 72} ${X.top + 54}h${s * 13}" stroke="${LAV}" stroke-width="4" stroke-linecap="round"/>`).join('');
    });
    return g;
  }

  /* ---------- one frame ---------- */
  function frame(stageNo, pose) {
    const p = Object.assign({}, D, pose);
    const sn = Math.min(5, Math.max(1, stageNo + (p.st || 0)));
    const S = STAGES[sn - 1];
    const w = S.w + p.sx, h = S.h + p.sy, hw = w / 2;
    const fy = GROUND + p.dy;
    const bb = fy - 12 - S.L * p.lg;
    const top = bb - h;
    const mid = top + h * .55;
    const X = { cx: CX, hw, top, h, mid };
    const lean = p.lean;
    const sil = p.sil;
    // feet & legs
    const spread = w * .2 + p.sp;
    const fLx = CX - spread + p.fl[0], fLy = fy - 7 + p.fl[1], fRx = CX + spread + p.fr[0], fRy = fy - 7 + p.fr[1];
    let back = '', legs = '';
    // ground shadow (separate shape, not part of character)
    const lift = Math.max(0, -p.dy);
    const shw = Math.max(26, 54 - lift * .5 + (p.dy > -1 ? (p.sx * .3) : 0));
    back += `<ellipse cx="${CX}" cy="${GROUND + 1}" rx="${f1(shw)}" ry="${f1(Math.max(5, 9 - lift * .06))}" fill="#251656" opacity="${f1(Math.max(.07, .17 - lift * .0016))}"/>`;
    // cape / wings behind (stage 5), scarf stage 4 back
    if (sn === 5) back += `<g transform="translate(${CX} ${f1(top + h * .5)})"><path d="M-${hw - 6} -6C-${hw + 34} -14 -${hw + 40} 36 -${hw + 22} 62C-${hw + 8} 38 -${hw - 2} 26 -${hw - 8} 22Z" fill="${PURPLE}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/><path d="M${hw - 6} -6C${hw + 34} -14 ${hw + 40} 36 ${hw + 22} 62C${hw + 8} 38 ${hw - 2} 26 ${hw - 8} 22Z" fill="${PURPLE}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/><path d="M-${hw + 10} 12C-${hw + 18} 24 -${hw + 18} 34 -${hw + 14} 44M${hw + 10} 12C${hw + 18} 24 ${hw + 18} 34 ${hw + 14} 44" stroke="${LAV}" stroke-width="3" stroke-linecap="round" fill="none"/></g>`;
    const legCol = (x0, y0, x1, y1) => `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" stroke="${INK}" stroke-width="${13 + OUT * 2}" stroke-linecap="round"/><path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" stroke="${BODY}" stroke-width="13" stroke-linecap="round"/>`;
    if (sn >= 3) legs += legCol(CX - w * .19, bb - 6, fLx, fLy - 6) + legCol(CX + w * .19, bb - 6, fRx, fRy - 6);
    legs += foot(fLx, fLy, sn) + foot(fRx, fRy, sn);
    // arms
    const shY = top + h * .6, shX = hw - 3;
    const band = sn >= 3;
    const aL = limb(CX - shX, shY, p.aL, p.bL, S.arm, -1, sn, band);
    const aR = limb(CX + shX, shY, p.aR, p.bR, S.arm, 1, sn, band);
    const hand = (a, s) => `<circle cx="${f1(a.hx)}" cy="${f1(a.hy)}" r="${sn === 1 ? 6.4 : 7.4}" fill="${BODY}" stroke="${INK}" stroke-width="${OUT}"/>`;
    const arms = aL.g + aR.g + hand(aL) + hand(aR);
    // body
    const bp = bodyPath(CX, top, bb, w);
    let body;
    if (sil) body = `<path d="${bp}" fill="#EFE7FF" stroke="${LAV}" stroke-width="${OUT + 1}" stroke-linejoin="round"/>`;
    else {
      const bellyW = w * .5, bellyH = h * .34;
      body = `<path d="${bp}" fill="${BODY}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>` +
        `<path d="M${f1(CX - hw * .55)} ${f1(top + h * .86)}Q${f1(CX)} ${f1(bb - 1)} ${f1(CX + hw * .55)} ${f1(top + h * .86)}" stroke="#E4DEF1" stroke-width="5" stroke-linecap="round" fill="none"/>` +
        `<ellipse cx="${CX}" cy="${f1(top + h * .8)}" rx="${f1(bellyW / 2)}" ry="${f1(bellyH / 2)}" fill="${BELLY}"/>`;
      // purple pace mark on belly (the logo P, scaled)
      const k = Math.min(w, 120) / 120 * .1;
      body += `<g transform="translate(${CX - 3 * k * 4} ${f1(top + h * .8 - 11)}) scale(${f1(k)})" fill="none" stroke="${PURPLE}" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"><path d="M70 110 L112 -64 H150 C206 -64 206 40 150 40 H96" transform="translate(-100 40)"/></g>`;
      if (sn >= 3) body += `<path d="M${f1(CX - hw + 3)} ${f1(top + h * .5)}Q${CX} ${f1(top + h * .56)} ${f1(CX + hw - 3)} ${f1(top + h * .5)}" stroke="${PURPLE}" stroke-width="0" fill="none"/>`;
      if (sn >= 4) head0 = true;
      if (sn === 5) body += `<g transform="translate(${CX} ${f1(top + h * .6)})"><path d="M-8 -2L-4 12M8 -2L4 12" stroke="${INK}" stroke-width="0"/></g><circle cx="${f1(CX + hw * .44)}" cy="${f1(top + h * .62)}" r="9" fill="${GOLD}" stroke="${INK}" stroke-width="2.6"/><path d="M${f1(CX + hw * .44 - 3.5)} ${f1(top + h * .62 + 3)}L${f1(CX + hw * .44)} ${f1(top + h * .62 - 4)}L${f1(CX + hw * .44 + 3.5)} ${f1(top + h * .62 + 3)}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    }
    // head accessories
    let head = '';
    var head0;
    const ey = top + h * .4, exL = CX - w * .19, exR = CX + w * .19;
    if (!sil) {
      const gx = p.gx, gy = p.gy;
      const fxo = gx * .6, fyo = gy * .4;
      if (sn >= 3) head += `<path d="M${f1(CX - hw * .94)} ${f1(top + h * .22)}Q${CX} ${f1(top + h * .12)} ${f1(CX + hw * .94)} ${f1(top + h * .22)}L${f1(CX + hw * .92)} ${f1(top + h * .285)}Q${CX} ${f1(top + h * .19)} ${f1(CX - hw * .92)} ${f1(top + h * .285)}Z" fill="${PURPLE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
      if (sn >= 4) head += `<path d="M${f1(CX + hw * .9)} ${f1(top + h * .25)}q${14 + p.cr * .6} ${4 + p.cr * .3} ${22 + p.cr} ${12 - p.cr * .4}q${-8} ${-2} ${-16} ${-2}q${10} ${6} ${14} ${16}q${-18} ${-10} ${-26} ${-10}z" fill="${PURPLE}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
      head += `<circle cx="${f1(exL - 12 + fxo)}" cy="${f1(ey + 15 + fyo)}" r="6.5" fill="${LAV}" opacity=".85"/><circle cx="${f1(exR + 12 + fxo)}" cy="${f1(ey + 15 + fyo)}" r="6.5" fill="${LAV}" opacity=".85"/>`;
      head += eye(p.eyes === 'wink' ? 'open' : p.eyes, exL + fxo, ey + fyo, gx, gy, -1) + eye(p.eyes === 'wink' ? 'happy' : p.eyes, exR + fxo, ey + fyo, gx, gy, 1);
      head += brow(p.bwL, exL + fxo, ey + fyo - 14 - p.buL, -1) + brow(p.bwR, exR + fxo, ey + fyo - 14 - p.buR, 1);
      head += mouth(p.mouth, CX + fxo, top + h * .56 + fyo);
    }
    const cresty = top;
    const cr = sil ? '' : crest(sn, CX + p.tilt * .2, cresty, p.cr, w);
    let figure = back.length ? '' : '';
    const char = arms + legs + body + head + cr;
    const rotated = rot(lean, CX, fy, char);
    const fxg = fxLayer(p.fx, X);
    return `<g>${back}${rotated}${fxg}</g>`;
  }
  const svg = (stage, pose, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -44 240 304" ${size ? `width="${size}" height="${size * 304 / 240}"` : ''}>${frame(stage, pose)}</svg>`;

  /* ---------- animation library: each row is one hand-set frame [duration ms, pose] ---------- */
  const A = {};
  const F = (ms, o) => [ms, o || {}];
  const rest = { aL: 12, aR: 12 };
  A.idle = { loop: true, frames: [
    F(900, rest),
    F(160, { sy: 1, aL: 14, aR: 14, cr: 1 }), F(260, { sy: 2, sx: -1, aL: 17, aR: 17, cr: 2 }), F(380, { sy: 2, sx: -1, aL: 17, aR: 17, cr: 2 }),
    F(200, { sy: 1, aL: 14, aR: 14, cr: 1 }), F(700, rest),
    F(60, { eyes: 'half' }), F(80, { eyes: 'blink' }), F(60, { eyes: 'half' }), F(800, rest),
    F(220, { gx: -2, cr: -1 }), F(900, { gx: -3.5, cr: -2, lean: -1 }), F(220, { gx: -1.5 }), F(500, rest),
    F(220, { gx: 2, cr: 1 }), F(900, { gx: 3.5, cr: 2, lean: 1 }), F(220, { gx: 1.5 }), F(700, rest),
    F(160, { sy: 1, aL: 14, aR: 14 }), F(260, { sy: 2, sx: -1, aL: 17, aR: 17, cr: 2 }), F(340, { sy: 2, sx: -1, aL: 17, aR: 17, cr: 2 }), F(200, { sy: 1 }), F(500, rest),
    F(80, { eyes: 'half' }), F(80, { eyes: 'blink' }), F(80, { eyes: 'half' }),
    F(300, { fl: [0, 0], lean: 2, mouth: 'tiny', aL: 8, aR: 16 }), F(480, { lean: 3, sp: 3, aL: 6, aR: 18, mouth: 'tiny' }), F(300, { lean: 1.5, aL: 9, aR: 15 }), F(700, rest)
  ] };
  A.happy = { frames: [
    F(110, { eyes: 'happy', mouth: 'grin' }),
    F(90, { eyes: 'happy', mouth: 'grin', sy: -6, sx: 6, lg: .25, aL: 20, aR: 20 }),
    F(80, { eyes: 'happy', mouth: 'grin', dy: -9, sy: 5, sx: -3, lg: 1, aL: 60, aR: 60, fl: [0, -3], fr: [0, -3] }),
    F(80, { eyes: 'happy', mouth: 'cheer', dy: -27, sy: 4, sx: -2, aL: 100, aR: 100, bL: 20, bR: 20, fl: [-3, -9], fr: [3, -9], cr: -4 }),
    F(110, { eyes: 'happy', mouth: 'cheer', dy: -36, sy: 2, aL: 125, aR: 125, bL: 14, bR: 14, fl: [-4, -11], fr: [4, -11], cr: -6 }),
    F(80, { eyes: 'happy', mouth: 'grin', dy: -24, sy: 3, aL: 100, aR: 100, fl: [-2, -8], fr: [2, -8], cr: 3 }),
    F(70, { eyes: 'happy', mouth: 'grin', dy: -8, sy: 5, sx: -3, aL: 60, aR: 60, fl: [0, -3], fr: [0, -3], cr: 5 }),
    F(90, { eyes: 'happy', mouth: 'grin', sy: -8, sx: 8, lg: .2, aL: 30, aR: 30, fx: [['dust', 0]], cr: 6 }),
    F(90, { eyes: 'happy', mouth: 'grin', sy: 3, sx: -2, aL: 24, aR: 24, fx: [['dust', 2]], cr: -3 }),
    F(80, { eyes: 'happy', mouth: 'grin', dy: -15, sy: 4, sx: -2, aL: 70, aR: 70, fl: [0, -5], fr: [0, -5] }),
    F(80, { eyes: 'happy', mouth: 'grin', dy: -6, sy: 3, aL: 40, aR: 40, fl: [0, -2], fr: [0, -2] }),
    F(80, { eyes: 'happy', mouth: 'smile', sy: -4, sx: 4, lg: .5, aL: 20, aR: 20 }),
    F(220, { eyes: 'happy', mouth: 'smile', sy: 1, aL: 14, aR: 14 }),
    F(500, { eyes: 'open', mouth: 'smile', aL: 12, aR: 12 })
  ] };
  A.celebrating = { frames: [
    F(100, { eyes: 'open', mouth: 'smile' }),
    F(110, { eyes: 'wide', mouth: 'o', sy: -9, sx: 9, lg: .1, aL: 25, aR: 25, bwL: 10, bwR: 10, buL: 3, buR: 3 }),
    F(90, { eyes: 'squint', mouth: 'cheer', dy: -12, sy: 8, sx: -5, aL: 80, aR: 80, fl: [0, -3], fr: [0, -3], cr: -6 }),
    F(90, { eyes: 'squint', mouth: 'cheer', dy: -40, sy: 6, sx: -4, aL: 140, aR: 140, bL: 12, bR: 12, fl: [-5, -12], fr: [5, -12], cr: -9, fx: [['sparkles', 0]] }),
    F(130, { eyes: 'squint', mouth: 'cheer', dy: -50, sy: 3, aL: 165, aR: 165, fl: [-6, -14], fr: [6, -14], cr: -12, fx: [['sparkles', 1.2]] }),
    F(130, { eyes: 'squint', mouth: 'cheer', dy: -54, sy: 2, aL: 170, aR: 170, fl: [-6, -16], fr: [6, -16], cr: 0, fx: [['sparkles', 2.4]] }),
    F(100, { eyes: 'squint', mouth: 'cheer', dy: -50, sy: 3, aL: 150, aR: 150, fl: [-4, -12], fr: [4, -12], cr: 10, fx: [['sparkles', 3.6]] }),
    F(90, { eyes: 'happy', mouth: 'grin', dy: -26, sy: 5, aL: 110, aR: 110, fl: [-2, -7], fr: [2, -7], cr: 12, fx: [['sparkles', 4.8]] }),
    F(80, { eyes: 'happy', mouth: 'grin', dy: -8, sy: 6, sx: -3, aL: 70, aR: 70, cr: 8 }),
    F(110, { eyes: 'wide', mouth: 'o', sy: -12, sx: 12, lg: 0, aL: 30, aR: 30, sp: 6, fx: [['dust', 0]], cr: 9 }),
    F(100, { eyes: 'happy', mouth: 'grin', sy: 4, sx: -3, sp: 4, aL: 60, aR: 60, fx: [['dust', 2]], cr: -5 }),
    F(120, { eyes: 'happy', mouth: 'cheer', sy: 1, sp: 8, lean: -3, aL: 40, aR: 150, bR: 25, cr: 2, fx: [['sparkles', 0.5]] }),
    F(380, { eyes: 'happy', mouth: 'cheer', sy: 2, sp: 8, lean: -4, aL: 38, aR: 158, bR: 20, fx: [['sparkles', 1.3]] }),
    F(380, { eyes: 'happy', mouth: 'cheer', sy: 2, sp: 8, lean: -4, aL: 38, aR: 158, bR: 20, fx: [['sparkles', 2.1]] }),
    F(260, { eyes: 'happy', mouth: 'grin', sy: 1, sp: 5, lean: -2, aL: 24, aR: 100, fx: [['sparkles', 3]] }),
    F(300, { eyes: 'open', mouth: 'smile', aL: 14, aR: 14 })
  ] };
  const stand = { mouth: 'pant', bwL: -12, bwR: -12 };
  A.training = { frames: [
    F(260, { mouth: 'smile', bwL: -10, bwR: -10 }),
    // squats
    F(150, { ...stand, sy: -6, sx: 4, lg: .6, aL: 70, aR: 70, sp: 3 }), F(160, { ...stand, sy: -14, sx: 8, lg: .15, aL: 90, aR: 90, sp: 7, fx: [['sweat']] }),
    F(240, { ...stand, sy: -16, sx: 9, lg: 0, aL: 92, aR: 92, sp: 8, fx: [['sweat']] }), F(160, { ...stand, sy: -6, sx: 4, lg: .6, aL: 70, aR: 70, sp: 3 }), F(160, { ...stand, sy: 2, lg: 1, aL: 40, aR: 40 }),
    F(150, { ...stand, sy: -6, sx: 4, lg: .6, aL: 70, aR: 70, sp: 3 }), F(200, { ...stand, sy: -15, sx: 9, lg: 0, aL: 92, aR: 92, sp: 8, fx: [['sweat', 0, 8]] }), F(150, { ...stand, sy: 2, lg: 1, aL: 30, aR: 30 }),
    // stretch
    F(200, { eyes: 'closed', mouth: 'smile', aL: 120, aR: 120, sy: 3, lean: 0 }), F(300, { eyes: 'closed', mouth: 'smile', aL: 170, aR: 170, sy: 6, sx: -4, cr: -4 }), F(380, { eyes: 'closed', mouth: 'smile', aL: 174, aR: 174, sy: 7, sx: -4, lean: 7, cr: -6 }), F(380, { eyes: 'closed', mouth: 'smile', aL: 174, aR: 174, sy: 7, sx: -4, lean: -7, cr: 6 }), F(220, { eyes: 'closed', mouth: 'smile', aL: 120, aR: 120, sy: 2 }),
    // run
    F(100, { ...stand, lean: 9, aL: 60, aR: 20, bL: 60, bR: 50, fl: [-12, -9], fr: [14, 0], fx: [['speed']] }), F(100, { ...stand, lean: 9, dy: -5, aL: 40, aR: 40, bL: 40, bR: 40, fl: [0, -4], fr: [0, -4], fx: [['speed']] }),
    F(100, { ...stand, lean: 9, aL: 20, aR: 60, bL: 50, bR: 60, fl: [14, 0], fr: [-12, -9], fx: [['speed']] }), F(100, { ...stand, lean: 9, dy: -5, aL: 40, aR: 40, bL: 40, bR: 40, fl: [0, -4], fr: [0, -4], fx: [['speed']] }),
    F(100, { ...stand, lean: 9, aL: 60, aR: 20, bL: 60, bR: 50, fl: [-12, -9], fr: [14, 0], fx: [['speed'], ['sweat']] }), F(100, { ...stand, lean: 9, dy: -5, aL: 40, aR: 40, bL: 40, bR: 40, fl: [0, -4], fr: [0, -4], fx: [['speed']] }),
    F(100, { ...stand, lean: 9, aL: 20, aR: 60, bL: 50, bR: 60, fl: [14, 0], fr: [-12, -9], fx: [['speed']] }), F(140, { ...stand, lean: 4, aL: 30, aR: 30 }),
    // lift
    F(200, { ...stand, sy: -6, sx: 3, lg: .5, aL: 20, aR: 20, bL: 10, bR: 10, fx: [['dumbbell', CX - 4, GROUND - 52]] }), F(240, { ...stand, sy: -2, lg: .8, aL: 45, aR: 45, bL: 120, bR: 120, fx: [['dumbbell', CX, GROUND - 98]] }),
    F(240, { ...stand, sy: 4, lg: 1, aL: 165, aR: 165, bL: 8, bR: 8, cr: -5, fx: [['dumbbell', CX, GROUND - 205 + 40], ['sweat']] }), F(300, { ...stand, sy: 5, lg: 1, aL: 170, aR: 170, bL: 4, bR: 4, fx: [['dumbbell', CX, GROUND - 205 + 28], ['sweat']] }),
    F(220, { ...stand, sy: -2, lg: .8, aL: 45, aR: 45, bL: 120, bR: 120, fx: [['dumbbell', CX, GROUND - 98]] }), F(220, { ...stand, sy: -6, lg: .5, aL: 20, aR: 20, bL: 10, bR: 10, fx: [['dumbbell', CX - 4, GROUND - 52]] }),
    F(400, { eyes: 'happy', mouth: 'grin', aL: 20, aR: 20, sy: 1 })
  ] };
  const tired = { eyes: 'half', bwL: 12, bwR: 12 };
  A.tired = { frames: [
    F(300, { ...tired, mouth: 'flat', aL: 8, aR: 8 }),
    F(500, { ...tired, mouth: 'flat', sy: -5, sx: 5, lg: .7, aL: 4, aR: 4, cr: 6, lean: 1 }),
    F(700, { ...tired, mouth: 'wobble', sy: -8, sx: 7, lg: .5, aL: 2, aR: 2, bL: -6, bR: -6, cr: 10, lean: 2, fx: [['sweat']] }),
    F(500, { eyes: 'blink', mouth: 'yawn', sy: -4, sx: 3, lg: .7, aL: 20, aR: 20, cr: 5 }),
    F(700, { eyes: 'blink', mouth: 'yawn', sy: 2, sx: -2, lg: 1, aL: 70, aR: 70, bL: 10, bR: 10, cr: 0, lean: -1 }),
    F(500, { ...tired, mouth: 'flat', sy: -6, sx: 5, lg: .6, aL: 4, aR: 4, cr: 8, lean: 2 }),
    F(500, { eyes: 'half', mouth: 'o', sy: 1, aL: 30, aR: 30, cr: 3 }),
    F(500, { eyes: 'open', mouth: 'tiny', sy: 2, sx: -1, aL: 22, aR: 22, cr: 0 }),
    F(400, { eyes: 'open', mouth: 'smile', aL: 12, aR: 12 })
  ] };
  const sl = (o) => ({ eyes: 'closed', mouth: 'sleep', lg: .1, sx: 7, sy: -12, aL: 3, aR: 3, lean: 3, cr: 9, ...o });
  A.sleeping = { loop: true, frames: [
    F(500, sl({ sy: -12, fx: [['zzz', 1]] })), F(500, sl({ sy: -11, fx: [['zzz', 1]] })), F(500, sl({ sy: -10, sx: 6, mouth: 'sleepbig', fx: [['zzz', 2]] })),
    F(600, sl({ sy: -9, sx: 5, mouth: 'sleepbig', fx: [['zzz', 2]] })), F(500, sl({ sy: -10, sx: 6, fx: [['zzz', 3]] })), F(500, sl({ sy: -11, fx: [['zzz', 3]] })),
    F(600, sl({ sy: -12, sx: 7, fx: [['zzz', 2]] })), F(500, sl({ sy: -12, sx: 7, fx: [['zzz', 1]] }))
  ] };
  A.levelup = { frames: [
    F(180, { eyes: 'open', mouth: 'tiny' }),
    F(160, { eyes: 'closed', mouth: 'flat', sy: -7, sx: 6, lg: .2, aL: 25, aR: 25, cr: 3 }),
    F(160, { eyes: 'closed', mouth: 'flat', sy: -11, sx: 9, lg: 0, aL: 60, aR: 60, cr: 5, fx: [['ring', 80, 3]] }),
    F(160, { eyes: 'closed', mouth: 'flat', sy: -11, sx: 9, lg: 0, aL: 80, aR: 80, cr: 3, fx: [['ring', 64, 4]] }),
    F(150, { eyes: 'closed', mouth: 'o', sy: -9, sx: 7, lg: 0, aL: 95, aR: 95, fx: [['ring', 50, 5], ['sparkles', 0.4]] }),
    F(130, { sil: 1, sy: -3, aL: 100, aR: 100, fx: [['ring', 34, 6], ['sparkles', 1.6]] }),
    F(120, { sil: 1, sy: 6, sx: -4, dy: -10, aL: 120, aR: 120, fx: [['burst', 28, 18], ['sparkles', 2.2]] }),
    F(110, { sil: 1, st: 1, sy: 8, sx: -4, dy: -18, aL: 140, aR: 140, fx: [['burst', 52, 30], ['sparkles', 2.8]] }),
    F(100, { sil: 1, st: 1, dy: -24, aL: 150, aR: 150, fx: [['burst', 90, 30], ['ring', 100, 4]] }),
    F(100, { st: 1, eyes: 'star', mouth: 'cheer', dy: -42, sy: 4, aL: 165, aR: 165, fl: [-5, -12], fr: [5, -12], cr: -8, fx: [['burst', 96, 22], ['sparkles', 3.4]] }),
    F(140, { st: 1, eyes: 'star', mouth: 'cheer', dy: -60, sy: 2, aL: 170, aR: 170, fl: [-6, -14], fr: [6, -14], fx: [['sparkles', 4.2]] }),
    F(140, { st: 1, eyes: 'squint', mouth: 'cheer', dy: -48, sy: 2, aL: 170, aR: 170, cr: 8, fl: [-6, -14], fr: [6, -14], fx: [['sparkles', 5]] }),
    F(110, { st: 1, eyes: 'squint', mouth: 'grin', dy: -30, sy: 5, aL: 120, aR: 120, cr: 12, fx: [['sparkles', 5.8]] }),
    F(90, { st: 1, eyes: 'happy', mouth: 'grin', dy: -8, sy: 7, sx: -3, aL: 80, aR: 80, cr: 8 }),
    F(120, { st: 1, eyes: 'wide', mouth: 'o', sy: -10, sx: 10, lg: 0, sp: 6, aL: 40, aR: 40, fx: [['dust', 0]], cr: 8 }),
    F(110, { st: 1, eyes: 'happy', mouth: 'grin', sy: 4, sx: -3, sp: 4, aL: 70, aR: 70, fx: [['dust', 2]] }),
    F(420, { st: 1, eyes: 'happy', mouth: 'cheer', sy: 2, sp: 9, lean: -3, aL: 40, aR: 156, bR: 20, fx: [['sparkles', 6.4]] }),
    F(420, { st: 1, eyes: 'happy', mouth: 'cheer', sy: 2, sp: 9, lean: -3, aL: 40, aR: 156, bR: 20, fx: [['sparkles', 7.2]] }),
    F(300, { st: 1, eyes: 'open', mouth: 'smile', aL: 14, aR: 14 })
  ] };
  A.thinking = { frames: [
    F(200, { eyes: 'open', mouth: 'tiny' }),
    F(220, { eyes: 'open', mouth: 'tiny', gx: -2.5, gy: -2.5, lean: 3, bwL: 0, bwR: 0, buR: 3, aR: 60, bR: 30, fx: [['think', 1]] }),
    F(260, { eyes: 'up', mouth: 'smirk', gx: -3, gy: -3, lean: 5, bwL: -4, bwR: 6, buR: 4, aR: 118, bR: 108, cr: -4, fx: [['think', 2]] }),
    F(520, { eyes: 'up', mouth: 'smirk', gx: -3.5, gy: -3.5, lean: 6, bwL: -4, bwR: 7, buR: 4, aR: 126, bR: 118, cr: -5, fx: [['think', 3]] }),
    F(260, { eyes: 'open', mouth: 'flat', gx: 3, gy: -2, lean: 6, bwL: -4, bwR: 7, buR: 4, aR: 126, bR: 118, cr: -3, fx: [['think', 3]] }),
    F(520, { eyes: 'open', mouth: 'flat', gx: 3.5, gy: -2.5, lean: 4, bwL: 0, bwR: 6, buR: 4, aR: 126, bR: 118, cr: 3, fx: [['think', 3]] }),
    F(280, { eyes: 'up', mouth: 'o', gx: 0, gy: -3, lean: 2, bwL: 8, bwR: 8, buL: 5, buR: 5, aR: 60, bR: 30, fx: [['think', 2]] }),
    F(300, { eyes: 'wide', mouth: 'grin', gx: 0, gy: 0, lean: 0, bwL: 6, bwR: 6, buL: 6, buR: 6, dy: -6, sy: 3, aL: 30, aR: 30, fx: [['sparkles', 0.6]] }),
    F(200, { eyes: 'happy', mouth: 'grin', sy: -3, sx: 3, lg: .5, aL: 20, aR: 20 }),
    F(400, { eyes: 'open', mouth: 'smile', aL: 12, aR: 12 })
  ] };
  A.greeting = { frames: [
    F(120, { eyes: 'open', mouth: 'smile' }),
    F(110, { eyes: 'happy', mouth: 'grin', sy: -5, sx: 4, lg: .4, aL: 14, aR: 40 }),
    F(100, { eyes: 'happy', mouth: 'grin', dy: -12, sy: 4, aL: 14, aR: 120, bR: 30, fl: [0, -4], fr: [0, -4] }),
    F(100, { eyes: 'happy', mouth: 'grin', sy: -3, sx: 3, lg: .6, aL: 14, aR: 150, bR: 35, lean: -2 }),
    F(140, { eyes: 'happy', mouth: 'grin', sy: 1, aL: 12, aR: 150, bR: 70, lean: -3, cr: -3 }),
    F(140, { eyes: 'happy', mouth: 'grin', sy: 1, aL: 12, aR: 150, bR: -30, lean: -2, cr: 3 }),
    F(140, { eyes: 'happy', mouth: 'grin', sy: 1, aL: 12, aR: 150, bR: 70, lean: -3, cr: -3 }),
    F(140, { eyes: 'happy', mouth: 'grin', sy: 1, aL: 12, aR: 150, bR: -30, lean: -2, cr: 3 }),
    F(160, { eyes: 'happy', mouth: 'smile', aL: 12, aR: 100, bR: 30, lean: -1, fx: [['heart', 50, -8]] }),
    F(200, { eyes: 'open', mouth: 'smile', aL: 12, aR: 40 }),
    F(300, { eyes: 'open', mouth: 'smile', aL: 12, aR: 12 })
  ] };
  A.disappointed = { frames: [
    F(220, { eyes: 'open', mouth: 'flat', gy: 1 }),
    F(320, { eyes: 'sadeye', mouth: 'sad', sy: -4, sx: 4, lg: .7, aL: 6, aR: 6, bwL: 14, bwR: 14, buL: 2, buR: 2, cr: 8, lean: 1 }),
    F(420, { eyes: 'sadeye', mouth: 'sad', sy: -7, sx: 6, lg: .5, aL: 3, aR: 3, bwL: 18, bwR: 18, buL: 3, buR: 3, cr: 12, lean: 2, gy: 2 }),
    F(520, { eyes: 'sadeye', mouth: 'wobble', sy: -8, sx: 7, lg: .5, aL: 2, aR: 2, bwL: 20, bwR: 20, buL: 3, buR: 3, cr: 14, lean: 3, gy: 3, fx: [['tear', 0, 0]] }),
    F(520, { eyes: 'sadeye', mouth: 'wobble', sy: -8, sx: 7, lg: .5, aL: 2, aR: 2, bwL: 20, bwR: 20, buL: 3, buR: 3, cr: 14, lean: 3, gy: 3, fx: [['tear', 0, 6]] }),
    F(420, { eyes: 'closed', mouth: 'o', sy: -2, sx: 2, lg: .9, aL: 6, aR: 6, bwL: 12, bwR: 12, cr: 8, lean: 1, fx: [['tear', 0, 12]] }),
    F(400, { eyes: 'open', mouth: 'tiny', sy: 0, aL: 10, aR: 10, bwL: 6, bwR: 6, cr: 3 }),
    F(400, { eyes: 'open', mouth: 'smile', aL: 12, aR: 12 })
  ] };
  const NAMES = Object.keys(A);

  const cache = {};
  function frames(anim, stage) {
    const k = anim + stage; if (cache[k]) return cache[k];
    const a = A[anim] || A.idle;
    return (cache[k] = a.frames.map(([ms, pose]) => ({ ms, svg: svg(stage, pose) })));
  }
  /* expressions: portrait poses for the expression sheet */
  const EXPR = {
    neutral: { eyes: 'open', mouth: 'smile' }, happy: { eyes: 'happy', mouth: 'grin' }, joy: { eyes: 'squint', mouth: 'cheer' }, wink: { eyes: 'wink', mouth: 'smirk' },
    surprised: { eyes: 'wide', mouth: 'o', bwL: 10, bwR: 10, buL: 3, buR: 3 }, thinking: { eyes: 'up', mouth: 'smirk', gx: -3, gy: -3, bwL: -4, bwR: 7, buR: 4 },
    determined: { eyes: 'open', mouth: 'pant', bwL: -14, bwR: -14 }, tired: { eyes: 'half', mouth: 'flat', bwL: 12, bwR: 12 }, sleepy: { eyes: 'closed', mouth: 'sleep' },
    sad: { eyes: 'sadeye', mouth: 'sad', bwL: 18, bwR: 18 }, crying: { eyes: 'sadeye', mouth: 'wobble', bwL: 20, bwR: 20, fx: [['tear', 0, 4]] }, star: { eyes: 'star', mouth: 'cheer' }
  };

  /* ---------- player: swaps whole hand-drawn frames, nothing is transformed ---------- */
  const players = new Set();
  let raf = 0, last = 0;
  function tick(t) {
    raf = requestAnimationFrame(tick);
    players.forEach(p => {
      if (!p.el.isConnected) { players.delete(p); return; }
      if (p.paused) return;
      if (!p.t0) p.t0 = t;
      const fr = p.frames[p.i];
      if (t - p.t0 >= fr.ms * p.speed) {
        p.t0 = t; p.i++;
        if (p.i >= p.frames.length) {
          if (A[p.anim].loop) p.i = 0;
          else { const n = p.queue.shift() || 'idle'; if (p.nextStage) { p.stage = p.nextStage; p.nextStage = 0; } p.set(n); return; }
        }
        p.draw();
      }
    });
  }
  function mount(el, opts = {}) {
    const p = { el, stage: opts.stage || 1, anim: 'idle', frames: [], i: 0, t0: 0, speed: opts.speed || 1, queue: [], paused: false };
    p.set = (anim, stage) => { if (stage) p.stage = stage; p.anim = anim; p.frames = frames(anim, p.stage); p.i = 0; p.t0 = 0; p.draw(); if (opts.onAnim) opts.onAnim(anim); };
    p.draw = () => { el.innerHTML = p.frames[p.i].svg; };
    p.play = (anim, next) => { p.queue = next ? [].concat(next) : []; p.set(anim); };
    el._p = p; players.add(p);
    p.set(opts.anim || 'idle');
    if (!raf) raf = requestAnimationFrame(tick);
    return p;
  }
  const still = (stage, pose, size) => svg(stage, pose || {}, size);
  return { A, NAMES, STAGES, frames, svg, still, mount, EXPR, PURPLE, INK, LAV, CX, GROUND };
})();
if (typeof module !== 'undefined') module.exports = Mascot;
