/* ============ ATELIER · CORE: state, storage, usage meter, router, UI kit ============ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const pad=n=>String(n).padStart(2,'0');
const isoD=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>isoD(new Date());
const esc=escH;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const tHM=t=>{const d=new Date(t);return`${pad(d.getHours())}:${pad(d.getMinutes())}`};
const fmtDay=t=>{const d=new Date(t),n=new Date();const diff=Math.round((new Date(isoD(n))-new Date(isoD(d)))/864e5);return diff===0?'Today':diff===1?'Yesterday':diff===-1?'Tomorrow':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})};
const ago=t=>{const s=(Date.now()-t)/1000;return s<60?'now':s<3600?Math.floor(s/60)+'m':s<86400?Math.floor(s/3600)+'h':fmtDay(t)};
const fmtSize=b=>b<1024?b+' B':b<1048576?Math.round(b/1024)+' KB':(b/1048576).toFixed(1)+' MB';
const plural=(n,w)=>`${n} ${w}${n===1?'':'s'}`;

/* ---------- state ---------- */
const KEY='atelier-v1',BKEY='atelier-backup';
/* If the browser blocks storage (some previews do), keep working in memory and say so once. */
const LS=(()=>{try{const k='__a';localStorage.setItem(k,'1');localStorage.removeItem(k);return localStorage}catch(e){const m={};window._noStore=true;return{getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]}}}})();
const DEF=()=>({v:1,me:null,people:[],groups:[],chats:[],notes:[],projects:[],ledger:[],voice:[],agenda:[],widgets:{},pulse:[],resets:[],study:{goal:60,decks:[],exams:[],classes:[],grades:[],goals:{},scale:'5',plans:[]},nudges:[],
 focus:{mode:'pomo',custom:{w:30,b:5,r:3},label:'',run:null,sessions:[]},usage:{days:{},total:0,ks:8},
 settings:{theme:'light',sound:true,auto:true,skin:'clay',space:''},created:Date.now()});
function parseSave(r){if(!r)return null;const d=JSON.parse(r);if(!d||typeof d!=='object'||!Array.isArray(d.notes))throw 0;return d}
function load(){let d=null;window._from='main';try{d=parseSave(LS.getItem(KEY))}catch(e){d=null;window._from='bad'}
 if(!d){try{d=parseSave(LS.getItem(BKEY));if(d&&window._from==='bad')window._from='restored'}catch(e){}}
 return fixData(Object.assign(DEF(),d||{}))}
/* knots: a normal full day of use is about 1,600 (checked against typical days); older saves are scaled once so everyone keeps their place */
const KSCALE=8;
function fixData(s){s.focus=Object.assign(DEF().focus,s.focus||{});s.usage=Object.assign({days:{},total:0},s.usage||{});s.settings=Object.assign(DEF().settings,s.settings||{});s.study=Object.assign(DEF().study,s.study||{});if(!s.widgets||typeof s.widgets!=='object')s.widgets={};if(!Array.isArray(s.pulse))s.pulse=[];if(!Array.isArray(s.nudges))s.nudges=[];if(!Array.isArray(s.resets))s.resets=[];
 if(!s.usage.ks){Object.values(s.usage.days).forEach(d=>{if(d&&d._n)d._n*=KSCALE});s.usage.total=(s.usage.total||0)*KSCALE;s.usage.ks=KSCALE}return s}
let S=load(),_bk=0;
function save(){if(!S.me&&!S.notes.length)return false;let raw;try{raw=JSON.stringify(S)}catch(e){return false}
 try{LS.setItem(KEY,raw)}catch(e){toast('Storage is full. Export a backup in You, Settings.');return false}
 if(Date.now()-_bk>60000){try{LS.setItem(BKEY,raw);_bk=Date.now()}catch(e){}}return true}
