/* ============ RESET: a guided two-minute break (breathing, stretches, distant gaze) ============
   Built on research:
   - Cyclic sighing (Balban et al., Cell Reports Medicine, 2023): a double inhale and a long exhale; five minutes a day
     improved mood and lowered breathing rate more than mindfulness meditation.
   - Slow breathing near six breaths a minute raises heart-rate variability and calm (Lehrer and Gevirtz, 2014;
     Zaccaro et al., 2018). A longer exhale than inhale shifts the body toward rest.
   - Micro-breaks of ten minutes or less raise vigour and lower fatigue, most of all with movement (Albulescu et al., 2022).
   - The 20-20-20 rule against digital eye strain; a short view of green or sky restores attention (Lee et al., 2015).
   - Breaks spent on the phone restore less than phone-free breaks (Kang and Kurtzberg, 2019).
   Each reset mixes one breathing technique, two stretches and a far-away look, shuffled so it stays fresh.
   Between stretches a short "Just breathe" pause keeps the breath slow (4 in, 6 out), and stretches move with the breath.
   Soft tones mark each new step, the moment to look back after the far look, and the end. */
const RBREATH={
 sigh:{n:'Cyclic sighing',d:'Two breaths in through the nose, one long breath out through the mouth. The quickest way to calm down.',ph:[['in','Breathe in',2,.86],['in2','In a little more',1,1],['out','Long breath out',6,.6]],cycles:5},
 slow:{n:'Slow breathing',d:'About six breaths a minute. Even and unhurried; it steadies your heart rhythm.',ph:[['in','Breathe in',5,1],['out','Breathe out',5,.6]],cycles:5},
 box:{n:'Box breathing',d:'Four counts each side of the box. Calm and alert at the same time.',ph:[['in','Breathe in',4,1],['hold','Hold',4,1],['out','Breathe out',4,.6],['hold','Hold',4,.6]],cycles:3},
 exhale:{n:'Long exhale',d:'Breathing out for longer than you breathe in tells your body it is safe to rest.',ph:[['in','Breathe in',4,1],['out','Breathe out slowly',7,.6]],cycles:4}};
/* the easy breath between activities: only the circle, in and out */
const RCALM={n:'Just breathe',secs:20,d:'Follow the circle. Nothing else to do.',ph:[['in','In',4,1],['out','Out',6,.6]]};
/* ---- the body: real proportions, with shoulders, hips, elbows, knees, hands and feet ----
   Angles in degrees: 0 points down, +90 points to the right of the screen (in side view, forwards).
   side: 0 front view, 1 side view (facing right). lean: bend of the spine (sideways in front view, forwards in side view).
   af: how much the arms follow the upper body. hs: hip shift. hx: head glide (chin tuck). sx: shoulders forwards or back. o: the breathing circle. */
const RB={side:0,lean:0,af:1,hs:0,head:0,hx:0,shrug:0,sx:0,la:-9,le:6,ra:9,re:-6,ll:-3,lk:1,rl:3,rk:-1,rise:0,o:.74};
const RANG=['lean','head','la','le','ra','re','ll','lk','rl','rk'];
const RL={ua:13,fa:12,hd:3.4,th:18,sh:17,ft:5.2,tor:24,shw:7.4,hpw:4.4,nk:3.4,hr:5.6};
const SIDE={side:1,la:-3,le:10,ra:3,re:10,ll:-2,lk:3,rl:4,rk:-2};
/* two-joint inverse kinematics: the angles that put a hand at (dx,dy) from the shoulder, elbow pointing out */
function rIK(dx,dy,out){const a=RL.ua,b=RL.fa,d=Math.min(a+b-.01,Math.hypot(dx,dy)),D=180/Math.PI,phi=Math.atan2(dx,dy)*D,al=Math.acos((a*a+d*d-b*b)/(2*a*d))*D;
 const opts=[phi+al,phi-al].map(a1=>{const ex=Math.sin(a1/D)*a,ey=Math.cos(a1/D)*a,fa=Math.atan2(dx-ex,dy-ey)*D;let a2=((fa-a1)%360+540)%360-180;return{a1,a2,ex}});return opts.sort((p,q)=>out<0?p.ex-q.ex:q.ex-p.ex)[0]}
