/* ============ NOTES: a page you write on and arrange with your fingers ============
   A note is a board: parts (text, checklist, thought chain, sticky, pinned sketch, small animation) placed on a
   page with a background, joined by arrows. The board is laid out on a 360-unit-wide stage that is scaled to the
   screen, so a note looks the same on a phone, in a widget and on a desktop.
   n.body is always kept as plain text of the board (headings "# ", checklists "[ ] / [x]"), so search, sharing,
   chat previews and older code keep working. Old notes become a board the first time they are opened. */
const NCOL=['var(--yellow)','var(--blue)','var(--green)','var(--accent)','var(--violet)','var(--red)'];
let NF={q:'',f:'all'};
const BW=360;
const NBG=[['none','Plain'],['dots','Dots'],['grid','Grid'],['lines','Lines'],['paper','Paper']];
const NLC={ink:'var(--text)',accent:'var(--accent)',blue:'var(--blue)',green:'var(--green)',red:'var(--red)',violet:'var(--violet)'};
const NTXT=[['p','Body'],['h','Heading'],['q','Quote'],['hand','Hand']];
const NSC=['var(--yellow)','var(--blue)','var(--green)','var(--accent)','var(--violet)'];
const THL=['Thought','Because','So','Next','Then'];
const MOTIONS=[['pulse','Pulse','Point at the important bit'],['flow','Flow','Something moves from A to B'],['cycle','Cycle','A loop that repeats'],['rise','Grow','Things going up'],['spark','Spark','A new idea'],['orbit','Orbit','Keeps coming back']];
const PTO=(()=>{try{const d=document.createElement('div');d.contentEditable='plaintext-only';return d.contentEditable==='plaintext-only'}catch(e){return false}})();
const CE=PTO?'plaintext-only':'true';
function newNote(extra={}){const n={id:uid(),title:'',body:'',col:Math.floor(Math.random()*NCOL.length),pin:false,share:{groups:[],projects:[]},at:Date.now(),up:Date.now(),board:{v:1,bg:'dots',blocks:[],links:[]},...extra};
 if(extra.body&&!extra.board)n.board=boardFrom(extra.body);S.notes.push(n);use('note_new');led('note','New note',{ref:'note:'+n.id,nid:n.id});save();return n}
