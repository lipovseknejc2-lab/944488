/* ============ FOCUS: timers for working and studying ============ */
const MODES={
 quick:{n:'Focus 15',d:'One 15-minute push',w:15,b:0,r:1,lb:0},
 pomo:{n:'Pomodoro',d:'25 work · 5 break · 4 rounds',w:25,b:5,r:4,lb:15},
 study:{n:'Study',d:'20 study · 5 break · 4 rounds',w:20,b:5,r:4,lb:15},
 deep:{n:'Deep work',d:'50 work · 10 break · 2 rounds',w:50,b:10,r:2,lb:0},
 custom:{n:'Custom',d:'Your own rhythm',w:30,b:5,r:3,lb:0}};
const modeOf=k=>{const m={...MODES[k]||MODES.pomo};if(k==='custom'){const c=S.focus.custom;m.w=c.w;m.b=c.b;m.r=c.r;m.d=`${c.w} work · ${c.b} break · ${c.r} rounds`}return m};
const PHASE={work:{n:'Focus',col:'var(--focus)',fig:'write'},break:{n:'Break',col:'var(--break)',fig:'rest'},long:{n:'Long break',col:'var(--long)',fig:'walk'}};
function phaseLen(run){const m=modeOf(run.mode);return(run.phase==='work'?m.w:run.phase==='long'?m.lb:m.b)*60000}
function leftMs(run){return run.paused?run.left:Math.max(0,run.endAt-Date.now())}
function startFocus(){const m=modeOf(S.focus.mode);S.focus.run={mode:S.focus.mode,phase:'work',round:1,endAt:Date.now()+m.w*60000,left:m.w*60000,paused:false,label:S.focus.label||'',started:Date.now(),ws:Date.now()};
 use('focus_start');led('focus',S.focus.label||'Focus session',{sub:m.n+' started',ref:'focus'});save();chime(660);tickOn();render()}
function pauseFocus(){const r=S.focus.run;if(!r)return;if(r.paused){r.endAt=Date.now()+r.left;r.paused=false;if(r.phase==='work')r.ws=Date.now()}else{creditWork(r);r.left=leftMs(r);r.paused=true}save();render()}
/* credit finished focus minutes; at a phase boundary (round=true) the last part-minute is rounded */
function creditWork(r,at,round){if(r.phase!=='work'||r.paused||!r.ws)return;const raw=((at||Date.now())-r.ws)/60000,mins=round?Math.round(raw):Math.floor(raw);if(mins>0){use('focus_min',mins);r.done=(r.done||0)+mins;r.ws+=mins*60000}}
function stopFocus(silent,at){const r=S.focus.run;if(!r)return;creditWork(r,at,!!at);const mins=r.done||0;if(mins>0){S.focus.sessions.push({at:r.started,end:at||Date.now(),mins,mode:r.mode,label:r.label});led('focus',`${r.label||'Focus'} · ${mins} min`,{sub:modeOf(r.mode).n+' finished',ref:'focus'})}
 S.focus.run=null;save();tickOff();if(!silent){toast(mins?`Saved ${mins} focused minutes`:'Session stopped');render()}}
/* what comes after a phase: {ph, round}, or null when the session is over */
function nextOf(m,ph,round){if(ph==='work'){if(round>=m.r)return m.lb?{ph:'long',round}:null;return{ph:'break',round}}if(ph==='long')return null;return{ph:'work',round:round+1}}
const PH_TITLE={work:'Back to focus',break:'Break time',long:'Long break'};
/* move to the next phase at the moment the last one really ended (at), so time away is counted exactly */
function nextPhase(auto,at,batch){const r=S.focus.run;if(!r)return;at=at||Date.now();const m=modeOf(r.mode);creditWork(r,at,true);const nx=nextOf(m,r.phase,r.round);
 if(!nx){const one=r.phase==='work'&&(!m.b||m.r===1)&&!m.lb,mins=(r.done||0);chime(880,3);stopFocus(true,at);if(!batch)burst();const msg=one?'Session complete. Nice work!':'All rounds done!';toast(msg);notifyFocus('Session complete',`${mins} focused minutes. ${one?'Nice work!':'All rounds done.'}`);zenDone(mins);render();return}
 if(r.phase==='work')led('break',nx.ph==='long'?'Long break':'Break',{sub:`after round ${r.round}`});
 r.phase=nx.ph;r.round=nx.round;const len=phaseLen(r);r.endAt=at+len;r.left=len;r.paused=auto?!S.settings.auto:false;if(r.phase==='work')r.ws=at;
 if(batch)return;
 chime(r.phase==='work'?660:520,2);try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}phaseAlert(r);save();render()}
