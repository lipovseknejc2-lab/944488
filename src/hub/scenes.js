/* ============ ILLUSTRATIONS: the welcome tour and the builder plaque ============
   Drawn like Atelier's characters: one ink line, one clay accent, no faces, open strokes. Each scene moves a little
   (bricks settle, code types itself, messages pop, a QR code travels), and holds still when motion is reduced. */
const SK='class="sk"',SA='class="sa"';
const fgr=(p)=>`<g class="fg">${p.map(d=>{if(d[0]==='O'){const [x,y,r]=d.slice(1).split(' ');return`<circle cx="${x}" cy="${y}" r="${r}"/>`}return`<path d="${d}"/>`}).join('')}</g>`;
const brick=(x,y,w,label,sub,col,cls='')=>`<g class="brk ${cls}" transform="translate(${x} ${y})"><rect width="${w}" height="44" rx="11" class="bk"/><rect width="${w}" height="4" rx="2" style="fill:${col}"/><circle cx="0" cy="22" r="4" class="bp"/><circle cx="${w}" cy="22" r="4" class="bp"/><text x="14" y="20" class="bt1">${label}</text><text x="14" y="34" class="bkt2">${sub}</text></g>`;
function sceneNodes(){return`<svg viewBox="0 0 520 380" class="scene s-nodes" role="img" aria-label="A builder stacks node blocks like bricks while another fits lines of code together">
 <path d="M24 338H496" class="gnd"/><path d="M40 344h8M70 344h8M100 344h8M380 344h8M410 344h8" class="gnd2"/>
 ${brick(40,290,140,'COMMAND','/hello','var(--accent)')}${brick(52,242,140,'ADD TO VALUE','coins + 10','var(--yellow)')}${brick(40,194,140,'REPLY','Hello {user}!','var(--blue)')}
 <path d="M180 312C204 312 204 264 192 264M192 264C214 264 210 216 180 216" class="wire2"/>
 <g class="lift">${brick(48,112,140,'REACT','coin','var(--green)')}<path d="M118 160V184" class="guide"/></g>
 <path d="M60 188h16M100 188h16M140 188h16" class="snap"/>
 ${fgr(['O226 118 9','M227 128C226 152 224 186 220 226','M220 226L206 282L200 336','M220 226L236 280L246 336','M196 336h10M244 336h12','M226 142L206 128L190 134','M226 150L208 158L190 150'])}
 <g class="code" transform="translate(268 132)"><rect width="168" height="150" rx="14" class="cbk"/><circle cx="16" cy="16" r="3.5" class="cd1"/><circle cx="28" cy="16" r="3.5" class="cd2"/><circle cx="40" cy="16" r="3.5" class="cd3"/>
  <g class="cl l1"><rect x="12" y="34" width="144" height="22" rx="7" class="cln"/><text x="20" y="49" class="ct1"><tspan class="ck">on</tspan>(<tspan class="cs">'command'</tspan>,</text></g>
  <g class="cl l2"><rect x="24" y="62" width="132" height="22" rx="7" class="cln cacc"/><text x="32" y="77" class="ct1">a.reply(<tspan class="cs">'Hello!'</tspan>)</text></g>
  <g class="cl l3"><rect x="12" y="90" width="60" height="22" rx="7" class="cln"/><text x="20" y="105" class="ct1">})</text></g><rect x="78" y="94" width="2" height="14" class="caret"/>
  <text x="12" y="138" class="cnote">HELLO WORLD, ATELIER STYLE</text></g>
 <g class="push"><rect x="452" y="194" width="34" height="22" rx="7" class="cln cacc"/></g>
 <rect x="452" y="300" width="44" height="38" rx="5" class="crate"/><path d="M452 312h44M474 300v38" class="crate2"/>
 ${fgr(['O480 226 9','M479 236C478 258 476 280 474 298','M474 298L452 300L446 336','M474 298L486 316L490 336','M440 336h10M486 336h10','M478 252L462 236L456 206','M478 260L464 250L454 214'])}
 <text x="40" y="372" class="lbl">NODES</text><text x="268" y="372" class="lbl">OR CODE</text></svg>`}
