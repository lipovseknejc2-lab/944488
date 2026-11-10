/* ============ RESET: a guided two-minute break (breathing, stretches, distant gaze) ============
   Built on research:
   - Cyclic sighing (Balban et al., Cell Reports Medicine, 2023): a double inhale and a long exhale; five minutes a day
     improved mood and lowered breathing rate more than mindfulness meditation.
   - Slow breathing near six breaths a minute raises heart-rate variability and calm (Lehrer and Gevirtz, 2014;
     Zaccaro et al., 2018). A longer exhale than inhale shifts the body toward rest.
   - Micro-breaks of ten minutes or less raise vigour and lower fatigue, most of all with movement (Albulescu et al., 2022).
   - The 20-20-20 rule against digital eye strain; a short view of green or sky restores attention (Lee et al., 2015).
   - Breaks spent on the phone restore less than phone-free breaks (Kang and Kurtzberg, 2019).
   Each reset mixes one breathing technique, two stretches and a far-away look, shuffled so it stays fresh. */
const RBREATH={
 sigh:{n:'Cyclic sighing',d:'Two breaths in through the nose, one long breath out through the mouth. The quickest way to calm down.',ph:[['in','Breathe in',2,.86],['in2','In a little more',1,1],['out','Long breath out',6,.6]],cycles:6},
 slow:{n:'Slow breathing',d:'About six breaths a minute. Even and unhurried; it steadies your heart rhythm.',ph:[['in','Breathe in',5,1],['out','Breathe out',5,.6]],cycles:6},
 box:{n:'Box breathing',d:'Four counts each side of the box. Calm and alert at the same time.',ph:[['in','Breathe in',4,1],['hold','Hold',4,1],['out','Breathe out',4,.6],['hold','Hold',4,.6]],cycles:4},
 exhale:{n:'Long exhale',d:'Breathing out for longer than you breathe in tells your body it is safe to rest.',ph:[['in','Breathe in',4,1],['out','Breathe out slowly',7,.6]],cycles:5}};
/* stretches as keyframes for the stick figure: t in seconds within a loop, a pose, and the cue shown below */
const RB={la:-12,le:-4,ra:12,re:4,ll:-6,lk:2,rl:6,rk:-2,head:0,lean:0,shrug:0,rise:0};
const RUP={la:-174,le:0,ra:174,re:0};
const RSTRETCH={
 neck:{n:'Neck release',secs:36,loop:12,k:[[0,{},'Sit or stand tall'],[2.6,{head:-26},'Tilt your head to the left. Let the right shoulder drop.'],[5.6,{head:-26}],[6.6,{}],[9,{head:26},'Now to the right. Breathe slowly.'],[11.4,{head:26}]]},
 shoulders:{n:'Shoulder rolls',secs:30,loop:4,k:[[0,{},'Roll your shoulders up, back and down. Slowly.'],[1.1,{shrug:3.2,la:-9,ra:9}],[2.1,{shrug:3.2,la:-20,ra:20}],[3.1,{shrug:0,la:-17,ra:17}]]},
 reach:{n:'Reach up',secs:32,loop:8,k:[[0,{},'Breathe in and reach up tall.'],[2.4,RUP],[3.4,{...RUP,rise:3.5},'Rise onto your toes. Stretch every finger.'],[5.6,{...RUP,rise:3.5}],[7.2,{},'Lower your arms as you breathe out.']]},
 side:{n:'Side bend',secs:36,loop:10,k:[[0,RUP,'Arms up, hands together.'],[2.6,{...RUP,lean:-15},'Lean to the left. Long through the right side.'],[4.6,{...RUP,lean:-15}],[5.6,RUP],[8,{...RUP,lean:15},'Now lean to the right.'],[9.6,{...RUP,lean:15}]]},
 chest:{n:'Chest opener',secs:32,loop:8,k:[[0,{},'Undo the desk hunch.'],[2.2,{la:-88,le:0,ra:88,re:0},'Open your arms wide.'],[4,{la:-92,le:-80,ra:92,re:80,head:0},'Bend the elbows back. Squeeze your shoulder blades together.'],[6,{la:-92,le:-80,ra:92,re:80}],[7.4,{}]]},
 calves:{n:'Calf raises',secs:30,loop:3,k:[[0,{},'Rise onto your toes, then lower slowly. Wakes up the circulation.'],[1.1,{rise:4.5}],[1.7,{rise:4.5}],[3,{}]]}};
