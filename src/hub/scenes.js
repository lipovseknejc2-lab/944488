/* ============ ILLUSTRATIONS: the welcome tour, the license claim and the thumbs-up ============
   The tour scenes are objects only, no people: blocks, a code editor, a test group, a laptop and a phone. Every scene
   runs on one 9-second timeline (KF below writes the keyframes), so things arrive in order, never on top of each
   other, settle with a small overshoot and leave together. With calm motion or reduced motion they hold still, and
   anything marked "alt" (a later phase) stays hidden so nothing overlaps. */
const SL=9,pc=t=>(Math.max(0,Math.min(SL,t))/SL*100).toFixed(2)+'%',EXIT=8.1;
const EIN='cubic-bezier(.34,1.45,.5,1)',ESM='cubic-bezier(.2,.8,.2,1)';
const KF={css:[],n:0,
 rule(sel,name,ease){this.css.push(`${sel}{animation:${name} ${SL}s ${ease||ESM} infinite both}`)},
 show(sel,t0,o={}){const n='sk'+(++this.n),d=o.d||.5,t1=o.t1??EXIT,F=o.from||'translateY(14px)';
  this.css.push(`@keyframes ${n}{0%,${pc(t0)}{opacity:0;transform:${F};animation-timing-function:${o.ease||EIN}}${pc(t0+d)}{opacity:1;transform:none;animation-timing-function:${ESM}}${pc(t1)}{opacity:1;transform:none}${pc(t1+.35)},100%{opacity:0;transform:none}}`);this.rule(sel,n,'linear');return this},
 type(sel,t0,d,steps=14){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t0)}{transform:scaleX(0);animation-timing-function:steps(${steps},end)}${pc(t0+d)},${pc(EXIT+.35)}{transform:scaleX(1)}100%{transform:scaleX(0)}}`);this.rule(sel,n,'linear');return this},
 draw(sel,t0,d=.45){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t0)}{stroke-dashoffset:1;opacity:1}${pc(t0+d)},${pc(EXIT)}{stroke-dashoffset:0;opacity:1}${pc(EXIT+.35)},100%{stroke-dashoffset:0;opacity:0}}`);this.rule(sel,n,ESM);return this},
 press(sel,t){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t)}{transform:none;filter:none}${pc(t+.08)}{transform:scale(.93);filter:brightness(1.25)}${pc(t+.3)}{transform:none;filter:brightness(1.1)}${pc(t+.9)},100%{transform:none;filter:none}}`);this.rule(sel,n,ESM);return this},
 glow(sel,t0,t1){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t0)}{opacity:0}${pc(t0+.15)},${pc(t1)}{opacity:1}${pc(t1+.5)},100%{opacity:0}}`);this.rule(sel,n,ESM);return this},
 move(sel,t0,d,to){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t0)}{transform:none;opacity:0}${pc(t0+.08)}{opacity:1}${pc(t0+d-.08)}{opacity:1}${pc(t0+d)}{transform:${to};opacity:0}100%{transform:${to};opacity:0}}`);this.rule(sel,n,'cubic-bezier(.45,0,.55,1)');return this},
 grow(sel,t0,d){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t0)}{transform:scaleX(0)}${pc(t0+d)},${pc(EXIT)}{transform:scaleX(1)}${pc(EXIT+.35)},100%{transform:scaleX(1);opacity:0}}`);this.rule(sel,n,'cubic-bezier(.4,0,.2,1)');return this},
 spin(sel,t0,d,deg){const n='sk'+(++this.n);this.css.push(`@keyframes ${n}{0%,${pc(t0)}{transform:rotate(0)}${pc(t0+d)},100%{transform:rotate(${deg}deg)}}`);this.rule(sel,n,'cubic-bezier(.6,0,.3,1)');return this}};