/* after the phone was locked or the app closed: replay every switch that happened, then tell you once */
function catchUp(){let r=S.focus.run,n=0,last=0;while(r&&!r.paused&&r.endAt<=Date.now()&&n<60){last=r.endAt;nextPhase(true,last,true);n++;r=S.focus.run}
 if(!n)return;if(!r){save();return}const away=Date.now()-last>4000;
 if(away){toast(`While you were away: ${PHASE[r.phase].n.toLowerCase()} since ${tHM(last)}`);if(n===1&&Date.now()-last<120000)phaseAlert(r)}else{chime(r.phase==='work'?660:520,2);try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}phaseAlert(r)}
 save();render()}
let _tick=null;function tickOn(){if(_tick)return;_tick=setInterval(()=>{const r=S.focus.run;if(!r){tickOff();return}if(!r.paused&&leftMs(r)<=0){catchUp();return}if(!r.paused&&r.phase==='work'&&Date.now()-r.ws>=60000)creditWork(r);paintClock();paintZen();miniTimer()},250)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.focus&&S.focus.run){catchUp();paintClock();paintZen();miniTimer();if(S.focus.zen)wakeOn()}});
/* ---- alerts: a system notification when Atelier is in the background, plus sound and vibration ---- */
const notifyOK=()=>{try{return'Notification' in window&&Notification.permission==='granted'&&S.settings.notify!==false}catch(e){return false}};
function notifyFocus(title,body){if(!notifyOK())return;if(document.visibilityState==='visible'&&!window._notifyAlways)return;
 const o={body,tag:'atelier-focus',renotify:true,icon:'icon-192.png',badge:'icon-192.png',vibrate:[180,90,180],data:{url:'./#focus'}};
 const plain=()=>{try{new Notification(title,o)}catch(e){}};
 try{const sw=navigator.serviceWorker;if(sw&&sw.getRegistration)sw.getRegistration().then(g=>g&&g.showNotification?g.showNotification(title,o):plain()).catch(plain);else plain()}catch(e){plain()}}
function phaseAlert(r){const len=Math.round(phaseLen(r)/60000);notifyFocus(PH_TITLE[r.phase],r.paused?`Tap to start · ${len} min`:`${len} min · round ${r.round} of ${modeOf(r.mode).r}${r.label?' · '+r.label:''}`)}
async function askNotify(){if(!('Notification' in window)){toast('Notifications are not available here. On iPhone, add Atelier to the Home Screen first.');return}
 let p='default';try{p=await Notification.requestPermission()}catch(e){}S.settings.notify=p==='granted';save();render();toast(p==='granted'?'Focus alerts are on':'Alerts were not allowed')}
/* ---- calendar alerts: one alert at every switch of this session, kept by the phone's own calendar ---- */
function phasePlan(r){r=r||S.focus.run;if(!r)return[];const m=modeOf(r.mode),out=[];let ph=r.phase,round=r.round,t=r.paused?Date.now()+r.left:r.endAt;
 for(let i=0;i<40;i++){const nx=nextOf(m,ph,round);if(!nx){out.push({at:t,title:'Session complete',body:'Well done. Time to rest.'});break}
  const len=(nx.ph==='work'?m.w:nx.ph==='long'?m.lb:m.b)*60000;out.push({at:t,title:PH_TITLE[nx.ph],body:nx.ph==='work'?`Round ${nx.round} of ${m.r} · ${m.w} min`:`${Math.round(len/60000)} min`});ph=nx.ph;round=nx.round;t+=len}return out}