const REYES={n:'Look far away',secs:20,d:'Find something at least six metres away, ideally sky or green. Let your eyes soften.'};
const RTIPS=['Drink a glass of water.','Leave your phone face down until the timer ends.','If you have time, walk to a window or take the stairs.','Roll your wrists and open your hands a few times.','Notice three sounds around you, then let them go.','Get some daylight on your face if you can.'];
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const lerp=(a,b,t)=>a+(b-a)*t;
/* the stick figure: one ink line like every Atelier figure, posed by joint angles (0 = down, 90 = to the right) */
function rigPaths(p){const R=Math.PI/180,hip=[50,64-(p.rise||0)],tl=(p.lean||0)*R,neck=[hip[0]+Math.sin(tl)*23,hip[1]-Math.cos(tl)*23],sh=[neck[0],neck[1]+2.5-(p.shrug||0)],ht=((p.lean||0)+(p.head||0))*R,head=[neck[0]+Math.sin(ht)*8.6,neck[1]-Math.cos(ht)*8.6+(p.shrug||0)*.35];
 const limb=(o,a1,l1,a2,l2,toe)=>{const r1=a1*R,e=[o[0]+Math.sin(r1)*l1,o[1]+Math.cos(r1)*l1],r2=(a1+a2)*R,h=[e[0]+Math.sin(r2)*l2,e[1]+Math.cos(r2)*l2];return`M${o[0].toFixed(2)} ${o[1].toFixed(2)}L${e[0].toFixed(2)} ${e[1].toFixed(2)}L${h[0].toFixed(2)} ${h[1].toFixed(2)}`+(toe?`L${(h[0]+toe).toFixed(2)} 98`:'')};
 const lean=p.lean||0;return{torso:`M${hip[0].toFixed(2)} ${hip[1].toFixed(2)}L${neck[0].toFixed(2)} ${neck[1].toFixed(2)}`,head,arms:limb(sh,p.la+lean,13,p.le,12)+limb(sh,p.ra+lean,13,p.re,12),legs:limb(hip,p.ll,16,p.lk,16,-4.6)+limb(hip,p.rl,16,p.rk,16,4.6)}}
/* build a routine: one breathing technique, two stretches (three on a long break), a far look, then a tip */
function buildReset(long){const last=S.settings.lastReset||[],pick=(pool,n)=>{const all=Object.keys(pool),fresh=all.filter(k=>!last.includes(k)),src=(fresh.length>=n?fresh:all).sort(()=>Math.random()-.5);return src.slice(0,n)};
 const b=pick(RBREATH,1)[0],st=pick(RSTRETCH,long?3:2);S.settings.lastReset=[b,...st];
 return[{k:'breath',id:b},...st.map(id=>({k:'stretch',id})),{k:'eyes'},{k:'done'}]}
const stepSecs=s=>s.k==='breath'?RBREATH[s.id].ph.reduce((a,p)=>a+p[2],0)*RBREATH[s.id].cycles:s.k==='stretch'?RSTRETCH[s.id].secs:s.k==='eyes'?REYES.secs:0;
let RS=null;
function openReset(from){const r=S.focus.run,long=!!(r&&r.phase==='long');const steps=buildReset(long);RS={steps,i:0,t:0,paused:false,last:performance.now(),pose:{...RB},from:from||'',t0:Date.now(),breath:0};
 let el=$('#rst');if(!el){el=document.createElement('div');el.id='rst';document.body.appendChild(el)}el.className='rst';el.setAttribute('role','dialog');el.setAttribute('aria-label','Guided reset');
 el.innerHTML=`<div class="rtop"><div class="rlab">${ic('coffee',2)}<span>Reset</span></div><div class="rdots">${steps.slice(0,-1).map(()=>'<i></i>').join('')}</div><button class="rx" id="rX" aria-label="Close the reset">${ic('close',2)}</button></div>
 <div class="rstage"><svg class="rorb" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="rog" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="var(--break)" stop-opacity=".55"/><stop offset="1" stop-color="var(--break)" stop-opacity=".08"/></radialGradient></defs><circle cx="100" cy="100" r="92" class="rring"/><circle cx="100" cy="100" r="92" class="rfill" id="rO"/><circle cx="100" cy="100" r="96" class="rprog" id="rP" pathLength="1"/></svg>
  <svg class="rfig" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle id="rfHd" r="6.4" cx="50" cy="25"/><path id="rfT" d="M50 64L50 41"/><path id="rfA" d=""/><path id="rfL" d=""/><path class="rfloor" d="M28 98.6H72"/></svg>
  <svg class="rhz" viewBox="0 0 200 60" fill="none" stroke-linecap="round" aria-hidden="true"><path d="M8 50C40 34 64 40 92 30C118 21 146 26 192 14"/><circle cx="158" cy="14" r="6"/></svg></div>
 <div class="rtxt"><div class="rph" id="rPh"></div><div class="rsub" id="rSub"></div><div class="rname" id="rN"></div></div>
 <div class="rctl"><button class="zb" id="rPa" aria-label="Pause">${ic('pause',2)}</button><button class="zb" id="rSk" aria-label="Next step">${ic('skip',2)}</button></div>`;
 document.body.classList.add('rston');$('#rX').onclick=closeReset;$('#rPa').onclick=()=>{RS.paused=!RS.paused;$('#rPa').innerHTML=ic(RS.paused?'play':'pause',2);$('#rPa').setAttribute('aria-label',RS.paused?'Resume':'Pause');el.classList.toggle('paused',RS.paused)};
 $('#rSk').onclick=()=>resetNext();wakeOn();use('reset');resetEnter();cancelAnimationFrame(window._rraf);window._rraf=requestAnimationFrame(resetLoop)}