/* scene 1: blocks drop into place, and the same plugin types itself out as code */
KF.show('.s-nodes .b1',.3).show('.s-nodes .b2',1.9).show('.s-nodes .b3',3.3).draw('.s-nodes .w1',2.35).draw('.s-nodes .w2',3.75)
 .glow('.s-nodes .h1',.8,1.9).glow('.s-nodes .h2',2.5,3.3).glow('.s-nodes .h3',3.9,4.9)
 .type('.s-nodes .y1',.8,.6,22).type('.s-nodes .y2',1.4,.3,8).type('.s-nodes .y3',2.5,.7,20).type('.s-nodes .y4',3.9,.7,19).type('.s-nodes .y5',4.6,.2,2)
 .press('.s-nodes .run',5.1).show('.s-nodes .out',5.4,{from:'translateY(10px) scale(.96)'}).show('.s-nodes .oc',5.95,{from:'scale(.6)',d:.45}).show('.s-nodes .ol',.1,{d:.6,from:'none'});
/* scene 2: the test bench, a pretend group and its controls */
KF.press('.s-bench .k1',.5).show('.s-bench .m1',.8,{from:'scale(.9)'}).show('.s-bench .m2',1.2).show('.s-bench .m3',2.4,{from:'translateX(14px)'}).show('.s-bench .m4',2.9)
 .press('.s-bench .k2',4.1).show('.s-bench .m5',4.4,{from:'scale(.4)',d:.45}).press('.s-bench .k3',5.4).spin('.s-bench .hm',5.4,.8,720).spin('.s-bench .hh',5.4,.8,360)
 .show('.s-bench .d1',0,{t1:5.7,d:.01,from:'none'}).show('.s-bench .d2',5.75,{from:'translateY(8px)'}).show('.s-bench .m6',6.2).show('.s-bench .m6c',6.45,{from:'scale(.4) rotate(-40deg)',d:.5});
/* scene 3: send, a QR code in two parts, packets across, the phone scans, adds, and shows the group */
KF.press('.s-phone .snd',.4).show('.s-phone .qr',.75,{from:'scale(.85)'}).show('.s-phone .qa',.75,{t1:2.0,d:.2,from:'none'}).show('.s-phone .qb',2.15,{t1:3.3,d:.2,from:'none'})
 .show('.s-phone .qc',3.45,{d:.2,from:'none'}).show('.s-phone .pa3',3.45,{d:.2,from:'none'}).show('.s-phone .pa1',.75,{t1:2.0,d:.2,from:'none'}).show('.s-phone .pa2',2.15,{t1:3.3,d:.2,from:'none'}).show('.s-phone .beam',.9,{t1:3.4,d:.3,from:'none'})
 .move('.s-phone .k1',1.05,.7,'translateX(62px)').move('.s-phone .k2',1.55,.7,'translateX(62px)').move('.s-phone .k3',2.25,.7,'translateX(62px)').move('.s-phone .k4',2.75,.7,'translateX(62px)')
 .show('.s-phone .sc',.6,{t1:3.4,d:.3,from:'scale(.92)'}).grow('.s-phone .pg',1.1,2.3).show('.s-phone .ok',3.75,{t1:4.55,from:'scale(.5)',d:.45})
 .show('.s-phone .g1',4.8,{from:'translateY(-8px)'}).show('.s-phone .g2',5.1).show('.s-phone .g3',5.5,{from:'scale(.5)',d:.45}).show('.s-phone .g4',5.85,{from:'translateX(10px)'}).show('.s-phone .g5',6.25,{from:'translateX(-10px)'});
(()=>{try{const st=document.createElement('style');st.id='scnK';st.textContent=KF.css.join('\n')+`\n.calm .scene *,.scene.still *{animation:none!important}\n@media (prefers-reduced-motion:reduce){.scene *{animation:none!important}}`;document.head.appendChild(st)}catch(e){}})();
const brk=(x,y,cls,col,cat,txt,top)=>`<g class="${cls}"><rect x="${x}" y="${y+5}" width="196" height="48" rx="12" class="bsh"/><rect x="${x}" y="${y}" width="196" height="48" rx="12" class="bk2"/><rect x="${x}" y="${y}" width="7" height="48" rx="3.5" style="fill:${col}"/>
 <text x="${x+20}" y="${y+19}" class="bcat">${cat}</text><text x="${x+20}" y="${y+36}" class="btx">${txt}</text>${top?`<circle cx="${x+98}" cy="${y}" r="4.5" class="bport"/>`:''}<circle cx="${x+98}" cy="${y+48}" r="4.5" class="bport"/></g>`;
