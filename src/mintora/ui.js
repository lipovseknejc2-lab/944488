/* Mintora UI kit: sidebar, toolbar, overlays, palette, toasts, controls and charts */
const NAV=[
 ['Workspace',[['dash','Dashboard','dash'],['products','Products','box'],['store','Storefronts','page'],['analytics','Analytics','chart'],['sales','Sales','receipt']]],
 ['Build',[['roadmap','Roadmap','map'],['team','People','users'],['messages','Messages','chat'],['hubs','Hubs','hub']]],
 ['Account',[['credits','Credits','coins'],['settings','Settings','gear']]]];
const BPNAV=[['Blueprint',[['bp','Overview','bp'],['bp/plugins','Plugins','plug'],['bp/designs','Designs','palette'],['bp/license','License','key'],['bp/docs','Reference','code']]]];
function navOn(h){const [k,s]=h.split('/');if(k!==route.k)return false;if(k!=='bp')return true;return(route.a[0]||'')===(s||'')||(s==='plugins'&&route.a[0]==='plugin')||(s==='designs'&&route.a[0]==='design')}
function side(){const bp=route.k==='bp',el=$('#side');const unread=sum(S.channels.map(c=>c.unread||0)),hubU=sum(S.hubs.filter(h=>h.joined).flatMap(h=>h.channels.map(c=>c.unread||0)));
 const live=S.products.filter(p=>p.status==='live').length;
 el.innerHTML=`<div class="brand" onclick="go('${bp?'bp':'dash'}')" title="${bp?'Blueprint':'Dashboard'}">${bp?bpMark(30):mark()}<div><b>mintora</b><span class="tier">${bp?'Blueprint':licensed()?'Blueprint licensed':'Workspace'}</span></div></div>
 ${bp?`<a class="ws" href="#/dash" style="text-decoration:none">${ic('left')}<div><b>Back to Mintora</b><span>${esc(S.workspace.name)}</span></div></a>`:`<div class="ws" onclick="wsMenu(event)"><span class="wsl" style="background:${S.workspace.color}">${esc(S.workspace.initials)}</span><div><b>${esc(S.workspace.name)}</b><span>${plural(S.team.length+1,'member')} · ${live} live</span></div>${ic('down','s')}</div>`}
 <nav class="nav">${(bp?BPNAV:NAV).map(([g,items])=>`<div class="grp">${g}</div>${items.map(([h,n,i])=>{let extra='';
  if(h==='products')extra=`<span class="cnt">${S.products.length}</span>`;if(h==='messages'&&unread)extra=`<span class="cnt" style="color:var(--mint-ink)">${unread}</span>`;if(h==='hubs'&&hubU)extra=`<span class="dot"></span>`;
  if(h==='credits')extra=`<span class="cnt">${short(S.credits.balance)}</span>`;if(h.startsWith('bp/')&&h!=='bp/license'&&h!=='bp/docs'&&!licensed())extra=`<span class="lk">${ic('lock')}</span>`;
  return`<a href="#/${h}" class="${navOn(h)?'on':''}" data-nav="${h}">${ic(i)}<span>${n}</span>${extra}</a>`}).join('')}`).join('')}</nav>
 <div class="sidefoot">${bp?'':`<button class="bpbtn" onclick="go('bp')">${ic('bp')}<div><b>Blueprint</b><span>${licensed()?'LICENSED · '+esc(S.bp.license.tier.toUpperCase()):'PLUGINS AND DESIGNS'}</span></div></button>`}
 <div class="me" onclick="go('settings')">${avatar(S.me,30,true)}<div><b>${esc(S.me.name)}</b><span>Owner</span></div></div></div>`}
