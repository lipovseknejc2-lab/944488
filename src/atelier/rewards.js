/* ============ REWARDS: themes and profile frames unlocked by knots, profile quotes, profiles ============
   Knots are never spent: reaching a mark unlocks the item for good. A normal full day is about 1,600 knots,
   so the first theme takes a couple of weeks and the last one about two years of real use.
   Themes only change design tokens, so every screen and every new feature picks them up automatically. */
const mkT=(bg,bg2,card,card2,text,ink2,muted,accent,w1,w2,w3,wo)=>({bg,bg2,card,card2,text,ink2,muted,accent,w1,w2,w3,wo});
const SKINS=[
 {id:'clay',n:'Clay',d:'The original: warm paper, one clay accent.',at:0},
 {id:'harbour',n:'Harbour',d:'Light sky over a deep harbour blue.',at:25000,
  L:mkT('#eef3f8','#e0e9f3','rgba(255,255,255,.76)','#fbfdff','#142030','#3a4b5f','#6c7d92','#2f6db5','#5b9be0','#1f4f8f','#9cc8f0',2.6),
  D:mkT('#0f1824','#162232','rgba(28,42,60,.66)','#182638','#e8f0f8','#b9c8d9','#8597ab','#6aa8ec','#2f6db5','#13355f','#6aa8ec',2.4)},
 {id:'rosewood',n:'Rosewood',d:'Soft rose with a deep plum night.',at:50000,
  L:mkT('#f8f1f0','#f0e3e1','rgba(255,255,255,.74)','#fffafa','#2a1f20','#57474a','#8c7a7c','#c65d6f','#e8909e','#c9a0d8','#f2c1a8',2.4),
  D:mkT('#1d1617','#271d1f','rgba(52,38,41,.66)','#2c2224','#f5eaeb','#d6c5c7','#a8979a','#e58a9a','#b04a5c','#6d3f7a','#c26a52',2.2)},
 {id:'sage',n:'Sage',d:'Herb green and quiet linen.',at:90000,
  L:mkT('#f1f4ee','#e3eadf','rgba(255,255,255,.74)','#fbfdf9','#1e241c','#48523f','#7a8572','#5b8a52','#8cbf7f','#c9b77a','#7fb5a3',2.4),
  D:mkT('#141a13','#1c241b','rgba(36,46,35,.66)','#212a20','#edf2ea','#c5cfbf','#94a08c','#8fc285','#3f6e37','#6b5d2a','#2f6656',2.2)},
 {id:'lavender',n:'Lavender',d:'Lilac evenings and violet ink.',at:150000,
  L:mkT('#f4f1f9','#e8e2f3','rgba(255,255,255,.74)','#fdfbff','#231e2e','#4f4660','#857c97','#7b5fc9','#a98cf0','#e8a0c8','#8fb0f0',2.6),
  D:mkT('#18151f','#211d2b','rgba(44,38,58,.66)','#262131','#f0ecf8','#cbc3dc','#9d94b0','#ab95f0','#5b3fb0','#8a3f78','#3f5aa8',2.4)},
 {id:'sunrise',n:'Sunrise',d:'Peach, coral and the first gold light.',at:220000,
  L:mkT('#fbf2ea','#f5e3d4','rgba(255,252,248,.74)','#fffaf5','#2b1d14','#5c4535','#957a66','#e2724a','#f2a65a','#e86f8a','#f6d365',3.4),
  D:mkT('#1e1612','#2a1e17','rgba(56,40,31,.66)','#2e221a','#f8ece2','#dcc6b6','#ab9585','#f39a6b','#c8642c','#a83a5a','#b58a2a',2.8)},
 {id:'forest',n:'Forest night',d:'Pine shade, moss and a green glow.',at:320000,
  L:mkT('#eef2ec','#dfe7db','rgba(255,255,255,.72)','#f9fcf7','#132018','#3b4d41','#6d8073','#2f7d5b','#4fae7f','#2b5d45','#a7cf8f',2.8),
  D:mkT('#0b130f','#122019','rgba(22,40,31,.7)','#15251c','#e6f1ea','#b8cdbf','#82998a','#6fcf9a','#1f6b47','#0f4030','#5c8f2a',2.8)},
 {id:'ocean',n:'Ocean depth',d:'Teal shallows falling into deep navy.',at:450000,
  L:mkT('#edf5f6','#dbeaee','rgba(255,255,255,.72)','#fafeff','#10242a','#375159','#6b878e','#1f8a9e','#3fc1d0','#2a4f9e','#7fe0c8',3.2),
  D:mkT('#07141a','#0d2029','rgba(16,40,50,.7)','#10262f','#e3f3f6','#b2ccd2','#7f9ca3','#4cc3d6','#0f7d8f','#14306e','#1f8f73',3)},
 {id:'aurora',n:'Aurora',d:'Green, violet and ice blue drifting overhead.',at:620000,
  L:mkT('#f2f3f8','#e4e6f1','rgba(255,255,255,.7)','#fcfcff','#1b1d2b','#474b66','#7d82a0','#5a63d8','#3fd0a0','#8a5cf0','#4aa3f0',4),
  D:mkT('#0b0d18','#131627','rgba(26,30,52,.68)','#171a2d','#e9ebfa','#c3c7e3','#8e93b5','#8c95ff','#1fa37a','#6a3fd0','#2a7fd0',3.6)},
 {id:'gold',n:'Midnight gold',d:'Ivory by day, black and gold by night.',at:820000,
  L:mkT('#f6f2e8','#ebe3cf','rgba(255,253,247,.74)','#fffdf7','#1f1a10','#4d4430','#857a62','#b8892b','#e0b65a','#c79a3a','#f0d898',2.8),
  D:mkT('#0a0908','#141210','rgba(32,29,24,.7)','#1a1813','#f3ead6','#d3c7ab','#a0957c','#d9b25a','#8a6a1f','#5a4510','#b8892b',2.4)},
 {id:'prism',n:'Grand atelier',d:'The rarest: jewel light that slowly moves.',at:1100000,
  L:mkT('#f7f4f0','#ece6df','rgba(255,255,255,.7)','#fffdfa','#1d1a1f','#4a4450','#837b88','#b0508a','#ff9a8b','#a18cd1','#6fc7e8',4.4),
  D:mkT('#0e0c12','#17141d','rgba(34,29,42,.68)','#1c1823','#f1ecf4','#cdc4d4','#9a90a3','#e07ab8','#c4426a','#5b3fb0','#1f8fb0',4)}];
