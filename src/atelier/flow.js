/* ============ FLOW: one tab for the work itself ============
   Notes, the agenda, uploaded material and (by space) study or projects, in one place.
   Materials are files kept on this device: S.materials [{id,name,type,size,fid,tag,at}], blobs in IndexedDB under "m…". */
let FL={day:null,mq:'',mt:'all'};
const MAT_MAX=50*1048576;
const matKind=m=>{const t=m.type||'',x=(m.name.split('.').pop()||'').toLowerCase();return t.startsWith('image/')?'image':t==='application/pdf'||x==='pdf'?'pdf':t.startsWith('audio/')?'audio':t.startsWith('video/')?'video':/^(doc|docx|odt|rtf|txt|md|pages)$/.test(x)?'text':/^(ppt|pptx|key|odp)$/.test(x)?'slides':/^(xls|xlsx|csv|numbers|ods)$/.test(x)?'sheet':'file'};
const MATL={image:['Image','var(--green)'],pdf:['PDF','var(--red)'],audio:['Audio','var(--violet)'],video:['Video','var(--blue)'],text:['Text','var(--blue)'],slides:['Slides','var(--yellow)'],sheet:['Sheet','var(--green)'],file:['File','var(--muted)']};
function matTags(){const s=new Set();(S.materials||[]).forEach(m=>m.tag&&s.add(m.tag));if(space()==='student'){(S.study.grades||[]).forEach(g=>g.subject&&s.add(g.subject));(S.study.classes||[]).forEach(c=>c.title&&s.add(c.title))}else S.projects.forEach(p=>s.add(p.name));return[...s].slice(0,24)}
async function matUpload(list,tag=''){const L=[...(list||[])];if(!L.length)return;let n=0;
 for(const f of L){if(f.size>MAT_MAX){toast(f.name+' is over 50 MB');continue}const fid='m'+uid();try{await IDB.put(fid,f)}catch(e){toast('Could not save '+f.name);continue}
  S.materials.unshift({id:uid(),name:f.name||'File',type:f.type||'',size:f.size||0,fid,tag,at:Date.now()});n++}
 if(n){use('material',n);led('file',n>1?`Uploaded ${n} materials`:`Uploaded ${L[0].name}`,{ref:'materials'});save();render();toast(n>1?`${n} files saved for offline use`:'Saved for offline use')}}
