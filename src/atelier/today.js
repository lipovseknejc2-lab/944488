/* ============ TODAY: week, live focus, message of the day, greeting, ledger, quick actions ============ */
const MOTD=['Small steps, far places.','The best work is the next ten minutes.','Rest is part of the work.','Ask for help early. It is faster.','Finish one thing before starting two.','A good question beats a fast answer.','Write it down, then let it go.','Share the draft, not the perfect version.','Ideas grow in company.','Leave room to think.','Make it work, then make it nice.','Today counts, even if it is small.','Silence the phone for one session.','Clear goals make short meetings.','Done is a feeling worth collecting.','Kindness is a team skill.','Take the break before you need it.','Plan the day in three lines.','Notice what gave you energy today.','Celebrate the boring progress too.','One page at a time.','A tidy desk is a quiet head.','Explain it simply to know it well.','Start before you feel ready.','The first version is allowed to be ugly.','Good teams over-communicate.','Protect your best hours.','Every expert was once a beginner.','Show up. Then keep going.','Work better, together.'];
const FEELS=[['thankful','var(--yellow)'],['focused','var(--focus)'],['calm','var(--green)'],['proud','var(--violet)'],['tired','var(--muted)'],['stressed','var(--red)'],['curious','var(--blue)']];
let selDay=null;
function dayColor(d){const L=S.ledger.filter(x=>isoD(new Date(x.at))===d);if(!L.length)return null;const cnt={};L.forEach(x=>cnt[x.k]=(cnt[x.k]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];return(LK[top]||LK.note)[1]}
function weekRow(){const n=new Date(),dow=(n.getDay()+6)%7,mon=new Date(n);mon.setDate(n.getDate()-dow);const t=today(),sel=selDay||t,planned=new Set(S.agenda.map(a=>a.d));
 return`<div class="week">${[0,1,2,3,4,5,6].map(i=>{const d=new Date(mon);d.setDate(mon.getDate()+i);const iso=isoD(d),c=dayColor(iso),fut=iso>t;
  return`<button class="wday ${iso===t?'today':''} ${iso===sel?'sel':''} ${fut?'fut':''}" data-day="${iso}" aria-label="${d.toDateString()}${planned.has(iso)?', planned':''}"><span>${'MTWTFSS'[i]}</span><b style="${c?`--dc:${c}`:''}" class="${c?'has':''}">${d.getDate()}</b><i class="agdot ${planned.has(iso)?'on':''}"></i></button>`}).join('')}</div>`}
/* agenda: plan any day in a few lines, tick things off, keep it private or share it */
const agendaOf=d=>S.agenda.filter(a=>a.d===d).sort((a,b)=>(a.t||'99')<(b.t||'99')?-1:(a.t||'99')>(b.t||'99')?1:a.at-b.at);
function agendaHTML(d){const A=agendaOf(d),now=tHM(Date.now()),nx=d===today()?A.find(a=>!a.done&&(!a.t||a.t>=now)):null,dn=A.filter(a=>a.done).length;
 return`<section class="agsec"><div class="sh"><h2>Agenda</h2><span class="sub">${A.length?plural(A.length,'item'):d===today()?'today':fmtDay(new Date(d+'T12:00').getTime())}</span></div>
 <div class="card agenda">${A.length?`${A.map(a=>`<div class="agi ${a.done?'done':''} ${nx===a?'next':''}"><span class="agt">${esc(a.t||'Anytime')}</span><button class="agc" onclick="agendaToggle('${a.id}')" aria-label="${a.done?'Mark not done':'Mark done'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M6.5 12.5L10.2 16L17.5 8"/></svg></button><button class="agb grow" onclick="agendaForm('${d}','${a.id}')"><span class="t">${esc(a.title)}</span>${a.note||a.pid&&proj(a.pid)?`<span class="sub sm">${esc([a.pid&&proj(a.pid)?.name,a.note].filter(Boolean).join(' · '))}</span>`:''}</button>${nx===a?'<span class="pill st-doing">Next</span>':''}</div>`).join('')}
 <div class="agacts"><button class="btn sm" onclick="agendaForm('${d}')" aria-label="Add to agenda">${ic('plus',2)} Add</button><button class="btn sm ghost" onclick="shareTo(agendaAtt('${d}'),c=>go('c:'+c.id))" aria-label="Share agenda">${ic('share')} Share</button></div>
 <div class="agfoot"><div class="pbar"><i style="width:${A.length?Math.round(dn/A.length*100):0}%"></i></div><span class="sub sm">${dn} of ${A.length} done · only you see it until you share</span></div>`
 :`<div class="agempty">${figure('write',{draw:true})}<div><p class="hand">${d>today()?'Plan ahead.':'Plan the day in three lines.'}</p><button class="btn primary sm" onclick="agendaForm('${d}')" aria-label="Add to agenda">${ic('plus',2)} Add to agenda</button></div></div>`}</div></section>`}
function agendaForm(d,id){const a=id?S.agenda.find(x=>x.id===id):null;d=a?.d||d||selDay||today();
 sheet(a?'Agenda item':'Add to agenda',`<label for="agT">What</label><input id="agT" name="title" required maxlength="90" value="${esc(a?.title||'')}" placeholder="e.g. Study chapter 4">
 <div class="frow"><div><label for="agH">Time</label><input id="agH" type="time" name="t" value="${esc(a?.t||'')}"></div><div><label for="agD">Day</label><input id="agD" type="date" name="d" required value="${d}"></div></div>
 ${S.projects.length?`<label for="agP">Project (optional)</label><select id="agP" name="pid"><option value="">None</option>${S.projects.map(p=>`<option value="${p.id}" ${a?.pid===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select>`:''}
 <label for="agN">Note (optional)</label><input id="agN" name="note" maxlength="120" value="${esc(a?.note||'')}" placeholder="e.g. Library, room 2">`,
 fd=>{const title=(fd.title||'').trim();if(!title){toast('Say what is planned');return false}const o={title,t:fd.t||'',d:/^\d{4}-\d{2}-\d{2}$/.test(fd.d)?fd.d:d,note:(fd.note||'').trim(),pid:fd.pid||''};
  if(a)Object.assign(a,o);else{S.agenda.push({id:uid(),done:false,at:Date.now(),...o});use('agenda_new');led('agenda',`Planned: ${title}`,{sub:o.d===today()?(o.t||'Today'):fmtDay(new Date(o.d+'T12:00').getTime())+(o.t?' · '+o.t:''),ref:'today'});if(S.agenda.length>3000)S.agenda=S.agenda.slice(-2500)}
  if(o.d!==today())selDay=o.d;toast(a?'Saved':'Added to your agenda')},
 a?`<button type="button" class="btn danger full" onclick="ask('Remove this from the agenda?',()=>{S.agenda=S.agenda.filter(x=>x.id!=='${a.id}')},'Remove')">Remove</button>`:'')}
function agendaToggle(id){const a=S.agenda.find(x=>x.id===id);if(!a)return;a.done=!a.done;a.doneAt=a.done?Date.now():null;if(a.done){use('agenda_done');led('agenda',`Done: ${a.title}`,{sub:'Agenda',ref:'today'})}save();render()}
function greet(){const h=new Date().getHours();return h<5?['Good night','moon']:h<12?['Good morning','sun']:h<18?['Good afternoon','sun']:['Good evening','moon']}
function ledgerItem(x){const [i,c]=LK[x.k]||LK.note;const lk=x.ref?` onclick="go('${x.ref}')"`:'';
 return`<div class="tl ${x.ref?'tap':''}"${lk}><span class="tln" style="--lc:${c}">${ic(i,1.9)}</span><div class="grow"><div class="tlt">${x.k==='feel'?`<span class="feelchip" style="--fc:${(FEELS.find(f=>f[0]===x.feel)||FEELS[0])[1]}">${esc(x.feel)}</span> ${esc(x.t||'')}`:esc(x.t)}</div>${x.sub?`<div class="sub">${esc(x.sub)}</div>`:''}${x.k==='voice'?`<button class="btn sm vplay" onclick="event.stopPropagation();playVoice('${x.vid}',this)">${ic('play')} ${esc(x.dur||'')}</button>`:''}</div><span class="tlh">${tHM(x.at)}</span></div>`}
function pToday(){const g=greet(),nm=S.me.name.split(' ')[0],d=selDay||today(),L=S.ledger.filter(x=>isoD(new Date(x.at))===d).reverse(),run=S.focus.run;
 const mi=Math.floor(Date.now()/864e5)%MOTD.length,ups=S.chats.filter(c=>unreadOf(c));
 const open=S.projects.flatMap(p=>(p.tasks||[]).filter(t=>t.st!=='done'&&(t.who==='me'||!t.who)).map(t=>({t,p}))).slice(0,4);
 after(()=>{$$('[data-day]').forEach(b=>b.onclick=()=>{selDay=b.dataset.day===today()?null:b.dataset.day;render()})});
 return`<div class="page today">
 <header class="th"><a href="#you" class="thav" aria-label="Your account">${avatar(S.me,36)}</a><h1 class="hand ttl">Today<svg class="uline" viewBox="0 0 120 10" preserveAspectRatio="none"><path d="M3 6C30 3 60 8 90 4C100 3 110 4 117 5" fill="none" stroke="var(--blue)" stroke-width="2.4" stroke-linecap="round"/></svg></h1><a href="#groups" class="icon-btn" aria-label="Groups">${ic('group')}</a></header>
 ${weekRow()}
 ${d===today()?spaceHero():''}
 ${pulseCard(d)}
 ${run?focusCard():''}
 <div class="card motd" id="motd"><button class="playb" onclick="playMotd(${mi})" aria-label="Play message of the day">${ic('play')}</button><div class="grow"><div class="lab" style="--lc:var(--blue)">${ic('quote',2)}<span>Message of the day</span></div><div class="motdt">${esc(MOTD[mi])}</div></div></div>
 ${!run&&d===today()?`<a class="card startf" href="#focus"><span class="sfi">${ic('focus')}</span><div class="grow"><div class="lab" style="--lc:var(--focus)">${ic('focus',2)}<span>Focus</span></div><b>Start a focus session</b><div class="sub">${focusTodayMin()} min focused today</div></div>${ic('arrow')}</a>`:''}
 <div class="greet"><h2 class="hand">${g[0]}, ${esc(nm)}.</h2>${g[1]==='sun'?'<svg class="gsun" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="var(--yellow)"/><g stroke="var(--yellow)" stroke-width="2" stroke-linecap="round"><path d="M16 3V7M16 25V29M3 16H7M25 16H29M6.8 6.8L9.6 9.6M22.4 22.4L25.2 25.2M25.2 6.8L22.4 9.6M9.6 22.4L6.8 25.2"/></g></svg>':`<svg class="gsun" viewBox="0 0 32 32"><path d="M22 20A9 9 0 1 1 13 7C12 13 16 19 22 20Z" fill="var(--violet)"/></svg>`}</div>
 <div class="lhead"><span class="sub">${d===today()?'Your day so far':fmtDay(new Date(d+'T12:00').getTime())}</span><span class="row" style="gap:14px">${d<=today()&&L.length?`<button class="lnk" onclick="shareTo(dayAtt('${d}'),c=>go('c:'+c.id))">${ic('share')} Share</button>`:''}<a href="#ledger" class="lnk">Ledger ›</a></span></div>
 <div class="timeline ${L.length?'':'none'}">${L.length?L.slice(0,10).map(ledgerItem).join(''):`<div class="tlempty">${figure('think',{draw:true})}<p class="sub">${d===today()?'Nothing yet. Start a focus session, write a note or check in how you feel.':d>today()?'This day is still ahead. Plan it in the agenda above.':'Nothing happened that day.'}</p></div>`}</div>
 ${agendaHTML(d)}
 ${d===today()&&space()==='work'?studyStrip():''}
 ${ups.length&&d===today()?`<section><div class="sh"><h2>Unread</h2><a class="lnk" href="#chat">Chat</a></div><div class="card list">${ups.slice(0,3).map(convoRow).join('')}</div></section>`:''}
 ${open.length&&d===today()?`<section><div class="sh"><h2>${space()==='student'?'Your assignments':'Your open tasks'}</h2><a class="lnk" href="#projects">Projects</a></div><div class="card list">${open.map(({t,p})=>`<div class="li" onclick="go('project:${p.id}:tasks')"><span class="tdot" style="--tc:${p.col}"></span><div class="grow"><div class="t">${esc(t.t)}</div><div class="sub">${esc(p.name)}${t.due?' · due '+fmtDay(new Date(t.due).getTime()):''}</div></div><span class="pill st-${t.st}">${t.st==='doing'?'doing':'to do'}</span></div>`).join('')}</div></section>`:''}
 </div>
`}
/* the Palette: Atelier's floating tool panel (note, feeling, action, voice); open on Today, a handle elsewhere */
const railMark=`<svg viewBox="0 0 56 56" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${MARK_A}" stroke="currentColor" stroke-width="5.2"/><path d="${MARK_B}" stroke="var(--accent)" stroke-width="4.6"/><circle cx="${MARK_DOT[0]}" cy="${MARK_DOT[1]}" r="3.4" fill="var(--accent)"/></svg>`;
const railOpen=()=>route.k==='today'?S.settings.rail!==false:!!window._railOpen;
function railHTML(on){return`<div class="rbtns"><div class="rhd" aria-hidden="true">${railMark}<span>Palette</span></div><button onclick="railAct(quickNote)">${noteGlyph()}<span>Note</span></button><button onclick="railAct(openPulse)">${ic('pulse')}<span>Feeling</span></button><button onclick="railAct(actionSheet)">${ic('plus')}<span>Action</span></button><button onclick="railAct(voiceSheet)" class="rv">${ic('mic')}<span>Voice</span></button></div><button class="rtog" onclick="toggleRail()" aria-label="${on?'Hide the Palette':'Show the Palette'}" aria-expanded="${on}">${ic(on?'chevr':'chevl',2.2)}</button>`}
function paintRail(){const r=$('#rail');if(!r)return;const show=S.me&&!['c','board','note','review'].includes(route.k);r.hidden=!show;if(!show)return;const on=railOpen();r.classList.toggle('off',!on);if(r._on!==on){r.innerHTML=railHTML(on);r._on=on}}
function toggleRail(){if(route.k==='today'){S.settings.rail=S.settings.rail===false;save()}else window._railOpen=!window._railOpen;paintRail()}
function railAct(f){if(route.k!=='today')window._railOpen=false;f();paintRail()}
function pLedger(){const by={};S.ledger.slice().reverse().forEach(x=>{const d=isoD(new Date(x.at));(by[d]=by[d]||[]).push(x)});const all=Object.keys(by),days=all.slice(0,window._ldays||7);
 return`<div class="page">${header('Ledger',{sub:'Everything you did',back:'today'})}${days.length?days.map(d=>`<section><div class="sh"><h2>${fmtDay(new Date(d+'T12:00').getTime())}</h2><span class="sub">${by[d].length} entries</span></div><div class="timeline card">${by[d].slice(0,80).map(ledgerItem).join('')}</div></section>`).join('')+(all.length>days.length?`<button class="btn full" onclick="window._ldays=(window._ldays||7)+14;render()">Show earlier days</button>`:''):empty('walk','Your ledger is empty','Everything you do shows up here with a time, like a diary of your work.')}</div>`}
function playMotd(i){use('motd');const el=$('#motd');if(el){el.classList.remove('playing');void el.offsetWidth;el.classList.add('playing')}
 try{if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(MOTD[i]);u.rate=.95;u.pitch=1;speechSynthesis.speak(u)}}catch(e){}}
function quickNote(){const n=newNote();go('note:'+n.id)}
function feelSheet(){openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Feeling"><div class="sheet-h"><h2>How do you feel?</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div><div class="feels" id="fls">${FEELS.map(([f,c])=>`<button class="feelchip big" style="--fc:${c}" data-f="${f}">${f}</button>`).join('')}</div><label for="flN">A line about it (optional)</label><input id="flN" placeholder="e.g. resting pleasant after the walk"><button class="btn primary full" id="flS" disabled>Check in</button></div>`);
 let f=null;$('#fls').onclick=e=>{const b=e.target.closest('[data-f]');if(!b)return;f=b.dataset.f;$$('#fls button').forEach(x=>x.classList.toggle('on',x===b));$('#flS').disabled=false};
 $('#flS').onclick=()=>{if(!f)return;led('feel',$('#flN').value.trim(),{feel:f});use('feel');closeSheet();save();render();toast('Checked in: '+f)}}
/* each space opens with its own summary and its own quick actions */
function spaceHero(){if(space()==='student'){const g=S.study.goal||60,min=focusTodayMin(),due=allDue(),ex=nextExams()[0];
  return`<a class="card shero" href="#study" style="--sc:var(--violet)">${ring(Math.min(1,min/g),'var(--violet)',58,6,String(min))}<div class="grow"><div class="lab" style="--lc:var(--violet)">${ic('cap',2)}<span>Study</span></div><b>${min>=g?'Daily goal reached':`${g-min} min to your goal`}</b><div class="sub">${due?plural(due,'card')+' to review':'No cards due'}${ex?` · ${esc(ex.title)} ${cdText(ex.d).toLowerCase()}`:''}</div></div>${ic('arrow')}</a>`}
 const open=S.projects.reduce((a,p)=>a+(p.tasks||[]).filter(t=>t.st!=='done'&&(t.who==='me'||!t.who)).length,0),act=S.projects.filter(p=>pctOf(p)<100),avg=act.length?Math.round(act.reduce((a,p)=>a+pctOf(p),0)/act.length):0,now=tHM(Date.now()),nx=agendaOf(today()).find(a=>!a.done&&(!a.t||a.t>=now));
 return`<a class="card shero" href="#projects" style="--sc:var(--accent)">${ring(avg/100,'var(--accent)',58,6,avg+'%')}<div class="grow"><div class="lab" style="--lc:var(--accent)">${ic('case',2)}<span>Work</span></div><b>${act.length?plural(act.length,'active project'):'No active projects'}</b><div class="sub">${plural(open,'open task')}${nx?` · next: ${esc((nx.t?nx.t+' ':'')+nx.title)}`:''}</div></div>${ic('arrow')}</a>`}
const ACTS={work:[['notes','Note','quickNote()'],['focus','Focus session',"go('focus')"],['check','Task','taskQuick()'],['projects','Project','projectForm()'],['group','Group','groupForm()'],['chat','Message','newChat()'],['calendar','Agenda','agendaForm(today())'],['share','Share my day','shareTo(dayAtt(today()))']],
 student:[['notes','Note','quickNote()'],['focus','Study session',"go('focus')"],['cap','Flashcards',"go('study')"],['flag','Exam','examForm()'],['calendar','Agenda','agendaForm(today())'],['check','Assignment','taskQuick()'],['group','Study group','groupForm()'],['chat','Message','newChat()'],['share','Share my day','shareTo(dayAtt(today()))']]};
function actionSheet(){openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="New"><div class="sheet-h"><h2>New</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div><div class="actgrid">
 ${ACTS[space()].map(([i,n,f])=>`<button onclick="closeSheet();setTimeout(()=>{${f}},${f.startsWith('go')?0:230})">${ic(i)}<span>${n}</span></button>`).join('')}</div></div>`)}
function taskQuick(){if(!S.projects.length){projectForm({name:'My tasks',size:'small'});return}sheet('New task',`<label for="tqT">Task</label><input id="tqT" name="t" required placeholder="What needs doing?"><label for="tqP">Project</label><select id="tqP" name="p">${S.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>`,fd=>{if(!fd.t.trim())return false;const p=proj(fd.p);addTask(p,{t:fd.t.trim()});toast('Task added to '+p.name)})}
/* voice memos */
/* voice memos: the wave and timer always run while you record or dictate, the main button always stops,
   and closing the sheet in any way stops everything and releases the microphone */
let _rec=null;
/* where the page may not use the microphone at all (some previews), skip asking and show the preview */
const micAllowed=()=>{try{const fp=document.permissionsPolicy||document.featurePolicy;return!fp||!fp.allowsFeature||fp.allowsFeature('microphone')}catch(e){return true}};
function voiceSheet(){const mic=micAllowed(),canRec=mic&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder),SR=mic?(window.SpeechRecognition||window.webkitSpeechRecognition):null;
 openModal(`<div class="sheet center" role="dialog" aria-modal="true" aria-label="Voice"><div class="sheet-h"><h2>Voice</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div>
 <div class="vrec" id="vr"><span></span><span></span><span></span><span></span><span></span></div><div class="vtime" id="vt">0:00</div><p class="sub" id="vh" style="margin:0 0 6px">Record a memo, dictate a note, or attach a recording.</p>
 <button class="btn primary full" id="vb">${ic('mic')} Record a memo</button><button class="btn full" id="vd">${ic('notes')} Dictate a note</button><label class="btn full" id="vaL">${ic('attach')} Attach a recording<input id="va" type="file" accept="audio/*" hidden></label><button class="btn ghost full" id="vx" hidden>Cancel</button></div>`);
 const V={mode:null,t0:0,iv:null,st:null,rec:null,ch:[],sr:null,txt:'',live:false,done:false};_rec=null;
 const el=id=>document.getElementById(id),hint=t=>{const h=el('vh');if(h)h.textContent=t};
 const IDLE={vb:ic('mic')+' Record a memo',vd:ic('notes')+' Dictate a note'};
 const ui=on=>{const vr=el('vr');if(!vr)return;vr.classList.toggle('on',!!on);el('vx').hidden=!on;el('vaL').hidden=!!on;
  el('vb').hidden=on==='dict';el('vd').hidden=on==='rec';el('vb').innerHTML=on==='rec'?ic('stop')+' Stop and save':IDLE.vb;el('vd').innerHTML=on==='dict'?ic('check')+' Finish and save':IDLE.vd;
  el('vb').classList.toggle('rec',on==='rec');if(!on){el('vt').textContent='0:00';hint('Record a memo, dictate a note, or attach a recording.')}};
 const clock=()=>{clearInterval(V.iv);V.t0=Date.now();V.iv=setInterval(()=>{const s=Math.floor((Date.now()-V.t0)/1000),t=el('vt');if(t)t.textContent=`${Math.floor(s/60)}:${pad(s%60)}`},250)};
 const release=()=>{clearInterval(V.iv);V.iv=null;try{V.st&&V.st.getTracks().forEach(t=>t.stop())}catch(e){}V.st=null;_rec=null};
 const reset=msg=>{release();V.mode=null;V.rec=null;V.sr=null;V.txt='';V.live=false;ui(null);if(msg)toast(msg)};
 const saveBlob=async(blob,secs)=>{const vid='v'+uid();try{await IDB.put(vid,blob)}catch(e){toast('Could not save the recording');return}led('voice','Voice memo',{vid,dur:secs!=null?`${Math.floor(secs/60)}:${pad(secs%60)}`:''});use('voice');save();closeSheet();render();toast('Voice memo saved')};
 /* closing the sheet (X, backdrop, Escape, another sheet) cancels without saving */
 onSheetClose(()=>{V.done=true;try{if(V.rec&&V.rec.state!=='inactive'){V.rec.onstop=null;V.rec.stop()}}catch(e){}try{V.sr&&V.sr.abort()}catch(e){}release()});
 el('va').onchange=e=>{const f=e.target.files[0];if(f)saveBlob(f,null)};
 el('vx').onclick=()=>{try{if(V.rec&&V.rec.state!=='inactive'){V.rec.onstop=null;V.rec.stop()}}catch(e){}try{V.sr&&V.sr.abort()}catch(e){}reset('Cancelled')};
 /* record: the animation starts at once; the microphone joins if this device allows it */
 el('vb').onclick=async()=>{if(V.mode==='rec'){const secs=Math.round((Date.now()-V.t0)/1000);
   if(V.rec&&V.rec.state!=='inactive'){V.rec.onstop=()=>{const blob=new Blob(V.ch,{type:V.ch[0]?.type||'audio/webm'});release();V.mode=null;if(!V.done)saveBlob(blob,secs)};try{V.rec.stop()}catch(e){reset('Could not finish the recording')}}
   else reset('The microphone is not available here, so nothing was recorded');return}
  if(V.mode)return;V.mode='rec';ui('rec');clock();hint('Recording… tap Stop to save it.');
  if(!canRec){hint('Preview only: recording is blocked here. Tap Stop to finish.');return}
  try{V.st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){V.st=null}
  if(V.mode!=='rec'||V.done){release();return}
  if(!V.st){hint('Preview only: the microphone was not allowed. Tap Stop to finish.');return}
  try{V.ch=[];V.rec=new MediaRecorder(V.st);V.rec.ondataavailable=e=>{if(e.data&&e.data.size)V.ch.push(e.data)};V.rec.start();_rec=V.rec;V.live=true}catch(e){V.rec=null;hint('Preview only: recording is not supported here. Tap Stop to finish.')}};
 /* dictate: finishing never waits on the browser; text heard so far becomes a note */
 const finishDict=()=>{if(V.mode!=='dict')return;const txt=V.txt.trim();try{V.sr&&V.sr.stop()}catch(e){}V.sr=null;
  if(txt){V.mode=null;release();const n=newNote({title:'Voice note',body:txt});use('voice');closeSheet();go('note:'+n.id);toast('Dictated note saved')}else reset(SR?'Nothing was heard, so no note was made':'Dictation is not available here, so no note was made')};
 el('vd').onclick=()=>{if(V.mode==='dict'){finishDict();return}if(V.mode)return;V.mode='dict';V.txt='';ui('dict');clock();hint('Listening… tap Finish to save.');
  if(!SR){hint('Preview only: dictation is not available here. Tap Finish to close it.');return}
  let r;try{r=new SR()}catch(e){hint('Preview only: dictation is not available here. Tap Finish to close it.');return}
  V.sr=r;r.lang=navigator.language||'en-GB';r.interimResults=true;r.continuous=true;
  r.onresult=e=>{V.txt=[...e.results].map(x=>x[0].transcript).join(' ');if(V.txt.trim())hint(V.txt)};
  r.onerror=e=>{if(e&&/not-allowed|service-not-allowed|audio-capture/.test(e.error))V.fail=true;if(V.mode==='dict'&&!V.txt.trim())hint(e&&e.error==='not-allowed'?'Preview only: the microphone was not allowed. Tap Finish to close it.':'Still listening… tap Finish when you are done.')};
  r.onend=()=>{if(V.mode==='dict'&&V.sr===r&&!V.done&&!V.fail&&(V.re=(V.re||0)+1)<=5){try{r.start()}catch(e){}}};
  try{r.start()}catch(e){hint('Preview only: dictation could not start. Tap Finish to close it.')}}}
async function playVoice(vid,btn){try{const b=await IDB.get(vid);if(!b){toast('Recording not found on this device');return}const a=new Audio(URL.createObjectURL(b));btn.classList.add('on');a.onended=()=>btn.classList.remove('on');a.play()}catch(e){toast('Could not play')}}