const FRAMES=[
 {id:'hairline',n:'Hairline',d:'One fine ring, left open at the top.',at:220000},
 {id:'dotted',n:'Stitch',d:'A ring of small even stitches.',at:350000},
 {id:'laurel',n:'Laurel',d:'Two light sprigs of leaves.',at:500000},
 {id:'knot',n:'Knot',d:'A ring tied with the Atelier knot.',at:700000},
 {id:'orbit',n:'Orbit',d:'A small moon that circles slowly.',at:950000},
 {id:'gilded',n:'Gilded',d:'A double ring of soft gold with a spark.',at:1300000}];
const skinOK=id=>{const s=SKINS.find(x=>x.id===id);return!!s&&S.usage.total>=s.at};
const frameOK=id=>{const f=FRAMES.find(x=>x.id===id);return!!f&&S.usage.total>=f.at};
const fmtK=n=>Math.round(n).toLocaleString('en-GB');
/* all themes as CSS, generated once from the data above */
(function skinCSS(){const mix=(c,p)=>`color-mix(in srgb,${c} ${p}%,transparent)`;const v=t=>`--bg:${t.bg};--bg2:${t.bg2};--card:${t.card};--card2:${t.card2};--text:${t.text};--ink2:${t.ink2};--muted:${t.muted};--accent:${t.accent};--focus:${t.accent};--line:${mix(t.text,9)};--line2:${mix(t.text,15)};--fill:${mix(t.text,5)};--fill2:${mix(t.text,9)};--track:${mix(t.text,8)};--w1:${t.w1};--w2:${t.w2};--w3:${t.w3};--wo:${t.wo}`;
 const css=SKINS.filter(s=>s.L).map(s=>`:root[data-skin=${s.id}]{${v(s.L)}}:root[data-skin=${s.id}][data-theme=dark]{${v(s.D)}}`).join('\n');const st=document.createElement('style');st.id='skins';st.textContent=css;document.head.appendChild(st)})();