const matInput=(id,tag='')=>`<input id="${id}" type="file" multiple hidden onchange="matUpload(this.files,${tag?`'${esc(tag).replace(/'/g,'')}'`:'FL.tag||\'\''})">`;
function matThumb(m){const k=matKind(m),[l,c]=MATL[k];return k==='image'?`<span class="mth img" style="--mc:${c}"><img data-fid="${m.fid}" alt=""></span>`:`<span class="mth" style="--mc:${c}">${ic(k==='audio'?'mic':k==='video'?'play':k==='image'?'image':'file',1.7)}<i>${esc((m.name.split('.').pop()||l).toUpperCase().slice(0,4))}</i></span>`}
function matRow(m){return`<button type="button" class="li mrow" onclick="matOpen('${m.id}')">${matThumb(m)}<div class="grow"><div class="t">${esc(m.name)}</div><div class="sub sm">${MATL[matKind(m)][0]} · ${fmtSize(m.size)} · ${ago(m.at)}${m.tag?` · <em>${esc(m.tag)}</em>`:''}</div></div>${ic('chevr',2)}</button>`}
async function matOpen(id){const m=(S.materials||[]).find(x=>x.id===id);if(!m)return;const u=await blobURL(m.fid);const k=matKind(m);
 openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(m.name)}"><div class="sheet-h"><h2 style="font-size:19px;overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div>
 ${!u?`<div class="card emptyrow sub">This file is not on this device.</div>`:k==='image'?`<img class="fprev" src="${u}" alt="">`:k==='audio'?`<audio controls src="${u}" style="width:100%"></audio>`:k==='video'?`<video class="fprev" controls playsinline src="${u}"></video>`:`<div class="fbig">${ic('file',1.4)}<b>${esc((m.name.split('.').pop()||'').toUpperCase().slice(0,5))}</b></div>`}
 <p class="sub center">${MATL[k][0]} · ${fmtSize(m.size)} · ${fmtDay(m.at)}</p>
 <div class="flabel">Belongs to</div><div class="opts mtags">${['',...matTags()].map(t=>`<button type="button" class="chip ${(m.tag||'')===t?'on':''}" data-mt="${esc(t)}">${t?esc(t):'Nothing'}</button>`).join('')}</div>
 ${u?`<a class="btn primary full" href="${u}" target="_blank" rel="noopener">${ic('arrow')} Open</a><a class="btn full" href="${u}" download="${esc(m.name)}">${ic('download')} Download</a>`:''}
 <button class="btn full" id="mSend">${ic('send')} Send in chat</button><button class="btn full" id="mDel" style="color:var(--red)">${ic('trash')} Delete</button></div>`);
 $$('[data-mt]').forEach(b=>b.onclick=()=>{m.tag=b.dataset.mt;save();$$('[data-mt]').forEach(x=>x.classList.toggle('on',x===b));if(route.k==='flow'||route.k==='materials')render()});
 $('#mSend').onclick=()=>{closeSheet();setTimeout(()=>pickConvo(async c=>{let b=null;try{b=await IDB.get(m.fid)}catch(e){}if(!b){toast('This file is not on this device');return}const fid='c'+uid();try{await IDB.put(fid,b)}catch(e){toast('Could not send');return}
  sendMsg(c,'',{kind:k==='image'?'photo':'doc',fid,title:m.name,type:m.type,size:m.size});go('c:'+c.id)}),220)};
 $('#mDel').onclick=()=>{closeSheet();setTimeout(()=>ask(`Delete ${m.name.replace(/[<>]/g,'')}?`,()=>{IDB.del(m.fid).catch(()=>{});S.materials=S.materials.filter(x=>x.id!==m.id)}),220)}}
function pMaterials(){const q=FL.mq.toLowerCase(),tags=[...new Set((S.materials||[]).map(m=>m.tag).filter(Boolean))];let L=(S.materials||[]).filter(m=>(FL.mt==='all'||(FL.mt==='none'?!m.tag:m.tag===FL.mt))&&(!q||(m.name+' '+(m.tag||'')).toLowerCase().includes(q)));
 after(()=>{const s=$('#mq');if(s)s.oninput=()=>{FL.mq=s.value;clearTimeout(s._t);s._t=setTimeout(()=>{const p=s.selectionStart;render();const n=$('#mq');n.focus();try{n.setSelectionRange(p,p)}catch(e){}},200)};$$('[data-mf]').forEach(b=>b.onclick=()=>{FL.mt=b.dataset.mf;render()})});
 const total=(S.materials||[]).reduce((a,m)=>a+(m.size||0),0);
 return`<div class="page">${header('Materials',{sub:`${plural((S.materials||[]).length,'file')} · ${fmtSize(total)}`,back:'flow',right:`<label class="btn primary sm">${ic('upload',2)} Upload${matInput('mU2',FL.mt!=='all'&&FL.mt!=='none'?FL.mt:'')}</label>`})}
 ${(S.materials||[]).length?`<div class="search">${ic('search')}<input id="mq" type="search" placeholder="Search materials" value="${esc(FL.mq)}"></div>
 ${tags.length?`<div class="chips mt">${[['all','All'],...tags.map(t=>[t,t]),['none','Other']].map(([k,n])=>`<button type="button" class="chip ${FL.mt===k?'on':''}" data-mf="${esc(k)}">${esc(n)}</button>`).join('')}</div>`:''}
 ${L.length?`<div class="card list mt">${L.slice(0,200).map(matRow).join('')}</div>`:`<div class="card emptyrow sub mt">Nothing matches.</div>`}`
 :`<label class="drop card">${ic('folderup',1.6)}<b>Upload material</b><span class="sub">${space()==='student'?'Slides, scripts, worksheets and photos of the board.':'Briefs, decks, contracts and references.'} Kept on this device and available offline.</span>${matInput('mU3')}</label>`}</div>`}
/* the week strip above the agenda */
function flowWeek(sel){const t=today();return`<div class="fweek">${[0,1,2,3,4,5,6].map(i=>{const d=new Date();d.setDate(d.getDate()+i);const iso=isoD(d),A=agendaOf(iso),dn=A.filter(a=>a.done).length;
 return`<button type="button" class="${iso===sel?'on':''} ${iso===t?'td':''}" onclick="FL.day='${iso}';render()"><span>${i===0?'Today':d.toLocaleDateString('en-GB',{weekday:'short'})}</span><b>${d.getDate()}</b><i class="fdots">${A.slice(0,4).map((a,k)=>`<em class="${k<dn?'dn':''}"></em>`).join('')}</i></button>`}).join('')}</div>`}
function pFlow(){if(!S.materials)S.materials=[];const stu=space()==='student',d=FL.day&&FL.day>=today()?FL.day:today(),A=agendaOf(today()),dn=A.filter(a=>a.done).length;
 const notes=S.notes.slice().sort((a,b)=>(b.pin-a.pin)||b.up-a.up),mats=S.materials;
 const mk=(i,l,f,c)=>`<button type="button" class="fmk" style="--fc:${c}" onclick="${f}">${ic(i,1.8)}<span>${l}</span></button>`;
 const make=[mk('notes','Note','quickNote()','var(--yellow)'),mk('calendar','Agenda',`agendaForm('${d}')`,'var(--blue)'),`<label class="fmk" style="--fc:var(--green)">${ic('folderup',1.8)}<span>Upload</span>${matInput('mU')}</label>`,
  ...(stu?[mk('flag','Exam','examForm()','var(--red)'),mk('cap','Flashcards','deckForm()','var(--violet)')]:[mk('projects','Project','projectForm()','var(--accent)'),mk('check','Task','taskQuick()','var(--violet)')])].join('');
 const open=S.projects.reduce((a,p)=>a+(p.tasks||[]).filter(t=>t.st!=='done').length,0);
 const side=stu?`<section><div class="sh"><h2>Study</h2><a class="lnk" href="#study">Open</a></div>${studyTiles()}
  ${(()=>{const ex=typeof nextExams==='function'?nextExams().slice(0,2):[];const due=S.study.decks.reduce((a,k)=>a+dueOf(k).length,0);return`<div class="card list mt">${ex.map(e=>`<button type="button" class="li" onclick="examForm('${e.id}')"><span class="fic" style="color:${e.col}">${ic('flag')}</span><div class="grow"><div class="t">${esc(e.title)}</div><div class="sub sm">${fmtDay(new Date(e.d+'T12:00').getTime())}</div></div><span class="cd ${cdCls(e.d)}">${cdText(e.d)}</span></button>`).join('')}
  <a class="li" href="#study"><span class="fic" style="color:var(--violet)">${ic('cap')}</span><div class="grow"><div class="t">Flashcards</div><div class="sub sm">${S.study.decks.length?`${plural(S.study.decks.length,'deck')}${due?` · ${due} due now`:' · all caught up'}`:'Make your first deck'}</div></div>${ic('chevr',2)}</a></div>`})()}</section>`
 :`<section><div class="sh"><h2>Projects</h2><a class="lnk" href="#projects">All</a></div>${S.projects.length?`<div class="card list">${S.projects.slice().sort((a,b)=>(b.up||b.at)-(a.up||a.at)).slice(0,4).map(projRow).join('')}</div>`:`<div class="card emptyrow sub">Big work goes in a project: tasks, ideas, files and boards. <button class="lnk" onclick="projectForm()">New project</button></div>`}</section>`;
 after(()=>{if(!FL._u){FL._u=1;use('flow_open')}});
 return`<div class="page flow">${header('Flow',{sub:stu?'Study flow':'Work flow'})}
 <div class="grid3 fkpi"><a class="card kpi" href="#notes"><div class="lab" style="--lc:var(--yellow)">${ic('notes',2)}<span>Notes</span></div><div class="v" data-n="${S.notes.length}">${S.notes.length}</div></a>
  <div class="card kpi"><div class="lab" style="--lc:var(--blue)">${ic('calendar',2)}<span>Today</span></div><div class="v">${dn}<small>/${A.length}</small></div></div>
  ${stu?`<a class="card kpi" href="#study"><div class="lab" style="--lc:var(--violet)">${ic('cap',2)}<span>Due</span></div><div class="v" data-n="${S.study.decks.reduce((a,k)=>a+dueOf(k).length,0)}">${S.study.decks.reduce((a,k)=>a+dueOf(k).length,0)}</div></a>`:`<a class="card kpi" href="#projects"><div class="lab" style="--lc:var(--accent)">${ic('check',2)}<span>Tasks</span></div><div class="v" data-n="${open}">${open}</div></a>`}</div>
 <div class="fmake">${make}</div>
 <section><div class="sh"><h2>Notes</h2>${S.notes.length?`<a class="lnk" href="#notes">All ${S.notes.length}</a>`:''}</div>
  ${notes.length?`<div class="ngrid">${notes.slice(0,4).map((n,k)=>noteCard(n,k)).join('')}</div>`:`<button type="button" class="card fnew" onclick="quickNote()">${figure('think',{draw:true})}<div><p class="hand">Leave room to think.</p><span class="sub sm">Write, list, sketch and draw arrows between your thoughts.</span></div></button>`}</section>
 ${flowWeek(d)}${agendaHTML(d)}
 <section><div class="sh"><h2>Materials</h2>${mats.length?`<a class="lnk" href="#materials">All ${mats.length}</a>`:''}</div>
  ${mats.length?`<div class="card list">${mats.slice(0,4).map(matRow).join('')}</div>`:`<label class="drop card">${ic('folderup',1.6)}<b>Upload material</b><span class="sub">${stu?'Slides, scripts and worksheets':'Briefs, decks and references'}, kept on this device and available offline.</span>${matInput('mU4')}</label>`}</section>
 ${side}</div>`}