function bar(){const T=(PAGES[route.k]||PAGES.dash).crumbs?.(...route.a)||[];const unread=S.notifs.filter(n=>!n.read).length;
 $('#bar').innerHTML=`<div class="crumbs">${T.map((c,i)=>i<T.length-1?`<a href="${c[1]}">${esc(c[0])}</a>${ic('right')}`:`<b>${esc(c[0])}</b>`).join('')}</div>
 <button class="search" onclick="palette()" aria-label="Search and commands">${ic('search','s')}<span>Search or jump to…</span><kbd>⌘K</kbd></button>
 <button class="credpill" id="credp" onclick="go('credits')" title="Credits">${coinIc()}<b class="num">${nfmt(S.credits.balance)}</b></button>
 <button class="ibtn" onclick="notifs(event)" aria-label="Notifications">${ic('bell')}${unread?'<i class="badge-dot"></i>':''}</button>
 <button class="ibtn" onclick="toggleTheme()" aria-label="Switch light and dark">${ic(theme()==='dark'?'sun':'moon')}</button>`}
/* ---- theme ---- */
function theme(){const t=S.settings.theme;return t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t}
function applyTheme(){document.documentElement.dataset.theme=theme();const m=$('meta[name=theme-color]');if(m)m.content=theme()==='dark'?'#0B0E0D':'#F6F7F5'}
function toggleTheme(){S.settings.theme=theme()==='dark'?'light':'dark';applyTheme();save();bar()}
/* ---- overlays ---- */
let _ovStack=[];
function overlay(html,{onClose}={}){const ov=$('#ov');ov.innerHTML=`<div class="scrim" data-close></div>${html}`;ov.classList.add('open');_ovStack=[onClose];
 ov.onclick=e=>{if(e.target.closest('[data-close]'))closeOv()};setTimeout(()=>{const f=ov.querySelector('[autofocus],input:not([type=hidden]),textarea,select');f&&f.focus()},40);return ov}
function closeOv(){const ov=$('#ov');if(!ov.classList.contains('open'))return;const f=_ovStack.pop();ov.classList.remove('open');ov.innerHTML='';try{f&&f()}catch(e){}}
function modal(title,body,{sub='',foot='',wide=false,onClose}={}){return overlay(`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh"><div><h2>${esc(title)}</h2>${sub?`<p>${sub}</p>`:''}</div><button class="ibtn x" data-close aria-label="Close">${ic('x')}</button></div><div class="mb">${body}</div>${foot?`<div class="mf">${foot}</div>`:''}</div>`,{onClose})}
function drawer(title,body,{sub='',foot='',onClose}={}){return overlay(`<div class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh" style="display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid var(--line)"><div class="grow"><h2>${esc(title)}</h2>${sub?`<p class="muted sm" style="margin:3px 0 0">${sub}</p>`:''}</div><button class="ibtn" data-close aria-label="Close">${ic('x')}</button></div><div style="flex:1;overflow:auto;padding:18px 22px">${body}</div>${foot?`<div class="mf" style="display:flex;gap:8px;justify-content:flex-end;padding:14px 22px;border-top:1px solid var(--line)">${foot}</div>`:''}</div>`,{onClose})}
function confirmBox(title,text,{ok='Confirm',danger=false}={}){return new Promise(res=>{let done=false;modal(title,`<p class="muted" style="margin:0">${text}</p>`,{foot:`<button class="btn" data-close>Cancel</button><button class="btn pri ${danger?'danger':''}" id="cfOk">${esc(ok)}</button>`,onClose:()=>{if(!done)res(false)}});$('#cfOk').onclick=()=>{done=true;closeOv();res(true)}})}
function menu(e,items){e.stopPropagation();closeMenu();const m=document.createElement('div');m.className='menu';m.id='menu';
 m.innerHTML=items.map((it,i)=>it==='-'?'<hr>':`<button data-i="${i}" class="${it.danger?'danger':''}">${it.ic?ic(it.ic,'s'):''}${esc(it.t)}${it.k?`<kbd style="margin-left:auto">${it.k}</kbd>`:''}</button>`).join('');document.body.appendChild(m);
 const r=(e.currentTarget||e.target).getBoundingClientRect(),mw=m.offsetWidth,mh=m.offsetHeight;let x=r.left,y=r.bottom+6;if(x+mw>innerWidth-8)x=r.right-mw;if(y+mh>innerHeight-8)y=r.top-mh-6;m.style.left=Math.max(8,x)+'px';m.style.top=Math.max(8,y)+'px';
 m.onclick=ev=>{const b=ev.target.closest('button');if(!b)return;const it=items[+b.dataset.i];closeMenu();it.fn&&it.fn()};setTimeout(()=>document.addEventListener('click',closeMenu,{once:true}),0)}