/* the diamond: hands together above the head, elbows wide */
const DIA=(()=>{const L=rIK(RL.shw-2.4,-19.6,-1);return{la:L.a1,le:L.a2,ra:-L.a1,re:-L.a2,ll:-6,rl:6,lk:1,rk:-1}})();
const RUP={la:-172,le:-2,ra:172,re:2};
const RSD=(o)=>({...SIDE,...o});
const RSTRETCH={
 neck:{n:'Neck release',secs:30,loop:15,k:[[0,{},'Sit or stand tall. Let your shoulders drop.'],[3,{head:-40,shrug:-.6,o:.6},'Breathe out and tip your left ear toward your left shoulder.'],[6,{head:-40,shrug:-.6,o:.62}],[7.5,{o:1},'Breathe in, back to the middle.'],[10.5,{head:40,shrug:-.6,o:.6},'Breathe out, now to the right.'],[13.5,{head:40,shrug:-.6,o:.62}]]},
 shoulders:{n:'Shoulder rolls',secs:30,loop:5,k:[[0,RSD({o:.7}),'Roll your shoulders up, back and down. Big, slow circles.'],[1.3,RSD({shrug:3.2,sx:.8,o:1})],[2.6,RSD({shrug:2,sx:-2.8,o:.9})],[3.8,RSD({shrug:-.3,sx:-1.6,o:.6})]]},
 reach:{n:'Reach up',secs:30,loop:10,k:[[0,{o:.6},'Breathe in and sweep your arms up.'],[3,{...RUP,o:1}],[4,{...RUP,rise:4,o:1},'Rise onto your toes. Stretch every finger.'],[6,{...RUP,rise:4,o:1}],[9.4,{o:.6},'Breathe out and float your arms down.']]},
 side:{n:'Side bend',secs:34,loop:17,k:[[0,{...DIA,o:.6},'Arms overhead in a diamond, palms together, elbows wide.'],[2.5,{...DIA,o:1},'Breathe in and grow tall.'],[5.5,{...DIA,lean:-26,hs:3.4,o:.6},'Breathe out and bend to the left. Long through the right side.'],[7.5,{...DIA,lean:-26,hs:3.4,o:.62}],[10,{...DIA,o:1},'Breathe in, back to the middle.'],[13,{...DIA,lean:26,hs:-3.4,o:.6},'Breathe out and bend to the right.'],[15,{...DIA,lean:26,hs:-3.4,o:.62}]]},
 chest:{n:'Chest opener',secs:30,loop:10,k:[[0,{o:.6},'Undo the desk hunch.'],[2.5,{la:-90,le:0,ra:90,re:0,o:1},'Breathe in and open your arms wide.'],[5,{la:-90,le:-92,ra:90,re:92,head:0,o:.6},'Breathe out. Bend your elbows up and squeeze your shoulder blades together.'],[7.5,{la:-90,le:-92,ra:90,re:92,o:.62}],[9.2,{o:.66}]]},
 calves:{n:'Calf raises',secs:30,loop:5,k:[[0,RSD({o:.6}),'Hold a desk if you need balance.'],[1.6,RSD({rise:5.5,o:1}),'Breathe in and rise onto your toes.'],[2.5,RSD({rise:5.5,o:1})],[4.4,RSD({o:.6}),'Breathe out and lower slowly.']]},
 fold:{n:'Forward fold',secs:34,loop:13,k:[[0,RSD({o:.6}),'Stand with soft knees.'],[2.6,RSD({la:176,ra:176,le:0,re:0,o:1}),'Breathe in and reach up tall.'],[6,RSD({lean:80,af:0,hs:-5,la:2,ra:4,le:0,re:0,ll:9,lk:-15,rl:11,rk:-15,head:14,o:.6}),'Breathe out. Hinge at the hips and let your arms and head hang.'],[9,RSD({lean:82,af:0,hs:-5,la:2,ra:4,le:0,re:0,ll:9,lk:-15,rl:11,rk:-15,head:16,o:.62})],[12.4,RSD({o:.8}),'Roll up slowly. Your head comes up last.']]},
 squat:{n:'Chair squats',secs:30,loop:8.5,k:[[0,RSD({o:1}),'Feet hip-width apart. Breathe in.'],[3,RSD({ll:76,lk:-114,rl:78,rk:-114,lean:34,af:0,la:86,ra:88,le:0,re:0,head:-8,o:.6}),'Breathe out and sit back, as if into a chair. Arms forward.'],[4.6,RSD({ll:76,lk:-114,rl:78,rk:-114,lean:34,af:0,la:86,ra:88,le:0,re:0,head:-8,o:.62})],[7.8,RSD({o:1}),'Breathe in and stand up tall.']]},
 circles:{n:'Arm circles',secs:32,loop:8,k:[[0,RSD({la:0,ra:4,le:0,re:0,o:.6}),'Big, slow arm circles. Breathe in as they rise.'],[2,RSD({la:90,ra:94,le:0,re:0,o:.8})],[4,RSD({la:180,ra:184,le:0,re:0,o:1}),'Breathe out as they sweep back and down.'],[6,RSD({la:270,ra:274,le:0,re:0,o:.8})],[8,RSD({la:360,ra:364,le:0,re:0,o:.6})]]},
 chin:{n:'Chin tucks',secs:30,loop:6,k:[[0,RSD({o:1}),'Look straight ahead. Breathe in.'],[2,RSD({hx:-3.6,head:-5,o:.6}),'Breathe out and glide your chin straight back. Hold.'],[3.8,RSD({hx:-3.6,head:-5,o:.62})],[5.2,RSD({o:.9}),'Release. It undoes the forward head of screen time.']]}};