function resetEnter(){const el=$('#rst');if(!el||!RS)return;const s=RS.steps[RS.i];RS.t=0;el.dataset.k=s.k;$$('#rst .rdots i').forEach((d,k)=>{d.className=k<RS.i?'d':k===RS.i?'n':''});
 const N=$('#rN'),Sb=$('#rSub'),P=$('#rPh');el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap');
 const nS=RS.steps.filter(x=>x.k==='stretch'),si=nS.indexOf(s);
 if(s.k==='breath'){const B=RBREATH[s.id];N.textContent=`Breathing · ${B.n}`;Sb.textContent=B.d}
 else if(s.k==='stretch'){const T=RSTRETCH[s.id];N.textContent=`Stretch ${si+1} of ${nS.length}`;Sb.textContent=T.k[0][2];P.textContent=T.n}
 else if(s.k==='eyes'){N.textContent='Eyes';Sb.textContent=REYES.d;P.textContent=REYES.n}
 else if(s.k==='done')resetDone()}
function resetNext(){if(!RS)return;if(RS.i<RS.steps.length-1){RS.i++;resetEnter()}}
/* one animation loop: the orb breathes, the figure moves, the words follow; only transforms and attributes change */
function resetLoop(now){if(!RS)return;const el=$('#rst');if(!el){RS=null;return}const dt=Math.min(.1,(now-RS.last)/1000);RS.last=now;const s=RS.steps[RS.i];if(!RS.paused&&s.k!=='done')RS.t+=dt;
 const total=stepSecs(s),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let target={...RB},orb=.72;
 if(s.k==='breath'){const B=RBREATH[s.id],cyc=B.ph.reduce((a,p)=>a+p[2],0),tc=RS.t%cyc;let acc=0,prev=B.ph[B.ph.length-1][3];for(const [id,label,len,to] of B.ph){if(tc<acc+len){const f=ease((tc-acc)/len);orb=lerp(prev,to,f);const left=Math.ceil(acc+len-tc);$('#rPh').textContent=label;$('#rPh').dataset.n=left;el.dataset.ph=id;break}acc+=len;prev=to}
  RS.breath=orb;const b=(orb-.6)/.4;target={...RB,shrug:b*2.2,la:-12-b*8,ra:12+b*8,head:-b*2}}
 else if(s.k==='stretch'){const T=RSTRETCH[s.id],tc=RS.t%T.loop,K=T.k;let a=K[K.length-1],bk=null;for(let j=0;j<K.length;j++){if(K[j][0]<=tc)a=K[j];else{bk=K[j];break}}const nx=bk||[T.loop,K[0][1]];const f=nx[0]>a[0]?ease((tc-a[0])/(nx[0]-a[0])):1;
  const pa={...RB,...a[1]},pb={...RB,...nx[1]};for(const key in RB)target[key]=lerp(pa[key],pb[key],f);const cue=[...K].reverse().find(x=>x[0]<=tc&&x[2]);if(cue&&$('#rSub').textContent!==cue[2])$('#rSub').textContent=cue[2];$('#rPh').dataset.n=Math.max(0,Math.ceil(total-RS.t));orb=.78}
 else if(s.k==='eyes'){target={...RB,head:0,la:-8,ra:8};$('#rPh').dataset.n=Math.max(0,Math.ceil(total-RS.t));orb=.74}
 /* the figure eases toward its target every frame, so every change of pose is smooth */
 const k=reduce?1:1-Math.exp(-dt*7);for(const key in RB)RS.pose[key]=lerp(RS.pose[key],target[key],k);const P=rigPaths(RS.pose);
 $('#rfT').setAttribute('d',P.torso);$('#rfA').setAttribute('d',P.arms);$('#rfL').setAttribute('d',P.legs);$('#rfHd').setAttribute('cx',P.head[0].toFixed(2));$('#rfHd').setAttribute('cy',P.head[1].toFixed(2));
 const O=$('#rO');O.style.transform=`scale(${(reduce?.8:orb).toFixed(4)})`;const pr=$('#rP');if(pr&&total)pr.style.strokeDashoffset=(1-Math.min(1,RS.t/total)).toFixed(4);
 if(total&&RS.t>=total&&!RS.paused)resetNext();window._rraf=requestAnimationFrame(resetLoop)}
