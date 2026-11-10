/* ============ WIDGETS: Atelier's branded way to show your work in a conversation ============
   A widget is a live card with a size, a font and a surface you choose. Your style is remembered per widget. */
const WKINDS=[['focus','Focus','focus'],['day','My day','sun'],['agenda','Agenda','calendar'],['project','Project','projects'],['deck','Flashcards','cap'],['countdown','Countdown','flag'],['quote','Quote','quote'],['photo','Photo','image']];
const WK=new Set(WKINDS.map(w=>w[0]));
const WFONTS=[['sans','Sans'],['serif','Serif'],['hand','Hand']],WLAYOUTS=[['small','Small'],['wide','Wide']],WTONES=[['glass','Glass'],['tint','Tint'],['ink','Ink']];
const isWidget=a=>!!a&&WK.has(a.kind)&&(a.kind!=='photo'||!!a.w)&&a.kind!=='progress';
const wStyle=k=>Object.assign({font:k==='quote'?'serif':'sans',layout:['photo','agenda','day','quote'].includes(k)?'wide':'small',tone:'glass'},(S.widgets||{})[k]||{});
const wLabel=k=>(WKINDS.find(w=>w[0]===k)||WKINDS[0])[1];
const wMark=`<svg class="wmk" viewBox="0 0 56 56" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${MARK_A}" stroke="currentColor" stroke-width="5"/><path d="${MARK_B}" stroke="var(--wc)" stroke-width="4.4"/></svg>`;
function examAtt(e){return{kind:'countdown',id:e.id,title:e.title,d:e.d,col:e.col,note:e.note||''}}
/* the card itself; live where it can be (a project shows its progress today), a snapshot otherwise */
function widgetHTML(a,preview,c,m){const k=a.kind,w=Object.assign(wStyle(k),a.w||{}),wide=w.layout==='wide';let col='var(--accent)',body='',href='',tap='';
 if(k==='focus'){col='var(--focus)';href='#focus';body=`<div class="wbig"><b>${a.mins||0}</b><span>min</span></div><div class="wsub">${a.date&&m&&a.date!==isoD(new Date(m.at))?'focused on '+fmtDay(new Date(a.date+'T12:00').getTime()):'focused today'}</div>${wide?`<div class="wfoot"><span>${plural(a.sessions||0,'session')}</span><span>${plural(a.streak||0,'day')} streak</span></div>`:`<div class="wfoot"><span>${a.streak||0}-day streak</span></div>`}${a.running?`<div class="wlive"><i class="livedot"></i>${esc(a.running)}</div>`:''}`}
 else if(k==='day'){col='var(--yellow)';href='#ledger';const st=a.st||{};body=wide?`<div class="wtitle">${a.date&&m&&a.date!==isoD(new Date(m.at))?'My day · '+fmtDay(new Date(a.date+'T12:00').getTime()):'My day so far'}</div><div class="wstats">${[['focus',st.focus||0,'min'],['check',st.tasks||0,'tasks'],['notes',st.notes||0,'notes'],['calendar',st.agenda||'0/0','plan']].map(([i,v,l])=>`<span>${ic(i)}<b>${v}</b><i>${l}</i></span>`).join('')}</div>${(a.items||[]).length?`<ul class="wl">${a.items.slice(0,2).map(x=>`<li><span>${esc(x.h)}</span>${esc(x.t)}</li>`).join('')}</ul>`:''}${a.feel?`<span class="wfeel" style="--fc:${(FEELS.find(f=>f[0]===a.feel)||FEELS[0])[1]}">${esc(a.feel)}</span>`:''}`
  :`<div class="wbig"><b>${st.focus||0}</b><span>min</span></div><div class="wsub">focus so far</div><div class="wfoot"><span>${ic('check')} ${st.tasks||0}</span><span>${ic('calendar')} ${st.agenda||'0/0'}</span></div>`}
 else if(k==='agenda'){col='var(--blue)';href='#today';const L=(a.items||[]).slice(0,wide?5:3);body=`<div class="wtitle">${esc(a.label||'Today')}</div>${L.length?`<ul class="wl">${L.map(x=>`<li class="${x.done?'done':''}"><span>${esc(x.t||'Any')}</span>${esc(x.title)}</li>`).join('')}</ul>${(a.items||[]).length>L.length?`<div class="wsub">+${a.items.length-L.length} more</div>`:''}`:'<div class="wsub">Nothing planned yet</div>'}`}
 else if(k==='project'){const p=proj(a.id),pct=p?pctOf(p):(a.pct||0),t=p?(p.tasks||[]):null,nx=p&&(p.miles||[]).find(x=>!x.done);col=p?.col||a.col||col;href='#project:'+a.id;
  body=`<div class="wtitle">${esc(p?.name||a.title)}</div><div class="wbig"><b>${pct}</b><span>%</span></div><div class="pbar"><i style="width:${pct}%"></i></div>${wide?`<div class="wfoot"><span>${t?`${t.filter(x=>x.st==='done').length}/${t.length} tasks`:''}</span><span>${nx?'Next: '+esc(nx.t):''}</span></div>`:''}`}
 else if(k==='deck'){const d=deck(a.id),n=d?d.cards.length:(a.count||0),ms=d&&d.cards.length?Math.round(masteredOf(d)/d.cards.length*100):(a.mastered||0);col=d?.col||a.col||'var(--violet)';href='#deck:'+a.id;
  body=`<div class="wtitle">${esc(d?.name||a.title)}</div><div class="wbig"><b>${n}</b><span>cards</span></div><div class="pbar"><i style="width:${ms}%"></i></div><div class="wsub">${ms}% mastered${wide&&d?` · ${dueOf(d).length} due`:''}</div>`}
 else if(k==='countdown'){const n=dayDiff(a.d,today());col=a.col||'var(--red)';href='#study';body=`<div class="wtitle">${esc(a.title)}</div><div class="wbig"><b>${n<=0?(n===0?'Today':'Done'):n}</b>${n>0?`<span>${n===1?'day':'days'}</span>`:''}</div><div class="wsub">${new Date(a.d+'T12:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}${wide&&a.note?' · '+esc(a.note):''}</div>`}
 else if(k==='quote'){const q=a.q||{};col=(QCOLS.find(x=>x[0]===q.col)||QCOLS[0])[1];body=`<blockquote class="wq qf-${q.font||w.font}">${esc(q.t||'')}</blockquote><div class="wsub">${esc(a.by||'')}</div>`}
 else if(k==='photo'){col='var(--violet)';tap=c&&m?`onclick="viewAtt('${c.id}','${m.id}')"`:'';body=`<div class="wph">${a.src?`<img src="${a.src}" alt="">`:a.fid?`<img data-fid="${a.fid}" alt="" decoding="async">`:`<span class="wphe">${ic('image',1.5)}</span>`}</div>${a.cap?`<div class="wcap">${esc(a.cap)}</div>`:''}`}
 const lab=k==='quote'?'Quote':k==='photo'?(a.cap?'Photo':'Photo'):wLabel(k);
 const inner=`<div class="wh">${ic((WKINDS.find(x=>x[0]===k)||WKINDS[0])[2])}<span>${lab}</span>${wMark}</div>${body}`;
 const cls=`wdg w-${k} wl-${w.layout} wt-${w.tone} wf-${w.font}`,st=`--wc:${col}`;
 if(preview)return`<div class="${cls}" style="${st}">${inner}</div>`;
 if(tap)return`<button type="button" class="${cls}" style="${st}" ${tap} aria-label="Open photo">${inner}</button>`;
 return`<a class="${cls}" style="${st}" href="${href||'#chat'}">${inner}</a>`}