let _st=0;const saveSoon=()=>{clearTimeout(_st);_st=setTimeout(save,350)};
addEventListener('pagehide',()=>{try{if(S.me)save()}catch(e){}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&S.me)try{save()}catch(e){}});
/* another tab changed the data: reload it here so tabs never overwrite each other */
addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{const d=parseSave(e.newValue);if(d){S=fixData(Object.assign(DEF(),d));if(!isOpen())render();if(S.me&&typeof unlockProfile==='function')unlockProfile()}}catch(x){}}});

/* ---------- IndexedDB for files, images, drawings, voice ---------- */
const IDB={db:null,open(){if(this.db)return Promise.resolve(this.db);return new Promise((res,rej)=>{if(!window.indexedDB)return rej(new Error('no idb'));const r=indexedDB.open('atelier',1);r.onupgradeneeded=()=>r.result.createObjectStore('b');r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>rej(r.error)})},
 async op(m,fn){const db=await this.open();return new Promise((res,rej)=>{const tx=db.transaction('b',m),q=fn(tx.objectStore('b'));let out;if(q)q.onsuccess=()=>{out=q.result};tx.oncomplete=()=>res(out);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})},
 put(k,v){return this.op('readwrite',s=>s.put(v,k))},get(k){return this.op('readonly',s=>s.get(k))},del(k){return this.op('readwrite',s=>s.delete(k))},keys(){return this.op('readonly',s=>s.getAllKeys())},clear(){return this.op('readwrite',s=>s.clear())}};

/* ---------- profile vault: name, surname, work and email are encrypted on this device ----------
   AES-GCM 256 with a fresh random IV for every save. The key is made on this device and never leaves it:
   a non-extractable CryptoKey in IndexedDB (key 'key:profile'), or, only where IndexedDB is blocked, a key in
   localStorage 'atelier-key'. The save keeps only the first name in plain text (the app greets you with it),
   plus the sealed box S.me.vault = {v, alg, kid, iv, ct}. The decrypted profile lives in memory (PROFILE). */
const VKEY='key:profile',LKEY='atelier-key',VALG={name:'AES-GCM',length:256};
let PROFILE=null;
const b64=buf=>{const a=new Uint8Array(buf);let s='';for(let i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)};
const unb64=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
const within=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
const VAULT={keys:{},
 ok(){try{return!!(window.crypto&&crypto.subtle&&crypto.getRandomValues&&window.TextEncoder)}catch(e){return false}},
 async idbKey(){let k=await within(IDB.get(VKEY),2500);if(!k){await within(IDB.put(VKEY,await crypto.subtle.generateKey(VALG,false,['encrypt','decrypt'])),2500);k=await within(IDB.get(VKEY),2500)}if(!k||k.type!=='secret')throw new Error('no key');return k},
 async lsKey(){const j=LS.getItem(LKEY);if(j)return crypto.subtle.importKey('jwk',JSON.parse(j),VALG,false,['encrypt','decrypt']);const k=await crypto.subtle.generateKey(VALG,true,['encrypt','decrypt']);LS.setItem(LKEY,JSON.stringify(await crypto.subtle.exportKey('jwk',k)));return crypto.subtle.importKey('jwk',JSON.parse(LS.getItem(LKEY)),VALG,false,['encrypt','decrypt'])},
 /* kid says where the key lives, so a box sealed with one key is never opened with another */
 async key(kid){if(this.keys[kid])return this.keys[kid];return this.keys[kid]=await(kid==='ls'?this.lsKey():this.idbKey())},
 async seal(o){let kid='idb',k;try{k=await this.key('idb')}catch(e){kid='ls';k=await this.key('ls')}
  const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(o)));return{v:1,alg:'AES-GCM-256',kid,iv:b64(iv),ct:b64(ct)}},
 async open(box){const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(box.iv)},await this.key(box.kid||'idb'),unb64(box.ct));return JSON.parse(new TextDecoder().decode(pt))},
 forget(){this.keys={};try{LS.removeItem(LKEY)}catch(e){}}};