function resetDone(){const el=$('#rst');if(!el||!RS)return;const secs=Math.round((Date.now()-RS.t0)/1000),r=S.focus.run,tips=[...RTIPS].sort(()=>Math.random()-.5).slice(0,2);
 (S.resets=S.resets||[]).push({at:Date.now(),secs,steps:RS.steps.filter(x=>x.id).map(x=>x.id)});if(S.resets.length>500)S.resets=S.resets.slice(-400);led('break','Guided reset',{sub:`${Math.max(1,Math.round(secs/60))} min · ${RS.steps.filter(x=>x.id).map(x=>(RBREATH[x.id]||RSTRETCH[x.id]).n.toLowerCase()).join(', ')}`});save();
 el.dataset.k='done';$('#rN').textContent=`${Math.max(1,Math.round(secs/60))} min well spent`;$('#rPh').textContent='You are reset.';delete $('#rPh').dataset.n;$('#rSub').innerHTML=`${tips.map(t=>`<span>${esc(t)}</span>`).join('')}`;
 el.querySelector('.rctl').innerHTML=`<button class="rbtn" id="rBk">${r?`${ic('focus',2)} Back to the timer${r.phase!=='work'?` · ${mmss(leftMs(r))} left`:''}`:`${ic('check',2)} Done`}</button>`;$('#rBk').onclick=closeReset;
 $$('#rst .rdots i').forEach(d=>d.className='d');RS.pose={...RS.pose};RS.steps[RS.i]={k:'done'};burstSoft()}
function burstSoft(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const o=$('#rO');if(o){o.classList.add('bloom');setTimeout(()=>o&&o.classList.remove('bloom'),1200)}}
function closeReset(){cancelAnimationFrame(window._rraf);const el=$('#rst');RS=null;document.body.classList.remove('rston');if(el){el.classList.add('out');setTimeout(()=>el.remove(),380)}if(!S.focus.zen)wakeOff();if(route.k==='focus')render()}
/* a quiet invitation whenever a break is on: on the Focus page and as a small pill in Deep mode */
function resetCard(){const r=S.focus.run;if(!r||r.phase==='work')return'';return`<button class="card rcta" onclick="openReset('focus')"><span class="rcfig">${figure('rest',{acc:'var(--break)',sw:2.6})}</span><div class="grow"><div class="lab" style="--lc:var(--break)">${ic('coffee',2)}<span>Guided reset · 2 min</span></div><b>Breathe, stretch, look far away</b><div class="sub sm">A fresh mix each break. Gets your focus back.</div></div>${ic('arrow')}</button>`}
function zenResetPill(r){const z=$('#zen');if(!z)return;let p=$('#zRs');const show=r&&r.phase!=='work'&&!z.classList.contains('done')&&window._zrsOff!==r.round+r.phase;
 if(show&&!p){p=document.createElement('button');p.id='zRs';p.className='zrs';p.innerHTML=`${ic('coffee',2)}<span>Guided reset</span><i aria-hidden="true">${ic('chevr',2)}</i>`;p.onclick=e=>{e.stopPropagation();openReset('zen')};z.appendChild(p);requestAnimationFrame(()=>p.classList.add('in'))}
 else if(!show&&p){p.classList.remove('in');setTimeout(()=>p&&p.remove(),400)}}