function setSkin(id){if(!skinOK(id)){const s=SKINS.find(x=>x.id===id);toast(`${s.n} unlocks at ${fmtK(s.at)} knots`);return}S.settings.skin=id;use('skin');save();const R=document.documentElement;R.classList.add('skinfx');applyTheme();render();setTimeout(()=>R.classList.remove('skinfx'),900);toast((SKINS.find(x=>x.id===id)||{}).n+' theme')}
function setFrame(id){if(id&&!frameOK(id)){const f=FRAMES.find(x=>x.id===id);toast(`${f.n} unlocks at ${fmtK(f.at)} knots`);return}S.me.frame=id||'';use('frame');save();render();toast(id?(FRAMES.find(x=>x.id===id)||{}).n+' frame':'No frame')}
/* a quiet note when a new theme or frame unlocks */
function checkUnlocks(before,after){const hit=[...SKINS.map(s=>({...s,k:'theme'})),...FRAMES.map(f=>({...f,k:'frame'}))].filter(x=>x.at>0&&before<x.at&&after>=x.at);
 if(!hit.length)return;const x=hit[hit.length-1];setTimeout(()=>{toast(`Unlocked: ${x.n} ${x.k}`);burst()},400);led('study',`Unlocked the ${x.n} ${x.k}`,{sub:`${fmtK(x.at)} knots`,ref:'rewards'})}
const newUnlocks=()=>[...SKINS,...FRAMES].filter(x=>x.at>0&&x.at<=S.usage.total&&x.at>(S.settings.seenAt||0)).length;
/* frames are drawn around your own avatar; subtle, one ink line in the accent colour */
function frameSVG(id){const r=22.4,c='currentColor';let g='';
 if(id==='hairline')g=`<circle cx="24" cy="24" r="${r}" stroke="${c}" stroke-width="1.1" pathLength="100" stroke-dasharray="90 10" stroke-dashoffset="-2" transform="rotate(-80 24 24)"/>`;
 else if(id==='dotted')g=`<circle cx="24" cy="24" r="${r}" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0 3.6"/>`;
 else if(id==='laurel'){const lv=(a,s)=>{const t=a*Math.PI/180,x=24+Math.cos(t)*r,y=24+Math.sin(t)*r;return`<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="2.5" ry="1" transform="rotate(${(a+90+s*28).toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" stroke="${c}" stroke-width=".9"/>`};
  g=`<circle cx="24" cy="24" r="${r}" stroke="${c}" stroke-width=".6" opacity=".35"/>`+[100,116,132,148,164].map(a=>lv(a,1)).join('')+[80,64,48,32,16].map(a=>lv(a,-1)).join('')}
 else if(id==='knot')g=`<circle cx="24" cy="24" r="${r}" stroke="${c}" stroke-width="1" opacity=".7"/><circle cx="24" cy="46.4" r="3.9" fill="var(--card2)"/><g transform="translate(20.6 43.1) scale(.106)" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="${KNOT}"/></g>`;
 else if(id==='orbit')g=`<circle cx="24" cy="24" r="${r}" stroke="${c}" stroke-width=".8" opacity=".45"/><g class="orb"><circle cx="24" cy="${24-r}" r="1.9" fill="${c}"/></g>`;
 else if(id==='gilded'){const k='g'+Math.random().toString(36).slice(2,7);g=`<defs><linearGradient id="${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8892b"/><stop offset=".5" stop-color="#f3d27a"/><stop offset="1" stop-color="#a87a22"/></linearGradient></defs><circle cx="24" cy="24" r="${r}" stroke="url(#${k})" stroke-width="1.4"/><circle cx="24" cy="24" r="${r-1.9}" stroke="url(#${k})" stroke-width=".6" opacity=".8"/><path d="M40.5 5.2L41.2 7.3L43.3 8L41.2 8.7L40.5 10.8L39.8 8.7L37.7 8L39.8 7.3Z" fill="#e8c260"/>`}
 return g?`<svg class="frm frm-${id}" viewBox="0 0 48 48" fill="none" aria-hidden="true">${g}</svg>`:''}