function sceneBench(){return`<svg viewBox="0 0 520 380" class="scene s-bench" role="img" aria-label="A builder presses Next day on a test bench while a pretend group chats and earns coins">
 <path d="M24 338H496" class="gnd"/>
 <circle cx="428" cy="70" r="28" class="clk"/><path d="M428 70V52" class="hand1"/><path d="M428 70L442 76" class="hand2"/><circle cx="428" cy="70" r="2.5" class="cdot"/><text x="404" y="118" class="lbl">DAY 2</text>
 <rect x="70" y="250" width="360" height="12" rx="4" class="sbench"/><path d="M90 262L80 338M410 262L420 338M110 262V300H390V262" class="bleg"/>
 <rect x="112" y="98" width="200" height="140" rx="16" class="scr"/><path d="M200 238V250M180 250h40" class="stand"/>
 <text x="126" y="120" class="sch"># general</text>
 <g class="msgp m1"><rect x="126" y="130" width="96" height="22" rx="10" class="bub1"/><text x="136" y="145" class="bt3">morning team</text></g>
 <g class="msgp m2"><rect x="186" y="158" width="112" height="22" rx="10" class="bub2"/><text x="196" y="173" class="bt3 cmd">/coins</text></g>
 <g class="msgp m3"><rect x="126" y="186" width="130" height="40" rx="11" class="bub3"/><rect x="126" y="186" width="4" height="40" rx="2" class="pstrip"/><text x="138" y="201" class="bt4">COINS · PLUGIN</text><text x="138" y="219" class="bt5">10 coins</text></g>
 <g class="coin c1"><circle cx="268" cy="214" r="9" class="cn"/><path d="M268 209v10" class="cnl"/></g><g class="coin c2"><circle cx="286" cy="206" r="7" class="cn"/><path d="M286 202v8" class="cnl"/></g>
 <g transform="translate(330 222)"><rect width="88" height="26" rx="8" class="pan"/><rect x="8" y="7" width="20" height="12" rx="4" class="kb"/><rect x="34" y="7" width="20" height="12" rx="4" class="kb"/><rect x="60" y="7" width="20" height="12" rx="4" class="kb press"/></g>
 ${fgr(['O462 146 9','M461 156C460 184 458 212 456 244','M456 244L446 290L440 336','M456 244L470 290L478 336','M432 336h10M476 336h10','M460 172L432 196L404 232','M460 180L470 210L466 236'])}
 <text x="70" y="372" class="lbl">TEST BENCH</text><text x="330" y="212" class="lbl sm">JOIN  REACT  DAY</text></svg>`}
function scenePhone(){const q=[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[5,1],[4,2],[3,4],[5,4],[0,4],[1,5],[4,5],[2,3]];
 return`<svg viewBox="0 0 520 380" class="scene s-phone" role="img" aria-label="A laptop shows a QR code and a phone held by a builder scans it into a group">
 <path d="M24 338H496" class="gnd"/>
 <rect x="40" y="110" width="210" height="136" rx="12" class="scr"/><path d="M24 260h242l-12-14H36z" class="base"/>
 <rect x="56" y="134" width="64" height="26" rx="7" class="mn"/><rect x="56" y="186" width="64" height="26" rx="7" class="mn"/><path d="M120 147C140 147 136 199 120 199" class="wire2"/><text x="64" y="151" class="bt6">COMMAND</text><text x="64" y="203" class="bt6">WIDGET</text>
 <g transform="translate(160 136)" class="qr"><rect width="72" height="72" rx="8" class="qrb"/>${q.map(([x,y])=>`<rect x="${8+x*9.5}" y="${8+y*9.5}" width="8" height="8" rx="1.5" class="qrd"/>`).join('')}</g>
 <path d="M236 172C292 150 322 150 372 170" class="beam"/><circle r="4" class="pkt"><animateMotion dur="2.2s" repeatCount="indefinite" path="M236 172C292 150 322 150 372 170"/></circle>
 <rect x="364" y="116" width="84" height="164" rx="16" class="phone"/><rect x="372" y="128" width="68" height="140" rx="10" class="pscr"/><rect x="396" y="120" width="20" height="4" rx="2" class="notch"/>
 <rect x="378" y="136" width="56" height="14" rx="6" class="chpl"/><text x="384" y="146" class="bt7"># general</text>
 <g class="msgp m1"><rect x="378" y="158" width="56" height="44" rx="9" class="bub3"/><rect x="378" y="158" width="3" height="44" rx="1.5" class="pstrip"/><text x="385" y="171" class="bt8">COINS</text><text x="385" y="190" class="bt9">10</text></g>
 <g class="msgp m2"><rect x="384" y="208" width="18" height="12" rx="5" class="rxc"/><rect x="406" y="208" width="18" height="12" rx="5" class="rxc"/></g>
 <g class="msgp m3"><circle cx="384" cy="238" r="6" class="av1"/><circle cx="398" cy="238" r="6" class="av2"/><circle cx="412" cy="238" r="6" class="av3"/></g>
 <rect x="372" y="140" width="68" height="2" class="scan"/>
 ${fgr(['O488 140 9','M487 150C486 180 484 212 482 244','M482 244L470 290L464 336','M482 244L496 290L500 336','M456 336h10M496 336h10','M486 168L466 184L448 198','M486 176L470 214L448 236'])}
 <text x="40" y="372" class="lbl">COMPUTER</text><text x="364" y="372" class="lbl">PHONE</text></svg>`}
