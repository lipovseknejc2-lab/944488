/* ============ PULSE: a 40-second motivation check with a diagnosis and what to do ============
   Built on established research:
   - Temporal Motivation Theory (Steel, 2007): motivation = expectancy x value / (impulsiveness x delay).
   - Self-Determination Theory (Deci and Ryan, 2000): autonomy, competence and relatedness; amotivation.
   - Kinds of amotivation (Pelletier et al., 1999; Green-Demers et al., 2008): doubting ability, low energy,
     low value, an unappealing or unclear task.
   - Core affect circumplex (Russell, 1980): how pleasant and how activated you feel; the wheel's rings are intensity.
   - What helps: implementation intentions (Gollwitzer, 1999), temptation bundling (Milkman et al., 2014),
     daylight, food and short breaks for energy, expressive writing for worry, working alongside others. */
/* colours walk around the wheel: warm and bright at the top, cool and calm on the right, muted at the bottom, sharp on the left */
const PWHEEL=[['Excited',.7,.8,'var(--yellow)'],['Determined',.85,.45,'var(--accent)'],['Content',.75,-.2,'var(--green)'],['Calm',.5,-.6,'var(--blue)'],
 ['Tired',-.4,-.85,'#8b8798'],['Bored',-.7,-.4,'var(--violet)'],['Frustrated',-.75,.45,'var(--red)'],['Anxious',-.6,.8,'#c95b8b']];
const PRINGS=['A little','Quite','Very'];
const PENERGY=[['Drained',0],['Low',.33],['Okay',.66],['Charged',1]];
/* id, statement; the last value says whether "Yes" points to a problem */
const PQS=[['value','What I have to do today matters to me.',false],['comp','I feel able to do it well.',false],['clear','I know exactly what my first step is.',false],
 ['delay','The deadline still feels far away.',true],['distract','Other things keep pulling at my attention.',true],['pressure','I am doing it because I have to, not because I chose to.',true],
 ['alone','I feel alone with it.',true],['worry','I am worried about how it will turn out.',true]];
const PCAUSES={
 energy:{t:'Your body is low on fuel',d:'Motivation needs energy first. When you are tired, every task feels heavier than it is.',r:[['Get ten minutes of daylight','A short walk outside or by a window wakes the body faster than coffee.',''],['Drink water and eat something small','Thirst and low blood sugar feel like low motivation.',''],['Start tiny: one 15-minute focus','Short sessions work best when energy is low.','focus15']]},
 value:{t:'It does not feel worth it right now',d:'When a task feels pointless, the mind will not spend effort on it.',r:[['Write one line on why it matters','Tie it to something you care about: a goal, a person, your future self.','note:Why this matters'],['Pair it with something you enjoy','Music, a favourite drink or a nicer place. This is called temptation bundling.',''],['Start with the most interesting part','Begin where your curiosity is.','focus15']]},
 comp:{t:'You doubt you can do it well',d:'Low confidence quietly switches motivation off. A quick win switches it back on.',r:[['Shrink it to an easy first win','Pick a part you can finish in ten minutes.','focus15'],['Remember a time it went well','You have done hard things before; write one down.','note:A time it went well'],['Ask someone for a hint','A small hint can unlock the whole task.','chat']]},
 clear:{t:'The next step is unclear',d:'A fuzzy task feels like a mountain. A clear first step feels like a stair.',r:[['Write the very next physical step','For example: open the document and write the title.','note:Next step'],['Make an if-then plan','"When it is 16:00, I will start the first step." Plans like this make follow-through far more likely.','agenda'],['Split it into three small tasks','Three small tasks are easier to start than one big one.','task']]},
 delay:{t:'The deadline feels too far away',d:'Distant deadlines feel unreal, so something sooner always wins.',r:[['Make a nearer deadline','Put one part of it in today\'s agenda.','agenda'],['Tell someone your plan','A small promise makes it feel real.','chat'],['Start for just 15 minutes','Starting is the hardest part. Continuing is easier.','focus15']]},
 distract:{t:'Your attention keeps getting pulled away',d:'Being easily pulled away is the strongest single cause of putting things off.',r:[['Turn on Deep mode','Only the timer stays on the screen.','zen'],['Put your phone in another room','Out of sight, out of mind.',''],['Work one 25-minute round','A clear end makes it easier to ignore the rest.','focus']]},
 pressure:{t:'It feels forced, not chosen',d:'"Have to" motivation runs out fast. "Choose to" lasts much longer.',r:[['Choose how and when','Pick your own time, place and order. A sense of choice brings drive back.','agenda'],['Find your own reason','Finish the sentence: I choose to do this because…','note:I choose to do this because'],['Make one part your own','Add a small personal touch or challenge.','']]},
 alone:{t:'You feel alone with it',d:'People are built to work together. Doing it alone drains drive.',r:[['Work next to someone','A quiet session side by side helps, even online.','groups'],['Message your group','Say what you are working on.','chat'],['Share your plan for today','Let others see your agenda.','share']]},
 worry:{t:'Worry is getting in the way',d:'Fear of a bad result makes avoiding the task feel safer.',r:[['Write the worry down for two minutes','Putting it on paper frees up your thinking.','note:What I am worried about'],['Lower the bar for the first draft','The first version is allowed to be rough.',''],['Breathe slowly for one minute','In for four, hold for four, out for six.','']]},
 good:{t:'You are in a good place',d:'Your drive is strong today. Protect it.',r:[['Start the most important task now','Use the wave while it is here.','focus'],['Turn on Deep mode','Keep distractions out.','zen'],['Plan tomorrow\'s first step','So tomorrow starts this easily too.','agenda']]}};