/* profile quotes: one line, a font, a colour and a look, kept subtle */
const QFONTS=[['serif','Serif'],['hand','Hand'],['sans','Sans']],QLOOKS=[['paper','Paper'],['glass','Glass'],['ink','Ink']],QCOLS=[['ink','var(--text)'],['clay','var(--accent)'],['blue','var(--blue)'],['green','var(--green)'],['violet','var(--violet)']];
const BOT_QUOTES=['Make it simple, then make it good.','Small steps, every day.','Ask the question nobody asks.','Done is better than perfect.','Leave it better than you found it.','Curiosity first, coffee second.'];
function quoteOf(p){if(!p)return null;if(p.id==='me')return S.me.quote&&S.me.quote.t?S.me.quote:null;if(p.quote)return p.quote;if(!p.bot)return null;
 const h=[...String(p.name)].reduce((a,c)=>a+c.charCodeAt(0),0);return{t:BOT_QUOTES[h%BOT_QUOTES.length],font:QFONTS[h%3][0],col:QCOLS[h%QCOLS.length][0],look:'paper'}}
function quoteCard(q,name,cls=''){const col=(QCOLS.find(c=>c[0]===q.col)||QCOLS[0])[1];
 return`<figure class="qcard ql-${q.look||'paper'} qf-${q.font||'serif'} ${cls}" style="--qc:${col}"><svg class="qm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON.quote}"/></svg><blockquote>${esc(q.t)}</blockquote>${name?`<figcaption>${esc(name)}</figcaption>`:''}</figure>`}
function quoteSheet(){const q=Object.assign({t:'',font:'serif',col:'ink',look:'paper'},S.me.quote||{});
 sheet('Your quote',`<div class="qstage" id="qPv">${quoteCard(q.t?q:{...q,t:'A line that sounds like you.'},fullName())}</div>
 <label for="qT">Quote</label><textarea id="qT" name="t" rows="2" maxlength="140" placeholder="A line that sounds like you">${esc(q.t)}</textarea>
 <div class="flabel">Font</div><div class="seg" id="qF">${QFONTS.map(([k,n])=>`<label><input type="radio" name="font" value="${k}" ${q.font===k?'checked':''}><span class="qf-${k}">${n}</span></label>`).join('')}</div>
 <div class="flabel">Look</div><div class="seg" id="qL">${QLOOKS.map(([k,n])=>`<label><input type="radio" name="look" value="${k}" ${q.look===k?'checked':''}><span>${n}</span></label>`).join('')}</div>
 <div class="flabel">Colour</div><div class="opts">${QCOLS.map(([k,c])=>`<label class="swl"><input type="radio" name="col" value="${k}" ${q.col===k?'checked':''}><span class="sw" style="background:${c}"></span></label>`).join('')}</div>`,
 fd=>{S.me.quote={t:(fd.t||'').trim().slice(0,140),font:fd.font||'serif',col:fd.col||'ink',look:fd.look||'paper'};use('quote');toast(S.me.quote.t?'Quote saved':'Quote removed')},
 S.me.quote&&S.me.quote.t?`<button type="button" class="btn ghost full" onclick="closeSheet();setTimeout(()=>openWidget(null,'quote'),220)">${ic('share')} Share as a widget</button>`:'');
 const f=$('#sf'),pv=()=>{const t=f.t.value.trim();$('#qPv').innerHTML=quoteCard({t:t||'A line that sounds like you.',font:f.font.value,col:f.col.value,look:f.look.value},fullName())};f.addEventListener('input',pv);f.addEventListener('change',pv)}
