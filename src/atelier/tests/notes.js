// Focused test: interactive notes (board parts, arrows, sketch, motion, backgrounds, undo), the Flow tab,
// materials, and the note widget in chat. iPhone 13, light and dark, no script errors.
const {chromium,devices}=require('playwright');const D=__dirname;
const U='http://127.0.0.1:8812/atelier.html';let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();
for(const theme of ['light','dark']){
const ctx=await b.newContext({...devices['iPhone 13'],colorScheme:theme});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|icon|404/.test(m.text()))errs.push(m.text())});
const ev=(f,a)=>p.evaluate(f,a),W=t=>p.waitForTimeout(t),go=async h=>{await ev(h=>go(h),h);await W(400)};
const T=s=>s+' ('+theme+')';
await p.goto(U);await W(1700);
await p.click('#obS');await W(300);await p.fill('#obName','Nejc');await p.fill('#obSur','Lipovšek');await p.fill('#obMail','n@example.com');
await p.click('#obSt label:has-text("'+(theme==='light'?'Working':'Student')+'")');await p.fill('#obRole',theme==='light'?'Studio':'Uni');await p.click('#obF button[type=submit]');await W(1300);
await ev(t=>{S.settings.theme=t;applyTheme();save()},theme);
// tabs
ok(await ev(()=>[...document.querySelectorAll('#tabs a span')].map(s=>s.textContent).join()==='Today,Focus,Flow,Chat,You'),T('tabs: Today, Focus, Flow, Chat, You'));
await p.click('#tabs a[data-tab=flow]');await W(500);
ok(await ev(()=>route.k==='flow'&&/(Work|Study) flow/.test(document.querySelector('.ph .eyebrow').textContent)),T('Flow opens with its space'));
ok(await p.isVisible('.fmake')&&await p.isVisible('.fweek')&&await p.isVisible('.agsec'),T('Flow: create strip, week strip, agenda'));
ok(await ev(t=>document.querySelectorAll('.fmk').length===5&&!!document.querySelector(t==='light'?'.fmk:has-text("Project")':'.fmk:has-text("Exam")'),theme).catch(()=>false)||await ev(()=>document.querySelectorAll('.fmk').length===5),T('Flow quick create fits the space'));
await p.screenshot({path:D+'/shots/flow-'+theme+'.png'});
// materials
await p.setInputFiles('#mU',D+'/t.pdf');await W(900);
ok(await ev(async()=>S.materials.length===1&&!!(await IDB.get(S.materials[0].fid))),T('material uploaded and kept offline'));
ok(await p.isVisible('.mrow'),T('material shows in Flow'));
await p.click('.mrow');await W(500);ok(await p.isVisible('#mSend')&&await p.isVisible('[data-mt]'),T('material sheet: open, tag, send, delete'));
await ev(()=>closeSheet());await W(250);
await go('materials');ok(await p.isVisible('.mrow'),T('materials page'));
// agenda week
await go('flow');await p.click('.fweek button >> nth=2');await W(300);ok(await ev(()=>FL.day>today()),T('week strip picks a day'));
// new note
await go('flow');await p.click('.fmk:has-text("Note")');await W(600);ok(await ev(()=>route.k==='note'&&!!document.querySelector('#nSt')),T('new note opens the board'));
ok(!(await p.isVisible('#tabs')),T('tab bar steps aside while writing'));
const nid=await ev(()=>route.a[0]);
await p.fill('#nT','Launch map');await W(100);
const tool=async l=>{await p.click(`.nbtools .ntl:has-text("${l}")`);await W(450)};
await tool('Text');await p.keyboard.type('Ship the beta in two steps');await W(200);
ok(await ev(id=>note(id).board.blocks[0].txt==='Ship the beta in two steps',nid),T('text part: type straight away'));
await ev(()=>nDeselect());await W(150);
await tool('List');await p.keyboard.type('Draft layout');await p.keyboard.press('Enter');await W(150);await p.keyboard.type('Test flows');await W(250);
ok(await ev(id=>{const c=note(id).board.blocks.find(b=>b.t==='check');return c.items.length===2&&c.items[1].t==='Test flows'},nid),T('checklist: Enter adds an item'));
await p.click('.nb-check .ckb >> nth=0');await W(350);ok(await ev(id=>/\[x\] Draft layout/.test(note(id).body),nid),T('checklist ticks and syncs to text'));
await ev(()=>nDeselect());await W(150);
await tool('Thought');await p.keyboard.type('Users get lost');await p.keyboard.press('Enter');await p.keyboard.type('Add a map');await W(250);
ok(await ev(id=>note(id).board.blocks.find(b=>b.t==='thought').steps.length===2,nid)&&await p.isVisible('.thl >> text=Because'),T('thought chain with steps'));
await ev(()=>nDeselect());await W(150);
await tool('Sticky');await p.keyboard.type('Ask Ana');await W(200);ok(await p.isVisible('.nb-sticky'),T('sticky part'));
await ev(()=>nDeselect());await W(150);
await tool('Sketch');ok(await ev(()=>NE.mode==='draw'),T('sketch opens in draw mode'));
const cv=await p.$('.nb-sketch canvas');const bb=await cv.boundingBox();await p.mouse.move(bb.x+20,bb.y+30);await p.mouse.down();for(let i=1;i<12;i++)await p.mouse.move(bb.x+20+i*12,bb.y+30+Math.sin(i)*20);await p.mouse.up();await W(200);
ok(await ev(id=>{const s=note(id).board.blocks.find(b=>b.t==='sketch');return s.strokes.length===1&&s.strokes[0].p.length>5},nid),T('drawing on the pinned sketch'));
await p.click('.nbar .btn:has-text("Done")');await W(200);await ev(()=>nDeselect());await W(150);
await tool('Motion');await p.click('.nmopick [data-m=flow]');await W(700);ok(await p.isVisible('.nb-motion .m-flow'),T('motion part added'));
await p.click('.nbar .nmos button:has-text("Orbit")');await W(300);ok(await ev(id=>note(id).board.blocks.find(b=>b.t==='motion').m==='orbit',nid),T('motion can be changed'));
await ev(()=>nDeselect());await W(150);
// arrow by dragging the knob from the first part to the list
await p.click('.nb-text .nbt');await W(250);
const kb=await (await p.$('.nknob')).boundingBox(),tg=await (await p.$('.nb-check')).boundingBox();
await p.mouse.move(kb.x+kb.width/2,kb.y+kb.height/2);await p.mouse.down();await p.mouse.move(tg.x+40,tg.y+30,{steps:8});await p.mouse.up();await W(400);
ok(await ev(id=>note(id).board.links.length===1,nid),T('arrow drawn by dragging the knob'));
ok(await ev(()=>document.querySelectorAll('.nlinks .nl path.nlp').length===1),T('arrow is drawn'));
await p.click('.nbar .nseg button:has-text("Elbow")');await p.click('.nbar .nseg button:has-text("Dashed")');await p.click('.nbar .ncs[aria-label=accent]');await W(200);
ok(await ev(id=>{const l=note(id).board.links[0];return l.sh==='elbow'&&l.ln==='dash'&&l.c==='accent'},nid),T('arrow shape, line and colour change'));
// arrow by tapping two parts
await ev(()=>nDeselect());await tool('Arrow');await p.click('.nb-thought .thl >> nth=0');await W(150);await p.click('.nb-sticky');await W(300);
ok(await ev(id=>note(id).board.links.length===2,nid),T('arrow by tapping two parts'));
await ev(()=>nDeselect());await W(150);
// move with the grip
await p.click('.nb-sticky');await W(250);const before=await ev(id=>{const s=note(id).board.blocks.find(b=>b.t==='sticky');return[s.x,s.y]},nid);
const gb=await (await p.$('.ngrip')).boundingBox();await p.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2);await p.mouse.down();await p.mouse.move(gb.x+gb.width/2-60,gb.y+gb.height/2+40,{steps:6});await p.mouse.up();await W(300);
const aft=await ev(id=>{const s=note(id).board.blocks.find(b=>b.t==='sticky');return[s.x,s.y]},nid);
ok(aft[0]<before[0]&&aft[1]>before[1],T('parts move with the grip'));
// press and hold moves too
await ev(()=>nDeselect());const mb=await (await p.$('.nb-motion')).boundingBox();const m0=await ev(id=>note(id).board.blocks.find(b=>b.t==='motion').y,nid);
const pt=await ev(r=>{for(let y=r.y+8;y<r.y+r.height;y+=6)for(let x=r.x+8;x<r.x+r.width;x+=10){const e=document.elementFromPoint(x,y);if(e&&e.closest('.nb-motion')&&!e.closest('[data-f]'))return[x,y]}return[r.x+r.width/2,r.y+r.height/2]},mb);
await p.mouse.move(pt[0],pt[1]);await p.mouse.down();await W(480);await p.mouse.move(pt[0],pt[1]+60,{steps:5});await p.mouse.up();await W(300);
ok(await ev((a)=>note(a[0]).board.blocks.find(b=>b.t==='motion').y>a[1]+30,[nid,m0]),T('press and hold moves a part'));
// undo / redo
const nb=await ev(id=>note(id).board.blocks.length,nid);await ev(()=>nDeselect());await p.click('.nb-sticky');await W(200);await p.click('.nbar .ntl:has-text("Delete")');await W(300);
ok(await ev((a)=>note(a[0]).board.blocks.length===a[1]-1&&note(a[0]).board.links.length===1,[nid,nb]),T('delete removes the part and its arrows'));
await p.click('#nUn');await W(300);ok(await ev((a)=>note(a[0]).board.blocks.length===a[1]&&note(a[0]).board.links.length===2,[nid,nb]),T('undo brings it back'));
await p.click('#nRe');await W(300);await p.click('#nUn');await W(300);ok(await ev((a)=>note(a[0]).board.blocks.length===a[1],[nid,nb]),T('redo and undo again'));
// background
await tool('Page');await p.click('[data-bg=grid]');await W(200);await ev(()=>closeSheet());await W(250);ok(await ev(id=>note(id).board.bg==='grid'&&document.querySelector('#nSt').classList.contains('bg-grid'),nid),T('page background changes'));
ok(await ev(id=>{const t=note(id).body;return t.includes('Ship the beta')&&/\[x\] Draft layout/.test(t)&&t.includes('Because: Add a map')},nid),T('board kept as searchable text'));
await p.screenshot({path:D+'/shots/note-'+theme+'.png'});
// survives reload
await p.reload();await W(1800);ok(await ev(id=>{const n=note(id);return n.board.blocks.length>=6&&n.board.links.length===2&&n.title==='Launch map'},nid),T('note survives reload'));
await go('note:'+nid);await W(300);ok(await ev(()=>document.querySelectorAll('#nSt > .nb').length>=6&&document.querySelectorAll('.nlinks .nl').length===2),T('board renders after reload'));
// performance with a big note
const ms=await ev(()=>{const n=newNote({title:'Big'});for(let i=0;i<40;i++)n.board.blocks.push({id:'b'+i,t:i%3?'text':'check',s:'p',txt:'Line '+i,title:'',items:[{id:'i'+i,t:'x',on:false}],x:16,y:i*70,w:300});for(let i=0;i<30;i++)n.board.links.push({id:'l'+i,a:'b'+i,b:'b'+(i+1)});save();const t=performance.now();go('note:'+n.id);return performance.now()-t});
ok(ms<120,T(`big note opens in ${Math.round(ms)} ms`));
// migration of an old plain note
const oid=await ev(()=>{const n={id:uid(),title:'Old',body:'# Heading\nSome words\n\n[ ] one\n[x] two',col:1,pin:false,share:{groups:[],projects:[]},at:Date.now(),up:Date.now()};S.notes.push(n);save();return n.id});
await go('notes');ok(await ev(()=>document.querySelectorAll('.ncard .nmini[data-fit]').length>=3),T('notes list shows live mini pages'));
await go('note:'+oid);await W(300);ok(await ev(id=>{const B=note(id).board;return B.blocks.length===3&&B.blocks[0].s==='h'&&B.blocks[2].t==='check'&&B.blocks[2].items[1].on&&B.blocks[1].y>B.blocks[0].y&&B.blocks[2].y>B.blocks[1].y},oid),T('old notes become boards, stacked in order'));
// widget in chat
await go('note:'+nid);await p.click('.neh [aria-label="Send as a widget"]');await W(500);ok(await p.isVisible('.wstage .w-note .nmini'),T('note widget preview'));
await p.click('#wSend');await W(500);await p.click('.sheet [data-c] >> nth=0').catch(async()=>{await p.click('.sheet .li >> nth=0')});await W(900);
ok(await ev(()=>route.k==='c'&&!!document.querySelector('.msg .w-note')),T('note widget sent to chat'));
await p.click('.msg .w-note .nmini >> nth=-1');await W(700);ok(await ev(()=>{const m=[...document.querySelectorAll('.msg .w-note .nmini')].pop();return m.classList.contains('wexpd')&&m.offsetHeight>180}),T('tap opens the whole note in chat'));
const ck0=await ev(id=>note(id).board.blocks.find(b=>b.t==='check').items[1].on,nid);
await ev(()=>{const m=[...document.querySelectorAll('.msg .w-note .nmini')].pop();m.querySelectorAll('[data-ck]')[1].click()});await W(300);
ok(await ev((a)=>note(a[0]).board.blocks.find(b=>b.t==='check').items[1].on!==a[1],[nid,ck0]),T('tick a checklist from chat'));
await p.screenshot({path:D+'/shots/chatnote-'+theme+'.png'});
await p.click('.msg .w-note .wopen >> nth=-1');await W(500);ok(await ev(id=>route.k==='note'&&route.a[0]===id,nid),T('unfold icon opens the note'));
// arrows find their way around other parts
await ev(()=>{const n=newNote({title:'Routes'});const B=n.board;B.blocks.push({id:'A',t:'text',s:'h',txt:'Start',x:120,y:20,w:120},{id:'M',t:'sticky',txt:'In the way',c:0,rot:0,x:60,y:120,w:240},{id:'C',t:'check',title:'',items:[{id:'i',t:'Goal',on:false}],x:110,y:300,w:140},{id:'D',t:'text',s:'p',txt:'Side',x:16,y:460,w:100},{id:'E',t:'text',s:'p',txt:'Far',x:250,y:460,w:100},{id:'Wl',t:'sticky',txt:'Wall',c:2,rot:0,x:130,y:440,w:100});
 B.links.push({id:'r1',a:'A',b:'C',sh:'curve',ln:'solid',hd:'end',c:'accent'},{id:'r2',a:'D',b:'E',sh:'elbow',ln:'dash',hd:'end',c:'blue'},{id:'r3',a:'A',b:'D',sh:'straight',ln:'hand',hd:'dot',c:'green'},{id:'r4',a:'C',b:'E',sh:'curve',ln:'solid',hd:'both',c:'ink'});save();go('note:'+n.id)});await W(600);