const PBAND=m=>m>=75?['Driven','var(--green)']:m>=55?['Steady','var(--blue)']:m>=35?['Wavering','var(--yellow)']:['Low','var(--red)'];
/* the score: expectancy x value over impulsiveness x delay, plus energy, mood and connection */
function pulseScore(x){const A=x.ans||{},q=k=>(A[k]??1)/2,f=PWHEEL[x.sec]||PWHEEL[2],int=[.45,.75,1][x.ring]??.75,v=f[1]*int,a=f[2]*int,en=x.energy??.66;
 const val=q('value'),comp=q('comp'),clear=q('clear'),delay=q('delay'),dis=q('distract'),pres=q('pressure'),alone=q('alone'),worry=q('worry');
 const expct=.6*comp+.4*clear,value=val*(1-.35*pres),tmt=(.15+.85*expct)*(.15+.85*value)/((.5+dis)*(.5+delay)),tmtN=clamp((Math.log(tmt)-Math.log(.01))/(Math.log(4)-Math.log(.01)),0,1);
 const aff=clamp(.5+.4*v+.1*a*(v>=0?1:-.6),0,1),m=Math.round(100*clamp(.45*tmtN+.25*en+.2*aff+.1*(1-.5*alone-.5*worry),0,1));
 const nm=f[0],bonus={energy:nm==='Tired'?.3:0,value:nm==='Bored'?.3:0,worry:nm==='Anxious'?.3:0,comp:nm==='Frustrated'?.15:0,clear:nm==='Frustrated'?.15:0};
 const C={energy:1-en,value:1-val,comp:1-comp,clear:1-clear,delay,distract:dis,pressure:pres,alone,worry};
 return{m,causes:Object.entries(C).map(([k,s])=>({k,s:Math.round(clamp(s+(bonus[k]||0)*int,0,1.3)*100)/100})).sort((a,b)=>b.s-a.s).filter(c=>c.s>=.5).slice(0,3).map(c=>c.k)}}