const icsT=t=>new Date(t).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const icsEsc=s=>String(s).replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
function icsFor(r){const P=phasePlan(r),now=icsT(Date.now()),L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Atelier//Focus//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 P.forEach((x,i)=>L.push('BEGIN:VEVENT',`UID:${uid()}-${i}@atelier`,`DTSTAMP:${now}`,`DTSTART:${icsT(x.at)}`,`DTEND:${icsT(x.at+60000)}`,`SUMMARY:${icsEsc('Atelier · '+x.title)}`,`DESCRIPTION:${icsEsc(x.body)}`,'TRANSP:TRANSPARENT','BEGIN:VALARM','ACTION:DISPLAY',`DESCRIPTION:${icsEsc(x.title)}`,'TRIGGER:PT0S','END:VALARM','END:VEVENT'));
 L.push('END:VCALENDAR');return L.join('\r\n')}
function calAlerts(){const r=S.focus.run;if(!r){toast('Start a session first');return}const n=phasePlan(r).length,u=URL.createObjectURL(new Blob([icsFor(r)],{type:'text/calendar'})),a=document.createElement('a');
 a.href=u;if(/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.maxTouchPoints>1&&/Mac/.test(navigator.userAgent))a.target='_blank';else a.download='atelier-focus-alerts.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);
 use('cal_alerts');toast(`${plural(n,'alert')} ready. Choose Add All in Calendar.`)}
function alertsSheet(){const r=S.focus.run,P=r?phasePlan(r):[],perm=('Notification' in window)?Notification.permission:'none';
 openModal(`<div class="sheet" role="dialog" aria-modal="true" aria-label="Alerts"><div class="sheet-h"><h2>Alerts</h2><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div>
 <div class="card list flat"><div class="li" style="cursor:default"><span class="fic">${ic('bell')}</span><div class="grow"><div class="t">While Atelier is open</div><div class="sub sm">A notification, a soft chime and a buzz at every switch.</div></div>${perm==='granted'&&S.settings.notify!==false?'<span class="pill st-done">On</span>':`<button class="btn sm primary" id="alAsk">Allow</button>`}</div>
 <div class="li" style="cursor:default"><span class="fic">${ic('calendar')}</span><div class="grow"><div class="t">When the phone is locked</div><div class="sub sm">Your calendar alerts you at every switch of this session, even offline.</div></div><button class="btn sm ${r?'primary':''}" id="alCal" ${r?'':'disabled'}>Add</button></div></div>
 ${r&&P.length?`<div class="flabel">This session</div><div class="card list flat alplan">${P.map(x=>`<div class="li" style="cursor:default"><span class="tlh" style="padding:0;width:48px">${tHM(x.at)}</span><div class="grow t">${esc(x.title)}</div><span class="sub sm">${esc(x.body)}</span></div>`).join('')}</div><p class="sub sm" style="margin:8px 4px 0">If you pause or skip, add the alerts again so the times match.</p>`:''}
 ${perm==='denied'?'<p class="sub sm" style="margin:10px 4px 0">Notifications are blocked for Atelier. You can turn them on in the phone settings.</p>':''}<p class="sub sm" style="margin:10px 4px 0">On iPhone, notifications need Atelier on the Home Screen: Share, then Add to Home Screen.</p></div>`);
 const a=$('#alAsk');if(a)a.onclick=()=>{closeSheet();askNotify()};$('#alCal').onclick=()=>{closeSheet();calAlerts()}}