const REYES={n:'Look far away',secs:20,d:'Find something at least six metres away, ideally sky or green. A soft chime tells you when to look back.'};
const RTIPS=['Drink a glass of water.','Leave your phone face down until the timer ends.','If you have time, walk to a window or take the stairs.','Roll your wrists and open your hands a few times.','Notice three sounds around you, then let them go.','Get some daylight on your face if you can.'];
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const lerp=(a,b,t)=>a+(b-a)*t;
/* the figure, drawn from the pose: one curved spine, shoulder and hip lines, two-part arms and legs, hands and feet.
   It stands on the floor by itself: knees bend and the body lowers, heels lift and the body rises. */
function rigPaths(p){const R=Math.PI/180,w=1-p.side,up=a=>[Math.sin(a*R),-Math.cos(a*R)],rt=a=>[Math.cos(a*R),Math.sin(a*R)],f=n=>n.toFixed(2),pt=q=>`${f(q[0])} ${f(q[1])}`;
 const L1=p.lean*.45,L2=p.lean,hipW=RL.hpw*w,G=96;
 const leg=(ox,a1,a2)=>{const k=[ox+Math.sin(a1*R)*RL.th,Math.cos(a1*R)*RL.th],an=[k[0]+Math.sin((a1+a2)*R)*RL.sh,k[1]+Math.cos((a1+a2)*R)*RL.sh];return[k,an]};
 const rp=rt(L1),lh=[-rp[0]*hipW,-rp[1]*hipW],rh=[rp[0]*hipW,rp[1]*hipW],LL=leg(lh[0],p.ll,p.lk),RR=leg(rh[0],p.rl,p.rk);LL.forEach(q=>q[1]+=lh[1]);RR.forEach(q=>q[1]+=rh[1]);
 const ay=Math.max(LL[1][1],RR[1][1]),hy=G-p.rise-ay,ax=(LL[1][0]+RR[1][0])/2,hx0=50+(p.side*-1.6)-ax+p.hs;
 const T=q=>[q[0]+hx0,q[1]+hy],P0=[hx0,hy],u1=up(L1),C=[P0[0]+u1[0]*RL.tor*.5,P0[1]+u1[1]*RL.tor*.5],u2=up(L2),N=[C[0]+u2[0]*RL.tor*.5,C[1]+u2[1]*RL.tor*.5],r2=rt(L2);
 const sb=[N[0]-u2[0]*1.6+u2[0]*p.shrug+r2[0]*p.sx*p.side,N[1]-u2[1]*1.6+u2[1]*p.shrug+r2[1]*p.sx*p.side],ls=[sb[0]-r2[0]*RL.shw*w,sb[1]-r2[1]*RL.shw*w],rs=[sb[0]+r2[0]*RL.shw*w,sb[1]+r2[1]*RL.shw*w];
 const uh=up(L2+p.head),nt=[N[0]+uh[0]*RL.nk,N[1]+uh[1]*RL.nk],hc=[nt[0]+uh[0]*RL.hr+r2[0]*p.hx,nt[1]+uh[1]*RL.hr+r2[1]*p.hx];
 const arm=(o,a1,a2)=>{const A=a1-p.lean*p.af,e=[o[0]+Math.sin(A*R)*RL.ua,o[1]+Math.cos(A*R)*RL.ua],B=A+a2,h=[e[0]+Math.sin(B*R)*RL.fa,e[1]+Math.cos(B*R)*RL.fa],t=[h[0]+Math.sin((B+a2*.15)*R)*RL.hd,h[1]+Math.cos((B+a2*.15)*R)*RL.hd];return`M${pt(o)}L${pt(e)}L${pt(h)}M${pt(h)}L${pt(t)}`};
 const foot=(an,dir)=>{const fl=lerp(3.6,RL.ft,p.side),dx=lerp(dir*3.6,RL.ft,p.side)/fl,drop=Math.min(fl*.95,G+1.4-an[1]),run=Math.sqrt(Math.max(0,fl*fl-drop*drop));return`L${f(an[0]+Math.sign(dx)*run)} ${f(an[1]+drop)}`};
 const legP=(h,K)=>{const k=T(K[0]),a=T(K[1]),hp=T(h);return`M${pt(hp)}L${pt(k)}L${pt(a)}${foot(a,h[0]<0?-1:1)}`};
 const nose=p.side>.05?`M${pt([hc[0]+r2[0]*RL.hr*.96,hc[1]+r2[1]*RL.hr*.96-.4])}l${f(r2[0]*1.5+.2)} ${f(r2[1]*1.5+1)}`:'';
 return{torso:`M${pt(P0)}Q${pt(C)} ${pt(N)}L${pt(nt)}M${pt(ls)}L${pt(rs)}M${pt(T(lh))}L${pt(T(rh))}`,head:hc,nose,far:p.side,
  arms:arm(rs,p.ra,p.re),armF:arm(ls,p.la,p.le),legs:legP(rh,RR),legF:legP(lh,LL)}}
