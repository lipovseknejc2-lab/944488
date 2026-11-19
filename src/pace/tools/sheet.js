// usage: node tools-sheet.js out.svg stage anim [cols]  |  node tools-sheet.js out.svg stages | expr
const M = require('../mascot.js'); const fs = require('fs');
const [,, out, a, b, c] = process.argv;
let cells = [];
if (a === 'stages') cells = [1,2,3,4,5].map(s => ({ svg: M.svg(s, {eyes:'open',mouth:'smile'}), label: M.STAGES[s-1].n }));
else if (a === 'expr') cells = Object.entries(M.EXPR).map(([k,p]) => ({ svg: M.svg(+b||3, p), label: k }));
else { const st = +a; cells = M.frames(b, st).map((f,i)=>({svg:f.svg,label:i+1+' · '+f.ms+'ms'})); }
const cols = +(c||(a==="stages"?5:6)), W = 160, H = 212, rows = Math.ceil(cells.length/cols);
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols*W}" height="${rows*H}" viewBox="0 0 ${cols*W} ${rows*H}"><rect width="100%" height="100%" fill="#FBFAF7"/>`;
cells.forEach((c,i)=>{ const x=(i%cols)*W,y=Math.floor(i/cols)*H; s+=`<rect x="${x+2}" y="${y+2}" width="${W-4}" height="${H-4}" fill="#fff" stroke="#E6E1F0"/>`+c.svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${W}" height="${H-16}" `)+`<text x="${x+8}" y="${y+H-6}" font-size="11" fill="#555" font-family="sans-serif">${c.label}</text>`; });
fs.writeFileSync(out, s+'</svg>');