const STATUS={student:['Student','cap'],work:['Working','case']};
const cleanProfile=p=>({first:String(p.first||'').trim(),last:String(p.last||'').trim(),email:String(p.email||'').trim().toLowerCase(),status:STATUS[p.status]?p.status:'',what:String(p.what||'').trim()});
/* encrypt and save; PROFILE and the first name update at once, the sealed box follows a moment later */
async function storeProfile(p){p=cleanProfile(p);PROFILE=p;window._vaultErr=false;if(!S.me)return false;if(p.first)S.me.name=p.first;
 if(VAULT.ok()){try{const box=await VAULT.seal(p);if(S.me){S.me.vault=box;S.me.enc=true;delete S.me.profile;delete S.me.role;save()}return true}catch(e){}}
 /* no Web Crypto here (very old browser): keep working, and say so in Settings */
 if(S.me){S.me.profile=p;S.me.enc=false;delete S.me.vault;delete S.me.role;save()}return false}
/* read the profile at start; older saves (name and role in plain text) are moved into the vault */
async function unlockProfile(){const m=S.me;if(!m)return;
 try{if(m.vault)PROFILE=cleanProfile(await VAULT.open(m.vault));
  else if(m.profile){PROFILE=cleanProfile(m.profile);if(VAULT.ok())await storeProfile(m.profile)}
  else{const [first,...rest]=String(m.name||'').trim().split(/\s+/),r=String(m.role||'').trim(),stu=/stud|school|pupil|univ|dijak|šol/i.test(r);
   await storeProfile({first:first||m.name||'',last:rest.join(' '),email:'',status:stu?'student':r?'work':'',what:/^student$/i.test(r)?'':r})}
  window._vaultErr=false;if(S.me&&!S.settings.space&&PROFILE){S.settings.space=PROFILE.status==='student'?'student':'work';save();applyTheme();nav()}}catch(e){PROFILE=null;window._vaultErr=true}
 if(S.me&&['you','settings','people','group'].includes(route.k)&&!isOpen())render()}
const fullName=()=>PROFILE?[PROFILE.first,PROFILE.last].filter(Boolean).join(' '):(S.me?S.me.name:'');
function meRole(){const p=PROFILE;if(!p)return S.me&&S.me.role||'';if(p.status==='student')return p.what?'Student · '+p.what:'Student';return p.what||(p.status==='work'?'Working':'')}
const roleOf=p=>p&&p.id==='me'?meRole():(p&&p.role)||'';
const EMAIL_RE=/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
/* checks the account fields; returns {field: message} */
function checkProfile(fd){const e={};if(!String(fd.first||'').trim())e.first='Add your first name';if(!String(fd.last||'').trim())e.last='Add your surname';
 if(!STATUS[fd.status])e.status='Choose student or working';if(!EMAIL_RE.test(String(fd.email||'').trim()))e.email=String(fd.email||'').trim()?'This email does not look right':'Add your email';return e}
/* the shared account fields: names, student or working, school or work, email */
function profileFields(x,p={}){const st=p.status||'',L=st==='student'?['Where do you study?','e.g. University of Ljubljana']:st==='work'?['What is your work?','e.g. Product designer at Studio']:['Where do you study or work?','Choose student or working first'];
 return`<div class="frow"><div><label for="${x}Name">First name</label><input id="${x}Name" name="first" autocomplete="given-name" autocapitalize="words" value="${esc(p.first||'')}" placeholder="e.g. Nejc"></div><div><label for="${x}Sur">Surname</label><input id="${x}Sur" name="last" autocomplete="family-name" autocapitalize="words" value="${esc(p.last||'')}" placeholder="e.g. Lipovšek"></div></div>
 <div class="flabel" id="${x}StL">What do you do?</div><div class="seg big" role="radiogroup" aria-labelledby="${x}StL" id="${x}St">${Object.entries(STATUS).map(([k,[n,i]])=>`<label><input type="radio" name="status" value="${k}" ${st===k?'checked':''}>${ic(i)} ${n}</label>`).join('')}</div>
 <label for="${x}Role" id="${x}RoleL">${L[0]}</label><input id="${x}Role" name="what" autocomplete="organization" value="${esc(p.what||'')}" placeholder="${L[1]}">
 <label for="${x}Mail">Email</label><input id="${x}Mail" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" value="${esc(p.email||'')}" placeholder="you@example.com">`}