function closeMenu(){const m=$('#menu');m&&m.remove()}
function toast(t,icn='check'){const el=document.createElement('div');el.className='toast';el.innerHTML=`${ic(icn)}<span>${esc(t)}</span>`;$('#toasts').appendChild(el);setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),320)},2600)}
/* tooltips for anything with data-tip */
document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip]');let tp=$('#tip');if(!t){tp&&tp.remove();return}if(!tp){tp=document.createElement('div');tp.id='tip';tp.className='tip';document.body.appendChild(tp)}tp.textContent=t.dataset.tip;const r=t.getBoundingClientRect();tp.style.left=clamp(r.left+r.width/2-tp.offsetWidth/2,6,innerWidth-tp.offsetWidth-6)+'px';tp.style.top=(r.top-tp.offsetHeight-8)+'px'});
/* ---- segmented control with a sliding thumb ---- */
function seg(id,opts,val,fn){return`<div class="seg" id="${id}" data-fn="${fn}">${opts.map(([v,t])=>`<button class="${v===val?'on':''}" data-v="${v}">${t}</button>`).join('')}<i class="thumb"></i></div>`}
function segInit(root=document){$$('.seg',root).forEach(s=>{const place=()=>{const on=s.querySelector('button.on')||s.querySelector('button'),th=s.querySelector('.thumb');if(!on||!th)return;th.style.left=on.offsetLeft+'px';th.style.width=on.offsetWidth+'px'};place();
 s.onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',s).forEach(x=>x.classList.toggle('on',x===b));place();const f=window[s.dataset.fn];f&&f(b.dataset.v)}})}
function tgl(on,fn,label=''){return`<button class="tgl ${on?'on':''}" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" onclick="this.classList.toggle('on');this.setAttribute('aria-checked',this.classList.contains('on'));${fn}(this.classList.contains('on'))"></button>`}
function delta(v,{inv}={}){if(!isFinite(v))return`<span class="delta eq">new</span>`;const up=v>=0,good=inv?!up:up;if(Math.abs(v)<.005)return`<span class="delta eq">0%</span>`;return`<span class="delta ${good?'up':'dn'}">${up?'↑':'↓'} ${Math.abs(v*100).toFixed(1)}%</span>`}
/* ---- charts (SVG, hand-made, crisp at any size) ---- */
function lineChart(series,{h=240,labels=[],fmt=v=>short(v),cols=['var(--mint)','var(--violet)'],dashed=[],id='lc'}={}){const W=760,H=h,pl=44,pr=10,pt=12,pb=26,n=series[0].length;
 const all=series.flat(),mx=Math.max(1,...all)*1.12,X=i=>pl+(n<2?0:i*(W-pl-pr)/(n-1)),Y=v=>pt+(H-pt-pb)*(1-v/mx);
 const ticks=4,gl=Array.from({length:ticks+1},(_,i)=>{const v=mx*i/ticks;return`<path class="gl" d="M${pl} ${Y(v)}H${W-pr}"/><text class="ax" x="${pl-8}" y="${Y(v)+3.5}" text-anchor="end">${fmt(v)}</text>`}).join('');
 const step=Math.max(1,Math.ceil(n/7)),xl=labels.map((l,i)=>i%step===0||i===n-1?`<text class="ax" x="${X(i)}" y="${H-6}" text-anchor="middle">${l}</text>`:'').join('');
 const paths=series.map((s,k)=>{const d=s.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');return(k===0?`<path class="area" d="${d}L${X(n-1)} ${Y(0)}L${X(0)} ${Y(0)}Z" fill="${cols[k]}"/>`:'')+`<path class="${dashed.includes(k)?'ln2':'ln'}" d="${d}" stroke="${cols[k]}"/>`}).join('');
 return`<svg class="chart" id="${id}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${h}px" data-n="${n}">${gl}${xl}${paths}<path class="hl" d="M0 ${pt}V${H-pb}"/>${series.map((s,k)=>`<circle class="dotp" r="4" fill="var(--panel)" stroke="${cols[k]}" stroke-width="2" cx="0" cy="0"/>`).join('')}<rect x="${pl}" y="0" width="${W-pl-pr}" height="${H}" fill="transparent" class="hit"/></svg>`}
/* hover readout for a line chart */
function chartHover(id,series,labels,fmt,names){const svg=$('#'+id);if(!svg)return;const n=series[0].length,W=760,pl=44,pr=10,H=+svg.getAttribute('viewBox').split(' ')[3],pt=12,pb=26,mx=Math.max(1,...series.flat())*1.12;
 const hit=svg.querySelector('.hit'),hl=svg.querySelector('.hl'),dots=$$('.dotp',svg);
 hit.onmousemove=e=>{svg.classList.add('hov');const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,i=clamp(Math.round((x-pl)/(W-pl-pr)*(n-1)),0,n-1),X=pl+i*(W-pl-pr)/Math.max(1,n-1);hl.setAttribute('d',`M${X} ${pt}V${H-pb}`);
  dots.forEach((d,k)=>{d.setAttribute('cx',X);d.setAttribute('cy',pt+(H-pt-pb)*(1-series[k][i]/mx))});
  let tp=$('#tip');if(!tp){tp=document.createElement('div');tp.id='tip';tp.className='tip';document.body.appendChild(tp)}tp.innerHTML=`<b>${esc(labels[i])}</b> · ${series.map((s,k)=>`${names[k]} ${fmt(s[i])}`).join(' · ')}`;tp.style.left=clamp(e.clientX-tp.offsetWidth/2,6,innerWidth-tp.offsetWidth-6)+'px';tp.style.top=(r.top+window.scrollY-tp.offsetHeight+4)+'px'};
 hit.onmouseleave=()=>{svg.classList.remove('hov');const tp=$('#tip');tp&&tp.remove()}}
function bars(vals,{h=180,labels=[],col='var(--mint)',fmt=v=>short(v)}={}){const W=760,H=h,pl=40,pb=24,n=vals.length,mx=Math.max(1,...vals)*1.1,bw=(W-pl)/n;
 return`<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${h}px">${[0,.5,1].map(f=>`<path class="gl" d="M${pl} ${(H-pb)*(1-f)+4}H${W}"/><text class="ax" x="${pl-8}" y="${(H-pb)*(1-f)+8}" text-anchor="end">${fmt(mx*f)}</text>`).join('')}
 ${vals.map((v,i)=>{const bh=(H-pb-4)*v/mx;return`<rect class="bar" x="${pl+i*bw+bw*.18}" y="${H-pb-bh}" width="${bw*.64}" height="${Math.max(0,bh)}" rx="${Math.min(4,bw*.2)}" fill="${col}" data-tip="${esc(labels[i]||'')}: ${fmt(v)}"/>`}).join('')}
 ${labels.map((l,i)=>i%Math.max(1,Math.ceil(n/8))===0?`<text class="ax" x="${pl+i*bw+bw/2}" y="${H-6}" text-anchor="middle">${l}</text>`:'').join('')}</svg>`}
function spark(vals,col='var(--mint)'){const n=vals.length,mx=Math.max(1,...vals),mn=Math.min(...vals),W=96,H=34,X=i=>i*W/(n-1),Y=v=>H-2-(H-6)*(v-mn)/Math.max(1,mx-mn);const d=vals.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
 return`<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}L${W} ${H}L0 ${H}Z" fill="${col}" opacity=".12"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
function donut(parts,{sz=170,th=22}={}){const tot=sum(parts.map(p=>p[1]))||1,r=(sz-th)/2,C=2*Math.PI*r;let off=0;
 return`<svg viewBox="0 0 ${sz} ${sz}" width="${sz}" height="${sz}" style="transform:rotate(-90deg)"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="var(--sunken)" stroke-width="${th}"/>${parts.map(([n,v,c])=>{const len=C*v/tot,s=`<circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${c}" stroke-width="${th}" stroke-dasharray="${Math.max(0,len-2)} ${C}" stroke-dashoffset="${-off}" data-tip="${esc(n)}: ${pct(v/tot)}"/>`;off+=len;return s}).join('')}</svg>`}
function gauge(v,col){const r=86,C=2*Math.PI*r,len=C*.75;return`<div class="gauge"><svg viewBox="0 0 200 200" style="transform:rotate(135deg)"><circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--sunken)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${len} ${C}"/><circle id="gArc" cx="100" cy="100" r="${r}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="0 ${C}" data-len="${len*v/100} ${C}" style="transition:stroke-dasharray 1.2s var(--ease)"/>${Array.from({length:11},(_,i)=>{const a=i/10*270*Math.PI/180,x1=100+Math.cos(a)*70,y1=100+Math.sin(a)*70,x2=100+Math.cos(a)*65,y2=100+Math.sin(a)*65;return`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="var(--line2)" stroke-width="1.5"/>`}).join('')}</svg><div class="gt"><b class="num" data-count="${v}">0</b><span>Performance</span></div></div>`}
function countUp(root=document){$$('[data-count]',root).forEach(el=>{const to=+el.dataset.count,t0=performance.now(),dur=900;const f=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
 const g=$('#gArc');if(g)requestAnimationFrame(()=>requestAnimationFrame(()=>g.setAttribute('stroke-dasharray',g.dataset.len)))}
/* ---- notifications ---- */
function notify(text,icn='bell',href=''){S.notifs.unshift({id:uid(),at:Date.now(),text,ic:icn,href,read:false});if(S.notifs.length>60)S.notifs.length=60;saveSoon();bar()}
function notifs(e){const L=S.notifs.slice(0,12);menu(e,L.length?[...L.map(n=>({t:(n.read?'':'● ')+n.text+' · '+ago(n.at),ic:n.ic,fn:()=>{n.read=true;save();n.href&&go(n.href);bar()}})),'-',{t:'Mark all as read',ic:'check',fn:()=>{S.notifs.forEach(n=>n.read=true);save();bar()}}]:[{t:'Nothing new',ic:'check'}])}
function wsMenu(e){menu(e,[{t:'Workspace settings',ic:'gear',fn:()=>go('settings')},{t:'Invite people',ic:'uplus',fn:()=>inviteForm()},{t:'Switch theme',ic:'moon',k:'⇧T',fn:toggleTheme},'-',{t:'Keyboard shortcuts',ic:'cmd',k:'?',fn:shortcuts}])}
/* ---- command palette ---- */
function palCommands(){const C=[];
 NAV.forEach(([g,it])=>it.forEach(([h,n,i])=>C.push({g:'Go to',t:n,ic:i,fn:()=>go(h)})));
 BPNAV[0][1].forEach(([h,n,i])=>C.push({g:'Blueprint',t:'Blueprint · '+n,ic:i,fn:()=>go(h)}));
 C.push({g:'Create',t:'New product',ic:'plus',k:'N',fn:()=>productForm()},{g:'Create',t:'New roadmap idea',ic:'map',fn:()=>{go('roadmap');setTimeout(()=>rmForm('idea'),60)}},{g:'Create',t:'Invite a teammate',ic:'uplus',fn:()=>inviteForm()},{g:'Create',t:'New hub',ic:'hub',fn:()=>hubForm()},{g:'Create',t:'New plugin',ic:'plug',fn:()=>newPlugin()},{g:'Create',t:'New design blueprint',ic:'palette',fn:()=>newDesign()});
 C.push({g:'Actions',t:'Switch light and dark',ic:'moon',k:'⇧T',fn:toggleTheme},{g:'Actions',t:'Claim the daily credits',ic:'coins',fn:()=>claimDaily()},{g:'Actions',t:'Export workspace data (JSON)',ic:'download',fn:exportData},{g:'Actions',t:'Keyboard shortcuts',ic:'cmd',k:'?',fn:shortcuts});
 S.products.forEach(p=>C.push({g:'Products',t:p.name,sub:TYPES[p.type].n+' · '+money(p.price),ic:TYPES[p.type].ic,fn:()=>go('product/'+p.id)}));
 S.team.forEach(m=>C.push({g:'People',t:m.name,sub:m.title,ic:'user',fn:()=>personDrawer(m.id)}));
 S.hubs.filter(h=>h.joined).forEach(h=>C.push({g:'Hubs',t:h.name,ic:'hub',fn:()=>go('hub/'+h.id)}));
 S.roadmap.forEach(r=>C.push({g:'Roadmap',t:r.title,ic:'map',fn:()=>{go('roadmap');setTimeout(()=>rmDrawer(r.id),60)}}));
 return C}
function palette(){const C=palCommands();let sel=0,list=C;
 overlay(`<div class="pal" role="dialog" aria-label="Command palette"><div class="pi">${ic('search')}<input id="palI" placeholder="Type a command or search…" autocomplete="off" spellcheck="false"><kbd>esc</kbd></div><div class="pl" id="palL"></div><div class="pf"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span style="margin-left:auto">${mark()}</span></div></div>`);
 $('.pal .pf .mark').style.cssText='width:16px;height:16px';
 const draw=()=>{let g='';$('#palL').innerHTML=list.length?list.slice(0,60).map((c,i)=>{const hd=c.g!==g?`<div class="pg">${c.g}</div>`:'';g=c.g;return hd+`<div class="po ${i===sel?'on':''}" data-i="${i}">${ic(c.ic)}<span>${esc(c.t)}</span>${c.sub?`<span class="faint sm">${esc(c.sub)}</span>`:''}${c.k?`<span class="k"><kbd>${c.k}</kbd></span>`:''}</div>`}).join(''):`<div class="empty" style="padding:24px"><p>No matches. Try “product”, “plugin” or a name.</p></div>`;const on=$('.po.on');on&&on.scrollIntoView({block:'nearest'})};
 const filt=q=>{q=q.trim().toLowerCase();list=!q?C:C.map(c=>{const s=(c.t+' '+(c.sub||'')+' '+c.g).toLowerCase();let sc=s.startsWith(q)?3:s.includes(' '+q)?2:s.includes(q)?1:0;if(!sc){let j=0;for(const ch of s)if(ch===q[j])j++;if(j===q.length)sc=.5}return[c,sc]}).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);sel=0;draw()};
 draw();const I=$('#palI');I.oninput=()=>filt(I.value);
 I.onkeydown=e=>{if(e.key==='ArrowDown'){sel=Math.min(list.length-1,sel+1);draw();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault()}else if(e.key==='Enter'){const c=list[sel];if(c){closeOv();c.fn()}}};
 $('#palL').onclick=e=>{const o=e.target.closest('.po');if(!o)return;const c=list[+o.dataset.i];closeOv();c.fn()};$('#palL').onmousemove=e=>{const o=e.target.closest('.po');if(o&&+o.dataset.i!==sel){sel=+o.dataset.i;$$('.po').forEach(x=>x.classList.toggle('on',x===o))}}}
function shortcuts(){modal('Keyboard shortcuts',`<div class="shortcut-list">${[['Command palette','⌘K'],['New product','N'],['Go to Dashboard','G then D'],['Go to Products','G then P'],['Go to Analytics','G then A'],['Go to Messages','G then M'],['Go to Hubs','G then H'],['Open Blueprint','G then B'],['Switch light and dark','⇧T'],['Close a window','Esc'],['Show this list','?']].map(([a,k])=>`<span>${a}</span><span>${k.split(' ').map(x=>x==='then'?'<span class="faint xs">then</span>':`<kbd>${x}</kbd>`).join(' ')}</span>`).join('')}</div>`)}
let _gKey=0;
document.addEventListener('keydown',e=>{const tag=(e.target.tagName||'').toLowerCase(),typing=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#ov').classList.contains('open')?closeOv():palette();return}
 if(e.key==='Escape'){if($('#menu'))closeMenu();else closeOv();return}
 if(typing||e.metaKey||e.ctrlKey||e.altKey||$('#ov').classList.contains('open'))return;
 if(e.key==='?'){shortcuts();return}if(e.key==='T'&&e.shiftKey){toggleTheme();return}
 if(e.key==='n'){productForm();return}
 if(e.key==='g'){_gKey=Date.now();return}
 if(Date.now()-_gKey<1200){const m={d:'dash',p:'products',a:'analytics',m:'messages',h:'hubs',b:'bp',s:'settings',r:'roadmap',c:'credits'}[e.key];if(m){go(m);_gKey=0}}});