/* a day's motivation: every check counts, the latest ones count most, so it corrects itself during the day */
const pulsesOn=d=>(S.pulse||[]).filter(p=>p.d===d).sort((a,b)=>a.at-b.at);
function dayPulse(d){const L=pulsesOn(d);if(!L.length)return null;let w=0,s=0;L.forEach((p,i)=>{w+=i+1;s+=p.m*(i+1)});return Math.round(s/w)}
/* the wheel: eight feelings around, three rings from a little (inside) to very (outside).
   Rounded tiles with even gaps on a glass disc; the names curve along the outer ring and always read upright. */
function wheelSVG(sel){const cx=150,cy=150,R=[52,86,117,150],CR=4.5,GAP=3,P=(r,a)=>[(cx+r*Math.sin(a)).toFixed(2),(cy-r*Math.cos(a)).toFixed(2)];
 const tile=(r0,r1,a0,a1)=>{const o=r1-CR,i=r0+CR,dO=(CR+GAP/2)/o,dI=(CR+GAP/2)/i,[x0,y0]=P(o,a0+dO),[x1,y1]=P(o,a1-dO),[x2,y2]=P(i,a1-dI),[x3,y3]=P(i,a0+dI);
  return`M${x0} ${y0}A${o} ${o} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${i} ${i} 0 0 0 ${x3} ${y3}Z`};
 let defs='',g='',lab='';
 PWHEEL.forEach(([n,,,c],i)=>{const a0=(i-.5)*Math.PI/4,a1=(i+.5)*Math.PI/4,deg=i*45,flip=deg>90&&deg<270,rm=(R[2]+R[3])/2;
  for(let r=0;r<3;r++){const on=sel&&sel.sec===i&&sel.ring===r;g+=`<path class="wc r${r} ${on?'on':''}" data-s="${i}" data-r="${r}" d="${tile(R[r],R[r+1],a0,a1)}" style="--c:${c}"><title>${PRINGS[r]} ${n.toLowerCase()}</title></path>`}
  const [sx,sy]=P(rm,flip?a1:a0),[ex,ey]=P(rm,flip?a0:a1);defs+=`<path id="pwl${i}" d="M${sx} ${sy}A${rm} ${rm} 0 0 ${flip?0:1} ${ex} ${ey}"/>`;
  lab+=`<text class="wl ${sel&&sel.sec===i?'on':''}" dy="3.6"><textPath href="#pwl${i}" startOffset="50%" text-anchor="middle">${n}</textPath></text>`});
 const f=sel&&PWHEEL[sel.sec];
 return`<svg class="pwheel ${f?'has':''}" viewBox="-6 -6 312 312" role="group" aria-label="How do you feel"><defs>${defs}<radialGradient id="pwg" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="var(--glt)"/><stop offset="1" stop-color="var(--card2)"/></radialGradient></defs>
 <circle cx="150" cy="150" r="155" class="wbg"/>${g}${lab}<circle cx="150" cy="150" r="46" class="wcen"/>${f?`<circle cx="150" cy="150" r="46" class="wcring" style="--c:${f[3]}"/>`:''}
 <text x="150" y="143" text-anchor="middle" dominant-baseline="central" class="wct ${f?(f[0].length>8?'wctl':''):'wct0'}">${f?f[0]:'Tap a'}</text><text x="150" y="161" text-anchor="middle" dominant-baseline="central" class="wcs">${f?PRINGS[sel.ring]:'feeling'}</text></svg>`}
const batt=v=>`<svg class="pbatt" viewBox="0 0 40 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="31" height="16" rx="4"/><path d="M36.5 9V13"/>${v>0?`<rect x="5" y="6" width="${Math.max(3,25*v).toFixed(1)}" height="10" rx="2" fill="currentColor" stroke="none"/>`:''}</svg>`;
/* the check itself: wheel, energy, eight statements, then the diagnosis */
let PS=null;
function openPulse(){PS={step:0,sec:null,ring:null,energy:null,ans:{},qi:0,t0:Date.now()};
 openModal(`<div class="sheet psheet" role="dialog" aria-modal="true" aria-label="Pulse"><div class="sheet-h"><div><div class="lab" style="--lc:var(--accent)">${ic('pulse',2)}<span>Pulse · about 40 seconds</span></div><h2 id="pTitle">How do you feel?</h2></div><button class="icon-btn" data-close aria-label="Close">${ic('close')}</button></div>
 <div class="pbar pprog"><i id="pProg" style="width:0%"></i></div><div id="pBody"></div></div>`);pulseStep()}