/* live behaviour for those fields: the school or work label follows the choice, errors clear as you type */
function wireProfile(f,x){f.querySelectorAll('[name=status]').forEach(r=>r.onchange=()=>{const s=r.value,l=$('#'+x+'RoleL'),i=$('#'+x+'Role');l.textContent=s==='student'?'Where do you study?':'What is your work?';i.placeholder=s==='student'?'e.g. University of Ljubljana':'e.g. Product designer at Studio';clearErr(f,'status')});
 f.addEventListener('input',e=>{if(e.target.name)clearErr(f,e.target.name)})}
function clearErr(f,n){const w=n==='status'?f.querySelector('.seg'):f.querySelector(`[name=${n}]`);if(!w)return;w.classList.remove('bad');const m=w.nextElementSibling;if(m&&m.classList.contains('ferr'))m.remove()}
/* shows the errors under each field and moves to the first one; returns true when everything is fine */
function showErrs(f,errs){f.querySelectorAll('.ferr').forEach(m=>m.remove());f.querySelectorAll('.bad').forEach(m=>m.classList.remove('bad'));let first=null;
 for(const [n,msg] of Object.entries(errs)){const w=n==='status'?f.querySelector('.seg'):f.querySelector(`[name=${n}]`);if(!w)continue;w.classList.add('bad');w.insertAdjacentHTML('afterend',`<div class="ferr" role="alert">${esc(msg)}</div>`);first=first||w}
 if(first){try{first.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}if(first.tagName==='INPUT'&&!('ontouchstart' in window))first.focus()}return!first}

/* ---------- pictures and files kept in IndexedDB: one object URL per blob, reused, oldest released ---------- */
const BURL=new Map();
async function blobURL(fid){if(BURL.has(fid))return BURL.get(fid);let b=null;try{b=await IDB.get(fid)}catch(e){}if(!(b instanceof Blob))return null;if(BURL.has(fid))return BURL.get(fid);
 const u=URL.createObjectURL(b);BURL.set(fid,u);if(BURL.size>240){const [k,v]=BURL.entries().next().value;BURL.delete(k);try{URL.revokeObjectURL(v)}catch(e){}}return u}
async function loadImgs(root){for(const im of (root||document).querySelectorAll('img[data-fid]:not([src])')){const box=im.closest('.aph,.mthumb');const u=await blobURL(im.dataset.fid);
 if(u){im.onload=()=>box&&box.classList.add('ld');im.src=u}else if(box)box.classList.add('miss')}}