/* the editor: live preview, a few honest choices, then send */
function openWidget(cid,kind,preset,after){const c=cid?S.chats.find(x=>x.id===cid):null;let a=preset?{...preset}:null,w=wStyle(kind),file=null,url=null;
 const build=()=>{if(kind==='focus')return focusAtt();if(kind==='day')return dayAtt(today());if(kind==='agenda')return agendaAtt(agendaOf(selDay||today()).length?(selDay||today()):today());
  if(kind==='quote')return S.me.quote&&S.me.quote.t?{kind:'quote',title:'Quote',q:{...S.me.quote},by:fullName()}:null;
  if(kind==='project'){const p=S.projects[S.projects.length-1];return p?projAtt(p):null}if(kind==='deck'){const d=S.study.decks[S.study.decks.length-1];return d?deckAtt(d):null}
  if(kind==='countdown'){const e=nextExams()[0];return e?examAtt(e):null}if(kind==='photo')return{kind:'photo',title:'Photo',cap:''};return null};
 if(!a)a=build();
 const pick=kind==='project'?S.projects.map(p=>[p.id,p.name]):kind==='deck'?S.study.decks.map(d=>[d.id,d.name]):kind==='countdown'?nextExams().map(e=>[e.id,e.title]):null;
 const none={project:['No projects yet','Start a project','projectForm()'],deck:['No flashcard decks yet','Make a deck','deckForm()'],countdown:['No exams or deadlines yet','Add one','examForm()'],quote:['You have no quote yet','Write your quote','quoteSheet()']}[kind];
 const seg=(id,L,v)=>`<div class="seg sm wseg" id="${id}">${L.map(([k,n])=>`<button type="button" data-v="${k}" class="${v===k?'on':''}">${n}</button>`).join('')}</div>`;
 openModal(`<div class="sheet wsheet" role="dialog" aria-modal="true" aria-label="${esc(wLabel(kind))} widget"><div class="sheet-h"><h2>${esc(wLabel(kind))} widget</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div>
 <div class="wstage" id="wSt"></div>
 ${!a&&none?`<div class="card emptyrow"><p class="sub" style="margin:0 0 8px">${none[0]}</p><button class="btn sm primary" onclick="closeSheet();setTimeout(()=>{${none[2]}},230)">${none[1]}</button></div>`:''}
 ${pick&&pick.length?`<label for="wPk">${kind==='project'?'Project':kind==='deck'?'Deck':'Exam or deadline'}</label><select id="wPk">${pick.map(([id,n])=>`<option value="${id}" ${a&&a.id===id?'selected':''}>${esc(n)}</option>`).join('')}</select>`:''}
 ${kind==='photo'?`<label class="btn full" style="margin-top:4px">${ic('image')} Choose a photo<input type="file" id="wPh" accept="image/*" hidden></label><input id="wCap" maxlength="80" placeholder="Caption (optional)" style="margin-top:10px">`:''}
 <div class="wopts"><div class="flabel">Size</div>${seg('wL',WLAYOUTS,w.layout)}<div class="flabel">Font</div>${seg('wF',WFONTS,w.font)}<div class="flabel">Surface</div>${seg('wT',WTONES,w.tone)}</div>
 <button class="btn primary full" id="wSend" ${a&&(kind!=='photo'||a.fid)?'':'disabled'}>${ic('send')} ${c?'Send to '+esc(convoName(c)):'Choose who to send to'}</button><p class="sub sm center" style="margin:8px 0 0">Your style is remembered for this widget.</p></div>`,'wmodal');
 const paint=()=>{const st=$('#wSt');if(!st)return;st.innerHTML=a?widgetHTML({...a,w,src:url||a.src},true):`<div class="wdg wl-small wt-glass wf-sans" style="--wc:var(--muted)"><div class="wh">${ic('sparkle')}<span>${esc(wLabel(kind))}</span>${wMark}</div><div class="wsub">Nothing to show yet</div></div>`;loadImgs(st)};paint();
 [['wL','layout'],['wF','font'],['wT','tone']].forEach(([id,key])=>{const g=$('#'+id);if(g)g.onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;w={...w,[key]:b.dataset.v};g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));paint()}});
 const pk=$('#wPk');if(pk)pk.onchange=()=>{const id=pk.value;a=kind==='project'?projAtt(proj(id)):kind==='deck'?deckAtt(deck(id)):examAtt(S.study.exams.find(e=>e.id===id));paint()};
 const ph=$('#wPh');if(ph)ph.onchange=()=>{const f=ph.files[0];if(!f||!f.type.startsWith('image/'))return;if(f.size>25*1048576){toast('That photo is over 25 MB');return}file=f;if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(f);a={...a,title:f.name,type:f.type,size:f.size,fid:'pending'};$('#wSend').disabled=false;paint()};
 const cap=$('#wCap');if(cap)cap.oninput=()=>{a={...a,cap:cap.value.trim()};paint()};
 onSheetClose(()=>{if(url){const u=url;setTimeout(()=>URL.revokeObjectURL(u),3000)}});
 $('#wSend').onclick=async()=>{if(!a)return;S.widgets=S.widgets||{};S.widgets[kind]=w;let att={...a,w};delete att.src;
  if(kind==='photo'){if(!file)return;const fid='c'+uid();try{await IDB.put(fid,file)}catch(e){toast('Could not save the photo');return}att.fid=fid}
  const send=t=>{sendMsg(t,'',att);use('widget');if(after)after(t);else if(route.k==='c'&&route.a[0]===t.id)appendMsgs(t);else go('c:'+t.id)};
  closeSheet();if(c)send(c);else setTimeout(()=>pickConvo(t=>{send(t);toast('Widget sent to '+convoName(t))},'Send widget to'),230)}}