function pulseStep(){const b=$('#pBody');if(!b||!PS)return;const total=2+PQS.length,done=PS.step===0?0:PS.step===1?1:2+PS.qi;$('#pProg').style.width=Math.round(done/total*100)+'%';
 if(PS.step===0){$('#pTitle').textContent='How do you feel?';b.innerHTML=`<p class="sub psub">Pick the feeling, then how strong it is: inside is a little, outside is very.</p><div class="pwrap">${wheelSVG(PS.sec!=null?PS:null)}</div><button class="lnk pjust" id="pJust">Just log a feeling instead</button>`;
  b.querySelector('.pwheel').onclick=e=>{const c=e.target.closest('[data-s]');if(!c)return;PS.sec=+c.dataset.s;PS.ring=+c.dataset.r;b.querySelector('.pwrap').innerHTML=wheelSVG(PS);try{navigator.vibrate&&navigator.vibrate(6)}catch(x){}clearTimeout(PS._t);PS._t=setTimeout(()=>{if(PS&&PS.step===0){PS.step=1;pulseStep()}},520)};
  $('#pJust').onclick=()=>{closeSheet();setTimeout(feelSheet,230)};return}
 if(PS.step===1){$('#pTitle').textContent='How is your energy?';b.innerHTML=`<p class="sub psub">Your body, not your mood.</p><div class="pen">${PENERGY.map(([n,v],i)=>`<button class="card pent" data-e="${v}" style="--i:${i}">${batt(v)}<b>${n}</b></button>`).join('')}</div><button class="lnk pback" id="pBk">${ic('chevl')} Back</button>`;
  $$('.pent').forEach(x=>x.onclick=()=>{PS.energy=+x.dataset.e;x.classList.add('on');setTimeout(()=>{if(PS){PS.step=2;PS.qi=0;pulseStep()}},260)});$('#pBk').onclick=()=>{PS.step=0;pulseStep()};return}
 if(PS.step===2){const [k,t]=PQS[PS.qi];$('#pTitle').textContent='Quick truths';const cur=PS.ans[k];
  b.innerHTML=`<p class="sub psub">${PS.qi+1} of ${PQS.length} · go with your first answer.</p><div class="card pq" key="${k}"><p>${esc(t)}</p></div><div class="pans">${[['No',0],['A bit',1],['Yes',2]].map(([n,v])=>`<button class="pa ${cur===v?'on':''}" data-v="${v}">${n}</button>`).join('')}</div><button class="lnk pback" id="pBk">${ic('chevl')} Back</button>`;
  $$('.pa').forEach(x=>x.onclick=()=>{PS.ans[k]=+x.dataset.v;x.classList.add('on');setTimeout(()=>{if(!PS)return;if(PS.qi<PQS.length-1){PS.qi++;pulseStep()}else pulseDone()},180)});
  $('#pBk').onclick=()=>{if(PS.qi>0)PS.qi--;else PS.step=1;pulseStep()};return}}
function pulseDone(){const x={sec:PS.sec,ring:PS.ring,energy:PS.energy,ans:{...PS.ans}},sc=pulseScore(x),f=PWHEEL[x.sec],rec={id:uid(),at:Date.now(),d:today(),m:sc.m,feel:f[0],ring:x.ring,sec:x.sec,energy:x.energy,ans:x.ans,causes:sc.causes,secs:Math.round((Date.now()-PS.t0)/1000)};
 (S.pulse=S.pulse||[]).push(rec);if(S.pulse.length>2000)S.pulse=S.pulse.slice(-1500);use('pulse');const top=sc.causes[0]||'good';led('pulse',`Motivation ${sc.m}% · ${PCAUSES[top].t}`,{sub:`${PRINGS[x.ring]} ${f[0].toLowerCase()}`,ref:'pulse'});save();PS={step:3};
 $('#pProg').style.width='100%';$('#pTitle').textContent='Your pulse';$('#pBody').innerHTML=pulseResult(rec,true);countUp($('#pBody'));render()}