/* ---------- knots: every action is metered (tracking only, shown on the You page) ---------- */
const ACT={signin:['Sign in','Account',1],note_new:['New note','Notes',3],note_edit:['Note edit','Notes',1],note_share:['Share','Notes',2],
 msg:['Message','Chat',1],chat_new:['New conversation','Chat',2],group_new:['New group','Groups',5],group_edit:['Group change','Groups',1],bot_new:['New teammate','Groups',3],
 project_new:['New project','Projects',6],task_new:['New task','Projects',2],task_move:['Task update','Projects',1],idea:['Idea','Projects',2],vote:['Vote','Projects',1],
 file:['File upload','Projects',4],board_save:['Drawing saved','Projects',3],inspo:['Inspiration','Projects',2],table_edit:['Table edit','Projects',1],
 focus_min:['Focus minute','Focus',1],focus_start:['Focus start','Focus',1],feel:['Check-in','Today',1],voice:['Voice memo','Today',3],motd:['Message of the day','Today',1],poster:['Poster export','You',2],profile:['Profile update','Account',1],space:['Space switch','Account',1],pulse:['Motivation check','Today',3],nudge:['Nudge taken','Today',1],class_new:['Class','Study',2],grade:['Mark','Study',2],quiz:['Quiz','Study',3],plan_build:['Study plan','Study',3],skin:['Theme change','You',1],frame:['Frame change','You',1],quote:['Quote','You',1],widget:['Widget','Chat',2],
 photo:['Photo shared','Chat',3],file_share:['File shared','Chat',3],share:['Shared update','Chat',2],pin:['Pin','Chat',1],
 agenda_new:['Agenda item','Today',2],agenda_done:['Agenda done','Today',1],milestone:['Milestone','Projects',2],progress:['Progress update','Projects',1],
 zen:['Deep mode','Focus',1],reset:['Guided reset','Focus',2],cal_alerts:['Calendar alerts','Focus',1],deck_new:['New deck','Study',3],card_new:['New card','Study',1],card_review:['Card review','Study',1],exam_new:['Exam','Study',2],study_plan:['Study plan','Study',2],study_goal:['Study goal','Study',1]};
function use(a,times=1){const c=ACT[a];if(!c||times<=0)return;const n=c[2]*times*KSCALE,d=today(),before=S.usage.total;const day=S.usage.days[d]||(S.usage.days[d]={});day[a]=(day[a]||0)+times;day._n=(day._n||0)+n;S.usage.total+=n;saveSoon();if(typeof checkUnlocks==='function')checkUnlocks(before,S.usage.total)}
const usedToday=()=>(S.usage.days[today()]||{})._n||0;

/* ---------- ledger: the day's timeline ---------- */
const LK={focus:['focus','var(--focus)'],break:['coffee','var(--break)'],note:['notes','var(--yellow)'],msg:['chat','var(--blue)'],task:['check','var(--green)'],feel:['sparkle','var(--violet)'],voice:['bell','var(--red)'],project:['projects','var(--accent)'],group:['group','var(--blue)'],idea:['idea','var(--yellow)'],file:['file','var(--ink2)'],board:['draw','var(--accent)'],inspo:['image','var(--violet)'],agenda:['calendar','var(--blue)'],share:['share','var(--blue)'],milestone:['flag','var(--green)'],study:['cap','var(--violet)'],pulse:['pulse','var(--accent)']};
function led(k,t,extra={}){S.ledger.push({id:uid(),at:Date.now(),k,t,...extra});if(S.ledger.length>2500)S.ledger=S.ledger.slice(-2000);saveSoon()}

/* ---------- people ---------- */
const me=()=>S.me;
const person=id=>id==='me'?S.me:S.people.find(p=>p.id===id);
const grp=id=>S.groups.find(g=>g.id===id);
const proj=id=>S.projects.find(p=>p.id===id);
const note=id=>S.notes.find(n=>n.id===id);
const GCOL=['#d9764f','#3f6fd8','#3fa86e','#e0a92f','#d9566b','#8a6fd9','#2fa3a0','#b9824f'];

/* ---------- UI kit ---------- */
function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400)}
/* a sheet can register onSheetClose(fn) to stop what it started (recording, timers) however it is closed */
function onSheetClose(f){window._onSheetClose=f}
function runSheetClose(){const f=window._onSheetClose;window._onSheetClose=null;if(f)try{f()}catch(e){}}
function openModal(html,cls=''){runSheetClose();const m=$('#modal');m.innerHTML=html;m.className='open '+cls;m.onclick=e=>{if(e.target===m||e.target.closest('[data-close]'))closeSheet()};const f=m.querySelector('input:not([type=hidden]):not([type=file]),textarea');if(f&&!('ontouchstart' in window))setTimeout(()=>f.focus(),220)}
function closeSheet(){runSheetClose();const m=$('#modal');if(!m.classList.contains('open'))return;m.classList.add('closing');setTimeout(()=>{m.className='';m.innerHTML=''},200)}
const isOpen=()=>$('#modal').classList.contains('open');
addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
function sheet(title,body,onSubmit,foot=''){openModal(`<form class="sheet" id="sf" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-h"><h2>${title}</h2><button class="icon-btn" type="button" data-close aria-label="Close">${ic('close')}</button></div>${body}<button class="btn primary full" type="submit">Save</button>${foot}</form>`);
 $('#sf').onsubmit=e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));if(onSubmit(fd,e.target)!==false){closeSheet();save();render()}}}
