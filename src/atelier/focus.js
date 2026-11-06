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
function creditWork(r){if(r.phase!=='work'||r.paused||!r.ws)return;const mins=Math.floor((Date.now()-r.ws)/60000);if(mins>0){use('focus_min',mins);r.done=(r.done||0)+mins;r.ws+=mins*60000}}
function stopFocus(silent){const r=S.focus.run;if(!r)return;creditWork(r);const mins=r.done||0;if(mins>0){S.focus.sessions.push({at:r.started,end:Date.now(),mins,mode:r.mode,label:r.label});led('focus',`${r.label||'Focus'} · ${mins} min`,{sub:modeOf(r.mode).n+' finished',ref:'focus'})}
 S.focus.run=null;save();tickOff();if(!silent){toast(mins?`Saved ${mins} focused minutes`:'Session stopped');render()}}
function nextPhase(auto){const r=S.focus.run;if(!r)return;const m=modeOf(r.mode);creditWork(r);
 if(r.phase==='work'){const last=r.round>=m.r;if(last&&!m.lb&&(!m.b||m.r===1)){chime(880,3);stopFocus(true);burst();toast('Session complete. Nice work!');render();return}
  if(last&&m.lb){r.phase='long'}else if(last){chime(880,3);stopFocus(true);burst();toast('All rounds done!');render();return}else r.phase='break';led('break',r.phase==='long'?'Long break':'Break',{sub:`after round ${r.round}`})}
 else{if(r.phase==='long'){chime(880,3);stopFocus(true);burst();toast('All rounds done!');render();return}r.round++;r.phase='work';r.ws=Date.now()}
 const len=phaseLen(r);r.endAt=Date.now()+len;r.left=len;r.paused=auto?!S.settings.auto:false;if(r.phase==='work'&&!r.paused)r.ws=Date.now();
 chime(r.phase==='work'?660:520,2);try{navigator.vibrate&&navigator.vibrate([120,80,120])}catch(e){}save();render()}
let _tick=null;function tickOn(){if(_tick)return;_tick=setInterval(()=>{const r=S.focus.run;if(!r){tickOff();return}if(!r.paused&&leftMs(r)<=0){nextPhase(true);return}if(!r.paused&&r.phase==='work'&&Date.now()-r.ws>=60000)creditWork(r);paintClock();miniTimer()},250)}
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
 return`<div class="page focus" style="--phase:${ph.col}">${header('Focus',{sub:r?`${m.n} · round ${r.round} of ${m.r}`:'Timers for working and studying'})}
 ${r?'':`<div class="modes">${Object.entries(MODES).map(([k,x])=>`<button class="mode ${fm===k?'on':''}" data-mode="${k}"><b>${x.n}</b><span>${modeOf(k).d}</span></button>`).join('')}</div>
 ${fm==='custom'?`<div class="card" id="cust">${[['w','Work',5,120],['b','Break',0,60],['r','Rounds',1,10]].map(([k,n,a,b])=>`<div class="slider"><span>${n}</span><input type="range" name="${k}" min="${a}" max="${b}" value="${S.focus.custom[k]}"><b id="cust_${k}">${S.focus.custom[k]}</b></div>`).join('')}</div>`:''}`}
 <div class="clockwrap ${r&&!r.paused?'live':''}"><div id="clk">${clockSVG(1-left/len)}</div><div class="cin"><div class="lbl hand" style="color:var(--phase);font-size:22px">${ph.n}</div><div class="ct" id="clkT">${mmss(left)}</div><div class="cfig">${figure(ph.fig,{acc:'var(--phase)',sw:2.6})}</div></div></div>
 ${r?`<div class="rounds">${Array.from({length:m.r},(_,i)=>`<i class="${i+1<r.round||(i+1===r.round&&r.phase!=='work')?'done':i+1===r.round?'now':''}"></i>`).join('')}</div>`:''}
 <input class="flabel-in" id="fLabel" placeholder="What are you working on?" value="${esc(r?r.label:S.focus.label)}" maxlength="60">
 <div class="fctl">${r?`<button class="cbtn" onclick="stopFocus()" aria-label="Stop">${ic('stop',2)}</button><button class="cbtn main" onclick="pauseFocus()" aria-label="${r.paused?'Resume':'Pause'}">${ic(r.paused?'play':'pause',2.2)}</button><button class="cbtn" onclick="nextPhase(false)" aria-label="Skip to next phase">${ic('skip',2)}</button>`:`<button class="cbtn main wide" onclick="startFocus()">${ic('play',2.2)}<span>Start ${m.w} min</span></button>`}</div>
 <div class="legend"><span><i style="background:var(--focus)"></i>Focus</span><span><i style="background:var(--break)"></i>Break</span><span><i style="background:var(--long)"></i>Long break</span></div>
 <section><div class="grid3"><div class="card kpi"><div class="l">Today</div><div class="v" data-n="${focusTodayMin()}">${focusTodayMin()}</div><div class="l">minutes</div></div><div class="card kpi"><div class="l">All time</div><div class="v" data-n="${Math.round(tot/60*10)/10}">${(tot/60).toFixed(1)}</div><div class="l">hours</div></div><div class="card kpi"><div class="l">Streak</div><div class="v">${streak}</div><div class="l">${streak===1?'day':'days'}</div></div></div></section>
 <section><div class="sh"><h2>This week</h2><span class="sub">minutes</span></div><div class="card">${barChart(days,{col:'var(--focus)'})}</div></section>
 ${S.focus.sessions.length?`<section><div class="sh"><h2>Recent sessions</h2></div><div class="card list">${S.focus.sessions.slice(-6).reverse().map(s=>`<div class="li" style="cursor:default"><span class="tln" style="--lc:var(--focus)">${ic('focus',1.9)}</span><div class="grow"><div class="t">${esc(s.label||modeOf(s.mode).n)}</div><div class="sub">${fmtDay(s.at)} · ${tHM(s.at)}</div></div><b>${s.mins} min</b></div>`).join('')}</div></section>`:''}</div>`}
