// Exports every hand-set frame as its own SVG file plus contact sheets, in the asset layout of the brief.
const M = require('../mascot.js'), fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.join(__dirname, '..', 'assets', 'mascot');
const w = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(root, { recursive: true, force: true });
const manifest = { character: 'Pip', viewBox: '0 -44 240 304', ground: M.GROUND, stages: M.STAGES.map(s => s.n), animations: {} };
let n = 0;
for (let st = 1; st <= 5; st++) {
  const sd = 'stage-0' + st;
  w(`${root}/${sd}/base.svg`, M.svg(st, { eyes: 'open', mouth: 'smile' }));
  for (const a of M.NAMES) {
    const fr = M.frames(a, st);
    manifest.animations[a] = { loop: !!M.A[a].loop, frames: fr.length, ms: fr.map(f => f.ms) };
    fr.forEach((f, i) => { w(`${root}/animations/${a}/${sd}/frame-${String(i + 1).padStart(2, '0')}.svg`, f.svg); n++; });
  }
}
Object.entries(M.EXPR).forEach(([k, p]) => w(`${root}/expressions/${k}.svg`, M.svg(3, p)));
w(`${root}/manifest.json`, JSON.stringify(manifest, null, 1));
// contact sheets
const sheet = (name, cells, cols, W = 160, H = 212) => {
  const rows = Math.ceil(cells.length / cols);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * W}" height="${rows * H}" viewBox="0 0 ${cols * W} ${rows * H}"><rect width="100%" height="100%" fill="#FBFAF7"/>`;
  cells.forEach((c, i) => { const x = (i % cols) * W, y = Math.floor(i / cols) * H; s += `<rect x="${x + 2}" y="${y + 2}" width="${W - 4}" height="${H - 4}" fill="#fff" stroke="#E6E1F0"/>` + c.svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${W}" height="${H - 16}" `) + `<text x="${x + 8}" y="${y + H - 6}" font-size="11" fill="#555" font-family="sans-serif">${c.label}</text>`; });
  const f = `${root}/sheets/${name}`; w(f + '.svg', s + '</svg>');
  cp.execSync(`rsvg-convert -w ${Math.min(cols * W, 1400)} "${f}.svg" -o "${f}.png"`); fs.unlinkSync(f + '.svg');
};
sheet('stages', [1, 2, 3, 4, 5].map(s => ({ svg: M.svg(s, { eyes: 'open', mouth: 'smile' }), label: 'Stage ' + s + ' ' + M.STAGES[s - 1].n })), 5);
sheet('expressions', Object.entries(M.EXPR).map(([k, p]) => ({ svg: M.svg(3, p), label: k })), 6);
for (const a of M.NAMES) sheet('anim-' + a, M.frames(a, 3).map((f, i) => ({ svg: f.svg, label: `${i + 1} · ${f.ms}ms` })), 8);
// turnaround: stage progression plus the same pose at all five stages (front view only, see NOTES.md)
w(`${root}/turnaround/README.md`, 'Front-view stage line-up lives in sheets/stages.png. Side and back views are not drawn (see NOTES.md).\n');
w(`${root}/source/README.md`, 'Source of truth is src/pace/mascot.js: every frame is a pose table row that draws one SVG. Edit a row, run `node tools/export.js`.\n');
console.log('frames', n);