/* soft tones: a bell for each new step, two rising notes to look back, a small chord at the end, and quiet breath cues */
function rAudio(){try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());if(A.state==='suspended')A.resume();return A}catch(e){return null}}
function rTone(fs,{vol=.08,dur=1.6,gap=.18}={}){if(S.settings.resetSound===false)return;const A=rAudio();if(!A)return;try{fs.forEach((fr,i)=>{const t=A.currentTime+.02+i*gap;[[fr,1],[fr*2,.18],[fr*3,.05]].forEach(([q,m])=>{const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.value=q;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*m,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(A.destination);o.start(t);o.stop(t+dur+.05)})})}catch(e){}}
const RSND={step:()=>rTone([528],{vol:.07}),look:()=>{rTone([440,660],{vol:.11,gap:.32,dur:1.8});try{navigator.vibrate&&navigator.vibrate([90,120,90])}catch(e){}},done:()=>rTone([392,494,587,784],{vol:.075,gap:.14,dur:2.2}),in:()=>rTone([330],{vol:.03,dur:1.2}),out:()=>rTone([262],{vol:.026,dur:1.4})};
/* a routine: one breathing technique, then stretches with a short breath between them, a far look, the end */
function buildReset(long){const last=S.settings.lastReset||[],pick=(pool,n)=>{const all=Object.keys(pool),fresh=all.filter(k=>!last.includes(k)),src=(fresh.length>=n?fresh:all).sort(()=>Math.random()-.5);return src.slice(0,n)};
 const b=pick(RBREATH,1)[0],st=pick(RSTRETCH,long?3:2);S.settings.lastReset=[b,...st];
 const mid=[];st.forEach((id,i)=>{if(i)mid.push({k:'calm'});mid.push({k:'stretch',id})});
 return[{k:'breath',id:b},...mid,{k:'eyes'},{k:'done'}]}