const noteTitle=n=>(n.title||'').trim()||(String(n.body||'').split('\n').find(l=>l.trim())||'Untitled').replace(/^#\s*|\[[ x]\]\s*|^-\s*/g,'').slice(0,60);
const shareCount=n=>(n.share?.groups?.length||0)+(n.share?.projects?.length||0);
const noteAtt=n=>({kind:'note',id:n.id,title:noteTitle(n),col:n.col,text:String(n.body||'').slice(0,240)});

/* ---- the board model ---- */
const nbid=()=>'b'+uid();
function boardFrom(body){const B={v:1,bg:'dots',blocks:[],links:[],_stack:1};const chunks=String(body||'').split(/\n\s*\n/).map(x=>x.replace(/\s+$/,'')).filter(x=>x.trim());
 chunks.forEach(ch=>{const ls=ch.split('\n');let buf=[];const flush=()=>{if(buf.length){B.blocks.push({id:nbid(),t:'text',s:'p',txt:buf.join('\n'),x:16,y:0,w:328});buf=[]}};
  for(let i=0;i<ls.length;i++){const l=ls[i];
   if(/^#\s/.test(l)){flush();B.blocks.push({id:nbid(),t:'text',s:'h',txt:l.slice(2).trim(),x:16,y:0,w:328});continue}
   if(/^\[[ x]\]/.test(l)){flush();const items=[];while(i<ls.length&&/^\[[ x]\]/.test(ls[i])){items.push({id:nbid(),t:ls[i].slice(3).trim(),on:ls[i][1]==='x'});i++}i--;B.blocks.push({id:nbid(),t:'check',title:'',items,x:16,y:0,w:328});continue}
   buf.push(l.replace(/^[-•]\s/,'• '))}flush()});
 return B}
function boardText(B){const o=[];(B&&B.blocks||[]).slice().sort((a,b)=>a.y-b.y||a.x-b.x).forEach(b=>{
  if(b.t==='text')o.push(b.s==='h'?'# '+(b.txt||'').split('\n')[0]:(b.txt||''));
  else if(b.t==='check')o.push([b.title?b.title:null,...(b.items||[]).map(x=>`[${x.on?'x':' '}] ${x.t}`)].filter(x=>x!==null).join('\n'));
  else if(b.t==='thought')o.push((b.steps||[]).map((s,i)=>`- ${THL[i%THL.length]}: ${s.t}`).join('\n'));
  else if(b.t==='sticky'||b.t==='motion')o.push(b.txt||'');});
 return o.filter(x=>String(x).trim()).join('\n\n')}
function ensureBoard(n){if(!n.board||!Array.isArray(n.board.blocks)){n.board=boardFrom(n.body)}n.board.links=n.board.links||[];n.board.bg=n.board.bg||'dots';return n.board}
function syncBody(n){n.body=boardText(n.board);n.up=Date.now()}
const blk=(B,id)=>B.blocks.find(b=>b.id===id);

/* ---- drawings for the motion parts (only transform and opacity animate) ---- */
const MOTION_SVG={
 pulse:`<svg viewBox="0 0 120 80"><circle class="mo-r r1" cx="60" cy="40" r="12"/><circle class="mo-r r2" cx="60" cy="40" r="12"/><circle class="mo-r r3" cx="60" cy="40" r="12"/><circle class="mo-c" cx="60" cy="40" r="7"/></svg>`,
 flow:`<svg viewBox="0 0 120 80"><circle class="mo-n" cx="18" cy="40" r="6"/><circle class="mo-n" cx="102" cy="40" r="6"/><path class="mo-l" d="M28 40H90M84 34L91 40L84 46"/><circle class="mo-d d1" cx="30" cy="40" r="3.2"/><circle class="mo-d d2" cx="30" cy="40" r="3.2"/><circle class="mo-d d3" cx="30" cy="40" r="3.2"/></svg>`,
 cycle:`<svg viewBox="0 0 120 80"><g class="mo-rot"><path class="mo-l" d="M60 18A22 22 0 0 1 82 40M78 36L82 41L86 35"/><path class="mo-l" d="M60 62A22 22 0 0 1 38 40M42 44L38 39L34 45"/></g><circle class="mo-c" cx="60" cy="40" r="4"/></svg>`,
 rise:`<svg viewBox="0 0 120 80"><path class="mo-l" d="M24 66H96" opacity=".45"/><rect class="mo-b b1" x="34" y="20" width="12" height="46" rx="3"/><rect class="mo-b b2" x="54" y="20" width="12" height="46" rx="3"/><rect class="mo-b b3" x="74" y="20" width="12" height="46" rx="3"/></svg>`,
 spark:`<svg viewBox="0 0 120 80"><path class="mo-l" d="M54 50C47 45 46 36 50 30C54 24 66 24 70 30C74 36 73 45 66 50V56H54ZM55 61H65"/><g class="mo-ray"><path class="mo-l" d="M60 10V15M40 18L44 22M80 18L76 22M34 36H39M86 36H81"/></g></svg>`,
 orbit:`<svg viewBox="0 0 120 80"><circle class="mo-l" cx="60" cy="40" r="30" opacity=".35"/><circle class="mo-c" cx="60" cy="40" r="6"/><g class="mo-rot slow"><circle class="mo-d" cx="90" cy="40" r="4.5"/></g></svg>`};

/* ---- one part, rendered for the editor (ed) or as a still preview ---- */
const ckSvg='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 8.4L6.6 11.2L12.6 4.6"/></svg>';
function blockInner(b,ed){const ce=f=>ed?`contenteditable="${CE}" data-f="${f}" spellcheck="true"`:'';
 if(b.t==='text')return`<div class="nbt s-${b.s||'p'}" ${ce('txt')} data-ph="${b.s==='h'?'Heading':'Write something'}">${esc(b.txt||'')}</div>`;
 if(b.t==='check'){const L=b.items||[],d=L.filter(x=>x.on).length;return`${b.title||ed?`<div class="nck-h" ${ce('title')} data-ph="Checklist">${esc(b.title||'')}</div>`:''}<div class="nck">${L.map(x=>`<div class="cki ${x.on?'on':''}" data-iid="${x.id}"><button type="button" class="ckb" data-ck="${x.id}" aria-label="${x.on?'Mark as not done':'Mark as done'}">${ckSvg}</button><span class="ckt" ${ce('item')} data-ph="Item">${esc(x.t)}</span></div>`).join('')}</div>${L.length?`<div class="nck-p"><i style="width:${Math.round(d/L.length*100)}%"></i></div>`:''}${ed?`<button type="button" class="nadd" data-add="item">${ic('plus',2)} Item</button>`:''}`}
 if(b.t==='thought')return`<div class="nth">${(b.steps||[]).map((s,i)=>`<div class="ths" data-sid="${s.id}"><span class="thd"></span><span class="thl">${THL[i%THL.length]}</span><div class="thb" ${ce('step')} data-ph="${i?'and then…':'A thought'}">${esc(s.t)}</div></div>`).join('')}</div>${ed?`<button type="button" class="nadd" data-add="step">${ic('plus',2)} Step</button>`:''}`;
 if(b.t==='sticky')return`<div class="nsk hand" ${ce('txt')} data-ph="A quick thought">${esc(b.txt||'')}</div>`;
 if(b.t==='sketch')return`<div class="nsketch" style="height:${b.h||160}px"><span class="npinm" aria-hidden="true"></span><canvas data-sk="${b.id}"></canvas>${ed&&!(b.strokes||[]).length?`<span class="nsk-e">Tap Draw, then sketch here</span>`:''}</div>`;
 if(b.t==='motion')return`<div class="nmo m-${b.m||'pulse'}" style="--mc:${NLC[b.c||'accent']}">${MOTION_SVG[b.m||'pulse']}</div><div class="nmc" ${ce('txt')} data-ph="Caption">${esc(b.txt||'')}</div>`;
 return''}
const blockHTML=(b,ed)=>`<div class="nb nb-${b.t}${b.t==='sticky'?' sc'+((b.c||0)%5):''}" data-b="${b.id}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;${b.t==='sticky'?`--rot:${b.rot||0}deg;`:''}">${blockInner(b,ed)}</div>`;
const stageInner=(B,ed)=>`<svg class="nlinks" aria-hidden="true"></svg>${B.blocks.map(b=>blockHTML(b,ed)).join('')}`;

/* ---- arrows ---- */
function lpath(p1,p2,sh,seed,hand){let pts;
 if(sh==='straight')pts=[p1,p2];
 else if(sh==='elbow'){const h=Math.abs(p2[0]-p1[0])>Math.abs(p2[1]-p1[1]);const mid=h?(p1[0]+p2[0])/2:(p1[1]+p2[1])/2;pts=h?[p1,[mid,p1[1]],[mid,p2[1]],p2]:[p1,[p1[0],mid],[p2[0],mid],p2]}
 else{const dx=p2[0]-p1[0],dy=p2[1]-p1[1],h=Math.abs(dx)>Math.abs(dy),c1=h?[p1[0]+dx*.5,p1[1]]:[p1[0],p1[1]+dy*.5],c2=h?[p2[0]-dx*.5,p2[1]]:[p2[0],p2[1]-dy*.5];
  pts=[];for(let i=0;i<=24;i++){const t=i/24,u=1-t;pts.push([u*u*u*p1[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p2[0],u*u*u*p1[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p2[1]])}}
 if(hand){const o=[];for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/14));for(let i=0;i<n;i++){const t=i/n;o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}o.push(pts[pts.length-1]);
  let r=seed;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647-.5};pts=o.map((p,i)=>i===0||i===o.length-1?p:[p[0]+rnd()*2.6,p[1]+rnd()*2.6])}
 return pts}
function edgePt(r,to){const cx=r.x+r.w/2,cy=r.y+r.h/2,dx=to[0]-cx,dy=to[1]-cy;if(!dx&&!dy)return[cx,cy];const sx=dx?(r.w/2+6)/Math.abs(dx):1e9,sy=dy?(r.h/2+6)/Math.abs(dy):1e9,s=Math.min(sx,sy);return[cx+dx*s,cy+dy*s]}
function headD(p,q,sz){const a=Math.atan2(p[1]-q[1],p[0]-q[0]),l=sz||9;return`M${(p[0]-Math.cos(a-.5)*l).toFixed(1)} ${(p[1]-Math.sin(a-.5)*l).toFixed(1)}L${p[0].toFixed(1)} ${p[1].toFixed(1)}L${(p[0]-Math.cos(a+.5)*l).toFixed(1)} ${(p[1]-Math.sin(a+.5)*l).toFixed(1)}`}
/* draws every arrow of a stage from the parts' real sizes; also returns the stage height */
function paintLinks(st,B,selId,ed){const R={};let H=0;st.querySelectorAll(':scope > .nb').forEach(el=>{const b=blk(B,el.dataset.b);if(!b)return;const h=el.offsetHeight;R[b.id]={x:b.x,y:b.y,w:b.w,h};H=Math.max(H,b.y+h)});
 const svg=st.querySelector(':scope > .nlinks');if(svg){svg.setAttribute('width',BW);svg.setAttribute('height',Math.max(H+40,200));
  svg.innerHTML=(B.links||[]).map(L=>{const a=R[L.a],b=R[L.b];if(!a||!b)return'';const ca=[a.x+a.w/2,a.y+a.h/2],cb=[b.x+b.w/2,b.y+b.h/2],p1=edgePt(a,cb),p2=edgePt(b,ca);
   const seed=[...L.id].reduce((s,c)=>s*31+c.charCodeAt(0)|0,7)>>>0||7,pts=lpath(p1,p2,L.sh||'curve',seed%2147483646+1,L.ln==='hand'),d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L'),col=NLC[L.c||'ink'],n=pts.length;
   const end=L.hd==='none'?'':L.hd==='dot'?`<circle cx="${p2[0].toFixed(1)}" cy="${p2[1].toFixed(1)}" r="3.6" fill="${col}"/>`:`<path d="${headD(pts[n-1],pts[n-2])}"/>`,start=L.hd==='both'?`<path d="${headD(pts[0],pts[1])}"/>`:'';
   return`<g class="nl ${selId===L.id?'sel':''}" data-l="${L.id}" style="--lc:${col}"><path class="nlp ${L.ln==='dash'?'dash':''}" d="${d}"/>${end}${start}${ed?`<path class="nlh" d="${d}"/>`:''}</g>`}).join('')}
 return H}
/* draws the pinned sketches; strokes are stored in the part's own units, so they scale with it */
function paintSketches(root,B){root.querySelectorAll('canvas[data-sk]').forEach(cv=>{const b=blk(B,cv.dataset.sk);if(!b)return;const box=cv.parentElement,w=b.w-2,h=(b.h||160),dpr=Math.min(2,devicePixelRatio||1)*(root._s||1);
 if(cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}cv.style.width=w+'px';cv.style.height=h+'px';const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
 const css=getComputedStyle(box);(b.strokes||[]).forEach(s=>{if(!s.p.length)return;x.strokeStyle=css.getPropertyValue('--sk-'+(s.c||'ink')).trim()||'#333';x.lineWidth=s.s||2.4;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(s.p[0][0],s.p[0][1]);if(s.p.length===1)x.lineTo(s.p[0][0]+.1,s.p[0][1]);for(let i=1;i<s.p.length-1;i++){const m=[(s.p[i][0]+s.p[i+1][0])/2,(s.p[i][1]+s.p[i+1][1])/2];x.quadraticCurveTo(s.p[i][0],s.p[i][1],m[0],m[1])}if(s.p.length>1)x.lineTo(s.p[s.p.length-1][0],s.p[s.p.length-1][1]);x.stroke()})})}
/* old notes: stack the parts under each other once, using their real heights */
function autoStack(st,B){if(!B._stack)return false;const els=B.blocks.map(b=>st.querySelector(`:scope > [data-b="${b.id}"]`)),hs=els.map(el=>el?el.offsetHeight:44);let y=14;B.blocks.forEach((b,i)=>{b.y=y;if(els[i])els[i].style.top=y+'px';y+=hs[i]+16});delete B._stack;return true}

/* ---- small still previews (cards, widgets, chat). They scale themselves to their box. ---- */
function miniBoard(n,h,cls=''){const B=n.board&&Array.isArray(n.board.blocks)?n.board:boardFrom(n.body);if(!B.blocks.length)return`<div class="nmini empty ${cls}" style="height:${h}px"><span>${ic('notes',1.6)}</span></div>`;
 if(!n.board)window._miniB=Object.assign(window._miniB||{},{[n.id]:B});
 const V=/wmini/.test(cls)?B:{...B,blocks:B._stack?B.blocks.slice(0,6):B.blocks.filter(b=>b.y<h*3.2)};
 return`<div class="nmini ${cls}" data-note="${n.id}" style="height:${h}px;--nc:${NCOL[(n.col||0)%NCOL.length]}"><div class="nmst bg-${B.bg||'dots'}">${stageInner(V,false)}</div></div>`}
function miniFit(el){const n=note(el.dataset.note);if(!n){el.dataset.fit=1;return}const B=n.board&&Array.isArray(n.board.blocks)?n.board:(window._miniB||{})[n.id]||boardFrom(n.body);const st=el.firstElementChild;if(!st)return;
 const s=el.clientWidth/BW;if(!s){return}st.style.transform=`scale(${s})`;st._s=s;if(B._stack){const C={...B,blocks:B.blocks.map(b=>({...b})),_stack:1};autoStack(st,C);const H=paintLinks(st,C);st.style.height=H+40+'px';paintSketches(st,C);if(el.classList.contains('wexpd'))el.style.height=Math.min(1600,(H+40)*s)+'px'}
 else{const H=paintLinks(st,B);st.style.height=H+40+'px';paintSketches(st,B);if(el.classList.contains('wexpd'))el.style.height=Math.min(1600,(H+40)*s)+'px'}el.dataset.fit=1}
const _miniRO=('ResizeObserver' in window)?new ResizeObserver(es=>es.forEach(e=>{const el=e.target;if(el.isConnected&&el.clientWidth&&Math.abs((el._w||0)-el.clientWidth)>1){el._w=el.clientWidth;miniFit(el)}})):null;
function fitMinis(root){(root||document).querySelectorAll('.nmini[data-note]:not([data-obs])').forEach(el=>{el.dataset.obs=1;if(_miniRO)_miniRO.observe(el);else miniFit(el)})}
if('MutationObserver' in window)new MutationObserver(()=>{if(window._mfq)return;window._mfq=requestAnimationFrame(()=>{window._mfq=0;fitMinis()})}).observe(document.documentElement,{childList:true,subtree:true});
/* ticking a checklist from a preview (chat or widget) works without opening the note */
document.addEventListener('click',e=>{const b=e.target.closest('.nmini.nint [data-ck]');if(!b)return;e.preventDefault();e.stopPropagation();const mi=b.closest('.nmini'),n=note(mi.dataset.note);if(!n)return;ensureBoard(n);
 for(const k of n.board.blocks)if(k.t==='check'){const it=(k.items||[]).find(x=>x.id===b.dataset.ck);if(it){it.on=!it.on;syncBody(n);use('note_edit');save();const st=mi.firstElementChild;st.innerHTML=stageInner(n.board,false);mi.removeAttribute('data-fit');miniFit(mi);toast(it.on?'Done':'Not done');return}}},true);

/* ---- notes list (inside Flow) ---- */
function noteCard(n,k){const col=NCOL[(n.col||0)%NCOL.length],todo=(String(n.body).match(/^\[[ x]\]/gm)||[]).length,done=(String(n.body).match(/^\[x\]/gm)||[]).length,wide=n.pin,sc=shareCount(n),B=n.board&&n.board.blocks?n.board:null,parts=B?B.blocks.length:0,arrows=B?(B.links||[]).length:0;
 return`<a class="card ncard ${wide?'nwide':''}" href="#note:${n.id}" style="--nc:${col};--i:${Math.min(k||0,14)}"><div class="nlab">${noteGlyph(col)}<span>${n.pin?'Pinned':sc?'Shared':'Note'}</span><em>${ago(n.up)}</em></div>
 <b class="nt">${esc(noteTitle(n))}</b>${miniBoard(n,wide?150:112)}
 <div class="ncm">${todo?`<span class="nprog"><span class="pbar"><i style="width:${Math.round(done/todo*100)}%"></i></span>${done}/${todo}</span>`:''}${arrows?`<span>${ic('arrowtool',2)} ${arrows}</span>`:''}${sc?`<span class="shr">${ic('group',2)} ${sc}</span>`:''}${n.pin?`<span class="npin">${ic('pin',2)}</span>`:''}${!todo&&!arrows&&!sc&&!n.pin?`<span>${plural(parts,'part')}</span>`:''}</div></a>`}
function pNotes(){const q=NF.q.toLowerCase();let L=S.notes.filter(n=>(NF.f==='all'||(NF.f==='pinned'&&n.pin)||(NF.f==='shared'&&shareCount(n)))&&(!q||((n.title||'')+' '+(n.body||'')).toLowerCase().includes(q)));L.sort((a,b)=>(b.pin-a.pin)||b.up-a.up);
 after(()=>{const s=$('#nq');s.oninput=()=>{NF.q=s.value;clearTimeout(s._t);s._t=setTimeout(()=>{const p=s.selectionStart;render();const n=$('#nq');n.focus();try{n.setSelectionRange(p,p)}catch(e){}},200)};$$('[data-nf]').forEach(b=>b.onclick=()=>{NF.f=b.dataset.nf;render()})});
 return`<div class="page">${header('Notes',{sub:plural(S.notes.length,'note'),back:'flow',right:`<button class="btn primary sm" onclick="quickNote()">${ic('plus',2)} New</button>`})}
 <div class="search">${ic('search')}<input id="nq" type="search" placeholder="Search notes" value="${esc(NF.q)}"></div>
 <div class="seg mt">${[['all','All'],['pinned','Pinned'],['shared','Shared']].map(([k,n])=>`<button data-nf="${k}" class="${NF.f===k?'on':''}">${n}</button>`).join('')}</div>
 ${L.length?`<div class="ngrid">${L.slice(0,NF.n||60).map((n,k)=>noteCard(n,k)).join('')}</div>${L.length>(NF.n||60)?`<button class="btn full" onclick="NF.n=(NF.n||60)+120;render()">Show ${Math.min(120,L.length-(NF.n||60))} more</button>`:''}`:empty('think',S.notes.length?'No notes match':'Leave room to think',S.notes.length?'Try another search or filter.':'Write, list, sketch and draw arrows between your thoughts. Share a note with a group when it is ready.',`<button class="btn primary" onclick="quickNote()">New note</button>`)}</div>`}
/* kept for older callers: plain-text rendering of a body */
function mdHtml(t,nid){let li=0;return String(t||'').split(/\n\s*\n/).map(b=>{const ls=b.split('\n');
 return ls.map(l=>{const i=li++;if(/^#\s/.test(l))return`<h3>${esc(l.slice(2))}</h3>`;if(/^\[[ x]\]/.test(l)){const on=l[1]==='x';return`<label class="todo ${on?'on':''}"><input type="checkbox" ${on?'checked':''} onchange="toggleTodo('${nid}',${i})"><span>${esc(l.slice(3).trim())}</span></label>`}if(/^[-•]\s/.test(l))return`<p class="bul">${esc(l.slice(2))}</p>`;return l.trim()?`<p>${esc(l)}</p>`:''}).join('')}).join('<div class="gap"></div>')}
function toggleTodo(nid,idx){const n=note(nid);if(!n)return;ensureBoard(n);let i=0;for(const b of n.board.blocks)if(b.t==='check')for(const it of b.items||[]){if(i===idx){it.on=!it.on;syncBody(n);use('note_edit');save();render();return}i++}}
let _editMode={},_edited={};

/* ============ the editor ============ */
let NE=null;
function nSnap(){const n=note(NE.id);if(!n)return;NE.hist.push(JSON.stringify({t:n.title,b:n.board}));if(NE.hist.length>50)NE.hist.shift();NE.fut=[];nHistUI()}
function nRestore(from,to){const n=note(NE.id);if(!from.length)return;to.push(JSON.stringify({t:n.title,b:n.board}));const s=JSON.parse(from.pop());n.title=s.t;n.board=s.b;syncBody(n);saveSoon();NE.sel=null;NE.link=null;NE.mode=null;nRebuild();const T=$('#nT');if(T&&T.value!==n.title)T.value=n.title;nHistUI()}
function nUndo(){nRestore(NE.hist,NE.fut)}function nRedo(){nRestore(NE.fut,NE.hist)}
function nHistUI(){const u=$('#nUn'),r=$('#nRe');if(u)u.disabled=!NE.hist.length;if(r)r.disabled=!NE.fut.length}
function pNote(id){const n=note(id);if(!n){return redirect('flow')}ensureBoard(n);if(!NE||NE.id!==id)NE={id,sel:null,link:null,mode:null,hist:[],fut:[],s:1};
 const sh=[...(n.share.groups||[]).map(g=>grp(g)?.name).filter(Boolean),...(n.share.projects||[]).map(p=>proj(p)?.name).filter(Boolean)],col=NCOL[(n.col||0)%NCOL.length];
 after(()=>noteMount(n));
 return`<div class="page nedit" style="--nc:${col}"><header class="ph neh"><a class="icon-btn" href="#notes" aria-label="Back">${ic('back')}</a><div class="grow"></div>
 <button class="icon-btn" id="nUn" onclick="nUndo()" aria-label="Undo" ${NE.hist.length?'':'disabled'}>${ic('undo')}</button><button class="icon-btn" id="nRe" onclick="nRedo()" aria-label="Redo" ${NE.fut.length?'':'disabled'}>${ic('redo')}</button>
 <button class="icon-btn ${n.pin?'on':''}" onclick="notePin('${id}')" aria-label="Pin">${ic('pin')}</button><button class="icon-btn" onclick="shareTo(noteAtt(note('${id}')))" aria-label="Send as a widget">${ic('send')}</button><button class="icon-btn" onclick="noteMore('${id}')" aria-label="More">${ic('more')}</button></header>
 <div class="nhd"><div class="nlab">${noteGlyph(col)}<span>${n.pin?'Pinned note':'Note'}</span><em>${fmtDay(n.up)} · ${tHM(n.up)}</em></div>${sh.length?`<div class="nshared">${ic('group',2)} Shared with ${esc(sh.join(', '))}</div>`:''}
 <input id="nT" class="ntitle" placeholder="Title" value="${esc(n.title||'')}" maxlength="120" autocomplete="off"></div>
 <div class="nwrap" id="nW"><div class="nstage bg-${n.board.bg}" id="nSt" style="width:${BW}px"></div></div>
 <div class="nbar" id="nBar" role="toolbar" aria-label="Note tools"></div></div>`}
function nStage(){return $('#nSt')}
function noteMount(n){const st=nStage();if(!st)return;nRebuild();
 const T=$('#nT');T.oninput=()=>{if(!NE._tt){NE._tt=1;nSnap()}n.title=T.value;n.up=Date.now();nMark()};T.onblur=()=>{NE._tt=0};
 if(!n.title&&!n.board.blocks.length&&!('ontouchstart' in window))setTimeout(()=>T.focus(),250);
 st.addEventListener('input',nInput);st.addEventListener('keydown',nKey);st.addEventListener('focusin',e=>{const el=e.target.closest('.nb');if(el&&NE.sel!==el.dataset.b){NE.sel=el.dataset.b;NE.link=null;nSelUI()}});st.addEventListener('focusout',()=>{NE._typing=0});
 st.addEventListener('pointerdown',nDown);st.addEventListener('click',nClick);
 if(!st._tm){st._tm=1;st.addEventListener('touchmove',e=>{if(NE&&(NE.drag||NE.press))e.preventDefault()},{passive:false})}
 if(!window._nRs){window._nRs=1;addEventListener('resize',()=>{if(route.k==='note'&&nStage())nScale()})}}
function nMark(){const n=note(NE.id);if(!_edited[n.id]){_edited[n.id]=1;use('note_edit')}saveSoon()}
function nScale(){const st=nStage(),w=$('#nW');if(!st||!w)return;const s=Math.min(1.7,w.clientWidth/BW);NE.s=s;st._s=s;st.style.transform=`scale(${s})`;nLayout()}
/* re-render the whole stage (after undo, a new part, a background change) */
function nRebuild(){const n=note(NE.id),st=nStage();if(!n||!st)return;st.className='nstage bg-'+(n.board.bg||'dots')+(NE.mode==='connect'?' connecting':'')+(NE.mode==='draw'?' drawing':'');st.innerHTML=stageInner(n.board,true)+`<div class="nsel" id="nSel" hidden><button type="button" class="ngrip" aria-label="Move">${ic('grip',2.4)}</button><button type="button" class="nknob" aria-label="Drag to draw an arrow">${ic('arrowtool',2.2)}</button><span class="nrsz" aria-label="Resize"></span></div>`;
 nScale();if(autoStack(st,n.board)){nLayout();save()}paintSketches(st,n.board);nSelUI()}
/* arrows, the stage height and the selection frame follow the parts */
function nLayout(){const n=note(NE.id),st=nStage(),w=$('#nW');if(!n||!st)return;const H=paintLinks(st,n.board,NE.link,true),h=Math.max(H+260,(innerHeight-120)/NE.s);st.style.height=h+'px';if(w)w.style.height=h*NE.s+'px';nSelPos()}
let _nlq=0;const nLayoutSoon=()=>{if(_nlq)return;_nlq=requestAnimationFrame(()=>{_nlq=0;nLayout()})};
function nSelPos(){const s=$('#nSel');if(!s)return;const el=NE.sel&&nStage().querySelector(`:scope > [data-b="${NE.sel}"]`);if(!el||NE.mode==='draw'&&false){s.hidden=true;return}s.hidden=false;const b=blk(note(NE.id).board,NE.sel);if(!b){s.hidden=true;return}
 s.style.cssText=`left:${b.x-6}px;top:${b.y-6}px;width:${b.w+12}px;height:${el.offsetHeight+12}px`;s.classList.toggle('nosz',b.t==='sticky')}
function nSelUI(){const st=nStage();if(!st)return;st.querySelectorAll(':scope > .nb.sel').forEach(x=>x.classList.remove('sel'));if(NE.sel){const el=st.querySelector(`:scope > [data-b="${NE.sel}"]`);if(el)el.classList.add('sel');else NE.sel=null}
 st.querySelectorAll('.nl.sel').forEach(x=>x.classList.remove('sel'));if(NE.link){const g=st.querySelector(`.nl[data-l="${NE.link}"]`);if(g)g.classList.add('sel')}
 st.classList.toggle('connecting',NE.mode==='connect');st.classList.toggle('drawing',NE.mode==='draw');nSelPos();nBar()}
/* the floating bar: tools to add, or the options of what is selected */
function nBar(){const bar=$('#nBar');if(!bar)return;const n=note(NE.id),B=n.board;let h='';
 const tool=(fn,i,l,cls='')=>`<button type="button" class="ntl ${cls}" onclick="${fn}">${ic(i,1.9)}<span>${l}</span></button>`;
 const seg=(L,v,fn)=>`<div class="seg sm nseg">${L.map(([k,l])=>`<button type="button" class="${v===k?'on':''}" onclick="${fn}('${k}')">${l}</button>`).join('')}</div>`;
 if(NE.mode==='connect')h=`<div class="nhint">${ic('arrowtool',2)}<span>${NE.src?'Now tap where the arrow points':'Tap the part the arrow starts from'}</span><button type="button" class="btn sm" onclick="nModeOff()">Cancel</button></div>`;
 else if(NE.link){const L=B.links.find(x=>x.id===NE.link);if(!L){NE.link=null;return nBar()}h=`<div class="nopts"><div class="nrow"><b>Arrow</b><span class="grow"></span><button type="button" class="icon-btn sm" onclick="nLinkDel()" aria-label="Delete arrow">${ic('trash')}</button><button type="button" class="btn sm primary" onclick="nDeselect()">Done</button></div>
  <div class="nrow">${seg([['curve','Curve'],['straight','Straight'],['elbow','Elbow']],L.sh||'curve','nLinkSet.bind(null,\'sh\')')}</div><div class="nrow">${seg([['solid','Solid'],['dash','Dashed'],['hand','Hand']],L.ln||'solid','nLinkSet.bind(null,\'ln\')')}</div>
  <div class="nrow">${seg([['end','Arrow'],['both','Both ends'],['dot','Dot'],['none','Line']],L.hd||'end','nLinkSet.bind(null,\'hd\')')}</div><div class="nrow nsw">${Object.keys(NLC).map(c=>`<button type="button" class="ncs ${(L.c||'ink')===c?'on':''}" style="--cc:${NLC[c]}" onclick="nLinkSet('c','${c}')" aria-label="${c}"></button>`).join('')}</div></div>`}
 else if(NE.sel){const b=blk(B,NE.sel);if(!b){NE.sel=null;return nBar()}let opt='';
  if(b.t==='text')opt=`<div class="nrow">${seg(NTXT,b.s||'p','nSet.bind(null,\'s\')')}</div>`;
  else if(b.t==='sticky')opt=`<div class="nrow nsw">${NSC.map((c,i)=>`<button type="button" class="ncs ${(b.c||0)===i?'on':''}" style="--cc:${c}" onclick="nSet('c',${i})" aria-label="Sticky colour ${i+1}"></button>`).join('')}</div>`;
  else if(b.t==='motion')opt=`<div class="nrow nmos">${MOTIONS.map(([k,l])=>`<button type="button" class="${(b.m||'pulse')===k?'on':''}" onclick="nSet('m','${k}')"><span class="nmo m-${k}">${MOTION_SVG[k]}</span>${l}</button>`).join('')}</div><div class="nrow nsw">${Object.keys(NLC).map(c=>`<button type="button" class="ncs ${(b.c||'accent')===c?'on':''}" style="--cc:${NLC[c]}" onclick="nSet('c','${c}')" aria-label="${c}"></button>`).join('')}</div>`;
  else if(b.t==='sketch')opt=`<div class="nrow">${NE.mode==='draw'?`<span class="nsw">${['ink','accent','blue','green','red'].map(c=>`<button type="button" class="ncs ${(NE.pen||'ink')===c?'on':''}" style="--cc:${NLC[c]}" onclick="NE.pen='${c}';nBar()" aria-label="Pen ${c}"></button>`).join('')}</span><span class="grow"></span><button type="button" class="icon-btn sm" onclick="nSkUndo()" aria-label="Undo stroke">${ic('undo')}</button><button type="button" class="icon-btn sm" onclick="nSkClear()" aria-label="Clear sketch">${ic('eraser')}</button><button type="button" class="btn sm primary" onclick="nModeOff()">Done</button>`:`<button type="button" class="btn sm primary" onclick="nDraw()">${ic('draw')} Draw</button><span class="sub sm">Sketch with your finger on the pinned card.</span>`}</div>`;
  h=`<div class="nopts">${opt}<div class="nrow nacts">${tool(`nConnectFrom('${b.id}')`,'arrowtool','Arrow')}${tool('nDup()','copy','Duplicate')}${tool('nFront()','board','To front')}${tool('nDel()','trash','Delete','dz')}<button type="button" class="btn sm primary" onclick="nDeselect()">Done</button></div></div>`}
 else h=`<div class="nbtools">${tool("nAdd('text')",'textT','Text')}${tool("nAdd('check')",'check','List')}${tool("nAdd('thought')",'thought','Thought')}${tool("nAdd('sticky')",'sticky','Sticky')}${tool("nAdd('sketch')",'draw','Sketch')}${tool('nMotionPick()','motion','Motion')}${tool('nConnect()','arrowtool','Arrow',B.blocks.length<2?'dim':'')}${tool(`nBg('${n.id}')`,'bgpat','Page')}</div>`;
 if(bar._h!==h){bar.innerHTML=h;bar._h=h}}
function nDeselect(){NE.sel=null;NE.link=null;NE.mode=null;try{document.activeElement&&document.activeElement.blur()}catch(e){}nSelUI()}
function nModeOff(){NE.mode=null;NE.src=null;nSelUI()}
/* add a part under the last one and get straight to it */
function nAdd(t,extra={}){const n=note(NE.id),B=n.board,st=nStage();nSnap();let y=14;B.blocks.forEach(b=>{const el=st.querySelector(`:scope > [data-b="${b.id}"]`);y=Math.max(y,b.y+(el?el.offsetHeight:60)+18)});
 const W={text:328,check:300,thought:300,sticky:164,sketch:232,motion:200}[t],sk=B.blocks.filter(b=>b.t==='sticky').length;
 const b={id:nbid(),t,x:t==='sticky'?(sk%2?180:16):16,y,w:W,...extra};
 if(t==='text')b.s=b.s||'p',b.txt='';if(t==='check'){b.title='';b.items=[{id:nbid(),t:'',on:false}]}if(t==='thought')b.steps=[{id:nbid(),t:''},{id:nbid(),t:''}];if(t==='sticky'){b.txt='';b.c=sk%5;b.rot=[-2.2,1.6,-1,2.4,-1.8][sk%5]}
 if(t==='sketch'){b.h=164;b.strokes=[]}if(t==='motion'){b.m=b.m||'pulse';b.c='accent';b.txt=''}
 B.blocks.push(b);syncBody(n);nMark();use('note_block');NE.sel=b.id;NE.link=null;NE.mode=t==='sketch'?'draw':null;
 st.querySelector(':scope > .nlinks').insertAdjacentHTML('afterend','');const tmp=document.createElement('div');tmp.innerHTML=blockHTML(b,true);const el=tmp.firstElementChild;st.insertBefore(el,$('#nSel'));el.classList.add('nin');
 paintSketches(st,B);nLayout();nSelUI();setTimeout(()=>{const r=el.getBoundingClientRect();if(r.bottom>innerHeight-150||r.top<80)scrollBy({top:r.top-innerHeight*.35,behavior:'smooth'});const f=el.querySelector(t==='check'?'[data-f=item]':'[data-f]');if(f&&t!=='sketch'){f.focus();nCaret(f)}},60)}
function nCaret(el){try{const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}}
function nSet(k,v){const n=note(NE.id),b=blk(n.board,NE.sel);if(!b)return;nSnap();b[k]=v;syncBody(n);nMark();const el=nStage().querySelector(`:scope > [data-b="${b.id}"]`);const tmp=document.createElement('div');tmp.innerHTML=blockHTML(b,true);const ne=tmp.firstElementChild;ne.classList.add('sel');el.replaceWith(ne);paintSketches(nStage(),n.board);nLayout();nBar()}
function nDup(){const n=note(NE.id),b=blk(n.board,NE.sel);if(!b)return;nSnap();const c=JSON.parse(JSON.stringify(b));c.id=nbid();c.x=Math.min(BW-c.w,b.x+18);c.y=b.y+24;(c.items||[]).forEach(i=>i.id=nbid());(c.steps||[]).forEach(i=>i.id=nbid());n.board.blocks.push(c);syncBody(n);nMark();NE.sel=c.id;nRebuild()}
function nFront(){const n=note(NE.id),B=n.board,i=B.blocks.findIndex(b=>b.id===NE.sel);if(i<0)return;nSnap();B.blocks.push(B.blocks.splice(i,1)[0]);nMark();nRebuild()}
function nDel(){const n=note(NE.id),B=n.board;if(!NE.sel)return;nSnap();const id=NE.sel;B.blocks=B.blocks.filter(b=>b.id!==id);B.links=B.links.filter(l=>l.a!==id&&l.b!==id);syncBody(n);nMark();NE.sel=null;NE.mode=null;const el=nStage().querySelector(`:scope > [data-b="${id}"]`);if(el){el.classList.add('nout');setTimeout(()=>{el.remove();nLayout()},180)}nSelUI();toast('Removed. Undo brings it back.')}
/* arrows */
function nConnect(){const n=note(NE.id);if(n.board.blocks.length<2){toast('Add two parts first, then join them');return}NE.mode='connect';NE.src=null;NE.sel=null;NE.link=null;nSelUI()}
function nConnectFrom(id){NE.mode='connect';NE.src=id;NE.sel=null;NE.link=null;nSelUI();const el=nStage().querySelector(`:scope > [data-b="${id}"]`);if(el)el.classList.add('src')}
function nLink(a,b){const n=note(NE.id);if(!a||!b||a===b)return;nSnap();const ex=n.board.links.find(l=>l.a===a&&l.b===b);if(ex){NE.link=ex.id}else{const last=n.board.links[n.board.links.length-1],L={id:'l'+uid(),a,b,sh:last?.sh||'curve',ln:last?.ln||'solid',hd:last?.hd||'end',c:last?.c||'ink'};n.board.links.push(L);NE.link=L.id;use('note_link')}
 nMark();NE.mode=null;NE.src=null;NE.sel=null;nStage().querySelectorAll('.nb.src').forEach(x=>x.classList.remove('src'));nLayout();nSelUI();const g=nStage().querySelector(`.nl[data-l="${NE.link}"]`);if(g)g.classList.add('nlnew')}
function nLinkSet(k,v){const n=note(NE.id),L=n.board.links.find(x=>x.id===NE.link);if(!L)return;nSnap();L[k]=v;nMark();nLayout();nSelUI()}
function nLinkDel(){const n=note(NE.id);nSnap();n.board.links=n.board.links.filter(x=>x.id!==NE.link);NE.link=null;nMark();nLayout();nSelUI()}
/* sketch */
function nDraw(){NE.mode='draw';nSelUI()}
function nSkUndo(){const b=blk(note(NE.id).board,NE.sel);if(!b||!(b.strokes||[]).length)return;nSnap();b.strokes.pop();nMark();paintSketches(nStage(),note(NE.id).board)}
function nSkClear(){const b=blk(note(NE.id).board,NE.sel);if(!b||!(b.strokes||[]).length)return;nSnap();b.strokes=[];nMark();paintSketches(nStage(),note(NE.id).board)}
/* motion picker */
function nMotionPick(){openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Add motion"><div class="sheet-h"><h2>Motion</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div><p class="sub" style="margin:0 2px 10px">A small loop that shows what you mean.</p>
 <div class="nmopick">${MOTIONS.map(([k,l,d])=>`<button type="button" data-m="${k}"><span class="nmo m-${k}" style="--mc:var(--accent)">${MOTION_SVG[k]}</span><b>${l}</b><span>${d}</span></button>`).join('')}</div></div>`);
 $$('.nmopick [data-m]').forEach(b=>b.onclick=()=>{closeSheet();setTimeout(()=>nAdd('motion',{m:b.dataset.m}),180)})}
/* page background and colour */
function nBg(id){const n=note(id);openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Page"><div class="sheet-h"><h2>Page</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div>
 <div class="flabel">Background</div><div class="nbgpick">${NBG.map(([k,l])=>`<button type="button" class="${n.board.bg===k?'on':''}" data-bg="${k}" style="--nc:${NCOL[(n.col||0)%NCOL.length]}"><span class="nbgs bg-${k}"></span>${l}</button>`).join('')}</div>
 <div class="flabel">Colour</div><div class="opts">${NCOL.map((c,i)=>`<button type="button" class="sw ${n.col===i?'on':''}" data-col="${i}" style="background:${c}" aria-label="Colour ${i+1}"></button>`).join('')}</div></div>`);
 $$('[data-bg]').forEach(b=>b.onclick=()=>{nSnap();n.board.bg=b.dataset.bg;nMark();$$('[data-bg]').forEach(x=>x.classList.toggle('on',x===b));const st=nStage();if(st){st.className=st.className.replace(/bg-\w+/,'bg-'+n.board.bg)}});
 $$('[data-col]').forEach(b=>b.onclick=()=>{n.col=+b.dataset.col;save();closeSheet();render()})}
function noteMore(id){const n=note(id);openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Note"><div class="sheet-h"><h2>${esc(noteTitle(n))}</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div><div class="card list flat">
 <button class="li" onclick="closeSheet();setTimeout(()=>nBg('${id}'),220)">${ic('bgpat')}<div class="grow t">Page and colour</div></button>
 <button class="li" onclick="closeSheet();notePin('${id}')">${ic('pin')}<div class="grow t">${n.pin?'Unpin':'Pin to the top'}</div></button>
 <button class="li" onclick="closeSheet();setTimeout(()=>shareSheet('${id}'),220)">${ic('group')}<div class="grow t">Share with a group or project</div></button>
 <button class="li" onclick="closeSheet();setTimeout(()=>shareTo(noteAtt(note('${id}'))),220)">${ic('send')}<div class="grow t">Send as a widget</div></button>
 <button class="li" onclick="closeSheet();setTimeout(()=>ask('Delete this note?',()=>{S.notes=S.notes.filter(x=>x.id!=='${id}');go('notes')}),220)">${ic('trash')}<div class="grow t" style="color:var(--red)">Delete note</div></button></div></div>`)}
/* ---- typing ---- */
function nInput(e){const f=e.target.closest('[data-f]'),el=e.target.closest('.nb');if(!f||!el)return;const n=note(NE.id),b=blk(n.board,el.dataset.b);if(!b)return;if(!NE._typing){NE._typing=1;const now=JSON.stringify({t:n.title,b:n.board});NE.hist.push(now);NE.fut=[];if(NE.hist.length>50)NE.hist.shift();nHistUI()}
 const v=f.innerText.replace(/ /g,' ').replace(/\n$/,'');const k=f.dataset.f;
 if(k==='txt')b.txt=v;else if(k==='title')b.title=v;else if(k==='item'){const it=(b.items||[]).find(x=>x.id===f.closest('[data-iid]').dataset.iid);if(it)it.t=v}else if(k==='step'){const s=(b.steps||[]).find(x=>x.id===f.closest('[data-sid]').dataset.sid);if(s)s.t=v}
 syncBody(n);nMark();nLayoutSoon()}
function nKey(e){const f=e.target.closest('[data-f]');if(!f)return;const el=e.target.closest('.nb'),n=note(NE.id),b=blk(n.board,el.dataset.b);if(!b)return;
 if(f.dataset.f==='item'||f.dataset.f==='step'||f.dataset.f==='title'){const list=f.dataset.f==='step'?b.steps:b.items;
  if(e.key==='Enter'){e.preventDefault();if(f.dataset.f==='title'){const ff=el.querySelector('[data-f=item]');if(ff){ff.focus();nCaret(ff)}return}const cur=f.closest(f.dataset.f==='step'?'[data-sid]':'[data-iid]'),id=cur.dataset[f.dataset.f==='step'?'sid':'iid'],i=list.findIndex(x=>x.id===id);if(list[i+1]&&!list[i+1].t.trim()){const fs=el.querySelectorAll(`[data-f=${f.dataset.f}]`);if(fs[i+1]){fs[i+1].focus();nCaret(fs[i+1])}return}nAddRow(b,el,i+1)}
  else if(e.key==='Backspace'&&!f.innerText.trim()&&f.dataset.f!=='title'&&list.length>1){e.preventDefault();const cur=f.closest(f.dataset.f==='step'?'[data-sid]':'[data-iid]'),id=cur.dataset[f.dataset.f==='step'?'sid':'iid'],i=list.findIndex(x=>x.id===id);nSnap();list.splice(i,1);syncBody(n);nMark();nReblock(b,el,Math.max(0,i-1))}}}
function nAddRow(b,el,at){const n=note(NE.id);nSnap();const list=b.t==='thought'?(b.steps=b.steps||[]):(b.items=b.items||[]);list.splice(at==null?list.length:at,0,b.t==='thought'?{id:nbid(),t:''}:{id:nbid(),t:'',on:false});syncBody(n);nMark();nReblock(b,el,at==null?list.length-1:at)}
function nReblock(b,el,focusAt){const tmp=document.createElement('div');tmp.innerHTML=blockHTML(b,true);const ne=tmp.firstElementChild;ne.classList.add('sel');el.replaceWith(ne);nLayout();const fs=ne.querySelectorAll(b.t==='thought'?'[data-f=step]':'[data-f=item]');const f=fs[Math.min(focusAt,fs.length-1)];if(f){f.focus();nCaret(f)}}
/* ---- taps: ticks, add-row buttons, arrows, choosing parts ---- */
function nClick(e){const n=note(NE.id);const ck=e.target.closest('[data-ck]');if(ck){const el=ck.closest('.nb'),b=blk(n.board,el.dataset.b),it=(b.items||[]).find(x=>x.id===ck.dataset.ck);if(it){nSnap();it.on=!it.on;syncBody(n);nMark();const row=ck.closest('.cki');row.classList.toggle('on',it.on);ck.setAttribute('aria-label',it.on?'Mark as not done':'Mark as done');const d=b.items.filter(x=>x.on).length,p=el.querySelector('.nck-p i');if(p)p.style.width=Math.round(d/b.items.length*100)+'%';if(it.on){row.classList.remove('pop');void row.offsetWidth;row.classList.add('pop')}}return}
 const ad=e.target.closest('[data-add]');if(ad){const el=ad.closest('.nb'),b=blk(n.board,el.dataset.b);nAddRow(b,el);return}}
/* ---- pointer: select, move (grip, or press and hold), resize, drag an arrow out of the knob, sketch ---- */
function nPt(e){const r=nStage().getBoundingClientRect();return[(e.clientX-r.left)/NE.s,(e.clientY-r.top)/NE.s]}
function nDown(e){if(e.button>0)return;const n=note(NE.id),B=n.board,st=nStage(),t=e.target;
 if(NE.mode==='draw'){const cv=t.closest('canvas[data-sk]');if(cv&&cv.dataset.sk===NE.sel){e.preventDefault();const b=blk(B,NE.sel),r=cv.getBoundingClientRect(),P=ev=>[ (ev.clientX-r.left)/NE.s,(ev.clientY-r.top)/NE.s];nSnap();const s={c:NE.pen||'ink',s:2.4,p:[P(e)]};b.strokes=b.strokes||[];b.strokes.push(s);cv.setPointerCapture(e.pointerId);
   const mv=ev=>{const evs=ev.getCoalescedEvents?ev.getCoalescedEvents():[ev];evs.forEach(x=>{const p=P(x);p[0]=clamp(p[0],0,b.w);p[1]=clamp(p[1],0,b.h||164);s.p.push([+p[0].toFixed(1),+p[1].toFixed(1)])});if(!NE._skq)NE._skq=requestAnimationFrame(()=>{NE._skq=0;paintSketches(st,B)})};
   const up=()=>{cv.removeEventListener('pointermove',mv);cv.removeEventListener('pointerup',up);cv.removeEventListener('pointercancel',up);if(s.p.length>400)s.p=s.p.filter((_,i)=>i%2===0||i===s.p.length-1);paintSketches(st,B);nMark();if(!B._skUsed){B._skUsed=1;use('note_sketch')}const e2=cv.parentElement.querySelector('.nsk-e');if(e2)e2.remove()};
   cv.addEventListener('pointermove',mv);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);return}}
 if(t.closest('.ngrip')){e.preventDefault();return nDragStart(e,NE.sel,true)}
 if(t.closest('.nrsz')){e.preventDefault();return nResizeStart(e)}
 if(t.closest('.nknob')){e.preventDefault();return nKnobStart(e)}
 const lk=t.closest('.nl');if(lk&&!t.closest('.nb')){NE.link=lk.dataset.l;NE.sel=null;NE.mode=null;try{document.activeElement.blur()}catch(x){}nSelUI();return}
 const el=t.closest('.nb');
 if(NE.mode==='connect'){if(!el){return}e.preventDefault();if(!NE.src){NE.src=el.dataset.b;el.classList.add('src');nBar()}else nLink(NE.src,el.dataset.b);return}
 if(!el){if(t===st||t.classList.contains('nlinks')||t.closest('.nlinks')){if(NE.sel||NE.link){NE.sel=null;NE.link=null;NE.mode=null;try{document.activeElement.blur()}catch(x){}nSelUI()}}return}
 const id=el.dataset.b;if(NE.sel!==id||NE.link){NE.sel=id;NE.link=null;if(NE.mode==='draw')NE.mode=null;nSelUI()}
 if(t.closest('[data-ck],[data-add]'))return;
 /* press and hold anywhere on a part to move it */
 const sx=e.clientX,sy=e.clientY,pid=e.pointerId;NE.press={sx,sy};clearTimeout(NE._lp);
 const cancel=()=>{clearTimeout(NE._lp);NE.press=null;removeEventListener('pointermove',mv0);removeEventListener('pointerup',cancel);removeEventListener('pointercancel',cancel)};
 const mv0=ev=>{if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>9)cancel()};
 addEventListener('pointermove',mv0);addEventListener('pointerup',cancel);addEventListener('pointercancel',cancel);
 NE._lp=setTimeout(()=>{cancel();try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}try{document.activeElement.blur()}catch(x){}nDragStart({clientX:sx,clientY:sy,pointerId:pid,_held:1},id,false)},360)}
function nDragStart(e,id,grip){const n=note(NE.id),b=blk(n.board,id);if(!b)return;const st=nStage(),el=st.querySelector(`:scope > [data-b="${id}"]`);nSnap();const p0=nPt(e),o=[b.x,b.y];NE.drag=1;el.classList.add('dragging');document.body.classList.add('ndrag');
 const mv=ev=>{ev.preventDefault&&ev.preventDefault();const p=nPt(ev);b.x=Math.round(clamp(o[0]+p[0]-p0[0],-b.w+40,BW-40));b.y=Math.round(Math.max(0,o[1]+p[1]-p0[1]));el.style.left=b.x+'px';el.style.top=b.y+'px';nLayoutSoon()};
 const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);NE.drag=0;el.classList.remove('dragging');document.body.classList.remove('ndrag');syncBody(n);nMark();nLayout()};
 addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up)}
function nResizeStart(e){const n=note(NE.id),b=blk(n.board,NE.sel);if(!b)return;const st=nStage(),el=st.querySelector(`:scope > [data-b="${b.id}"]`);nSnap();const p0=nPt(e),w0=b.w,h0=b.h;NE.drag=1;document.body.classList.add('ndrag');
 const mv=ev=>{const p=nPt(ev);b.w=Math.round(clamp(w0+p[0]-p0[0],110,BW-Math.max(0,b.x)));el.style.width=b.w+'px';if(b.t==='sketch'){b.h=Math.round(clamp(h0+p[1]-p0[1],90,420));el.querySelector('.nsketch').style.height=b.h+'px'}nLayoutSoon()};
 const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);NE.drag=0;document.body.classList.remove('ndrag');if(b.t==='sketch')paintSketches(st,n.board);nMark();nLayout()};
 addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)}
function nKnobStart(e){const n=note(NE.id),a=blk(n.board,NE.sel);if(!a)return;const st=nStage(),svg=st.querySelector(':scope > .nlinks');NE.drag=1;document.body.classList.add('ndrag');
 const el=st.querySelector(`:scope > [data-b="${a.id}"]`),R={x:a.x,y:a.y,w:a.w,h:el.offsetHeight};let tmp=document.createElementNS('http://www.w3.org/2000/svg','path');tmp.setAttribute('class','nltmp');svg.appendChild(tmp);
 const over=ev=>{const h=document.elementFromPoint(ev.clientX,ev.clientY),t=h&&h.closest&&h.closest('#nSt > .nb');return t&&t.dataset.b!==a.id?t:null};let hov=null;
 const mv=ev=>{const p=nPt(ev),s=edgePt(R,p),pts=lpath(s,p,'curve');tmp.setAttribute('d','M'+pts.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L'));const o=over(ev);if(o!==hov){if(hov)hov.classList.remove('tgt');hov=o;if(hov)hov.classList.add('tgt')}};
 const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);NE.drag=0;document.body.classList.remove('ndrag');tmp.remove();if(hov){hov.classList.remove('tgt');nLink(a.id,hov.dataset.b)}else if(ev.type==='pointerup')toast('Drop the arrow on another part')};
 addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up)}
/* ---- small actions kept from before ---- */
function insLine(p){const n=note(NE&&NE.id);if(!n)return;nAdd(p.startsWith('[')?'check':'text',p.startsWith('#')?{s:'h'}:{})}
function notePin(id){const n=note(id);n.pin=!n.pin;save();render();toast(n.pin?'Pinned':'Unpinned')}
function noteCol(id,i){const n=note(id);n.col=i;save();render()}
function shareSheet(id){const n=note(id);openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Share note"><div class="sheet-h"><h2>Share note</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div><p class="sub" style="margin-top:0">Shared notes appear in the group or project for everyone.</p>
 ${S.groups.length?`<div class="flabel">Groups</div><div class="picks">${S.groups.map(g=>`<label class="pickrow"><input type="checkbox" data-g="${g.id}" ${n.share.groups.includes(g.id)?'checked':''}><span class="gdot" style="background:${g.col}"></span><b>${esc(g.name)}</b><span class="sub">${plural(g.members.length,'member')}</span></label>`).join('')}</div>`:''}
 ${S.projects.length?`<div class="flabel">Projects</div><div class="picks">${S.projects.map(p=>`<label class="pickrow"><input type="checkbox" data-p="${p.id}" ${n.share.projects.includes(p.id)?'checked':''}><span class="gdot" style="background:${p.col}"></span><b>${esc(p.name)}</b></label>`).join('')}</div>`:''}
 ${!S.groups.length&&!S.projects.length?'<p class="sub">Create a group or project first.</p>':''}<button class="btn primary full" id="shOK">Done</button></div>`);
 $('#shOK').onclick=()=>{const g=$$('[data-g]').filter(x=>x.checked).map(x=>x.dataset.g),p=$$('[data-p]').filter(x=>x.checked).map(x=>x.dataset.p);const added=g.filter(x=>!n.share.groups.includes(x)).length+p.filter(x=>!n.share.projects.includes(x)).length;
  n.share={groups:g,projects:p};if(added){use('note_share',added);led('note',`Shared “${noteTitle(n)}”`,{ref:'note:'+n.id});p.forEach(pid=>act(proj(pid),'me',`shared the note “${noteTitle(n)}”`))}closeSheet();save();render();if(added)toast('Shared')}}
function sendNoteToChat(id){shareTo(noteAtt(note(id)))}