const cl=(n,y,num,html,hl)=>`<rect x="330" y="${y-12}" width="162" height="18" rx="5" class="hl ${hl||''}"/><text x="338" y="${y}" class="cn2">${num}</text><clipPath id="cp${n}"><rect x="352" y="${y-13}" width="138" height="20" class="ty y${n}"/></clipPath><text x="352" y="${y}" class="ctx" clip-path="url(#cp${n})">${html}</text>`;
function sceneNodes(){return`<svg viewBox="0 0 520 380" class="scene s-nodes" role="img" aria-label="Three blocks drop into place on a canvas while the same plugin types itself out as code">
 <defs><pattern id="dg" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="dgd"/></pattern></defs>
 <rect x="20" y="36" width="284" height="300" rx="18" class="pnl"/><rect x="21" y="70" width="282" height="265" fill="url(#dg)" class="dgf"/><path d="M20 70H304" class="pnll"/><text x="38" y="58" class="plb">CANVAS</text><text x="286" y="58" class="plb r">NODES</text>
 <path d="M150 134V166" pathLength="1" class="wire3 w1"/><path d="M150 214V246" pathLength="1" class="wire3 w2"/>
 ${brk(52,86,'b1','var(--accent)','STARTER','Command /hello',false)}${brk(52,166,'b2','var(--yellow)','DATA','Add 10 coins',true)}${brk(52,246,'b3','var(--blue)','ACTION','Reply Hello {user}!',true)}
 <rect x="316" y="36" width="184" height="300" rx="18" class="pnl"/><path d="M316 70H500" class="pnll"/><circle cx="336" cy="53" r="4" class="dd1"/><circle cx="349" cy="53" r="4" class="dd2"/><circle cx="362" cy="53" r="4" class="dd3"/><text x="376" y="57" class="plb">plugin.js</text>
 <g class="run"><rect x="452" y="44" width="36" height="18" rx="9" class="runb"/><text x="470" y="57" class="runt">RUN</text></g>
 ${cl(1,96,1,`on(<tspan class="cs2">'command'</tspan>, <tspan class="cs2">'hello'</tspan>,`,'h1')}${cl(2,118,2,`&#160;&#160;a =&gt; {`,'h1')}${cl(3,140,3,`&#160;&#160;a.<tspan class="ck2">add</tspan>(<tspan class="cs2">'coins'</tspan>, 10)`,'h2')}${cl(4,162,4,`&#160;&#160;a.<tspan class="ck2">reply</tspan>(<tspan class="cs2">'Hello!'</tspan>)`,'h3')}${cl(5,184,5,'})','h3')}
 <path d="M330 206H486" class="pnll"/><text x="334" y="226" class="plb">OUTPUT</text>
 <g class="out"><rect x="334" y="236" width="152" height="64" rx="12" class="ocard"/><rect x="334" y="236" width="5" height="64" rx="2.5" class="ostrip"/><text x="350" y="256" class="otl">HELLO PLUGIN</text><text x="350" y="278" class="otx">Hello Nejc!</text></g>
 <g class="oc"><rect x="420" y="290" width="62" height="20" rx="10" class="ochip"/><circle cx="432" cy="300" r="5" class="ocoin"/><text x="442" y="304" class="octx">+10</text></g>
 <text x="162" y="362" class="slbl">NODES</text><text x="408" y="362" class="slbl">OR CODE</text></svg>`}
function sceneBench(){return`<svg viewBox="0 0 520 380" class="scene s-bench" role="img" aria-label="A test group gets a new member, answers a command, takes a reaction and moves to the next day">
 <rect x="20" y="36" width="322" height="300" rx="18" class="pnl"/><path d="M20 72H342" class="pnll"/><text x="40" y="59" class="chn"><tspan class="chh">#</tspan> general</text>
 <circle cx="282" cy="54" r="8" class="av1"/><circle cx="302" cy="54" r="8" class="av2"/><circle cx="322" cy="54" r="8" class="av3"/>
 <g class="m1"><rect x="128" y="84" width="106" height="20" rx="10" class="sys"/><text x="181" y="98" class="syst">Ana joined</text></g>
 <g class="m2"><rect x="36" y="114" width="222" height="46" rx="12" class="wcard v"/><rect x="36" y="114" width="5" height="46" rx="2.5" class="wst v"/><text x="52" y="131" class="wtl">WELCOME</text><text x="52" y="150" class="wtx">Welcome, Ana! Say hi in #general.</text></g>
 <g class="m3"><rect x="250" y="170" width="76" height="24" rx="12" class="mine"/><rect x="262" y="175" width="52" height="14" rx="5" class="cmdb"/><text x="288" y="186" class="cmdx">/coins</text></g>
 <g class="m4"><rect x="36" y="204" width="168" height="60" rx="12" class="wcard y"/><rect x="36" y="204" width="5" height="60" rx="2.5" class="wst y"/><text x="52" y="221" class="wtl">BALANCE</text><text x="52" y="251" class="wbig">10</text><text x="82" y="251" class="wun">coins</text></g>
 <g class="m5"><rect x="40" y="270" width="44" height="20" rx="10" class="rxb"/><path d="M52 274.5l1.7 3.5l3.8.5l-2.8 2.6l.7 3.8l-3.4-1.8l-3.4 1.8l.7-3.8l-2.8-2.6l3.8-.5z" class="rxs2"/><text x="66" y="284" class="rxn">1</text></g>
 <g class="m6"><rect x="36" y="296" width="250" height="30" rx="10" class="wcard g"/><text x="74" y="315" class="wtx">+10 coins for everyone today</text></g><g class="m6c"><circle cx="56" cy="311" r="8" class="ocoin"/><path d="M56 307v8" class="ocl"/></g>
 <rect x="356" y="36" width="144" height="120" rx="18" class="pnl"/><circle cx="428" cy="86" r="30" class="clk2"/><path d="M428 60v4M428 108v4M402 86h4M450 86h4" class="tick"/><path d="M428 86V68" class="hm"/><path d="M428 86L440 92" class="hh"/><circle cx="428" cy="86" r="3" class="cdot2"/>
 <text x="428" y="140" class="day d1">DAY 1</text><text x="428" y="140" class="day d2 alt">DAY 2</text>
 <rect x="356" y="168" width="144" height="168" rx="18" class="pnl"/><text x="372" y="192" class="plb">CONTROLS</text>
 ${[['k1','Someone joins',200],['k2','React',242],['k3','Next day',284]].map(([k,t,y])=>`<g class="${k} kbtn"><rect x="368" y="${y}" width="120" height="34" rx="11" class="kb2"/><circle cx="384" cy="${y+17}" r="4" class="kd"/><text x="396" y="${y+21}" class="kt">${t}</text></g>`).join('')}</svg>`}
const QA=[[0,0],[1,0],[2,0],[4,0],[0,1],[2,1],[5,1],[0,2],[1,2],[2,2],[4,2],[3,3],[1,4],[3,4],[5,4],[0,5],[2,5],[4,5],[5,5]],QB=[[0,0],[1,0],[2,0],[3,1],[0,1],[2,1],[0,2],[1,2],[2,2],[5,2],[4,3],[0,4],[2,4],[3,5],[5,3],[1,5],[4,4],[5,5]];
const qrSet=(L,cls)=>`<g class="${cls}">${L.map(([x,y])=>`<rect x="${180+x*12}" y="${98+y*12}" width="10" height="10" rx="2" class="qrd2"/>`).join('')}</g>`;
function scenePhone(){return`<svg viewBox="0 0 520 380" class="scene s-phone" role="img" aria-label="A laptop shows a plugin as a QR code in two parts, the phone scans it, adds it and shows it working in a group">
 <rect x="24" y="64" width="268" height="172" rx="14" class="lap"/><rect x="34" y="74" width="248" height="152" rx="7" class="lscr"/><path d="M8 236H308L296 252H20Z" class="lbase"/><path d="M134 236h48" class="lnotch"/>
 <rect x="48" y="94" width="94" height="26" rx="7" class="mb1"/><rect x="48" y="94" width="5" height="26" rx="2.5" style="fill:var(--accent)"/><text x="60" y="111" class="mbt">/coins</text>
 <path d="M95 120V140" class="mw"/><rect x="48" y="140" width="94" height="26" rx="7" class="mb1"/><rect x="48" y="140" width="5" height="26" rx="2.5" style="fill:var(--yellow)"/><text x="60" y="157" class="mbt">Balance</text>
 <g class="snd"><rect x="48" y="186" width="94" height="22" rx="11" class="sbtn"/><text x="95" y="201" class="sbt">SEND</text></g>
 <g class="qr"><rect x="170" y="88" width="92" height="92" rx="10" class="qrb2"/>${qrSet(QA,'qa')}${qrSet(QB,'qb alt')}${qrSet(QA,'qc alt')}</g><text x="216" y="204" class="ptx pa1">PART 1 OF 2</text><text x="216" y="204" class="ptx pa2 alt">PART 2 OF 2</text><text x="216" y="204" class="ptx pa3 alt">SENT</text>
 <path d="M300 146H364" class="beam2 beam"/>${[1,2,3,4].map(i=>`<rect x="296" y="142" width="8" height="8" rx="2" class="pk2 k${i} alt"/>`).join('')}
 <rect x="372" y="36" width="124" height="268" rx="24" class="ph"/><rect x="380" y="46" width="108" height="248" rx="17" class="phs"/><rect x="418" y="52" width="32" height="7" rx="3.5" class="phn"/>
 <g class="sc alt"><path d="M402 108v-10h10M466 98h10v10M476 172v10h-10M412 182h-10v-10" class="scb"/><text x="434" y="214" class="phl">SCANNING</text><rect x="396" y="226" width="76" height="5" rx="2.5" class="pgt"/><rect x="396" y="226" width="76" height="5" rx="2.5" class="pgf pg"/></g>
 <g class="ok alt"><circle cx="434" cy="140" r="24" class="okc"/><path d="M423 140l8 8l14-16" class="okp"/><text x="434" y="190" class="phl">ADDED</text></g>
 <g class="g1"><text x="392" y="80" class="chn sm"><tspan class="chh">#</tspan> general</text><circle cx="458" cy="76" r="5" class="av1"/><circle cx="472" cy="76" r="5" class="av2"/></g>
 <g class="g2"><rect x="390" y="92" width="88" height="62" rx="11" class="wcard y"/><rect x="390" y="92" width="4" height="62" rx="2" class="wst y"/><text x="402" y="108" class="wtl sm">COINS</text><text x="402" y="138" class="wbig sm">10</text><text x="426" y="138" class="wun sm">coins</text></g>
 <g class="g3"><rect x="390" y="160" width="36" height="17" rx="8.5" class="rxb"/><path d="M400 163.5l1.4 2.8l3.1.4l-2.3 2.1l.6 3.1l-2.8-1.5l-2.8 1.5l.6-3.1l-2.3-2.1l3.1-.4z" class="rxs2"/><text x="412" y="172" class="rxn sm">2</text></g>
 <g class="g4"><rect x="418" y="190" width="60" height="22" rx="11" class="mine"/><rect x="426" y="195" width="44" height="12" rx="4" class="cmdb"/><text x="448" y="204" class="cmdx sm">/top</text></g>
 <g class="g5"><rect x="390" y="222" width="70" height="22" rx="11" class="sys"/><text x="425" y="237" class="syst">Thanks!</text></g>
 <text x="158" y="292" class="slbl">COMPUTER</text><text x="434" y="330" class="slbl">PHONE</text></svg>`}
const figG=pose=>{const f=FIG[pose]||FIG.wave;return`<g class="fgi">${f.P.map(d=>`<path d="${d}"/>`).join('')}</g><g class="fga">${f.A.map(d=>`<path d="${d}"/>`).join('')}</g>`};
/* the license, before it is claimed: an empty plaque waits, a character reaches for it */
function claimScene(){return`<svg viewBox="0 0 300 220" class="scene s-claim" role="img" aria-label="An empty license plaque waits to be claimed">
 <path d="M18 206H282" class="gnd"/><g class="cfig" transform="translate(16 74) scale(1.34)">${figG('reach')}</g>
 <g class="cplq"><rect x="146" y="44" width="134" height="90" rx="14" class="plqe"/><text x="213" y="84" class="pte">YOUR LICENSE</text><text x="213" y="104" class="pte2">waiting to be claimed</text></g>
 <g class="spark s2"><path d="M262 26v10M257 31h10"/></g></svg>`}
/* the license, claimed: a character gives a thumbs up next to the plaque */
function cheerScene(no,small){return`<svg viewBox="0 0 320 240" class="scene s-cheer ${small?'sm':''}" role="img" aria-label="A builder gives a thumbs up next to the license plaque">
 <path d="M14 226H306" class="gnd"/><g class="spark s1"><path d="M40 40v12M34 46h12"/></g><g class="spark s2"><path d="M300 30v10M295 35h10"/></g><g class="spark s3"><path d="M150 18v8M146 22h8"/></g>
 <g class="cfig chf" transform="translate(-6 66) scale(1.6)">${figG('cheer')}</g>
 <g class="cplq raise"><rect x="156" y="52" width="148" height="98" rx="14" class="plq"/><rect x="164" y="60" width="132" height="82" rx="9" class="plq2"/>
  <g transform="translate(172 70) scale(.5)"><path d="${MARK_A}" class="pa"/><path d="M12.6 34.2C18 31.8 22.6 31.2 26 31.2C31.8 31.2 37.4 32.6 42.2 30.4C44 29.6 45.4 27.4 45.6 24.8" class="ppb"/><rect x="41.4" y="16.6" width="8.4" height="8" rx="2.2" class="pp"/><path d="M43.6 16.6V13.2M47.6 16.6V13.2" class="ppb"/></g>
  <text x="204" y="90" class="pt1">BUILDER</text><text x="204" y="106" class="pt2">ATELIER PLUGINS</text><text x="174" y="130" class="pt3">${esc(no||'')}</text></g></svg>`}
const TOUR=[[sceneNodes,'Nodes or code','Stack blocks like bricks and the code writes itself. Or write it yourself, line by line.'],[sceneBench,'A test bench','A pretend group with members, channels and a clock. Press Next day and watch the coins come in.'],[scenePhone,'Straight to your phone','Show a QR code, scan it in Atelier, and the plugin is in your group.']];
function tourHtml(){return`<div class="tour" id="tour" aria-roledescription="carousel" aria-label="What Atelier Plugins does"><div class="tslides" id="tS" tabindex="0">${TOUR.map(([f,h,p],i)=>`<section class="tslide" aria-roledescription="slide" aria-label="${i+1} of ${TOUR.length}: ${h}"><div class="tart">${f()}</div><div class="tcap"><span class="tag">0${i+1} / 0${TOUR.length}</span><h2>${h}</h2><p>${p}</p></div></section>`).join('')}</div>
 <div class="tnav"><button type="button" class="icon-btn" id="tP" aria-label="Previous">${ic('back',2)}</button><div class="tdots">${TOUR.map((_,i)=>`<button type="button" data-i="${i}" aria-label="Show ${i+1}" class="${i?'':'on'}"><i></i></button>`).join('')}</div><button type="button" class="icon-btn tnext" id="tN" aria-label="Next">${ic('back',2)}</button></div></div>`}
function bindTour(){const S=$('#tS');if(!S)return;let idx=0,hold=0,tm=0;const n=TOUR.length;
 const show=i=>{idx=(i+n)%n;S.scrollTo({left:idx*S.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 const mark=()=>{const i=Math.round(S.scrollLeft/Math.max(1,S.clientWidth));if(i!==S._on){S._on=i;const sl=$$('.tslide')[i],a=sl&&sl.querySelector('.tart');if(a&&TOUR[i])a.innerHTML=TOUR[i][0]()}idx=i;$$('.tdots button').forEach((b,k)=>b.classList.toggle('on',k===i));$$('.tslide').forEach((s,k)=>s.classList.toggle('on',k===i))};
 S.addEventListener('scroll',()=>{clearTimeout(S._t);S._t=setTimeout(mark,60)},{passive:true});mark();
 const user=()=>{hold=Date.now()};$('#tP').onclick=()=>{user();show(idx-1)};$('#tN').onclick=()=>{user();show(idx+1)};$$('.tdots button').forEach(b=>b.onclick=()=>{user();show(+b.dataset.i)});
 S.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){user();show(idx+1)}if(e.key==='ArrowLeft'){user();show(idx-1)}});S.addEventListener('pointerdown',user);S.addEventListener('wheel',user,{passive:true});
 const T=$('#tour');let over=false;T.onmouseenter=()=>over=true;T.onmouseleave=()=>over=false;
 tm=setInterval(()=>{if(!document.body.contains(S))return clearInterval(tm);if(over||Date.now()-hold<12000||H.set?.tourAuto===false)return;show(idx+1)},6500)}