const stepSecs=s=>s.k==='breath'?RBREATH[s.id].ph.reduce((a,p)=>a+p[2],0)*RBREATH[s.id].cycles:s.k==='stretch'?RSTRETCH[s.id].secs:s.k==='calm'?RCALM.secs:s.k==='eyes'?REYES.secs:0;
let RS=null;
function openReset(from){const r=S.focus.run,long=!!(r&&r.phase==='long');const steps=buildReset(long);RS={steps,i:0,t:0,paused:false,last:performance.now(),pose:{...RB},from:from||'',t0:Date.now(),breath:0,bph:''};rAudio();
 let el=$('#rst');if(!el){el=document.createElement('div');el.id='rst';document.body.appendChild(el)}el.className='rst';el.setAttribute('role','dialog');el.setAttribute('aria-label','Guided reset');
 const snd=S.settings.resetSound!==false;
 el.innerHTML=`<div class="rtop"><div class="rlab">${ic('coffee',2)}<span>Reset</span></div><div class="rdots">${steps.slice(0,-1).map(s=>`<i class="${s.k==='calm'?'c':''}"></i>`).join('')}</div><div class="rtb"><button class="rx ${snd?'':'off'}" id="rSnd" aria-label="${snd?'Mute tones':'Turn tones on'}">${ic('bell',2)}</button><button class="rx" id="rX" aria-label="Close the reset">${ic('close',2)}</button></div></div>
 <div class="rstage"><svg class="rorb" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="rog" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="var(--break)" stop-opacity=".55"/><stop offset="1" stop-color="var(--break)" stop-opacity=".08"/></radialGradient></defs><circle cx="100" cy="100" r="92" class="rring"/><circle cx="100" cy="100" r="92" class="rfill" id="rO"/><circle cx="100" cy="100" r="96" class="rprog" id="rP" pathLength="1"/></svg>
  <svg class="rfig" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="rffar" id="rfF"><path id="rfAf" d=""/><path id="rfLf" d=""/></g><path id="rfL" d=""/><path id="rfT" d=""/><circle id="rfHd" r="5.6" cx="50" cy="25"/><path id="rfN" class="rfn" d=""/><path id="rfA" d=""/><path class="rfloor" d="M26 97.6H74"/></svg>
  <svg class="rhz" viewBox="0 0 200 60" fill="none" stroke-linecap="round" aria-hidden="true"><path d="M8 50C40 34 64 40 92 30C118 21 146 26 192 14"/><circle cx="158" cy="14" r="6"/></svg></div>
 <div class="rtxt"><div class="rph" id="rPh"></div><div class="rsub" id="rSub"></div><div class="rname" id="rN"></div></div>
 <div class="rctl"><button class="zb" id="rPa" aria-label="Pause">${ic('pause',2)}</button><button class="zb" id="rSk" aria-label="Next step">${ic('skip',2)}</button></div>`;
 document.body.classList.add('rston');$('#rX').onclick=closeReset;$('#rPa').onclick=()=>{RS.paused=!RS.paused;$('#rPa').innerHTML=ic(RS.paused?'play':'pause',2);$('#rPa').setAttribute('aria-label',RS.paused?'Resume':'Pause');el.classList.toggle('paused',RS.paused)};
 $('#rSnd').onclick=()=>{const on=S.settings.resetSound===false;S.settings.resetSound=on;save();const b=$('#rSnd');b.classList.toggle('off',!on);b.setAttribute('aria-label',on?'Mute tones':'Turn tones on');if(on)RSND.step()};
 $('#rSk').onclick=()=>resetNext();wakeOn();use('reset');resetEnter();cancelAnimationFrame(window._rraf);window._rraf=requestAnimationFrame(resetLoop)}