/* ---- deep mode: a dark, quiet screen with only the timer; the screen stays on, nothing else moves ---- */
let _wake=null;
/* only ask to keep the screen on where the page may (some previews forbid it) */
const mayWake=()=>{try{if(!('wakeLock' in navigator))return false;const fp=document.permissionsPolicy||document.featurePolicy;return!fp||!fp.allowsFeature||fp.allowsFeature('screen-wake-lock')}catch(e){return false}};
async function wakeOn(){try{if(!mayWake()||_wake)return;_wake=await navigator.wakeLock.request('screen');_wake.addEventListener('release',()=>{_wake=null})}catch(e){_wake=null}}
function wakeOff(){try{_wake&&_wake.release()}catch(e){}_wake=null}
function enterZen(){if(!S.focus.run)startFocus();const r=S.focus.run;if(!r)return;S.focus.zen=true;save();use('zen');let z=$('#zen');if(!z){z=document.createElement('div');z.id='zen';document.body.appendChild(z)}
 z.className='zen';z.setAttribute('role','dialog');z.setAttribute('aria-label','Deep mode');
 z.innerHTML=`<div class="zw" id="zW"><div class="zph" id="zPh"></div><div class="zt" id="zT">00:00</div><div class="zlb" id="zL"></div><div class="zbar"><i id="zB"></i></div><div class="zrd" id="zR"></div></div>
 <div class="zctl" id="zC"><button class="zb" id="zP" aria-label="Pause">${ic('pause',2)}</button><button class="zb" id="zS" aria-label="Skip to next phase">${ic('skip',2)}</button><button class="zb zx" id="zX" aria-label="Leave deep mode">${ic('close',2)}<span>Leave</span></button></div><div class="zhint" id="zH">${mayWake()?'Screen stays on · tap for controls':'Tap for controls'}</div>`;
 document.body.classList.add('zenon');const m=$('meta[name=theme-color]');if(m)m.content='#000000';
 z.onclick=e=>{if(e.target.closest('.zb'))return;zenCtl()};$('#zP').onclick=()=>{pauseFocus();paintZen(true);zenCtl()};$('#zS').onclick=()=>{nextPhase(false);paintZen(true);zenCtl()};$('#zX').onclick=leaveZen;
 wakeOn();try{const d=document.documentElement;if(d.requestFullscreen&&!document.fullscreenElement&&!/iPhone|iPad/.test(navigator.userAgent))d.requestFullscreen().catch(()=>{})}catch(e){}
 tickOn();paintZen(true);zenCtl();clearInterval(window._zshift);window._zshift=setInterval(()=>{const w=$('#zW');if(w)w.style.transform=`translate(${Math.round(Math.random()*16-8)}px,${Math.round(Math.random()*16-8)}px)`},60000)}
function zenCtl(){const z=$('#zen');if(!z)return;z.classList.add('ctl');clearTimeout(window._zctl);window._zctl=setTimeout(()=>{const y=$('#zen');if(y)y.classList.remove('ctl')},4000)}
function leaveZen(){const z=$('#zen');S.focus.zen=false;save();wakeOff();clearInterval(window._zshift);clearTimeout(window._zctl);document.body.classList.remove('zenon');try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}
 if(z){z.classList.add('out');setTimeout(()=>z.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:380)}applyTheme();render()}
let _zLast='';
function paintZen(force){const z=$('#zen');if(!z||z.classList.contains('done'))return;const r=S.focus.run;if(!r)return;const m=modeOf(r.mode),ph=PHASE[r.phase],left=leftMs(r),t=mmss(left);
 if(force||_zLast!==r.phase+r.round+r.paused){_zLast=r.phase+r.round+r.paused;z.style.setProperty('--phase',ph.col);$('#zPh').textContent=ph.n+(r.paused?' · paused':'');$('#zL').textContent=`${r.label||m.n} · round ${r.round} of ${m.r}`;
  $('#zR').innerHTML=Array.from({length:m.r},(_,i)=>`<i class="${i+1<r.round||(i+1===r.round&&r.phase!=='work')?'d':i+1===r.round?'n':''}"></i>`).join('');$('#zP').innerHTML=ic(r.paused?'play':'pause',2);$('#zP').setAttribute('aria-label',r.paused?'Resume':'Pause');
  if(!force){z.classList.remove('sw');void z.offsetWidth;z.classList.add('sw')}}
 const T=$('#zT');if(T&&T.textContent!==t)T.textContent=t;const B=$('#zB');if(B)B.style.width=(100*(1-left/phaseLen(r))).toFixed(1)+'%'}