function ask(q,yes,label='Delete'){openModal(`<div class="sheet" role="alertdialog" aria-modal="true"><h2>${q}</h2><p class="sub">This can't be undone.</p><div class="row mt"><button class="btn grow" data-close>Cancel</button><button class="btn danger grow" id="askY">${label}</button></div></div>`);$('#askY').onclick=()=>{closeSheet();yes();save();render()}}
function countUp(root){root.querySelectorAll('[data-n]').forEach(el=>{const to=+el.dataset.n;if(!isFinite(to)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const t0=performance.now(),D=650;const step=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e).toLocaleString('en-GB');if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
function burst(col){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const b=document.createElement('div');b.className='burst';for(let i=0;i<16;i++){const s=document.createElement('i');const a=Math.random()*Math.PI*2,d=50+Math.random()*80;s.style.cssText=`--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d-30}px;background:${[col||'var(--accent)','var(--blue)','var(--yellow)','var(--green)'][i%4]}`;b.appendChild(s)}document.body.appendChild(b);setTimeout(()=>b.remove(),1000)}
const avStack=(ids,max=4,size=26)=>`<span class="avs">${ids.slice(0,max).map(id=>avatar(person(id),size)).join('')}${ids.length>max?`<span class="more" style="width:${size}px;height:${size}px">+${ids.length-max}</span>`:''}</span>`;
const empty=(fig,title,text,btn)=>`<div class="emptyart card">${figure(fig,{draw:true})}<h3>${title}</h3><p class="sub">${text}</p>${btn||''}</div>`;

/* ---------- small charts (SVG) ---------- */
function barChart(data,{h=150,col='var(--accent)',labels=true,fmt=v=>v}={}){const w=320,mx=Math.max(1,...data.map(d=>d.v)),bw=w/data.length;
 return`<svg class="chart" viewBox="0 0 ${w} ${h+(labels?22:0)}" preserveAspectRatio="none" role="img">${[.25,.5,.75,1].map(f=>`<line x1="0" x2="${w}" y1="${(h-h*f*.9).toFixed(1)}" y2="${(h-h*f*.9).toFixed(1)}" stroke="var(--line)"/>`).join('')}
 ${data.map((d,i)=>{const bh=d.v/mx*h*.9,x=i*bw+bw*.18;return`<g><rect class="bar" x="${x.toFixed(1)}" y="${(h-bh).toFixed(1)}" width="${(bw*.64).toFixed(1)}" height="${Math.max(bh,d.v?2:0).toFixed(1)}" rx="4" fill="${d.c||col}" style="--i:${i}"><title>${esc(d.l)}: ${fmt(d.v)}</title></rect>${labels?`<text x="${(x+bw*.32).toFixed(1)}" y="${h+15}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${esc(d.l)}</text>`:''}</g>`}).join('')}</svg>`}
function lineChart(series,{h=150,labels=[]}={}){const w=320,all=series.flatMap(s=>s.v),mx=Math.max(1,...all),n=Math.max(2,...series.map(s=>s.v.length));
 const X=i=>(i/(n-1))*(w-16)+8,Y=v=>h-8-v/mx*(h-20);
 return`<svg class="chart" viewBox="0 0 ${w} ${h+22}" preserveAspectRatio="none" role="img">${[.25,.5,.75,1].map(f=>`<line x1="0" x2="${w}" y1="${Y(mx*f).toFixed(1)}" y2="${Y(mx*f).toFixed(1)}" stroke="var(--line)"/>`).join('')}
 ${series.map(s=>`<path d="M${s.v.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('L')}L${X(s.v.length-1).toFixed(1)},${h}L${X(0)},${h}Z" fill="${s.c}" opacity=".1"/><path class="ln" pathLength="1" d="M${s.v.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('L')}" fill="none" stroke="${s.c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`).join('')}
 ${labels.map((l,i)=>l?`<text x="${X(i).toFixed(1)}" y="${h+16}" text-anchor="middle" font-size="9.5" fill="var(--muted)">${esc(l)}</text>`:'').join('')}</svg>`}
function ring(frac,col,size=56,sw=6,txt=''){const r=(size-sw)/2,c=2*Math.PI*r;return`<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-clamp(frac,0,1))).toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})" style="--c:${c.toFixed(1)}" class="rarc"/>${txt?`<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="${size*.24}" font-weight="650" fill="var(--text)">${txt}</text>`:''}</svg>`}