/* your profile, as others would see it */
function pProfile(){const q=quoteOf(S.me),gs=S.groups.filter(g=>g.members.includes('me')),fr=FRAMES.find(f=>f.id===S.me.frame);
 return`<div class="page">${header('Profile',{sub:'How others see you',back:'you',right:`<button class="btn sm" onclick="profileForm()">${ic('edit')} Edit</button>`})}
 <div class="card prohero"><div class="proav">${avatar(S.me,104)}</div><h2>${esc(fullName())}</h2><div class="sub">${esc(meRole()||'Member')} · @${esc(S.me.handle)}</div>${fr?`<span class="pill frpill">${ic('sparkle',2)} ${fr.n} frame</span>`:''}
 ${q?`<div class="proq" onclick="quoteSheet()">${quoteCard(q,'')}</div>`:`<button class="qempty" onclick="quoteSheet()">${ic('quote')}<span>Add a quote to your profile</span></button>`}</div>
 <div class="grid3 mt"><div class="card kpi"><div class="l">Knots</div><div class="v" data-n="${S.usage.total}">${fmtK(S.usage.total)}</div><div class="l">all time</div></div><div class="card kpi"><div class="l">Focus</div><div class="v">${(S.focus.sessions.reduce((a,s)=>a+s.mins,0)/60).toFixed(1)}</div><div class="l">hours</div></div><div class="card kpi"><div class="l">Groups</div><div class="v" data-n="${gs.length}">${gs.length}</div><div class="l">${space()==='student'?'classes':'teams'}</div></div></div>
 <section><div class="sh"><h2>Look</h2><a class="lnk" href="#rewards">Collection</a></div><div class="card list"><button class="li" onclick="quoteSheet()">${ic('quote')}<div class="grow"><div class="t">Quote</div><div class="sub sm">${q?esc(q.t):'Add a line that sounds like you'}</div></div>${ic('chevr')}</button><a class="li" href="#rewards">${ic('sparkle')}<div class="grow"><div class="t">Themes and frames</div><div class="sub sm">${(SKINS.find(s=>s.id===S.settings.skin)||SKINS[0]).n} theme${fr?' · '+fr.n+' frame':''}</div></div>${ic('chevr')}</a></div></section>
 ${gs.length?`<section><div class="sh"><h2>${space()==='student'?'Classes and groups':'Teams and groups'}</h2></div><div class="card list">${gs.map(g=>`<a class="li" href="#group:${g.id}">${gAv(g)}<div class="grow"><div class="t">${esc(g.name)}</div><div class="sub sm">${gKind(g)} · ${plural(g.members.length,'member')}</div></div>${ic('chevr')}</a>`).join('')}</div></section>`:''}</div>`}