function zenDone(mins){const z=$('#zen');if(!z)return;z.classList.add('done','ctl');clearTimeout(window._zctl);z.querySelector('#zW').innerHTML=`<div class="zph">Session complete</div><div class="zt zdone">${mins}</div><div class="zlb">focused minutes</div>`;$('#zC').innerHTML=`<button class="zb zx" onclick="leaveZen()">${ic('check',2)}<span>Done</span></button>`;$('#zH').textContent='Well done. Rest your eyes.';wakeOff()}
function tickOff(){clearInterval(_tick);_tick=null;miniTimer()}
const mmss=ms=>{const s=Math.ceil(ms/1000);return`${pad(Math.floor(s/60))}:${pad(s%60)}`};
function paintClock(){const r=S.focus.run,el=$('#clk');if(!el||!r)return;const len=phaseLen(r),left=leftMs(r),fr=1-left/len;
 const arc=el.querySelector('.arc'),kn=el.querySelector('.knob');if(arc){const C=+arc.getAttribute('stroke-dasharray');arc.setAttribute('stroke-dashoffset',(C*(1-fr)).toFixed(1))}
 if(kn){const a=fr*Math.PI*2-Math.PI/2;kn.setAttribute('cx',(150+Math.cos(a)*118).toFixed(1));kn.setAttribute('cy',(150+Math.sin(a)*118).toFixed(1))}
 const t=$('#clkT');if(t)t.textContent=mmss(left);const fc=$('#fcT');if(fc)fc.textContent=mmss(left)}