const TOUR=[[sceneNodes,'Nodes or code','Stack blocks like bricks and the code writes itself. Or write it yourself, line by line.'],[sceneBench,'A test bench','A pretend group with members, channels and a clock. Press Next day and watch the coins come in.'],[scenePhone,'Straight to your phone','Show a QR code, scan it in Atelier, and the plugin is in your group.']];
function tourHtml(){return`<div class="tour" id="tour" aria-roledescription="carousel" aria-label="What Atelier Plugins does"><div class="tslides" id="tS" tabindex="0">${TOUR.map(([f,h,p],i)=>`<section class="tslide" aria-roledescription="slide" aria-label="${i+1} of ${TOUR.length}: ${h}"><div class="tart">${f()}</div><div class="tcap"><span class="tag">0${i+1} / 0${TOUR.length}</span><h2>${h}</h2><p>${p}</p></div></section>`).join('')}</div>
 <div class="tnav"><button type="button" class="icon-btn" id="tP" aria-label="Previous">${ic('back',2)}</button><div class="tdots">${TOUR.map((_,i)=>`<button type="button" data-i="${i}" aria-label="Show ${i+1}" class="${i?'':'on'}"><i></i></button>`).join('')}</div><button type="button" class="icon-btn tnext" id="tN" aria-label="Next">${ic('back',2)}</button></div></div>`}
function bindTour(){const S=$('#tS');if(!S)return;let idx=0,hold=0,tm=0;const n=TOUR.length;
 const show=i=>{idx=(i+n)%n;S.scrollTo({left:idx*S.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
 const mark=()=>{const i=Math.round(S.scrollLeft/Math.max(1,S.clientWidth));idx=i;$$('.tdots button').forEach((b,k)=>b.classList.toggle('on',k===i));$$('.tslide').forEach((s,k)=>s.classList.toggle('on',k===i))};
 S.addEventListener('scroll',()=>{clearTimeout(S._t);S._t=setTimeout(mark,60)},{passive:true});mark();
 const user=()=>{hold=Date.now()};$('#tP').onclick=()=>{user();show(idx-1)};$('#tN').onclick=()=>{user();show(idx+1)};$$('.tdots button').forEach(b=>b.onclick=()=>{user();show(+b.dataset.i)});
 S.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){user();show(idx+1)}if(e.key==='ArrowLeft'){user();show(idx-1)}});S.addEventListener('pointerdown',user);S.addEventListener('wheel',user,{passive:true});
 const T=$('#tour');let over=false;T.onmouseenter=()=>over=true;T.onmouseleave=()=>over=false;
 tm=setInterval(()=>{if(!document.body.contains(S))return clearInterval(tm);if(over||Date.now()-hold<12000||H.set?.tourAuto===false)return;show(idx+1)},6500)}
/* the plaque: a builder holds up their license */
function plaqueScene(no){return`<svg viewBox="0 0 360 300" class="scene s-plaque" role="img" aria-label="A builder holds up a plaque that says Builder">
 <path d="M30 282H330" class="gnd"/><g class="spark s1"><path d="M70 70v12M64 76h12"/></g><g class="spark s2"><path d="M296 52v10M291 57h10"/></g><g class="spark s3"><path d="M300 150v8M296 154h8"/></g>
 <g class="raise"><rect x="104" y="40" width="152" height="96" rx="14" class="plq"/><rect x="112" y="48" width="136" height="80" rx="9" class="plq2"/>
  <g transform="translate(120 58) scale(.55)"><path d="${MARK_A}" class="pa"/><path d="M12.6 34.2C18 31.8 22.6 31.2 26 31.2C31.8 31.2 37.4 32.6 42.2 30.4C44 29.6 45.4 27.4 45.6 24.8" class="ppb"/><rect x="41.4" y="16.6" width="8.4" height="8" rx="2.2" class="pp"/><path d="M43.6 16.6V13.2M47.6 16.6V13.2" class="ppb"/></g>
  <text x="156" y="80" class="pt1">BUILDER</text><text x="156" y="96" class="pt2">ATELIER PLUGINS</text><text x="124" y="118" class="pt3">${esc(no||'')}</text>
  ${fgr(['M150 136L146 160','M210 136L214 160'])}</g>
 ${fgr(['O180 152 10','M180 164C180 190 179 214 178 236','M178 236L164 262L160 282','M178 236L192 262L198 282','M152 282h10M196 282h10','M180 178L160 170L148 158','M180 178L200 170L212 158'])}</svg>`}