/* the result: the number, what is behind it, and what to do next */
function pulseResult(rec,fresh){const [band,bc]=PBAND(rec.m),top=rec.causes.length?rec.causes:['good'],day=dayPulse(rec.d),n=pulsesOn(rec.d).length;
 return`<div class="pres"><div class="presr">${ring(rec.m/100,bc,124,11,'')}<div class="presn"><b data-n="${rec.m}">${rec.m}</b><span>%</span></div></div><div class="presb" style="--bc:${bc}">${band}</div>
 <p class="sub center" style="margin:6px 0 0">${n>1?`Today so far: <b>${day}%</b> from ${n} checks`:'Check again later and today\'s number corrects itself.'}</p></div>
 <div class="card pdiag" style="--dc:${PBAND(rec.m)[1]}"><div class="lab" style="--lc:var(--accent)">${ic('sparkle',2)}<span>Diagnosis</span></div><h3>${esc(PCAUSES[top[0]].t)}</h3><p>${esc(PCAUSES[top[0]].d)}</p>
 ${top.length>1?`<div class="pother">${top.slice(1).map(k=>`<span class="pill">${esc(PCAUSES[k].t)}</span>`).join('')}</div>`:''}</div>
 <div class="flabel">What to do now</div><div class="precs">${PCAUSES[top[0]].r.map(([t,d,a],i)=>`<div class="card prec" style="--i:${i}"><span class="precn">${i+1}</span><div class="grow"><b>${esc(t)}</b><p>${esc(d)}</p></div>${a?`<button class="btn sm" onclick="pulseAct('${a.replace(/'/g,'')}')">${pulseActLabel(a)}</button>`:''}</div>`).join('')}</div>
 ${fresh?`<button class="btn primary full" data-close>Done</button>`:''}<details class="phow"><summary>How Pulse works</summary><p>Pulse scores what research links to motivation: how much the task matters to you and whether you feel able to do it, against distraction and how far away the deadline feels (Temporal Motivation Theory). It also weighs your energy, your mood on the wheel, feeling forced or alone (Self-Determination Theory) and worry. The biggest gaps become your diagnosis. It is a reflection, not a medical test.</p></details>`}
const pulseActLabel=a=>a==='focus15'?'Start 15 min':a==='focus'?'Start focus':a==='zen'?'Deep mode':a.startsWith('note')?'Write it':a==='agenda'?'Plan it':a==='task'?'Add tasks':a==='chat'?'Message':a==='groups'?'Groups':a==='share'?'Share':'Do it';
function pulseAct(a){closeSheet();setTimeout(()=>{if(a==='focus15'){S.focus.mode='quick';save();go('focus')}else if(a==='focus'){S.focus.mode='pomo';save();go('focus')}else if(a==='zen')enterZen();
 else if(a.startsWith('note')){const n=newNote({title:a.split(':')[1]||'Note',body:''});_editMode[n.id]=true;go('note:'+n.id)}else if(a==='agenda')agendaForm(today());else if(a==='task')taskQuick();
 else if(a==='chat')go('chat');else if(a==='groups')go('groups');else if(a==='share')shareTo(agendaAtt(today()))},230)}