function chime(f=660,n=1){if(!S.settings.sound)return;try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());for(let i=0;i<n;i++){const o=A.createOscillator(),g=A.createGain(),t=A.currentTime+i*.22;o.type='sine';o.frequency.value=f*(1+i*.25);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.9);o.connect(g).connect(A.destination);o.start(t);o.stop(t+1)}}catch(e){}}
function focusTodayMin(){const t=today();return S.focus.sessions.filter(s=>isoD(new Date(s.at))===t).reduce((a,s)=>a+s.mins,0)+(S.focus.run&&isoD(new Date(S.focus.run.started))===t?(S.focus.run.done||0):0)}
function focusCard(){const r=S.focus.run,ph=PHASE[r.phase];return`<a class="card fcard" href="#focus" style="--phase:${ph.col}"><button class="fpb" onclick="event.preventDefault();pauseFocus()" aria-label="${r.paused?'Resume':'Pause'}">${ic(r.paused?'play':'pause',2.2)}</button><div class="grow"><div class="lbl hand" style="color:${ph.col};font-size:17px">${ic('sparkle',2)} ${ph.n}${r.paused?' · paused':''}</div><div class="fct">${esc(r.label||modeOf(r.mode).n)}</div><div class="sub"><span id="fcT">${mmss(leftMs(r))}</span> left · round ${r.round}/${modeOf(r.mode).r}</div></div><span class="livedot"></span></a>`}
function miniTimer(){const el=$('#mini'),r=S.focus.run;if(!el)return;if(!r||route.k==='focus'||!S.me){el.hidden=true;return}el.hidden=false;el.style.setProperty('--phase',PHASE[r.phase].col);el.innerHTML=`<span class="livedot"></span>${PHASE[r.phase].n} ${mmss(leftMs(r))}`}
function pFocus(){const r=S.focus.run,fm=S.focus.mode,m=modeOf(r?r.mode:fm),ph=r?PHASE[r.phase]:PHASE.work,len=r?phaseLen(r):m.w*60000,left=r?leftMs(r):len;
 const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=isoD(d);days.push({l:d.toLocaleDateString('en-GB',{weekday:'narrow'}),v:S.focus.sessions.filter(s=>isoD(new Date(s.at))===iso).reduce((a,s)=>a+s.mins,0)+(r&&i===0?(r.done||0):0)})}
 const tot=S.focus.sessions.reduce((a,s)=>a+s.mins,0),streak=(()=>{let n=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);const iso=isoD(d);if(S.focus.sessions.some(s=>isoD(new Date(s.at))===iso))n++;else if(i>0)break}return n})();
 if(r&&!r.paused)tickOn();
 after(()=>{$$('[data-mode]').forEach(b=>b.onclick=()=>{S.focus.mode=b.dataset.mode;save();render()});const lb=$('#fLabel');if(lb)lb.oninput=()=>{S.focus.label=lb.value;if(S.focus.run)S.focus.run.label=lb.value;saveSoon()};
  $$('#cust input').forEach(i=>i.oninput=()=>{S.focus.custom[i.name]=clamp(+i.value||1,1,180);$('#cust_'+i.name).textContent=S.focus.custom[i.name];saveSoon()});
  $$('#cust input').forEach(i=>i.onchange=()=>render())});
 return`<div class="page focus" style="--phase:${ph.col}">${header('Focus',{sub:r?`${m.n} · round ${r.round} of ${m.r}`:'Timers for working and studying',right:`<button class="icon-btn ${notifyOK()?'on':''}" onclick="alertsSheet()" aria-label="Alerts">${ic('bell')}</button>`})}${focusTabs('focus')}
 ${r?'':`<div class="modes">${Object.entries(MODES).map(([k,x])=>`<button class="mode ${fm===k?'on':''}" data-mode="${k}"><b>${x.n}</b><span>${modeOf(k).d}</span></button>`).join('')}</div>
 ${fm==='custom'?`<div class="card" id="cust">${[['w','Work',5,120],['b','Break',0,60],['r','Rounds',1,10]].map(([k,n,a,b])=>`<div class="slider"><span>${n}</span><input type="range" name="${k}" min="${a}" max="${b}" value="${S.focus.custom[k]}"><b id="cust_${k}">${S.focus.custom[k]}</b></div>`).join('')}</div>`:''}`}
 <div class="clockwrap ${r&&!r.paused?'live':''}"><div id="clk">${clockSVG(1-left/len)}</div><div class="cin"><div class="lbl hand" style="color:var(--phase);font-size:22px">${ph.n}</div><div class="ct" id="clkT">${mmss(left)}</div><div class="cfig">${figure(ph.fig,{acc:'var(--phase)',sw:2.6})}</div></div></div>
 ${r?`<div class="rounds">${Array.from({length:m.r},(_,i)=>`<i class="${i+1<r.round||(i+1===r.round&&r.phase!=='work')?'done':i+1===r.round?'now':''}"></i>`).join('')}</div>`:''}
 <input class="flabel-in" id="fLabel" placeholder="What are you working on?" value="${esc(r?r.label:S.focus.label)}" maxlength="60">
 <div class="fctl">${r?`<button class="cbtn" onclick="stopFocus()" aria-label="Stop">${ic('stop',2)}</button><button class="cbtn main" onclick="pauseFocus()" aria-label="${r.paused?'Resume':'Pause'}">${ic(r.paused?'play':'pause',2.2)}</button><button class="cbtn" onclick="nextPhase(false)" aria-label="Skip to next phase">${ic('skip',2)}</button>`:`<button class="cbtn main wide" onclick="startFocus()">${ic('play',2.2)}<span>Start ${m.w} min</span></button>`}</div>
 <div class="fbtns"><button class="btn zbtn" onclick="enterZen()">${ic('moon')} ${r?'Deep mode':'Start in deep mode'}</button><button class="btn" onclick="alertsSheet()">${ic('bell')} Alerts</button></div>
 <div class="legend"><span><i style="background:var(--focus)"></i>Focus</span><span><i style="background:var(--break)"></i>Break</span><span><i style="background:var(--long)"></i>Long break</span></div>
 <section><div class="grid3"><div class="card kpi"><div class="l">Today</div><div class="v" data-n="${focusTodayMin()}">${focusTodayMin()}</div><div class="l">minutes</div></div><div class="card kpi"><div class="l">All time</div><div class="v" data-n="${Math.round(tot/60*10)/10}">${(tot/60).toFixed(1)}</div><div class="l">hours</div></div><div class="card kpi"><div class="l">Streak</div><div class="v">${streak}</div><div class="l">${streak===1?'day':'days'}</div></div></div>
 <button class="btn full" onclick="shareTo(focusAtt(),c=>go('c:'+c.id))">${ic('share')} Share your focus</button></section>
 <section><div class="sh"><h2>This week</h2><span class="sub">minutes</span></div><div class="card">${barChart(days,{col:'var(--focus)'})}</div></section>
 ${S.focus.sessions.length?`<section><div class="sh"><h2>Recent sessions</h2></div><div class="card list">${S.focus.sessions.slice(-6).reverse().map(s=>`<div class="li" style="cursor:default"><span class="tln" style="--lc:var(--focus)">${ic('focus',1.9)}</span><div class="grow"><div class="t">${esc(s.label||modeOf(s.mode).n)}</div><div class="sub">${fmtDay(s.at)} · ${tHM(s.at)}</div></div><b>${s.mins} min</b></div>`).join('')}</div></section>`:''}</div>`}