/* ---------- router ---------- */
const TABS=[['today','Today','home'],['focus','Focus','focus'],['notes','Notes','notes'],['projects','Projects','projects'],['chat','Chat','chat'],['you','You','you']];
const TABS_STUDENT=[['today','Today','home'],['focus','Focus','focus'],['study','Study','cap'],['notes','Notes','notes'],['chat','Chat','chat'],['you','You','you']];
const space=()=>S.settings.space==='student'?'student':'work';
const tabsNow=()=>space()==='student'?TABS_STUDENT:TABS;
function tabOf(k){const t=TAB_OF[k]||'today';if(space()==='student'&&['study','deck','review','projects','project','board','timetable','grades','quiz'].includes(k))return'study';return t}
const TAB_OF={timetable:'focus',grades:'focus',quiz:'focus',pulse:'today',rewards:'you',profile:'you',today:'today',ledger:'today',focus:'focus',study:'focus',deck:'focus',review:'focus',notes:'notes',note:'notes',projects:'projects',project:'projects',board:'projects',chat:'chat',c:'chat',groups:'chat',group:'chat',people:'chat',person:'chat',you:'you',posters:'you',settings:'you'};
let route={k:'today',a:[]},_prevRoute='';
/* Pages change in memory, so navigation works everywhere, also in previews that block address changes. */
let _hash=(()=>{try{return decodeURIComponent(location.hash.slice(1))}catch(e){return''}})()||'today';
function parseHash(){const h=(_hash||'today').split(':');return{k:h[0],a:h.slice(1)}}
function go(h){h=String(h||'').replace(/^#/,'')||'today';window._railOpen=false;const same=h===_hash;if(!same)window._fromHash=_hash;window._nav=(window._nav||0)+1;_hash=h;try{if(location.hash!=='#'+h)history.pushState(null,'','#'+h)}catch(e){}render()}
function redirect(h){_hash=h;try{history.replaceState(null,'','#'+h)}catch(e){}queueMicrotask(render);return''}
/* every in-app link navigates here, even if the browser or preview cancels the tap's default action */
document.addEventListener('click',e=>{if(e.button>0||e.metaKey||e.ctrlKey)return;const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;const inner=e.target.closest('button,input,select,textarea,label');if(inner&&inner!==a&&a.contains(inner))return;e.preventDefault();go(a.getAttribute('href'))},true);
addEventListener('popstate',()=>{let h='';try{h=decodeURIComponent(location.hash.slice(1))}catch(e){}_hash=h||'today';render()});
function nav(){const el=$('#tabs');if(!el)return;const T=tabsNow(),cur=tabOf(route.k),unread=S.chats.reduce((a,c)=>a+unreadOf(c),0),sig=T.map(t=>t[0]).join();
 let fresh=false;if(el._sig!==sig){fresh=true;el.innerHTML=T.map(([k,n,i])=>`<a href="#${k}" data-tab="${k}">${ic(i)}<span>${n}</span>${k==='chat'?'<b class="badge" hidden></b>':''}</a>`).join('')+'<i class="tabglow"></i>';if(el._sig){el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap')}el._sig=sig;el._unr=0}
 el.querySelectorAll('a[data-tab]').forEach(a=>{const on=a.dataset.tab===cur;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 const b=el.querySelector('a[data-tab=chat] .badge');if(b){const txt=unread?(unread>9?'9+':String(unread)):'';if(b.textContent!==txt||fresh){b.textContent=txt;b.hidden=!unread;if(unread>(el._unr||0)&&!fresh){b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}}el._unr=unread}
 const on=el.querySelector('a.on'),g=el.querySelector('.tabglow');if(on&&g){const css=`--x:${on.offsetLeft}px;--y:${on.offsetTop}px;--w:${on.offsetWidth}px;--h:${on.offsetHeight}px`;if(g._css!==css){if(fresh)g.classList.add('still');g.style.cssText=css;g._css=css;if(fresh)requestAnimationFrame(()=>requestAnimationFrame(()=>g.classList.remove('still')))}}}
/* only the unread badge, for messages that arrive while you are elsewhere */
const navBadge=()=>nav();
function render(){if(!S.me){$('#shell').classList.add('nologin');onboarding();return}$('#shell').classList.remove('nologin');
 route=parseHash();const key=_hash;const fresh=key!==_prevRoute;_prevRoute=key;
 const V=$('#view'),y=fresh?0:scrollY;
 const P={timetable:pTimetable,grades:pGrades,quiz:pQuiz,pulse:pPulse,rewards:pRewards,profile:pProfile,study:pStudy,deck:pDeck,review:pReview,person:pPerson,today:pToday,ledger:pLedger,focus:pFocus,notes:pNotes,note:pNote,projects:pProjects,project:pProject,board:pBoard,chat:pChat,c:pConvo,groups:pGroups,group:pGroup,people:pPeople,you:pYou,posters:pPosters,settings:pSettings}[route.k]||pToday;
 try{V.innerHTML=P(...route.a)||''}catch(e){console.error(e);V.innerHTML=`<div class="page">${empty('think','Something went wrong','This view could not be shown. Your work is safe.',`<a class="btn primary" href="#today">Back to Today</a>`)}</div>`}
 if(fresh){V.classList.remove('enter');void V.offsetWidth;V.classList.add('enter');scrollTo(0,0)}else scrollTo(0,y);
 nav();paintRail();countUp(V);if(V._after){const f=V._after;V._after=null;f()}miniTimer();loadImgs(V)}
const after=f=>{$('#view')._after=f};
addEventListener('hashchange',()=>{let h='';try{h=decodeURIComponent(location.hash.slice(1))}catch(e){}if(h&&h!==_hash){_hash=h;render()}});
addEventListener('resize',()=>{clearTimeout(window._rz);window._rz=setTimeout(nav,120)});
function applyTheme(){const d=S.settings.theme==='dark'||(S.settings.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches),R=document.documentElement;R.dataset.theme=d?'dark':'light';R.dataset.skin=(typeof skinOK==='function'&&skinOK(S.settings.skin))?S.settings.skin:'clay';R.dataset.space=space();
 const m=$('meta[name=theme-color]');if(m){let bg=d?'#1b1a18':'#f6f3ee';try{bg=getComputedStyle(R).getPropertyValue('--bg').trim()||bg}catch(e){}m.content=bg}}
function header(title,{sub='',back='',right=''}={}){return`<header class="ph">${back?`<a class="icon-btn" href="#${back}" aria-label="Back">${ic('back')}</a>`:''}<div class="grow"><div class="eyebrow">${sub}</div><h1>${title}</h1></div>${right}</header>`}