/* the collection: every theme and frame with what it takes to unlock it */
function pRewards(){const tot=S.usage.total,dark=document.documentElement.dataset.theme==='dark',all=[...SKINS.map(s=>({...s,k:'theme'})),...FRAMES.map(f=>({...f,k:'frame'}))].filter(x=>x.at>tot).sort((a,b)=>a.at-b.at),nx=all[0];
 const days=Object.keys(S.usage.days).sort().slice(-14),pace=Math.max(1,Math.round(days.reduce((a,d)=>a+(S.usage.days[d]._n||0),0)/Math.max(1,days.length)))||1600;
 const eta=n=>{const d=Math.ceil(n/pace);return d<=1?'about a day':d<60?`about ${d} days`:d<730?`about ${Math.round(d/30)} months`:`about ${(d/365).toFixed(1)} years`};
 S.settings.seenAt=tot;saveSoon();
 const prev=s=>{const t=s.L?(dark?s.D:s.L):null,st=t?`--pb:${t.bg};--pc:${t.card2};--pa:${t.accent};--pt:${t.text};--pw1:${t.w1};--pw2:${t.w2}`:'--pb:var(--bg);--pc:var(--card2);--pa:var(--accent);--pt:var(--text);--pw1:var(--accent);--pw2:var(--blue)';return`<div class="skprev" style="${st}"><i class="w1"></i><i class="w2"></i><b class="h"></b><span class="c1"><em></em><em></em></span><span class="c2"><em></em></span><u></u></div>`};
 return`<div class="page">${header('Collection',{sub:'Themes and frames',back:'you'})}
 <div class="card rwhero">${knot('kn lg',3.6)}<div class="grow"><div class="l">All-time knots</div><div class="v" data-n="${tot}">${fmtK(tot)}</div><div class="sub sm">Knots are never spent. Reach a mark and it is yours for good.</div></div></div>
 ${nx?`<div class="card rwnext"><div class="row between"><b>Next: ${esc(nx.n)} ${nx.k}</b><span class="sub sm">${fmtK(nx.at)}</span></div><div class="pbar"><i style="width:${Math.min(100,tot/nx.at*100).toFixed(1)}%"></i></div><div class="sub sm">${fmtK(nx.at-tot)} to go · ${eta(nx.at-tot)} at your pace (${fmtK(pace)} a day)</div></div>`:`<div class="card rwnext"><b>You have unlocked everything.</b><div class="sub sm">New themes arrive with updates.</div></div>`}
 <section><div class="sh"><h2>Themes</h2><span class="sub">${SKINS.filter(s=>tot>=s.at).length} of ${SKINS.length}</span></div><div class="skgrid">${SKINS.map(s=>{const ok=tot>=s.at,on=(S.settings.skin||'clay')===s.id;return`<button class="card sk ${ok?'':'lock'} ${on?'on':''}" onclick="setSkin('${s.id}')" aria-label="${esc(s.n)}${ok?'':' locked'}">${prev(s)}<div class="skn"><b>${esc(s.n)}</b>${on?`<span class="pill st-done">In use</span>`:ok?'<span class="pill">Use</span>':`<span class="pill lockp">${ic('lock',2)} ${fmtK(s.at)}</span>`}</div><div class="sub sm">${esc(s.d)}</div>${ok?'':`<div class="pbar"><i style="width:${Math.min(100,tot/s.at*100).toFixed(1)}%"></i></div>`}</button>`}).join('')}</div></section>
 <section><div class="sh"><h2>Profile frames</h2><span class="sub">${FRAMES.filter(f=>tot>=f.at).length} of ${FRAMES.length}</span></div><div class="frgrid">
 <button class="card frc ${!S.me.frame?'on':''}" onclick="setFrame('')">${avatar({...S.me,frame:''},56)}<b>None</b><span class="sub sm">${!S.me.frame?'In use':'Plain'}</span></button>
 ${FRAMES.map(f=>{const ok=tot>=f.at,on=S.me.frame===f.id;return`<button class="card frc ${ok?'':'lock'} ${on?'on':''}" onclick="setFrame('${f.id}')" aria-label="${esc(f.n)}${ok?'':' locked'}">${avatar({...S.me,frame:f.id},56)}<b>${esc(f.n)}</b><span class="sub sm">${on?'In use':ok?esc(f.d):`${ic('lock',2)} ${fmtK(f.at)}`}</span></button>`}).join('')}</div></section>
 <p class="sub center sm">About ${fmtK(1600)} knots is a normal full day. The rarest themes take years of use.</p></div>`}