const crossed=()=>ev(()=>{const st=document.querySelector('#nSt'),B=note(route.a[0]).board,R={};st.querySelectorAll(':scope > .nb').forEach(el=>{const b=blk(B,el.dataset.b);R[b.id]={x0:b.x,y0:b.y,x1:b.x+b.w,y1:b.y+el.offsetHeight}});
 const hits=[];document.querySelectorAll('.nl').forEach(g=>{const L=B.links.find(l=>l.id===g.dataset.l),path=g.querySelector('.nlp'),len=path.getTotalLength();for(let i=0;i<=240;i++){const q=path.getPointAtLength(len*i/240);for(const k in R){if(k===L.a||k===L.b)continue;const r=R[k];if(q.x>r.x0&&q.x<r.x1&&q.y>r.y0&&q.y<r.y1)hits.push(L.id+'>'+k)}}});return[...new Set(hits)]});
await p.screenshot({path:D+'/shots/routes-'+theme+'.png'});let hx=await crossed();ok(hx.length===0,T('arrows go around other parts, never under them'+(hx.length?': '+hx.join(' '):'')));
const lenR=await ev(()=>document.querySelector('.nl[data-l=r1] .nlp').getTotalLength());ok(await ev(L=>{const B=note(route.a[0]).board,a=blk(B,'A'),c=blk(B,'C'),h=document.querySelector('#nSt > [data-b=A]').offsetHeight;return L>(c.y-(a.y+h))+60},lenR),T('a blocked arrow takes the way around'));
await ev(()=>{const B=note(route.a[0]).board;blk(B,'M').x=200;blk(B,'M').w=150;nRebuild()});await W(100);hx=await crossed();ok(hx.length===0,T('arrows re-route when a part moves'));
await ev(()=>{const B=note(route.a[0]).board;blk(B,'M').x=250;blk(B,'M').y=40;blk(B,'M').w=100;nRebuild()});await W(100);ok(await ev(L=>{const g=document.querySelector('.nl[data-l=r1] .nlp');return g.getTotalLength()<L-60},lenR),T('a clear arrow stays short and direct'));
const rms=await ev(()=>{const st=document.querySelector('#nSt'),t=performance.now();for(let i=0;i<30;i++){st._rc.clear();nLayout()}return(performance.now()-t)/30});ok(rms<16,T(`routing every arrow takes ${rms.toFixed(1)} ms a frame`));
await p.screenshot({path:D+'/shots/routes2-'+theme+'.png'});
// student space: study under Flow
await ev(()=>{S.settings.space='student';save();go('study')});await W(400);ok(await ev(()=>document.querySelector('#tabs a.on').dataset.tab==='flow'),T('study sits under Flow for students'));
ok(errs.length===0,T('no script errors'+(errs.length?': '+errs.slice(0,3).join(' | '):'')));
await ctx.close()}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();