/* on Today: the day's motivation, or an invitation to check */
function pulseCard(d){const v=dayPulse(d),L=pulsesOn(d);if(v==null)return d===today()?`<button class="card pcta" onclick="openPulse()"><span class="pci">${ic('pulse',2)}</span><div class="grow"><div class="lab" style="--lc:var(--accent)">${ic('pulse',2)}<span>Pulse</span></div><b>How is your drive today?</b><div class="sub">A 40-second check with a diagnosis</div></div>${ic('arrow')}</button>`:'';
 const [band,bc]=PBAND(v),last=L[L.length-1],top=last.causes[0]||'good',wk=[];for(let i=6;i>=0;i--){const x=new Date(d+'T12:00');x.setDate(x.getDate()-i);wk.push(dayPulse(isoD(x)))}
 return`<a class="card pday" href="#pulse" style="--bc:${bc}" onclick="window._pday='${d}'">${ring(v/100,bc,64,7,v+'%')}<div class="grow"><div class="lab" style="--lc:${bc}">${ic('pulse',2)}<span>Motivation · ${band}</span></div><b>${esc(PCAUSES[top].t)}</b><div class="sub">${plural(L.length,'check')} · last at ${tHM(last.at)}</div></div><div class="pspark" aria-hidden="true">${wk.map((x,i)=>`<i style="height:${x==null?6:Math.max(8,x*.36)}px;${x==null?'':`background:${PBAND(x)[1]}`}" class="${i===6?'now':''}"></i>`).join('')}</div></a>`}
/* the Pulse page: any day, its checks, and the last two weeks */
function pPulse(){let d=window._pday||selDay||today();if(d>today())d=today();const v=dayPulse(d),L=pulsesOn(d),days=[];for(let i=13;i>=0;i--){const x=new Date(d+'T12:00');x.setDate(x.getDate()-i);const iso=isoD(x),p=dayPulse(iso);days.push({l:i%2?'':x.getDate()+'.',v:p||0,c:p==null?'var(--track)':PBAND(p)[1]})}
 const prev=new Date(d+'T12:00');prev.setDate(prev.getDate()-1);const next=new Date(d+'T12:00');next.setDate(next.getDate()+1);const nx=isoD(next);
 return`<div class="page">${header('Motivation',{sub:'Pulse',back:'today',right:`<button class="btn primary sm" onclick="openPulse()">${ic('pulse',2)} Check</button>`})}
 <div class="pday-nav"><button class="icon-btn sm" onclick="window._pday='${isoD(prev)}';render()" aria-label="Previous day">${ic('chevl')}</button><b>${fmtDay(new Date(d+'T12:00').getTime())}</b><button class="icon-btn sm" ${nx>today()?'disabled':''} onclick="window._pday='${nx}';render()" aria-label="Next day">${ic('chevr')}</button></div>
 ${v==null?empty('think',d===today()?'No pulse yet today':'No pulse that day',d===today()?'Forty seconds to see how motivated you are, why, and what to do about it.':'Use the arrows to see other days.',d===today()?`<button class="btn primary" onclick="openPulse()">Check my pulse</button>`:''):`${pulseResult(L[L.length-1],false).replace(/<b data-n="\d+">\d+<\/b>/,`<b data-n="${v}">${v}</b>`).replace(/Today so far: <b>\d+%<\/b> from \d+ checks|Check again later and today's number corrects itself\./,`${plural(L.length,'check')} this day, the latest counts most`)}
 <section><div class="sh"><h2>Checks</h2><span class="sub">${L.length}</span></div><div class="card list">${L.slice().reverse().map(p=>`<div class="li" style="cursor:default"><span class="tlh" style="padding:0;width:44px">${tHM(p.at)}</span><div class="grow"><div class="t">${p.m}% · ${esc(PRINGS[p.ring]||'')} ${esc((p.feel||'').toLowerCase())}</div><div class="sub sm">${esc(PCAUSES[p.causes[0]||'good'].t)}</div></div><span class="pill" style="color:${PBAND(p.m)[1]}">${PBAND(p.m)[0]}</span></div>`).join('')}</div></section>`}
 <section><div class="sh"><h2>Two weeks</h2><span class="sub">daily motivation</span></div><div class="card">${barChart(days,{h:110,fmt:x=>x+'%'})}</div></section></div>`}