function resetEnter(){const el=$('#rst');if(!el||!RS)return;const s=RS.steps[RS.i];RS.t=0;RS.bph='';el.dataset.k=s.k;delete el.dataset.ph;$$('#rst .rdots i').forEach((d,k)=>{d.classList.toggle('d',k<RS.i);d.classList.toggle('n',k===RS.i)});
 const N=$('#rN'),Sb=$('#rSub'),P=$('#rPh');el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap');
 const nS=RS.steps.filter(x=>x.k==='stretch'),si=nS.indexOf(s);
 if(s.k==='breath'){const B=RBREATH[s.id];N.textContent=`Breathing · ${B.n}`;Sb.textContent=B.d}
 else if(s.k==='stretch'){const T=RSTRETCH[s.id];N.textContent=`Stretch ${si+1} of ${nS.length}`;Sb.textContent=T.k[0][2];P.textContent=T.n}
 else if(s.k==='calm'){N.textContent=RCALM.n;Sb.textContent=RCALM.d}
 else if(s.k==='eyes'){N.textContent='Eyes';Sb.textContent=REYES.d;P.textContent=REYES.n}
 if(s.k==='done')resetDone();else if(RS.i>0)RSND.step()}
function resetNext(){if(!RS)return;const s=RS.steps[RS.i];if(s.k==='eyes'&&RS.t>=stepSecs(s)-.05)RSND.look();if(RS.i<RS.steps.length-1){RS.i++;resetEnter()}}
/* breathing phases for a pattern at time t: label, seconds left, circle size and the phase id */
function rBreathAt(ph,t){const cyc=ph.reduce((a,p)=>a+p[2],0),tc=t%cyc,n=Math.floor(t/cyc);let acc=0,prev=ph[ph.length-1][3];for(const [id,label,len,to] of ph){if(tc<acc+len)return{id,label,left:Math.ceil(acc+len-tc),orb:lerp(prev,to,ease((tc-acc)/len)),key:n+id+acc};acc+=len;prev=to}return{id:'out',label:'',left:0,orb:.6,key:''}}
/* one animation loop: the circle breathes, the figure moves, the words follow; only attributes and transforms change */
function resetLoop(now){if(!RS)return;const el=$('#rst');if(!el){RS=null;return}const dt=Math.min(.1,(now-RS.last)/1000);RS.last=now;const s=RS.steps[RS.i];if(!RS.paused&&s.k!=='done')RS.t+=dt;
 const total=stepSecs(s),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let target={...RB},orb=.72;const Ph=$('#rPh');
 if(s.k==='breath'||s.k==='calm'){const b=rBreathAt(s.k==='calm'?RCALM.ph:RBREATH[s.id].ph,RS.t);orb=b.orb;if(Ph.textContent!==b.label)Ph.textContent=b.label;Ph.dataset.n=b.left;el.dataset.ph=b.id;
  if(b.key!==RS.bph){if(RS.bph&&!RS.paused&&(b.id==='in'||b.id==='out'))RSND[b.id]();RS.bph=b.key}
  const q=(orb-.6)/.4;target={...RB,shrug:q*1.8,la:-9-q*5,ra:9+q*5,head:-q*2,o:orb}}
 else if(s.k==='stretch'){const T=RSTRETCH[s.id],tc=RS.t%T.loop,K=T.k;let a=K[K.length-1],bk=null;for(let j=0;j<K.length;j++){if(K[j][0]<=tc)a=K[j];else{bk=K[j];break}}const nx=bk||[T.loop,K[0][1]];const f=nx[0]>a[0]?ease((tc-a[0])/(nx[0]-a[0])):1;
  const pa={...RB,...a[1]},pb={...RB,...nx[1]};for(const key in RB)target[key]=lerp(pa[key],pb[key],f);const cue=[...K].reverse().find(x=>x[0]<=tc&&x[2]);if(cue&&$('#rSub').textContent!==cue[2])$('#rSub').textContent=cue[2];Ph.dataset.n=Math.max(0,Math.ceil(total-RS.t));orb=target.o}
 else if(s.k==='eyes'){target={...RB};Ph.dataset.n=Math.max(0,Math.ceil(total-RS.t));orb=.74}
 /* the figure eases toward its target every frame; angles take the short way round, so circles stay smooth */
 const k=reduce?1:1-Math.exp(-dt*6.5);for(const key in RB){const d=RANG.includes(key)?((target[key]-RS.pose[key])%360+540)%360-180:target[key]-RS.pose[key];RS.pose[key]+=d*k}const P=rigPaths(RS.pose);
 $('#rfT').setAttribute('d',P.torso);$('#rfA').setAttribute('d',P.arms);$('#rfL').setAttribute('d',P.legs);$('#rfAf').setAttribute('d',P.armF);$('#rfLf').setAttribute('d',P.legF);$('#rfN').setAttribute('d',P.nose);
 $('#rfHd').setAttribute('cx',P.head[0].toFixed(2));$('#rfHd').setAttribute('cy',P.head[1].toFixed(2));$('#rfF').style.opacity=(1-.55*P.far).toFixed(3);
 const O=$('#rO');O.style.transform=`scale(${(reduce?.8:orb).toFixed(4)})`;const pr=$('#rP');if(pr&&total)pr.style.strokeDashoffset=(1-Math.min(1,RS.t/total)).toFixed(4);
 if(total&&RS.t>=total&&!RS.paused)resetNext();window._rraf=requestAnimationFrame(resetLoop)}
function resetDone(){const el=$('#rst');if(!el||!RS)return;const secs=Math.round((Date.now()-RS.t0)/1000),r=S.focus.run,tips=[...RTIPS].sort(()=>Math.random()-.5).slice(0,2);
 (S.resets=S.resets||[]).push({at:Date.now(),secs,steps:RS.steps.filter(x=>x.id).map(x=>x.id)});if(S.resets.length>500)S.resets=S.resets.slice(-400);led('break','Guided reset',{sub:`${Math.max(1,Math.round(secs/60))} min · ${RS.steps.filter(x=>x.id).map(x=>(RBREATH[x.id]||RSTRETCH[x.id]).n.toLowerCase()).join(', ')}`});save();
 el.dataset.k='done';delete el.dataset.ph;$('#rN').textContent=`${Math.max(1,Math.round(secs/60))} min well spent`;$('#rPh').textContent='You are reset.';delete $('#rPh').dataset.n;$('#rSub').innerHTML=`${tips.map(t=>`<span>${esc(t)}</span>`).join('')}`;
 el.querySelector('.rctl').innerHTML=`<button class="rbtn" id="rBk">${r?`${ic('focus',2)} Back to the timer${r.phase!=='work'?` · ${mmss(leftMs(r))} left`:''}`:`${ic('check',2)} Done`}</button>`;$('#rBk').onclick=closeReset;
 $$('#rst .rdots i').forEach(d=>d.classList.add('d'));RS.steps[RS.i]={k:'done'};setTimeout(()=>RS||$("#rst")?RSND.done():0,650);burstSoft()}
function burstSoft(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const o=$('#rO');if(o){o.classList.add('bloom');setTimeout(()=>o&&o.classList.remove('bloom'),1200)}}
function closeReset(){cancelAnimationFrame(window._rraf);const el=$('#rst');RS=null;document.body.classList.remove('rston');if(el){el.classList.add('out');setTimeout(()=>el.remove(),380)}if(!S.focus.zen)wakeOff();if(route.k==='focus')render()}
/* a quiet invitation whenever a break is on: on the Focus page and as a small pill in Deep mode */
function resetCard(){const r=S.focus.run;if(!r||r.phase==='work')return'';return`<button class="card rcta" onclick="openReset('focus')"><span class="rcfig">${figure('rest',{acc:'var(--break)',sw:2.6})}</span><div class="grow"><div class="lab" style="--lc:var(--break)">${ic('coffee',2)}<span>Guided reset · ${r.phase==='long'?3:2} min</span></div><b>Breathe, stretch, look far away</b><div class="sub sm">A fresh mix each break. Gets your focus back.</div></div>${ic('arrow')}</button>`}
function zenResetPill(r){const z=$('#zen');if(!z)return;let p=$('#zRs');const show=r&&r.phase!=='work'&&!z.classList.contains('done')&&window._zrsOff!==r.round+r.phase;
 if(show&&!p){p=document.createElement('button');p.id='zRs';p.className='zrs';p.innerHTML=`${ic('coffee',2)}<span>Guided reset</span><i aria-hidden="true">${ic('chevr',2)}</i>`;p.onclick=e=>{e.stopPropagation();openReset('zen')};z.appendChild(p);requestAnimationFrame(()=>p.classList.add('in'))}
 else if(!show&&p){p.classList.remove('in');setTimeout(()=>p&&p.remove(),400)}}
